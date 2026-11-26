/* =============================================================================
   pages-inner.mjs — About, Placements, Program, Blogs, Blog post
   ============================================================================= */
import { CONFIG as C } from '../js/config.js';
import { esc, icon, btn, initials, leadForm, breadcrumbs, statRow, brochureDialog, isPlaceholder } from './partials.mjs';
import { programCard, faqList, placementCards, placementPosters, lifeSection, founderSection, toolsSection } from './pages-home.mjs';

const pageHero = ({ crumbs, eyebrow = '', title, accent = '', lead = '', extra = '' }) => `
<section class="page-hero" data-module="pagehero" data-eager>
  <div class="container">
    ${breadcrumbs(crumbs)}
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h1 class="page-hero__title display" data-hero="title">${esc(title)}${accent ? ` <em class="accent">${esc(accent)}</em>` : ''}</h1>
    ${lead ? `<p class="lead page-hero__lead" data-hero="body">${esc(lead)}</p>` : ''}
    ${extra}
  </div>
</section>`;


/* ------------------------------------------------------------------ ABOUT -- */
export const aboutBody = () => `
${pageHero({
  crumbs: [{ name: 'Home', path: '/' }, { name: 'About', path: '/about/' }],
  eyebrow: 'About Us',
  title: 'Mangalore’s first Earn While You Learn academy,',
  accent: 'built for what’s next',
  lead: 'Leaf Digital Academy is now LedxDigitalAcademy. Same mentors, same hands-on promise — earn while you learn.',
})}
<section class="section section--tight" data-module="about" aria-labelledby="story-title">
  <div class="container container--narrow">
    <h2 class="statement" id="story-title" data-scrub-words>We teach the work, <em class="accent">not just the theory</em></h2>
    <div class="about__body about__body--left">
      <!-- {{STORY}} — replace with the academy's own story -->
      ${C.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
  </div>
</section>
<section class="section section--tight" aria-labelledby="mission-title">
  <div class="container">
    <h2 class="h2" id="mission-title" data-split="lines">Mission <em class="accent">&amp; vision</em></h2>
    <div class="split-cards">
      <article class="glass split-card" data-specular data-edge><h3>Our mission</h3><p>Make every learner job-ready and client-ready through live projects, AI tools and mentorship.</p></article>
      <article class="glass split-card" data-specular data-edge><h3>Our vision</h3><p>Build the region’s strongest community of AI-skilled digital marketers, freelancers and founders.</p></article>
    </div>
  </div>
</section>
<section class="collab" data-module="collab" aria-labelledby="collab-title">
  <div class="collab__panel">
    <div class="container collab__grid">
      <div class="collab__copy">
        <p class="eyebrow eyebrow--dark">Collaboration</p>
        <h2 class="h2 h2--dark" id="collab-title" data-split="lines">Proud Partner of <em class="accent">${esc(C.collab.partner)}</em></h2>
        <p class="collab__body">${esc(C.collab.body)}</p>
      </div>
      <figure class="collab__photo">${C.collab.photo ? `<img src="${C.collab.photo}" alt="MoU signing between ${C.site.name} and ${esc(C.collab.partner)}" width="1024" height="567" loading="lazy">` : '<div class="ph ph--light" role="img" aria-label="MoU photo placeholder"><span>{{MOU_PHOTO}}</span></div>'}</figure>
    </div>
  </div>
</section>
<section class="section timeline-section" data-module="timeline" aria-labelledby="tl-title">
  <div class="container container--narrow">
    <h2 class="h2" id="tl-title" data-split="lines">Our <em class="accent">journey</em></h2>
    <div class="timeline">
      <span class="timeline__line" aria-hidden="true"><i></i></span>
      <ol class="timeline__list" role="list">
        ${C.timeline.map((t) => `<li class="timeline__item"><span class="timeline__dot" aria-hidden="true"></span>${isPlaceholder(t.year) ? '' : `<p class="timeline__year">${esc(t.year)}</p>`}<h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></li>`).join('')}
      </ol>
    </div>
  </div>
</section>
${lifeSection()}
${founderSection()}
<section class="section section--tight" aria-labelledby="mentors-title">
  <div class="container">
    <h2 class="h2" id="mentors-title" data-split="lines">Meet your <em class="accent">mentors</em></h2>
    <ul class="mentor-grid" role="list">
      ${C.mentors.map((m) => `<li class="mentor-card glass" data-specular><div class="mentor-card__ph" aria-hidden="true">${initials(m.name)}</div><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p>${m.bio ? `<p class="mentor-card__bio">${esc(m.bio)}</p>` : ''}</li>`).join('')}
      <!-- {{MORE_MENTORS}} -->
    </ul>
  </div>
</section>
${leadForm()}`;

