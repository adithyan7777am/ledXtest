/* =============================================================================
   build.mjs — generates every HTML page + sitemap/robots/redirects from
   js/config.js.  Run:  npm run build   (Node 18+, zero dependencies)
   ============================================================================= */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG as C } from '../js/config.js';
import { layout, abs } from './partials.mjs';
import { HEADERS } from './security.mjs';
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

/* ---- 404 page (served by the server for any unknown address; see ErrorDocument in .htaccess) ---- */
await out('404.html', layout({
  seo: { title: `Page not found – ${C.site.name}`, description: 'That page does not exist.' }, path: '/404.html', active: '', bodyClass: 'page-404',
  body: `<section class="page-hero" data-eager><div class="container">
    <p class="eyebrow">404</p>
    <h1 class="page-hero__title display">This page took a <em class="accent">wrong turn.</em></h1>
    <p class="lead page-hero__lead">The page you are looking for has moved or never existed. Let’s get you back on track.</p>
    <div class="hero__ctas"><a class="btn btn--primary" href="/"><span class="btn__label"><span class="btn__text" data-text="Back to home">Back to home</span></span></a>
    <a class="btn btn--glass" href="/programs/"><span class="btn__label"><span class="btn__text" data-text="Our programs">Our programs</span></span></a></div>
  </div></section>`,
}));

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
  outputDirectory: '.',
  cleanUrls: false,
  trailingSlash: true,
  redirects: redirects.filter(([f]) => f.endsWith('/')).map(([source, destination]) => ({ source, destination, permanent: true })),
  headers: [
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
  ],
}, null, 2) + '\n');
await out('.htaccess', String.raw`# Apache / LiteSpeed (Hostinger) — generated by tools/build.mjs, do not edit by hand.
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
ServerSignature Off

RewriteEngine On
# HTTPS everywhere, and one canonical host (no www)
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]

# Never serve private files, build tools, git data or any dotfile (the brochure PDFs, signing key and lead log live in /private)
RewriteRule ^(private|tools|node_modules|\.git|\.claude)(/|$) - [F,L]
RewriteRule (^|/)\.(?!well-known/) - [F,L]
<FilesMatch "^(package(-lock)?\.json|vercel\.json|_redirects|README\.md|.*\.mjs|.*\.(log|csv|key|eml|bak|sql))$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>

# 301s from the old Leaf Digital Academy URL structure
${redirects.filter(([f]) => f.endsWith('/')).map(([f, t]) => `RewriteRule ^${f.replace(/^\//, '').replace(/\/$/, '')}/?$ ${t} [R=301,L]`).join('\n')}

# Security headers (the Content-Security-Policy is defined in tools/security.mjs)
<IfModule mod_headers.c>
${Object.entries(HEADERS).map(([k, v]) => `  Header always set ${k} "${v}"`).join('\n')}
  Header always unset X-Powered-By
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json application/xml image/svg+xml text/plain
</IfModule>

# Caching: pictures, video and fonts for a week; CSS/JS are re-checked on every visit (the files are not renamed per release,
# so a long cache would keep visitors on an old version after you update the site).
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 7 days"
  ExpiresByType image/jpeg "access plus 7 days"
  ExpiresByType image/png "access plus 7 days"
  ExpiresByType image/svg+xml "access plus 7 days"
  ExpiresByType video/mp4 "access plus 7 days"
  ExpiresByType font/woff2 "access plus 30 days"
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`);

console.log(`Done — ${pages.length} pages.`);
