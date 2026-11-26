/* =============================================================================
   build.mjs — generates every HTML page + sitemap/robots/redirects from
   js/config.js.  Run:  npm run build   (Node 18+, zero dependencies)
   ============================================================================= */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG as C } from '../js/config.js';
import { layout, abs } from './partials.mjs';
import * as S from './schema.mjs';
import { homeBody } from './pages-home.mjs';
import { aboutBody, programsBody, placementsBody, programBody, blogsBody, postBody } from './pages-inner.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = async (rel, content) => {
  const file = join(ROOT, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
  console.log('  ✓', rel);
};
const page = (path) => (path === '/' ? 'index.html' : `${path.replace(/^\//, '')}index.html`);
const crumbs = (...items) => S.breadcrumb([{ name: 'Home', path: '/' }, ...items]);

const pages = [];
const livePrograms = C.programs.filter((p) => p.detail !== false); // programs with their own detail page

/* ---- Home ---- */
const heroPreload = C.hero.media.src
  ? `<link rel="preload" as="image" href="${C.hero.media.src}" fetchpriority="high">`
  : '';
pages.push({
  path: '/', priority: '1.0',
  html: layout({
    seo: C.seo.home, path: '/', active: '/', bodyClass: 'page-home', preload: heroPreload,
    body: homeBody(),
    jsonld: [...S.base(), ...livePrograms.map(S.course), S.faqPage(C.faq)],
  }),
});

/* ---- About / Placements / Blogs ---- */
pages.push({
  path: '/about/', priority: '0.8',
  html: layout({ seo: C.seo.about, path: '/about/', active: '/about/', body: aboutBody(),
    jsonld: [S.organization(), S.localBusiness(), crumbs({ name: 'About', path: '/about/' })] }),
});
pages.push({
  path: '/programs/', priority: '0.9',
  html: layout({ seo: C.seo.programs, path: '/programs/', active: '/programs/', body: programsBody(),
    jsonld: [S.organization(), ...livePrograms.map(S.course), crumbs({ name: 'Our Programs', path: '/programs/' })] }),
});
pages.push({
  path: '/placements/', priority: '0.8',
  html: layout({ seo: C.seo.placements, path: '/placements/', active: '/placements/', body: placementsBody(),
    jsonld: [S.organization(), crumbs({ name: 'Placements', path: '/placements/' })] }),
});
pages.push({
  path: '/blogs/', priority: '0.7',
  html: layout({ seo: C.seo.blogs, path: '/blogs/', active: '/blogs/', body: blogsBody(),
    jsonld: [S.organization(), S.website(), crumbs({ name: 'Blogs', path: '/blogs/' })] }),
});

/* ---- Programs ---- */
for (const p of livePrograms) {
  const path = `/programs/${p.slug}/`;
  pages.push({
    path, priority: '0.9',
    html: layout({
      seo: { title: `${p.title} in Mangalore – ${C.site.name}`, description: `${p.description} ${p.duration}, ${p.hours} hours, online or offline in Mangalore.`.slice(0, 300) },
      path, active: '', body: programBody(p), bodyClass: 'page-program',
      jsonld: [S.organization(), S.course(p), S.faqPage(C.faq.slice(0, 6)),
        crumbs({ name: 'Our Programs', path: '/programs/' }, { name: p.title, path })],
    }),
  });
}

/* ---- Blog posts ---- */
for (const post of C.blog.posts) {
  const path = `/blog/${post.slug}/`;
  pages.push({
    path, priority: '0.6', lastmod: post.updated || post.date,
    html: layout({
      seo: { title: `${post.title} | ${C.site.name}`, description: post.excerpt, type: 'article', image: post.cover || C.site.ogImage },
      path, active: '/blogs/', body: postBody(post), bodyClass: 'page-post',
      jsonld: [S.organization(), S.blogPosting(post, path),
        crumbs({ name: 'Blogs', path: '/blogs/' }, { name: post.title, path })],
    }),
  });
}

console.log('Building pages…');
for (const p of pages) await out(page(p.path), p.html);

/* ---- sitemap.xml / robots.txt ---- */
const today = new Date().toISOString().slice(0, 10);
await out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${p.lastmod || today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`);
await out('robots.txt', `User-agent: *
Allow: /
Disallow: /api/
Disallow: /private/

Sitemap: ${abs('/sitemap.xml')}
`);

/* ---- 301 redirects: old leafdigitalacademy.com paths → new structure ---- */
const redirects = [
  ...livePrograms.filter((p) => p.oldPath).map((p) => [p.oldPath, `/programs/${p.slug}/`]),
  ...C.blog.posts.map((p) => [p.oldPath, `/blog/${p.slug}/`]),
].flatMap(([from, to]) => {
  const bare = from.replace(/\/$/, '');
  return [[bare, to], [bare + '/', to]];
}).filter(([from, to]) => from !== to);

await out('_redirects', `# Netlify — 301s from the old Leaf Digital Academy URL structure\n${redirects.map(([f, t]) => `${f}  ${t}  301`).join('\n')}\n`);
await out('vercel.json', JSON.stringify({
  cleanUrls: false,
  trailingSlash: true,
  redirects: redirects.filter(([f]) => f.endsWith('/')).map(([source, destination]) => ({ source, destination, permanent: true })),
  headers: [
    { source: '/(css|js|assets)/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ],
}, null, 2) + '\n');
await out('.htaccess', `# cPanel / Apache — 301s from the old URL structure
Options -Indexes
DirectoryIndex index.html
RewriteEngine On
# Brochure gate: private files (PDFs, signing key, lead log) and build tools must never be served directly
RewriteRule ^(private|tools)(/|$) - [F,L]
${redirects.filter(([f]) => f.endsWith('/')).map(([f, t]) => `RewriteRule ^${f.replace(/^\//, '').replace(/\/$/, '')}/?$ ${t} [R=301,L]`).join('\n')}

# If the domain changes, put this on the OLD domain's hosting instead:
# RewriteCond %{HTTP_HOST} ^(www\\.)?leafdigitalacademy\\.com$ [NC]
# RewriteRule ^(.*)$ ${C.site.url}/$1 [R=301,L]

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
`);

console.log(`Done — ${pages.length} pages.`);
