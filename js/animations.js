/* =============================================================================
   animations.js — one named init per section. Each receives the Engine ctx:
   { el, gsap, ScrollTrigger, SplitText, Flip, mm, reduced, tier, lenis, on, fade }
   and returns a cleanup fn or { play, cleanup }. Never call these directly —
   main.js registers them with the Engine, which runs them lazily.

   Easing: expo.out for reveals · power3.inOut for transitions · power4.inOut
   for curtains. UI micro-interactions stay < 300ms (Emil Kowalski rules).
   ============================================================================= */
import { CONFIG } from './config.js';

const DESKTOP = '(min-width: 1024px)';
const MOBILE = '(max-width: 767px)';
const FINE = '(hover: hover) and (pointer: fine)';
const isFine = () => window.matchMedia(FINE).matches;
const ACCENT = '#9D6BFF';

/* Scroll-scrub smoothing. Lenis already eases the wheel, so a second easing layer on top only adds lag
   (scrubbed motion that keeps drifting for a second after you stop). Without Lenis smoothing (touch, which
   scrolls natively) keep a short catch-up so the per-frame scroll steps do not show. */
const scrubFor = (lenis) => (lenis && isFine() ? true : 0.3);

/* ------------------------------------------------------------- helpers -- */

/** Infinite horizontal loop for a [data-marquee] container. Tracks must
    contain two identical copies of their items (the build does this). */
export function marquee({ gsap, ScrollTrigger, on, reduced }, root, { speed = 40 } = {}) {
  if (!root || reduced) return [];
  const tweens = [...root.querySelectorAll('.marquee__row')].map((row) => {
    const track = row.querySelector('.marquee__track');
    const dir = Number(row.dataset.dir || -1);
    const half = track.scrollWidth / 2 || 1000;
    const tween = gsap.fromTo(track,
      { xPercent: dir < 0 ? 0 : -50 },
      { xPercent: dir < 0 ? -50 : 0, duration: half / speed, ease: 'none', repeat: -1 });
    on(row, 'pointerenter', () => gsap.to(tween, { timeScale: 0, duration: 0.4, ease: 'power2.out' }));
    on(row, 'pointerleave', () => gsap.to(tween, { timeScale: 1, duration: 0.4, ease: 'power2.out' }));
    return tween;
  });
  pauseOffscreen(ScrollTrigger, root, tweens);
  return tweens;
}

/** An endless loop that nobody can see should not run: pause `anims` while `el` is outside the viewport. */
function pauseOffscreen(ScrollTrigger, el, anims) {
  if (!el || !anims.length) return;
  const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (self) => anims.forEach((a) => a.paused(!self.isActive)) });
  anims.forEach((a) => a.paused(!st.isActive));
}

/** Scroll-scrubbed blur-to-sharp word reveal ([data-scrub-words]). */
function scrubWords({ gsap, SplitText, tier, lenis }, heading, { start = 'top 82%', end = 'bottom 45%' } = {}) {
  const split = SplitText.create(heading, { type: 'words', wordsClass: 'sw' });
  const useBlur = tier === 'high'; // a 5px blur is plenty to soften the reveal and keeps every word's filter cheap
  const words = split.words;
  const accentWords = words.filter((w) => w.closest('em, .accent'));
  const accentColor = heading.closest('.collab') ? '#5E17EB' : ACCENT;
  if (accentWords.length) gsap.set(accentWords, { color: '#6b6485' });
  const tl = gsap.timeline({ scrollTrigger: { trigger: heading, start, end, scrub: scrubFor(lenis) } });
  tl.fromTo(words,
    { opacity: 0.15, filter: useBlur ? 'blur(5px)' : 'none' },
    { opacity: 1, filter: useBlur ? 'blur(0px)' : 'none', stagger: 0.08, ease: 'none', duration: 0.6 }, 0);
  if (accentWords.length) tl.to(accentWords, { color: accentColor, stagger: 0.08, ease: 'none', duration: 0.6 }, '>-0.5');
  return split;
}

function countUp(gsap, el, { duration = 1.6, delay = 0 } = {}) {
  const target = Number(el.dataset.count) || 0;
  const obj = { v: 0 };
  el.textContent = '0';
  return gsap.to(obj, { v: target, duration, delay, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } });
}

/* ====================================================== GLOBAL MODULES == */

/** Masked line reveal for every heading with [data-split="lines"]. */
export function initHeadings({ gsap, SplitText, reduced }) {
  const els = document.querySelectorAll('[data-split="lines"]');
  if (reduced) {
    els.forEach((el) => gsap.from(el, { opacity: 0, duration: 0.4, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    return;
  }
  const splits = [...els].map((el) =>
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }),
    }));
  return () => splits.forEach((s) => s.revert());
}

