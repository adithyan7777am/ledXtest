/* =============================================================================
   brochure.js — the brochure gate (front end)
   A "Download Brochure" button ([data-brochure="<program slug>"]) opens a dialog that asks for a
   genuine mobile number and Gmail address. The same rules are enforced again on the server
   (api/brochure.php), which is the real gate: the PDF is only handed out through a signed,
   short-lived link that the server issues AFTER it has e-mailed the lead to the academy.
   Keep COUNTRIES and the validators below in sync with api/brochure.php.
   ============================================================================= */
import { Engine } from './engine/Engine.js';

const ENDPOINT = '/api/brochure.php';

/* country code => [min digits, max digits] of the national number */
const COUNTRIES = {
  '+91': [10, 10], '+971': [9, 9], '+966': [9, 9], '+974': [8, 8],
  '+968': [8, 8], '+965': [8, 8], '+1': [10, 10], '+44': [10, 10],
};

/** True for patterns real numbers don't have: 9999999999, 9090909090, 9876543210 ... */
export function looksFakeNumber(d) {
  if (new Set(d).size <= 2) return true;
  let same = 1, asc = 1, desc = 1, max = 1;
  for (let i = 1; i < d.length; i++) {
    const diff = (Number(d[i]) - Number(d[i - 1]) + 10) % 10;
    same = diff === 0 ? same + 1 : 1;
    asc = diff === 1 ? asc + 1 : 1;
    desc = diff === 9 ? desc + 1 : 1;
    max = Math.max(max, same, asc, desc);
  }
  return max >= 7;
}

/** Clean national number, or null when it isn't a plausible mobile number. */
export function normalisePhone(country, raw) {
  const range = COUNTRIES[country];
  if (!range) return null;
  let d = String(raw).replace(/\D+/g, '');
  const [min, max] = range;
  const cc = country.slice(1);
  if (d.length > max && d.startsWith(cc)) d = d.slice(cc.length); // typed with the country code
  if (d.length > max && d[0] === '0') d = d.slice(1); // leading trunk 0
  if (country === '+91') {
    if (!/^[6-9][0-9]{9}$/.test(d)) return null; // Indian mobiles: 10 digits starting 6-9
  } else if (d.length < min || d.length > max) return null;
  return looksFakeNumber(d) ? null : d;
}

/** Lower-cased Gmail address, or null. Gmail: 6-30 letters/digits/dots, no "..", no leading/trailing dot. */
export function normaliseGmail(raw) {
  const e = String(raw).trim().toLowerCase();
  const m = e.length <= 64 && e.match(/^([a-z0-9](?:[a-z0-9]|\.(?!\.)){4,28}[a-z0-9])@(?:gmail|googlemail)\.com$/);
  if (!m) return null;
  const local = m[1].replace(/\./g, '');
  if (new Set(local).size <= 3) return null; // aaaaaa, ababab
  if (/^(test|testing|demo|fake|dummy|sample|example|abcd|asdf|qwer|xyz|none|noemail)/.test(local)) return null;
  return e;
}

/** '' for blank (optional), the cleaned name, or null when invalid. */
export function cleanName(raw) {
  const n = String(raw).replace(/\s+/g, ' ').trim();
  if (n === '') return '';
  return /^\p{L}[\p{L} .'\-]{1,59}$/u.test(n) ? n : null;
}

const MESSAGES = {
  phone: (c) => (c === '+91'
    ? 'Please enter a valid 10-digit Indian mobile number (starting 6, 7, 8 or 9).'
    : 'Please enter a valid mobile number for the selected country.'),
  email: () => 'Please enter your real Gmail address (name@gmail.com).',
  name: () => 'Please use letters only for your name, or leave it blank.',
  consent: () => 'Please tick the box so we can share the brochure with you.',
};

/** @returns {{ok:true, value:object} | {ok:false, field:string, message:string}} */
export function validateLead({ name = '', country = '+91', phone = '', email = '', consent = false }) {
  const p = normalisePhone(country, phone);
  if (p === null) return { ok: false, field: 'phone', message: MESSAGES.phone(country) };
  const g = normaliseGmail(email);
  if (g === null) return { ok: false, field: 'email', message: MESSAGES.email() };
  const n = cleanName(name);
  if (n === null) return { ok: false, field: 'name', message: MESSAGES.name() };
  if (!consent) return { ok: false, field: 'consent', message: MESSAGES.consent() };
  return { ok: true, value: { name: n, country, phone: p, email: g } };
}

/* ------------------------------------------------------------------ dialog */

export function initBrochure() {
  const dialog = document.getElementById('brochure-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.form__status');
  const submit = dialog.querySelector('.form__btn');
  const programName = dialog.querySelector('[data-bro-program]');
  const programInput = form.elements.program;
  let opener = null;
  let openedAt = 0;

  const setState = (s) => { form.dataset.state = s; submit.disabled = s === 'loading' || s === 'success'; };
  const say = (msg, isError = false) => { status.textContent = msg; status.classList.toggle('is-error', isError); };
  const fieldFor = (name) => (name === 'consent' ? form.elements.consent : form.elements[name]);

  const open = (slug, title, trigger) => {
    opener = trigger;
    programInput.value = slug;
    programName.textContent = title || 'the program brochure';
    form.reset();
    setState('idle');
    say('');
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    openedAt = Date.now();
    Engine.lenis?.stop();
    document.documentElement.classList.add('bro-open');
    dialog.showModal();
    form.elements.phone.focus();
  };

  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('bro-open');
    Engine.lenis?.start();
    opener?.focus?.();
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // backdrop click
  dialog.querySelector('[data-bro-close]').addEventListener('click', close);

  // Capture phase: run before the site's page-transition link handler.
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-brochure]');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    open(t.dataset.brochure, t.dataset.brochureTitle, t);
  }, true);

  const startDownload = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.rel = 'noopener';
    document.body.append(a);
    a.click();
    a.remove();
  };

  form.addEventListener('input', (e) => e.target.removeAttribute?.('aria-invalid'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const v = validateLead({
      name: fd.get('name') || '', country: fd.get('countryCode') || '+91', phone: fd.get('phone') || '',
      email: fd.get('email') || '', consent: form.elements.consent.checked,
    });
    if (!v.ok) {
      const el = fieldFor(v.field);
      el?.setAttribute('aria-invalid', 'true');
      el?.focus();
      say(v.message, true);
      return;
    }
    setState('loading');
    say('Checking your details…');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          program: fd.get('program'), ...v.value, consent: true, website: fd.get('website') || '',
          elapsed: Date.now() - openedAt, page: location.pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setState('idle');
        const el = data.field && fieldFor(data.field);
        el?.setAttribute('aria-invalid', 'true');
        el?.focus();
        say(data.message || 'Something went wrong. Please try again or WhatsApp us.', true);
        return;
      }
      setState('success');
      status.classList.remove('is-error');
      status.replaceChildren('Thank you! Your download is starting. ');
      const link = document.createElement('a');
      link.href = data.url;
      link.download = '';
      link.textContent = 'Not started? Tap here.';
      status.append(link);
      startDownload(data.url);
    } catch {
      setState('idle');
      say('Could not reach the server. Please check your connection and try again.', true);
    }
  });
}
