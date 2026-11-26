# LedxDigitalAcademy (LDA) — website

Static site: HTML + CSS custom properties + vanilla JS, with GSAP 3.13 (ScrollTrigger, SplitText, Flip) and Lenis smooth scroll. There is no framework, and the build has no dependencies. Every page is generated from one config file.

```
index.html  about/  placements/  blogs/  blog/[slug]/  programs/[slug]/   ← generated
css/tokens.css  css/glass.css  css/main.css
js/config.js          ← ONE object: brand, stats, programs, tools, testimonials, FAQ, posts, SEO, contact
js/engine/            ← AssetLoader.js, Preloader.js, Engine.js, tier.js, transitions.js
js/animations.js      ← one init per section (initNavbar, initHero, initAbout … initPost)
js/glass.js           ← specular light, refraction feature-detect, glass budget, orbs
js/main.js            ← bootstrap
tools/build.mjs       ← generates pages, sitemap.xml, robots.txt, _redirects, vercel.json, .htaccess
tools/partials.mjs    ← head/nav/footer/form/icons    tools/pages-*.mjs ← page templates
tools/schema.mjs      ← JSON-LD (Organization, EducationalOrganization, WebSite, LocalBusiness, Course, FAQPage, BlogPosting, BreadcrumbList)
assets/svg/liquid-glass-filter.svg  assets/svg/logo.svg  assets/img/noise.svg
```

## Run it

Requires Node 18+.

```powershell
npm run dev        # build + serve on http://localhost:4321
npm run build      # regenerate HTML after editing config/templates
```

The generated `.html` files are build output. Edit `js/config.js` or `tools/*.mjs`, then run `npm run build`.

## Editing content (`js/config.js`)

| What | Key |
|---|---|
| Phone, WhatsApp, email, address, map | `contact` |
| Social links (update handles after the rebrand) | `socials` |
| Hero stats / copy / media | `stats`, `hero` |
| Programs (title, duration, hours, fee, modules) | `programs[]` |
| Tool orbit (50+) | `tools[]` |
| Testimonials | `testimonials[]` — put the full verbatim review in `full` |
| FAQ (also feeds FAQPage schema) | `faq[]` |
| Blog posts (slug, category, read time, date, cover) | `blog.posts[]` |
| Per-page SEO title/description | `seo` |
| Form endpoint, brochure, chatbot | `integrations` |

Search the repo for `{{` to find every placeholder, and for `VERIFY` to find copy rebuilt from the current site that should be replaced with the exact wording.

### Outstanding placeholders
`{{SITE_URL}}` `{{HERO_MEDIA}}` `{{FORM_ENDPOINT}}` `{{CHATBOT_EMBED}}` `{{ST_ALOYSIUS_LOGO}}` `{{MOU_PHOTO}}` `{{ALUMNI_PHOTO_n}}` `{{NANDANA_REVIEW_VERBATIM}}` `{{STORY_REELS}}` `{{TOOL_LOGOS}}` `{{MORE_CERT_LOGOS}}` `{{FOUNDER_PHOTO}}` `{{FOUNDER_MESSAGE}}` `{{MORE_MENTORS}}` `{{FEE}}` `{{BATCHES}}` `{{MODULES}}` (draft outlines) `{{PLACEMENTS}}` `{{TIMELINE}}` years `{{MISSION}}` `{{VISION}}` `{{STORY}}` `{{POST_BODY}}` (×9, migrate from the old site) `{{DATE}}` `{{COVER}}` `{{AUTHOR}}`

## Swapping media

