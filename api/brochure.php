<?php
declare(strict_types=1);

// never print PHP errors to visitors (they are written to the server log instead)
ini_set('display_errors', '0');
ini_set('log_errors', '1');

/**
 * Brochure gate — LedxDigitalAcademy
 *
 * A brochure is NEVER a public file. The PDFs live in /private/brochures (denied to the web).
 * A visitor gets one only by:
 *   1. POST  /api/brochure.php   — JSON { program, name?, country, phone, email, consent, website, elapsed, page }
 *        • validates a real-looking mobile number and a Gmail address (strict, server-side)
 *        • e-mails the lead to LEAD_TO (and keeps a copy in private/leads.csv)
 *        • answers with a short-lived, signed download link
 *   2. GET   /api/brochure.php?t=<signed token>   — streams the PDF if the token is valid and unexpired
 *
 * Nothing is downloadable if the lead cannot be recorded (fail-closed).
 * Needs PHP 8.1+ with only core functions. Works on Hostinger / any Apache or LiteSpeed host.
 */

const LEAD_TO      = 'ledxdigitalacademy@gmail.com'; // every lead is e-mailed here
const PRIVATE_DIR  = null;       // null = ../private (next to /api). Safer: an absolute path ABOVE public_html.
const TOKEN_TTL    = 900;        // download link lifetime in seconds (15 min)
const MIN_FILL_MS  = 2500;       // faster than this = a bot
const IP_LIMIT     = [8, 3600];  // max requests / window (s) per IP
const LEAD_LIMIT   = [3, 86400]; // max requests / window (s) per mobile+Gmail pair
const DEDUPE_MAIL  = 86400;      // don't re-e-mail the same Gmail+program within this many seconds

/* country code => [min digits, max digits] of the national number (kept in sync with js/brochure.js) */
const COUNTRIES = [
    '+91' => [10, 10], '+971' => [9, 9], '+966' => [9, 9], '+974' => [8, 8],
    '+968' => [8, 8],  '+965' => [8, 8], '+1' => [10, 10], '+44' => [10, 10],
];

/* ------------------------------------------------------------------ validation */

function looks_fake_number(string $d): bool
{
    if (count(array_unique(str_split($d))) <= 2) {
        return true; // 9999999999, 9090909090 ...
    }
    $same = $asc = $desc = 1;
    $max = 1;
    for ($i = 1, $n = strlen($d); $i < $n; $i++) {
        $diff = ((int) $d[$i] - (int) $d[$i - 1] + 10) % 10;
        $same = $diff === 0 ? $same + 1 : 1;
        $asc  = $diff === 1 ? $asc + 1 : 1;
        $desc = $diff === 9 ? $desc + 1 : 1;
        $max  = max($max, $same, $asc, $desc);
    }
    return $max >= 7; // 9876543210, 1234567890, 8888888 ...
}

/** Returns the clean national number, or null when it is not a plausible mobile number. */
function normalise_phone(string $country, string $raw): ?string
{
    if (!isset(COUNTRIES[$country])) {
        return null;
    }
    $d = preg_replace('/\D+/', '', $raw) ?? '';
    [$min, $max] = COUNTRIES[$country];
    $cc = substr($country, 1);
    if (strlen($d) > $max && strpos($d, $cc) === 0) {
        $d = substr($d, strlen($cc)); // typed with the country code
    }
    if (strlen($d) > $max && ($d[0] ?? '') === '0') {
        $d = substr($d, 1); // leading trunk 0
    }
    if ($country === '+91') {
        if (!preg_match('/^[6-9][0-9]{9}$/', $d)) {
            return null; // Indian mobiles: 10 digits starting 6-9
        }
    } elseif (strlen($d) < $min || strlen($d) > $max) {
        return null;
    }
    return looks_fake_number($d) ? null : $d;
}

