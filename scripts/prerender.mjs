#!/usr/bin/env node
/**
 * scripts/prerender.mjs
 *
 * WHY THIS EXISTS:
 * AI Nexus is a React SPA deployed on GitHub Pages. GitHub Pages is a pure
 * static host — it only serves files that actually exist on disk. When Google
 * or Bing crawl /tools/rytr, GitHub Pages looks for dist/tools/rytr/index.html,
 * finds nothing, and returns HTTP 404. A 404 response cannot be indexed,
 * regardless of what JavaScript does afterwards.
 *
 * This script runs after `vite build` and creates a real index.html file for
 * every route, each with:
 *   • Correct <title>, <meta description>, canonical URL
 *   • Open Graph + Twitter Card tags
 *   • Schema.org JSON-LD (Review, Article, BreadcrumbList, FAQPage, etc.)
 *
 * Result: every URL returns HTTP 200 with crawlable HTML. React then hydrates
 * on the client side for the interactive experience.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir  = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.join(__dir, '..');
const DIST   = path.join(ROOT, 'dist');
const SITE   = 'https://ainexustools.online';
const AUTHOR = 'Navneet Arya';
const YEAR   = 2026;
const TODAY  = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ── Escape HTML attribute values ─────────────────────────────────────────────
const esc = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// ── Tool data (mirrors constants.ts) ─────────────────────────────────────────
// Slug order matches constants.ts — do not reorder without updating that file.
const TOOLS = [
  {
    slug: 'grammarly', name: 'Grammarly', category: 'Writing',
    tagline: 'AI writing assistant used by 40 million people',
    description: 'Grammarly checks grammar, spelling, tone, and clarity across every app you use — from Gmail to Google Docs. The most widely used AI writing tool in the world.',
    pricing: 'Free + $12/month', bestFor: 'Everyone who writes',
    rating: 4.5, lastTested: 'March 2026', ratingCount: 1240,
  },
  {
    slug: 'writesonic', name: 'Writesonic', category: 'Writing',
    tagline: 'SEO-optimised AI writing for blogs and ads',
    description: 'Writesonic creates SEO-friendly blog posts, Facebook ads, Google ads, and product descriptions. Powered by GPT-4 with a built-in AI chatbot called Chatsonic.',
    pricing: 'Free + from $16/month', bestFor: 'Bloggers & content marketers',
    rating: 4.2, lastTested: 'February 2026', ratingCount: 870,
  },
  {
    slug: 'rytr', name: 'Rytr', category: 'Writing',
    tagline: 'Fast, affordable AI writing for everyone',
    description: 'Rytr is one of the most affordable AI writing tools. Write bios, ads, landing pages, and emails in 30+ languages with a free plan that actually works.',
    pricing: 'Free + $9/month', bestFor: 'Budget-conscious creators',
    rating: 4.0, lastTested: 'April 2026', ratingCount: 650,
  },
  {
    slug: 'quillbot', name: 'Quillbot', category: 'Writing',
    tagline: 'Paraphrase, summarise & improve your writing instantly',
    description: 'Quillbot is the best AI paraphrasing and summarising tool. Rewrite sentences, summarise long articles, check grammar, and detect plagiarism — all in one platform.',
    pricing: 'Free + $9.95/month', bestFor: 'Students & researchers',
    rating: 4.3, lastTested: 'January 2026', ratingCount: 980,
  },
  {
    slug: 'frase', name: 'Frase.io', category: 'Writing',
    tagline: 'Research, write & optimise SEO content in minutes',
    description: 'Frase helps you create SEO-optimised content fast. Research top-ranking pages, generate AI content briefs, and write articles that rank — all in one workflow.',
    pricing: 'From $15/month', bestFor: 'SEO writers & bloggers',
    rating: 4.4, lastTested: 'March 2026', ratingCount: 540,
  },
  {
    slug: 'leonardo-ai', name: 'Leonardo.ai', category: 'Image',
    tagline: 'Production-quality AI image generation for creators',
    description: 'Leonardo.ai creates stunning AI images with exceptional creative control. Train custom models, generate consistent characters, and produce game-ready visual assets.',
    pricing: 'Free + from $12/month', bestFor: 'Creators & game developers',
    rating: 4.5, lastTested: 'February 2026', ratingCount: 1120,
  },
  {
    slug: 'photoroom', name: 'PhotoRoom', category: 'Image',
    tagline: 'AI product photography used by 150 million people',
    description: 'PhotoRoom removes backgrounds and creates professional product photos in seconds. The go-to tool for e-commerce sellers, marketers, and social media creators.',
    pricing: 'Free + $9.99/month', bestFor: 'E-commerce sellers & creators',
    rating: 4.6, lastTested: 'March 2026', ratingCount: 2100,
  },
  {
    slug: 'looka', name: 'Looka', category: 'Image',
    tagline: 'Design your brand logo with AI in minutes',
    description: 'Looka uses AI to generate professional logos and complete brand identities. Answer a few questions, get hundreds of logo options, and own your brand kit outright.',
    pricing: 'From $20 one-time', bestFor: 'Startups & small businesses',
    rating: 4.1, lastTested: 'January 2026', ratingCount: 430,
  },
  {
    slug: 'pictory', name: 'Pictory', category: 'Video',
    tagline: 'Turn your articles and scripts into videos automatically',
    description: 'Pictory converts blog posts, scripts, and long-form content into short branded videos. The fastest way to repurpose written content into video for YouTube or Reels.',
    pricing: 'From $19/month', bestFor: 'Bloggers & content repurposers',
    rating: 4.1, lastTested: 'February 2026', ratingCount: 380,
  },
  {
    slug: 'opus-clip', name: 'Opus Clip', category: 'Video',
    tagline: 'Turn long videos into viral short clips automatically',
    description: 'Opus Clip uses AI to find the most engaging moments in your long videos and turns them into short clips for TikTok, Reels, and YouTube Shorts — automatically.',
    pricing: 'Free + from $19/month', bestFor: 'YouTubers & podcasters',
    rating: 4.3, lastTested: 'March 2026', ratingCount: 760,
  },
  {
    slug: 'invideo', name: 'InVideo AI', category: 'Video',
    tagline: 'Create faceless YouTube videos from a text prompt',
    description: 'InVideo AI generates complete videos from a text prompt — script, voiceover, stock footage, and captions included. Perfect for creating faceless YouTube channels at scale.',
    pricing: 'Free + from $20/month', bestFor: 'Faceless YouTube creators',
    rating: 4.2, lastTested: 'April 2026', ratingCount: 590,
  },
  {
    slug: 'murf-ai', name: 'Murf AI', category: 'Audio',
    tagline: 'Studio-quality AI voiceovers in minutes',
    description: 'Murf AI creates studio-quality voiceovers for videos, presentations, and e-learning using 120+ realistic AI voices across 20 languages. No microphone needed.',
    pricing: 'Free + from $19/month', bestFor: 'Video creators & eLearning',
    rating: 4.4, lastTested: 'January 2026', ratingCount: 670,
  },
  {
    slug: 'podcastle', name: 'Podcastle', category: 'Audio',
    tagline: 'Record, edit and publish podcasts with AI',
    description: 'Podcastle gives you studio-quality recording, AI-powered noise removal, and one-click publishing. Record remotely with guests and let AI clean up the audio automatically.',
    pricing: 'Free + from $11.99/month', bestFor: 'Podcasters & interviewers',
    rating: 4.2, lastTested: 'April 2026', ratingCount: 490,
  },
  {
    slug: 'gamma', name: 'Gamma', category: 'Design',
    tagline: 'Build beautiful presentations and docs with AI',
    description: 'Gamma creates stunning presentations, documents, and webpages from a text prompt. No design skills needed — describe what you want and Gamma builds and styles it.',
    pricing: 'Free + from $8/month', bestFor: 'Founders, students & educators',
    rating: 4.5, lastTested: 'March 2026', ratingCount: 920,
  },
  {
    slug: 'beautiful-ai', name: 'Beautiful.ai', category: 'Design',
    tagline: 'AI presentation software that designs itself',
    description: 'Beautiful.ai automatically designs your slides as you type. Add content and the AI handles layout, alignment, and visual consistency — every slide looks polished.',
    pricing: 'From $12/month', bestFor: 'Business professionals & teams',
    rating: 4.1, lastTested: 'February 2026', ratingCount: 340,
  },
  {
    slug: 'ocoya', name: 'Ocoya', category: 'Marketing',
    tagline: 'Write and schedule social media content 10x faster',
    description: 'Ocoya combines AI caption writing with social media scheduling. Write posts, create visuals, and schedule to Instagram, LinkedIn, Twitter, and more — all in one tool.',
    pricing: 'From $15/month', bestFor: 'Social media managers & creators',
    rating: 4.0, lastTested: 'April 2026', ratingCount: 410,
  },
  {
    slug: 'replit', name: 'Replit', category: 'Coding',
    tagline: 'Build and deploy full apps with AI in your browser',
    description: 'Replit is a browser-based IDE with powerful AI features. Build, run, and deploy complete applications with AI assistance — no setup, no installs, just start coding.',
    pricing: 'Free + from $7/month', bestFor: 'Students & indie developers',
    rating: 4.2, lastTested: 'April 2026', ratingCount: 1380,
  },
  {
    slug: 'notion-ai', name: 'Notion AI', category: 'Productivity',
    tagline: 'AI built directly inside your notes and workspace',
    description: 'Notion AI gives you the power of AI directly inside your notes, docs, and team wikis. Summarise meetings, write drafts, translate, and automate tasks without switching apps.',
    pricing: '$10/month add-on', bestFor: 'Teams & knowledge workers',
    rating: 4.4, lastTested: 'March 2026', ratingCount: 1590,
  },
  {
    slug: 'taskade', name: 'Taskade', category: 'Productivity',
    tagline: 'AI-powered tasks, projects and team collaboration',
    description: 'Taskade combines AI task management, project planning, and team chat in one workspace. Build custom AI agents to automate your workflows and handle repetitive tasks.',
    pricing: 'Free + from $8/month', bestFor: 'Freelancers & small teams',
    rating: 4.2, lastTested: 'April 2026', ratingCount: 520,
  },
];

// ── Compare articles ──────────────────────────────────────────────────────────
const COMPARE_ARTICLES = [
  {
    slug: 'rytr-vs-writesonic',
    title: 'Rytr vs Writesonic (2026): Which AI Writing Tool Is Actually Worth It?',
    metaDescription: 'Comparing Rytr and Writesonic for solopreneurs, freelancers, and content creators. Real pricing, real output quality, and an honest verdict on which AI writer wins in 2026.',
    faqs: [
      { q: 'Is Rytr better than Writesonic?', a: 'Rytr is better value for short-to-medium form content — emails, ad copy, social posts, blog intros — at $9/month unlimited. Writesonic is better for long-form SEO blog posts (1,500+ words) thanks to its Article Writer and built-in SEO tools, but costs significantly more.' },
      { q: 'What is the cheapest AI writing tool between Rytr and Writesonic?', a: 'Rytr is significantly cheaper. The Rytr Saver plan is $9/month for unlimited words. Writesonic\'s comparable plan starts at $16/month and includes word count limits depending on your plan tier.' },
      { q: 'Does Rytr have a free plan?', a: 'Yes. Rytr\'s free plan gives 10,000 characters per month — enough to test the tool properly before committing to a paid plan.' },
      { q: 'Can Writesonic write full blog posts?', a: 'Yes. Writesonic\'s Article Writer generates full 1,500–2,500 word drafts with SEO optimisation built in. This is one of Writesonic\'s strongest advantages over Rytr, which requires manual assembly for long-form content.' },
      { q: 'Which AI writing tool is better for freelancers on a budget?', a: 'Rytr at $9/month unlimited is the better starting point for budget-conscious freelancers worldwide. The unlimited word count and 40+ templates cover most freelance writing needs without overpaying for features you won\'t use.' },
    ],
  },
  {
    slug: 'grammarly-vs-quillbot',
    title: 'Grammarly vs QuillBot (2026): Which Should You Actually Use?',
    metaDescription: 'Grammarly vs QuillBot compared for writers, students, and professionals. Real breakdown of what each tool actually does, where each wins, and which one to use in 2026.',
    faqs: [
      { q: 'Is Grammarly better than QuillBot?', a: 'They do different things. Grammarly is a real-time writing assistant that improves grammar, tone, and clarity as you write. QuillBot is a paraphrasing and rewriting tool for restructuring existing text. If you write original content, use Grammarly. If you rewrite or summarise content regularly, use QuillBot.' },
      { q: 'Can I use both Grammarly and QuillBot together?', a: 'Yes — and many writers do. Use Grammarly while drafting (for grammar and tone feedback), and QuillBot when you need to rephrase or simplify sections. They complement each other rather than overlap.' },
      { q: 'Is QuillBot free?', a: 'QuillBot has a functional free plan with 125-word paraphrasing, a summariser, and a citation generator. Premium is $9.95/month and unlocks all 7 paraphrasing modes and higher word limits.' },
      { q: 'Is Grammarly worth paying for?', a: 'The premium plan ($12/month) is worth it if writing is central to your work. The tone detection, clarity rewrites, and engagement scoring meaningfully reduce editing time for emails, reports, and content.' },
      { q: 'Which is better for students, Grammarly or QuillBot?', a: 'QuillBot is more directly useful for most students — the free paraphraser, citation generator (APA, MLA, Chicago, Harvard), and summariser cover the core academic writing needs. Grammarly is better for students who write a lot of original essays and emails.' },
    ],
  },
  {
    slug: 'podcastle-vs-descript',
    title: 'Podcastle vs Descript (2026): Which Podcast Tool Should You Actually Use?',
    metaDescription: 'Podcastle vs Descript compared for podcasters, indie creators, and remote interviewers. Honest breakdown of recording quality, editing experience, AI features, and real pricing in 2026.',
    faqs: [
      { q: 'Is Podcastle better than Descript?', a: 'For pure podcast recording and audio quality — especially remote guest recording — Podcastle is better. Its Magic Dust AI audio enhancement is best-in-class for noise removal. Descript is better for transcript-based editing, video podcasts, and bulk filler-word removal across long interviews.' },
      { q: 'Does Podcastle record remote guests?', a: 'Yes. Podcastle records each participant locally on their own device and uploads separate high-quality audio tracks. This means recording quality doesn\'t depend on internet connection stability during the call.' },
      { q: 'What is Descript\'s text-based editing?', a: 'Descript transcribes your recording and lets you edit audio or video by editing the text transcript — delete a word in the transcript and the corresponding audio clip is deleted automatically. This makes cutting filler words and restructuring interviews very fast.' },
      { q: 'Is Podcastle free?', a: 'Yes. Podcastle\'s free plan includes unlimited recordings, up to 10 hours of Magic Dust AI enhancement per month, and remote recording for up to 10 participants. Paid plans start at $11.99/month.' },
      { q: 'Which podcast tool is better for beginners?', a: 'Podcastle is easier to get started with. The interface is straightforward, the AI audio cleanup is automatic, and there\'s no new editing paradigm to learn. Descript\'s text-based editing is powerful but takes a learning curve to click into place.' },
    ],
  },
  {
    slug: 'ocoya-vs-buffer-vs-hootsuite',
    title: 'Ocoya vs Buffer vs Hootsuite (2026): Which Social Media Tool Is Actually Worth It?',
    metaDescription: 'Comparing Ocoya, Buffer, and Hootsuite for solopreneurs and small businesses. Real pricing, honest AI features breakdown, and which tool wins for content creators in 2026.',
    faqs: [
      { q: 'Is Ocoya better than Buffer?', a: 'For solo creators and small businesses that also need AI caption writing, Ocoya is the better choice. Buffer is better if you only need scheduling and already have a content pipeline — its interface is cleaner and the free plan is generous.' },
      { q: 'Is Hootsuite worth it for small businesses?', a: 'No. Hootsuite starts at $99/month and is designed for agencies managing 10+ social accounts with team workflows. For small businesses and freelancers, the price is disproportionate to the features you\'ll actually use.' },
      { q: 'What is Ocoya used for?', a: 'Ocoya combines AI social media caption writing with scheduling across Instagram, LinkedIn, Twitter/X, Facebook, TikTok, and Pinterest. It\'s built for creators who want one tool to write and schedule posts instead of using separate tools for each job.' },
      { q: 'Does Buffer have a free plan?', a: 'Yes. Buffer\'s free plan allows 3 social channels and 10 scheduled posts per channel. It\'s a functional free tier for light scheduling use, though the AI features are limited on free.' },
      { q: 'Which social media scheduling tool is best for freelancers on a budget?', a: 'Ocoya at $15/month is the best value for freelancers and small business owners who need both AI caption writing and scheduling in one tool. Buffer at $6/month (or free) is the best option for those who only need scheduling without content creation.' },
    ],
  },
];

// ── HTML manipulation helpers ─────────────────────────────────────────────────
function readTemplate() {
  return fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');
}

/**
 * Injects page-specific meta into the HTML template.
 * Modifies: title, description, canonical, og:*, twitter:*, robots, schemas.
 */
