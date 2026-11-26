<?php
declare(strict_types=1);

/**
 * Enquiry + "Hire from us" form endpoint — LedxDigitalAcademy
 *
 *   POST /api/lead.php   JSON { kind: 'lead'|'hire', name?, company?, roles?, phone, represents?, mode?, website, elapsed, page }
 *
 * Validates the mobile number (same rules as the brochure gate), e-mails the enquiry to LEAD_TO and keeps a copy in
 * private/enquiries.csv. Fails closed: if the e-mail cannot be sent the visitor is told to use WhatsApp instead.
 * Reuses the helpers in brochure.php (phone validation, rate limiter, private folder). PHP 8.1+, core functions only.
 */

define('LDA_BROCHURE_NO_RUN', true);
require __DIR__ . '/brochure.php';

date_default_timezone_set('Asia/Kolkata');

const ENQ_IP_LIMIT    = [10, 3600];  // requests / window (s) per IP
const ENQ_PHONE_LIMIT = [3, 86400];  // requests / window (s) per mobile number

/** Free text from a form field: single line, no control characters, capped length. */
function enq_text(mixed $v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $s = trim((string) preg_replace('/[\p{Cc}\p{Cf}]+/u', ' ', $v));
    $s = trim((string) preg_replace('/\s+/u', ' ', $s));
    return preg_match('/^.{0,' . $max . '}/su', $s, $m) ? $m[0] : ''; // cut to $max characters (no mbstring needed)
}

function enq_respond(int $code, array $body): never
{
    respond($code, $body);
}

