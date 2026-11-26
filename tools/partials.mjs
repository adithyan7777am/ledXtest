/* =============================================================================
   partials.mjs — shared HTML building blocks (icons, logo, head, nav, footer…)
   ============================================================================= */
import { LOGO } from './logo-data.mjs';
import { CONFIG as C } from '../js/config.js';

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const isPlaceholder = (v) => !v || /\{\{.*\}\}/.test(String(v));
export const abs = (path) => C.site.url + path;
export const initials = (name) => {
  const w = name.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '?').slice(0, 2)).toUpperCase();
};

/* ---------------------------------------------------------------- icons -- */
const ICONS = {
  online: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M9 10.5a4 4 0 0 1 6 0M10.6 12.4a1.6 1.6 0 0 1 2.8 0"/>',
  offline: '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
  weekend: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M14 15h3"/>',
  evening: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
  hand: '<path d="M9 9l11 4-5 2-2 5z"/><path d="M4 4l2 2M3.5 10H6M10 3.5V6"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.6c-.5-1-1.4-1.6-2.6-1.6-1.6 0-2.8.9-2.8 2.1 0 2.7 5.6 1.3 5.6 4 0 1.2-1.2 2.1-2.8 2.1-1.2 0-2.2-.6-2.7-1.6M12 6.5V8M12 16v1.5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 13l2 2"/><path d="M14.5 4.5C17 2 21 3 21 3s1 4-1.5 6.5L13 16l-5-5z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="M9 14.4 7.5 21l4.5-2.5 4.5 2.5-1.5-6.6"/>',
  chart: '<path d="M4 20V11M10 20V5M16 20v-7M21 20H3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  whatsapp: '<path d="M3.5 20.5 4.8 16.4A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 8.6c0 3.4 3 6.4 6.4 6.4l1-1.5-2-1-1 .8a4 4 0 0 1-2.2-2.2l.8-1-1-2z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l.7-4H14V8z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.3v.01M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17"/>',
  youtube: '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  sparkle: '<path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z" fill="currentColor" stroke="none"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
};
export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

/* ----------------------------------------------------------------- logo -- */
/* The official LDA lettermark, traced to vector (tools/logo-data.mjs).
   `.logo__glyph` = the black letter pieces (white on the dark site), `.logo__dot` = the three violet blocks.
   The preloader draws the glyph strokes, then pops the violet blocks in. */
export const logo = (cls = 'logo', title = 'LedxDigitalAcademy') => `
<svg class="${cls}" viewBox="0 0 ${LOGO.mark.w} ${LOGO.mark.h}" role="img" aria-label="${esc(title)}" shape-rendering="geometricPrecision">
  ${LOGO.mark.letters.map((d) => `<path class="logo__glyph" d="${d}" fill-rule="evenodd"/>`).join('')}
  ${LOGO.mark.violet.map((d) => `<path class="logo__dot" d="${d}"/>`).join('')}
</svg>`;

/* -------------------------------------------------------------- buttons -- */
/* variant: primary | glass | coral | ghost.  Text-roll label via data-text. */
export const btn = ({ label, href = '#', variant = 'primary', size = '', iconName = '', attrs = '', magnetic = variant === 'primary', tag = 'a' }) => {
  const cls = `btn btn--${variant}${size ? ' btn--' + size : ''}`;
  const inner = `<span class="btn__label"><span class="btn__text" data-text="${esc(label)}">${esc(label)}</span></span>${iconName ? icon(iconName, 'icon btn__icon') : ''}`;
  const mag = magnetic ? ' data-magnetic' : '';
  return tag === 'button'
    ? `<button class="${cls}"${mag} ${attrs}>${inner}</button>`
    : `<a class="${cls}" href="${esc(href)}"${mag} ${attrs}>${inner}</a>`;
};

