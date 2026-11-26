/* =============================================================================
   Engine.js — motion registry + lifecycle

   Engine.register('hero', initHero)
   <section data-module="hero" data-eager> … </section>

   Each module is `init(ctx)` and may return either a cleanup function or
   { play, cleanup }. It runs inside gsap.context() so every tween /
   ScrollTrigger it creates is reverted on destroy. ctx contains:
     el, gsap, ScrollTrigger, SplitText, Flip, mm (gsap.matchMedia),
     reduced, tier, lenis, Engine, on(target, type, fn, opts), fade(targets, opts)

   Eager modules ([data-eager]) are initialised under the preloader; their
   `play()` runs on Engine.start(). Every other module is initialised lazily
   by an IntersectionObserver (rootMargin 200px) as it approaches the viewport.
   ============================================================================= */
const { gsap, ScrollTrigger, SplitText, Flip } = window;

class MotionEngine {
  tier = 'high';
  reduced = false;
  lenis = null;
  started = false;
  #registry = new Map();
  #globals = [];
  #instances = [];
  #plays = [];
  #io = null;
  #refreshTimer = 0;
  #warmTimer = 0;
  #warming = false;
  #lastScroll = 0;

  register(name, init) { this.#registry.set(name, init); return this; }
  registerGlobal(init) { this.#globals.push(init); return this; }

  /* ------------------------------------------------------------- boot ---- */
  boot({ tier }) {
    gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
    const html = document.documentElement;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.setTier(tier);
    html.classList.toggle('reduced-motion', this.reduced);

    gsap.defaults({ ease: 'expo.out', duration: 1 });
    ScrollTrigger.config({ ignoreMobileResize: true });
    window.addEventListener('scroll', () => { this.#lastScroll = performance.now(); }, { passive: true });

    if (!this.reduced && this.tier !== 'low' && window.Lenis) this.#startLenis();

    // Refresh measurements once fonts are in (prevents trigger drift / CLS).
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('pagehide', () => this.destroy());
    // Restored from the back/forward cache after we tore down → rebuild cleanly.
    window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
    return this;
  }

  setTier(tier) {
    const html = document.documentElement;
    html.classList.remove('tier-high', 'tier-mid', 'tier-low');
    this.tier = tier;
    html.classList.add(`tier-${tier}`);
  }

  #startLenis() {
    const lenis = new window.Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    this.#raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(this.#raf);
    gsap.ticker.lagSmoothing(0);
    this.lenis = lenis;

    // Anchor links scroll smoothly with a navbar offset.
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href*="#"]');
      if (!a || !this.lenis) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
      const target = document.querySelector(decodeURIComponent(url.hash));
      if (!target) return;
      e.preventDefault();
      this.lenis.scrollTo(target, { offset: -(document.querySelector('.nav__bar')?.offsetHeight || 72) - 32 });
      history.pushState(null, '', url.hash);
    });
  }
  #raf = null;

  /** Turn smooth scrolling off (tier downgraded to 'low' after the FPS probe). */
  disableSmoothScroll() {
    if (this.#raf) gsap.ticker.remove(this.#raf);
    this.#raf = null;
    this.lenis?.destroy();
    this.lenis = null;
  }

  /* ------------------------------------------------------ module runner -- */
  #ctx(el) {
    const listeners = [];
    const mm = gsap.matchMedia();
    return {
      el, gsap, ScrollTrigger, SplitText, Flip, mm,
      Engine: this,
      reduced: this.reduced,
      tier: this.tier,
      lenis: this.lenis,
      on(target, type, fn, opts) {
        if (!target) return;
        const list = target.forEach ? target : [target];
        list.forEach((t) => { t.addEventListener(type, fn, opts); listeners.push(() => t.removeEventListener(type, fn, opts)); });
      },
      /** Reduced-motion / low-tier fallback: plain 0.4s opacity fade on enter. */
      fade(targets, { trigger = el, start = 'top 85%' } = {}) {
        return gsap.from(targets, { opacity: 0, duration: 0.4, ease: 'power1.out', stagger: 0.04, scrollTrigger: { trigger, start, once: true } });
      },
      _dispose() { listeners.forEach((off) => off()); mm.revert(); },
    };
  }

