/* =============================================================================
   LedxDigitalAcademy — SINGLE SOURCE OF TRUTH
   -----------------------------------------------------------------------------
   Every page is generated from this object (`npm run build`), and the browser
   imports it too (form options, tools orbit, etc.).

   Search for "{{" to find every placeholder that still needs real content.
   Search for "VERIFY" to find copy that was rebuilt from the current site and
   should be swapped for the exact wording before launch.
   ============================================================================= */

export const CONFIG = {
  site: {
    name: 'LedxDigitalAcademy',
    short: 'LDA',
    legalName: 'LedxDigitalAcademy',
    formerName: 'Leaf Digital Academy',
    url: 'https://ledxdigitalacademy.com', // {{SITE_URL}} — final domain, no trailing slash
    locale: 'en_IN',
    year: 2026,
    tagline: 'Upskilling the next generation with practical, industry-led programs — Digital Marketing, Finance, HR and Internships',
    ogImage: '/assets/img/og-default.jpg', // 1200×630, generated from the official logo
    logo: '/assets/svg/logo.svg', // official LDA logo (full colour, with tagline)
    themeColor: '#0B0714',
  },

  brand: {
    violet: '#5E17EB',
    violet2: '#7B3FF2',
    plum: '#2A1155',
    coral: '#FF6A3D',
    ink: '#111111',
    lavender: '#EEE8FB',
  },

  contact: {
    phone: '+91 88486 14930',
    phoneHref: 'tel:+918848614930',
    whatsapp: 'https://wa.me/918848614930',
    email: 'ledxdigitalacademy@gmail.com', // shown in the footer and in the site's structured data
    address: {
      street: '3rd Floor, Srinidhi Complex, Pumpwell Padil Road, opp. Eshanya Hotel, Kankanady, Naguri',
      city: 'Mangaluru',
      region: 'Karnataka',
      postal: '575002',
      country: 'IN',
    }, // {{ADDRESS_MANGALORE}} — confirm after rebrand
    mapEmbed: 'https://maps.google.com/maps?q=Srinidhi%20Complex%2C%20Pumpwell%2C%20Mangaluru%20575002&output=embed',
    mapLink: 'https://maps.google.com/?q=Srinidhi+Complex+Pumpwell+Mangaluru+575002',
  },

  /* Update handles after the rebrand ({{NEW_INSTAGRAM}} etc.) */
  socials: [
    { name: 'Instagram', handle: '@leaf.digital.academy', url: 'https://www.instagram.com/leaf.digital.academy' },
    { name: 'Facebook', handle: 'Leaf Digital Academy', url: 'https://www.facebook.com/people/Leaf-Digital-Academy-LDA/61576826174054/' },
    { name: 'LinkedIn', handle: '/company/leafdigitalacademy', url: 'https://www.linkedin.com/company/leafdigitalacademy/' },
    { name: 'YouTube', handle: '@leafdigitalacademy', url: 'https://youtube.com/@leafdigitalacademy' },
  ],

  integrations: {
    chatbotEmbed: '', // {{CHATBOT_EMBED}} — paste the "Livi" chatbot <script> snippet here
    formEndpoint: '{{FORM_ENDPOINT}}', // e.g. Formspree / Google Apps Script URL. While a placeholder, forms fall back to WhatsApp.
  },

  /* Mouse cursor (desktop only). style: 'comet' (small glowing trail, sparks on click) | 'block' (the logo's violet block) |
     'target' (marketing crosshair) | 'coin' (₹ — earn while you learn).
     Preview any of them live by adding ?cursor=comet, ?cursor=block, ?cursor=target or ?cursor=coin to a page address. */
  cursor: { style: 'comet' },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about/' },
    { label: 'Our Programs', href: '/programs/' },
    { label: 'Placements', href: '/placements/' },
    { label: 'Blogs', href: '/blogs/' },
  ],

  /* Hero strip — academy-level facts (from the brochure), not one program's numbers */
  stats: [
    { value: 60, suffix: '+', label: 'Learners trained' },
    { value: 15, suffix: '+', label: 'Learners placed' },
    { value: 40, suffix: '+', label: 'Freelancing while studying' },
    { value: 5, prefix: '₹', suffix: ' LPA', label: 'Highest package' },
  ],

  hero: {
    title: 'Learn Something That Takes You', // h1 = title + accent word
    accent: 'Somewhere.',
    badge: "Mangalore's First Earn While You Learn Academy",
    body: 'Build practical, industry-relevant skills through programs designed for the real world — from Digital Marketing and Finance to HR and Internships.',
    media: {
      // {{HERO_MEDIA}} — set `src` to a student portrait (AVIF/WebP, 900×1100) or `video` to an mp4.
      src: '',
      video: '',
      poster: '',
      alt: 'Students at LedxDigitalAcademy working on a live client campaign',
      width: 900,
      height: 1100,
    },
  },

  about: {
    statement: ['Be An ', 'AI Specialised Digital Marketer'],
    // VERIFY: paste the two About paragraphs verbatim from the current site.
    paragraphs: [
      'LDA started with one simple motive, to bridge the gap between what students learn in the classroom and what the industry actually expects from them. Traditional education often focuses heavily on theory. At LDA, we take a different approach. We train students in Digital Marketing, HR, and Finance through practical learning, real projects, and industry exposure, so they can experience what it actually means to work in their chosen domain.',
      'This is where we developed our “Earn While You Learn” concept. But we believe in keeping it real, there are no filters, false promises, or guaranteed-income claims. The opportunity comes to students who put their learning into action, take responsibility, and genuinely work for it.',
    ],
  },

  /* Home "About" section: headline + three pillars (paragraphs come from `about.paragraphs`) */
  academy: {
    /* short intro shown on the home page (the full story is on the About page) */
    summary: 'LDA bridges the gap between classroom theory and what the industry expects. We train students in Digital Marketing, HR and Finance through real projects and practical exposure, with no false promises: the opportunity goes to those who put their learning into action.',
    title: 'We built the academy we wished existed in Mangalore',
    pillars: [
      { title: 'Learn Beyond Theory', body: 'Build practical skills through real projects, tools, assignments, and industry-focused training.' },
      { title: 'Experience Real Work', body: 'Work on real projects, handle real client requirements, and learn from experienced practitioners.' },
      { title: 'Earn While You Learn', body: 'Get opportunities to earn through projects, freelance work, and practical assignments.' },
    ],
  },

  modes: [
    { title: 'Online', body: 'Learn from anywhere with live interactive sessions.', icon: 'online' },
    { title: 'Offline', body: 'Classroom-based learning for practical experience.', icon: 'offline' },
    { title: 'Weekend', body: 'Special batches designed for working professionals.', icon: 'weekend' },
    { title: 'Evening Batch', body: 'Flexible evening classes for students & employees.', icon: 'evening' },
  ],

  /* {{MORE_CERT_LOGOS}} — set `logo` to an SVG path to replace the wordmark text */
  certifications: [
    { name: 'Google', color: '#4285F4', logo: '' },
    { name: 'Meta', color: '#0866FF', logo: '' },
    { name: 'LinkedIn', color: '#0A66C2', logo: '' },
    { name: 'Google Analytics', color: '#F9AB00', logo: '' },
    { name: 'SEMrush', color: '#FF642D', logo: '' },
    { name: 'HubSpot', color: '#FF7A59', logo: '' },
    { name: 'Mailchimp', color: '#FFE01B', logo: '' },
    { name: 'Ahrefs', color: '#FF8800', logo: '' },
  ],

  collab: {
    partner: 'St Aloysius University',
    // VERIFY: paste the MoU paragraph verbatim from the current site.
    body: 'LedxDigitalAcademy has signed an MoU with St Aloysius University to deliver industry-focused digital marketing programmes right on the university campus. The partnership pairs our hands-on, project-first training with the university’s academic legacy — a step towards building career-ready digital professionals in our region.',
    logo: '', // {{ST_ALOYSIUS_LOGO}}
    photo: '/assets/img/st-aloysius-mou.webp',
  },

  /* Home "Programs" section copy. Programs are grouped by `group` ('dm' first, then 'more'). */
  programsSection: {
    lead: 'Digital Marketing leads the way today — with Finance, internships and more programs growing alongside it.',
    groups: { dm: 'Digital Marketing', more: 'Beyond Digital Marketing' },
    more: { title: 'More programs are on the way.', body: 'Tell us what you would like to learn next and we will keep you posted.', cta: 'Tell us what you want to learn' },
  },

  programs: [
    {
      slug: 'ai-integrated-digital-marketing-program',
      oldPath: '/ai-integrated-digital-marketing-program',
      title: 'Certification in AI-Integrated Digital Marketing',
      featured: true,
      duration: '4 months',
      durationISO: 'P4M',
      hours: 180,
      mode: 'Online / Offline / Hybrid',
      // VERIFY: paste card description verbatim.
      description: 'Our flagship program is designed to make you industry-ready through practical, AI-integrated training — from GTM strategies and WordPress web development to SEO, GEO, ChatGPT Ads, Performance Marketing, and more.',
      group: 'dm',
      brochure: true, // gated download: private/brochures/<slug>.pdf, served by api/brochure.php
      meta: '4 months · Weekend & weekday batches',
      tags: ['GTM Strategies', 'SEO & GEO', 'Performance Marketing', 'WordPress'],
      fee: '{{FEE}}',
      /* From the 4-month program brochure: 25 modules across the topics below, grouped into 6 tracks. */
      moduleCount: 25,
      moduleLabel: 'Track',
      modulesLead: '25 modules across 6 learning tracks — 100% hands-on, with live client projects.',
      demo: '7-day demo experience',
      audience: ['Students & Graduates', 'Working Professionals', 'Entrepreneurs', 'Freelancers & Creators', 'Career Changers', 'Digital Marketing Enthusiasts'],
      learningModes: ['Offline', 'Online', 'Hybrid', 'Recorded sessions'],
      modules: [
        { title: 'Fundamentals of Modern Marketing', body: 'Digital Marketing Basics & Frameworks · AI Platforms & Practical Prompting · Graphic Design & Basic Video Editing.' },
        { title: 'Performance Marketing', body: 'Google Ads · Meta Ads (Instagram, Facebook, WhatsApp, Threads) · LinkedIn Ads · Snapchat Ads · ChatGPT Ads & JioHotstar Ads · Quora Ads.' },
        { title: 'Social, Content & Influencer Marketing', body: 'Introduction to Social Media Marketing · Content Marketing · Email Marketing & WhatsApp Marketing · Influencer Marketing.' },
        { title: 'WordPress Web Development + Vibe Coding', body: 'Build and launch websites with WordPress, and speed up development with AI-assisted vibe coding.' },
        { title: 'Search Engine Optimisation', body: 'Search Engine Optimisation (SEO) · Advanced AI-Era SEO (GEO & AEO) · Local SEO (GMB Optimisation).' },
        { title: 'E-commerce & Marketplace Management', body: 'Set up and manage online stores and marketplace listings.' },
      ],
      journey: [
        { title: '7-day demo experience', points: ['Attend 7 days of practical classes', 'Experience before you commit'] },
        { title: 'Start your journey', points: ['Join the program', 'Learn the basics of marketing & digital marketing'] },
        { title: 'Master advanced tools & skills', points: ['Google Ads', 'Meta Ads', 'Google Analytics', 'Vibe Coding', 'OTT Ads', 'SEO & GEO', 'WordPress', 'Performance Marketing'] },
        { title: 'Get live industry exposure', points: ['Work on real brands', 'Live projects & campaigns', 'Practical learning'] },
        { title: 'Choose your career path', points: ['Placement', 'Freelancing', 'Startup'] },
        { title: 'Get certified', points: ['Digital Marketing Certification'] },
        { title: '3-month industry internship', points: ['Hands-on experience with our agency partner'] },
        { title: 'Land your dream career', points: ['From student to industry professional'] },
      ],
      internship: { partner: 'Market Pedia', duration: '3-month', body: 'Gain hands-on experience with our agency partner, Market Pedia, and work on real-world projects in a professional agency environment.' },
      completionCertificate: 'Every learner receives an official LDA course completion certificate with a verifiable certificate ID.',
      batches: '{{BATCHES}}',
    },
    {
      slug: 'diploma-in-digital-marketing',
      title: 'Diploma in Digital Marketing Programme',
      detail: false, // no detail page yet: the card links to the enquiry form
      group: 'dm',
      icon: 'badge',
      duration: '6 months',
      meta: '6 months · Includes internship & capstone project',
      description: 'Master AI-Integrated Digital Marketing through our comprehensive 6-month program, offered in collaboration with St Aloysius Deemed University — covering SEO, GEO, website development, video editing, videography, photography, and more.',
      tags: ['Full-Stack DM', 'Client Projects', 'Paid Internship'],
      cta: { label: 'Enquire now', href: '/#enquire' },
    },
    {
      slug: 'advanced-certificate-in-seo-strategy-execution',
      oldPath: '/advanced-certificate-in-seo-strategy-execution/',
      title: 'Advanced Certificate in SEO Strategy & Execution',
      duration: '1 month',
      durationISO: 'P1M',
      hours: 45,
      mode: 'Online / Offline',
      group: 'dm',
      meta: '1 month · 45 hours · Online & offline',
      description: 'Hands-on SEO training covering keyword research, technical SEO and AI-driven strategies — with real website audits and campaign implementation.', // VERIFY
      tags: ['Keyword Research', 'Technical SEO', 'AI SEO', 'Audits'],
      fee: '{{FEE}}',
      modules: [
        { title: 'How search works & SEO strategy', body: 'Crawling, indexing, ranking and setting SEO goals.' },
        { title: 'Keyword research & search intent', body: 'Finding, clustering and prioritising keywords.' },
        { title: 'On-page & content SEO', body: 'Titles, structure, internal linking and content briefs.' },
        { title: 'Technical SEO', body: 'Core Web Vitals, crawlability, schema and site architecture.' },
        { title: 'AI-driven SEO workflows', body: 'Using AI for research, briefs and optimisation at scale.' },
        { title: 'Audits & campaign execution', body: 'Run a full audit on a live website and implement fixes.' },
      ], // {{MODULES}}
      batches: '{{BATCHES}}',
    },
    {
      slug: 'wordpress-development-certificate-program',
      oldPath: '/wordpress-development-certificate-program/',
      title: 'WordPress Development Certificate Program',
      duration: '1 month',
      durationISO: 'P1M',
      hours: 45,
      mode: 'Online / Offline',
      group: 'dm',
      meta: '1 month · 45 hours · Online & offline',
      description: 'Real-world WordPress training covering website planning, plugins, customisation and e-commerce — finishing with a portfolio-ready project.', // VERIFY
      tags: ['Planning', 'Plugins', 'Customisation', 'E-commerce'],
      fee: '{{FEE}}',
      modules: [
        { title: 'Website planning', body: 'Sitemaps, wireframes, domains and hosting.' },
        { title: 'WordPress core setup', body: 'Installation, settings, pages, posts and menus.' },
        { title: 'Themes & customisation', body: 'Building layouts and customising a theme to a brand.' },
        { title: 'Plugins that matter', body: 'SEO, forms, security, speed and backups.' },
        { title: 'E-commerce with WooCommerce', body: 'Products, payments, shipping and orders.' },
        { title: 'Portfolio project', body: 'Ship a complete, portfolio-ready website.' },
      ], // {{MODULES}}
      batches: '{{BATCHES}}',
    },
    {
      slug: 'finpro-finance-cohort',
      title: 'FinPro – Finance Cohort by LDA',
      detail: false, // coming soon: card only, no page
      status: 'soon',
      group: 'more',
      icon: 'coin',
      duration: '2 months',
      meta: '2 months · Finance & analytics cohort',
      description: 'Build practical finance and analytics skills from the ground up — covering Accounting Fundamentals, MS Excel from Basic to Advanced, Power BI from Basic to Advanced, and AI integration for the modern finance workplace.',
      tags: ['Accounting', 'MS Excel', 'Power BI', 'AI Integration'],
      cta: { label: 'Get notified', href: '/#enquire' },
    },
    {
      slug: 'internship-programs',
      title: 'Internship Programs',
      detail: false, // no detail page yet: the card links to the enquiry form
      group: 'more',
      icon: 'briefcase',
      duration: '3 & 6 months',
      meta: '3 & 6 months · HR · Finance · Marketing',
      description: 'Don’t Just Get an Internship Certificate. Get Experience. Work on practical assignments, real projects, and industry workflows across HR, Finance, and Marketing.',
      tags: ['HR', 'Finance', 'Marketing', 'Real Projects'],
      cta: { label: 'Explore Internships', href: '/#enquire' },
    }
  ],

  /* {{TOOL_LOGOS}} — add `logo: '/assets/tools/name.svg'` to show a real mark instead of initials */
  tools: [
    'Google Analytics 4', 'Google Ads', 'Search Console', 'Tag Manager', 'Looker Studio', 'Google Trends',
    'Google Business Profile', 'Meta Ads Manager', 'Meta Business Suite', 'LinkedIn Campaign Manager', 'YouTube Studio', 'WhatsApp Business',
    'ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Midjourney', 'Leonardo AI',
    'Runway', 'ElevenLabs', 'Gamma', 'Jasper', 'Copy.ai', 'Grammarly',
    'SEMrush', 'Ahrefs', 'Ubersuggest', 'Moz', 'Screaming Frog', 'AnswerThePublic',
    'Yoast SEO', 'Rank Math', 'Bing Webmaster', 'WordPress', 'Elementor', 'WooCommerce',
    'Hostinger', 'Canva', 'Adobe Express', 'CapCut', 'Figma', 'Mailchimp',
    'HubSpot', 'Zoho CRM', 'Buffer', 'Hootsuite', 'Later', 'Zapier',
    'Make', 'Notion', 'Trello', 'Hotjar', 'Microsoft Clarity', 'Merchant Center',
  ],

  /* Home "Tools you will master" logo grid.
     slug  -> Simple Icons slug, loaded from https://cdn.simpleicons.org/<slug>
     color -> monogram colour, shown when there is no slug (brand not on the CDN)
              or when the CDN image fails to load.
     mono  -> monogram letters (defaults to the name's initials)
     wide  -> the icon is a wordmark, so draw it larger to stay legible */
  toolShowcase: [
    { name: 'WordPress', slug: 'wordpress', color: '#21759B' },
    { name: 'Google Ads', slug: 'googleads', color: '#4285F4' },
    { name: 'Meta Business Manager', slug: 'meta', color: '#0467DF' },
    { name: 'Screaming Frog', color: '#6DB33F' },
    { name: 'Google Trends', color: '#4285F4' },
    { name: 'Ahrefs', color: '#FF8800' },
    { name: 'Shopify', slug: 'shopify', color: '#7AB55C' },
    { name: 'Meta Business Suite', slug: 'meta', color: '#0467DF' },
    { name: 'Yoast', slug: 'yoast', color: '#A61E69' },
    { name: 'Google Keyword Planner', color: '#4285F4', mono: 'KP' },
    { name: 'Google Analytics', slug: 'googleanalytics', color: '#E37400' },
    { name: 'Google Search Console', slug: 'googlesearchconsole', color: '#458CF5' },
    { name: 'Mailchimp', slug: 'mailchimp', color: '#241C15' },
    { name: 'Hootsuite', slug: 'hootsuite', color: '#FF4C46' },
    { name: 'Ubersuggest', color: '#F26B21' },
    { name: 'Canva', color: '#00C4CC' },
    { name: 'Google Tag Manager', slug: 'googletagmanager', color: '#246FDB' },
    { name: 'Zapier', slug: 'zapier', color: '#FF4F00' },
    { name: 'GMBEverywhere.com', color: '#F05A28' },
    { name: 'Moz', color: '#1B9FDA' },
    { name: 'ChatGPT', color: '#10A37F' },
    { name: 'Gemini', slug: 'googlegemini', color: '#8E75B2' },
    { name: 'Claude', slug: 'claude', color: '#D97757' },
    { name: 'Lovable', color: '#FF5A5F' },
    { name: 'Google AdSense', slug: 'googleadsense', color: '#4285F4' },
    { name: 'Rank Math', color: '#4F46E5' },
    { name: 'Zoho', slug: 'zoho', color: '#E42527', wide: true },
    { name: 'Microsoft Clarity', color: '#0078D4' },
    { name: 'Elementor', slug: 'elementor', color: '#92003B' },
    { name: 'WhatsApp Business', slug: 'whatsapp', color: '#25D366' },
    { name: 'WooCommerce', slug: 'woocommerce', color: '#96588A', wide: true },
    { name: 'Forminator', color: '#1F2A5C' },
    { name: 'Google Antigravity', color: '#4285F4', mono: 'AG' },
    { name: 'NotebookLM', slug: 'notebooklm', color: '#111111' },
    { name: 'Pinterest', slug: 'pinterest', color: '#BD081C' },
    { name: 'Perplexity', slug: 'perplexity', color: '#1FB8CD' },
    { name: 'Gamma', color: '#7C3AED', mono: 'G' },
    { name: 'Quora', slug: 'quora', color: '#B92B27' },
  ],

  why: {
    marquee: ['AI', 'DIGITAL MARKETING', 'FINANCE', 'HR', 'INTERNSHIPS', 'SEO', 'ANALYTICS'],
    cards: [
      { stat: '25', unit: 'modules · 6 tracks', title: 'AI is the method, not an add-on', body: 'From prompting and ChatGPT Ads to GEO, AEO and vibe coding, every track shows how AI is changing the way marketing is really done.', chips: ['Performance Marketing', 'SEO & GEO', 'WordPress + Vibe Coding'], icon: 'spark' },
      { stat: '180', unit: 'hours, all hands-on', title: 'Practice before theory', body: 'Assignments, live campaigns and real client briefs fill the timetable — not slides.', icon: 'hand' },
      { stat: '40+', unit: 'learners freelancing', title: 'Earn While You Learn', body: 'Take on freelance and project work while you study. No guaranteed-income claims — just real opportunity for those who put the work in.', icon: 'coin' },
      { stat: '7', unit: 'day demo', title: 'Try it before you commit', body: 'Sit through seven days of practical classes, meet your mentors, then decide.', icon: 'briefcase' },
      { stat: '3', unit: 'month internship', title: 'Inside a working agency', body: 'After certification, spend three months on real projects with our agency partner, Market Pedia.', icon: 'rocket' },
      { stat: '1st', unit: 'in Mangalore', title: 'Rooted in Mangalore, built for what’s next', body: 'Mangalore’s first Earn While You Learn academy — backed by an MoU with St Aloysius University and taught by working practitioners. Digital Marketing leads today; Finance, HR and internships follow.', chips: ['Online', 'Offline', 'Hybrid', 'Weekend batches'], icon: 'pin' },
    ],
  },

  /* Real reviews. `quote` holds the exact wording we have; paste each learner's
     full review into `full` (VERIFY) — it will replace `quote` on the card.
     They mention "Leaf Digital Academy / LDA": keep verbatim unless the learner OKs an edit. */
  testimonials: [
    { name: 'Ali Musba', role: 'Digital Marketer & Web Developer', quote: 'This course transformed me.', full: '', photo: '' /* {{ALUMNI_PHOTO_1}} */ },
    { name: 'Soumya', role: 'Alumna', quote: 'One of the best institutes in Mangalore.', full: '', photo: '' /* {{ALUMNI_PHOTO_2}} */ },
    { name: 'Nandana G S', role: 'Alumna', quote: '', full: '', photo: '' /* {{ALUMNI_PHOTO_3}} — {{NANDANA_REVIEW_VERBATIM}} */ },
    { name: 'Shazeen Saba', role: 'Certified by Google & SEMrush', quote: 'Truly the best digital marketing course in Mangalore!', full: '', photo: '' /* {{ALUMNI_PHOTO_4}} */ },
    { name: 'Manvith Karkera', role: 'AI-Integrated Program', quote: 'The best academy in Mangalore.', full: '', photo: '' /* {{ALUMNI_PHOTO_5}} */ },
  ],
  /* "Hear from our learners": video reels (9:16, tap to play with sound). No names or companies are shown. */
  storyReels: [4, 1, 2, 3, 5].map((n) => ({ src: `/assets/reels/reel-${n}.mp4`, poster: `/assets/reels/reel-${n}.jpg` })),

  faq: [
    { q: 'Do I need a tech background to learn digital marketing?', a: 'Not at all. The course is open to learners from any academic background — commerce, arts and science students perform exceptionally well.' },
    { q: 'Is this course suitable for college students or working professionals?', a: 'Yes. The course is flexible and beginner-friendly, designed for both college students and working professionals.' },
    { q: 'What certifications will I get after completing the digital marketing course?', a: 'You can earn multiple certifications, including Google, HubSpot and Meta, plus in-house certifications that validate your practical skills and project experience.' },
    { q: 'Can I earn money while learning digital marketing?', a: 'Yes. You can take on freelancing and small projects during the course — we actively encourage our “earn while you learn” model.' },
    { q: 'Do you offer offline digital marketing classes in Mangalore?', a: 'Yes. We offer both online and offline classes. Offline sessions in Mangalore include hands-on workshops, live tasks and face-to-face mentorship.' },
    { q: 'What makes LDA’s digital marketing course different from others in Mangalore?', a: 'We focus on 100% practical learning, AI tool integration, portfolio building and freelancing support — preparing you for self-employment as well as jobs.' },
    { q: 'How much time do I need to dedicate weekly?', a: 'Most learners manage comfortably with 10–14 hours per week. Timings are flexible and the learning is task-based, so it fits around college or work.' },
    { q: 'Will I get to work on real-time projects during the course?', a: 'Yes. You build your portfolio through mock campaigns, local business projects and content strategies.' },
    { q: 'Is English fluency mandatory?', a: 'No. Basic English helps, but fluency is not required — our teaching is accessible to Kannada- and Malayalam-speaking students.' },
    { q: 'What kind of support will I receive after completing the course?', a: 'You get alumni support, freelance guidance and ongoing mentorship. We also help you build your LinkedIn presence and prepare for client or job opportunities.' },
  ],

  form: {
    title: 'Book a Free Career Counselling Call', // {{FORM_TITLE}}
    subtitle: 'Tell us a little about you and a mentor will call you back within one working day.',
    represents: ['Student', 'Graduate', 'Working Professional', 'Business Owner', 'Freelancer'],
    modes: ['Online', 'Offline', 'Weekend', 'Evening'],
    countries: [
      { code: '+91', label: 'India (+91)' },
      { code: '+971', label: 'UAE (+971)' },
      { code: '+966', label: 'Saudi Arabia (+966)' },
      { code: '+974', label: 'Qatar (+974)' },
      { code: '+968', label: 'Oman (+968)' },
      { code: '+965', label: 'Kuwait (+965)' },
      { code: '+1', label: 'USA / Canada (+1)' },
      { code: '+44', label: 'UK (+44)' },
    ],
  },

  founder: {
    name: 'Yoosaful Arshad', // {{FOUNDER_NAME}} — confirm
    title: 'Founder & CEO', // {{FOUNDER_TITLE}}
    message: '{{FOUNDER_MESSAGE}} — A short note from the founder on why LDA exists: practical skills over theory, and helping every learner earn while they learn.',
    photo: '', // {{FOUNDER_PHOTO}}
  },
  mentors: [
    { name: 'Yoosaful Arshad', role: 'Founder & CEO', bio: 'Organic Marketing Consultant with 3+ years of experience in helping businesses grow through effective digital marketing strategies.' },
    { name: 'Gopika E P', role: 'COO', bio: 'Specialises in WordPress development, e-commerce and creative strategy, with 2+ years of experience delivering digital solutions for local and international projects.' },
    { name: 'Ashwathi K', role: 'Digital Marketing Mentor', bio: 'Digital Marketing Mentor and entrepreneur who combines industry knowledge with hands-on training to help students develop practical skills and professional confidence.' },
    // {{MORE_MENTORS}}
  ],

  timeline: [ // About page — {{TIMELINE}} confirm years & milestones
    { year: '{{YEAR}}', title: 'Leaf Digital Academy opens in Mangalore', body: 'Mangalore’s first digital marketing academy starts its first batch.' },
    { year: '{{YEAR}}', title: 'Earn While You Learn model', body: 'Learners begin working on paid freelance projects during the course.' },
    { year: '{{YEAR}}', title: 'MoU with St Aloysius University', body: 'Industry-focused programmes delivered on the university campus.' },
    { year: '2026', title: 'Rebrand to LedxDigitalAcademy', body: 'Same team, same promise — a new name for the next chapter.' },
  ],

  placements: {
    stats: [
      { value: 60, suffix: '+', label: 'Learners trained' },
      { value: 15, suffix: '+', label: 'Learners placed' },
      { value: 40, suffix: '+', label: 'Freelancing while studying' },
      { value: 5, prefix: '₹', suffix: ' LPA', label: 'Highest package' },
    ],
    // Names, companies and card images from the program brochure (each card is a ready-made 851×613 image with transparent corners).
    // Roles are not given there — add `role` when available.
    students: [
      { name: 'Shazeen Saba', card: '/assets/img/placements/shazeen-saba.webp', company: 'Zero Agency' },
      { name: 'Fathimath Sana', card: '/assets/img/placements/fathimath-sana.webp', company: 'Idyaite' },
      { name: 'Soumya Sahukar', card: '/assets/img/placements/soumya-sahukar.webp', company: 'Webtree' },
      { name: 'Deeksha Kulal', card: '/assets/img/placements/deeksha-kulal.webp', company: 'iSARVA Infotech Pvt Ltd' },
      { name: 'Nandana G S', card: '/assets/img/placements/nandana-g-s.webp', company: 'Level Up HR Solutions' },
      { name: 'Salik Mohammed', card: '/assets/img/placements/salik-mohammed.webp', company: 'SQLNest' },
      { name: 'Sathya Raj', card: '/assets/img/placements/sathya-raj.webp', company: 'Mars Web Solution' },
      { name: 'Abdul Manazir', card: '/assets/img/placements/abdul-manazir.webp', company: 'Webuild Group Pvt Ltd' },
    ],
    // "Got Placed" announcement posters (shown on the Placements page). Each is a ready-made 4:5 image.
    // To add one: drop the image in /assets/img/placements/ and add an entry here.
    posters: [
      { name: 'Ayisha Saima', role: 'Admin Cum Digital Marketing Executive', company: 'MR', location: 'Uppinangady, Karnataka', src: '/assets/img/placements/poster-ayisha-saima.webp', w: 1000, h: 1249 },
      { name: 'Dwithi Kotian', role: 'Digital Marketing Executive', company: 'Market Bird', location: 'Mangaluru, Karnataka', src: '/assets/img/placements/poster-dwithi-kotian.webp', w: 1000, h: 1250 },
      { name: 'Jeslita Viona Lobo', role: 'Social Media Executive', company: 'Aspirant Wave', location: 'Mangaluru, Karnataka', src: '/assets/img/placements/poster-jeslita-viona-lobo.webp', w: 1000, h: 1249 },
    ],
  },

  /* "Life at LDA" photo collage. Layout slots by index: 0 = wide banner, 1-2 = left column, 3-5 = right column.
     `pos` is the CSS object-position used when the photo is cropped to fit its slot. */
  life: {
    lead: 'Celebrations, classrooms and the people who make LDA feel like home.',
    /* One gallery: every photo here is laid out together as a mosaic (see lifeSection in tools/pages-home.mjs).
       Give each photo its real width/height: the layout is worked out from the aspect ratios, so adding a photo
       just re-flows the whole mosaic. The order is the reading order (top to bottom inside each column).
       `pos` = the focal point kept when a tile crops the picture. `poster: true` = a picture with writing on it,
       which the layout keeps apart from other posters. Clicking a tile opens the picture full size. */
    photos: [
      { src: '/assets/img/life/team-onam.webp', w: 1800, h: 1350, pos: '50% 62%', alt: 'LDA students and mentors gathered outdoors in traditional Onam attire' },
      { src: '/assets/img/life/classroom.webp', w: 1000, h: 1327, pos: '50% 50%', alt: 'Learners working in groups in the LDA classroom, decorated with paper bunting' },
      { src: '/assets/img/life/birthday-celebration.webp', w: 720, h: 1280, pos: '50% 55%', alt: 'Two LDA team members smiling in front of three celebration cakes' },
      { src: '/assets/img/life/convocation-2026.webp', w: 1200, h: 1500, pos: '50% 50%', poster: true, alt: 'LDA Convocation Ceremony 2026 poster showing graduates in black gowns with red trim holding their certificates' },
      { src: '/assets/img/life/onam-king.webp', w: 1400, h: 673, pos: '52% 30%', alt: 'A team member in a traditional Onam costume with a golden crown and a palm-leaf umbrella' },
      { src: '/assets/img/life/student-awards.webp', w: 1080, h: 1350, pos: '50% 50%', poster: true, alt: 'LDA Student Awards poster: four winners holding their trophies in front of the LDA backdrop' },
      { src: '/assets/img/life/team-lda.webp', w: 1600, h: 906, pos: '50% 55%', alt: 'The LDA team and learners posing together in front of the LDA backdrop' },
      { src: '/assets/img/life/christmas.webp', w: 1400, h: 1050, pos: '50% 45%', alt: 'LDA learners and team in Santa hats celebrating Christmas around a table' },
      { src: '/assets/img/life/lamp-lighting.webp', w: 1400, h: 673, pos: '50% 50%', alt: 'Lighting a ceremonial lamp at an LDA event in front of the LDA backdrop' },
    ],
  },

  blog: {
    intro: 'Your go-to space for practical guides, industry insights, and career-focused learning.',
    author: { name: 'LDA Editorial Team', bio: 'Mentors and practitioners at LedxDigitalAcademy, Mangalore.' }, // {{AUTHOR}}
    posts: [
      { slug: 'leaf-digital-academy-digital-marketing-skills',oldPath: '/leaf-digital-academy-digital-marketing-skills/', title: 'How LedxDigitalAcademy Helps Students Build Real-World Digital Marketing Skills', category: 'About LDA', readTime: 5, excerpt: 'Live projects, AI tools and mentorship — a look at how learners go from beginner to client-ready.', date: null, cover: '' },
      { slug: 'digital-marketing-easy-for-beginners', oldPath: '/digital-marketing-easy-for-beginners/', title: 'Is Digital Marketing Easy to Learn for Beginners?', category: 'Learning', readTime: 6, excerpt: 'What beginners actually find easy, what takes practice, and how to start the right way.', date: null, cover: '' },
      { slug: 'qualifications-for-digital-marketing', oldPath: '/qualifications-for-digital-marketing/', title: 'What Qualifications do you need to learn Digital Marketing?', category: 'Learning', readTime: 5, excerpt: 'Spoiler: skills beat degrees. Here is what matters when you are starting out.', date: null, cover: '' },
      { slug: 'career-opportunities-after-digital-marketing-course', oldPath: '/digital-marketing-tools-for-beginners-2/', title: 'Top Career Opportunities After a Digital Marketing Course', category: 'Careers', readTime: 7, excerpt: 'Jobs, freelancing and agency paths you can take once you have the skills and a portfolio.', date: null, cover: '' },
      { slug: 'digital-marketing-tools-for-beginners', oldPath: '/digital-marketing-tools-for-beginners/', title: 'Digital Marketing Tools Every Beginner Should Know', category: 'Tools', readTime: 6, excerpt: 'The short list of tools worth learning first — and what each one is for.', date: null, cover: '' },
      { slug: 'courses-after-pu-to-start-earning-early', oldPath: '/courses-after-pu-to-start-earning-early/', title: 'Courses After PU That Can Help Students Start Earning Early', category: 'Students', readTime: 6, excerpt: 'Skill-first courses that let PU students start earning while they study.', date: null, cover: '' },
      { slug: 'why-digital-marketing-is-best-career-2026', oldPath: '/why-digital-marketing-is-best-career-2026/', title: 'Why Digital Marketing is the Best Career Option in 2026', category: 'Careers', readTime: 6, excerpt: 'Demand, flexibility and AI — why 2026 is a good year to start a digital career.', date: null, cover: '' },
      { slug: 'high-income-skills-after-pu', oldPath: '/high-income-skills-after-pu/', title: 'High-Income Skills Students Can Start Learning After PU', category: 'Students', readTime: 5, excerpt: 'Skills that pay well, are in demand, and can be learned in months — not years.', date: null, cover: '' },
      { slug: 'traditional-degree-skill-course-mangalore', oldPath: '/traditional-degree-skill-course-mangalore/', title: 'Traditional Degree or Skill Course? A Guide for PU Students in Mangalore', category: 'Students', readTime: 7, excerpt: 'An honest comparison to help PU students in Mangalore choose their next step.', date: null, cover: '' },
    ],
  },

  /* Per-page SEO. Program & blog pages build their own from the data above. */
  seo: {
    home: {
      title: 'Best Digital Marketing Course in Mangalore – LedxDigitalAcademy',
      description: "Mangalore's first Earn While You Learn academy — practical Digital Marketing, Finance and Internship programs built on real projects. LedxDigitalAcademy.",
      keywords: ['digital marketing course in Mangalore', 'digital marketing academy Mangalore', 'AI digital marketing course', 'SEO course Mangalore', 'WordPress course Mangalore', 'earn while you learn', 'courses after PU', 'finance course Mangalore', 'internship programs Mangalore'],
    },
    about: {
      title: 'About LedxDigitalAcademy – Mangalore’s First Digital Marketing Academy',
      description: 'Meet the team behind Mangalore’s first digital marketing academy: our story, mission, mentors and partnership with St Aloysius University.',
    },
    programs: {
      title: 'Our Programs – Digital Marketing, Finance & Internships | LedxDigitalAcademy',
      description: 'Explore LedxDigitalAcademy programs in Mangalore: AI-Integrated Digital Marketing, SEO, WordPress, with Finance and Internship programs on the way.',
    },
    placements: {
      title: 'Placements & Hire From Us – LedxDigitalAcademy Mangalore',
      description: 'See where LedxDigitalAcademy learners work today and hire job-ready digital marketers trained on live client projects.',
    },
    blogs: {
      title: 'Knowledge Hub – Digital Marketing Guides & Career Advice | LedxDigitalAcademy',
      description: 'Practical guides, industry insights and career-focused learning from LedxDigitalAcademy, Mangalore.',
    },
  },

  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

export default CONFIG;