/* ------------------------------------------------------------------ PROGRAMS -- */
export const programsBody = () => `
${pageHero({
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Our Programs', path: '/programs/' }],
  eyebrow: 'Our Programs',
  title: 'Industry-ready programs,',
  accent: 'built for what’s next',
  lead: C.programsSection.lead,
})}
<section class="section section--tight programs" data-module="programs" aria-labelledby="programs-dm-title">
  <div class="container">
    <h2 class="programs__group" id="programs-dm-title">${esc(C.programsSection.groups.dm)}</h2>
    <div class="programs__grid programs__grid--dm">
      ${C.programs.filter((p) => p.group === 'dm').map((p) => programCard(p, 'h3')).join('')}
    </div>
    <h2 class="programs__group">${esc(C.programsSection.groups.more)}</h2>
    <div class="programs__grid">
      ${C.programs.filter((p) => p.group === 'more').map((p) => programCard(p, 'h3')).join('')}
    </div>
    <div class="programs__more glass glass--flat">
      <p><b>${esc(C.programsSection.more.title)}</b> ${esc(C.programsSection.more.body)}</p>
      ${btn({ label: C.programsSection.more.cta, href: '#enquire', variant: 'glass', size: 'sm', iconName: 'arrow', magnetic: false })}
    </div>
  </div>
</section>
${leadForm()}`;

/* ------------------------------------------------------------- PLACEMENTS -- */
export const placementsBody = () => `
${pageHero({
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Placements', path: '/placements/' }],
  eyebrow: 'Placements',
  title: 'Where our learners',
  accent: 'work today',
  lead: 'Our learners leave with a portfolio of live client work — and go on to agencies, brands and their own freelance businesses.',
  extra: statRow(C.placements.stats),
})}
<section class="section section--tight" data-module="programs" aria-labelledby="placed-title">
  <div class="container">
    <h2 class="h2" id="placed-title" data-split="lines">Recently <em class="accent">placed</em></h2>
    <!-- {{PLACEMENTS}} -->
    ${C.placements.students.some((s) => s.card) ? placementCards(C.placements.students) : `<ul class="placed-grid" role="list">
      ${C.placements.students.map((s) => `
      <li class="placed glass" data-specular>
        <div class="placed__ph" aria-hidden="true">${initials(s.name.replace(/[{}]/g, '') || 'LD')}</div>
        <h3>${esc(s.name)}</h3>${s.role ? `<p>${esc(s.role)}</p>` : ''}
        <p class="placed__co">${s.logo ? `<img src="${s.logo}" alt="${esc(s.company)}" width="96" height="28" loading="lazy">` : esc(s.company)}</p>
      </li>`).join('')}
    </ul>`}
    ${C.placements.posters?.length ? placementPosters(C.placements.posters, 'placements') : ''}
  </div>
</section>
${leadForm({ id: 'hire', title: 'Hire from us', subtitle: 'Hire job-ready digital marketers trained on live client projects. Tell us what you need and we will share matching profiles.', kind: 'hire' })}`;

/* ---------------------------------------------------------------- PROGRAM -- */
const toolsFor = (p) => {
  if (p.slug.includes('seo')) return ['Search Console', 'Google Analytics 4', 'SEMrush', 'Ahrefs', 'Ubersuggest', 'Moz', 'Screaming Frog', 'AnswerThePublic', 'Google Trends', 'Yoast SEO', 'Rank Math', 'ChatGPT', 'Perplexity', 'Bing Webmaster'];
  if (p.slug.includes('wordpress')) return ['WordPress', 'Elementor', 'WooCommerce', 'Hostinger', 'Yoast SEO', 'Rank Math', 'Figma', 'Canva', 'Google Analytics 4', 'Tag Manager', 'Microsoft Clarity', 'ChatGPT'];
  return C.toolShowcase.map((t) => t.name);
};

