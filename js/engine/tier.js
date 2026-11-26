/* =============================================================================
   tier.js — classify the device as 'high' | 'mid' | 'low'
   Hardware hints give an instant guess; a 1-second FPS probe can downgrade it.
   The result is cached in sessionStorage so repeat page views skip the probe.
   ============================================================================= */
const ORDER = ['low', 'mid', 'high'];
const KEY = 'lda-tier';

export function hardwareTier() {
  const n = navigator;
  const cores = n.hardwareConcurrency || 4;
  const mem = n.deviceMemory || 4; // Chromium only; others default to 4
  const saveData = n.connection?.saveData;
  const slowNet = /(^|-)2g$/.test(n.connection?.effectiveType || '');
  if (saveData || slowNet || cores <= 2 || mem <= 2) return 'low';
  if (cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

/** Measure average FPS over `ms`. Resolves with the fps number. */
export function probeFps(ms = 1000) {
  return new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = (now) => {
      frames++;
      if (now - start < ms) requestAnimationFrame(tick);
      else resolve((frames * 1000) / (now - start));
    };
    requestAnimationFrame(tick);
  });
}

export function cachedTier() {
  try { return sessionStorage.getItem(KEY); } catch { return null; }
}

/** Full detection: hardware guess, then FPS probe (skipped when cached). */
export async function detectTier() {
  const cached = cachedTier();
  if (cached && ORDER.includes(cached)) return cached;
  let tier = hardwareTier();
  // Background tabs throttle rAF — only trust the probe when the page is visible.
  // A throttled/backgrounded tab can report very low FPS on fast hardware, so a
  // bad probe only drops one step at a time and never below what hardware allows.
  if (document.visibilityState === 'visible' && document.hasFocus?.() !== false) {
    const fps = await probeFps(1000);
    if (fps < 30) tier = tier === 'high' ? 'mid' : 'low';
    else if (fps < 50 && tier === 'high') tier = 'mid';
  }
  try { sessionStorage.setItem(KEY, tier); } catch {}
  return tier;
}
