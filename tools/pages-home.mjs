/* =============================================================================
   pages-home.mjs — Home page sections (6.1 → 6.12). Content comes from config.
   ============================================================================= */
import { CONFIG as C } from '../js/config.js';
import { esc, icon, btn, initials, leadForm, statRow, isPlaceholder } from './partials.mjs';

/* Shared: program card (used on home + program pages) */
export const programCard = (p, tag = 'h3') => {
  const soon = p.status === 'soon';
  const linked = p.detail !== false;
  const meta = p.meta || `Mode: ${p.mode} | Duration: ${p.duration} | Hours: ${p.hours}`;
  return `
<article class="program glass${p.featured ? ' program--featured' : ''}${soon ? ' program--soon' : ''}" data-specular data-edge${linked ? ' data-cursor="View"' : ''}>
  <div class="program__top">
    <span class="program__icon" aria-hidden="true">${icon(p.icon || (p.featured ? 'spark' : p.slug.includes('seo') ? 'chart' : 'offline'))}</span>
    ${soon ? '<span class="badge badge--soon">Coming soon</span>' : `<span class="badge">${icon('sparkle', 'icon icon--xs')}${esc(p.duration)}</span>`}
  </div>
  <p class="program__meta">${esc(meta)}</p>
  <${tag} class="program__title">${linked ? `<a href="/programs/${p.slug}/">${esc(p.title)}</a>` : esc(p.title)}</${tag}>
  <p class="program__desc">${esc(p.description)}</p>
  ${p.tags?.length ? `<ul class="tags" role="list">${p.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>` : ''}
  <div class="program__actions">
    ${linked
      ? `<a class="link-arrow" href="/programs/${p.slug}/" aria-label="View curriculum for ${esc(p.title)}">View curriculum ${icon('arrow')}</a>
    ${btn({ label: 'Enroll Now', href: '/#enquire', size: 'sm', magnetic: false })}`
      : `<a class="link-arrow" href="${p.cta.href}">${esc(p.cta.label)} ${icon('arrow')}</a>`}
  </div>
</article>`;
};

/* Tool logo tile: Simple Icons mark when the brand has a slug, otherwise (or if
   the CDN image fails to load) a monogram badge in the brand colour. */
const toolTile = (t) => {
  const logo = t.slug
    ? `<img class="tool__logo${t.wide ? ' tool__logo--wide' : ''}" src="https://cdn.simpleicons.org/${t.slug}" alt="" width="40" height="40" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">`
    : '';
  return `<li class="tool">
          <span class="tool__mark" aria-hidden="true">${logo}<span class="tool__mono" style="--c:${t.color || 'var(--brand-violet)'}"${t.slug ? ' hidden' : ''}>${esc(t.mono || initials(t.name))}</span></span>
          <span class="tool__name">${esc(t.name)}</span>
        </li>`;
};

/* Shared: FAQ accordion */
export const faqList = (items, idp = 'faq') => `
<div class="acc" data-accordion>
  ${items.map((f, i) => `
  <div class="acc__item glass glass--flat">
    <h3 class="acc__h">
      <button class="acc__btn" type="button" id="${idp}-q${i}" aria-expanded="false" aria-controls="${idp}-a${i}">
        <span>${esc(f.q)}</span><span class="acc__icon" aria-hidden="true">${icon('plus')}</span>
      </button>
    </h3>
    <div class="acc__panel" id="${idp}-a${i}" role="region" aria-labelledby="${idp}-q${i}">
      <div class="acc__body">${f.a ? `<p>${esc(f.a)}</p>` : ''}${f.body ? `<p>${esc(f.body)}</p>` : ''}</div>
    </div>
  </div>`).join('')}
</div>`;

/* Shared: about statement with accent words */
const statement = ([plain, accent], tag = 'h2', cls = 'statement') =>
  `<${tag} class="${cls}" data-scrub-words>${esc(plain)}<em class="accent">${esc(accent)}</em></${tag}>`;

/* Placement cards: each learner's card is a ready-made image (photo, name, company logo). */
export const placementCards = (students) => `
<ul class="placed-cards" role="list">
  ${students.filter((s) => s.card).map((s) => `
  <li class="placed-card"><button type="button" class="lb-trigger" data-lightbox="placements" data-cursor="View" aria-label="View larger: ${esc(s.name)}, placed at ${esc(s.company)}"><img src="${s.card}" alt="" width="851" height="613" loading="lazy" decoding="async"></button></li>`).join('')}
</ul>`;

/* "Got Placed" announcement posters: a swipeable row on phones/tablets, a grid on desktop. */
export const placementPosters = (posters, lightbox = 'posters') => `
<ul class="placed-posters" role="list">
  ${posters.map((p) => `
  <li class="placed-poster"><button type="button" class="lb-trigger" data-lightbox="${esc(lightbox)}" data-cursor="View" aria-label="View larger: ${esc(p.name)}, placed as ${esc(p.role)} at ${esc(p.company)}"><img src="${p.src}" alt="${esc(p.name)}, placed as ${esc(p.role)} at ${esc(p.company)}, ${esc(p.location)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async"></button></li>`).join('')}
</ul>`;

/* Home: "Unmatched Placements" — stats strip + the placement cards. */
export const placementsSection = () => `
<!-- ============================ PLACEMENTS ============================ -->
<section class="section placements" data-module="programs" aria-labelledby="placements-title">
  <div class="container">
    <h2 class="h2" id="placements-title" data-split="lines">Unmatched <em class="accent">Placements</em></h2>
    <p class="lead placements__lead">We focus on quality teaching, continuous performance assessment, and helping every student achieve their full potential.</p>
    ${placementCards(C.placements.students.slice(0, 6))}
    <p class="placements__cta">${btn({ label: 'See all placements', href: '/placements/', variant: 'glass', iconName: 'arrow' })}</p>
  </div>
</section>`;

/* ---- "Life at LDA": one photo mosaic (home + About) ---------------------------------------------------------------
   Every tile spans a number of equal-height grid rows chosen from the photo's aspect ratio (one row = 1/8 of a
   column's width), and the photos are dealt into 3 columns on desktop / 2 on phones so that every column ends at
   exactly the same height: a flush masonry with no gaps and hardly any cropping. The numbers are worked out here, at
   build time, from the width/height in config (life.photos), so adding or re-ordering photos just re-flows it.
   The search tries every way of dealing the photos (fine for a dozen or so; a greedy deal takes over beyond that),
   keeps tall pictures, wide strips and posters from stacking up in one column, and nudges tiles by at most about
   one row so the columns come out level. */
const MOSAIC_ROWS = 8;

export const dealMosaic = (photos, cols, gapRatio) => {
  const n = photos.length;
  const ideal = photos.map((p) => MOSAIC_ROWS * (p.h / p.w + gapRatio)); // rows each tile would like (fractional)
  const tall = photos.map((p) => p.h / p.w > 1.1);
  const wide = photos.map((p) => p.h / p.w < 0.55);
  const total = ideal.reduce((a, b) => a + b, 0);

  /* rows per tile (and a cost) when `assign` puts photo i in column assign[i]; null if no level deal exists */
  const plan = (assign) => {
    const per = Array.from({ length: cols }, () => []);
    assign.forEach((c, i) => per[c].push(i));
    if (per.some((col) => !col.length)) return null;
    let pen = 0;
    for (const col of per) {
      if (col.filter((i) => photos[i].poster).length > 1) pen += 60;
      const t = col.filter((i) => tall[i]).length;
      pen += t > 2 ? 40 : t > 1 ? 6 : 0;
      if (col.filter((i) => wide[i]).length > 1) pen += 14;
      if (Math.abs(col.length - n / cols) > 1) pen += 10;
    }
    let best = null;
    const mid = Math.round(total / cols);
    for (let T = mid - 2; T <= mid + 3; T++) { // T = rows in every column
      const rows = new Array(n);
      let ok = true;
      for (const col of per) {
        col.forEach((i) => { rows[i] = Math.max(2, Math.round(ideal[i])); });
        let d = T - col.reduce((s, i) => s + rows[i], 0);
        while (d !== 0) {
          const dir = Math.sign(d);
          // give the missing / surplus row to the tile that stays closest to its natural proportions in relative terms,
          // so a big tile absorbs it rather than a small one (one row is a 7% change on a big tile, 25% on a small one)
          let pick = -1;
          let least = Infinity;
          for (const i of col) {
            if (rows[i] + dir < 2) continue;
            const off = Math.abs(rows[i] + dir - ideal[i]) / ideal[i];
            if (off < least) { least = off; pick = i; }
          }
          if (pick < 0) { ok = false; break; }
          rows[pick] += dir; d -= dir;
        }
        if (!ok) break;
      }
      if (!ok) continue;
      const off = rows.map((r, i) => Math.abs(r - ideal[i]) / ideal[i]);   // how far each tile is cropped from its photo
      const cost = 300 * Math.max(...off) + 40 * off.reduce((a, b) => a + b, 0);
      if (!best || cost < best.cost) best = { cost, rows: rows.slice() };
    }
    return best && { cost: pen + best.cost, rows: best.rows, assign: assign.slice() };
  };

  let best = null;
  const assign = new Array(n).fill(0);
  if (cols ** n <= 2e6) {
    // Columns are numbered in order of first use (so photo 1 is top-left, the next new column is to its right), and a
    // column never gets more than one photo above its fair share: both keep the number of deals to try small.
    const cap = Math.ceil(n / cols) + 1;
    const counts = new Array(cols).fill(0);
    const search = (i, used) => {
      if (i === n) { const r = plan(assign); if (r && (!best || r.cost < best.cost)) best = r; return; }
      for (let c = 0; c <= Math.min(used, cols - 1); c++) {
        if (counts[c] >= cap) continue;
        assign[i] = c; counts[c]++;
        search(i + 1, Math.max(used, c + 1));
        counts[c]--;
      }
    };
    search(0, 0);
  }
  if (!best) { // very many photos (or no level deal): shortest column first, then stretch the last tile of short columns
    const sums = new Array(cols).fill(0);
    const rows = ideal.map((r) => Math.max(2, Math.round(r)));
    const last = new Array(cols).fill(-1);
    photos.forEach((_, i) => { const c = sums.indexOf(Math.min(...sums)); assign[i] = c; sums[c] += rows[i]; last[c] = i; });
    const max = Math.max(...sums);
    sums.forEach((s, c) => { if (last[c] >= 0) rows[last[c]] += max - s; });
    best = { rows, assign: assign.slice() };
  }
  return photos.map((_, i) => ({ col: best.assign[i] + 1, rows: best.rows[i] }));
};

export const lifeSection = () => {
  const photos = C.life.photos;
  const desktop = dealMosaic(photos, 3, 16 / 376); // 16px gap, columns ≈ 376px wide in the 1160px container
  const phone = dealMosaic(photos, 2, 10 / 170);   // 10px gap, columns ≈ 170px wide on a 390px phone
  const fig = (p, i) => `<figure class="life__item" style="--dc:${desktop[i].col};--dr:${desktop[i].rows};--mc:${phone[i].col};--mr:${phone[i].rows};--ar:${p.w}/${p.h}"><button type="button" class="lb-trigger" data-lightbox="life" data-cursor="View" aria-label="View larger: ${esc(p.alt)}"><img src="${p.src}" alt="${esc(p.alt)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" style="object-position:${p.pos}"></button></figure>`;
  return `
<!-- ============================ LIFE AT LDA =========================== -->
<section class="section life" data-module="programs" aria-labelledby="life-title">
  <div class="container">
    <h2 class="h2" id="life-title" data-split="lines">Life at <em class="accent">LDA</em></h2>
    <p class="lead life__lead">${esc(C.life.lead)}</p>
    <div class="life__wrap"><div class="life__grid">
      ${photos.map(fig).join('\n      ')}
    </div></div>
  </div>
</section>`;
};

/* Founder card (About page). */
export const founderSection = () => `
<!-- ========================= 6.12 FOUNDER / MENTORS ==================== -->
<section class="section founder" data-module="founder" aria-labelledby="founder-title">
  <div class="container">
    <div class="founder__card glass" data-specular>
      <figure class="founder__photo" data-wipe>
        ${C.founder.photo ? `<img src="${C.founder.photo}" alt="${esc(C.founder.name)}" width="640" height="760" loading="lazy">` : `<div class="ph" role="img" aria-label="${esc(C.founder.name)}"><span>${esc(initials(C.founder.name))}</span></div>`}
      </figure>
      <div class="founder__copy">
        <p class="eyebrow">From the founder</p>
        <h2 class="h2" id="founder-title" data-split="lines">${esc(C.founder.name)}</h2>
        <p class="founder__role">${esc(C.founder.title)}</p>
        <p class="founder__msg">${esc(isPlaceholder(C.founder.message) ? (C.mentors.find((m) => m.name === C.founder.name)?.bio || '') : C.founder.message)}</p>
        ${btn({ label: 'Talk to me', href: C.contact.whatsapp, iconName: 'whatsapp', attrs: 'target="_blank" rel="noopener"' })}
      </div>
    </div>
  </div>
</section>`;

/* "Tools That You Will Master" logo grid (digital marketing program page). */
export const toolsSection = () => `
<!-- ======================== 6.7 TOOLS YOU WILL MASTER =================== -->
<section class="section tools" data-module="tools" aria-labelledby="tools-title">
  <div class="tools__panel">
    <div class="container">
      <h2 class="h2 h2--dark center" id="tools-title" data-split="lines">Tools That You <em class="accent">Will Master</em></h2>
      <ul class="tools__grid" role="list">
        ${C.toolShowcase.map(toolTile).join('')}
      </ul>
      <p class="tools__more">And many more tools across SEO, content, analytics, automation and e-commerce.</p>
    </div>
  </div>
</section>`;

export const homeBody = () => {
  const tq = (x) => x.full || x.quote;

  return `
<!-- ============================== 6.1 HERO ============================== -->
<section class="hero" id="top" data-module="hero" data-eager aria-labelledby="hero-title">
  <!-- Immersive scene (decorative): aurora light, perspective floor, cursor spotlight -->
  <div class="hero__scene" aria-hidden="true">
    <span class="hero__aurora hero__aurora--1"></span>
    <span class="hero__aurora hero__aurora--2"></span>
    <span class="hero__aurora hero__aurora--3"></span>
    <span class="hero__floor"><span class="hero__floor-grid"></span></span>
    <span class="hero__spot"></span>
  </div>

  <div class="container hero__center">
    <p class="hero__badge glass glass--pill glass--flat" data-hero="badge"><span class="hero__dot" aria-hidden="true"></span>${esc(C.hero.badge)}</p>
    <h1 class="hero__title display" id="hero-title" data-hero="title">${esc(C.hero.title)} <em class="hero__em">${esc(C.hero.accent)}</em></h1>
    <p class="hero__body lead" data-hero="body">${esc(C.hero.body)}</p>
    <div class="hero__ctas" data-hero="ctas">
      ${btn({ label: 'Enquire Now', href: '#enquire', iconName: 'arrow' })}
      ${btn({ label: 'Explore Programs', href: '#programs', variant: 'glass', iconName: 'arrow' })}
    </div>
    <p class="stat-pill glass glass--pill glass--flat" data-hero="pill" aria-label="${C.stats.map((s) => `${s.prefix || ''}${s.value}${s.suffix} ${s.label}`).join(', ')}">
      ${C.stats.map((s, i) => `${i ? '<span class="stat-pill__sep" aria-hidden="true">|</span>' : ''}<span class="stat-pill__item" data-stat-index="${i}" aria-hidden="true">${s.prefix || ''}<b data-count="${s.value}">${s.value}</b>${s.suffix} ${s.label}</span>`).join('')}
    </p>
  </div>

  <a class="hero__cue" href="#about" aria-label="Scroll down to learn more" data-hero="cue"><span>Scroll</span><span class="hero__cue-line" aria-hidden="true"></span></a>
</section>

<!-- ======================= 6.2 ABOUT / IMPACT ========================== -->
<section class="section about" id="about" data-module="about" aria-labelledby="about-title">
  <div class="container about__grid">
    <div class="about__intro">
      <h2 class="statement" id="about-title" data-scrub-words>${esc(C.academy.title)}</h2>
      <p class="about__summary">${esc(C.academy.summary)}</p>
    </div>  </div>
</section>

<!-- ========================= 6.3 MODE OF LEARNING ===================== -->
<section class="section section--tight modes" data-module="modes" aria-labelledby="modes-title" data-stack-prev>
  <div class="container">
    <h2 class="h2 center" id="modes-title" data-split="lines">Learn the way that <em class="accent">fits your life</em></h2>
    <ul class="modes__grid" role="list">
      ${C.modes.map((m) => `
      <li class="mode glass" data-specular>
        <span class="mode__icon" aria-hidden="true">${icon(m.icon, 'icon icon--draw')}</span>
        <h3 class="mode__title">${esc(m.title)}</h3>
        <p class="mode__body">${esc(m.body)}</p>
      </li>`).join('')}
    </ul>
  </div>
</section>

<!-- ======================= 6.5 COLLABORATION (LIGHT) =================== -->
<section class="collab" data-module="collab" aria-labelledby="collab-title">
  <div class="collab__panel">
    <div class="container collab__grid">
      <div class="collab__copy">
        <p class="eyebrow eyebrow--dark">Collaboration</p>
        <h2 class="h2 h2--dark" id="collab-title" data-split="lines">Proud Partner of <em class="accent">${esc(C.collab.partner)}</em></h2>
        <p class="collab__body">${esc(C.collab.body)}</p><!-- VERIFY: verbatim MoU paragraph -->
      </div>
      <figure class="collab__photo">
        ${C.collab.photo ? `<img src="${C.collab.photo}" alt="MoU signing between ${C.site.name} and ${esc(C.collab.partner)}" width="1024" height="567" loading="lazy">` : '<div class="ph ph--light" role="img" aria-label="MoU signing photo placeholder"><span>{{MOU_PHOTO}}</span></div>'}
      </figure>
    </div>
  </div>
</section>

<!-- ================= 6.6 INDUSTRY-READY CERTIFICATION PROGRAMS ========= -->
<section class="section programs" id="programs" data-module="programs" aria-labelledby="programs-title">
  <div class="container">
    <h2 class="h2" id="programs-title" data-split="lines">Industry-Ready <em class="accent">Programs</em></h2>
    <p class="lead programs__lead">${esc(C.programsSection.lead)}</p>
    <h3 class="programs__group">${esc(C.programsSection.groups.dm)}</h3>
    <div class="programs__grid programs__grid--dm">
      ${C.programs.filter((p) => p.group === 'dm').map((p) => programCard(p, 'h4')).join('')}
    </div>
    <div class="programs__more glass glass--flat">
      <p><b>${esc(C.programsSection.more.title)}</b> Finance, internships and more are coming — see every program.</p>
      ${btn({ label: 'View all programs', href: '/programs/', variant: 'glass', size: 'sm', iconName: 'arrow', magnetic: false })}
    </div>
  </div>
</section>

<!-- ========================= 6.8 WHY CHOOSE LDA ======================== -->
<section class="section why" data-module="why" aria-labelledby="why-title">
  <div class="why__statement">
    <div class="why__marquee" aria-hidden="true"><div class="why__marquee-track">${Array(4).fill(C.why.marquee.join(' · ')).join(' · ')}</div></div>
    <h2 class="why__title" id="why-title">
      <span class="why__pre">Are you looking for</span>
      <span class="why__big" data-why-big>Earn While You Learn</span>
      <span class="why__post">??</span>
    </h2>
  </div>
  <div class="container">
    <ul class="why__grid" role="list">
      ${C.why.cards.map((c, i) => `
      <li class="why-card glass${i === 2 ? ' why-card--hot' : ''}" data-specular data-edge>
        <div class="why-card__head">
          <p class="why-card__stat"><b>${esc(c.stat)}</b><span>${esc(c.unit)}</span></p>
          <span class="why-card__icon" aria-hidden="true">${icon(c.icon)}</span>
        </div>
        <h3 class="why-card__title">${esc(c.title)}</h3>
        <p class="why-card__body">${esc(c.body)}</p>
        ${c.chips?.length ? `<ul class="why-card__chips" role="list">${c.chips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      </li>`).join('')}
    </ul>
  </div>
</section>

${placementsSection()}

<!-- ===================== 6.9 HEAR FROM OUR LEARNERS ==================== -->
<section class="section testimonials" data-module="testimonials" aria-labelledby="t-title">
  <div class="container">
    <h2 class="t-title" id="t-title" data-scrub-words><span class="t-title__big">Hear</span> <span class="t-title__small">from Our Learners</span></h2>
  </div>
  <div class="container t-grid-wrap">
    <ul class="t-grid" role="list">
      ${C.storyReels.map((r, i) => `
      <li class="reel-card">
        <video class="reel" src="${r.src}" poster="${r.poster}" playsinline loop preload="none" aria-label="Learner story ${i + 1}"></video>
        <button class="reel-card__play" type="button" data-reel-play aria-label="Play learner story ${i + 1}" aria-pressed="false"><svg class="ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><svg class="ic-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg></button>
        <span class="reel-card__bar" aria-hidden="true"><i></i></span>
      </li>`).join('')}
    </ul>
  </div>
</section>

${lifeSection()}

<!-- =============================== 6.10 FAQ ============================= -->
<section class="section faq" id="faq" data-module="faq" aria-labelledby="faq-title">
  <div class="container faq__grid">
    <div class="faq__intro">
      <h2 class="h2" id="faq-title" data-split="lines">Questions, <em class="accent">answered</em></h2>
      <p class="lead">Still unsure which batch suits you? Call us on <a href="${C.contact.phoneHref}">${C.contact.phone}</a>.</p>
    </div>
    ${faqList(C.faq.slice(0, 6))}
  </div>
</section>

<!-- ============================ 6.11 LEAD FORM ========================= -->
${leadForm()}
`;
};