export const programBody = (p) => `
${pageHero({
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Our Programs', path: '/programs/' }, { name: p.title, path: `/programs/${p.slug}/` }],
  title: p.title,
  lead: p.description,
  extra: `
    <div class="program-hero__meta" data-hero="ctas">
      <span class="badge">${icon('sparkle', 'icon icon--xs')}${esc(p.duration)}</span>
      <span class="meta-chip glass glass--flat glass--pill">Mode: ${esc(p.mode)}</span>
      <span class="meta-chip glass glass--flat glass--pill">${p.hours} hours</span>
      ${p.demo ? `<span class="meta-chip glass glass--flat glass--pill">${esc(p.demo)}</span>` : ''}
    </div>
    <div class="hero__ctas" data-hero="ctas">
      ${btn({ label: 'Enroll Now', href: '#enquire', iconName: 'arrow' })}
      ${p.brochure ? btn({ label: 'Download Brochure', href: '#enquire', variant: 'glass', iconName: 'download', attrs: `data-brochure="${p.slug}" data-brochure-title="${esc(p.title)}" data-cursor="Download"` }) : ''}
    </div>`,
})}
${p.audience ? `<section class="section section--tight" aria-labelledby="aud-title">
  <div class="container">
    <h2 class="h2" id="aud-title" data-split="lines">Who can <em class="accent">join?</em></h2>
    <ul class="chip-cloud" role="list">${p.audience.map((a) => `<li class="meta-chip glass glass--flat glass--pill">${esc(a)}</li>`).join('')}</ul>
  </div>
</section>` : ''}
<section class="section section--tight" data-module="faq" aria-labelledby="mod-title">
  <div class="container faq__grid">
    <div class="faq__intro">
      <h2 class="h2" id="mod-title" data-split="lines">What you’ll <em class="accent">learn</em></h2>
      <p class="lead">${p.modulesLead || `${p.modules.length} modules, each finished with a hands-on task.`}</p>
      <!-- {{MODULES}} -->
    </div>
    ${faqList(p.modules.map((m, i) => ({ q: `${p.moduleLabel || 'Module'} ${i + 1} — ${m.title}`, body: m.body })), 'mod')}
  </div>
</section>
${p.featured ? toolsSection() : `<section class="section section--tight" aria-labelledby="ptools-title">
  <div class="container">
    <h2 class="h2" id="ptools-title" data-split="lines">Tools you’ll <em class="accent">use</em></h2>
    <ul class="chip-cloud" role="list">${toolsFor(p).map((n) => `<li class="tool-pill glass glass--flat glass--pill"><b>${initials(n)}</b>${esc(n)}</li>`).join('')}</ul>
  </div>
</section>`}
${p.journey ? `<section class="section timeline-section" data-module="timeline" aria-labelledby="journey-title">
  <div class="container container--narrow">
    <h2 class="h2" id="journey-title" data-split="lines">Your journey to becoming a <em class="accent">certified digital marketer</em></h2>
    <div class="timeline">
      <span class="timeline__line" aria-hidden="true"><i></i></span>
      <ol class="timeline__list" role="list">
        ${p.journey.map((j, i) => `<li class="timeline__item"><span class="timeline__dot" aria-hidden="true"></span><p class="timeline__year">Step ${i + 1}</p><h3>${esc(j.title)}</h3><p>${j.points.map(esc).join(' · ')}</p></li>`).join('')}
      </ol>
    </div>
  </div>
