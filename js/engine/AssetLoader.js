/* =============================================================================
   AssetLoader.js — loads first-fold assets in parallel and reports weighted
   progress 0 → 1. Never hangs: resolves after `timeout` ms no matter what.

   Manifest item: { type: 'font' | 'image' | 'video', src | family, weight? }
   ============================================================================= */
export class AssetLoader {
  constructor(manifest = [], { timeout = 4000 } = {}) {
    this.manifest = manifest;
    this.timeout = timeout;
    this.listeners = new Set();
    this.loaded = 0;
    this.total = manifest.reduce((s, a) => s + (a.weight || 1), 0) || 1;
  }

  onProgress(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  #emit() { const p = Math.min(1, this.loaded / this.total); this.listeners.forEach((fn) => fn(p)); }

  #loadOne(asset) {
    switch (asset.type) {
      case 'font':
        return document.fonts?.load(asset.family) ?? Promise.resolve();
      case 'image': {
        const img = new Image();
        img.decoding = 'async';
        img.src = asset.src;
        return img.decode();
      }
      case 'video':
        return new Promise((res, rej) => {
          const v = document.createElement('video');
          v.muted = true; v.preload = 'auto'; v.src = asset.src;
          v.addEventListener('canplaythrough', res, { once: true });
          v.addEventListener('error', rej, { once: true });
        });
      default:
        return Promise.resolve();
    }
  }

  /** Resolves with { timedOut } once everything settles or the timeout hits. */
  load() {
    const jobs = this.manifest.map((asset) =>
      this.#loadOne(asset)
        .catch(() => {}) // a failed asset still counts as "done" — never block the site
        .finally(() => { this.loaded += asset.weight || 1; this.#emit(); }));

    const all = Promise.all(jobs).then(() => ({ timedOut: false }));
    const timer = new Promise((res) => setTimeout(() => res({ timedOut: true }), this.timeout));
    if (!jobs.length) this.#emit();
    return Promise.race([all, timer]);
  }
}

/** Builds the manifest from what is actually on the page. */
export function buildManifest(root = document) {
  const manifest = [
    { type: 'font', family: '800 1em "Bricolage Grotesque"', weight: 2 },
    { type: 'font', family: '400 1em "Inter"', weight: 1 },
    { type: 'image', src: '/assets/svg/logo.svg', weight: 0.5 },
  ];
  // First-fold media (hero image / poster / video) — {{HERO_MEDIA}}
  root.querySelectorAll('.hero img, .page-hero img, .post__cover-wrap img').forEach((img) => {
    if (img.currentSrc || img.src) manifest.push({ type: 'image', src: img.currentSrc || img.src, weight: 2 });
  });
  root.querySelectorAll('.hero video[src]').forEach((v) => manifest.push({ type: 'video', src: v.src, weight: 2 }));
  return manifest;
}