function buildPage(template, { title, description, canonical, schemas = [], robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' }) {
  let html = template;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);

  // Meta description
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${esc(description)}$2`
  );

  // Canonical
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${canonical}$2`
  );

  // OG tags
  html = html
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,       `$1${esc(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,  `$1${esc(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,          `$1${canonical}$2`);

  // Twitter tags
  html = html
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,       `$1${esc(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${esc(description)}$2`);

  // Robots meta
  html = html.replace(
    /(<meta\s+name="robots"\s+content=")[^"]*(")/,
    `$1${robots}$2`
  );

  // Inject page-specific JSON-LD schemas (inserted just before </head>)
  if (schemas.length > 0) {
    const blocks = schemas
      .map(s => `\n    <script type="application/ld+json">\n    ${JSON.stringify(s, null, 2)}\n    </script>`)
      .join('');
    html = html.replace('</head>', `${blocks}\n  </head>`);
  }

  return html;
}

/** Write dist/<routePath>/index.html, creating directories as needed. */
function writeRoute(routePath, html) {
  const dir = path.join(DIST, routePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  console.log(`  ✓  /${routePath}/`);
}

// ── Schema builders ───────────────────────────────────────────────────────────
function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([pos, name, url]) => ({
      '@type': 'ListItem',
      position: pos,
      name,
      item: url,
    })),
  };
}