</section>` : ''}
<section class="section section--tight" aria-labelledby="pcert-title">
  <div class="container split-cards">
    <article class="glass split-card" data-specular data-edge>
      <h2 class="h3" id="pcert-title">Certifications</h2>
      <ul class="chip-cloud" role="list">${C.certifications.map((c) => `<li class="cert glass glass--flat glass--pill" style="--brand:${c.color}"><span>${esc(c.name)}</span></li>`).join('')}<li class="cert glass glass--flat glass--pill"><span>LDA Certificate</span></li></ul>
      ${p.completionCertificate ? `<p>${esc(p.completionCertificate)}</p>` : ''}
      ${p.internship ? `<p><b>${esc(p.internship.duration)} industry internship.</b> ${esc(p.internship.body)}</p>` : ''}
    </article>
    <article class="glass split-card" data-specular data-edge>
      <h2 class="h3">Fees &amp; batches</h2>
      <p class="fee"><span class="fee__label">Program fee</span><b>${isPlaceholder(p.fee) ? 'Contact us' : esc(p.fee)}</b></p><!-- {{FEE}} -->
      <p class="fee"><span class="fee__label">Next batches</span><b>${isPlaceholder(p.batches) ? 'Contact us for upcoming batches' : esc(p.batches)}</b></p><!-- {{BATCHES}} -->
      <ul class="chip-cloud" role="list">${(p.learningModes || C.modes.map((m) => m.title)).map((m) => `<li class="meta-chip glass glass--flat glass--pill">${esc(m)}</li>`).join('')}</ul>
    </article>
  </div>
</section>
<section class="section section--tight faq" data-module="faq" aria-labelledby="pfaq-title">
  <div class="container faq__grid">
    <div class="faq__intro"><h2 class="h2" id="pfaq-title" data-split="lines">Program <em class="accent">FAQ</em></h2></div>
    ${faqList(C.faq.slice(0, 6), 'pfaq')}
  </div>
</section>
${leadForm()}
<div class="enroll-bar glass glass--strong" data-enroll-bar>
  <span><b>${esc(p.duration)}</b> · ${p.hours} hrs</span>
  ${btn({ label: 'Enroll Now', href: '#enquire', size: 'sm', magnetic: false })}
</div>
${p.brochure ? brochureDialog() : ''}`;

/* ------------------------------------------------------------------ BLOGS -- */
const cover = (post, cls = 'post-card__cover') => post.cover
  ? `<img class="${cls}" src="${post.cover}" alt="" width="800" height="500" loading="lazy">`
  : `<div class="${cls} cover-ph" data-cat="${esc(post.category)}" aria-hidden="true"><span>${esc(post.category)}</span></div>`; // {{COVER}}

export const postCard = (post) => `
<article class="post-card glass" data-specular data-category="${esc(post.category)}" data-title="${esc(post.title.toLowerCase())}" data-cursor="Read">
  ${cover(post)}
  <div class="post-card__body">
    <p class="post-card__meta"><span class="cat-chip">${esc(post.category)}</span><span>${icon('clock', 'icon icon--xs')}${post.readTime} min read</span></p>
    <h3 class="post-card__title"><a href="/blog/${post.slug}/">${esc(post.title)}</a></h3>
    <p class="post-card__excerpt">${esc(post.excerpt)}</p>
    <a class="btn btn--coral btn--sm" href="/blog/${post.slug}/" tabindex="-1" aria-hidden="true"><span class="btn__label"><span class="btn__text" data-text="Read article">Read article</span></span></a>
  </div>
</article>`;