function handle_enquiry(): never
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && strcasecmp((string) parse_url($origin, PHP_URL_HOST) . ((($p = parse_url($origin, PHP_URL_PORT)) !== null) ? ':' . $p : ''), $_SERVER['HTTP_HOST'] ?? '') !== 0) {
        enq_respond(403, ['ok' => false, 'message' => 'Request not allowed.']);
    }
    $len = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($len <= 0 || $len > 4096) {
        enq_respond(400, ['ok' => false, 'message' => 'Invalid request.']);
    }
    $in = json_decode((string) file_get_contents('php://input', false, null, 0, 4097), true);
    if (!is_array($in)) {
        enq_respond(400, ['ok' => false, 'message' => 'Invalid request.']);
    }

    // bots: honeypot filled, or sent impossibly fast
    if (enq_text($in['website'] ?? '', 50) !== '' || !isset($in['elapsed']) || !is_int($in['elapsed']) || $in['elapsed'] < MIN_FILL_MS) {
        enq_respond(422, ['ok' => false, 'message' => 'Please check your details and try again.']);
    }

    $kind = ($in['kind'] ?? 'lead') === 'hire' ? 'hire' : 'lead';
    $country = enq_text($in['countryCode'] ?? '+91', 6) ?: '+91';
    $phone = normalise_phone($country, enq_text($in['phone'] ?? '', 20));
    if ($phone === null) {
        enq_respond(422, ['ok' => false, 'field' => 'phone', 'message' => $country === '+91'
            ? 'Please enter a valid 10-digit Indian mobile number (starting 6, 7, 8 or 9).'
            : 'Please enter a valid mobile number for the selected country.']);
    }

    $name = '';
    $company = '';
    $roles = '';
    if ($kind === 'hire') {
        $company = enq_text($in['company'] ?? '', 80);
        $roles = enq_text($in['roles'] ?? '', 120);
        if ($company === '' || $roles === '') {
            enq_respond(422, ['ok' => false, 'message' => 'Please fill in your company name, contact number and the position you are hiring for.']);
        }
    } else {
        $name = clean_name(enq_text($in['name'] ?? '', 60)) ?? '';
        if ($name === '') {
            enq_respond(422, ['ok' => false, 'field' => 'name', 'message' => 'Please enter your name using letters only.']);
        }
    }
    $represents = enq_text($in['represents'] ?? '', 40);
    $mode = enq_text($in['mode'] ?? '', 40);
    $page = enq_text($in['page'] ?? '', 120);
    $page = preg_match('#^/[A-Za-z0-9/_\-.]{0,120}$#', $page) ? $page : '-';

    try {
        if (!rate_allow('enq-ip:' . ($_SERVER['REMOTE_ADDR'] ?? ''), ENQ_IP_LIMIT[0], ENQ_IP_LIMIT[1])
            || !rate_allow('enq-phone:' . $country . $phone, ENQ_PHONE_LIMIT[0], ENQ_PHONE_LIMIT[1])) {
            enq_respond(429, ['ok' => false, 'message' => 'Too many requests. Please try again later or WhatsApp us.']);
        }

        $time = (new DateTimeImmutable('now', new DateTimeZone('Asia/Kolkata')))->format('Y-m-d H:i:s');
        $subject = ($kind === 'hire' ? 'New hiring request: ' . header_safe($company) : 'New enquiry: ' . header_safe($name)) . ' - ' . $phone;
        $body = ($kind === 'hire' ? "A company wants to hire from LDA.\r\n\r\n" : "A visitor asked for a free career counselling call.\r\n\r\n")
            . ($kind === 'hire' ? 'Company  : ' . $company . "\r\nPosition : " . $roles . "\r\n" : 'Name     : ' . $name . "\r\n")
            . 'Mobile   : ' . $country . ' ' . $phone . "\r\n"
            . ($represents !== '' ? 'Profile  : ' . $represents . "\r\n" : '')
            . ($mode !== '' ? 'Mode     : ' . $mode . "\r\n" : '')
            . 'Page     : ' . $page . "\r\n"
            . 'Time     : ' . $time . " (IST)\r\n";

        $host = strtolower((string) preg_replace('/[^a-z0-9.\-]/i', '', explode(':', $_SERVER['HTTP_HOST'] ?? 'localhost')[0]));
        $host = preg_replace('/^www\./', '', $host) ?: 'localhost';
        $from = 'noreply@' . $host;
        $headers = ['From: LDA Website <' . $from . '>', 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'X-Mailer: LDA enquiry form'];

        $mode_env = getenv('LDA_MAIL_MODE') ?: 'mail'; // 'file' / 'fail' are for local testing only
        if ($mode_env === 'file') {
            ensure_dir(private_root() . '/outbox');
            $sent = @file_put_contents(private_root() . '/outbox/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml',
                'To: ' . LEAD_TO . "\r\nSubject: " . $subject . "\r\n" . implode("\r\n", $headers) . "\r\n\r\n" . $body, LOCK_EX) !== false;
        } elseif ($mode_env === 'fail') {
            $sent = false;
        } else {
            $sent = @mail(LEAD_TO, $subject, $body, implode("\r\n", $headers), '-f' . $from);
        }
        if (!$sent) {
            enq_respond(503, ['ok' => false, 'message' => 'We could not send that right now.']);
        }

        $file = private_root() . '/enquiries.csv';
        $new = !is_file($file);
        if ($fh = @fopen($file, 'ab')) {
            flock($fh, LOCK_EX);
            if ($new) {
                fputcsv($fh, ['time', 'kind', 'name_or_company', 'position', 'country_code', 'mobile', 'profile', 'mode', 'page'], ',', '"', '\\');
            }
            // a leading = + - @ would be run as a formula if the CSV is opened in Excel: neutralise it
            $safe = static fn (string $v): string => preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v;
            fputcsv($fh, [$time, $kind, $safe($kind === 'hire' ? $company : $name), $safe($roles), ltrim($country, '+'), $phone, $safe($represents), $safe($mode), $page], ',', '"', '\\');
            flock($fh, LOCK_UN);
            fclose($fh);
        }
        enq_respond(200, ['ok' => true]);
    } catch (Throwable $e) {
        error_log('enquiry form: ' . $e->getMessage());
        enq_respond(503, ['ok' => false, 'message' => 'We could not send that right now.']);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    handle_enquiry();
}
header('Allow: POST');
fail_text(405, 'Forbidden');