- **Hero:** set `hero.media.src` (AVIF/WebP, 900×1100) or `hero.media.video` + `poster`. The build preloads it with `fetchpriority="high"` and the AssetLoader waits for it to decode.
- **Photos** (alumni, founder, MoU, covers): drop them in `/assets/img/…` and set the path in config. Every media box already reserves its aspect ratio, so swapping media causes no layout shift.
- **Logo:** the official LDA logo is traced to vector in `tools/logo-data.mjs` (used by the nav, footer and loading animation: white letters + three violet blocks), with `assets/svg/logo.svg` (full colour + tagline), `assets/svg/favicon.svg`, `assets/img/apple-touch-icon.png` and `assets/img/og-default.jpg` (the 1200×630 social-share image) generated from it. To change the logo, send the new image and these files are regenerated together.
- **Fonts:** currently loaded from Google Fonts. To self-host, download Bricolage Grotesque (variable) and Inter as `woff2` into `/assets/fonts/`, add `@font-face` rules with `font-display: swap` to `tokens.css`, replace the Google `<link>` in `tools/partials.mjs → head()` with `<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/bricolage.woff2" crossorigin>`, and rebuild.

## Motion engine

- `Engine.register('name', init)` plus `data-module="name"` on a section. Modules run inside `gsap.context()` + `gsap.matchMedia()` and return a cleanup function.
- `data-eager` modules (navbar, hero) initialise under the preloader. Everything else is set up **in idle time** (`Engine.#warm`: one section per idle slot, starting ~3s after the hero, paused while the visitor scrolls), with an IntersectionObserver (`rootMargin: 200px`) as the fallback for anything not reached yet (e.g. an anchor jump). Never re-measure triggers mid-scroll: call `Engine.refresh()` (deferred until scrolling stops) instead of `ScrollTrigger.refresh()`.
- **Device tier:** hardware hints plus a 1-second FPS probe, cached per session. `low` disables refraction, Lenis, the cursor, parallax and orbit scrubbing, and uses solid glass.
- **Reduced motion:** every module falls back to a 0.4s opacity fade. There is no blur, refraction or Lenis.
- **Glass budget:** only the small bars that float over scrolling content (navbar, mobile enroll bar, inline CTA) get a live `backdrop-filter` (`glass.js`). Cards, the full-screen menu and the page-transition curtain use a plain tint — a blur is invisible over a smooth dark gradient but costs a full-area pass every frame.

### Smooth-motion rules (keep these when editing)

Measured with a scripted scroll in the Browser pane; these are what removed the dropped frames.

- **Animate `transform` / `opacity` only.** No `box-shadow`, `border-radius`, `width` or `letter-spacing` on large or frequently-repeating things. Loops use CSS keyframes (compositor), not GSAP tweens, and pause when off-screen (`pauseOffscreen()` in `animations.js`, `.hero.is-away` in CSS).
- **One owner per property.** GSAP owns `transform` on anything it animates (reveals, press, magnetic). Put CSS hover/press feedback on the individual properties instead — `translate` / `scale` — never `transition: transform` on the same element, or the two layers double-smooth and feel laggy.
- **Scrub:** `scrub: scrubFor(lenis)` — `true` when Lenis already eases the wheel, a short catch-up otherwise. A fixed `scrub: 0.6` on top of Lenis adds a second of lag.
- **Never create a tween from a scroll callback on every tick** (the navbar did, and stalled). Act only when the state flips.
- **No elastic / bounce easing** for UI; use `power3.out` / `expo.out`. Press feedback ≤ 160 ms.
- **Third-party embeds** (the footer map) load only when in view and after scrolling pauses.
- **Preloader:** shown on the first visit only. A repeat visit in the same session gets a 300ms fade. Internal links get the glass-curtain transition.
- **Safety net:** if the engine never boots (CDN down), the static page shows after 5s.

## Brochure gate (gated downloads)

A program brochure is **never a public file**. The "Download Brochure" button opens a form that asks for a genuine mobile number and a Gmail address. Only after the server accepts them does it e-mail the lead to **ledxdigitalacademy@gmail.com** (and log it to `private/leads.csv`) and hand out a signed download link that expires after 15 minutes.

```
api/brochure.php                          the gate (PHP 8.1+, no dependencies)
private/brochures/<program-slug>.pdf      the brochures — denied to the web by .htaccess
private/brochures/index.json              slug → { title, file }; only listed files can be downloaded
private/.htaccess                         "deny all" for everything in /private
js/brochure.js                            the form + the same validation rules (keep in sync with the PHP)
tools/dev-router.php                      local testing only:  npm run dev:php  →  http://localhost:4322
```