/** Returns the lower-cased Gmail address, or null. Gmail rules: 6-30 letters/digits/dots, no ".." and no leading/trailing dot. */
function normalise_gmail(string $raw): ?string
{
    $e = strtolower(trim($raw));
    if (strlen($e) > 64 || !preg_match('/^([a-z0-9](?:[a-z0-9]|\.(?!\.)){4,28}[a-z0-9])@(?:gmail|googlemail)\.com$/', $e, $m)) {
        return null;
    }
    $local = str_replace('.', '', $m[1]);
    if (count(array_unique(str_split($local))) <= 3) {
        return null; // aaaaaa, ababab ...
    }
    if (preg_match('/^(test|testing|demo|fake|dummy|sample|example|abcd|asdf|qwer|xyz|none|noemail)/', $local)) {
        return null;
    }
    return $e;
}

function clean_name(string $raw): ?string
{
    $n = trim(preg_replace('/\s+/u', ' ', $raw) ?? '');
    if ($n === '') {
        return '';
    }
    return preg_match('/^\p{L}[\p{L} .\'\-]{1,59}$/u', $n) ? $n : null;
}

/* ------------------------------------------------------------------ plumbing */

function respond(int $code, array $body): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail_text(int $code, string $msg): never
{
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo $msg;
    exit;
}

function private_root(): string
{
    return rtrim(PRIVATE_DIR ?? dirname(__DIR__) . '/private', '/\\');
}

function ensure_dir(string $dir): void
{
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('cannot create ' . $dir);
    }
}

function secret(): string
{
    $file = private_root() . '/secret.key';
    if (!is_file($file)) {
        ensure_dir(private_root());
        @file_put_contents($file, bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($file, 0600);
    }
    $key = trim((string) @file_get_contents($file));
    if (strlen($key) < 32) {
        throw new RuntimeException('signing key unavailable');
    }
    return $key;
}

function b64u(string $s): string
{
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function b64u_dec(string $s): string
{
    return (string) base64_decode(strtr($s, '-_', '+/'), true);
}

function make_token(string $slug, ?int $expires = null): string
{
    $payload = b64u(json_encode(['p' => $slug, 'e' => $expires ?? time() + TOKEN_TTL, 'n' => bin2hex(random_bytes(6))]));
    return $payload . '.' . hash_hmac('sha256', $payload, secret());
}

/** @return array{p:string,e:int}|null */
function read_token(string $token): ?array
{
    if (!preg_match('/^[A-Za-z0-9_\-]{10,400}\.[a-f0-9]{64}$/', $token)) {
        return null;
    }
    [$payload, $sig] = explode('.', $token, 2);
    if (!hash_equals(hash_hmac('sha256', $payload, secret()), $sig)) {
        return null;
    }
    $data = json_decode(b64u_dec($payload), true);
    if (!is_array($data) || !isset($data['p'], $data['e']) || !is_string($data['p']) || !is_int($data['e']) || $data['e'] < time()) {
        return null;
    }
    return $data;
}

/** @return array<string,array{title:string,file:string}> */
function brochures(): array
{
    $raw = json_decode((string) @file_get_contents(private_root() . '/brochures/index.json'), true);
    $out = [];
    foreach (is_array($raw) ? $raw : [] as $slug => $b) {
        if (is_string($slug) && preg_match('/^[a-z0-9-]{1,80}$/', $slug)
            && is_array($b) && isset($b['title'], $b['file']) && is_string($b['title']) && is_string($b['file'])
            && preg_match('/^[a-z0-9._-]+\.pdf$/', $b['file']) && is_file(private_root() . '/brochures/' . $b['file'])) {
            $out[$slug] = ['title' => $b['title'], 'file' => $b['file']];
        }
    }
    return $out;
}

/** Sliding-window limiter. Returns true when the request is allowed. */
function rate_allow(string $key, int $max, int $window): bool
{
    $dir = private_root() . '/state';
    ensure_dir($dir);
    $fh = @fopen($dir . '/rl-' . hash('sha256', $key) . '.json', 'c+');
    if (!$fh) {
        throw new RuntimeException('rate limiter unavailable');
    }
    flock($fh, LOCK_EX);
    $hits = json_decode((string) stream_get_contents($fh), true);
    $now = time();
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], static fn ($t) => is_int($t) && $t > $now - $window));
    $ok = count($hits) < $max;
    if ($ok) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $ok;
}

