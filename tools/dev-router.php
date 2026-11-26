<?php
/**
 * Local-only router for PHP's built-in server:
 *   php -S localhost:4322 tools/dev-router.php        (run from the project root)
 * It serves the static site plus /api/brochure.php, and mimics the production rules that
 * Apache/LiteSpeed enforce through .htaccess (the built-in server ignores .htaccess).
 * Never deploy this file's behaviour: lead e-mails are written to private/outbox instead of being sent.
 */
putenv('LDA_MAIL_MODE=file');

$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
if (preg_match('#(^|/)(private|tools|node_modules|\.claude|\.git)(/|$)#', $path) || preg_match('#/\.[^/]#', $path)) {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo 'Forbidden';
    return true;
}
return false; // everything else: normal static files / PHP scripts
