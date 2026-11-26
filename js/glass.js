/* =============================================================================
   glass.js — Liquid Glass behaviour
   - refraction feature-detect (Chromium backdrop-filter:url())
   - performance budget: live backdrop-filter only on the surfaces that float over scrolling content
   - specular cursor light (--mx / --my via gsap.quickTo)
   - press state (scale .98 + blur bump, smooth release)
   The ambient background orbs are pure CSS now (css/glass.css) — compositor-driven, no JS per frame.
   Registered as an Engine global module (runs once per page).
   ============================================================================= */
const MAX_LIVE = 3;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function supportsRefraction() {
  const isChromium = !!window.chrome && /Chrome\//.test(navigator.userAgent);
  try { return isChromium && CSS.supports('backdrop-filter', 'url(#liquid-glass) blur(2px)'); } catch { return false; }
}

/* ---------------------------------------------------------- budget ---- */
/* A backdrop blur is re-computed every frame its backdrop changes, and its cost grows with the area. It is
   only visible where detail passes underneath, so only the small bars that float over scrolling content (the
   navbar, the mobile enroll bar, the inline CTA) keep a live blur. Content cards sit on a smooth dark gradient
   where a blur cannot be seen, yet each one used to cost a full-area blur pass per frame while it was on
   screen; the full-screen menu is ~95% opaque, so its blur was just as invisible. Both now use the plain
   tint (see glass.css / main.css). */
function initBudget() {
  const all = [...document.querySelectorAll('.glass--refract, .enroll-bar, .inline-cta')];
  const visible = new Set();
  const apply = () => {
    let live = 0;
    all.forEach((el) => {
      const ok = visible.has(el) && live < MAX_LIVE;
      if (ok) live++;
      el.classList.toggle('glass-live', ok);
    });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    apply();
  }, { rootMargin: '80px 0px' });
  all.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/* -------------------------------------------------------- specular ---- */
function initSpecular({ gsap, on }) {
  if (!finePointer()) return;
  // One shared counter instead of a scroll listener per card: a card re-measures itself only after the page moved.
  let scrollGen = 0;
  on(window, 'scroll', () => { scrollGen++; }, { passive: true });
  document.querySelectorAll('[data-specular]').forEach((el) => {
    // quickTo drives a proxy; the proxy writes the CSS vars (keeps units explicit).
    const p = { x: 0, y: 0 };
    const write = () => { el.style.setProperty('--mx', `${p.x}px`); el.style.setProperty('--my', `${p.y}px`); };
    const xTo = gsap.quickTo(p, 'x', { duration: 0.45, ease: 'power3', onUpdate: write });
    const yTo = gsap.quickTo(p, 'y', { duration: 0.45, ease: 'power3', onUpdate: write });
    // Measure the card when the pointer enters (and again only if the page scrolled under it), not on every
    // move: a layout read inside a pointermove handler can force a synchronous layout.
    let r = null;
    let seen = -1;
    const measure = () => { r = el.getBoundingClientRect(); seen = scrollGen; };
    on(el, 'pointerenter', (e) => {
      measure();
      p.x = e.clientX - r.left; p.y = e.clientY - r.top;
      xTo(p.x, p.x); yTo(p.y, p.y); write();
      el.style.setProperty('--spec-o', 1);
    });
    on(el, 'pointermove', (e) => {
      if (seen !== scrollGen) measure();
      xTo(e.clientX - r.left); yTo(e.clientY - r.top);
    });
    on(el, 'pointerleave', () => el.style.setProperty('--spec-o', 0));
  });
}

/* ----------------------------------------------------------- press ---- */
function initPress({ gsap, on }) {
  const targets = document.querySelectorAll('.glass[data-specular], .glass[data-edge]');
  targets.forEach((el) => {
    // Skip large layout surfaces — pressing a whole form feels wrong.
    if (el.matches('.form-card, .founder__card, .nav__bar, .hero__card, .toc')) return;
    on(el, 'pointerdown', () => {
      el.classList.add('is-pressed');
      gsap.to(el, { scale: 0.98, duration: 0.14, ease: 'power2.out', overwrite: 'auto' });
    });
    const release = () => {
      if (!el.classList.contains('is-pressed')) return;
      el.classList.remove('is-pressed');
      // a calm ease-out settle: no overshoot, so it never wobbles under the next hover
      gsap.to(el, { scale: 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    };
    on(el, 'pointerup', release);
    on(el, 'pointerleave', release);
    on(el, 'pointercancel', release);
  });
}

export function initGlass(ctx) {
  const html = document.documentElement;
  if (supportsRefraction() && ctx.tier === 'high' && !ctx.reduced) html.classList.add('has-refraction');
  const off = initBudget(ctx);
  if (ctx.tier !== 'low') initSpecular(ctx);
  if (!ctx.reduced) initPress(ctx);
  return () => { off(); html.classList.remove('has-refraction'); };
}