**Rules enforced on the server** (the browser repeats them for a friendlier form): Indian mobiles must be 10 digits starting 6–9 (other countries: correct length); obvious fakes (`9999999999`, `9876543210`, `9090909090`) are rejected; the e-mail must be a real-looking Gmail (6–30 letters/digits/dots, no `+` aliases, no `test…` or `aaaaaa` patterns); consent must be ticked; a hidden honeypot field and a minimum fill time stop simple bots; max 8 requests per hour per IP and 3 per day per mobile+Gmail pair; the form only accepts same-site requests; if the lead e-mail cannot be sent, **no link is issued**.

**Honest limit:** this checks that the details *look* genuine; it cannot prove a number or Gmail belongs to the visitor. Real proof needs an OTP (SMS) or an e-mail confirmation link, which requires an SMS provider or a sending domain — say the word and it can be added.

**Add another brochure:** put the PDF in `private/brochures/`, add its entry to `private/brochures/index.json`, and set `brochure: true` on that program in `js/config.js` (the filename must match the program slug), then `npm run build`.

**Deploying on Hostinger (hPanel → Files → File Manager):**
1. Run `npm run build`, then upload the whole project to `public_html` **including the hidden `.htaccess` files** (File Manager → Settings → show hidden files) and the `api/` and `private/` folders.
2. Best practice: move `private/` **above** `public_html` (e.g. `/home/uXXXX/lda-private`) and set `PRIVATE_DIR` at the top of `api/brochure.php` to that absolute path. Then the PDFs cannot be reached from the web at all.
3. The signing key is created automatically on the first request; the folder must be writable by PHP (it is by default).
4. Lead e-mails use PHP `mail()` from `noreply@<your domain>`. After deploying, submit the form once yourself and check the **inbox and spam folder** of ledxdigitalacademy@gmail.com; mark it "not spam" once.
5. Check that `https://your-domain/private/brochures/ai-integrated-digital-marketing-program.pdf` returns **403/404** — if it downloads, the protection is not active, so do step 2 immediately.
6. The enquiry and "Hire from us" forms post to `api/lead.php` (same PHP rules, e-mailed to the same Gmail, copy in `private/enquiries.csv`). Test both forms once after deploying. If PHP is unavailable the forms fall back to WhatsApp.
7. In hPanel turn on **Force HTTPS** (SSL) for the domain. `.htaccess` also redirects HTTP → HTTPS and www → non-www, adds the security headers (CSP, X-Frame-Options, HSTS…) and blocks `private/`, `tools/`, dotfiles and `*.mjs`. If you add a new external script, font, image host, iframe or form service, allow it in `tools/security.mjs` and rebuild, or the browser will block it.
8. Leads are also saved in `private/leads.csv` (download it from File Manager). It contains personal data: keep it private.

This gate needs a PHP host. It does nothing on Netlify/Vercel static hosting.

## Deploy

**Netlify:** drag the folder in, or connect the repo with publish directory `/` and build command `npm run build`. `_redirects` holds the 301s.

**Vercel:** import the repo, framework "Other", build `npm run build`, output directory `.`. `vercel.json` holds the 301s and cache headers.

**cPanel:** run `npm run build` locally and upload everything (including `.htaccess`) to `public_html`.

### Rebrand / SEO migration checklist
1. Set `site.url` to the final domain and rebuild (canonicals, sitemap and JSON-LD all use it).
2. Old program and post URLs (root-level slugs) 301 to `/programs/…` and `/blog/…`. The wrong slug `/digital-marketing-tools-for-beginners-2/` goes to `/blog/career-opportunities-after-digital-marketing-course/`.
3. If the domain changes, put the commented domain-wide rule from `.htaccess` on the **old** host.
4. Submit the new `sitemap.xml` in Search Console, use the Change of Address tool, update the Google Business Profile name and website, and rename social profiles.
5. Add a real `og-default.jpg` (1200×630) to `/assets/img/`.