  #run(fn, el) {
    const ctx = this.#ctx(el);
    let result;
    const gctx = gsap.context(() => { result = fn(ctx); }, el || undefined);
    const cleanup = typeof result === 'function' ? result : result?.cleanup;
    if (result?.play) this.#plays.push(result.play);
    this.#instances.push(() => {
      try { cleanup?.(); } catch (err) { console.warn('[Engine] cleanup failed', err); }
      ctx._dispose();
      gctx.revert();
      if (el) el.__ldaInit = false;
    });
  }

  init(name, el) {
    const fn = this.#registry.get(name);
    if (!fn || el?.__ldaInit?.[name]) return;
    if (el) (el.__ldaInit ||= {})[name] = true;
    try { this.#run(fn, el); } catch (err) { console.error(`[Engine] module "${name}" failed`, err); }
    if (this.started && !this.#warming) this.#queueRefresh();
  }

  /** Called under the preloader: globals + eager modules (navbar, hero…). */
  prepare() {
    this.#globals.forEach((fn) => { try { this.#run(fn, null); } catch (err) { console.error('[Engine] global failed', err); } });
    document.querySelectorAll('[data-module][data-eager]').forEach((el) =>
      el.dataset.module.split(/\s+/).forEach((name) => this.init(name, el)));
  }

  /** Called when the curtain lifts: play eager timelines, start lazy observer. */
  start() {
    if (this.started) return;
    this.started = true;
    window.__ldaStarted = true;
    this.#plays.splice(0).forEach((play) => play());

    this.#io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.#io.unobserve(entry.target);
        entry.target.dataset.module.split(/\s+/).forEach((name) => this.init(name, entry.target));
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('[data-module]:not([data-eager])').forEach((el) => this.#io.observe(el));
    this.#warm();
    document.dispatchEvent(new CustomEvent('lda:start'));
  }

  /** True while the visitor is scrolling (smooth-scroll glide included). */
  #scrolling() {
    return !!this.lenis?.isScrolling || performance.now() - this.#lastScroll < 180;
  }

  /** Set up the sections below the fold during idle time, one per idle slot, instead of at the moment they
      scroll into view. Initialising a section means SplitText + ScrollTrigger measuring (3–30 ms of main
      thread); doing that mid-scroll is what shows up as a dropped frame. The IntersectionObserver stays as
      the fallback for anything the queue has not reached yet (e.g. a jump to an anchor). */
  #warm() {
    const queue = [...document.querySelectorAll('[data-module]:not([data-eager])')];
    if (!queue.length) return;
    const idle = window.requestIdleCallback
      ? (fn) => { this.#warmTimer = window.requestIdleCallback(fn, { timeout: 3000 }); }
      : (fn) => { this.#warmTimer = setTimeout(() => fn({ timeRemaining: () => 12, didTimeout: false }), 180); };
    this.#warming = true;
    const next = (deadline) => {
      if (!this.started) return;
      // the visitor is scrolling / the frame is busy: wait for a calmer moment
      if (this.#scrolling() || (deadline.timeRemaining() < 8 && !deadline.didTimeout)) { idle(next); return; }
      const el = queue.shift();
      if (!el) { this.#warming = false; this.#queueRefresh(120); return; }
      el.dataset.module.split(/\s+/).forEach((name) => this.init(name, el));
      this.#io?.unobserve(el);
      idle(next);
    };
    // start once the hero entrance has played, so it never competes with the first impression
    this.#warmTimer = setTimeout(() => idle(next), this.reduced ? 600 : 3000);
  }

  #queueRefresh(delay = 200) {
    clearTimeout(this.#refreshTimer);
    this.#refreshTimer = setTimeout(() => {
      // re-measuring every trigger forces a full layout: never do it in the middle of a scroll
      if (this.#scrolling()) { this.#queueRefresh(250); return; }
      ScrollTrigger.refresh();
    }, delay);
  }

  /** Re-measure scroll triggers after the page height changed (accordion, filter…). Deferred while scrolling. */
  refresh() { this.#queueRefresh(60); }

  /** Kill everything (used on page leave). */
  destroy() {
    clearTimeout(this.#warmTimer); clearTimeout(this.#refreshTimer);
    window.cancelIdleCallback?.(this.#warmTimer);
    this.#io?.disconnect();
    this.#instances.splice(0).reverse().forEach((off) => off());
    ScrollTrigger.getAll().forEach((st) => st.kill());
    if (this.#raf) gsap.ticker.remove(this.#raf);
    this.lenis?.destroy();
    this.lenis = null;
    this.started = false;
  }
}

export const Engine = new MotionEngine();