/** Custom cursor — dot + lagging glass ring with contextual labels. */
const CURSOR_STYLES = ['comet', 'block', 'target', 'coin'];
export function initCursor({ gsap, on, reduced, tier }) {
  if (reduced || tier === 'low' || !isFine()) return;
  const root = document.querySelector('.cursor');
  if (!root) return;
  const html = document.documentElement;
  // style: config default, overridden by ?cursor=… (remembered for the session so you can browse with it)
  let style = CONFIG.cursor?.style;
  try {
    const q = new URLSearchParams(location.search).get('cursor');
    if (CURSOR_STYLES.includes(q)) sessionStorage.setItem('lda-cursor', q);
    const saved = sessionStorage.getItem('lda-cursor');
    if (CURSOR_STYLES.includes(saved)) style = saved;
  } catch { /* storage unavailable: keep the configured style */ }
  if (!CURSOR_STYLES.includes(style)) style = 'comet';
  html.dataset.cursorStyle = style;
  html.classList.add('has-cursor');
  const comet = style === 'comet';

  const dot = root.querySelector('.cursor__dot');
  const follow = root.querySelector('.cursor__follow');
  const shape = root.querySelector('.cursor__shape');
  const label = root.querySelector('.cursor__label');
  const canvas = root.querySelector('.cursor__canvas');
  let kick = () => {};   // comet: wake the draw loop
  let dead = false;

  // ---- shared: what is under the pointer decides the state (rest / link / label) ----
  const setLabel = (text) => {
    if (label.dataset.text === text) return;
    label.dataset.text = text;
    if (!comet) { label.textContent = text; return; }
    label.replaceChildren(...[...text].map((ch, i) => { // letters rise in one by one
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.transitionDelay = `${i * 35}ms`;
      return s;
    }));
  };
  on(document, 'pointerover', (e) => {
    const labelled = e.target.closest('[data-cursor]');   // something to View / Read / Play / Download
    const interactive = e.target.closest('a, button, [role="button"], label, summary');
    root.classList.toggle('is-hidden', !!e.target.closest('input:not([type="checkbox"]):not([type="radio"]), textarea, select'));
    if (labelled) setLabel(labelled.dataset.cursor);
    root.classList.toggle('is-label', !!labelled);
    root.classList.toggle('is-link', !labelled && !!interactive);
    kick();
  });
  on(document, 'pointerup', () => root.classList.remove('is-down'));

  if (comet) {
    // ---- COMET: a short tapered trail (violet to coral), a coral ring over links, a lettered pill over viewable things, sparks on click ----
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const TAU = Math.PI * 2;
    let W = 0; let H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`; // same box as clientX/clientY, scrollbar included
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    on(window, 'resize', resize);
    const m = { x: -99, y: -99 };      // the real mouse
    const head = { x: -99, y: -99 };   // the comet's head, eased toward the mouse
    let pts = []; let sparks = []; let inside = false; let running = false;
    const modeOf = () => (root.classList.contains('is-label') ? 'view' : root.classList.contains('is-link') ? 'link' : 'rest');

    const frame = (now) => {
      if (dead) return;
      const mode = modeOf();
      head.x += (m.x - head.x) * 0.4;
      head.y += (m.y - head.y) * 0.4;
      const last = pts[pts.length - 1];
      if (inside && mode !== 'view' && (!last || Math.hypot(head.x - last.x, head.y - last.y) > 0.6)) pts.push({ x: head.x, y: head.y, t: now });
      const life = mode === 'view' ? 120 : 420;
      while (pts.length && now - pts[0].t > life) pts.shift();

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]; const b = pts[i];
        const age = Math.min((now - b.t) / life, 1);
        ctx.strokeStyle = `rgba(${Math.round(123 + 132 * age)},${Math.round(63 + 43 * age)},${Math.round(242 - 181 * age)},${1 - age})`;
        ctx.lineWidth = (1 - age) * 5 + 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (inside && mode === 'rest') {
        ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(11,7,20,.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(head.x, head.y, 3.5, 0, TAU); ctx.fill(); ctx.stroke();
      } else if (inside && mode === 'link') {
        ctx.strokeStyle = '#ff6a3d'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(head.x, head.y, 9 + Math.sin(now / 180) * 1.5, 0, TAU); ctx.stroke();
        ctx.fillStyle = '#ff6a3d';
        ctx.beginPath(); ctx.arc(head.x, head.y, 2.5, 0, TAU); ctx.fill();
      }
      for (let j = sparks.length - 1; j >= 0; j--) {
        const s = sparks[j]; const age = (now - s.t) / 520;
        if (age >= 1) { sparks.splice(j, 1); continue; }
        s.x += s.vx; s.y += s.vy; s.vx *= 0.94; s.vy *= 0.94;
        ctx.fillStyle = `rgba(255,106,61,${1 - age})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2.2 * (1 - age) + 0.4, 0, TAU); ctx.fill();
      }
      follow.style.transform = `translate(${head.x}px, ${head.y}px)`;
      follow.style.opacity = inside ? 1 : 0;

      // sleep once nothing is moving, so an idle mouse costs nothing
      running = pts.length > 0 || sparks.length > 0 || mode === 'link' || Math.hypot(m.x - head.x, m.y - head.y) > 0.2;
      if (running) requestAnimationFrame(frame);
    };
    kick = () => { if (!running && !dead) { running = true; requestAnimationFrame(frame); } };

    on(window, 'pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      m.x = e.clientX; m.y = e.clientY;
      if (!inside) { inside = true; head.x = m.x; head.y = m.y; }
      kick();
    });
    on(document, 'pointerleave', () => { inside = false; root.classList.remove('is-link', 'is-label'); kick(); });
    on(document, 'pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      root.classList.add('is-down');
      const t = performance.now();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        sparks.push({ x: head.x, y: head.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, t });
      }
      kick();
    });
    return () => { dead = true; html.classList.remove('has-cursor'); delete html.dataset.cursorStyle; };
  }

  // ---- BLOCK / TARGET / COIN: a pin-point dot plus a lagging shape ----
  gsap.set([dot, follow], { opacity: 0 });
  const lag = style === 'coin' ? 0.28 : 0.45;
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
  const fx = gsap.quickTo(follow, 'x', { duration: lag, ease: 'power3' });
  const fy = gsap.quickTo(follow, 'y', { duration: lag, ease: 'power3' });
  let shown = false;
  let tiltTimer;
  on(window, 'pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!shown) { shown = true; gsap.to([dot, follow], { opacity: 1, duration: 0.2 }); }
    dx(e.clientX); dy(e.clientY); fx(e.clientX); fy(e.clientY);
    if (style === 'coin') { // the coin tilts with the sweep of the mouse
      shape.style.setProperty('--tilt', `${gsap.utils.clamp(-55, 55, e.movementX * 1.6)}deg`);
      clearTimeout(tiltTimer);
      tiltTimer = setTimeout(() => shape.style.setProperty('--tilt', '0deg'), 90);
    }
  });
  on(document, 'pointerleave', () => { shown = false; gsap.to([dot, follow], { opacity: 0, duration: 0.2 }); });
  on(document, 'pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    root.classList.add('is-down');
    if (style === 'coin') { shape.classList.remove('is-spin'); void shape.offsetWidth; shape.classList.add('is-spin'); }
  });
  on(shape, 'animationend', () => shape.classList.remove('is-spin'));
  return () => { html.classList.remove('has-cursor'); delete html.dataset.cursorStyle; };
}

