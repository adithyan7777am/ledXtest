/* Security headers for the live site. Used by tools/build.mjs (written into .htaccess) and tools/serve.mjs (so the
   Content-Security-Policy can be tested locally). If you add a new third-party script, font, image host, iframe or
   form endpoint, allow it here and rebuild. */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",          // GSAP + Lenis from jsDelivr; one tiny inline boot script
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://cdn.simpleicons.org",                      // tool logos
  "media-src 'self'",                                                      // learner reels
  "frame-src https://www.google.com https://maps.google.com",             // footer map
  "connect-src 'self'",                                                    // /api/brochure.php, /api/lead.php
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

export const HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000',
};
