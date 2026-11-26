/* =============================================================================
   schema.mjs — JSON-LD builders (one @graph per page)
   ============================================================================= */
import { CONFIG as C } from '../js/config.js';
import { abs, isPlaceholder } from './partials.mjs';

const ORG_ID = abs('/#organization');
const SITE_ID = abs('/#website');
const BIZ_ID = abs('/#localbusiness');

const address = () => ({
  '@type': 'PostalAddress',
  streetAddress: C.contact.address.street,
  addressLocality: C.contact.address.city,
  addressRegion: C.contact.address.region,
  postalCode: C.contact.address.postal,
  addressCountry: C.contact.address.country,
}); // {{ADDRESS}}

export const organization = () => ({
  '@type': ['EducationalOrganization', 'Organization'],
  '@id': ORG_ID,
  name: C.site.name,
  alternateName: [C.site.short, C.site.formerName],
  url: abs('/'),
  logo: abs(C.site.logo),
  telephone: C.contact.phone,
  ...(isPlaceholder(C.contact.email) ? {} : { email: C.contact.email }),
  address: address(),
  sameAs: C.socials.map((s) => s.url),
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: abs('/'),
  name: C.site.name,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: abs('/blogs/?q={search_term_string}') },
    'query-input': 'required name=search_term_string',
  },
});

export const localBusiness = () => ({
  '@type': 'LocalBusiness',
  '@id': BIZ_ID,
  name: `${C.site.name} — Mangalore`,
  url: abs('/'),
  image: abs(C.site.ogImage),
  logo: abs(C.site.logo),
  telephone: C.contact.phone,
  address: address(),
  areaServed: 'Mangaluru, Karnataka',
  parentOrganization: { '@id': ORG_ID },
});

export const breadcrumb = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const faqPage = (faq) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

export const course = (p) => {
  const priced = !isPlaceholder(p.fee) && /\d/.test(p.fee);
  return {
    '@type': 'Course',
    '@id': abs(`/programs/${p.slug}/#course`),
    name: p.title,
    description: p.description,
    url: abs(`/programs/${p.slug}/`),
    provider: { '@id': ORG_ID },
    educationalCredentialAwarded: 'Certificate',
    timeRequired: p.durationISO,
    inLanguage: 'en',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: ['Online', 'Onsite'],
      courseWorkload: `PT${p.hours}H`,
      location: { '@type': 'Place', name: 'Mangaluru', address: address() },
    },
    // {{FEE}} — once a numeric fee is set in config, a priced Offer is emitted.
    offers: priced
      ? { '@type': 'Offer', price: String(p.fee).replace(/[^\d.]/g, ''), priceCurrency: 'INR', category: 'Paid', availability: 'https://schema.org/InStock' }
      : { '@type': 'Offer', category: 'Paid' },
  };
};

export const blogPosting = (post, path) => ({
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  mainEntityOfPage: abs(path),
  image: abs(post.cover || C.site.ogImage),
  author: { '@type': 'Organization', name: C.blog.author.name },
  publisher: { '@id': ORG_ID },
  ...(post.date ? { datePublished: post.date, dateModified: post.updated || post.date } : {}), // {{DATE}}
  articleSection: post.category,
  inLanguage: 'en-IN',
});

export const base = () => [organization(), website(), localBusiness()];