/** Magnetic primary buttons (±8px), fine pointers only. */
export function initMagnetic({ gsap, on, reduced, tier }) {
  if (reduced || tier === 'low' || !isFine()) return;
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
    on(btn, 'pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo(gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.3));
      yTo(gsap.utils.clamp(-8, 8, (e.clientY - (r.top + r.height / 2)) * 0.3));
    });
    on(btn, 'pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'power3.out', overwrite: 'auto' }));
  });
}

/** Muted videos autoplay only while in view. */
export function initInViewVideo() {
  const vids = document.querySelectorAll('video[data-inview-play], .hero video');
  if (!vids.length) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { threshold: 0.25 });
  vids.forEach((v) => { v.muted = true; io.observe(v); });
  return () => io.disconnect();
}

/** Program pages: sticky glass "Enroll" bar on mobile. */
export function initEnrollBar({ gsap, ScrollTrigger }) {
  const bar = document.querySelector('[data-enroll-bar]');
  if (!bar) return;
  const hero = document.querySelector('.page-hero');
  const form = document.getElementById('enquire');
  const show = (v) => gsap.to(bar, { yPercent: v ? 0 : 140, duration: v ? 0.35 : 0.25, ease: v ? 'power3.out' : 'power2.in', overwrite: true });
  gsap.set(bar, { yPercent: 140 });
  ScrollTrigger.create({ trigger: hero, start: 'bottom top', endTrigger: form, end: 'top bottom', onToggle: (s) => show(s.isActive) });
}

