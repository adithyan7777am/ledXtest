/* =============================================================================
   transitions.js — multi-page glass curtain transitions (no framework needed)

   Leave:  the glass curtain sweeps in from the left, ScrollTriggers are killed,
           then we navigate.
   Enter:  the next page boots with html.pt-in (set in <head> from
           sessionStorage), so the curtain already covers it; Preloader
           'transition' mode sweeps it away and replays that page's modules.
   ============================================================================= */
const { gsap } = window;
const FLAG = 'lda-pt';

function isInternalNav(a, e) {
  if (!a || e.defaultPrevented || e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== '_self') return false;
  if (a.hasAttribute('download') || a.dataset.noTransition !== undefined) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (!/^https?:$/.test(url.protocol)) return false;
  if (/\.(pdf|zip|jpg|png|mp4|xml|txt)$/i.test(url.pathname)) return false;
  // Same page (hash or identical URL) → let the anchor/Lenis handler deal with it.
  if (url.pathname === location.pathname && url.search === location.search) return false;
  return url;
}

export function initTransitions(Engine) {
  let leaving = false;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    const url = isInternalNav(a, e);
    if (!url || leaving) return;
    e.preventDefault();
    leaving = true;

    if (Engine.reduced) { location.href = url.href; return; }

    try { sessionStorage.setItem(FLAG, '1'); } catch {}
    const curtain = document.querySelector('.pt-curtain');
    const glass = curtain?.querySelector('.pt-curtain__glass');
    Engine.lenis?.stop();
    gsap.set(curtain, { visibility: 'visible' });
    // Only the curtain moves (transform). Fading + scaling the whole <main> as well meant compositing a
    // page-tall group behind a full-screen blur on every frame of the sweep.
    gsap.timeline({
      onComplete: () => { Engine.destroy(); location.href = url.href; },
    })
      .fromTo(glass, { xPercent: -101 }, { xPercent: 0, duration: 0.55, ease: 'power3.inOut' });
  });

  // If the user comes back via history with the flag still set, clear it.
  window.addEventListener('pageshow', () => { leaving = false; });
}