export const blogsBody = () => {
  const cats = [...new Set(C.blog.posts.map((p) => p.category))];
  return `
${pageHero({
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Blogs', path: '/blogs/' }],
  eyebrow: 'Blogs',
  title: 'Knowledge',
  accent: 'Hub',
  lead: C.blog.intro,
})}
<section class="section section--tight blog-index" data-module="bloggrid" aria-label="Articles">
  <div class="container">
    <div class="blog-tools">
      <div class="filters" role="group" aria-label="Filter by category">
        ${['All', ...cats].map((c, i) => `<button type="button" class="filter${i === 0 ? ' is-active' : ''}" data-filter="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('')}
      </div>
      <label class="search glass glass--flat glass--pill">
        ${icon('search')}<span class="sr-only">Search articles</span>
        <input type="search" name="q" placeholder="Search articles" data-blog-search autocomplete="off">
      </label>
    </div>
    <div class="post-grid" data-post-grid>
      ${C.blog.posts.map(postCard).join('')}
    </div>
    <p class="blog-empty" data-blog-empty hidden>No articles match that search yet.</p>
  </div>
</section>`;
};

/* -------------------------------------------------------------- BLOG POST -- */
const POST_SECTIONS = ['The short answer', 'What you actually need', 'How to get started', 'Where LedxDigitalAcademy fits in', 'Next steps'];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const postBody = (post) => {
  const related = C.blog.posts.filter((p) => p.slug !== post.slug)
    .sort((a, b) => (b.category === post.category) - (a.category === post.category)).slice(0, 3);
  const url = encodeURIComponent(`${C.site.url}/blog/${post.slug}/`);
  const text = encodeURIComponent(post.title);
  return `
<div class="read-progress" aria-hidden="true"><i data-read-progress></i></div>
<article class="post" data-module="post">
  <header class="page-hero page-hero--post" data-module="pagehero" data-eager>
    <div class="container container--narrow">
      ${breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blogs', path: '/blogs/' }, { name: post.title, path: `/blog/${post.slug}/` }])}
      <p class="post__meta"><span class="cat-chip">${esc(post.category)}</span><span>${icon('clock', 'icon icon--xs')}${post.readTime} min read</span>${post.date ? `<time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</time>` : '<!-- {{DATE}} -->'}</p>
      <h1 class="page-hero__title display display--post" data-hero="title">${esc(post.title)}</h1>
      <p class="lead" data-hero="body">${esc(post.excerpt)}</p>
    </div>
  </header>
  <div class="container post__cover-wrap">${cover(post, 'post__cover')}</div>
  <div class="container post__layout">
    <aside class="toc glass" aria-label="Table of contents">
      <p class="toc__title">On this page</p>
      <ol role="list">${POST_SECTIONS.map((s) => `<li><a href="#${slugify(s)}" data-toc-link>${esc(s)}</a></li>`).join('')}</ol>
    </aside>
    <div class="prose" data-prose>
      <!-- {{POST_BODY}} — migrate the original article from leafdigitalacademy.com${post.oldPath} -->
      ${POST_SECTIONS.map((s) => `
      <h2 id="${slugify(s)}">${esc(s)}</h2>
      <p>{{POST_BODY}} Paste the original section content for “${esc(s)}” here. Keep paragraphs short, and link to relevant programs such as the <a href="/programs/${C.programs[0].slug}/">${esc(C.programs[0].title)}</a> where it helps the reader.</p>`).join('')}
      <div class="share" aria-label="Share this article">
        <span>Share</span>
        <a href="https://wa.me/?text=${text}%20${url}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${icon('whatsapp')}</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${icon('linkedin')}</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener" aria-label="Share on Facebook">${icon('facebook')}</a>
        <button type="button" data-copy-link aria-label="Copy link">${icon('link')}</button>
      </div>
      <div class="author glass" data-specular>
        <div class="author__av" aria-hidden="true">${initials(C.blog.author.name)}</div>
        <div><p class="author__name">${esc(C.blog.author.name)}</p><p>${esc(C.blog.author.bio)}</p></div><!-- {{AUTHOR}} -->
      </div>
    </div>
  </div>
</article>
<aside class="inline-cta glass glass--strong" data-inline-cta aria-label="Enroll" hidden>
  <p><b>Learn this hands-on.</b> 4-month AI-powered program with live client projects.</p>
  ${btn({ label: 'Enroll Now', href: '/#enquire', size: 'sm', magnetic: false })}
  <button class="inline-cta__close" type="button" aria-label="Dismiss" data-inline-cta-close>${icon('close')}</button>
</aside>
<section class="section section--tight" data-module="programs" aria-labelledby="rel-title">
  <div class="container">
    <h2 class="h2" id="rel-title" data-split="lines">Related <em class="accent">reading</em></h2>
    <div class="post-grid">${related.map(postCard).join('')}</div>
  </div>
</section>`;
};

export { programCard };