/* ========================================================= NAVBAR (5) == */
export function initNavbar({ el, gsap, ScrollTrigger, Flip, on, reduced, lenis }) {
  const bar = el.querySelector('.nav__bar');
  const links = [...el.querySelectorAll('.nav__link')];
  const burger = el.querySelector('.nav__burger');
  const menu = document.getElementById('menu');
  let menuOpen = false;

  /* Hide on scroll down, show on scroll up; denser glass after 50px.
     onUpdate fires on every scroll tick, so only act when the state actually flips. Re-creating the tween on
     each tick restarted it from rest every frame, which made the bar stall instead of gliding. */
  let hidden = false;
  let scrolled = false;
  const slide = (hide) => {
    hidden = hide;
    gsap.to(el, { yPercent: hide ? -160 : 0, duration: hide ? 0.3 : 0.45, ease: hide ? 'power2.in' : 'power3.out', overwrite: true });
  };
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if ((y > 50) !== scrolled) { scrolled = y > 50; el.classList.toggle('is-scrolled', scrolled); }
      if (menuOpen) return;
      const hide = self.direction === 1 && y > 240;
      if (hide !== hidden) slide(hide);
    },
  });
  // Keyboard users: always reveal the nav when focus enters it.
  on(el, 'focusin', () => { hidden = false; gsap.to(el, { yPercent: 0, duration: 0.3, overwrite: true }); });

  /* Violet underline slides between links (Flip) */
  let underline = el.querySelector('.nav__underline');
  const home = underline?.parentElement || null;
  if (!underline) {
    underline = document.createElement('span');
    underline.className = 'nav__underline';
    underline.setAttribute('aria-hidden', 'true');
    gsap.set(underline, { opacity: 0 });
  }
  const moveTo = (link) => {
    if (!link || underline.parentElement === link) return;
    const state = Flip.getState(underline);
    link.appendChild(underline);
    if (reduced || !state.elementStates.length || !underline.isConnected) return;
    Flip.from(state, { duration: 0.4, ease: 'power3.inOut' });
  };
  links.forEach((a) => {
    on(a, 'pointerenter', () => { moveTo(a); gsap.to(underline, { opacity: 1, duration: 0.2 }); });
    on(a, 'focus', () => { moveTo(a); gsap.to(underline, { opacity: 1, duration: 0.2 }); });
  });
  on(el.querySelector('.nav__links'), 'pointerleave', () => {
    if (home) moveTo(home); else gsap.to(underline, { opacity: 0, duration: 0.2 });
  });

  /* Full-screen menu: clip-path circle from the burger */
  const lines = menu ? menu.querySelectorAll('.menu__link span') : [];
  const foot = menu?.querySelector('.menu__foot');
  const origin = () => {
    const r = burger.getBoundingClientRect();
    return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  };
  const focusables = () => [...menu.querySelectorAll('a, button'), burger];
  let tl;
  const openMenu = () => {
    menuOpen = true;
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    lenis?.stop();
    document.dispatchEvent(new CustomEvent('lda:menu', { detail: { open: true } }));
    tl?.kill();
    if (reduced) { gsap.set(menu, { clipPath: 'none', opacity: 0 }); gsap.to(menu, { opacity: 1, duration: 0.3 }); }
    else {
      tl = gsap.timeline()
        .fromTo(menu, { clipPath: `circle(0% at ${origin()})` }, { clipPath: `circle(150% at ${origin()})`, duration: 0.8, ease: 'power3.inOut' })
        .fromTo(lines, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.25)
        .fromTo(foot, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.5);
    }
    menu.querySelector('.menu__link')?.focus({ preventScroll: true });
  };
  const closeMenu = (returnFocus = true) => {
    if (!menuOpen) return;
    menuOpen = false;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    tl?.kill();
    const done = () => { menu.hidden = true; lenis?.start(); document.dispatchEvent(new CustomEvent('lda:menu', { detail: { open: false } })); };
    if (reduced) gsap.to(menu, { opacity: 0, duration: 0.2, onComplete: done });
    else gsap.to(menu, { clipPath: `circle(0% at ${origin()})`, duration: 0.5, ease: 'power3.inOut', onComplete: done });
    if (returnFocus) burger.focus();
  };
  on(burger, 'click', () => (menuOpen ? closeMenu() : openMenu()));
  on(document, 'keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') { // focus trap
      const f = focusables(); const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  menu && on(menu.querySelectorAll('a'), 'click', () => closeMenu(false));

  /* Entrance + floating actions (after the hero) */
  const fab = document.querySelector('[data-fab]');
  if (!reduced) gsap.set(bar, { y: -24, opacity: 0 });
  return {
    play: () => {
      if (!reduced) gsap.to(bar, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.2, clearProps: 'transform' });
      if (fab) gsap.to(fab, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: reduced ? 0 : 1.6 });
    },
  };
}

