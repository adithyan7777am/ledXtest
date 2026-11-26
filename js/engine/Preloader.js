/* =============================================================================
   Preloader.js — three entry modes:
   'full'       first visit: logo stroke-draw → violet fill, real-progress
                counter 0→100, "Let's grow", two-layer curtain wipe up
   'fade'       repeat visit in this session: 300ms fade
   'transition' arriving from an internal link: glass curtain sweeps away

   Resolves when the hero timeline should start (slightly before the curtain
   finishes, so the two overlap instead of feeling sequential).
   ============================================================================= */
const { gsap } = window;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const VISITED = 'lda-visited';

function markVisited() { try { sessionStorage.setItem(VISITED, '1'); sessionStorage.removeItem('lda-pt'); } catch {} }

export function entryMode() {
  const h = document.documentElement;
  if (h.classList.contains('pt-in')) return 'transition';
  if (h.classList.contains('is-repeat')) return 'fade';
  return 'full';
}

export const Preloader = {
  async run({ mode, loader, onReady, reduced }) {
    markVisited();
    // Repeat visits / transitions never show the preloader — drop it from the DOM
    // so removing the html state classes later can't reveal it.
    if (mode !== 'full') document.getElementById('preloader')?.remove();
    if (mode === 'transition') return this.transitionIn(loader, onReady, reduced);
    if (mode === 'fade') return this.fadeIn(loader, onReady);
    return this.full(loader, onReady, reduced);
  },

  /* ---------------------------------------------------------------- full -- */
  async full(loader, onReady, reduced) {
    const root = document.getElementById('preloader');
    if (!root) { await loader.load(); await onReady(); return; }
    const glyphs = root.querySelectorAll('.logo__glyph');
    const dots = root.querySelectorAll('.logo__dot');
    const bar = root.querySelector('[data-pl-bar]');
    const barWrap = root.querySelector('.preloader__bar');
    const dark = root.querySelector('.preloader__layer--dark');
    const violet = root.querySelector('.preloader__layer--violet');

    // Counter follows REAL progress, smoothed through a proxy object.
    const proxy = { p: 0 };
    const render = () => {
      bar.style.transform = `scaleX(${proxy.p})`;
    };
    loader.onProgress((p) => gsap.to(proxy, { p: Math.max(p, proxy.p), duration: 0.6, ease: 'power2.out', onUpdate: render, overwrite: true }));

    // Logo: every piece rises / slides into place with a clean ease-out (no outlines), the violet blocks settle last.
    // glyphs: 0 L stem, 1 L foot, 2 D, 3 A.
    const intro = gsap.timeline();
    if (!reduced) {
      const dir = ['y', 'x', 'x', 'y'];                // stems and legs grow upward, wide pieces slide in from the left
      const at = [0, 0.1, 0.22, 0.4];
      glyphs.forEach((g, i) => {
        const from = dir[i] === 'y' ? { scaleY: 0, transformOrigin: '50% 100%' } : { scaleX: 0, transformOrigin: '0% 50%' };
        intro.fromTo(g, { opacity: 1, transformBox: 'fill-box', ...from }, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'expo.out' }, at[i]);
      });
      intro.fromTo(dots, { opacity: 0, scale: 0.5, transformBox: 'fill-box', transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.12 }, 0.85);
    } else {
      gsap.set([...glyphs, ...dots], { opacity: 1 });
    }

    await Promise.all([loader.load(), reduced ? Promise.resolve() : intro.then()]);
    await onReady(); // initialise eager modules (hero states) under the curtain

    await gsap.to(proxy, { p: 1, duration: 0.35, ease: 'power2.out', onUpdate: render, overwrite: true }).then();

    if (reduced) {
      await gsap.to(root, { opacity: 0, duration: 0.4 }).then();
      root.remove();
      return;
    }

    // fade the counter, then the two-layer curtain wipe.
    let release;
    const started = new Promise((r) => (release = r));
    gsap.timeline({ onComplete: () => root.remove() })
      .to(barWrap, { opacity: 0, duration: 0.3, ease: 'power2.out' })
      .to({}, { duration: 0.2 })
      .to(dark, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.0, ease: 'power4.inOut' })
      .to(violet, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.0, ease: 'power4.inOut' }, '<0.12')
      .add(release, '<0.45');
    return started;
  },

  /* ---------------------------------------------------------------- fade -- */
  async fadeIn(loader, onReady) {
    await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1000)]);
    loader.load(); // keep warming images in the background
    await onReady();
    gsap.to(document.body, { opacity: 1, duration: 0.3, ease: 'power1.out', clearProps: 'opacity' });
    document.documentElement.classList.remove('is-repeat');
  },

  /* ---------------------------------------------------------- transition -- */
  async transitionIn(loader, onReady, reduced) {
    const glass = document.querySelector('.pt-curtain__glass');
    await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1000)]);
    loader.load();
    await onReady();
    if (!glass || reduced) {
      document.documentElement.classList.remove('pt-in');
      return;
    }
    let release;
    const started = new Promise((r) => (release = r));
    gsap.timeline({ onComplete: () => document.documentElement.classList.remove('pt-in') })
      .to(glass, { xPercent: 101, duration: 0.8, ease: 'power3.inOut' })
      .add(release, 0.35);
    return started;
  },
};