/* ----------------------------------------------------------------- head -- */
export const head = ({ title, description, path, type = 'website', image = C.site.ogImage, jsonld = [], preload = '' }) => `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${C.robots}">
<link rel="canonical" href="${abs(path)}">
<meta name="theme-color" content="${C.site.themeColor}">
<meta name="keywords" content="${esc((C.seo.home.keywords || []).join(', '))}">

<!-- Open Graph / Twitter -->
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${C.site.name}">
<meta property="og:locale" content="${C.site.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(image)}">

<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/svg/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">

<!-- Fonts: Google Fonts for now. To self-host, see README → "Fonts". -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@400;500;600&display=swap">
${preload}
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/glass.css">
<link rel="stylesheet" href="/css/main.css">

<script>
/* Runs before first paint: sets motion/visit flags so CSS can hide the right things. */
(function (d) {
  var h = d.documentElement; h.classList.add('js');
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) h.classList.add('reduced-motion');
    if (sessionStorage.getItem('lda-pt')) h.classList.add('pt-in');
    else if (sessionStorage.getItem('lda-visited')) h.classList.add('is-repeat');
    var t = sessionStorage.getItem('lda-tier'); if (t) h.classList.add('tier-' + t);
  } catch (e) {}
  /* Safety net: if the engine never booted (CDN down, JS error…), show the static page. */
  setTimeout(function () { if (!window.__ldaBooted) h.classList.add('engine-failed'); }, 5000);
})(document);
</script>
${jsonld.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }).replace(/</g, '\\u003c')}</script>` : ''}
</head>`;

/* ------------------------------------------------------- svg defs/filter -- */
export const svgDefs = `
<svg class="sr-only" width="0" height="0" aria-hidden="true" focusable="false">
  <!-- Liquid-glass refraction (Chromium backdrop-filter:url()). Mirror of /assets/svg/liquid-glass-filter.svg -->
  <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="2" result="soft"/>
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="28" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;

/* ------------------------------------------------------------ preloader -- */
export const preloader = () => `
<div class="preloader" id="preloader" aria-hidden="true">
  <div class="preloader__layer preloader__layer--violet"></div>
  <div class="preloader__layer preloader__layer--dark">
    <div class="preloader__stage">
      ${logo('preloader__logo', 'LDA')}
    </div>
    <span class="preloader__bar"><i data-pl-bar></i></span>
  </div>
</div>
<div class="pt-curtain" aria-hidden="true"><div class="pt-curtain__glass"></div></div>`;

/* ------------------------------------------------------------------ nav -- */
export const nav = (active = '/') => `
<a class="skip-link" href="#main">Skip to content</a>
<header class="nav" data-module="navbar" data-eager>
  <nav class="nav__bar glass glass--refract" data-specular aria-label="Primary">
    <a class="nav__logo" href="/" aria-label="${C.site.name} — home">${logo('logo', C.site.name)}</a>
    <ul class="nav__links" role="list">
      ${C.nav.map((l) => `<li><a class="nav__link" href="${l.href}"${l.href === active ? ' aria-current="page"' : ''}>${l.label}${l.href === active ? '<span class="nav__underline" aria-hidden="true"></span>' : ''}</a></li>`).join('')}
    </ul>
    <div class="nav__actions">
      ${btn({ label: 'Hire from us', href: '/placements/#hire', variant: 'glass', size: 'sm', magnetic: false, attrs: 'data-hide-mobile' })}
      ${btn({ label: 'Enroll Now', href: '/#enquire', variant: 'primary', size: 'sm' })}
      <button class="nav__burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
        <span></span><span></span>
      </button>
    </div>
  </nav>
</header>
<div class="menu glass glass--strong" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden>
  <div class="menu__inner container">
    <ul class="menu__links" role="list">
      ${[...C.nav, { label: 'Hire from us', href: '/placements/#hire' }, { label: 'Enroll Now', href: '/#enquire' }]
        .map((l) => `<li class="menu__line"><a class="menu__link" href="${l.href}"><span>${l.label}</span></a></li>`).join('')}
    </ul>
    <div class="menu__foot">
      <a class="menu__phone" href="${C.contact.phoneHref}">${icon('phone')} ${C.contact.phone}</a>
      <ul class="socials" role="list">
        ${C.socials.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${icon(s.name.toLowerCase())}</a></li>`).join('')}
      </ul>
    </div>
  </div>