/* ========================================================== HERO (6.1) == */
export function initHero({ el, gsap, SplitText, mm, reduced, tier }) {
  // The aurora / floor / cue loops are pure CSS. Pause them once the hero has scrolled out of view.
  const away = new IntersectionObserver(([e]) => el.classList.toggle('is-away', !e.isIntersecting));
  away.observe(el);
  const q = gsap.utils.selector(el);
  const [badge] = q('[data-hero="badge"]');
  const [pill] = q('[data-hero="pill"]');
  const [title] = q('[data-hero="title"]');
  const body = q('[data-hero="body"]');
  const ctas = q('[data-hero="ctas"]');
  const [cue] = q('[data-hero="cue"]');
  const [scene] = q('.hero__scene');
  const [spot] = q('.hero__spot');
  const [center] = q('.hero__center');
  const counts = q('[data-count]');
  const items = q('.stat-pill__item');

  // Mobile stat pill: two stats at a time.
  items.forEach((it, i) => it.classList.toggle('is-on', i < 2));
  mm.add('(max-width: 599px)', () => {
    if (reduced) return;
    let page = 0;
    const id = setInterval(() => {
      gsap.to(pill, { opacity: 0, duration: 0.2, onComplete: () => {
        page = 1 - page;
        items.forEach((it, i) => it.classList.toggle('is-on', Math.floor(i / 2) === page));
        gsap.to(pill, { opacity: 1, duration: 0.25 });
      } });
    }, 3200);
    return () => clearInterval(id);
  });

  // Reduced motion: everything rests; just a plain fade-in, nothing stays hidden.
  if (reduced) {
    const all = [scene, badge, title, ...body, ...ctas, pill, cue];
    gsap.set(all, { opacity: 0 });
    return { play: () => gsap.to(all, { opacity: 1, duration: 0.4, stagger: 0.04 }), cleanup: () => away.disconnect() };
  }

  const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
  gsap.set(split.lines, { yPercent: 110 });
  gsap.set(badge, { y: -12, opacity: 0 });
  gsap.set([...body, ...ctas, pill], { y: 16, opacity: 0 });
  gsap.set(scene, { opacity: 0 });
  gsap.set(cue, { opacity: 0 });

  // Entrance: ease-out only. Scene first, then the copy top to bottom.
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .to(scene, { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
    .to(badge, { y: 0, opacity: 1, duration: 0.8 }, 0.1)
    .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.2)
    .to([...body, ...ctas], { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 0.85)
    .to(pill, { y: 0, opacity: 1, duration: 0.8 }, 1.15)
    .add(() => counts.forEach((c) => countUp(gsap, c, { duration: 1.4 })), 1.15)
    .to(cue, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.8);

  // Pointer: a soft spotlight follows the cursor (desktop, fine pointer, not low tier).
  mm.add(`${DESKTOP} and ${FINE}`, () => {
    if (tier === 'low') return;
    gsap.set(spot, { xPercent: -50, yPercent: -50 });
    const sx = gsap.quickTo(spot, 'x', { duration: 0.6, ease: 'power3' });
    const sy = gsap.quickTo(spot, 'y', { duration: 0.6, ease: 'power3' });
    let lit = false;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      sx(e.clientX - r.left); sy(e.clientY - r.top);
      if (!lit) { lit = true; gsap.to(spot, { opacity: 1, duration: 0.8, ease: 'power2.out' }); }
    };
    const leave = () => { lit = false; gsap.to(spot, { opacity: 0, duration: 0.6, ease: 'power2.out' }); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  });

  // Scroll: the scene recedes slower than the page; the copy only fades (no text parallax).
  if (tier !== 'low') {
    gsap.to(center, { opacity: 0.15, ease: 'none', scrollTrigger: { trigger: el, start: '40% top', end: 'bottom top', scrub: true } });
    mm.add(DESKTOP, () => {
      gsap.to(scene, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  return { play: () => tl.play(), cleanup: () => { split.revert(); away.disconnect(); } };
}

/* Inner-page hero (About, Placements, Blogs, Programs, Posts) */
export function initPageHero({ el, gsap, SplitText, reduced }) {
  const title = el.querySelector('[data-hero="title"]');
  const rest = el.querySelectorAll('.crumbs, .eyebrow, [data-hero="body"], [data-hero="ctas"], .stat-row, .post__meta');
  if (reduced) {
    gsap.set([title, ...rest], { opacity: 0 });
    return { play: () => gsap.to([title, ...rest], { opacity: 1, duration: 0.4, stagger: 0.04 }) };
  }
  const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
  gsap.set(split.lines, { yPercent: 110 });
  gsap.set(rest, { y: 16, opacity: 0 });
  const tl = gsap.timeline({ paused: true })
    .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' })
    .to(rest, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'expo.out' }, 0.15);
  return { play: () => tl.play(), cleanup: () => split.revert() };
}

/* ===================================================== ABOUT (6.2) ===== */
export function initAbout(ctx) {
  const { el, gsap, reduced, fade } = ctx;
  const heading = el.querySelector('[data-scrub-words]');
  const paras = el.querySelectorAll('.about__body p');
  const pillars = el.querySelectorAll('.pillar');
  const divider = el.querySelector('[data-divider]');
  if (reduced) { fade([heading, ...paras, ...pillars, divider].filter(Boolean)); return; }
  const split = heading && scrubWords(ctx, heading);
  gsap.from(paras, { y: 24, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: paras[0], start: 'top 88%', once: true } });
  if (pillars.length) gsap.from(pillars, { y: 32, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: pillars[0], start: 'top 88%', once: true } });
  if (divider) gsap.fromTo(divider, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: divider, start: 'top 95%', end: 'top 70%', scrub: true } });
  return () => split?.revert();
}

/* ===================================================== MODES (6.3) ===== */
export function initModes({ el, gsap, ScrollTrigger, reduced, fade }) {
  const tiles = el.querySelectorAll('.mode');
  if (reduced) { fade(tiles); return; }
  const shapes = el.querySelectorAll('.icon--draw path, .icon--draw rect, .icon--draw circle');
  shapes.forEach((s) => { const len = s.getTotalLength?.() || 60; gsap.set(s, { strokeDasharray: len, strokeDashoffset: len }); });
  gsap.set(tiles, { rotationX: 40, y: 40, opacity: 0, transformOrigin: '50% 100%', transformPerspective: 1000 });
  ScrollTrigger.batch(tiles, {
    start: 'top 90%', once: true,
    onEnter: (batch) => {
      gsap.to(batch, { rotationX: 0, y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.1 });
      batch.forEach((tile, i) => gsap.to(tile.querySelectorAll('.icon--draw *'), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.25 + i * 0.1 }));
    },
  });
}

/* ============================================ CERT MARQUEE (6.4) ======= */
export function initCertMarquee(ctx) {
  const { el, gsap, reduced, fade } = ctx;
  const root = el.querySelector('[data-marquee]');
  if (reduced) { fade(root); return; }
  marquee(ctx, root, { speed: 45 });
  gsap.from(root, { opacity: 0, y: 24, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 90%', once: true } });
}

/* ========================================== COLLAB light panel (6.5) == */
export function initCollab({ el, gsap, mm, reduced, fade }) {
  const panel = el.querySelector('.collab__panel');
  const copy = el.querySelectorAll('.collab__body, .collab__logo, .collab__photo');
  if (reduced) { fade(copy); return; }
  // transform only: animating border-radius as well repainted this large light panel on every scroll frame
  gsap.fromTo(panel, { scale: 0.92 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true },
  });
  const prev = el.previousElementSibling;
  if (prev?.matches('[data-stack-prev]')) {
    mm.add('(min-width: 768px)', () => {
      gsap.to(prev, { scale: 0.95, opacity: 0.45, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: true } });
    });
  }
  gsap.from(copy, { y: 32, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: panel, start: 'top 70%', once: true } });
}