function reviewSchema(tool, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${tool.name} Review ${YEAR} — Honest Take`,
    description: `${AUTHOR}'s personal review of ${tool.name}: ${tool.tagline}`,
    url: canonical,
    datePublished: TODAY,
    dateModified: TODAY,
    author: {
      '@type': 'Person',
      name: AUTHOR,
      url: `${SITE}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Nexus',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` },
    },
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      applicationCategory: `${tool.category}Application`,
      operatingSystem: 'Web, iOS, Android',
      description: tool.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: tool.pricing,
      },
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: tool.rating,
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: tool.description,
  };
}

function aggregateRatingSchema(tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    name: `${tool.name} — User Ratings on AI Nexus`,
    ratingValue: tool.rating,
    bestRating: '5',
    worstRating: '1',
    ratingCount: tool.ratingCount,
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.name,
    },
  };
}

function articleSchema({ title, description, canonical }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: canonical,
    datePublished: TODAY,
    dateModified: TODAY,
    inLanguage: 'en-US',
    author: {
      '@type': 'Person',
      name: AUTHOR,
      url: `${SITE}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Nexus',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };
}

// ── Sitemap generator ─────────────────────────────────────────────────────────
function generateSitemap() {
  const urls = [];

  // Homepage
  urls.push({ loc: `${SITE}/`, priority: '1.0', freq: 'weekly', mod: TODAY });

  // Static pages
  urls.push({ loc: `${SITE}/about`,       priority: '0.7', freq: 'monthly', mod: TODAY });
  urls.push({ loc: `${SITE}/disclosure`,  priority: '0.3', freq: 'yearly',  mod: TODAY });

  // Compare pages
  for (const a of COMPARE_ARTICLES) {
    urls.push({ loc: `${SITE}/compare/${a.slug}`, priority: '0.95', freq: 'monthly', mod: TODAY });
  }

  // Tool pages — affiliate picks get 0.9, rest 0.8
  const affiliatePicks = new Set(['rytr', 'podcastle', 'ocoya', 'replit', 'taskade']);
  for (const t of TOOLS) {
    urls.push({
      loc: `${SITE}/tools/${t.slug}`,
      priority: affiliatePicks.has(t.slug) ? '0.9' : '0.8',
      freq: 'monthly',
      mod: TODAY,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.mod}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf-8');
  console.log('\n  ✓  /sitemap.xml');
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('\n🔧  Pre-rendering routes for Google & Bing crawlability...\n');

const template = readTemplate();

// ── 1. Tool pages ─────────────────────────────────────────────────────────────
console.log('Tool pages:');
for (const tool of TOOLS) {
  const canonical = `${SITE}/tools/${tool.slug}`;
  const title = `${tool.name} Review ${YEAR} — Honest Take, Pricing & Free Trial | AI Nexus`;
  const description = `${AUTHOR}'s honest ${tool.name} review after personal testing. ${tool.tagline}. Real pros, cons, pricing (${tool.pricing}), and who it's best for.`;

  const schemas = [
    reviewSchema(tool, canonical),
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'AI Tools', `${SITE}/tools`],
      [3, `${tool.name} Review`, canonical],
    ]),
  ];

  writeRoute(`tools/${tool.slug}`, buildPage(template, { title, description, canonical, schemas }));
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

// ── 2. Compare pages ──────────────────────────────────────────────────────────
console.log('\nCompare pages:');
for (const art of COMPARE_ARTICLES) {
  const canonical = `${SITE}/compare/${art.slug}`;
  const schemas = [
    articleSchema({ title: art.title, description: art.metaDescription, canonical }),
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'Comparisons', `${SITE}/compare`],
      [3, art.title, canonical],
    ]),
  ];
  if (art.faqs && art.faqs.length > 0) {
    schemas.push(faqSchema(art.faqs));
  }

  writeRoute(
    `compare/${art.slug}`,
    buildPage(template, { title: `${art.title} | AI Nexus`, description: art.metaDescription, canonical, schemas })
  );
}

// ── 3. About page ─────────────────────────────────────────────────────────────
console.log('\nStatic pages:');
{
  const canonical = `${SITE}/about`;
  const title = `About ${AUTHOR} — The Person Behind AI Nexus Reviews`;
  const description = `${AUTHOR} personally tests every AI tool before recommending it. No sponsored reviews. No copying marketing pages. Testing since 2022 across writing, audio, video, design, and productivity.`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      url: canonical,
      name: title,
      description,
      author: {
        '@type': 'Person',
        name: AUTHOR,
        url: canonical,
        knowsAbout: ['Artificial Intelligence', 'AI Writing Tools', 'Podcast Software', 'Social Media Automation', 'AI Productivity Tools'],
        worksFor: { '@type': 'Organization', name: 'AI Nexus', url: SITE },
      },
    },
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, `About ${AUTHOR}`, canonical],
    ]),
  ];
  writeRoute('about', buildPage(template, { title, description, canonical, schemas }));
}

// ── 4. Disclosure page ────────────────────────────────────────────────────────
{
  const canonical = `${SITE}/disclosure`;
  const title = 'Affiliate Disclosure | AI Nexus';
  const description = `Full affiliate disclosure for AI Nexus. ${AUTHOR} earns a commission when you purchase through links on this site, at no extra cost to you.`;
  writeRoute('disclosure', buildPage(template, {
    title,
    description,
    canonical,
    robots: 'index, follow, nosnippet',
    schemas: [breadcrumbs([[1, 'AI Nexus', SITE], [2, 'Disclosure', canonical]])],
  }));
}

// ── 5. Sitemap ────────────────────────────────────────────────────────────────
generateSitemap();

// ── Done ──────────────────────────────────────────────────────────────────────
const total = TOOLS.length + COMPARE_ARTICLES.length + 2; // +2 = about, disclosure
console.log(`\n✅  ${total} routes pre-rendered. Every URL now returns HTTP 200.\n`);
console.log('   Google Search Console: re-request indexing for all sitemap URLs.');
console.log('   Bing Webmaster Tools: submit sitemap at /sitemap.xml\n');