</div>
<div class="cursor" aria-hidden="true"><canvas class="cursor__canvas"></canvas><span class="cursor__dot"></span><span class="cursor__follow"><span class="cursor__shape"><span class="cursor__glyph">₹</span></span><span class="cursor__label"></span></span></div>`;

/* ----------------------------------------------------- floating actions -- */
export const floating = () => `
<div class="fab" data-fab>
  <a class="fab__call glass glass--pill glass--flat" href="${C.contact.phoneHref}">${icon('phone')}<span>Call Now</span></a>
  <a class="fab__wa" href="${C.contact.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon('whatsapp')}</a>
</div>
<!-- {{CHATBOT_EMBED}} — "Livi" chatbot slot -->
<div id="chatbot-slot">${C.integrations.chatbotEmbed || ''}</div>`;

/* --------------------------------------------------------------- footer -- */
export const footer = () => {
  const word = 'LEDX DIGITAL ACADEMY';
  const a = C.contact.address;
  return `
<footer class="footer" data-module="footer">
  <div class="container footer__grid">
    <div class="footer__brand">
      ${logo('logo footer__logo', C.site.name)}
      <p class="footer__tag">${esc(C.site.tagline)}</p>
      <ul class="socials" role="list">
        ${C.socials.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name} ${esc(s.handle)}">${icon(s.name.toLowerCase())}</a></li>`).join('')}
      </ul>
    </div>
    <nav class="footer__col" aria-label="Programs">
      <h2 class="footer__h"><a href="/programs/">Our Programs</a></h2>
      <ul role="list">${C.programs.filter((p) => p.detail !== false).map((p) => `<li><a href="/programs/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>
    </nav>
    <nav class="footer__col" aria-label="Company">
      <h2 class="footer__h">Company</h2>
      <ul role="list">
        <li><a href="/about/">About</a></li><li><a href="/placements/">Placements</a></li>
        <li><a href="/blogs/">Blogs</a></li><li><a href="/placements/#hire">Hire from us</a></li>
      </ul>
    </nav>
    <div class="footer__col">
      <h2 class="footer__h">Contact</h2>
      <ul role="list" class="footer__contact">
        <li><a href="${C.contact.phoneHref}">${icon('phone')}${C.contact.phone}</a></li>
        <li><a href="${C.contact.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp us</a></li>
        <li><a href="mailto:${esc(C.contact.email)}">${icon('mail')}${esc(C.contact.email)}</a></li>
        <li><a href="${C.contact.mapLink}" target="_blank" rel="noopener">${icon('pin')}<span>${esc(a.street)}, ${a.city} ${a.postal}</span></a></li><!-- {{ADDRESS_MANGALORE}} -->
      </ul>
    </div>
    <div class="footer__map">
      <!-- the embed is loaded by JS only when the footer is about to be seen (initFooter): the Google Maps frame is heavy, and loading it ~1250px early (native lazy) landed in the middle of a scroll -->
      <iframe title="Map: ${C.site.name}, Mangaluru" data-src="${C.contact.mapEmbed}" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <noscript><iframe title="Map: ${C.site.name}, Mangaluru" src="${C.contact.mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></noscript>
    </div>
  </div>
  <div class="footer__mark-wrap" aria-hidden="true">
    <p class="footer__mark">${[...word].map((ch) => ch === ' ' ? '<span class="sp"> </span>' : `<span class="ch">${ch}</span>`).join('')}</p>
  </div>
  <div class="container footer__bottom">
    <p>© ${C.site.year} ${C.site.name}. All rights reserved.</p>
    <p>Formerly ${C.site.formerName}, Mangalore.</p>
  </div>
</footer>`;
};

/* -------------------------------------------------------------- scripts -- */
export const scripts = () => `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script type="module" src="/js/main.js"></script>`;

/* ----------------------------------------------------------- lead form -- */
export const leadForm = ({ id = 'enquire', title = C.form.title, subtitle = C.form.subtitle, kind = 'lead' } = {}) => `
<section class="section form-section" id="${id}" data-module="form" aria-labelledby="${id}-title">
  <div class="container">
    <div class="form-card glass" data-edge data-specular>
      <div class="form-card__intro">
        <h2 class="h2" id="${id}-title" data-split="lines">${esc(title)}</h2><!-- {{FORM_TITLE}} -->
        <p class="lead">${esc(subtitle)}</p>
        <ul class="form-card__points" role="list">
          <li>${icon('check')}Free 20-minute call with a mentor</li>
          <li>${icon('check')}Batch timings, fees and EMI options</li>
          <li>${icon('check')}Honest advice on which program fits you</li>
        </ul>
        <a class="link-arrow" href="${C.contact.whatsapp}" target="_blank" rel="noopener">Prefer WhatsApp? Message us ${icon('arrowUpRight')}</a>
      </div>
      <!-- Submits to {{FORM_ENDPOINT}} (config.integrations.formEndpoint); falls back to WhatsApp. -->
      <form class="form" data-form="${kind}" novalidate>
        <p class="sr-only" aria-hidden="true"><label>Leave this empty <input type="text" name="website" tabindex="-1" autocomplete="off"></label></p>
        ${kind === 'hire' ? `
        <div class="field"><input class="field__input" id="${id}-company" name="company" type="text" autocomplete="organization" placeholder=" " required><label class="field__label" for="${id}-company">Company name</label></div>` : ''}
        ${kind === 'hire' ? '' : `<div class="field"><input class="field__input" id="${id}-name" name="name" type="text" autocomplete="name" placeholder=" " required><label class="field__label" for="${id}-name">Your name</label></div>`}
        <div class="field field--phone">
          <label class="sr-only" for="${id}-cc">Country code</label>
          <select class="field__cc" id="${id}-cc" name="countryCode" autocomplete="tel-country-code">
            ${C.form.countries.map((c) => `<option value="${c.code}">${c.label}</option>`).join('')}
          </select>
          <div class="field field--inner"><input class="field__input" id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder=" " required pattern="[0-9 ]{7,14}"><label class="field__label" for="${id}-phone">${kind === 'hire' ? 'Contact number' : 'Phone number'}</label></div>
        </div>
        ${kind === 'hire' ? `
        <div class="field"><input class="field__input" id="${id}-roles" name="roles" type="text" autocomplete="organization-title" placeholder=" " required><label class="field__label" for="${id}-roles">Position you are hiring for</label></div>` : `
        <fieldset class="choices">
          <legend class="choices__legend">What represents you?</legend>
          <div class="choices__row">${C.form.represents.map((r, i) => `<label class="choice"><input type="radio" name="represents" value="${r}"${i === 0 ? ' required' : ''}><span>${r}</span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="choices">
          <legend class="choices__legend">Preferred mode</legend>
          <div class="choices__row">${C.form.modes.map((m) => `<label class="choice"><input type="radio" name="mode" value="${m}"><span>${m}</span></label>`).join('')}</div>
        </fieldset>`}
        <div class="form__submit">
          <button class="btn btn--primary btn--block form__btn" type="submit" data-magnetic>
            <span class="btn__label"><span class="btn__text" data-text="${kind === 'hire' ? 'Send hiring request' : 'Book my free call'}">${kind === 'hire' ? 'Send hiring request' : 'Book my free call'}</span></span>
            <span class="form__spinner" aria-hidden="true"></span>
            <svg class="form__check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
          </button>
          <p class="form__status" role="status" aria-live="polite"></p>
        </div>
      </form>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------ breadcrumb -- */
export const breadcrumbs = (items) => `
<nav class="crumbs" aria-label="Breadcrumb"><ol role="list">
  ${items.map((it, i) => i === items.length - 1
    ? `<li><span aria-current="page">${esc(it.name)}</span></li>`
    : `<li><a href="${it.path}">${esc(it.name)}</a></li>`).join('')}
</ol></nav>`;

/* ---------------------------------------------------------- page shell -- */
export const layout = ({ seo, path, active, body, jsonld = [], preload = '', bodyClass = '' }) => `${head({ ...seo, path, jsonld, preload })}
<body class="${bodyClass}">
${svgDefs}
<div class="orbs" aria-hidden="true"><span class="orb orb--violet"></span><span class="orb orb--plum"></span><span class="orb orb--coral"></span></div>
${preloader()}
${nav(active)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${floating()}
${scripts()}
</body>
</html>
`;

/* Row of animated stat counters (module: counters). Each stat: { value, suffix, prefix?, label } */
export const statRow = (stats) => `
<ul class="stat-row" role="list" data-module="counters">
  ${stats.map((s) => `<li class="stat glass glass--flat"><b class="stat__num"><span>${s.prefix || ''}</span><span data-count="${s.value}">${s.value}</span><span>${s.suffix || ''}</span></b><span class="stat__label">${esc(s.label)}</span></li>`).join('')}
</ul>`;

/* Brochure gate dialog (opened by any [data-brochure] button — see js/brochure.js).
   The PDF itself is only served by api/brochure.php after the visitor passes the checks. */
export const brochureDialog = () => `
<dialog class="bro" id="brochure-dialog" aria-labelledby="bro-title" aria-describedby="bro-sub">
  <div class="bro__card glass glass--strong">
    <button class="bro__close" type="button" data-bro-close aria-label="Close">${icon('close')}</button>
    <p class="eyebrow">Free brochure</p>
    <h2 class="bro__title" id="bro-title">Get the brochure</h2>
    <p class="bro__sub" id="bro-sub">Enter your mobile number and Gmail to download <b data-bro-program>the program brochure</b>.</p>
    <form class="form bro__form" novalidate>
      <input type="hidden" name="program">
      <div class="bro__trap" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="field field--phone">
        <label class="sr-only" for="bro-cc">Country code</label>
        <select class="field__cc" id="bro-cc" name="countryCode" autocomplete="tel-country-code">
          ${C.form.countries.map((c) => `<option value="${c.code}">${c.label}</option>`).join('')}
        </select>
        <div class="field field--inner"><input class="field__input" id="bro-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder=" " required maxlength="18"><label class="field__label" for="bro-phone">Mobile number</label></div>
      </div>
      <div class="field"><input class="field__input" id="bro-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder=" " required maxlength="64" spellcheck="false" autocapitalize="none"><label class="field__label" for="bro-email">Gmail address</label></div>
      <div class="field"><input class="field__input" id="bro-name" name="name" type="text" autocomplete="name" placeholder=" " maxlength="60"><label class="field__label" for="bro-name">Your name (optional)</label></div>
      <label class="bro__consent"><input type="checkbox" name="consent" required><span>I agree that LDA may contact me on this number and Gmail about this program.</span></label>
      <div class="form__submit">
        <button class="btn btn--primary btn--block form__btn" type="submit">
          <span class="btn__label"><span class="btn__text" data-text="Download brochure">Download brochure</span></span>
          <span class="form__spinner" aria-hidden="true"></span>
          <svg class="form__check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
        </button>
        <p class="form__status bro__status" role="status" aria-live="polite"></p>
      </div>
    </form>
    <p class="bro__note">Your details go to LDA only, to share this brochure and follow up with you.</p>
  </div>
</dialog>`;