/* ================================================= PROGRAMS (6.6) ====== */
/* Also used for any card grid: placements, related posts. */
export function initPrograms({ el, gsap, ScrollTrigger, reduced, fade }) {
  const cards = el.querySelectorAll('.program, .placed, .placed-card, .placed-poster, .life__item, .post-card');
  if (!cards.length) return;
  if (reduced) { fade(cards); return; }
  gsap.set(cards, { y: 40, opacity: 0 });
  ScrollTrigger.batch(cards, {
    start: 'top 92%', once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' }),
  });
}

/* ==================================================== TOOLS (6.7) ====== */
export function initTools({ el, gsap, ScrollTrigger, reduced, fade }) {
  const tiles = el.querySelectorAll('.tool');
  if (reduced) { fade(tiles); return; }
  gsap.set(tiles, { y: 24, opacity: 0 });
  ScrollTrigger.batch(tiles, {
    start: 'top 94%', once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.03, clearProps: 'transform' }),
  });
}

/* =================================================== WHY LDA (6.8) ===== */
export function initWhyLDA({ el, gsap, ScrollTrigger, mm, reduced, fade, lenis }) {
  const big = el.querySelector('[data-why-big]');
  const pre = el.querySelectorAll('.why__pre, .why__post');
  const cards = el.querySelectorAll('.why-card');
  const track = el.querySelector('.why__marquee-track');
  if (reduced) { fade([...pre, big, ...cards]); return; }

  gsap.fromTo(big, { letterSpacing: '-0.09em', scale: 0.8 }, {
    letterSpacing: '-0.02em', scale: 1, ease: 'none',
    scrollTrigger: { trigger: big, start: 'top 90%', end: 'center 45%', scrub: scrubFor(lenis) },
  });
  gsap.to(big, { '--glow': '42px', duration: 0.7, ease: 'power2.out', yoyo: true, repeat: 1, scrollTrigger: { trigger: big, start: 'center 55%', once: true } });
  gsap.from(pre, { opacity: 0, y: 16, duration: 0.8, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: big, start: 'top 85%', once: true } });
  const drift = gsap.to(track, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 });
  pauseOffscreen(ScrollTrigger, el, [drift]); // the outlined word band only runs while the section is on screen

  mm.add({ d: '(min-width: 768px)', m: MOBILE }, (c) => {
    const dist = c.conditions.d ? 90 : 32;
    cards.forEach((card, i) => {
      gsap.from(card, { x: i % 2 ? dist : -dist, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
    });
  });
}

/* ============================================= TESTIMONIALS (6.9) ====== */
/* "Hear from our learners": a row of video reels. Tap a reel to play it with sound; only one plays at a time. */
export function initTestimonials(ctx) {
  const { el, gsap, ScrollTrigger, on, reduced, fade } = ctx;
  const title = el.querySelector('[data-scrub-words]');
  const cards = [...el.querySelectorAll('.reel-card')];
  const videos = cards.map((c) => c.querySelector('video'));
  const stopOthers = (keep) => videos.forEach((v) => { if (v !== keep && !v.paused) v.pause(); });
  cards.forEach((card, i) => {
    const v = videos[i];
    const btn = card.querySelector('[data-reel-play]');
    const bar = card.querySelector('.reel-card__bar i');
    const sync = () => {
      const playing = !v.paused;
      card.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} learner story ${i + 1}`);
    };
    on(v, 'timeupdate', () => { bar.style.transform = `scaleX(${v.duration ? v.currentTime / v.duration : 0})`; });
    on(v, 'play', () => { stopOthers(v); sync(); });
    on(v, 'pause', sync);
    on(card, 'click', () => { if (v.paused) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); });
  });
  // pause when scrolled out of view
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) e.target.pause(); }), { threshold: 0.1 });
  videos.forEach((v) => io.observe(v));
  if (reduced) { fade([title, ...cards]); return () => io.disconnect(); }
  const split = scrubWords(ctx, title, { start: 'top 85%', end: 'bottom 55%' });
  gsap.set(cards, { y: 40, opacity: 0 });
  ScrollTrigger.batch(cards, { start: 'top 95%', once: true, onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }) });
  return () => { split?.revert(); io.disconnect(); };
}

/* ======================================================= FAQ (6.10) ==== */
/* Also drives the program-page syllabus accordion. */
export function initFAQ({ el, gsap, Engine, on, reduced }) {
  el.querySelectorAll('[data-accordion]').forEach((acc) => {
    const items = [...acc.querySelectorAll('.acc__item')];
    const close = (btn, panel) => {
      btn.setAttribute('aria-expanded', 'false');
      if (reduced) { panel.classList.remove('is-open'); return; }
      gsap.to(panel, { height: 0, duration: 0.3, ease: 'power3.inOut', onComplete: () => { panel.classList.remove('is-open'); Engine.refresh(); } });
    };
    const open = (btn, panel) => {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      if (reduced) return;
      gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: 0.45, ease: 'power3.out', onComplete: () => Engine.refresh() });
    };
    items.forEach((item) => {
      const btn = item.querySelector('.acc__btn');
      const panel = item.querySelector('.acc__panel');
      on(btn, 'click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        items.forEach((other) => {
          const b = other.querySelector('.acc__btn');
          if (b !== btn && b.getAttribute('aria-expanded') === 'true') close(b, other.querySelector('.acc__panel'));
        });
        isOpen ? close(btn, panel) : open(btn, panel);
      });
    });
    if (!reduced) gsap.from(items, { y: 24, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: acc, start: 'top 88%', once: true } });
  });
}

/* ================================================== LEAD FORM (6.11) === */
export function initForm({ el, gsap, on, reduced }) {
  const form = el.querySelector('form');
  if (!form) return;
  const btn = form.querySelector('.form__btn');
  const status = form.querySelector('.form__status');
  const check = form.querySelector('.form__check path');
  const fields = form.querySelectorAll('.field, .choices, .form__submit');
  if (!reduced) {
    gsap.from(fields, { y: 20, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: form, start: 'top 85%', once: true } });
  }

  const endpoint = CONFIG.integrations.formEndpoint;
  const hasEndpoint = endpoint && !/\{\{/.test(endpoint);

  const toWhatsApp = (data) => {
    const lines = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    const text = `Hi LDA, ${form.dataset.form === 'hire' ? 'we would like to hire from you' : 'I would like a free career counselling call'}.\n${lines.join('\n')}`;
    window.open(`${CONFIG.contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };
  const setState = (s) => { form.dataset.state = s; btn.disabled = s === 'loading' || s === 'success'; };
  const success = (msg) => {
    setState('success');
    status.classList.remove('is-error');
    status.textContent = msg;
    if (!reduced) {
      const w = btn.offsetWidth;
      gsap.fromTo(btn, { width: w }, { width: btn.offsetHeight, duration: 0.45, ease: 'power3.inOut', borderRadius: 999 });
      gsap.to(check, { strokeDashoffset: 0, duration: 0.5, delay: 0.35, ease: 'power2.out' });
    } else gsap.set(check, { strokeDashoffset: 0 });
  };

  on(form, 'submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.classList.add('is-error');
      const bad = form.querySelector(':invalid');
      status.textContent = form.dataset.form === 'hire'
        ? 'Please fill in your company name, contact number and the position you are hiring for.'
        : bad?.type === 'radio' ? 'Please choose what represents you.' : 'Please fill in your name and a valid phone number.';
      bad?.focus();
      return;
    }
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.phone = `${data.countryCode || ''} ${data.phone || ''}`.trim();
    delete data.countryCode;
    data.page = location.pathname;

    if (!hasEndpoint) { // {{FORM_ENDPOINT}} not set yet → WhatsApp fallback (keeps the click's user gesture)
      toWhatsApp(data);
      success('Thanks! WhatsApp is open with your details — hit send and we will call you back.');
      return;
    }
    setState('loading');
    status.textContent = 'Sending…';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(res.status);
      success('Thanks! A mentor will call you within one working day.');
    } catch {
      setState('idle');
      status.classList.add('is-error');
      status.innerHTML = `Couldn’t send that. <a href="${CONFIG.contact.whatsapp}" target="_blank" rel="noopener">Message us on WhatsApp</a> or call ${CONFIG.contact.phone}.`;
    }
  });
}