function header_safe(string $s): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', preg_replace('/[^\x20-\x7E]/', '-', $s) ?? '') ?? '');
}

function send_lead_email(array $lead): bool
{
    $mode = getenv('LDA_MAIL_MODE') ?: 'mail'; // 'file' / 'fail' are for local testing only
    if ($mode === 'fail') {
        return false;
    }
    $host = strtolower((string) preg_replace('/[^a-z0-9.\-]/i', '', explode(':', $_SERVER['HTTP_HOST'] ?? 'localhost')[0]));
    $host = preg_replace('/^www\./', '', $host) ?: 'localhost';
    $from = 'noreply@' . $host;
    $subject = 'New brochure download: ' . header_safe($lead['title']) . ' - ' . $lead['phone'];
    $body = "A visitor downloaded a brochure from the website.\r\n\r\n"
        . 'Program : ' . $lead['title'] . "\r\n"
        . 'Name    : ' . ($lead['name'] !== '' ? $lead['name'] : '-') . "\r\n"
        . 'Mobile  : ' . $lead['country'] . ' ' . $lead['phone'] . "\r\n"
        . 'Gmail   : ' . $lead['email'] . "\r\n"
        . 'Page    : ' . $lead['page'] . "\r\n"
        . 'Time    : ' . $lead['time'] . " (IST)\r\n";
    $headers = [
        'From: LDA Website <' . $from . '>',
        'Reply-To: ' . $lead['email'],
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: LDA brochure gate',
    ];
    if ($mode === 'file') {
        $dir = private_root() . '/outbox';
        ensure_dir($dir);
        $eml = 'To: ' . LEAD_TO . "\r\nSubject: " . $subject . "\r\n" . implode("\r\n", $headers) . "\r\n\r\n" . $body;
        return @file_put_contents($dir . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml', $eml, LOCK_EX) !== false;
    }
    return @mail(LEAD_TO, $subject, $body, implode("\r\n", $headers), '-f' . $from);
}

function log_lead(array $lead, string $ipHash): void
{
    $file = private_root() . '/leads.csv';
    $new = !is_file($file);
    $fh = @fopen($file, 'ab');
    if (!$fh) {
        return; // the e-mail is the primary record; the CSV is a backup
    }
    flock($fh, LOCK_EX);
    if ($new) {
        fputcsv($fh, ['time', 'program', 'name', 'country_code', 'mobile', 'gmail', 'page', 'ip_hash'], ',', '"', '\\');
    }
    fputcsv($fh, [$lead['time'], $lead['slug'], $lead['name'], ltrim($lead['country'], '+'), $lead['phone'], $lead['email'], $lead['page'], $ipHash], ',', '"', '\\');
    flock($fh, LOCK_UN);
    fclose($fh);
}

/* ------------------------------------------------------------------ request handlers */

function handle_request(): never
{
    // same-site only
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && strcasecmp((string) parse_url($origin, PHP_URL_HOST) . ((($p = parse_url($origin, PHP_URL_PORT)) !== null) ? ':' . $p : ''), $_SERVER['HTTP_HOST'] ?? '') !== 0) {
        respond(403, ['ok' => false, 'message' => 'Request not allowed.']);
    }
    $len = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($len <= 0 || $len > 4096) {
        respond(400, ['ok' => false, 'message' => 'Invalid request.']);
    }
    $in = json_decode((string) file_get_contents('php://input', false, null, 0, 4097), true);
    if (!is_array($in)) {
        respond(400, ['ok' => false, 'message' => 'Invalid request.']);
    }
    $str = static fn (string $k): string => isset($in[$k]) && is_string($in[$k]) ? $in[$k] : '';

    // bots: honeypot filled, or form submitted impossibly fast
    if ($str('website') !== '' || !isset($in['elapsed']) || !is_int($in['elapsed']) || $in['elapsed'] < MIN_FILL_MS) {
        respond(422, ['ok' => false, 'message' => 'Please check your details and try again.']);
    }

    $all = brochures();
    $slug = $str('program');
    if (!isset($all[$slug])) {
        respond(400, ['ok' => false, 'message' => 'That brochure is not available.']);
    }
    if (($in['consent'] ?? false) !== true) {
        respond(422, ['ok' => false, 'field' => 'consent', 'message' => 'Please tick the box so we can share the brochure with you.']);
    }
    $country = $str('country') ?: '+91';
    $phone = normalise_phone($country, $str('phone'));
    if ($phone === null) {
        respond(422, ['ok' => false, 'field' => 'phone', 'message' => $country === '+91'
            ? 'Please enter a valid 10-digit Indian mobile number (starting 6, 7, 8 or 9).'
            : 'Please enter a valid mobile number for the selected country.']);
    }
    $email = normalise_gmail($str('email'));
    if ($email === null) {
        respond(422, ['ok' => false, 'field' => 'email', 'message' => 'Please enter your real Gmail address (name@gmail.com).']);
    }
    $name = clean_name($str('name'));
    if ($name === null) {
        respond(422, ['ok' => false, 'field' => 'name', 'message' => 'Please use letters only for your name, or leave it blank.']);
    }

    try {
        $ipHash = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . secret()), 0, 16);
        if (!rate_allow('ip:' . ($_SERVER['REMOTE_ADDR'] ?? ''), IP_LIMIT[0], IP_LIMIT[1])
            || !rate_allow('lead:' . $country . $phone . $email, LEAD_LIMIT[0], LEAD_LIMIT[1])) {
            respond(429, ['ok' => false, 'message' => 'Too many requests. Please try again later or WhatsApp us.']);
        }

        $page = $str('page');
        $lead = [
            'slug' => $slug, 'title' => $all[$slug]['title'], 'name' => $name, 'country' => $country, 'phone' => $phone, 'email' => $email,
            'page' => preg_match('#^/[A-Za-z0-9/_\-.]{0,120}$#', $page) ? $page : '-',
            'time' => (new DateTimeImmutable('now', new DateTimeZone('Asia/Kolkata')))->format('Y-m-d H:i:s'),
        ];

        $marker = private_root() . '/state/seen-' . hash('sha256', $email . '|' . $slug);
        $recent = is_file($marker) && filemtime($marker) > time() - DEDUPE_MAIL;
        if (!$recent && !send_lead_email($lead)) {
            respond(503, ['ok' => false, 'message' => 'We could not process your request right now. Please WhatsApp us and we will send the brochure.']);
        }
        @touch($marker);
        log_lead($lead, $ipHash);

        respond(200, ['ok' => true, 'url' => $_SERVER['SCRIPT_NAME'] . '?t=' . rawurlencode(make_token($slug)), 'expires_in' => TOKEN_TTL]);
    } catch (Throwable $e) {
        error_log('brochure gate: ' . $e->getMessage());
        respond(503, ['ok' => false, 'message' => 'We could not process your request right now. Please WhatsApp us and we will send the brochure.']);
    }
}

function handle_download(string $token): never
{
    try {
        $data = read_token($token);
        $all = brochures();
        if ($data === null || !isset($all[$data['p']])) {
            fail_text(403, 'This download link is invalid or has expired. Please request the brochure again from the website.');
        }
        $path = private_root() . '/brochures/' . $all[$data['p']]['file'];
        $size = (int) filesize($path);
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="LDA-' . $data['p'] . '-brochure.pdf"');
        header('Content-Length: ' . $size);
        header('Cache-Control: private, no-store');
        header('X-Content-Type-Options: nosniff');
        header('X-Robots-Tag: noindex');
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        readfile($path);
        exit;
    } catch (Throwable $e) {
        error_log('brochure gate: ' . $e->getMessage());
        fail_text(503, 'Temporarily unavailable. Please try again shortly.');
    }
}

if (!defined('LDA_BROCHURE_NO_RUN')) { // tests include this file for its functions
    date_default_timezone_set('Asia/Kolkata');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'POST') {
        handle_request();
    }
    if ($method === 'GET' && isset($_GET['t']) && is_string($_GET['t'])) {
        handle_download($_GET['t']);
    }
    header('Allow: GET, POST');
    fail_text($method === 'GET' ? 403 : 405, 'Forbidden');
}
