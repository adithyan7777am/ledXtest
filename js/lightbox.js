/* =============================================================================
   lightbox.js — a small image viewer
   Any <button data-lightbox="group"> that contains an <img> opens that image full-size.
   Arrow keys / the arrow buttons move through the images of the same group; Esc, the close
   button or a click outside the picture closes it. Built with a native <dialog>, so focus is
   trapped and restored by the browser.
   ============================================================================= */
import { Engine } from './engine/Engine.js';

const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export function initLightbox() {
  let dialog = null;
  let img; let count; let prev; let next;
  let items = [];
  let index = 0;
  let opener = null;

  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'lb';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `<img class="lb__img" alt="">
      <button class="lb__btn lb__close" type="button" aria-label="Close">${CLOSE}</button>
      <button class="lb__btn lb__prev" type="button" aria-label="Previous image">${ARROW}</button>
      <button class="lb__btn lb__next" type="button" aria-label="Next image">${ARROW}</button>
      <p class="lb__count" aria-live="polite"></p>`;
    img = dialog.querySelector('.lb__img');
    count = dialog.querySelector('.lb__count');
    prev = dialog.querySelector('.lb__prev');
    next = dialog.querySelector('.lb__next');
    dialog.querySelector('.lb__close').addEventListener('click', () => dialog.close());
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // outside the picture
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('lb-open');
      Engine.lenis?.start();
      opener?.focus?.();
    });
    document.body.append(dialog);
  };

  const show = (n) => {
    index = (n + items.length) % items.length;
    const src = items[index].querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || '';
    const many = items.length > 1;
    prev.hidden = next.hidden = !many;
    count.textContent = many ? `${index + 1} / ${items.length}` : '';
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox]');
    if (!trigger || !trigger.querySelector('img')) return;
    e.preventDefault();
    if (!dialog) build();
    opener = trigger;
    items = [...document.querySelectorAll(`[data-lightbox="${CSS.escape(trigger.dataset.lightbox)}"]`)].filter((el) => el.querySelector('img'));
    show(items.indexOf(trigger));
    Engine.lenis?.stop();
    document.documentElement.classList.add('lb-open');
    dialog.showModal();
    dialog.querySelector('.lb__close').focus();
  });
}