/* ================================================ FOUNDER (6.12) ======= */
export function initFounder({ el, gsap, reduced, fade }) {
  const photo = el.querySelector('[data-wipe]');
  const copy = el.querySelectorAll('.founder__copy > *:not(h2)');
  if (reduced) { fade([photo, ...copy]); return; }
  gsap.fromTo(photo, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: photo, start: 'top 80%', once: true } });
  gsap.from(photo.firstElementChild, { scale: 1.2, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: photo, start: 'top 80%', once: true } });
  gsap.from(copy, { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: photo, start: 'top 70%', once: true } });
}

/* ================================================== FOOTER (6.13) ====== */
export function initFooter({ el, gsap, reduced, fade }) {
  const chars = el.querySelectorAll('.footer__mark .ch');
  const cols = el.querySelectorAll('.footer__grid > *');
  const unloadMap = loadMapWhenNear(el);
  if (reduced) { fade([...cols, el.querySelector('.footer__mark')]); return unloadMap; }
  gsap.from(cols, { y: 24, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  gsap.from(chars, { yPercent: 100, opacity: 0, duration: 1, stagger: 0.035, ease: 'expo.out', scrollTrigger: { trigger: el.querySelector('.footer__mark'), start: 'top 98%', once: true } });
  return unloadMap;
}

/** The footer map is a Google Maps embed — a heavy third-party page whose start-up dropped 4–6 frames when it
    landed mid-scroll (native lazy loading starts it ~1250px early). Load it only when the map is actually in
    view AND the visitor has paused scrolling for a moment, so nothing else is moving while it starts. */
function loadMapWhenNear(footer) {
  const frame = footer.querySelector('iframe[data-src]');
  if (!frame) return () => {};
  let timer = 0;
  let inView = false;
  const settle = () => { clearTimeout(timer); if (inView) timer = setTimeout(load, 450); };
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; settle(); });
  const off = () => { io.disconnect(); window.removeEventListener('scroll', settle); clearTimeout(timer); };
  function load() { off(); frame.src = frame.dataset.src; frame.removeAttribute('data-src'); }
  window.addEventListener('scroll', settle, { passive: true });
  io.observe(frame);
  return off;
}

