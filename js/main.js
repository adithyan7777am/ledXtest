/* =============================================================================
   main.js — bootstrap
   1. classify device tier   2. boot Engine (Lenis, plugins)   3. register
   modules   4. Preloader (real asset progress) → eager modules prepared
   under the curtain   5. Engine.start() plays the hero + lazy-inits the rest
   ============================================================================= */
import { Engine } from './engine/Engine.js';
import { AssetLoader, buildManifest } from './engine/AssetLoader.js';
import { Preloader, entryMode } from './engine/Preloader.js';
import { detectTier, hardwareTier, cachedTier } from './engine/tier.js';
import { initTransitions } from './engine/transitions.js';
import { initGlass } from './glass.js';
import * as A from './animations.js';
import { initBrochure } from './brochure.js';
import { initLightbox } from './lightbox.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  initBrochure(); // brochure gate dialog — independent of the animation engine
  initLightbox(); // image viewer for photos / placement cards
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !window.Flip) {
    throw new Error('GSAP failed to load');
  }
  window.__ldaBooted = true; // tells the <head> safety net the engine is alive
  const mode = entryMode();
  const firstGuess = cachedTier() || hardwareTier();
  const tierProbe = detectTier();

  Engine.boot({ tier: firstGuess });

  // Globals (run once per page, not tied to a section)
  Engine
    .registerGlobal(initGlass)
    .registerGlobal(A.initHeadings)
    .registerGlobal(A.initCursor)
    .registerGlobal(A.initMagnetic)
    .registerGlobal(A.initInViewVideo)
    .registerGlobal(A.initEnrollBar);

  // Section modules — matched by data-module="name"
  Engine
    .register('navbar', A.initNavbar)
    .register('hero', A.initHero)
    .register('pagehero', A.initPageHero)
    .register('about', A.initAbout)
    .register('modes', A.initModes)
    .register('certs', A.initCertMarquee)
    .register('collab', A.initCollab)
    .register('programs', A.initPrograms)
    .register('tools', A.initTools)
    .register('why', A.initWhyLDA)
    .register('testimonials', A.initTestimonials)
    .register('faq', A.initFAQ)
    .register('form', A.initForm)
    .register('founder', A.initFounder)
    .register('footer', A.initFooter)
    .register('counters', A.initCounters)
    .register('timeline', A.initTimeline)
    .register('bloggrid', A.initBlogGrid)
    .register('post', A.initPost);

  const loader = new AssetLoader(buildManifest(), { timeout: 4000 });

  await Preloader.run({
    mode,
    loader,
    reduced: Engine.reduced,
    onReady: async () => {
      // The FPS probe (~1s) runs in parallel with asset loading; don't wait long for it.
      const tier = await Promise.race([tierProbe, wait(mode === 'full' ? 400 : 0).then(() => firstGuess)]);
      if (tier !== Engine.tier) {
        Engine.setTier(tier);
        if (tier === 'low') Engine.disableSmoothScroll();
      }
      // SplitText must measure lines with the real fonts (all weights), never fallbacks.
      await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1500)]);
      Engine.prepare();
    },
  });

  Engine.start();
  initTransitions(Engine);
}

main().catch((err) => {
  console.error('[LDA] engine failed, showing static page', err);
  document.documentElement.classList.add('engine-failed');
  window.__ldaStarted = true;
});