/* ========================================================= COUNTERS ===== */
export function initCounters({ el, gsap, ScrollTrigger }) {
  el.querySelectorAll('[data-count]').forEach((n) => {
    ScrollTrigger.create({ trigger: n, start: 'top 92%', once: true, onEnter: () => countUp(gsap, n) });
  });
}

/* ================================================= TIMELINE (About) ===== */
export function initTimeline({ el, gsap, reduced, fade }) {
  const line = el.querySelector('.timeline__line i');
  const items = el.querySelectorAll('.timeline__item');
  if (reduced) { fade(items); return; }
  gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.querySelector('.timeline'), start: 'top 70%', end: 'bottom 60%', scrub: true } });
  items.forEach((item) => {
    gsap.from(item, { x: 24, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 80%', once: true } });
    gsap.to(item.querySelector('.timeline__dot'), { backgroundColor: '#7B3FF2', scale: 1.15, duration: 0.3, scrollTrigger: { trigger: item, start: 'top 62%', toggleActions: 'play none none reverse' } });
  });
}

/* ============================================== BLOG GRID (Blogs) ======= */
export function initBlogGrid({ el, gsap, Flip, ScrollTrigger, Engine, on, reduced }) {
  const cards = [...el.querySelectorAll('.post-card')];
  const buttons = [...el.querySelectorAll('[data-filter]')];
  const search = el.querySelector('[data-blog-search]');
  const empty = el.querySelector('[data-blog-empty]');
  const params = new URLSearchParams(location.search);
  let cat = 'All';
  let term = (params.get('q') || '').trim().toLowerCase();
  if (search && term) search.value = params.get('q');

  const apply = (animate = true) => {
    const state = Flip.getState(cards);
    let shown = 0;
    cards.forEach((c) => {
      const ok = (cat === 'All' || c.dataset.category === cat) && (!term || c.dataset.title.includes(term) || c.textContent.toLowerCase().includes(term));
      c.classList.toggle('is-hidden', !ok);
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    if (!animate || reduced) return;
    Flip.from(state, {
      duration: 0.6, ease: 'power3.inOut', absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.95, duration: 0.25, ease: 'power2.in' }),
      onComplete: () => Engine.refresh(),
    });
  };

  buttons.forEach((b) => on(b, 'click', () => {
    cat = b.dataset.filter;
    buttons.forEach((x) => { const active = x === b; x.classList.toggle('is-active', active); x.setAttribute('aria-pressed', String(active)); });
    apply();
  }));
  let t;
  on(search, 'input', () => { clearTimeout(t); t = setTimeout(() => { term = search.value.trim().toLowerCase(); apply(); }, 160); });

  apply(false);
  if (!reduced) {
    gsap.set(cards, { y: 40, opacity: 0 });
    ScrollTrigger.batch(cards, { start: 'top 95%', once: true, onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out', clearProps: 'transform' }) });
  }
}

/* ============================================== BLOG POST template ====== */
export function initPost({ el, gsap, ScrollTrigger, on, reduced }) {
  const bar = document.querySelector('[data-read-progress]');
  const prose = el.querySelector('[data-prose]');
  const links = [...el.querySelectorAll('[data-toc-link]')];
  const cta = document.querySelector('[data-inline-cta]');

  // Reading progress (violet bar)
  if (bar && prose) {
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: prose, start: 'top 70%', end: 'bottom 70%', scrub: true } });
  }
  // Table of contents: highlight the section in view
  links.forEach((a) => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    ScrollTrigger.create({
      trigger: target, start: 'top 45%', endTrigger: target.nextElementSibling?.nextElementSibling || target, end: 'top 45%',
      onToggle: (s) => { if (s.isActive) links.forEach((l) => l.classList.toggle('is-active', l === a)); },
    });
  });
  // Inline Enroll CTA after 40% of the page
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('lda-cta-off') === '1'; } catch {}
  if (cta && !dismissed) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => {
        if (dismissed || s.progress < 0.4 || !cta.hidden) return;
        cta.hidden = false;
        if (!reduced) gsap.fromTo(cta, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
      },
    });
    on(cta.querySelector('[data-inline-cta-close]'), 'click', () => {
      dismissed = true;
      try { sessionStorage.setItem('lda-cta-off', '1'); } catch {}
      gsap.to(cta, { y: 24, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => { cta.hidden = true; } });
    });
  }
  // Copy link
  const copy = el.querySelector('[data-copy-link]');
  on(copy, 'click', async () => {
    try { await navigator.clipboard.writeText(location.href); copy.setAttribute('aria-label', 'Link copied'); copy.title = 'Link copied'; } catch {}
  });
  if (!reduced) gsap.from(el.querySelectorAll('.prose > *'), { y: 20, opacity: 0, duration: 0.8, stagger: 0.03, ease: 'expo.out', scrollTrigger: { trigger: prose, start: 'top 85%', once: true } });
}
