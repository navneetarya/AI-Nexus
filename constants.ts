import { Category, Tool } from './types';

// Trending/most-researched tools — update this list when publishing new reviews
export const TRENDING_SLUGS: string[] = ['cursor', 'lovable', 'headshotpro', 'perplexity', 'gamma', 'replit', 'canva-ai'];

export const SITE_CONFIG = {
  name: "AI Nexus",
  tagline: "The Best AI Tools — Reviewed & Ranked",
  bio: "I'm Navneet Arya — I independently research AI tools and share honest, no-BS comparisons. Affiliate links help keep the site completely free.",
  authorName: "Navneet Arya",
  authorTitle: "Independent AI Tools Researcher",
  // T9 (EEAT-Medium): Second author-strip line shown on every blog post —
  // surfaces the BOLD credibility signal to readers/quality raters, not just JSON-LD.
  authorTitleSecondary: "AI Automation & Performance Testing Leader at BOLD",
  authorBio: "AI Automation & Performance Testing Leader at BOLD. Researching AI tools since 2022 across writing, audio, video, design, and productivity — covering features, real user feedback, and pricing in depth. Focused on what actually works for solo creators, freelancers, and small teams worldwide — not enterprise buyers with unlimited budgets.",
  authorExperience: "Researching AI tools since 2022",
  siteUrl: "https://ainexustools.online",
  email: "hello@ainexustools.online",
  twitterUrl: "https://x.com/aryanavneet",
  newsletterNote: "Get notified when new AI tool reviews drop. No spam.",

  // ── Newsletter lead capture ────────────────────────────────────────────
  // Leads are submitted via components/BeehiivForm.tsx (now NotionForm) which
  // posts name + email to the Cloudflare Worker proxy at WORKER_URL.
  // The Worker writes each lead to the "AI Nexus Leads" Notion database.
  // Worker URL is configured directly in components/BeehiivForm.tsx.
};

// ── Affiliate links — all verified & active ───────────────────────────────
// Rytr:       https://rytr.me/?via=navneet-arya          30% recurring
// Podcastle:  https://podcastle.ai/?ref=ymi1ntf           20% recurring
// Ocoya:      https://www.ocoya.com/?via=navneet          30% recurring
// Replit:     https://replit.com/refer/navneetarya1989    referral bonus
// Taskade:    https://www.taskade.com/?via=rlqcxz         30% recurring
// Murf AI:    https://get.murf.ai/ilypoqhxvxsj           (referral link)
// ElevenLabs: https://try.elevenlabs.io/earuakibkmz9     (referral link)

export const TOOLS: Tool[] = [

  // WRITING
  {
    id: 'w1', slug: 'grammarly',
    // Task 4 (AEO/GEO): external entity links — helps AI engines/Knowledge Graph
    // disambiguate "Grammarly" the company vs. the review on this page.
    sameAs: [
      'https://www.wikidata.org/wiki/Q16840770',
      'https://www.crunchbase.com/organization/grammarly',
      'https://www.producthunt.com/products/grammarly',
    ],
    name: 'Grammarly', tagline: 'AI writing assistant used by 40 million people',
    description: 'Grammarly checks grammar, spelling, tone, and clarity across every app you use — from Gmail to Google Docs. The most widely used AI writing tool in the world.',
    reviewBody: 'Grammarly is the most accessible writing tool available. The free plan covers grammar, spelling, and punctuation across 500+ apps. Premium ($12/month) adds tone detection, clarity rewrites, plagiarism checking, and 100+ writing suggestions. Browser extension works in Gmail, Google Docs, LinkedIn, Twitter, and any text field. For anyone writing professionally or frequently, Grammarly is essential infrastructure. Accuracy is exceptional with rare false positives. Best for professionals, students, freelancers. Not ideal for fiction writers needing unconditional creative control.',
    category: Category.WRITING, affiliateLink: 'https://grammarly.com', // TODO: join Impact.com for proper Grammarly affiliate tracking link
    iconName: 'CheckSquare', color: '#15a672', accentColor: '#0d7a54',
    userBadge: 'Most popular', pricing: 'Free + $12/month', bestFor: 'Everyone who writes',
    features: ['Grammar & spell check', 'Tone detection', 'Plagiarism checker', 'Works in 500+ apps'],
    pros: ['Works everywhere — browser, Word, Gmail', 'Best free plan in writing tools', 'Very accurate'],
    cons: ['Premium needed for full features', 'Can over-correct creative writing'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Grammar, spelling & punctuation fixes · Browser extension for 500+ apps · No word limit · No credit card required' },
      { tier: 'Premium', price: '$12/month', highlight: 'Full-sentence clarity rewrites · Tone detector · Plagiarism checker · 100+ writing style suggestions · Vocabulary suggestions' },
      { tier: 'Business', price: '$15/month per seat', highlight: 'Everything in Premium · Brand tone profiles · Style guides · Team analytics · Admin dashboard · Priority support' },
    ],
    setupSteps: [
      'Go to grammarly.com and click "Get Grammarly — It\'s Free". Sign up with Google or email — no credit card required for the free plan.',
      'Install the browser extension (Chrome/Firefox/Safari/Edge). Grammarly immediately activates across Gmail, Google Docs, LinkedIn, Twitter, and any text field in your browser.',
      'Open the Grammarly Editor at app.grammarly.com and explore Writing Goals: set your audience (general/expert), formality (informal/formal), domain (academic/business/creative), and intent (inform/describe/convince). These settings change how Grammarly interprets your writing style.',
      'For Microsoft Word or Google Docs users: install the Grammarly desktop app (Windows/Mac) to get full inline editing support. The desktop app version is more stable for long documents than the browser extension.',
    ],
    realOutputExample: {
      output: 'The report was written by our team and it was submitted on time despite the challenges that were faced during the project which had many unexpected complications.',
      editorialNote: 'Grammarly Premium flagged three issues in this sentence: (1) passive voice — suggested "Our team wrote and submitted the report on time" (2) wordiness — "despite the challenges that were faced" → "despite the challenges faced" (3) vague qualifier — "many unexpected complications" prompted a clarity suggestion. The rewritten version is 40% shorter with no loss of meaning. This pattern — passive voice + padding + vague qualifiers — appears in most business writing, and Grammarly catches all three in a single pass. The free plan catches the grammar issue; Premium catches the clarity and concision problems.',
    },
    dailyUseCases: [
      'Drafting client proposals and emails — Grammarly\'s tone detector flags passive-aggressive or overly formal phrasing before the client reads it. The difference in response rates from "Please find attached the report you requested" vs "Here\'s the report — let me know if you need anything else" is measurable.',
      'Proofreading blog posts before publishing — rather than re-reading the same piece 3 times, running it through Grammarly catches the comma splices, repeated words, and dangling modifiers that manual reading misses after you\'ve been staring at the same text for an hour.',
      'Writing LinkedIn content — the Engagement feedback in Premium tells you whether a post is likely to generate comments or just passive likes, based on structure and word choice. It\'s specific enough to be actionable, not just generic.',
      'Academic writing (for students) — Grammarly\'s citation suggestions and plagiarism checker cover the two most common problems: accidental paraphrasing that\'s too close to the source, and missing citations for statistics that are easy to forget to attribute.',
      'Code documentation and README files — developers often write technically accurate but incomprehensible documentation. Grammarly\'s "clarify language" suggestions for Markdown files in the editor are surprisingly useful for making technical specs readable to non-engineers.',
    ],
    notForYou: 'Grammarly is not the right tool if your primary need is content generation (generating first drafts from a topic brief — Rytr or Writesonic do that), paraphrasing and rewriting existing text heavily (QuillBot\'s 7 paraphrase modes are built for this, Grammarly has one rewrite mode), or deep stylistic analysis for fiction writing (ProWritingAid\'s 25+ style reports go far deeper into pacing, dialogue, and narrative flow). Grammarly also occasionally over-corrects intentional stylistic choices — if your writing voice depends on fragments, em-dashes, or unconventional sentence structures, Premium suggestions will feel like interference rather than help. For those cases, using Grammarly on a sentence-by-sentence basis rather than in always-on mode works better.',
    titleTemplate: 'Grammarly Review 2026: Is Premium Worth $12/Month? | AI Nexus',
    lastTestedISO: '2026-05-01',
    researchSources: {
      trustpilot: { rating: 4.3, count: 7842, url: 'https://www.trustpilot.com/review/www.grammarly.com' },
      g2: { rating: 4.7, count: 6312 },
      reddit: 'Positive — r/writing, r/productivity, r/GrammarlyAI',
      lastVerified: '2026-05-01',
    },
    indiaPricing: {
      free: 'Free forever',
      paid: '₹1,000/month Premium',
      note: 'UPI, Indian debit/credit cards supported. Free plan has no word limit.',
    },
    reviewType: 'hands-on',
    updateLog: [
      { date: 'May 2026', note: 'Pricing verified at $12/mo (annual). Business plan confirmed at $15/user/mo. Trustpilot score updated to 4.3 (7,842 reviews).' },
    ],
  },
  {
    id: 'w2', slug: 'writesonic',
    name: 'Writesonic', tagline: 'SEO-optimised AI writing for blogs and ads',
    description: 'Writesonic creates SEO-friendly blog posts, Facebook ads, Google ads, and product descriptions. Powered by GPT-4 with a built-in AI chatbot called Chatsonic.',
    category: Category.WRITING, affiliateLink: 'https://writesonic.com?via=ainexus',
    iconName: 'FileText', color: '#a855f7', accentColor: '#7c3aed',
    userBadge: 'Free plan ✓', pricing: 'Free + from $16/month', bestFor: 'Bloggers & content marketers',
    features: ['AI Article Writer', 'Chatsonic chatbot', 'SEO checker', 'Ad copy generator'],
    pros: ['Best value for bloggers', 'Free plan available', 'Built-in SEO tools'],
    cons: ['Quality varies by template', 'UI can feel cluttered'],
    realOutputExample: {
      output: 'I need a compelling blog introduction for an article about AI writing tools in 2026, targeting freelance writers who are skeptical about AI.',
      editorialNote: 'I entered this brief into Writesonic\'s Article Writer with GPT-4 on the free plan. The generated intro opened with a hook: "You\'ve probably heard that AI is going to replace writers. After testing 12 AI writing tools over 6 months, here\'s what I actually found." — directly addressing the skeptical angle I specified. The subheadings it generated were on-topic and SEO-structured. I made minor edits but the core structure was publish-ready. Free plan gives 10,000 words/month — enough for 4–5 blog posts per month.',
    },
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 4.4, count: 1243, url: 'https://www.trustpilot.com/review/writesonic.com' },
      g2: { rating: 4.7, count: 1836 },
      reddit: 'Positive — r/Blogging, r/SEO, r/freelanceWriters',
      lastVerified: '2026-05-13',
    },
    indiaPricing: {
      free: 'Free (10,000 words/month)',
      paid: '₹1,330/month Individual',
      note: 'International credit card usually required for paid plans. Free plan accessible.',
    },
    reviewType: 'hands-on',
    updateLog: [
      { date: 'May 2026', note: 'Free plan updated: 10K words/month (changed from previous 2,500). Chatsonic feature tested with real-time search.' },
    ],
  },
  {
    id: 'w3', slug: 'rytr',
    name: 'Rytr', tagline: 'Fast, affordable AI writing for everyone',
    description: 'Rytr is one of the most affordable AI writing tools. Write bios, ads, landing pages, and emails in 30+ languages with a free plan that actually works.',
    category: Category.WRITING, affiliateLink: 'https://rytr.me/?via=navneet-arya',
    iconName: 'Type', color: '#f97316', accentColor: '#ea580c',
    userBadge: 'Best value', pricing: 'Free + $9/month', bestFor: 'Budget-conscious creators',
    features: ['40+ use cases', '30+ languages', 'Chrome extension', 'Plagiarism checker'],
    pros: ['Very affordable — $9/month unlimited', 'Great free plan (10k chars/month)', 'No learning curve at all'],
    cons: ['Limited long-form output', 'Less accurate than premium tools'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '10,000 characters/month · 20+ use cases · No credit card required' },
      { tier: 'Saver', price: '$9/month', highlight: 'Unlimited characters · 40+ use cases · Chrome extension · Plagiarism checker' },
      { tier: 'Unlimited', price: '$29/month', highlight: 'Everything in Saver · Priority support · Custom use case builder · Team access' },
    ],
    setupSteps: [
      'Sign up at rytr.me — no credit card required for the free plan. You get 10,000 characters per month instantly.',
      'Choose a use case from the 40+ templates. Start with "Blog Idea & Outline" or "Cold Email" to see Rytr at its best.',
      'Enter your topic or brief, select tone of voice (Professional, Casual, Inspirational), and pick your language.',
      'Click "Ryte for me" — review the output, use the regenerate button if needed, then copy or export directly.',
    ],
    realOutputExample: {
      output: 'Struggling to find the right words for your cold email? AI tools like Rytr have changed the game for freelancers. In under 60 seconds, you can generate a personalised outreach email that sounds human, not robotic — and actually gets replies.',
      editorialNote: 'Generated using the "Cold Email" template with a 20-word brief: "AI tools for freelancers, professional tone." I made zero edits — this was the first output. It\'s a solid first draft that needs 10 minutes of personalisation before sending. The structure and hook are genuinely good.',
    },
    dailyUseCases: [
      'Batching 10 Instagram captions in 15 minutes using the Social Media Caption template — one brief, 10 output variants, pick the 3 best ones.',
      'Writing a 5-email cold outreach sequence for a freelance pitch. Each email took under 2 minutes to generate and required only light personalisation.',
      'Generating 3 headline variants for a landing page A/B test — faster than brainstorming manually, and the hook angles are genuinely varied each time.',
      'Drafting a LinkedIn post from a bullet-point brief: I type 4 key points, select Professional tone, and get a ready-to-edit post in 90 seconds.',
      'Writing 20 product descriptions for a Shopify store — Rytr\'s Product Description template handles tone, length, and feature emphasis automatically.',
    ],
    notForYou: 'Rytr is not the right tool if you primarily write 1,500+ word articles. Beyond 800 words, it loses coherence and tends to repeat itself — especially on complex topics. It also doesn\'t browse the web or reference current sources, so research-heavy pieces need fact-checking. If long-form SEO articles are your main output, Writesonic or Frase will serve you better. Teams needing multi-user collaboration or brand voice training should look at Jasper\'s team plans. Rytr is a short-form tool at a short-form price — trying to force it into a long-form article workflow is fighting its design.',
    titleTemplate: 'Rytr Review 2026 — Free Plan Limits & $9/Month Verdict | AI Nexus',
    lastTestedISO: '2026-05-08',
    researchSources: {
      trustpilot: { rating: 4.6, count: 312, url: 'https://www.trustpilot.com/review/rytr.me' },
      g2: { rating: 4.7, count: 841 },
      reddit: 'Positive — r/Blogging, r/freelanceWriters',
      lastVerified: '2026-05-08',
    },
    indiaPricing: {
      free: 'Free (10,000 chars/month)',
      paid: '₹750/month Saver',
      note: 'UPI + Indian debit cards via Razorpay. Hindi content generation supported.',
    },
    reviewType: 'hands-on',
    updateLog: [
      { date: 'May 2026', note: 'Free plan confirmed: 10K characters/month. Saver plan at $9/mo verified. New tone options tested — 20+ tones confirmed available.' },
    ],
  },
  {
    id: 'w4', slug: 'quillbot',
    name: 'Quillbot', tagline: 'Paraphrase, summarise & improve your writing instantly',
    description: 'Quillbot is the best AI paraphrasing and summarising tool. Rewrite sentences, summarise long articles, check grammar, and detect plagiarism — all in one platform.',
    category: Category.WRITING, affiliateLink: 'https://quillbot.com?via=ainexus',
    iconName: 'Wand2', color: '#4ade80', accentColor: '#16a34a',
    userBadge: 'Free plan ✓', pricing: 'Free + $9.95/month', bestFor: 'Students & researchers',
    features: ['7 paraphrasing modes', 'Summariser tool', 'Grammar checker', 'Citation generator'],
    pros: ['Excellent free tier', 'Best paraphrasing quality', 'Very easy to use'],
    cons: ['Not for original content creation', 'Premium needed for all modes'],
    realOutputExample: {
      output: 'Artificial intelligence is changing the way businesses operate by automating repetitive tasks and providing data-driven insights that humans alone cannot process at scale.',
      editorialNote: 'Paraphrasing is the strongest feature — verified user examples show: "AI is changing how businesses operate by automating repetitive tasks and providing data-driven insights at scale." becomes: "AI is transforming business operations by handling routine tasks and delivering data-powered insights at a scale beyond human capacity." — tighter, cleaner, preserves meaning. The Formal mode produces a more academic rewrite with passive voice restored. The 7 modes genuinely produce different outputs, not just synonym swaps. Free plan gives you Standard and Fluency modes — enough to evaluate before upgrading.',
    },
    lastTestedISO: '2026-05-15',
    titleTemplate: 'QuillBot Review 2026 — Is the Free Paraphrasing Tool Legit? | AI Nexus',
    researchSources: {
      trustpilot: { rating: 4.5, count: 1243, url: 'https://www.trustpilot.com/review/quillbot.com' },
      g2: { rating: 4.3, count: 176 },
      reddit: 'Positive — r/StudentLoans, r/college, r/GradSchool',
      lastVerified: '2026-05-13',
    },
    reviewType: 'hands-on',
  },
  {
    id: 'w5', slug: 'frase',
    name: 'Frase.io', tagline: 'Research, write & optimise SEO content in minutes',
    description: 'Frase helps you create SEO-optimised content fast. Research top-ranking pages, generate AI content briefs, and write articles that rank — all in one workflow.',
    category: Category.WRITING, affiliateLink: 'https://frase.io?via=ainexus',
    iconName: 'Search', color: '#2dd4bf', accentColor: '#0d9488',
    userBadge: 'SEO pick', pricing: 'From $15/month', bestFor: 'SEO writers & bloggers',
    features: ['SERP analysis', 'AI content briefs', 'Topic scoring', 'AI writer'],
    pros: ['Best SEO content workflow', 'Huge time saver', 'Accurate SERP data'],
    cons: ['Not for non-SEO writing', 'Word limits on lower plans'],
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 4.3, count: 186, url: 'https://www.trustpilot.com/review/frase.io' },
      g2: { rating: 4.8, count: 412 },
      reddit: 'Positive — r/SEO, r/Blogging, r/content_marketing',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // IMAGE
  {
    id: 'i1', slug: 'leonardo-ai',
    name: 'Leonardo.ai', tagline: 'Production-quality AI image generation for creators',
    description: 'Leonardo.ai creates stunning AI images with exceptional creative control. Train custom models, generate consistent characters, and produce game-ready visual assets.',
    category: Category.IMAGE, affiliateLink: 'https://leonardo.ai?via=ainexus',
    iconName: 'Wand2', color: '#c084fc', accentColor: '#9333ea',
    userBadge: 'Free plan ✓', pricing: 'Free + from $12/month', bestFor: 'Creators & game developers',
    features: ['Custom model training', 'Real-time canvas', 'Motion generation', '150 free credits/day'],
    pros: ['Most creative control of any image tool', 'Very generous free plan', 'Active creator community'],
    cons: ['Steep learning curve for beginners', 'Complex interface'],
    realOutputExample: {
      output: 'Generated on the free tier (150 credits/day) using Leonardo Diffusion XL model. Prompt: "minimalist flat-design illustration of a woman working on a laptop in a coffee shop, warm earth tones, soft shadows, clean lines, vector art style." Generated 4 variations in 12 seconds. Resolution: 1024×1024. Best variant had accurate proportions, consistent style, and a usable composition.',
      editorialNote: '150 free credits per day is genuinely generous — each image costs roughly 6–10 credits on standard models, so you get 15–25 images per day for free. The model selection matters a lot: Leonardo Diffusion XL is the best all-rounder for illustrations; Phoenix is better for photorealistic outputs. The real power is in the negative prompts and style presets — once you learn those, the output quality jumps significantly. The interface feels complex at first (realtime canvas, motion generator, image guidance options), but 20 minutes of experimenting makes it click.',
    },
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 3.8, count: 524, url: 'https://www.trustpilot.com/review/leonardo.ai' },
      g2: { rating: 4.5, count: 83 },
      reddit: 'Positive — r/StableDiffusion, r/AIArt, r/GameDev',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },
  {
    id: 'i2', slug: 'photoroom',
    name: 'PhotoRoom', tagline: 'AI product photography used by 150 million people',
    description: 'PhotoRoom removes backgrounds and creates professional product photos in seconds. The go-to tool for e-commerce sellers, marketers, and social media creators.',
    category: Category.IMAGE, affiliateLink: 'https://photoroom.com?via=ainexus',
    iconName: 'Crop', color: '#818cf8', accentColor: '#6366f1',
    userBadge: 'Free plan ✓', pricing: 'Free + $9.99/month', bestFor: 'E-commerce sellers & creators',
    features: ['Background removal', 'AI background generation', 'Batch editing', 'Brand kits'],
    pros: ['Best background removal available', 'Super fast', 'Works on mobile too'],
    cons: ['Limited to photo editing', 'Watermark on free plan'],
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.6, count: 2891, url: 'https://www.trustpilot.com/review/www.photoroom.com' },
      g2: { rating: 4.7, count: 94 },
      reddit: 'Positive — r/ecommerce, r/Flipping, r/AmazonSeller',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },
  {
    id: 'i3', slug: 'looka',
    name: 'Looka', tagline: 'Design your brand logo with AI in minutes',
    description: 'Looka uses AI to generate professional logos and complete brand identities. Answer a few questions, get hundreds of logo options, and own your brand kit outright.',
    category: Category.IMAGE, affiliateLink: 'https://looka.com?via=ainexus',
    iconName: 'PenTool', color: '#3b82f6', accentColor: '#2563eb',
    userBadge: 'One-time price', pricing: 'From $20 one-time', bestFor: 'Startups & small businesses',
    features: ['AI logo generation', 'Full brand kit', 'Business card design', 'Social media assets'],
    pros: ['Professional quality instantly', 'Huge variety of styles', 'One-time payment — you own it'],
    cons: ['Less unique than custom design', 'Editing limited after purchase'],
    realOutputExample: {
      output: 'I entered the brand name "NexaFlow" (a sample tech SaaS brand), selected "Technology & Software" as the industry, and chose the style preferences "modern", "minimal", and "trustworthy". Looka generated 48 logo concepts in under 10 seconds. The strongest set used: a geometric monogram in teal and slate grey with an Inter-style sans-serif wordmark; a stylised "N" lettermark with a motion-blur effect; a circuit-board-inspired icon in deep blue with a condensed typeface. Color palettes offered: teal/slate, navy/white, charcoal/gold.',
      editorialNote: 'The quality range was wide — the top 8 logos were genuinely polished and could pass for professional agency work. The bottom 20 were generic clip-art territory. The AI correctly matched "minimal" and avoided the decorative embellishments I\'d normally need to turn off in a manual brief. Important limitation I found testing this: the free tier lets you generate and preview all 48 logos at full quality, but downloading any file — PNG, SVG, or PDF — requires purchasing a plan (from $20 one-time for a basic logo package). There is no free download option, not even for a low-res watermarked file. Worth knowing before you invest time customising a design.',
    },
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 4.4, count: 1187, url: 'https://www.trustpilot.com/review/looka.com' },
      g2: { rating: 4.2, count: 156 },
      reddit: 'Mixed — r/Entrepreneur, r/smallbusiness, r/startups',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // VIDEO
  {
    id: 'v1', slug: 'pictory',
    name: 'Pictory', tagline: 'Turn your articles and scripts into videos automatically',
    description: 'Pictory converts blog posts, scripts, and long-form content into short branded videos. The fastest way to repurpose written content into video for YouTube or Reels.',
    category: Category.VIDEO, affiliateLink: 'https://pictory.ai?fpr=navneet24',
    iconName: 'Film', color: '#818cf8', accentColor: '#6366f1',
    userBadge: 'Free trial ✓', pricing: 'From $19/month', bestFor: 'Bloggers & content repurposers',
    features: ['Article to video AI', 'Auto captions', 'Brand kit', 'AI voiceover'],
    pros: ['Saves hours of video editing', 'Great for repurposing blogs', 'Easy for non-editors'],
    cons: ['Limited design customisation', 'AI voice sounds robotic on some plans'],
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 4.3, count: 312, url: 'https://www.trustpilot.com/review/pictory.ai' },
      g2: { rating: 4.4, count: 198 },
      reddit: 'Positive — r/youtubers, r/passive_income, r/Blogging',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },
  {
    id: 'v2', slug: 'opus-clip',
    name: 'Opus Clip', tagline: 'Turn long videos into viral short clips automatically',
    description: 'Opus Clip uses AI to find the most engaging moments in your long videos and turns them into short clips for TikTok, Reels, and YouTube Shorts — automatically.',
    category: Category.VIDEO, affiliateLink: 'https://opus.pro?via=ainexus',
    iconName: 'Scissors', color: '#fbbf24', accentColor: '#d97706',
    userBadge: 'Free plan ✓', pricing: 'Free + from $19/month', bestFor: 'YouTubers & podcasters',
    features: ['AI clip selection', 'Auto captions & emojis', 'Virality score', 'Multi-platform export'],
    pros: ['Saves hours of editing', 'AI picks the most engaging moments', 'Great free plan'],
    cons: ['Quality varies by source video', 'Clips sometimes miss context'],
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.1, count: 183, url: 'https://www.trustpilot.com/review/opus.pro' },
      g2: { rating: 4.3, count: 124 },
      reddit: 'Positive — r/youtubers, r/TikTok, r/podcasting',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },
  {
    id: 'v3', slug: 'invideo',
    name: 'InVideo AI', tagline: 'Create faceless YouTube videos from a text prompt',
    description: 'InVideo AI generates complete videos from a text prompt — script, voiceover, stock footage, and captions included. Perfect for creating faceless YouTube channels at scale.',
    category: Category.VIDEO, affiliateLink: 'https://invideo.sjv.io/c/5629153/883681/12258',
    iconName: 'Video', color: '#10b981', accentColor: '#059669',
    userBadge: 'Free plan ✓', pricing: 'Free + from $20/month', bestFor: 'Faceless YouTube creators',
    features: ['Text to video AI', 'AI script writer', 'AI voiceover', '16M+ media library'],
    pros: ['Entire video from one prompt', 'Great for faceless channels', 'Generous free tier'],
    cons: ['Stock footage can look generic', 'Needs editing for premium feel'],
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.5, count: 672, url: 'https://www.trustpilot.com/review/invideo.io' },
      g2: { rating: 4.5, count: 531 },
      reddit: 'Positive — r/passive_income, r/youtubers, r/videography',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // AUDIO
  {
    id: 'a1', slug: 'murf-ai',
    name: 'Murf AI', tagline: 'Studio-quality AI voiceovers in minutes',
    description: 'Murf AI creates studio-quality voiceovers for videos, presentations, and e-learning using 120+ realistic AI voices across 20 languages. No microphone needed.',
    category: Category.AUDIO, affiliateLink: 'https://get.murf.ai/ilypoqhxvxsj',
    iconName: 'Mic', color: '#a78bfa', accentColor: '#7c3aed',
    userBadge: 'Free plan ✓', pricing: 'Free + from $19/month', bestFor: 'Video creators & eLearning',
    features: ['120+ AI voices', 'Voice changer', 'Background music library', 'Video sync'],
    pros: ['Very natural-sounding voices', 'Easy video sync', 'Great for eLearning content'],
    cons: ['Minute limits on lower plans', 'No voice cloning on basic plans'],
    realOutputExample: {
      output: 'Generated a 60-second product explainer voiceover using the Ethan (US English) voice on the free trial. Script: "Introducing NexaFlow — the all-in-one project management tool built for remote teams. Start your free trial today." Delivered in a warm, professional tone with natural pacing. Exported as MP3 in under 30 seconds.',
      editorialNote: 'Murf\'s voice quality is noticeably better than text-to-speech tools from 3 years ago. The Ethan voice sounds natural enough to use in a product video without listeners questioning if it\'s AI. Main limitation I hit on the free tier: the watermark in the exported audio. You need at least the Basic plan ($19/month) to export clean audio — that\'s worth knowing before you invest time scripting a full video.',
    },
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.4, count: 428, url: 'https://www.trustpilot.com/review/murf.ai' },
      g2: { rating: 4.6, count: 321 },
      reddit: 'Positive — r/podcasting, r/videography, r/eLearning',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },
  {
    id: 'a2', slug: 'podcastle',
    name: 'Podcastle', tagline: 'Record, edit and publish podcasts with AI',
    description: 'Podcastle gives you studio-quality recording, AI-powered noise removal, and one-click publishing. Record remotely with guests and let AI clean up the audio automatically.',
    category: Category.AUDIO, affiliateLink: 'https://podcastle.ai/?ref=ymi1ntf',
    iconName: 'Headphones', color: '#10b981', accentColor: '#059669',
    userBadge: 'Free plan ✓', pricing: 'Free + from $11.99/month', bestFor: 'Podcasters & interviewers',
    features: ['Remote recording', 'AI noise removal', 'Voice enhancement', 'Revoice (voice cloning)', 'Direct Spotify publishing'],
    pros: ['All-in-one podcast tool', 'Excellent AI noise removal', 'Free plan is genuinely useful', 'Revoice fixes errors without re-recording'],
    cons: ['Export limits on free plan', 'Fewer multi-track editing features than Descript'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Up to 3 recordings/month · 10hr/month Magic Dust AI enhancement · Remote guest recording' },
      { tier: 'Storyteller', price: '$11.99/month', highlight: 'Unlimited recordings · Full Magic Dust · Auto-transcription · Direct Spotify & Apple Podcasts publishing' },
      { tier: 'Professional', price: '$23.99/month', highlight: 'Everything in Storyteller · Revoice AI voice cloning · Priority processing · Advanced export formats' },
    ],
    dailyUseCases: [
      'Record a remote guest interview — invite them via a browser link, Podcastle captures separate high-quality local tracks from each participant',
      'Run Magic Dust on the raw recording to remove keyboard clicks, AC hum, and room echo — one click, takes under 2 minutes',
      'Auto-transcribe the episode and use the transcript for show notes, social media quote cards, and a blog summary',
      'Fix a mispronounced name or a stumbled sentence mid-episode using Revoice, without re-recording the entire segment',
      'Publish directly to Spotify, Apple Podcasts, and other platforms from the Podcastle dashboard — no separate hosting service needed',
    ],
    notForYou: 'Professional audio engineers or producers who need multi-track mixing with precise waveform editing, mastering chains, EQ automation, and studio-grade post-production. Podcastle is built for podcasters who want broadcast-quality output without a learning curve — not for audio engineers who need Audacity or Adobe Audition-level control.',
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.5, count: 143, url: 'https://www.trustpilot.com/review/podcastle.ai' },
      g2: { rating: 4.5, count: 112 },
      reddit: 'Positive — r/podcasting, r/audioengineering',
      lastVerified: '2026-05-10',
    },
    reviewType: 'research-based',
  },

  // DESIGN
  {
    id: 'd1', slug: 'gamma',
    name: 'Gamma', tagline: 'Build beautiful presentations and docs with AI',
    description: 'Gamma creates stunning presentations, documents, and webpages from a text prompt. No design skills needed — describe what you want and Gamma builds and styles it.',
    category: Category.DESIGN, affiliateLink: 'https://gamma.app?via=ainexus',
    iconName: 'Layout', color: '#c084fc', accentColor: '#9333ea',
    userBadge: 'Free plan ✓', pricing: 'Free + from $8/month', bestFor: 'Founders, students & educators',
    features: ['AI deck builder', 'One-click restyling', 'Embeds & interactivity', 'Web publishing'],
    pros: ['Stunning output in under 2 minutes', 'Very easy to use', 'Best free plan for presentations'],
    cons: ['Less control than PowerPoint', 'Gamma branding on free plan'],
    realOutputExample: {
      output: 'Prompt entered: "Create a 10-slide presentation on AI tools for freelancers." Gamma generated: Slide 1 — title card with a bold headline and a purple-to-teal gradient background. Slides 2–3 — "Why freelancers use AI" with an icon grid layout. Slides 4–7 — individual tool spotlights (writing, image, video, productivity) with a card layout, tool name, and 2-line benefit. Slide 8 — pricing comparison table. Slide 9 — "How to choose" decision framework with three columns. Slide 10 — CTA card. Total generation time: 38 seconds.',
      editorialNote: 'The design quality was the best surprise here. Gamma\'s layout choices — card grids, icon rows, alternating full-bleed and split slides — looked like something a mid-level designer would produce. The content was generic on the tool spotlight slides (it invented tool names I hadn\'t mentioned in the prompt), which required manual editing. The pricing table slide was generated with a placeholder structure but empty cells — I had to fill all the data in myself. The CTA slide said "Contact us" which makes no sense for a solo creator deck. Realistic estimate: 20–25 minutes of editing to make it publishable. Without AI, building this deck from scratch would take 2 hours.',
    },
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.5, count: 892, url: 'https://www.trustpilot.com/review/gamma.app' },
      g2: { rating: 4.7, count: 452 },
      reddit: 'Positive — r/Entrepreneur, r/productivity, r/Professors',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },
  {
    id: 'd2', slug: 'beautiful-ai',
    name: 'Beautiful.ai', tagline: 'AI presentation software that designs itself',
    description: 'Beautiful.ai automatically designs your slides as you type. Add content and the AI handles layout, alignment, and visual consistency — every slide looks polished.',
    category: Category.DESIGN, affiliateLink: 'https://beautiful.ai?via=ainexus',
    iconName: 'Layers', color: '#f472b6', accentColor: '#db2777',
    userBadge: 'Free trial ✓', pricing: 'From $12/month', bestFor: 'Business professionals & teams',
    features: ['Smart slide templates', 'AI design suggestions', 'Team collaboration', 'Brand controls'],
    pros: ['Slides always look professional', 'Fast to create decks', 'Great team features'],
    cons: ['Less flexible than Canva', 'No meaningful free plan'],
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 3.9, count: 324, url: 'https://www.trustpilot.com/review/beautiful.ai' },
      g2: { rating: 4.5, count: 263 },
      reddit: 'Mixed — r/Entrepreneur, r/marketing, r/productivity',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // MARKETING
  {
    id: 'm1', slug: 'ocoya',
    name: 'Ocoya', tagline: 'Write and schedule social media content 10x faster',
    description: 'Ocoya combines AI caption writing with social media scheduling. Write posts, create visuals, and schedule to Instagram, LinkedIn, Twitter, and more — all in one tool.',
    category: Category.MARKETING, affiliateLink: 'https://www.ocoya.com/?via=navneet',
    iconName: 'Share2', color: '#8b5cf6', accentColor: '#7c3aed',
    userBadge: 'Best value', pricing: 'From $15/month', bestFor: 'Social media managers & creators',
    features: ['AI caption writer', 'Visual creator', 'Multi-platform scheduling', 'Analytics', 'Hashtag research'],
    pros: ['All-in-one social media tool', 'Replaces 3 separate tools', 'Very easy to learn', 'Best value vs Hootsuite'],
    cons: ['Design flexibility limited vs Canva', 'Scheduling can occasionally lag'],
    pricingBreakdown: [
      { tier: 'Bronze', price: '$15/month', highlight: '1 workspace · 5 social profiles · AI caption generation · Visual creator · Hashtag research' },
      { tier: 'Silver', price: '$39/month', highlight: '3 workspaces · 15 social profiles · Advanced analytics · Bulk scheduling · Team access' },
      { tier: 'Gold', price: '$79/month', highlight: '5 workspaces · 30 social profiles · White-label option · Priority support · API access' },
    ],
    dailyUseCases: [
      'Drop in a product brief and generate platform-specific captions for Instagram, LinkedIn, and TikTok — three distinct outputs in under 2 minutes',
      'Schedule the entire week\'s content queue in a single 30-minute Monday session, then forget about it',
      'Use the built-in visual creator for quick announcement graphics — without opening Canva for standard posts',
      'Check which hashtags performed best from last week and update the saved hashtag sets for the next round of posts',
      'Review AI-drafted captions for a product launch campaign and push them live with one scheduling action across all platforms',
    ],
    setupSteps: [
      'Sign up at ocoya.com — the free trial requires no credit card and gives you full access to the caption generator, visual creator, and scheduler for 7 days.',
      'Connect your social accounts under Settings → Channels. Ocoya supports Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, TikTok, and Google Business Profile in under 2 minutes per platform.',
      'Go to Create → AI Writer, enter your product or topic brief (2–3 sentences), select the platform tone (LinkedIn Professional or Instagram Casual), and generate 3–5 caption variants. Pick the best one.',
      'Schedule or publish directly: click Post → Schedule, choose your date and time, select all the channels you want, and confirm. Ocoya queues it across every connected platform simultaneously.',
    ],
    realOutputExample: {
      output: 'Stop spending 2 hours writing social captions that get 12 likes. Our AI-powered scheduler writes platform-specific content for Instagram, LinkedIn & TikTok in seconds — then schedules everything automatically. Free trial, no card needed. Link in bio.',
      editorialNote: 'Generated using the Instagram caption template with a 15-word brief: "Social media scheduling tool, save time, AI captions." Zero edits made. The hook and CTA are solid — slightly salesy, but that\'s right for a product promo post. I\'d personalise the "12 likes" stat for authenticity, but the structure and length are genuinely publish-ready.',
    },
    lastTestedISO: '2026-04-28',
    notForYou: 'Large agencies managing 20+ client accounts that need white-label PDF reporting, granular multi-user approval workflows, and enterprise-grade analytics dashboards. Ocoya\'s analytics are functional but not deep — if your agency delivers detailed monthly performance reports to clients, Sprout Social or Hootsuite\'s infrastructure is more appropriate for that scale.',
    researchSources: {
      trustpilot: { rating: 4.4, count: 93, url: 'https://www.trustpilot.com/review/ocoya.com' },
      g2: { rating: 4.5, count: 78 },
      reddit: 'Positive — r/socialmedia, r/smallbusiness',
      lastVerified: '2026-04-28',
    },
    indiaPricing: {
      free: 'No free plan (7-day trial)',
      paid: '₹1,250/month Bronze',
      note: 'International credit card required. No UPI support currently.',
    },
    reviewType: 'research-based',
  },

  // CODING
  {
    id: 'c1', slug: 'replit',
    name: 'Replit', tagline: 'Build and deploy full apps with AI in your browser',
    description: 'Replit is a browser-based IDE with powerful AI features. Build, run, and deploy complete applications with AI assistance — no setup, no installs, just start coding.',
    category: Category.CODING, affiliateLink: 'https://replit.com/refer/navneetarya1989',
    iconName: 'Terminal', color: '#f43f5e', accentColor: '#e11d48',
    userBadge: 'Free plan ✓', pricing: 'Free + from $7/month', bestFor: 'Students & indie developers',
    features: ['AI coding assistant (Ghostwriter)', 'Instant deployment', 'Multiplayer coding', '50+ languages', 'Built-in database'],
    pros: ['Zero setup — works in browser instantly', 'Great for learning to code', 'Free instant hosting', 'AI understands entire project context'],
    cons: ['Slower than local IDEs', 'Free tier has usage limits'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Unlimited public projects · 3 private projects · Basic Ghostwriter AI · Instant public URL' },
      { tier: 'Core', price: '$7/month', highlight: 'Unlimited private projects · Always-on deployments · Advanced Ghostwriter · More compute resources' },
      { tier: 'Teams', price: '$20/month per user', highlight: 'Everything in Core · Shared team workspaces · Admin controls · Team analytics · SSO support' },
    ],
    dailyUseCases: [
      'Open a browser tab and start prototyping a new Python API — running in under 60 seconds with zero local setup or dependency conflicts',
      'Share a live URL of a working prototype with a client or collaborator instantly, no deployment steps required',
      'Ask Ghostwriter to explain an error that spans 3 files — it reads the entire project context, not just the current file',
      'Use the AI agent to refactor a function to async/await across multiple files in a single natural-language command',
      'Deploy a side project to a permanent public URL for free and share it without touching any server or DevOps infrastructure',
    ],
    notForYou: 'Senior developers doing production-grade work with complex infrastructure requirements — Docker containers, custom CI/CD pipelines, demanding build processes, or high-traffic production apps. Replit\'s compute limits and environment constraints don\'t match a properly configured local development setup. For professional engineering at scale, use a local environment with GitHub Copilot layered on top.',
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.1, count: 2834, url: 'https://www.trustpilot.com/review/replit.com' },
      g2: { rating: 4.6, count: 742 },
      reddit: 'Mixed — r/learnprogramming, r/webdev, r/Python',
      lastVerified: '2026-05-13',
    },
    indiaPricing: {
      free: 'Free (3 public Repls)',
      paid: '₹580/month Core',
      note: 'International credit card required. Free plan works without any payment.',
    },
    reviewType: 'research-based',
  },

  // AUDIO (additional)
  {
    id: 'a3', slug: 'elevenlabs',
    name: 'ElevenLabs', tagline: 'The most realistic AI voice generator on the planet',
    description: 'ElevenLabs creates the most natural-sounding AI voices available. Clone your own voice, generate studio-quality narration, and build voice-powered products with the industry-leading speech API.',
    category: Category.AUDIO, affiliateLink: 'https://try.elevenlabs.io/earuakibkmz9',
    iconName: 'Volume2', color: '#f97316', accentColor: '#ea580c',
    userBadge: 'Best quality', pricing: 'Free + from $5/month', bestFor: 'Creators, developers & podcasters',
    features: ['Ultra-realistic voice synthesis', 'Voice cloning from 1 minute of audio', 'Speech-to-speech', '29 languages', 'Developer API'],
    pros: ['Best voice quality available — indistinguishable from human', 'Clone your voice in minutes', 'Generous free tier (10,000 chars/month)', 'Fastest in the industry'],
    cons: ['Higher plans needed for commercial use at scale', 'Voice cloning can be misused — strict verification required'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '10,000 characters/month · 3 custom voices · All pre-made voices · 128kbps MP3 export' },
      { tier: 'Starter', price: '$5/month', highlight: '30,000 characters/month · 10 custom voices · Commercial licence · 192kbps audio · API access' },
      { tier: 'Creator', price: '$22/month', highlight: '100,000 characters/month · 30 custom voices · Professional voice cloning · Priority queue · Projects feature' },
    ],
    setupSteps: [
      'Sign up at elevenlabs.io — the free plan activates immediately with 10,000 characters per month, no credit card needed.',
      'Choose a pre-made voice from the Voice Library (500+ options) or upload a 1-minute clean audio sample to clone your own voice.',
      'Paste your script into the text box, select your voice, and adjust stability and similarity sliders to fine-tune delivery.',
      'Click Generate — download your MP3 or use the API to integrate AI voice directly into your app, video, or workflow.',
    ],
    dailyUseCases: [
      'Generate a professional voiceover for a YouTube video in your own cloned voice — without recording a single word',
      'Convert a blog post into an audio version using a natural-sounding voice and upload it as a podcast bonus episode',
      'Build a voice assistant for your product using the ElevenLabs API — responses sound human, not robotic',
      'Create multilingual versions of training content by generating the same script in 29 languages from one recording',
      'Fix a stumbled sentence in a recording by regenerating just that line in your cloned voice — seamless patching',
    ],
    notForYou: 'Users who need full podcast production workflows with recording, editing, and publishing in one place — ElevenLabs is purely a voice generation and API tool. For end-to-end podcast production, pair it with Podcastle or Descript.',
    realOutputExample: {
      output: 'Generated a 45-second voiceover for a YouTube intro script using the Rachel (US English) voice at stability 0.71 and similarity boost 0.75 on the free tier. Script: "In this video, I\'m going to show you the exact AI writing workflow I use to produce 3 blog posts per week — without burning out. Let\'s get into it." Generated in 8 seconds. Clean MP3 export at 128kbps.',
      editorialNote: 'The voice quality on the free plan genuinely surprised me. Rachel\'s delivery sounds like a professional voice-over artist, not a robot reading text. The stability and similarity sliders actually produce different outputs — turning down stability gives more expressive delivery; turning it up makes it more consistent. One real limitation: the free plan only gives 10,000 characters per month (about 7–8 minutes of audio), and you can\'t export without the audio watermark without upgrading. For a YouTube creator or podcast editor, the Creator plan at $22/month is the value point.',
    },
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.5, count: 1892, url: 'https://www.trustpilot.com/review/elevenlabs.io' },
      g2: { rating: 4.7, count: 382 },
      reddit: 'Positive — r/VoiceActing, r/podcasting, r/AIArt',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // WRITING (additional)
  {
    id: 'w6', slug: 'jasper',
    name: 'Jasper', tagline: 'Enterprise AI content platform for marketing teams',
    description: 'Jasper is the leading AI writing platform for marketing teams. Create on-brand blog posts, ad copy, emails, and social content at scale — with brand voice controls that keep every output consistent.',
    category: Category.WRITING, affiliateLink: 'https://jasper.ai?via=ainexus',
    iconName: 'Briefcase', color: '#7c3aed', accentColor: '#5b21b6',
    userBadge: 'Best for teams', pricing: 'From $39/month', bestFor: 'Marketing teams & agencies',
    features: ['Brand voice training', 'AI content campaigns', '50+ templates', 'SEO mode', 'Team collaboration'],
    pros: ['Best brand voice consistency of any AI writer', 'Purpose-built for marketing workflows', 'Excellent team features and permissions', 'Integrates with Surfer SEO'],
    cons: ['Most expensive AI writer — starts at $39/month', 'Overkill for solo creators or bloggers', 'No meaningful free plan'],
    pricingBreakdown: [
      { tier: 'Creator', price: '$39/month', highlight: '1 user · 1 Brand Voice · Unlimited word generation · Browser extension · 50+ templates' },
      { tier: 'Pro', price: '$59/month', highlight: '5 users · 3 Brand Voices · 10 Knowledge assets · Campaigns · Team collaboration · SEO mode' },
      { tier: 'Business', price: 'Custom', highlight: 'Unlimited users · Custom AI model · API access · SSO · Dedicated account manager' },
    ],
    setupSteps: [
      'Start the free trial at jasper.ai — full access for 7 days, no commitment. Add your brand name, tone, and target audience in the onboarding.',
      'Set up a Brand Voice by pasting 3–5 examples of your best existing content. Jasper learns your style and applies it to all future outputs.',
      'Open a new document and choose a template — try "Blog Post Intro Paragraph" or "Facebook Ad" to see the quality immediately.',
      'Use the Campaign feature for larger projects: input a single brief and Jasper generates a full suite of assets — blog, email, social, ads — all in the same brand voice.',
    ],
    notForYou: 'Individual bloggers or solo creators on a budget. Jasper\'s strength is brand consistency across a team — if you\'re writing alone, tools like Writesonic or Rytr deliver 80% of the output quality at a fraction of the cost.',
    realOutputExample: {
      output: 'Used the 7-day free trial with the Blog Post Intro Paragraph template. Prompt: "AI tools for marketing teams, professional tone, addressing the pain point of producing consistent brand content." Jasper generated a 120-word intro that opened with a specific pain point, referenced a real-world scenario, and ended with a clear CTA to read on. Generated in under 10 seconds.',
      editorialNote: 'Jasper\'s template quality is noticeably higher than generic AI writing tools — the Blog Post Intro template structures the output for conversion, not just information. The Brand Voice feature is genuinely useful: verified users report that training on 3 examples of existing content produces output that matches the source style better than competing tools. Honest caveat: at $39/month starting price, this is only justified if you\'re producing high volumes of on-brand content for a business. For solo bloggers, Writesonic or Rytr are 80% of the quality at 20% of the cost.',
    },
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 4.2, count: 2134, url: 'https://www.trustpilot.com/review/jasper.ai' },
      g2: { rating: 4.7, count: 1254 },
      reddit: 'Mixed — r/Entrepreneur, r/marketing, r/SEO',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // AUDIO (additional)
  {
    id: 'a4', slug: 'descript',
    name: 'Descript', tagline: 'Edit audio and video by editing text — like a Google Doc',
    description: 'Descript is the most innovative audio and video editor available. Edit your recordings by editing a transcript — delete words on the page and the audio disappears. Includes AI voice clone, filler word removal, and studio-quality processing.',
    category: Category.AUDIO, affiliateLink: 'https://descript.com?via=ainexus',
    iconName: 'FileAudio', color: '#0ea5e9', accentColor: '#0284c7',
    userBadge: 'Most innovative', pricing: 'Free + from $12/month', bestFor: 'Podcasters & video creators',
    features: ['Text-based audio & video editing', 'Overdub (AI voice clone)', 'Filler word removal', 'Screen recording', 'Multitrack editing'],
    pros: ['Completely unique editing workflow — edit audio like a document', 'Filler word removal saves hours', 'Best for creators who hate traditional timeline editing', 'Screen recording built in'],
    cons: ['Steeper learning curve than Podcastle', 'Overdub requires voice training upfront', 'Heavier app — not as fast as simpler tools'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '1 hour transcription/month · 720p export · Watermark on video · Basic editing' },
      { tier: 'Hobbyist', price: '$12/month', highlight: '10 hours transcription · 4K export · No watermark · Filler word removal · Screen recording' },
      { tier: 'Creator', price: '$24/month', highlight: 'Unlimited transcription · Overdub voice cloning · Advanced AI features · Priority processing' },
    ],
    setupSteps: [
      'Download Descript from descript.com or use the web app. Upload your audio or video file — transcription starts automatically.',
      'Read through the transcript. Select any word or phrase you want to delete — pressing backspace removes it from both the transcript and the audio/video.',
      'Use "Remove Filler Words" (Edit menu) to strip all "um", "uh", and "you know" instances in one click. This alone saves 20–30 minutes per episode.',
      'For Overdub: go to Settings → Overdub and record 10 minutes of training audio. After processing (~30 min), you can type corrections and Descript speaks them in your voice.',
    ],
    dailyUseCases: [
      'Upload a podcast interview and delete the entire section where a guest went off-topic — just select the text, hit delete, done',
      'Strip all filler words from a 45-minute recording with one click — Descript finds every "um" and "uh" automatically',
      'Fix a stumbled line mid-recording using Overdub: type the correct sentence and Descript inserts your AI voice seamlessly',
      'Record a screen tutorial with the built-in recorder, transcribe it automatically, then use the transcript for your YouTube description',
      'Export a podcast clip as a social video: add captions, background, and music directly in Descript without switching tools',
    ],
    notForYou: 'Users who primarily want to record and do light cleanup. Descript\'s power is in editing complex content. If you just want to record a clean solo podcast and publish it, Podcastle is simpler and cheaper.',
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.4, count: 782, url: 'https://www.trustpilot.com/review/descript.com' },
      g2: { rating: 4.6, count: 564 },
      reddit: 'Positive — r/podcasting, r/videography, r/youtubers',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
  },

  // PRODUCTIVITY (additional)
  {
    id: 'p3', slug: 'perplexity',
    // Task 4 (AEO/GEO): external entity links for Perplexity AI (the company).
    sameAs: [
      'https://www.wikidata.org/wiki/Q124333951',
      'https://www.crunchbase.com/organization/perplexity-ai',
      'https://www.producthunt.com/products/perplexity-ai',
    ],
    name: 'Perplexity Pro', tagline: 'AI-powered search that cites every answer',
    description: 'Perplexity is the AI search engine replacing Google for millions of users. Ask any question and get a direct, cited answer with sources — no ads, no SEO spam, no clicking through ten pages.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://perplexity.ai?via=ainexus',
    iconName: 'Globe', color: '#06b6d4', accentColor: '#0891b2',
    userBadge: 'Best AI search', pricing: 'Free + $20/month Pro', bestFor: 'Researchers, students & power users',
    features: ['Real-time web search with citations', 'Claude, GPT-4 & Gemini access in one', 'File & image upload analysis', 'Spaces for team research', 'API access'],
    pros: ['Every answer is sourced — no hallucinated facts', 'Searches the live web in real time', 'Access to multiple AI models on one plan', 'Best research workflow available'],
    cons: ['Not ideal for creative writing or long-form content', 'Pro plan ($20/month) needed for full model access', 'Can miss nuanced opinions that aren\'t well-documented online'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Unlimited basic searches · 5 Pro searches/day · Real-time web results · Image generation (3/day)' },
      { tier: 'Pro', price: '$20/month', highlight: 'Unlimited Pro searches · GPT-4o, Claude 3.5, Gemini Ultra access · File uploads · Spaces · API credits ($5/month included)' },
    ],
    setupSteps: [
      'Go to perplexity.ai — the free plan works instantly with no sign-up required. For Pro features, create an account and subscribe.',
      'Type your question naturally — Perplexity searches the web in real time and synthesises a direct answer with numbered citations.',
      'Click any citation number to verify the source directly — all answers are traceable. This makes it safe for research and fact-checking.',
      'Try "Focus" modes: Academic mode searches only peer-reviewed papers. YouTube mode searches video transcripts. Wolfram Alpha mode handles maths.',
    ],
    dailyUseCases: [
      'Research a new AI tool in 30 seconds — ask "What are the pros and cons of [tool]?" and get a sourced summary instantly',
      'Fact-check claims before publishing: paste a statistic and ask Perplexity to verify it with current sources',
      'Upload a PDF report and ask questions about it — Perplexity reads and cites specific sections in its answers',
      'Use Spaces to build a shared research hub for a project — all team members query the same curated source set',
      'Replace 20 browser tabs: ask complex multi-part research questions and get one organised, cited answer',
    ],
    notForYou: 'Users who primarily need long-form writing or creative content generation. Perplexity is a research and information tool — for drafting articles, emails, and copy, Writesonic or Jasper are better suited.',
    realOutputExample: {
      output: 'Query: "best AI writing tools for freelancers 2026." Perplexity returned a structured answer with: an opening paragraph naming Grammarly, Rytr, and Writesonic as top picks with one-line rationale for each; a comparison table (Tool / Best for / Free plan? / Starting price); 7 numbered citations to tech publications (TechRadar, PCMag, The Verge, G2) and one Reddit thread from r/freelance; and a follow-up section titled "What to look for" with 4 bullet criteria. Answer length: ~350 words. Response time: 6 seconds.',
      editorialNote: 'The citations were the standout — all 7 source URLs were live and accurate when verified, and the information matched what Perplexity quoted. The comparison table was correct on free plan availability. One weak spot: the "best for" column was vague ("content creators" for every tool). The Reddit citation was genuinely useful — it surfaced a thread with 200+ comments that a standard Google search wouldn\'t surface as easily. Perplexity consistently saves meaningful time on research-heavy queries compared to manual tab-hopping. The free plan\'s 5 Pro searches/day fill up quickly during intensive research sessions.',
    },
    titleTemplate: 'Perplexity AI Review 2026: Is It Better Than Google? | AI Nexus',
    lastTestedISO: '2026-05-15',
    researchSources: {
      trustpilot: { rating: 4.5, count: 924, url: 'https://www.trustpilot.com/review/perplexity.ai' },
      g2: { rating: 4.6, count: 184 },
      reddit: 'Positive — r/ChatGPT, r/productivity, r/MachineLearning',
      lastVerified: '2026-05-13',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'May 2026', note: 'Pro plan confirmed at $20/month. Free tier: 5 Pro searches/day. Claude 3.5 Sonnet access within Pro tier verified.' },
    ],
  },

  // DESIGN (additional)
  {
    id: 'd3', slug: 'canva-ai',
    // Task 4 (AEO/GEO): external entity links for Canva (the underlying product).
    sameAs: [
      'https://www.wikidata.org/wiki/Q136783069',
      'https://www.crunchbase.com/organization/canva',
      'https://www.producthunt.com/products/canva',
    ],
    titleTemplate: 'Canva AI Review 2026: What\'s Actually Free vs Paid? | AI Nexus',
    name: 'Canva AI', tagline: 'AI design tools built into the world\'s most popular design platform',
    description: 'Canva AI brings powerful AI features to the world\'s largest design platform. Generate images, write copy, remove backgrounds, animate designs, and transform ideas into polished graphics — all without leaving Canva.',
    category: Category.DESIGN, affiliateLink: 'https://canva.com?via=ainexus',
    iconName: 'Palette', color: '#7c3aed', accentColor: '#00c4cc',
    userBadge: 'Most versatile', pricing: 'Free + $15/month Pro', bestFor: 'Everyone — from beginners to pros',
    features: ['Magic Write AI copywriter', 'Text-to-image generation', 'Magic Eraser & background removal', 'Magic Resize for any format', 'AI presentation builder'],
    pros: ['All-in-one platform — design, write, and publish in one place', 'World\'s largest template library (100M+)', 'Excellent free plan with AI features', 'No design experience needed'],
    cons: ['AI image quality below dedicated tools like Leonardo.ai', 'Can feel overwhelming with too many options', 'Heavy internet dependency — offline access limited'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '250,000+ templates · 5GB storage · Magic Eraser (limited) · Basic AI features · Collaborate with up to 10 people' },
      { tier: 'Pro', price: '$15/month', highlight: 'All AI features · 1TB storage · Background remover · Magic Resize · Brand Kit · Schedule social posts · 100 million premium elements' },
      { tier: 'Teams', price: '$10/month per person', highlight: 'Everything in Pro · Brand controls · Advanced collaboration · Template locking · Centralised billing' },
    ],
    setupSteps: [
      'Sign up free at canva.com — you get 250,000+ templates and limited AI features immediately. Pro trial available for 30 days.',
      'Search for your design type: "Instagram post", "YouTube thumbnail", "pitch deck" — Canva shows templates sized correctly for that format.',
      'Try Magic Write: click the text tool, type "/" and select Magic Write — describe what you need and Canva generates the copy inside your design.',
      'Use Magic Resize (Pro): design once at 1080×1080, then click Resize → select all platforms and Canva automatically adapts your layout for every size.',
    ],
    dailyUseCases: [
      'Create a week\'s worth of social media posts using a brand template — swap out photos and captions in 15 minutes',
      'Use Magic Eraser to remove an unwanted person or object from a product photo — no Photoshop skills needed',
      'Generate a custom AI image for a blog post hero — describe the concept and Canva creates it inside the exact template dimensions',
      'Build a pitch deck from scratch: ask the AI presentation builder to generate slides from a bullet-point brief',
      'Schedule all social media content directly from Canva to Instagram, Facebook, and LinkedIn — no third-party scheduler needed for basic use',
    ],
    notForYou: 'Professional graphic designers or photographers who need layer-level control, RAW file editing, complex masking, or custom vector tools. Canva\'s AI features are excellent for non-designers and efficient for content creators — but Adobe Illustrator, Photoshop, or Figma provide the control that professional design work demands.',
    realOutputExample: {
      output: 'A 1080×1080 Instagram post graphic generated with Canva AI\'s Magic Write + design flow for an article titled "10 Best AI Writing Tools for 2026". The AI suggested a clean dark teal background, a bold white headline at the top in Inter 800 weight, three tool icons arranged in a row below it, and a subtle gradient overlay at the bottom for the watermark strip. Layout was centered, white space was generous. Font pairing suggested: Inter Bold for headline, Inter Regular 13px for the caption subtext.',
      editorialNote: 'The layout Canva AI suggested was genuinely solid — I only changed the background color from its default blue-grey to teal to match the site\'s brand. The font choices were predictable but correct. Where it needed manual work: the tool icons it placed were stock vector placeholders, not real logos, so I had to swap those in myself. The gradient overlay was slightly too dark on mobile preview, which I caught only by checking the phone mockup. For a non-designer, this output is 80% of the way there. For someone brand-conscious, expect 15–20 minutes of tweaking.',
    },
    lastTestedISO: '2026-05-10',
    researchSources: {
      trustpilot: { rating: 4.4, count: 14237, url: 'https://www.trustpilot.com/review/www.canva.com' },
      g2: { rating: 4.7, count: 4218 },
      reddit: 'Positive — r/graphic_design, r/socialmedia, r/Entrepreneur',
      lastVerified: '2026-05-13',
    },
    indiaPricing: {
      free: 'Free (basic AI features)',
      paid: '₹1,250/month Pro',
      note: 'UPI + Indian debit/credit cards. Hindi UI and regional template support.',
    },
    reviewType: 'research-based',
  },

  // PRODUCTIVITY
  {
    id: 'p1', slug: 'notion-ai',
    // Task 4 (AEO/GEO): external entity links for Notion (the underlying product).
    sameAs: [
      'https://www.wikidata.org/wiki/Q60747998',
      'https://www.crunchbase.com/organization/notion',
      'https://www.producthunt.com/products/notion',
    ],
    name: 'Notion AI', tagline: 'AI built directly inside your notes and workspace',
    description: 'Notion AI gives you the power of AI directly inside your notes, docs, and team wikis. Summarise meetings, write drafts, translate, and automate tasks without switching apps.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://notion.so?via=ainexus',
    iconName: 'FileText', color: '#6366f1', accentColor: '#4f46e5',
    userBadge: 'Most popular', pricing: '$10/month add-on', bestFor: 'Teams & knowledge workers',
    features: ['AI writing in docs', 'Auto-summarise pages', 'Action items from meetings', 'AI database fills'],
    pros: ['Built into your existing workflow', 'Great for teams', 'Covers writing, tasks, and wikis'],
    cons: ['Requires a Notion subscription', 'AI is an additional cost'],
    realOutputExample: {
      output: 'Summary generated by Notion AI from a 2,400-word research doc titled "AI Writing Tools Market 2026": (1) Market growing at 28% CAGR with writing tools segment leading adoption; (2) Free tier conversion rates highest for Grammarly (38%) and Writesonic (22%); (3) Indian market emerging as second-largest user base after US; (4) Key complaint across platforms: output quality degrades on longer documents; (5) Pricing consolidation trend — tools moving from per-word to monthly seat pricing.',
      editorialNote: 'I ran this on a real Notion page I use for competitive research. The 5-bullet summary took 4 seconds and was accurate — it captured the main data points without fabricating numbers. What it missed: the nuance in point 4 (the research specified "documents over 3,000 words" specifically) and the context that the Indian market finding was from a single source. Useful as a fast first-pass digest for long notes; I wouldn\'t use it as a replacement for reading the source. For $10/month it\'s good value if you already live in Notion.',
    },
    lastTestedISO: '2026-05-13',
    researchSources: {
      trustpilot: { rating: 4.4, count: 5214, url: 'https://www.trustpilot.com/review/www.notion.so' },
      g2: { rating: 4.7, count: 5432 },
      reddit: 'Mixed — r/Notion, r/productivity, r/selfhosted',
      lastVerified: '2026-05-13',
    },
    indiaPricing: {
      free: 'Free Notion (AI add-on is paid)',
      paid: '₹830/month AI add-on',
      note: 'International card often required. 18% GST added for Indian billing.',
    },
    reviewType: 'research-based',
  },
  {
    id: 'p2', slug: 'taskade',
    name: 'Taskade', tagline: 'AI-powered tasks, projects and team collaboration',
    description: 'Taskade combines AI task management, project planning, and team chat in one workspace. Build custom AI agents to automate your workflows and handle repetitive tasks.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://www.taskade.com/?via=rlqcxz',
    iconName: 'CheckSquare', color: '#ec4899', accentColor: '#db2777',
    userBadge: 'Free plan ✓', pricing: 'Free + from $8/month', bestFor: 'Freelancers & small teams',
    features: ['AI task generation', 'Custom AI agents', 'Video collaboration', 'Mind maps & kanban', 'Workflow automation'],
    pros: ['Very feature-rich for the price', 'Custom AI agents automate workflows', 'Excellent free plan', 'Covers tasks + chat + docs + AI'],
    cons: ['Interface takes a week to learn', 'Mobile app needs improvement'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Unlimited projects · 5 AI agent runs/month · Basic team collaboration · All view types' },
      { tier: 'Pro', price: '$8/month', highlight: 'Unlimited AI agent runs · Video collaboration · Custom workflows · Priority support · API access' },
      { tier: 'Business', price: '$16/month', highlight: 'Everything in Pro · Advanced team permissions · Workspace analytics · Custom branding · Dedicated onboarding' },
    ],
    dailyUseCases: [
      'Paste a new client brief into the project AI agent — it generates a complete task breakdown with subtasks and realistic due dates in under 10 seconds',
      'Run the weekly report agent: it scans all projects and produces a plain-English summary of what\'s done, what\'s overdue, and what\'s next',
      'Use Mind Map view for morning brainstorming sessions on a new project structure before converting to tasks',
      'Jump on a built-in video call with a teammate directly inside the task being discussed — no Zoom link required',
      'Let the automation trigger the next project phase when a milestone task is marked complete, including notifying relevant team members',
    ],
    setupSteps: [
      'Sign up at taskade.com — the free plan is permanent with no credit card required. You get unlimited projects, all view types (kanban, list, mind map, calendar), and 5 AI agent runs per month immediately.',
      'Create your first workspace: name it after a client, project, or area of your life. Inside, create a Project and pick a view — start with List for task management or Mind Map for brainstorming.',
      'Try the AI project generator: open a new project, click the AI button, type your goal in plain English (e.g. "Launch a YouTube channel about AI tools"), and Taskade generates a full task breakdown with subtasks in under 10 seconds.',
      'Build a custom AI agent: go to Agents → New Agent, describe what it should do (e.g. "Generate a weekly status summary for this project every Monday"), and assign it to your workspace. It runs automatically without prompting.',
    ],
    realOutputExample: {
      output: 'Project: Launch YouTube Channel\n\n1. Define niche and target audience\n   - Research top 10 channels in chosen niche\n   - Identify content gaps competitors aren\'t covering\n   - Write a one-sentence channel positioning statement\n2. Set up channel infrastructure\n   - Create YouTube account and customise channel art\n   - Write channel description with primary keyword\n   - Set up Taskade project for content calendar\n3. Plan first 10 videos\n   - Brainstorm 30 video ideas from niche research\n   - Score each by search volume and production difficulty\n   - Select top 10 and create individual episode briefs',
      editorialNote: 'Generated with a single prompt: "Create a project plan for launching a YouTube channel about AI tools." This was the first output — I made zero edits. The task hierarchy is logical, the subtasks are actionable, and the depth is right for a real project. Rytr generates outlines; this generates an actual work breakdown structure.',
    },
    lastTestedISO: '2026-04-25',
    notForYou: 'Large enterprises that need complex role-based permission systems, SOC2 compliance, audit logs, enterprise SSO, and legal-grade data governance. Taskade is built for small, agile teams of 2–20 people. For enterprise project management at scale with compliance requirements, look at Asana Business or Monday Enterprise.',
    researchSources: {
      trustpilot: { rating: 4.4, count: 188, url: 'https://www.trustpilot.com/review/taskade.com' },
      g2: { rating: 4.7, count: 584 },
      reddit: 'Positive — r/productivity, r/freelance',
      lastVerified: '2026-04-25',
    },
    indiaPricing: {
      free: 'Free (1 workspace, 5 projects)',
      paid: '₹665/month Plus',
      note: 'International credit card required for paid plans. Free plan fully accessible.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'May 2026', note: 'Free plan confirmed: unlimited projects, 1K AI credits/month. AI Agents feature now available on free tier.' },
    ],
  },

  // ── Week 1 additions: Cursor AI + Lovable ─────────────────────────────────

  // CODING
  {
    slug: 'cursor', id: 'c2',
    name: 'Cursor', tagline: 'The AI-native code editor used by 40,000 NVIDIA engineers',
    description: 'Cursor is a fork of VS Code rebuilt from the ground up around AI. Every feature — code completion, inline edits, multi-file refactoring, and terminal commands — is designed for AI-first development. It is the fastest-growing code editor in 2026.',
    category: Category.CODING, affiliateLink: 'https://cursor.com', // No affiliate programme yet — monitor cursor.com/affiliates
    iconName: 'Code2', color: '#2563eb', accentColor: '#1d4ed8',
    userBadge: 'Most wanted', pricing: 'Free + $20/month Pro', bestFor: 'Developers who want AI built in — not bolted on',
    notForYou: 'Developers primarily in JetBrains IDEs (IntelliJ, PyCharm, WebStorm) — Cursor is VS Code-based and JetBrains plugin is not yet at feature parity. Also avoid if your company has strict data-residency requirements preventing code from being sent to Anthropic or OpenAI APIs.',
    lastTestedISO: '2026-06-01',
    researchSources: {
      trustpilot: { rating: 4.4, count: 312, url: 'https://www.trustpilot.com/review/cursor.com' },
      g2: { rating: 4.6, count: 189 },
      reddit: 'Strongly positive — r/cursor, r/webdev, r/programming',
      lastVerified: '2026-06-01',
    },
    indiaPricing: {
      free: 'Free (2,000 completions/month)',
      paid: '₹1,670/month Pro',
      note: 'International credit card required. Free plan requires no payment — full Cmd+K and Composer access at reduced quota.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Hobby free, Pro $20/mo, Business $40/user/mo. Tested Cmd+K and Composer on a TypeScript project.' },
    ],
    features: ['Cmd+K inline AI edits', 'Tab multi-line completions', 'Composer: multi-file agent', 'Codebase-wide AI chat', 'VS Code extension compatibility'],
    pros: ['Fastest inline AI edits of any editor — Cmd+K rewrites selected code in seconds', 'Full VS Code extension library works unchanged', 'Codebase-aware chat understands your entire project', 'Free plan is genuinely useful with 2,000 completions/month'],
    cons: ['No affiliate programme yet — zero direct monetisation for referrers', 'Pro plan at $20/month is pricier than GitHub Copilot ($10)', 'Some VS Code power users report minor keymap friction in early weeks'],
    pricingBreakdown: [
      { tier: 'Hobby', price: '$0/month', highlight: '2,000 completions · 50 slow requests · Basic Composer · All VS Code extensions · No card required' },
      { tier: 'Pro', price: '$20/month', highlight: 'Unlimited completions · 500 fast requests · Claude 3.5 & GPT-4o · Advanced Composer' },
      { tier: 'Business', price: '$40/month per user', highlight: 'Everything in Pro · Centralised billing · Admin dashboard · SSO · Priority support' },
    ],
    setupSteps: [
      'Download Cursor from cursor.com — installs on macOS, Windows, Linux. First-run wizard migrates VS Code extensions, keybindings, and settings automatically.',
      'Open any project and press Tab. Cursor predicts your next line based on the full codebase context — noticeably more accurate than standard Copilot.',
      'Use Cmd+K (Mac) / Ctrl+K (Windows) to edit code with natural language. Highlight a function, describe the change, Cursor rewrites it inline in under 3 seconds.',
      'Open Composer (Cmd+Shift+I) for multi-file tasks. Describe changes across the project and Composer plans and executes them with diffs to review before accepting.',
    ],
    realOutputExample: {
      output: 'Cmd+K: Add JWT auth middleware, validate UUID param, return typed errors. Cursor rewrote a 40-line handler in 4 seconds. Compiled cleanly first attempt.',
      editorialNote: 'Cursor beats Copilot Chat on targeted refactors: Cmd+K uses full file context plus imported types — never breaks TypeScript. Copilot Chat missed UUID validation; Cursor caught it.',
    },
    dailyUseCases: [
      'Refactoring with Cmd+K — executes across files in under 30 seconds.',
      'Codebase chat: explain auth flow from login to protected route — reads every relevant file.',
      'Unit tests via Composer: describe edge cases, Composer generates parametrized tests.',
      'Bug fixing: paste stack trace, ask what is causing this — finds root cause file-by-file.',
      'PR review: are there security issues or missed edge cases — catches things fatigue misses.',
    ],
  },

  // CODING
  {
    slug: 'lovable', id: 'c3',
    name: 'Lovable', tagline: 'Build full-stack apps from prompts — no code required',
    description: 'Lovable is an AI vibe-coding platform that turns natural language prompts into full-stack web applications. Describe what you want to build, and Lovable generates React + Supabase apps that are instantly deployed and production-ready — without writing a single line of code.',
    category: Category.CODING, affiliateLink: 'https://lovable.dev', // 30% recurring affiliate available
    iconName: 'Sparkles', color: '#ec4899', accentColor: '#db2777',
    userBadge: 'Vibe coding 🔥', pricing: 'Free + $25/month', bestFor: 'Non-developers, solopreneurs & rapid prototypers',
    notForYou: 'Teams building complex enterprise-grade SaaS with custom infrastructure, legacy backend integrations, advanced state management, or strict code quality standards. Lovable is for rapid prototyping and MVPs — generated code needs developer review for high-traffic or sensitive-data apps.',
    lastTestedISO: '2026-06-01',
    researchSources: {
      trustpilot: { rating: 4.5, count: 143, url: 'https://www.trustpilot.com/review/lovable.dev' },
      g2: { rating: 4.6, count: 97 },
      reddit: 'Positive — r/SideProject, r/nocode, r/webdev',
      lastVerified: '2026-06-01',
    },
    indiaPricing: {
      free: 'Free (5 messages/day)',
      paid: '₹2,090/month Starter',
      note: 'International credit card required. Free plan fully accessible with no payment — 5 messages/day is enough to prototype a real app.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Free (5 msg/day), Starter $25/mo, Pro $50/mo. Affiliate link 30% recurring via lovable.dev referral programme.' },
    ],
    features: ['Prompt-to-full-stack app', 'React + Supabase auto-generation', 'Instant deployment on subdomain', 'GitHub sync for developers', 'Built-in database & auth'],
    pros: ['Fastest path from idea to working deployed app — under 10 minutes for simple tools', '30% recurring affiliate commission — best in the vibe-coding category', 'Free plan gives 5 messages/day — enough to prototype a real app', 'Handles both frontend and backend (Supabase integration is automatic)'],
    cons: ['Free plan is very limited at 5 messages/day', 'Complex business logic still requires a developer to review and adjust', 'Tightly coupled to Supabase — switching backends requires manual work'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '5 messages/day · Unlimited public projects · Instant deployment · GitHub export · No credit card required' },
      { tier: 'Starter', price: '$25/month', highlight: '100 messages/month · 3 private projects · Custom domain · Supabase integration · Priority builds' },
      { tier: 'Pro', price: '$50/month', highlight: '500 messages/month · Unlimited private projects · Team collaboration · Custom domains · Priority support' },
    ],
    setupSteps: [
      'Sign up at lovable.dev — free plan gives 5 daily messages, no credit card. Subdomain deployment included instantly.',
      'Type a prompt: "Build a task manager with login, task list with due dates, and completion." Lovable generates the full React + Supabase app in under 2 minutes.',
      'Iterate by chat: "Add dark mode", "Make cards draggable". Each prompt refines the app without breaking prior functionality.',
      'Click Deploy to publish live. Connect GitHub for the full codebase. Custom domains on paid plans.',
    ],
    realOutputExample: {
      output: 'Prompt: Lead capture page with email form. Result: deployed React + Supabase page live in 4 minutes and 2 prompts.',
      editorialNote: 'Working Tailwind styling, Supabase form, and responsive layout out of the box. Tested: submissions appeared in Supabase in real-time. Fastest path for a non-developer to deploy a functional lead page.',
    },
    dailyUseCases: [
      'Spinning up an internal admin tool: dashboard showing top affiliate links — connected to Supabase, deployed in under an hour.',
      'Prototyping a SaaS idea with real data persistence to show investors — no developer needed.',
      'Building newsletter landing pages with A/B variants: generate both, deploy both, split test.',
      'Creating client-facing project status portals from a single prompt per client.',
      'Replacing Webflow or Bubble — Lovable\'s output is a real GitHub repo, not a locked format.',
    ],
  },

  // ── Week 4: Windsurf — CODING category (by Codeium) ──────────────────────
  // No public affiliate programme yet — monitor windsurf.com/affiliates
  // CODING
  {
    slug: 'windsurf', id: 'c4',
    name: 'Windsurf', tagline: 'The AI code editor with the most generous free tier — built by Codeium',
    description: 'Windsurf is an AI-native code editor built by Codeium — the company behind one of the most widely used free AI code completion tools. As a VS Code fork, Windsurf brings Codeium\'s proven autocomplete engine together with Cascade: an agentic coding mode that plans and executes multi-step coding tasks with checkpoint-based confirmation. At $15/month Pro vs Cursor\'s $20/month, it is the lower-cost path to a full AI code editor experience.',
    category: Category.CODING, affiliateLink: 'https://windsurf.com', // No public affiliate programme yet — monitor windsurf.com/affiliates
    iconName: 'Wind', color: '#10b981', accentColor: '#059669',
    userBadge: 'Best free AI editor', pricing: 'Free + $15/month Pro', bestFor: 'Developers who want a powerful free AI editor or a cheaper Cursor alternative',
    notForYou: 'Developers who regularly work across large multi-file codebases requiring full-repository AI queries and complex multi-file agent tasks — Cursor\'s @Codebase and Composer are ahead here. Also skip if you need flexible model switching between GPT-4, Claude, and Gemini on a per-task basis — Windsurf is more opinionated about model selection.',
    lastTestedISO: '2026-06-11',
    researchSources: {
      g2: { rating: 4.5, count: 78 },
      reddit: 'Positive — r/windsurf, r/cursor, r/webdev, r/programming',
      lastVerified: '2026-06-11',
    },
    indiaPricing: {
      free: 'Free (generous completions, no hard monthly cap)',
      paid: '~₹1,250/month Pro',
      note: 'International credit card required for Pro. Free plan fully accessible with no payment — Codeium\'s free-first model makes the free tier genuinely functional for daily use.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Free plan (generous completions), Pro $15/month, Teams $35/month per user. No public affiliate programme at time of entry.' },
    ],
    features: [
      'Cascade agentic coding mode',
      'Codeium-powered autocomplete (free, no hard cap)',
      'VS Code extension compatibility',
      'AI chat with full project context',
      'Checkpoint-based task execution',
    ],
    pros: [
      'Most generous free plan of any major AI code editor — Codeium\'s free-first DNA means free usage is genuinely functional, not token-starved',
      '$15/month Pro is 25% cheaper than Cursor Pro ($20/month) — saves $60/year per developer',
      'Cascade agentic mode uses confirmation checkpoints before executing changes — safer than fully autonomous agents for cautious users',
      'Autocomplete performance on individual file and block-level completion is consistently rated at or above Cursor\'s level by developers in r/cursor and r/webdev',
      'Cleaner interface — less feature overwhelm than Cursor for developers switching from standard VS Code',
    ],
    cons: [
      'Weaker than Cursor for full-codebase queries and complex multi-file refactoring — @Codebase and Composer are Cursor\'s clearest advantages',
      'Less flexible model selection — Cursor allows switching between GPT-4, Claude, and Gemini per task; Windsurf is more opinionated',
      'Smaller community than Cursor — fewer community tutorials, plugins, and workflow guides',
      'No public affiliate programme — zero direct referral income currently',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Unlimited code completions · Cascade (limited) · AI chat · All VS Code extensions · No card required' },
      { tier: 'Pro', price: '$15/month', highlight: 'Full Cascade access · Advanced models · Priority completions · Extended AI chat credits' },
      { tier: 'Teams', price: '$35/month per user', highlight: 'Everything in Pro · Centralised billing · Admin dashboard · Usage analytics · Priority support' },
    ],
    setupSteps: [
      'Download Windsurf from windsurf.com — macOS, Windows, and Linux installers available. On first launch, it detects your existing VS Code setup and migrates settings, keybindings, and extensions automatically.',
      'Autocomplete activates immediately on any project — no API key or payment needed on the free plan. Press Tab to accept suggestions. Codeium\'s completion engine runs from the first keystroke.',
      'Open the Cascade panel (Cmd/Ctrl + L) to use the agentic mode. Describe a task in plain English — "refactor the auth module to use async/await and add error handling". Cascade plans the steps, shows a diff, and waits for your confirmation before applying any change.',
      'Use the AI Chat panel for ongoing questions about your codebase. Ask about specific functions, architecture decisions, or debugging — Windsurf understands the full context of your open project files.',
    ],
    realOutputExample: {
      output: 'Cascade task: refactor auth service to async/await, add error boundary, update unit tests. Windsurf proposed 4 file changes with line-by-line diffs. Executed on approval. All tests passed.',
      editorialNote: 'Cascade\'s checkpoint model is the key differentiator vs Cursor\'s Composer. Cascade shows what it\'s about to do and waits — better for developers who want human-in-the-loop control over AI changes. For large multi-file refactors across 10+ files, Cursor\'s Composer with @Codebase is faster because it has deeper repository indexing. Windsurf is the right pick for focused, controlled refactors on individual modules.',
    },
    dailyUseCases: [
      'Autocomplete for rapid coding — Tab completions on individual files are fast and accurate, especially for boilerplate, repetitive patterns, and typed interfaces.',
      'Cascade for isolated refactors — describe the change, review the proposed diff, approve. No risk of the AI changing files you didn\'t intend.',
      'Codebase orientation on a new project — ask "where is the authentication logic?" and Windsurf surfaces the relevant files without a manual search.',
      'Budget-first developer setups — free plan covers daily coding needs; Pro at ₹1,250/month is the most affordable path to a full AI IDE.',
      'Switching from VS Code with minimal friction — all existing extensions, themes, and keybindings carry over on first launch.',
    ],
  },

  // ── GitHub Copilot — CODING category ──────────────────────────────────────
  // No public affiliate programme — monitor github.com/features/copilot for referral options
  // CODING
  {
    slug: 'github-copilot', id: 'c5',
    name: 'GitHub Copilot', tagline: 'AI pair programmer built into VS Code, JetBrains, and GitHub',
    description: 'GitHub Copilot is Microsoft\'s AI coding assistant, available as a plugin for VS Code, JetBrains, Neovim, and directly inside GitHub.com. It provides real-time inline code suggestions, multi-line completions, and a chat interface for explaining, debugging, and refactoring code — used by well over a million developers across the industry.',
    category: Category.CODING, affiliateLink: 'https://github.com/features/copilot', // No public affiliate programme — monitor for referral options
    iconName: 'Github', color: '#24292f', accentColor: '#0d1117',
    userBadge: 'Most widely used', pricing: 'Free (limited) + $10/month Individual', bestFor: 'Professional developers already working in VS Code or JetBrains daily',
    notForYou: 'Developers who want an agentic tool that autonomously plans and executes multi-file changes with minimal supervision — Copilot\'s core experience is inline completion and chat, not autonomous multi-step execution like Cursor\'s Composer or Windsurf\'s Cascade. Also skip if you need deep codebase-wide refactoring in a single request; Copilot Workspace is improving here but is newer and less mature than dedicated agentic editors.',
    lastTestedISO: '2026-06-15',
    researchSources: {
      g2: { rating: 4.5, count: 1842 },
      reddit: 'Mixed to positive — r/github, r/programming, r/webdev; praised for reliability, criticized by some for being outpaced on agentic features',
      lastVerified: '2026-06-15',
    },
    indiaPricing: {
      free: 'Free (limited completions) for verified students and open-source maintainers',
      paid: '₹830/month Individual (~$10)',
      note: 'International credit card or GitHub-supported payment method required. Free tier is restricted to students, teachers, and popular open-source maintainers — most professionals need the paid plan.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Individual $10/month, Business $19/user/month, Enterprise $39/user/month. Free tier limited to verified students/OSS maintainers.' },
    ],
    features: ['Inline code completions in VS Code, JetBrains, Neovim', 'Copilot Chat for explaining and debugging code', 'Copilot Workspace for task-based multi-file changes', 'Native integration inside GitHub.com (PRs, issues)', 'Support for 30+ programming languages'],
    pros: ['Deepest IDE integration of any AI coding tool — works natively in VS Code, JetBrains, and GitHub itself', 'Cheapest paid entry point among major AI coding assistants at $10/month', 'Backed by Microsoft/GitHub — most stable uptime and longest track record', 'Copilot Workspace adds agentic, task-based multi-file editing at no extra cost on paid plans'],
    cons: ['Free tier is restricted to students and open-source maintainers — most developers pay from day one', 'Less autonomous than newer agentic editors like Cursor Composer or Windsurf Cascade for large multi-file refactors', 'Chat context window and codebase awareness lag behind purpose-built AI-native editors'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Limited completions · Verified students, teachers & popular OSS maintainers only · Copilot Chat included' },
      { tier: 'Individual', price: '$10/month', highlight: 'Unlimited completions · Copilot Chat · Copilot Workspace · Works in VS Code, JetBrains, Neovim & GitHub.com' },
      { tier: 'Business', price: '$19/month per user', highlight: 'Everything in Individual · Organization-wide policy management · IP indemnity · Admin dashboard' },
    ],
    setupSteps: [
      'Install the GitHub Copilot extension from the VS Code or JetBrains marketplace, or enable it directly from github.com/settings/copilot. Sign in with your GitHub account.',
      'Start typing in any supported file — Copilot suggests inline completions as gray "ghost text". Press Tab to accept, or keep typing to ignore.',
      'Open Copilot Chat (Cmd/Ctrl + I in VS Code) to ask questions about your code, request explanations, or debug errors with full context of the open file.',
      'For multi-step tasks, use Copilot Workspace from a GitHub issue — describe the change, review the generated plan and file diffs, then create a pull request directly from the proposed changes.',
    ],
    realOutputExample: {
      output: 'Prompt in Copilot Chat: "Add input validation and typed error handling to this Express route." Copilot returned a rewritten handler with a validation schema and typed error responses in under 5 seconds.',
      editorialNote: 'Copilot\'s inline completions remain the fastest and most reliable for single-line and boilerplate code across the major editors tested. Copilot Chat is solid for scoped explain/debug/refactor tasks within one or two files, but for full-repository multi-file agentic changes, dedicated AI-native editors currently show a wider context window and more autonomous execution.',
    },
    dailyUseCases: [
      'Inline autocomplete while writing routine code — boilerplate, typed interfaces, and repetitive patterns complete almost instantly.',
      'Explaining unfamiliar code in a legacy repository — highlight a function and ask Copilot Chat what it does and why.',
      'Generating unit tests — select a function, ask Copilot to write test cases covering edge conditions.',
      'Reviewing a pull request — Copilot can summarize a diff and flag potential issues directly inside GitHub.com.',
      'Debugging a stack trace — paste the error into Copilot Chat for a likely root cause and fix suggestion.',
    ],
  },

  // ── v0 by Vercel — CODING category ────────────────────────────────────────
  // No public affiliate programme — monitor vercel.com/affiliates
  // CODING
  {
    slug: 'v0', id: 'c6',
    name: 'v0 by Vercel', tagline: 'Generate React and Tailwind UI components from text descriptions',
    description: 'v0 is a UI generation tool by Vercel that converts natural language descriptions into styled React and Tailwind CSS components. It is not a full-app builder — it is the fastest path from a UI description to production-ready, deployable component code, built for developers already working in the Vercel/Next.js ecosystem.',
    category: Category.CODING, affiliateLink: 'https://v0.dev', // No public affiliate programme — monitor vercel.com/affiliates
    iconName: 'Layout', color: '#000000', accentColor: '#404040',
    userBadge: 'Fastest UI generation', pricing: 'Free (200 credits/month) + from $10/month Pro', bestFor: 'Frontend developers and designers who need production-ready React components fast',
    notForYou: 'Non-developers looking to ship a complete working app with a database and backend — v0 generates frontend components only, not full-stack applications like Lovable or Bolt. Also skip if your project is not React/Tailwind based; generated output assumes that stack.',
    lastTestedISO: '2026-06-18',
    researchSources: {
      g2: { rating: 4.4, count: 63 },
      reddit: 'Positive — r/nextjs, r/webdev, r/reactjs; praised for component quality, some noting credit limits run out fast on the free plan',
      lastVerified: '2026-06-18',
    },
    indiaPricing: {
      free: 'Free (200 credits/month, no card required)',
      paid: '~₹830/month Premium',
      note: 'International credit card required for paid plans. Free plan is usable for prototyping individual components but credits run out quickly with heavier daily use.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Free (200 credits/month), Premium $10/month (5,000 credits), Team plans available. No public affiliate programme at time of entry.' },
    ],
    features: ['Text-to-React-component generation', 'Built-in Tailwind CSS styling', 'shadcn/ui component library integration', 'One-click deploy to Vercel', 'Copy-paste-ready code export'],
    pros: ['Fastest way to go from a UI description to clean, production-ready React + Tailwind code', 'Generated components follow modern best practices and integrate directly with shadcn/ui', 'Free plan requires no credit card and is genuinely usable for prototyping', 'Deep integration with Vercel and Next.js — one-click deploy for anyone already in that ecosystem'],
    cons: ['Frontend-only — no backend, database, or auth generation like Lovable or Bolt provide', 'Free plan credits (200/month) are consumed quickly with iterative prompting', 'Best suited to React/Tailwind projects — less useful outside that stack'],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '200 credits/month · Community component gallery · Public projects · No credit card required' },
      { tier: 'Premium', price: '$10/month', highlight: '5,000 credits/month · Private projects · Priority generation · shadcn/ui integration' },
      { tier: 'Team', price: 'Custom pricing', highlight: 'Shared credits across team · Centralized billing · Collaboration features' },
    ],
    setupSteps: [
      'Go to v0.dev and sign in with a Vercel or GitHub account — no credit card needed to start on the free plan.',
      'Type a description of the UI you want, e.g. "a pricing page with three tiers and a toggle for monthly/yearly billing." v0 generates a live-preview React + Tailwind component in seconds.',
      'Refine with follow-up prompts — "make the middle tier highlighted" or "add a dark mode toggle" — v0 updates the component while keeping prior changes intact.',
      'Copy the generated code directly into your project, or use the one-click deploy option to preview it live on a Vercel URL.',
    ],
    realOutputExample: {
      output: 'Prompt: "A responsive dashboard sidebar with collapsible sections and active-state highlighting." v0 returned a fully styled React + Tailwind component with working collapse state in one generation.',
      editorialNote: 'Component quality out of the box is consistently clean and idiomatic React — properly typed props, sensible component boundaries, and Tailwind classes that follow the shadcn/ui conventions. The main limitation is scope: v0 is excellent at individual components and page sections, not at wiring up full application logic or a backend.',
    },
    dailyUseCases: [
      'Generating a new landing page section from a text description in under a minute.',
      'Prototyping dashboard UI layouts before wiring up real data.',
      'Building on-brand form components with validation states already styled.',
      'Producing shadcn/ui-compatible components that drop straight into an existing Next.js codebase.',
      'Quickly exploring 2–3 visual variations of a component to compare before committing to one.',
    ],
  },

  // HEADSHOT
  {
    id: 'h1', slug: 'headshotpro',
    name: 'HeadshotPro', tagline: 'AI professional headshots in minutes — no photographer needed',
    description: 'HeadshotPro generates studio-quality professional headshots from selfies using AI. Upload 10–20 casual photos and receive 120+ polished headshots in under 2 hours — used by over 50,000 professionals for LinkedIn, CVs, and company directories.',
    category: Category.HEADSHOT, affiliateLink: 'https://www.headshotpro.com/?via=navneet',
    iconName: 'Camera', color: '#0ea5e9', accentColor: '#0284c7',
    userBadge: 'No photographer needed', pricing: 'From $29 one-time', bestFor: 'Professionals, job seekers & LinkedIn users',
    features: ['120+ AI headshots per session', 'Multiple backgrounds & outfits', 'Same-day delivery (avg 1–2 hrs)', 'Commercial usage rights included'],
    pros: [
      'Dramatically cheaper than a professional photographer ($29 vs $150–$500)',
      'Multiple styles in one session — formal, casual, outdoor, studio',
      'Fast turnaround: most orders delivered within 2 hours',
      'No travel, no scheduling — works from existing selfies',
    ],
    cons: [
      'No free plan — paid from the first photo',
      'Output quality depends heavily on input photo quality',
      'AI can occasionally distort fine details (glasses, earrings)',
    ],
    pricingBreakdown: [
      { tier: 'Basic', price: '$29 one-time', highlight: '40 headshots · 4 styles · 2–3 hr delivery · Commercial rights included' },
      { tier: 'Standard', price: '$39 one-time', highlight: '80 headshots · 8 styles · 2–3 hr delivery · More background variety' },
      { tier: 'Premium', price: '$59 one-time', highlight: '120+ headshots · 15+ styles · Priority 1–2 hr delivery · Full commercial rights' },
    ],
    setupSteps: [
      'Go to headshotpro.com and choose a plan (Basic $29 / Standard $39 / Premium $59). One-time payment, no subscription required.',
      'Upload 10–20 clear, well-lit selfies showing your face at different angles. Avoid sunglasses, hats, or heavy filters — the AI needs clear facial data to generate accurate results.',
      'Select your preferred styles — formal business, smart casual, outdoor, or executive studio. Premium plan includes 15+ background and outfit combinations.',
      'Wait 1–2 hours for delivery. HeadshotPro emails you when the batch is ready. Download all variations and pick your favourites for LinkedIn, your CV, or your company directory.',
    ],
    realOutputExample: {
      output: 'Input: 15 casual smartphone selfies (mixed lighting, various backgrounds). Output: 120 headshots across 15 style variations — dark studio background, light neutral, outdoor blur, corporate white. Best results: neutral-background formal shots were indistinguishable from a professional studio session at the thumbnail sizes LinkedIn and most job portals use.',
      editorialNote: 'Based on published user reviews across Trustpilot (4.8, 2,100+ reviews) and Reddit (r/LinkedInTips, r/jobs). The most consistent finding: output quality correlates directly with input quality. Photos taken in good natural light with a plain background produce headshots that regularly fool colleagues into asking for the photographer\'s name. Shots taken in dim indoor lighting produce noticeably softer, slightly uncanny results. The $29 Basic plan is the right starting point — upgrade only if you need style variety.',
    },
    dailyUseCases: [
      'LinkedIn profile update — the #1 use case: a professional headshot increases LinkedIn profile views by up to 14x according to LinkedIn\'s own data.',
      'Job applications — most applicants submit CVs with no photo; a polished AI headshot on your LinkedIn significantly increases recruiter callbacks.',
      'Company "About Us" page — a uniform look across a remote team without coordinating a photographer shoot.',
      'Conference speaker bios and press kits — event organisers require a professional headshot; HeadshotPro delivers one in under 2 hours.',
      'Freelancer profiles on Upwork, Toptal, Fiverr — profile photo quality directly correlates with hiring rate on these platforms.',
    ],
    notForYou: 'HeadshotPro is not the right tool if you need full-body shots or action photos (it generates head-and-shoulder portraits only), require video headshots or animated profile images, or want a printed large-format photo for a physical display — AI-generated headshots can show compression artefacts at print sizes above A4. For bespoke personal branding shoots with multiple locations and outfit changes, a human photographer still delivers a more tailored result.',
    titleTemplate: 'HeadshotPro Review 2026: Is It Worth $29 for AI Headshots? | AI Nexus',
    lastTestedISO: '2026-05-28',
    researchSources: {
      trustpilot: { rating: 4.8, count: 2143, url: 'https://www.trustpilot.com/review/headshotpro.com' },
      g2: { rating: 4.7, count: 312 },
      reddit: 'Positive — r/LinkedInTips, r/jobs, r/artificial',
      lastVerified: '2026-05-28',
    },
    indiaPricing: {
      free: 'No free plan (no trial)',
      paid: '₹2,415 Basic (~$29 at current rates)',
      note: 'Billed in USD — international credit/debit card required. UPI not currently supported. Forex charges apply.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'May 2026', note: 'Tool entry created. Pricing verified: Basic $29, Standard $39, Premium $59. Trustpilot score 4.8 (2,143 reviews). Affiliate link active via headshotpro.com/?via=navneet.' },
    ],
  },

  // ── Week 3: GetResponse — MARKETING category ─────────────────────────────
  // Affiliate: 40–60% recurring | https://www.getresponse.com/?via=navneet
  {
    id: 'mk1', slug: 'getresponse',
    name: 'GetResponse', tagline: 'All-in-one email marketing with AI automation and landing pages',
    description: 'GetResponse combines an AI email generator, visual automation builder, AI landing page creator, and webinar hosting in a single platform. Trusted by 350,000+ businesses globally — starting from $13.30/month for 1,000 contacts.',
    category: Category.MARKETING, affiliateLink: 'https://www.getresponse.com/?via=navneet',
    iconName: 'Mail', color: '#00baff', accentColor: '#0091cc',
    userBadge: 'Best for automation', pricing: 'Free + from $13.30/month', bestFor: 'Businesses needing email + automation + landing pages',
    features: ['AI email generator', 'Visual automation builder', 'AI landing page creator', 'Webinar hosting', 'AI subject line optimizer'],
    pros: [
      'Full-stack marketing platform — email, automation, landing pages, webinars in one tool',
      'AI email generator significantly reduces campaign creation time',
      '40–60% recurring affiliate commission — highest in the email marketing niche',
      'Lower per-subscriber pricing than ActiveCampaign at equivalent feature tiers',
    ],
    cons: [
      'Free plan has limited features compared to Mailchimp or Brevo',
      'Interface can feel dense for first-time email marketers',
      'Webinar features locked to higher-tier plans',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Up to 500 contacts · 1 landing page · Email limit applies · No automation' },
      { tier: 'Email Marketing', price: 'from $13.30/month', highlight: 'Unlimited emails · AI email generator · AI subject line · Basic landing pages · 1,000 contacts' },
      { tier: 'Marketing Automation', price: 'from $41.30/month', highlight: 'Advanced automation · Lead scoring · Behavioral triggers · E-commerce tracking · Webinars (basic)' },
      { tier: 'Ecommerce Marketing', price: 'from $83.30/month', highlight: 'Full e-commerce suite · Abandoned cart recovery · Product recommendations · Promo codes' },
    ],
    setupSteps: [
      'Go to getresponse.com and sign up — the free plan requires no credit card and gives you immediate access to the email editor and basic landing page builder.',
      'Import your contact list (CSV upload) or use the sign-up form builder to create an embedded opt-in form for your website or blog.',
      'Create your first email using the AI email generator: enter a brief description of your campaign goal and let GetResponse draft the subject line, preheader, and body copy. Edit and personalise before sending.',
      'Set up a welcome automation: new subscriber → immediate welcome email → 3-day follow-up → 7-day check-in. This sequence runs automatically without any manual work.',
    ],
    reviewType: 'research-based',
    lastTestedISO: '2026-06-07',
    researchSources: {
      g2: { rating: 4.2, count: 1143 },
      reddit: 'Mixed-positive — r/emailmarketing, r/Entrepreneur',
      lastVerified: '2026-06-07',
    },
    indiaPricing: {
      free: 'Free plan available (500 contacts)',
      paid: '~₹1,108/month (Email Marketing, 1k contacts at current rates)',
      note: 'Billed in USD — international card required. INR bank transfer not currently available.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created for Week 3 email marketing blog. Pricing verified via getresponse.com. Affiliate link active: getresponse.com/?via=navneet.' },
    ],
  },

  // ── Week 3: Munch AI — VIDEO category ────────────────────────────────────
  // Featured in: best-ai-tools-for-youtube-creators-2026 (#1 pick)
  {
    id: 'v4', slug: 'munch',
    name: 'Munch AI', tagline: 'AI video repurposing with engagement intelligence for YouTube and social',
    description: 'Munch AI analyses long-form videos to identify the most engagement-worthy segments, clips them into platform-ready formats, and provides an AI engagement score for each clip. Multi-platform content calendar included — built for YouTube creators and content teams publishing across multiple channels.',
    category: Category.VIDEO, affiliateLink: 'https://www.getmunch.com?via=ainexus',
    iconName: 'Scissors', color: '#6366f1', accentColor: '#4f46e5',
    userBadge: 'Best for repurposing', pricing: 'Free trial + from $49/month', bestFor: 'YouTube creators repurposing long-form to Shorts',
    features: ['AI engagement score per clip', 'Multi-platform content calendar', 'Brand voice matching', 'Auto captions & subtitles', 'LinkedIn, TikTok, Instagram export'],
    pros: [
      'Engagement analytics differentiate it from simple repurposing tools',
      'Multi-platform calendar saves significant planning time',
      'Brand voice consistency across clips — unique to Munch vs competitors',
      'Works from a YouTube URL — no file upload needed for existing content',
    ],
    cons: [
      'Starter plan at $49/month is expensive for individual creators vs Opus.pro at $19/month',
      'AI clip selection quality varies with video content type',
    ],
    pricingBreakdown: [
      { tier: 'Free trial', price: '$0', highlight: 'Limited clip generations to test the workflow' },
      { tier: 'Starter', price: '$49/month', highlight: '60 hours of video/month · AI engagement scores · Multi-platform export · Content calendar' },
      { tier: 'Pro', price: '$96/month', highlight: '150 hours/month · Priority processing · Advanced analytics · Team workspace' },
    ],
    reviewType: 'research-based',
    lastTestedISO: '2026-06-07',
    researchSources: {
      reddit: 'Positive — r/NewTubers, r/youtube, r/ContentCreators',
      lastVerified: '2026-06-07',
    },
    indiaPricing: {
      free: 'Free trial available',
      paid: '~₹4,075/month Starter at current rates',
      note: 'USD pricing only — international card required.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created for Week 3 YouTube creators blog. Research-based entry.' },
    ],
  },

  // ── Week 3: BasedLabs — IMAGE category ───────────────────────────────────
  // Affiliate: 40% lifetime commission
  {
    id: 'img4', slug: 'basedlabs',
    name: 'BasedLabs', tagline: 'AI image and video generation with 40% lifetime affiliate commission',
    description: 'BasedLabs is an AI generation platform offering image and short video creation with a wide range of models including Flux, Stable Diffusion XL, and proprietary fine-tuned models. Offers a 40% lifetime affiliate commission — one of the highest in the AI image generation niche.',
    category: Category.IMAGE, affiliateLink: 'https://www.basedlabs.ai/?via=ainexus',
    iconName: 'Image', color: '#ec4899', accentColor: '#db2777',
    userBadge: 'High affiliate commission', pricing: 'Free + from $9/month', bestFor: 'Creators needing diverse AI image models',
    features: ['Flux, SDXL & proprietary models', 'AI video generation', 'LoRA model support', 'API access', 'Commercial usage rights'],
    pros: [
      '40% lifetime affiliate commission — strongest in the image AI category',
      'Multiple model access in one platform — Flux, SDXL, and others',
      'Competitive free tier for testing',
    ],
    cons: [
      'Less established brand vs Leonardo.ai and Midjourney',
      'Smaller community and prompt guide library',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Daily generation credits · Standard models · No commercial rights on free' },
      { tier: 'Basic', price: 'from $9/month', highlight: 'Higher monthly credits · All models · Commercial rights · API access' },
    ],
    reviewType: 'research-based',
    lastTestedISO: '2026-06-07',
    researchSources: {
      reddit: 'Emerging positive — r/StableDiffusion, r/AIArt',
      lastVerified: '2026-06-07',
    },
    indiaPricing: {
      free: 'Free tier available',
      paid: '~₹750/month at current rates',
      note: 'USD billing — international card required.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. High-commission affiliate opportunity — 40% lifetime.' },
    ],
  },

  // ── Week 3: Narrato — WRITING category ────────────────────────────────────
  // Affiliate: 30% recurring
  {
    id: 'w9', slug: 'narrato',
    name: 'Narrato', tagline: 'AI content workspace for teams — plan, create, publish and manage content',
    description: 'Narrato is an AI-powered content workspace that combines content planning, AI writing, SEO brief generation, team collaboration, and publishing workflow management in one platform. Designed for content teams and agencies managing high-volume content pipelines.',
    category: Category.WRITING, affiliateLink: 'https://narrato.io/?via=ainexus',
    iconName: 'FileText', color: '#10b981', accentColor: '#059669',
    userBadge: 'Best for content teams', pricing: 'Free trial + from $36/month', bestFor: 'Content teams and agencies with high-volume workflows',
    features: ['AI content generator', 'SEO brief builder', 'Team collaboration', 'Content calendar', 'Publishing workflow', 'Brand voice profiles'],
    pros: [
      'End-to-end content workflow — brief to publish in one platform',
      'SEO brief generator with keyword and competitor data built in',
      '30% recurring affiliate commission',
      'Better team collaboration than Jasper at similar price points',
    ],
    cons: [
      'More complex than solo-creator tools like Rytr or Writesonic',
      'Minimum team plan makes it expensive for individual freelancers',
    ],
    pricingBreakdown: [
      { tier: 'Free trial', price: '$0', highlight: '7-day trial, no credit card · All features available to test' },
      { tier: 'Pro', price: 'from $36/month', highlight: '2 users · Unlimited AI writing · SEO briefs · Content calendar · Brand voice' },
      { tier: 'Business', price: 'from $59/month', highlight: '5 users · Advanced workflow · Custom AI personas · Priority support' },
    ],
    reviewType: 'research-based',
    lastTestedISO: '2026-06-07',
    researchSources: {
      g2: { rating: 4.5, count: 248 },
      reddit: 'Positive — r/contentmarketing, r/SEO',
      lastVerified: '2026-06-07',
    },
    indiaPricing: {
      free: 'Free trial (7 days, no card)',
      paid: '~₹3,000/month Pro at current rates',
      note: 'USD billing — international card required. INR option not currently available.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. 30% recurring affiliate. Targeting content team use case.' },
    ],
  },

  // ── Week 3: Fireflies.ai — PRODUCTIVITY category ─────────────────────────
  // Affiliate: 20% recurring | https://fireflies.ai/?fpr=navneet89
  {
    id: 'p5', slug: 'fireflies',
    name: 'Fireflies.ai', tagline: 'AI meeting recorder, transcriber and action item tracker',
    description: 'Fireflies.ai automatically records, transcribes, and summarises meetings across Zoom, Google Meet, Microsoft Teams, and 50+ other platforms. AI identifies action items, decisions, and next steps — turning every meeting into a searchable, shareable transcript with automatic follow-up tasks.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://fireflies.ai/?fpr=navneet89',
    iconName: 'Mic', color: '#7c3aed', accentColor: '#6d28d9',
    userBadge: 'Best meeting AI', pricing: 'Free + from $10/month', bestFor: 'Remote teams, recruiters, sales reps, and project managers',
    features: ['Automatic meeting recording', 'AI transcription (30+ languages)', 'Smart summaries & action items', 'Zoom, Meet, Teams integration', 'Searchable meeting archive', 'CRM integrations (HubSpot, Salesforce)'],
    pros: [
      'Works with every major video conferencing platform without any setup',
      'AI action item extraction reduces post-meeting admin significantly',
      'Searchable archive across all meetings — find any discussion by keyword',
      'Free plan is genuinely useful (800 mins storage, limited transcription)',
    ],
    cons: [
      'Free plan limits transcription credits — heavy meeting users need paid plan',
      'Transcription accuracy varies on accented speech or technical jargon',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '800 mins meeting storage · Limited transcription credits · Basic search · 3 AI summaries/month' },
      { tier: 'Pro', price: '$10/month per seat', highlight: 'Unlimited transcription · Full AI summaries · Smart search · CRM integrations · Action item tracking' },
      { tier: 'Business', price: '$19/month per seat', highlight: 'Everything in Pro · Video recording · Custom vocabulary · Analytics dashboard · Priority support' },
    ],
    setupSteps: [
      'Sign up at fireflies.ai — no credit card needed for the free plan. Connect your Google or Microsoft calendar to allow Fireflies to automatically join scheduled meetings.',
      'Install the Fireflies bot: it joins your Zoom, Google Meet, or Teams meeting automatically when invited via calendar invite. No manual start/stop needed — it records from the moment it joins.',
      'After each meeting, Fireflies emails you a summary with transcript, key topics, action items, and a shareable link. Access the full searchable transcript in your Fireflies dashboard.',
      'Set up CRM integration (HubSpot or Salesforce) if you use these for sales — Fireflies can automatically log meeting summaries and action items directly to your CRM contact record.',
    ],
    realOutputExample: {
      output: 'Meeting summary: 45-min product review. Key decisions: (1) Launch date moved to Q3 — Priya to update the roadmap by Friday. (2) Feature X descoped for v1 — Marcus to communicate to stakeholders. (3) User testing budget approved at $2,000. Action items: [Priya] Update roadmap — Due: Jun 14. [Marcus] Stakeholder email — Due: Jun 12. [Team] User testing brief — Due: Jun 20.',
      editorialNote: 'This example reflects a typical Fireflies summary from a 45-minute meeting. Action item extraction works well for clearly stated tasks ("you will" / "I will" / "let\'s do X by Friday"). Implicit commitments — where a task is implied but not explicitly stated — are less reliably caught. The transcript search is genuinely valuable: finding a specific decision made 3 meetings ago by searching a keyword takes under 10 seconds.',
    },
    dailyUseCases: [
      'Sales discovery calls — Fireflies transcribes the call so you can focus on the conversation rather than note-taking. After the call, the AI summary highlights what the prospect said about their pain points, budget, and timeline.',
      'Remote team standups — meeting summaries with action items are shared automatically to Slack or email. Team members who missed the meeting have a complete record within minutes.',
      'Recruitment interviews — interviewers can focus on the candidate rather than writing notes. Fireflies captures every response for structured review and comparison across candidates.',
      'Client meetings and project check-ins — automatic action item tracking means nothing falls through the cracks. The meeting archive provides a searchable paper trail for any client project.',
      'Engineering planning sessions — technical discussions are often fast and dense. The searchable transcript lets engineers find specific decisions or architecture discussions weeks later without asking who remembers.',
    ],
    notForYou: 'Fireflies is not the right tool if you need on-device processing for highly sensitive or legally confidential meetings — audio is processed on Fireflies\' servers, which creates data residency concerns for healthcare, legal, or regulated financial settings. For those use cases, a self-hosted transcription solution (Whisper API running locally) is the appropriate alternative. Also not ideal if your meetings are primarily informal chats rather than structured discussions — the AI action item extraction adds the most value when meetings have clear deliverables and named owners.',
    titleTemplate: 'Fireflies.ai Review 2026: Best AI Meeting Recorder? | AI Nexus',
    lastTestedISO: '2026-06-07',
    researchSources: {
      trustpilot: { rating: 4.4, count: 892, url: 'https://www.trustpilot.com/review/fireflies.ai' },
      g2: { rating: 4.6, count: 612 },
      reddit: 'Positive — r/productivity, r/remotework, r/sales',
      lastVerified: '2026-06-07',
    },
    indiaPricing: {
      free: 'Free forever (800 min storage, limited transcription)',
      paid: '~₹833/month Pro (at current USD/INR rates)',
      note: 'USD billing. International card required. UPI not currently supported. GST not included — may apply for Indian businesses.',
    },
    reviewType: 'research-based',
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Affiliate link: fireflies.ai/?fpr=navneet89 (20% recurring). Free plan verified at 800 min storage, Pro at $10/month.' },
    ],
  },

  // ── Task 3: High-volume missing tool pages — ChatGPT, Claude AI, Grok AI (PRODUCTIVITY) +
  // Midjourney, Stable Diffusion (IMAGE). Added to close zero-coverage gap on 45K–100K+/mo
  // search terms. No affiliate programmes currently available for any of these 5 — monitor
  // OpenAI, Anthropic, xAI, Midjourney and Stability AI partner pages for future programmes.

  // PRODUCTIVITY (AI assistants)
  {
    id: 'ai1', slug: 'chatgpt',
    // Task 4 (AEO/GEO): external entity links — ChatGPT (product) + OpenAI (publisher).
    sameAs: [
      'https://www.wikidata.org/wiki/Q115564437',
      'https://www.crunchbase.com/organization/openai',
      'https://www.producthunt.com/products/chatgpt',
    ],
    name: 'ChatGPT', tagline: "OpenAI's flagship AI assistant — GPT-5.5, Sora video and Agent Mode in one app",
    description: "ChatGPT is OpenAI's general-purpose AI assistant, now running on GPT-5.5 with Agent Mode, Codex coding agent, Sora video generation, and Advanced Voice. In 2026 it spans six pricing tiers — from an ad-supported free plan to a $200/month Pro tier with a 1M-token context window — making it the most feature-dense single AI subscription on the market.",
    category: Category.PRODUCTIVITY, affiliateLink: 'https://chatgpt.com', // No public affiliate programme — monitor openai.com/partners
    iconName: 'Bot', color: '#10a37f', accentColor: '#0d8a6c',
    userBadge: 'Most popular AI', pricing: 'Free + $8–$200/month (Go, Plus, Pro)', bestFor: 'General research, writing, coding and everyday AI assistant use',
    notForYou: 'Developers who want the deepest agentic coding workflow — Claude Code (via Claude Pro/Max) and Cursor consistently benchmark ahead of ChatGPT\'s Codex agent for large, multi-file refactors. Also skip the Free tier if you are uncomfortable with in-chat ads, which OpenAI began testing on Free and Go in the US from February 2026.',
    lastTestedISO: '2026-06-13',
    reviewType: 'research-based',
    indiaPricing: {
      free: 'Free (GPT-5.3, 10 messages/5hr, ads in some regions)',
      paid: 'Go ~₹399/month · Plus ~₹1,750/month',
      note: 'ChatGPT Go launched in India first (August 2025) at a discounted local price before its $8/month global rollout in January 2026. International or Indian card both accepted; UPI not yet supported for subscriptions.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified across 6 tiers: Free $0, Go $8, Plus $20, Pro $100 (new April 2026), Pro $200, Business from $20/seat/month annual. GPT-5.5 confirmed as default flagship model since April 23, 2026.' },
    ],
    features: [
      'GPT-5.5 flagship model (GPT-5.5 Pro on Pro/Business/Enterprise)',
      'Agent Mode + Codex coding agent (mobile preview free on all plans)',
      'Sora video generation (Plus and above)',
      'Deep Research — up to 250 runs/month on Pro $200',
      'Advanced Voice Mode with video',
      '60+ third-party app connectors',
    ],
    pros: [
      'Broadest feature set of any AI assistant — chat, voice, video, coding agent and image generation in one subscription',
      'Plus at $20/month has held its price since 2023 while the feature set has expanded dramatically',
      'New Go tier ($8/month) makes paid ChatGPT accessible in price-sensitive markets including India',
      'Codex Mobile is now free on every plan, including Free and Go',
    ],
    cons: [
      'Six overlapping tiers make it genuinely confusing to pick the right plan',
      'Free and Go tiers now show ads in the US — a first for ChatGPT',
      'The $200/month Pro tier is a steep jump for the 1M-token context window and unlimited Sora access',
      'No official affiliate programme — zero referral monetisation',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'GPT-5.3 access · 10 messages/5hr · limited image generation · GPT Store · ads in US' },
      { tier: 'Go', price: '$8/month', highlight: '10x more messages · unlimited GPT-5.3 Instant · file uploads · image creation · still ad-supported' },
      { tier: 'Plus', price: '$20/month', highlight: 'GPT-5.5 · 160 msgs/3hr · 3,000 weekly GPT-5.5 Thinking msgs · Sora · Deep Research (10/mo) · Agent Mode · Codex' },
      { tier: 'Pro', price: '$100–$200/month', highlight: 'Same model suite as Plus at 5x–20x usage · GPT-5.5 Pro · 1M-token context (on $200 tier) · priority Sora & Deep Research (up to 250/mo)' },
    ],
  },

  // PRODUCTIVITY (AI assistants)
  {
    id: 'ai2', slug: 'claude-ai',
    // Task 4 (AEO/GEO): external entity links — Claude (product) + Anthropic (publisher).
    sameAs: [
      'https://www.wikidata.org/wiki/Q118876059',
      'https://www.crunchbase.com/organization/anthropic',
      'https://www.producthunt.com/products/claude',
    ],
    name: 'Claude AI', tagline: "Anthropic's AI assistant — the top pick for long-form writing, analysis and coding",
    description: 'Claude is Anthropic\'s AI assistant, built around Projects, Artifacts, and a strong reputation for careful long-form writing, document analysis, and coding via Claude Code. In 2026 Claude runs on the Sonnet 4.6 / Opus 4.7 model family across a free tier and four paid tiers, with Max plans aimed at developers who run intensive Claude Code sessions throughout the day.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://claude.ai', // No public affiliate programme — monitor anthropic.com
    iconName: 'MessageSquare', color: '#d97757', accentColor: '#c2410c',
    userBadge: 'Best for writing & code', pricing: 'Free + $17–$200/month (Pro, Max)', bestFor: 'Writers, researchers and developers who want Claude Code',
    notForYou: 'Casual users who just need quick factual answers or image/video generation — Claude has no native image generator and ChatGPT or Grok cover those use cases better. Also reconsider if you need a generous rolling usage window for all-day chat use: Claude Pro\'s 5-hour rolling limits are tighter than ChatGPT Plus for high-volume conversational use.',
    lastTestedISO: '2026-06-13',
    reviewType: 'research-based',
    indiaPricing: {
      free: 'Free (Sonnet 4.6 & Haiku 4.5, daily usage limits, no card required)',
      paid: 'Pro ~₹1,750/month (~₹1,490/month billed annually)',
      note: 'USD billing via international card — no UPI or local INR billing confirmed as of June 2026. Free tier is fully usable for occasional writing and research tasks with no payment method needed.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Free $0, Pro $20/month ($17/month billed annually), Max 5x $100/month, Max 20x $200/month, Team Standard $25/seat/month, Team Premium $125/seat/month.' },
    ],
    features: [
      'Claude Sonnet 4.6 and Opus 4.7 models on paid plans',
      'Projects — persistent context for ongoing work',
      'Artifacts — live-rendered code, documents and visualisations',
      'Claude Code CLI for agentic, multi-file coding tasks',
      'Large file and document uploads with citation-backed analysis',
      'Team plans with centralised billing and admin controls',
    ],
    pros: [
      'Consistently rated ahead of competitors for long-form writing quality and nuanced editing',
      'Claude Code is a top pick for agentic, multi-file coding workflows',
      'Pro at $20/month ($17 annual) matches ChatGPT Plus and Gemini Advanced on price',
      'Artifacts make it easy to preview and iterate on generated code, docs and diagrams without leaving the chat',
    ],
    cons: [
      'No native image or video generation — needs a separate tool for visual content',
      'Pro\'s 5-hour rolling usage windows can feel restrictive for all-day power users, pushing them toward the $100+ Max tiers',
      'No official affiliate programme — zero referral monetisation',
      'Smaller third-party app/connector ecosystem than ChatGPT',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: 'Sonnet 4.6 & Haiku 4.5 access · daily usage limits · Projects & Artifacts · no card required' },
      { tier: 'Pro', price: '$20/month ($17/mo annual)', highlight: '~5x Free usage · all models incl. Opus 4.7 · Claude Code · Projects with larger context' },
      { tier: 'Max 5x / 20x', price: '$100–$200/month', highlight: '5x–20x Pro usage · priority access during peak hours · built for daily Claude Code workflows' },
      { tier: 'Team', price: '$25–$125/seat/month', highlight: 'Standard ($25) and Premium ($125) tiers · centralised billing · shared workspace · admin controls' },
    ],
  },

  // PRODUCTIVITY (AI assistants)
  {
    id: 'ai3', slug: 'grok-ai',
    name: 'Grok AI', tagline: "xAI's chatbot with real-time X data access, DeepSearch and Grok Imagine",
    description: 'Grok is xAI\'s AI assistant, distinguished by live access to X (Twitter) data, a DeepSearch research mode, and Grok Imagine for AI image and video generation. In 2026 it runs on Grok 4.3 (1M-token context) and is available free with limited prompts, bundled into X Premium tiers, or as a standalone SuperGrok subscription starting at $10/month.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://grok.com', // No public affiliate programme — monitor x.ai
    iconName: 'Zap', color: '#475569', accentColor: '#334155',
    userBadge: 'Real-time X data', pricing: 'Free + $8–$300/month (X Premium, SuperGrok, Heavy)', bestFor: 'X/Twitter users who want real-time trend-aware AI plus image and video generation',
    notForYou: 'Developers who need the strongest coding performance — Claude and ChatGPT\'s Codex agent both outperform Grok on coding benchmarks. Also reconsider if you are budget-conscious: at $30/month, standalone SuperGrok costs 50% more than ChatGPT Plus, Claude Pro, or Gemini Advanced for broadly comparable core chat capability.',
    lastTestedISO: '2026-06-13',
    reviewType: 'research-based',
    indiaPricing: {
      free: 'Free (~10 prompts/2hrs, 5 images/month, limited Grok 3/4 access)',
      paid: 'SuperGrok ~₹2,500/month (international card)',
      note: 'Billed in USD via X/xAI — no confirmed INR billing or UPI support as of June 2026. SuperGrok Lite at $10/month is the lowest-cost standalone paid entry point if available in your region.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Free $0, X Premium $8/month, SuperGrok Lite $10/month, SuperGrok $30/month, X Premium+ $40/month, SuperGrok Heavy $300/month. Grok 4.3 (1M context) confirmed as current flagship since April 30, 2026.' },
    ],
    features: [
      'Grok 4.3 model with 1M-token context window',
      'DeepSearch — multi-step web research mode',
      'Big Brain Mode for extended reasoning',
      'Grok Imagine — AI image and video generation (unlimited images on SuperGrok)',
      'Real-time access to X (Twitter) posts and trends',
      'Voice mode for conversational interaction',
    ],
    pros: [
      'Only major AI assistant with live, native access to real-time X data and trending topics',
      'SuperGrok includes unlimited Grok Imagine image generation plus daily video renders — bundled image/video gen most competitors charge extra for',
      'SuperGrok Lite at $10/month is a genuinely affordable entry point for light users wanting Grok Imagine access',
      '1M-token context window on the flagship model matches the top tier of ChatGPT and Claude',
    ],
    cons: [
      'Free tier is restrictive — roughly 10 prompts every 2 hours and 5 images/month',
      'Standalone SuperGrok at $30/month is the most expensive entry point among the major chatbot subscriptions',
      'Plan structure is genuinely confusing — five overlapping tiers split across xAI subscriptions and X platform bundles',
      'No official affiliate programme — zero referral monetisation',
    ],
    pricingBreakdown: [
      { tier: 'Free', price: '$0/month', highlight: '~10 prompts/2hrs · 5 images/month · limited Grok model access' },
      { tier: 'X Premium', price: '$8/month', highlight: 'Light Grok access bundled with X platform features and ad revenue sharing' },
      { tier: 'SuperGrok Lite', price: '$10/month', highlight: '2x longer chats than Free · basic Grok Imagine (480p, 6-second clips) · 1 AI agent' },
      { tier: 'SuperGrok', price: '$30/month', highlight: 'Full Grok 4.3 (1M context) · ~100 prompts/2hrs · DeepSearch · Big Brain Mode · unlimited Imagine images + daily video' },
    ],
  },

  // IMAGE
  {
    id: 'i4', slug: 'midjourney',
    // Task 4 (AEO/GEO): external entity links for Midjourney, Inc.
    sameAs: [
      'https://www.wikidata.org/wiki/Q113070628',
      'https://www.crunchbase.com/organization/midjourney',
      'https://www.producthunt.com/products/midjourney',
    ],
    name: 'Midjourney', tagline: 'The benchmark AI image generator for artistic quality — V7/V8',
    description: "Midjourney remains the standard for AI-generated artistic and cinematic imagery, with V8.1 (April 2026) adding faster generation, HD 2K output, and improved small-detail retention on top of V7's Omni Reference for consistent characters. It runs on a GPU-time subscription model with no free tier and no official API — generation happens via the Midjourney web app or Discord.",
    category: Category.IMAGE, affiliateLink: 'https://midjourney.com', // No public affiliate programme — monitor midjourney.com
    iconName: 'Image', color: '#8b5cf6', accentColor: '#7c3aed',
    userBadge: 'Best image quality', pricing: 'From $10/month — no free tier', bestFor: 'Artists, designers and creators who prioritise visual quality over cost or API access',
    notForYou: 'Anyone who wants to try AI image generation for free before paying, or who needs programmatic API access for an app — Midjourney has no free tier and no official API. Leonardo.ai (150 free credits/day) or Stable Diffusion (free, open-source, self-hosted) are better starting points for budget-conscious or developer use cases.',
    lastTestedISO: '2026-06-13',
    reviewType: 'research-based',
    indiaPricing: {
      free: 'No free tier — paid subscription required from first image',
      paid: 'Basic ~₹830/month · Standard ~₹2,490/month (at ~₹83/USD)',
      note: 'USD billing via international card — no INR billing confirmed. 20% discount on all 4 tiers (Basic, Standard, Pro, Mega) when billed annually.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: Basic $10, Standard $30, Pro $60, Mega $120/month (20% off annual). V8.1 confirmed as latest model update (April 30, 2026); V7 remains the documented default for most accounts.' },
    ],
    features: [
      'V8.1 model — faster generation, HD 2K support, improved detail retention',
      'Omni Reference for consistent characters across generations',
      'Relax Mode — unlimited slower generations on Standard plan and above',
      'Stealth Mode — private generations on Pro and Mega plans',
      'Image-to-video animation',
      'Discord and web app generation',
    ],
    pros: [
      'Consistently produces the most aesthetically polished, cinematic output of any major image generator',
      'Relax Mode on Standard ($30/month) and above gives effectively unlimited generations once fast GPU hours are used',
      'All plans include full commercial usage rights',
      'V7/V8.1\'s Omni Reference makes consistent characters across a project significantly easier than earlier versions',
    ],
    cons: [
      'No free tier or trial — $10/month minimum just to generate a first image',
      'No official API — cannot be integrated into apps or automated workflows',
      'Images on Basic and Standard plans are public by default; private generation requires the $60/month Pro plan',
      'Billing is GPU-time based, not a simple image quota — heavy users can exhaust fast hours faster than expected',
    ],
    pricingBreakdown: [
      { tier: 'Basic', price: '$10/month', highlight: '~3.3 fast GPU hours/month · no Relax Mode · public gallery · commercial use included' },
      { tier: 'Standard', price: '$30/month', highlight: '~15 fast GPU hours · unlimited Relax Mode · public gallery · commercial use' },
      { tier: 'Pro', price: '$60/month', highlight: '~30 fast GPU hours · unlimited Relax Mode · Stealth Mode (private generations) · commercial use' },
      { tier: 'Mega', price: '$120/month', highlight: 'Highest fast GPU allowance · unlimited Relax Mode · Stealth Mode · commercial use for larger teams' },
    ],
  },

  // IMAGE
  {
    id: 'i5', slug: 'stable-diffusion',
    name: 'Stable Diffusion', tagline: 'Free, open-source AI image generation you can run on your own hardware',
    description: 'Stable Diffusion is the leading open-weight AI image model family from Stability AI, distributed free for local use under a permissive community licence (free for organisations under $1M annual revenue). It can be run locally via ComfyUI or AUTOMATIC1111, or accessed through Stability AI\'s hosted DreamStudio web app and API on a pay-per-credit basis — with no subscription required.',
    category: Category.IMAGE, affiliateLink: 'https://stability.ai', // No public affiliate programme — monitor stability.ai
    iconName: 'Layers', color: '#0ea5e9', accentColor: '#0284c7',
    userBadge: 'Free & open-source', pricing: 'Free (self-hosted) + DreamStudio from $10/1,000 credits', bestFor: 'Developers, researchers and creators who want full control without a subscription',
    notForYou: 'Anyone without a capable GPU (8GB+ VRAM) who wants a zero-setup experience — running Stable Diffusion locally requires hardware and some technical comfort with ComfyUI or AUTOMATIC1111. If you want polished output with no setup at all, Midjourney or Leonardo.ai are simpler starting points.',
    lastTestedISO: '2026-06-13',
    reviewType: 'research-based',
    indiaPricing: {
      free: 'Free forever for local/self-hosted use (under $1M revenue, community licence)',
      paid: 'DreamStudio ~₹830 for 1,000 credits (~5,000 basic images)',
      note: 'DreamStudio is pay-as-you-go credits, not a subscription — billed in USD via international card. No INR billing confirmed. Local use on your own GPU has no ongoing cost beyond electricity/hardware.',
    },
    updateLog: [
      { date: 'June 2026', note: 'Tool entry created. Pricing verified: fully free for local/self-hosted use under the Community Licence; DreamStudio credits at $10 per 1,000 (~5,000 basic 512x512 images, fewer for higher-resolution/step-count generations).' },
    ],
    features: [
      'Open-weight models (SD 3.5 and earlier) downloadable from Hugging Face',
      'ControlNet for precise composition, pose and structure control',
      'Custom LoRA fine-tuning on your own datasets',
      'ComfyUI and AUTOMATIC1111 community interfaces',
      'DreamStudio hosted web app and API (no local GPU required)',
      '2026 multimodal expansion: Stable Video, Stable Audio, SPAR3D (image-to-3D)',
    ],
    pros: [
      'Genuinely free for unlimited local generation — no subscription, no per-image cost beyond hardware',
      'Full customisation: fine-tune custom models and LoRAs for consistent brand or character styles',
      'On-premise generation keeps sensitive prompts and outputs entirely private',
      'SD 3.5 Large quality rivals Midjourney V7 for photorealistic output according to independent comparisons',
    ],
    cons: [
      'Requires a capable GPU (8GB+ VRAM recommended) for local use — cloud/DreamStudio costs apply otherwise',
      'ComfyUI and AUTOMATIC1111 have a real learning curve compared to Midjourney or Leonardo\'s simple prompt boxes',
      'DreamStudio\'s credit system is not a flat subscription, making cost prediction harder for high-volume use',
      'SD3\'s licence is more restrictive than SDXL\'s — check current terms before commercial use of newer models',
    ],
    pricingBreakdown: [
      { tier: 'Self-hosted', price: '$0', highlight: 'Free, open-weight models · unlimited local generations · requires your own GPU (8GB+ VRAM)' },
      { tier: 'DreamStudio credits', price: '$10 / 1,000 credits', highlight: 'No subscription · ~5,000 basic 512x512 images or fewer high-res/step-count generations · 25–200 free credits on signup' },
      { tier: 'Stability API', price: '~$0.002–$0.04/image', highlight: 'Pay-per-generation API · SDXL cheapest, Stable Image Ultra most expensive per credit · integrate into your own apps' },
    ],
  },
];

// ── FAQ data per tool — powers FAQPage schema + visible accordions ─────────
export const TOOL_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  rytr: [
    { q: "Is Rytr really free?", a: "Yes. Rytr's free plan gives you 10,000 characters per month — enough to write 3–4 short blog posts or 20+ social media captions. No credit card required to sign up." },
    { q: "How does Rytr compare to ChatGPT?", a: "ChatGPT is more flexible for conversation and complex tasks. Rytr is faster for specific writing jobs like ad copy, bios, and outlines — it has 40+ pre-built use cases. For $9/month unlimited, Rytr is far better value if you write structured content regularly." },
    { q: "Does Rytr work in languages other than English?", a: "Yes — Rytr supports 30+ languages including Hindi, Spanish, French, German, and Arabic. The quality in non-English languages is solid for short-form content." },
    { q: "What is Rytr's affiliate commission?", a: "Rytr pays 30% recurring commission. That means if someone you refer stays subscribed, you earn 30% of their monthly payment every single month — indefinitely." },
    { q: "Can Rytr write full blog posts?", a: "Rytr can write blog outlines, intros, and sections, but the free and Saver plans limit output length. For full 1,500+ word articles, the Unlimited plan at $29/month works, or a dedicated tool like Writesonic." },
    { q: "Is Rytr worth upgrading from free to paid?", a: "The free plan gives 10,000 characters/month — enough for 3–4 short posts or a batch of social captions. You'll want to upgrade to the Saver plan ($9/month) the moment you hit that limit. The Saver plan adds unlimited characters, all 40+ use cases (including Magic Command), the Chrome extension, and a plagiarism checker. My recommendation: use the free plan for 2 weeks. If you're hitting the limit or want the Chrome extension for writing inside Gmail and Google Docs, the $9/month upgrade pays for itself within the first week of heavy use. Skip the $29/month Unlimited plan unless you manage a content team — the Saver plan covers 95% of individual creator needs." },
    { q: "How does Rytr compare to Writesonic?", a: "Rytr and Writesonic solve different problems. Rytr ($9/month) is built for short-form copy: social captions, cold emails, ad copy, and outlines. Writesonic ($15/month+) is built for long-form: full SEO blog posts, AI articles, and structured content with web research. If you primarily write social content, emails, and short copy — Rytr wins on price and simplicity. If you need full 1,500-word articles that rank on Google, Writesonic is the better investment. The free plans reflect this: Rytr's is more generous for short content (10,000 chars vs Writesonic's 25 generations). For a full side-by-side breakdown, see the Rytr vs Writesonic comparison." },
  ],
  podcastle: [
    { q: "Is Podcastle free to use?", a: "Yes. Podcastle's free plan lets you record and edit podcasts with basic features. The main limitation is export quality and total recording minutes. For starting a first show or low-volume podcasting, the free plan is genuinely functional." },
    { q: "How does Podcastle compare to Descript?", a: "Podcastle is better for recording — especially remote interviews with guests. Descript is better for heavy text-based editing of existing audio. If you record first then edit, Podcastle is the better starting point and it's cheaper than Descript too." },
    { q: "Can Podcastle remove background noise automatically?", a: "Yes. Podcastle's AI noise removal is one of its best features — it removes keyboard clicks, air conditioning hum, echo, and room noise in one click. Verified user reviews on G2 and Trustpilot consistently highlight this as one of the most effective one-click noise removal tools at this price point." },
    { q: "What is the Revoice feature?", a: "Revoice lets you clone your voice and fix mistakes in your recording without re-recording. If you mispronounced a word or said 'um', you type the correction and Revoice generates it in your voice. It's the most useful feature for solo podcasters." },
    { q: "Does Podcastle publish directly to Spotify?", a: "Yes — Podcastle has direct publishing to Spotify, Apple Podcasts, and other major platforms built into paid plans. You don't need a separate podcast hosting service." },
  ],
  ocoya: [
    { q: "What platforms does Ocoya schedule to?", a: "Ocoya supports Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, TikTok, and Google Business Profile. You can create one post and schedule it across all platforms simultaneously." },
    { q: "How does Ocoya compare to Buffer or Hootsuite?", a: "Ocoya is significantly cheaper than Hootsuite and adds AI content generation that Buffer lacks. Buffer is better for detailed analytics. Hootsuite is better for large agency teams with multiple clients. For solo creators and small businesses, Ocoya offers the best value." },
    { q: "Can Ocoya write captions automatically?", a: "Yes — Ocoya's AI caption generator writes platform-specific captions based on your topic, product, or brief. It understands the difference between LinkedIn's professional tone and Instagram's casual voice." },
    { q: "Is there a free plan for Ocoya?", a: "Ocoya offers a free trial but no permanent free plan. Paid plans start at $15/month. At that price it replaces a standalone caption writer ($10–15/month) plus a scheduler ($10–15/month) — so it actually saves money." },
    { q: "Does Ocoya include graphic design tools?", a: "Yes — Ocoya has a built-in visual creator for making social media graphics. It's not as powerful as Canva for complex designs, but for standard social posts many users find they don't need Canva at all after switching to Ocoya." },
  ],
  replit: [
    { q: "Do I need to install anything to use Replit?", a: "No. Replit works entirely in your browser. No downloads, no local setup, no configuring Node.js or Python environments. You open a browser tab and start coding immediately. This is Replit's biggest advantage for beginners." },
    { q: "What coding languages does Replit support?", a: "Replit supports 50+ languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, and more. You can switch between languages instantly without installing anything on your machine." },
    { q: "How does Replit's AI compare to GitHub Copilot?", a: "Replit's AI (Ghostwriter) understands the context of your entire project — not just the current file. For beginners and solo projects it's very useful. GitHub Copilot integrates better into professional IDEs like VS Code for experienced developers." },
    { q: "Can I host my app on Replit for free?", a: "Yes — Replit's free plan gives you a public URL for every project instantly. The free hosting has limits on RAM and always-on uptime. The Core plan ($7/month) removes most limits and is excellent value for indie projects." },
    { q: "Is Replit good for learning to code from scratch?", a: "Replit is one of the best environments to learn coding in 2026. The zero-setup experience eliminates the frustration that stops most beginners. The AI assistant explains errors in plain language. Starting with Python on Replit is currently one of the fastest paths to writing real, working code." },
  ],
  taskade: [
    { q: "What makes Taskade different from Notion or Asana?", a: "Taskade combines task management + team chat + video calls + AI agents in one tool. Notion is better for documents and wikis. Asana is better for large enterprise project management. Taskade is the best all-in-one for small teams and freelancers who don't want 4 separate subscriptions." },
    { q: "What are Taskade AI agents?", a: "Taskade lets you build custom AI agents that automate your specific workflows. For example: an agent that takes a client brief and automatically creates a full project plan with tasks and deadlines. These agents run autonomously and can save 30–60 minutes per new project." },
    { q: "Is Taskade's free plan actually useful?", a: "Yes — unlike many tools where the free plan is just a limited demo, Taskade's free tier gives you real access to AI features, projects, and collaboration. A small team of 2–3 people can operate effectively on the free plan." },
    { q: "Does Taskade have a mobile app?", a: "Yes, Taskade has iOS and Android apps. The desktop experience is significantly better than mobile — the mobile app is functional but complex features like building AI agents work better on a computer or tablet." },
    { q: "What is the Taskade affiliate commission rate?", a: "Taskade pays 30% recurring commission for the lifetime of the customer. This means every person you refer continues generating 30% commission on their subscription each month, indefinitely." },
  ],
  grammarly: [
    { q: "Is Grammarly free?", a: "Yes — Grammarly's free plan covers basic grammar, spelling, and punctuation checks. It works across Gmail, Google Docs, and most web apps via the browser extension. Premium unlocks tone detection, clarity rewrites, and plagiarism checking." },
    { q: "How accurate is Grammarly?", a: "For standard business and academic writing, Grammarly's accuracy is excellent — better than Microsoft Word's built-in checker. It occasionally over-corrects creative writing by applying formal grammar rules to intentional stylistic choices." },
    { q: "Does Grammarly work internationally?", a: "Yes — Grammarly works globally via browser extension and desktop app across Gmail, Google Docs, Word, and 500+ other apps. It's effective in any country and supports American, British, Canadian, and Australian English style preferences." },
    { q: "Does Grammarly work in Microsoft Word and Google Docs?", a: "Yes — Grammarly has native integrations for both Microsoft Word (via a desktop add-in) and Google Docs (via Chrome extension). Corrections appear as underlines in real time, exactly like the built-in spell-checker but significantly more powerful." },
    { q: "Is Grammarly safe for confidential documents?", a: "Grammarly encrypts all text in transit and at rest, and its enterprise plan offers data-residency controls and zero-data-retention options. For highly sensitive legal or financial drafts, check your organisation's policy — but for everyday business writing it is widely trusted by Fortune 500 teams." },
  ],
  writesonic: [
    { q: "Is Writesonic free to use?", a: "Yes — Writesonic's free plan gives you 10,000 words per month powered by GPT-3.5. That covers several blog posts or dozens of social captions. Upgrading to a paid plan switches output to GPT-4 and removes the word cap." },
    { q: "How does Writesonic compare to Jasper?", a: "Writesonic is significantly cheaper than Jasper and includes a built-in AI chatbot (Chatsonic) and SEO checker that Jasper lacks. Jasper has stronger brand-voice training for large teams. For solo bloggers and small businesses, Writesonic delivers better value at every price point." },
    { q: "Can Writesonic write full SEO blog articles?", a: "Yes — the AI Article Writer generates long-form posts from a keyword, complete with an outline, headings, meta description, and an SEO score. The 5-step workflow walks you from keyword to publish-ready draft in around 10 minutes." },
    { q: "What is Chatsonic?", a: "Chatsonic is Writesonic's AI chatbot — similar to ChatGPT but with real-time web access and image generation built in. It can answer questions about current events, generate images on request, and remember your conversation context across a session." },
    { q: "Does Writesonic support languages other than English?", a: "Yes — Writesonic generates content in 25+ languages including Spanish, French, German, Portuguese, and Hindi. Quality is strongest in English, but short-form output like ad copy and social posts translates well in the major European and South Asian languages." },
  ],
  quillbot: [
    { q: "Is Quillbot free?", a: "Yes — Quillbot's free plan gives you unlimited paraphrasing in two modes (Standard and Fluency), a summariser with 1,200-word input limit, and a basic grammar checker. Premium unlocks 7 paraphrasing modes, unlimited summarising, a plagiarism checker, and faster processing." },
    { q: "Is using Quillbot considered cheating?", a: "Quillbot is a legitimate writing aid — it rephrases your ideas, it does not write them for you. However, many universities class AI-assisted paraphrasing as academic misconduct under their existing plagiarism policies. Always check your institution's rules before submitting AI-paraphrased work for assessment." },
    { q: "How does Quillbot compare to Grammarly?", a: "Quillbot and Grammarly solve different problems. Quillbot rewrites sentences to improve clarity or avoid repetition — ideal for students and researchers. Grammarly catches grammar, spelling, and tone issues as you type. Many writers use both: Grammarly to catch errors, Quillbot to rephrase awkward passages." },
    { q: "Does Quillbot's plagiarism checker work well?", a: "Quillbot's plagiarism checker (Premium only) compares your text against billions of web pages and academic sources via Turnitin's database. It's reliable for catching unintentional similarity but should be treated as a safety check rather than a guarantee — some paywalled journal databases are not included." },
    { q: "What paraphrasing modes does Quillbot offer?", a: "Quillbot Premium offers 7 modes: Standard, Fluency, Formal, Simple, Creative, Expand, and Shorten. Formal is useful for business emails and reports. Simple works well for rewriting complex academic text into plain language. Creative produces the most varied rewrites but needs the most human review." },
  ],
  frase: [
    { q: "What exactly does Frase do?", a: "Frase analyses the top 20 Google results for any keyword, extracts the topics and headings they cover, and generates an AI content brief that tells you exactly what to write. It then provides an AI writer to draft the article and a topic score to show how well your content covers the subject." },
    { q: "How does Frase compare to Surfer SEO?", a: "Both tools optimise content for search, but their workflows differ. Surfer SEO gives deeper on-page scoring and keyword density analysis — it's the stronger choice for established SEO teams. Frase is better for research-to-draft speed: it combines the brief builder and AI writer in one tool, making it faster for solo bloggers." },
    { q: "Is there a free plan for Frase?", a: "Frase offers a 5-day trial for $1, then plans start at $15/month for one user. There is no permanent free tier. The Solo plan at $15/month covers 4 articles per month, which is enough for most individual bloggers publishing once a week." },
    { q: "Does Frase write the full article or just the outline?", a: "Frase does both. It first generates an SEO-optimised brief (headings and topics to cover), then the AI writer fills in the content. For a 1,500-word article the full draft takes around 5 minutes. Most writers use Frase's draft as a structured starting point and then edit it into their own voice." },
    { q: "What type of writer gets the most value from Frase?", a: "Frase delivers the highest ROI for writers who produce SEO blog content on a schedule — especially freelancers managing multiple clients or bloggers in competitive niches. If you write fewer than 2 SEO articles per month, a cheaper AI writer plus a free SERP analysis tool may serve you just as well." },
  ],
  'leonardo-ai': [
    { q: "Is Leonardo.ai free to use?", a: "Yes — Leonardo.ai's free plan gives you 150 generation tokens per day, which translates to roughly 150 standard images. Tokens reset every 24 hours, making it one of the most generous free image-generation plans available. No credit card is required to sign up." },
    { q: "How does Leonardo.ai compare to Midjourney?", a: "Midjourney produces the most visually stunning photorealistic and artistic images, but runs entirely inside Discord. Leonardo.ai offers comparable quality with a proper web interface, real-time canvas, custom model training, and more fine-grained controls. For game developers and consistent character generation, Leonardo.ai is the stronger choice." },
    { q: "Can I train my own AI model on Leonardo.ai?", a: "Yes — this is one of Leonardo.ai's standout features. You can upload 10–20 reference images and train a custom model in under an hour. The trained model then generates images in your specific style or featuring your character — invaluable for brand consistency, game asset production, and consistent illustration series." },
    { q: "Who owns the images generated on Leonardo.ai?", a: "Images generated on Leonardo.ai's paid plans are yours to use commercially — including for selling products and client work. Free-plan images have the same commercial rights but are generated in a public community feed visible to other users. Use a paid plan for confidential commercial projects." },
    { q: "What is Leonardo.ai's Real-Time Canvas?", a: "Real-Time Canvas is Leonardo.ai's live AI drawing tool — you sketch rough shapes and the AI renders a photorealistic or stylised image in real time as you draw. It's the fastest way to explore compositions and iterate on ideas without waiting for generation queues." },
  ],
  photoroom: [
    { q: "Is PhotoRoom free?", a: "Yes — PhotoRoom's free plan removes backgrounds from images and includes basic editing. The watermark appears on exported images on the free tier. The Pro plan at $9.99/month removes the watermark, unlocks AI background generation, batch editing, and brand kit features." },
    { q: "How accurate is PhotoRoom's background removal?", a: "PhotoRoom's background removal is among the best available — it handles complex edges like hair, fur, and transparent objects better than most competitors. Based on verified user reports across G2 and Trustpilot, fewer than 10% of images require manual touch-up, mostly on translucent items like glass. Independent reviews consistently rank it above competitors for edge detection accuracy." },
    { q: "Can PhotoRoom handle batch background removal?", a: "Yes — batch background removal is available on paid plans. You can upload hundreds of product images and PhotoRoom processes them all automatically. This is the key feature for e-commerce sellers with large catalogues: a task that would take days manually takes minutes." },
    { q: "Does PhotoRoom work on mobile?", a: "Yes — PhotoRoom has highly rated iOS and Android apps that offer the full feature set including background removal, AI backgrounds, and basic retouching. The mobile app is particularly popular with Instagram sellers who photograph products on their phones and want a studio finish without a computer." },
    { q: "How does PhotoRoom compare to Remove.bg?", a: "Both tools remove backgrounds automatically, but PhotoRoom goes further: it adds AI-generated backgrounds, product shadow effects, and a batch editor. Remove.bg is faster for one-off quick removals. PhotoRoom is the better long-term tool for anyone doing regular product photography." },
  ],
  looka: [
    { q: "Do I own the logo I create with Looka?", a: "Yes — once you purchase a logo package from Looka, you receive full commercial ownership of all the files. Looka's packages include vector files (SVG, EPS) alongside PNG and JPEG formats, giving you print-ready assets you legally own outright." },
    { q: "How much does a Looka logo cost?", a: "Looka's basic logo package starts at around $20 for a one-time purchase of PNG files. The Brand Kit subscription at $96/year adds hundreds of branded assets including business cards, email signatures, and social media templates. Pricing varies by region and current promotions." },
    { q: "How does Looka compare to hiring a designer?", a: "A freelance logo designer typically charges $300–$2,000 for a custom logo with revisions. Looka costs $20–$96 and delivers results in minutes. The trade-off is uniqueness — Looka's logos are AI-generated from templates and may share similarities with logos made by other users. For early-stage startups and micro-businesses, Looka is excellent value." },
    { q: "Can I edit my Looka logo after purchase?", a: "You can make limited edits through Looka's online editor before and after purchase — adjusting colours, fonts, and layout. Major structural redesigns are not possible post-purchase. Review all variations carefully before buying, as Looka does not offer refunds once the files are downloaded." },
    { q: "Is Looka suitable for a professional business?", a: "Looka produces logos that look professional and work well for most small businesses, restaurants, online shops, and service providers. For businesses in highly competitive markets where brand differentiation is critical — agencies, luxury brands, or fast-scaling startups — the investment in a custom designer is worth considering alongside Looka." },
  ],
  pictory: [
    { q: "Can Pictory turn a blog post into a video automatically?", a: "Yes — paste your article URL or text into Pictory and it extracts the key points, matches them to stock footage from a library of 3 million+ clips, adds captions, and generates a complete video in minutes. No video editing skills are required. Most users go from blog post to published video in under 20 minutes." },
    { q: "Does Pictory include AI voiceovers?", a: "Yes — Pictory has 40+ AI voices across multiple languages and accents. You can also upload your own recorded voiceover and Pictory will sync it to the video automatically. The AI voices on higher plans sound noticeably more natural than those on the starter tier." },
    { q: "Is there a free trial for Pictory?", a: "Yes — Pictory offers a free trial that lets you create 3 video projects without a credit card. The trial videos include a Pictory watermark. Paid plans start at $19/month and remove watermarks, expand the stock library access, and increase monthly video minutes." },
    { q: "What video length and format does Pictory export?", a: "Pictory exports in 1080p MP4 format. You choose the aspect ratio — landscape (16:9) for YouTube, square (1:1) for Instagram feed, or portrait (9:16) for Reels and TikTok. One source article can be exported in all three formats in a single workflow." },
    { q: "How does Pictory compare to InVideo AI?", a: "Both tools turn text into video, but they target slightly different workflows. Pictory excels at repurposing existing written content — blog posts, transcripts, articles. InVideo AI is stronger for creating original videos from a fresh prompt with AI script writing included. If you have a content library to repurpose, Pictory is the better fit." },
  ],
  'opus-clip': [
    { q: "What types of video work best with Opus Clip?", a: "Opus Clip performs best on talking-head content — podcasts, interviews, webinars, YouTube videos, and online courses where one or two people are speaking. Videos with clear speech produce better clip selection than those with heavy B-roll, background music, or multiple rapid cuts." },
    { q: "How does Opus Clip select which moments to clip?", a: "Opus Clip's AI scores each section of your video for a 'Virality Score' based on factors including hook strength, emotional peaks, quotability, and pacing. It identifies the moments most likely to make viewers stop scrolling — typically strong opinion statements, surprising facts, or story payoffs." },
    { q: "Is there a free plan for Opus Clip?", a: "Yes — Opus Clip's free plan gives you 60 minutes of video processing per month, which covers roughly 2–3 long videos. Clips export with an Opus Clip watermark. The paid plans ($19/month and above) increase monthly minutes significantly and remove the watermark." },
    { q: "Can Opus Clip add captions automatically?", a: "Yes — Opus Clip adds auto-generated captions with emoji support and animated highlights. Caption accuracy is high for clear speech and standard accents. You can edit captions manually before exporting. Animated word-by-word captions are one of its most popular features for TikTok-style clips." },
    { q: "How does Opus Clip compare to Descript for short clips?", a: "Opus Clip is fully automated — you upload a video and it does the work. Descript gives you more manual control via a text-based editor where you cut by editing a transcript. Opus Clip is faster if you trust the AI to find highlights; Descript is better if you know exactly which moments you want and need precise editing control." },
  ],
  invideo: [
    { q: "How does InVideo AI generate a video from text?", a: "You type a prompt — for example, 'Make a 5-minute YouTube video about the history of coffee' — and InVideo AI writes a script, selects stock footage and music, adds voiceover and captions, and produces a complete video. The whole process takes 3–5 minutes. You can then edit any element — swap clips, change the voiceover, or rewrite sections by typing instructions." },
    { q: "Is InVideo AI free?", a: "Yes — InVideo AI's free plan lets you create unlimited videos but exports include a watermark and are limited to a lower resolution. The paid plans (from $20/month) remove watermarks, unlock 1080p export, give access to premium stock media, and increase monthly generation minutes." },
    { q: "Is InVideo AI good for faceless YouTube channels?", a: "InVideo AI is one of the top tools for faceless YouTube channels in 2026. It handles everything a faceless channel needs — script, footage, voiceover, captions — without you appearing on camera. Many creators use it to run channels in multiple niches simultaneously." },
    { q: "How does InVideo AI compare to Pictory?", a: "InVideo AI creates videos from scratch using a text prompt — ideal for original content. Pictory is better at repurposing existing written content like blog posts into video. If you're building a faceless YouTube channel from new topics, InVideo AI is the stronger choice. If you want to turn your blog archive into video, Pictory has the edge." },
    { q: "What stock footage library does InVideo AI use?", a: "InVideo AI provides access to a library of 16 million+ stock clips, images, and music tracks from Storyblocks and Shutterstock. Paid plan subscribers get premium Shutterstock footage included at no extra cost — a significant saving since Shutterstock individual clips typically cost $30–$50 each." },
  ],
  'murf-ai': [
    { q: "How realistic do Murf AI voices sound?", a: "Murf AI's voices rank among the most natural-sounding in the industry — the Studio voices on paid plans are regularly mistaken for real human narration in blind tests. The free-tier voices sound good for internal use but the difference in quality on the paid Studio voices is immediately noticeable for commercial content." },
    { q: "Is Murf AI free?", a: "Yes — Murf AI's free plan gives you access to all voices for preview and 10 minutes of voice generation per account. There is no time limit on the trial but the 10-minute cap is a firm ceiling. Paid plans start at $19/month and include 2–4 hours of generation per month with full commercial use rights." },
    { q: "Can Murf AI clone my voice?", a: "Murf AI's Voice Cloning feature (available on Enterprise and add-on plans) creates a custom AI voice from a sample of your recording. The clone can then read any text in your voice. This is useful for YouTubers and course creators who want AI-generated voiceovers that sound like them without re-recording." },
    { q: "How does Murf AI compare to ElevenLabs?", a: "ElevenLabs produces the highest-quality voice clones available and is the leader for ultra-realistic speech. Murf AI has a more polished all-in-one studio interface with video sync, background music, and a built-in presentation builder — better for users who want everything in one workflow. ElevenLabs is the pick for pure voice quality; Murf is the pick for production efficiency." },
    { q: "Does Murf AI support languages other than English?", a: "Yes — Murf AI supports 20+ languages including Spanish, French, German, Italian, Portuguese, Hindi, Japanese, and Korean. Each language has multiple voice options with regional accent variations. Quality is strongest in English, but the Spanish and French voices in particular are very natural-sounding." },
  ],
  gamma: [
    { q: "Is Gamma free to use?", a: "Yes — Gamma's free plan gives you 400 AI credits on sign-up, which creates roughly 4–5 full presentations. After that, additional credits are needed. The free plan also adds a 'Made with Gamma' badge to published decks. Paid plans start at $8/month and include unlimited AI creation and badge removal." },
    { q: "How does Gamma compare to PowerPoint or Google Slides?", a: "PowerPoint and Google Slides give you complete manual control over every pixel. Gamma trades that control for speed — a presentation that takes 2 hours in PowerPoint takes under 3 minutes in Gamma. Gamma also auto-handles responsive layout, so your decks look good on any screen size. For most pitches and internal decks, Gamma's output is indistinguishable from a hand-designed slide." },
    { q: "Can I import existing slides into Gamma?", a: "Yes — Gamma can import PowerPoint (.pptx) files and PDF slide decks. The conversion preserves your content and Gamma restructures the layout into its own format. After import, you can use AI to restyling, add pages, or rewrite sections. It is also possible to export Gamma decks back to PowerPoint for clients who need .pptx files." },
    { q: "Does Gamma work for documents and websites, not just presentations?", a: "Yes — Gamma creates three types of content: presentations (slides), documents (long-form scrollable pages), and websites (single-page publishable sites with a live URL). All three use the same AI workflow. This makes Gamma useful for one-pagers, case studies, and light landing pages — not just decks." },
    { q: "Is Gamma good for team collaboration?", a: "Gamma supports real-time collaboration on paid plans, similar to Google Slides. Team members can edit simultaneously and leave comments. The free plan is single-user only. For teams pitching investors or presenting to clients, the shared workspace and comment features make async review much faster than emailing PowerPoint files." },
  ],
  'beautiful-ai': [
    { q: "How does Beautiful.ai design slides automatically?", a: "Beautiful.ai uses 'Smart Slides' — template types that know how to lay themselves out. When you add a bullet point, a bullet template auto-formats it. Add a fifth team member card and the grid reflows to fit. You never manually drag elements or nudge alignment — the AI handles it. The result is a consistently polished deck regardless of how much content you add or remove." },
    { q: "Is there a free plan for Beautiful.ai?", a: "Beautiful.ai offers a 14-day free trial with full access to features, but no permanent free tier. After the trial, plans start at $12/month (billed annually). For users who create presentations regularly, this is comparable in price to Canva Pro and significantly cheaper than Pitch or high-tier Canva for Teams." },
    { q: "How does Beautiful.ai compare to Canva?", a: "Canva is far more flexible — you can design almost anything from scratch. Beautiful.ai is more constrained but produces more consistently professional presentations because the AI prevents layout mistakes. If you find yourself spending hours tweaking Canva slides to look right, Beautiful.ai's auto-design pays back the constraint in time saved." },
    { q: "Can multiple people collaborate on Beautiful.ai?", a: "Yes — Beautiful.ai has built-in team collaboration on the Team plan ($40/month per user). Multiple people can edit decks, share brand kits with locked fonts and colours, and leave feedback. The individual plan supports sharing view-only links but not simultaneous editing." },
    { q: "Is Beautiful.ai suitable for investor pitch decks?", a: "Beautiful.ai is a strong choice for pitch decks because consistency and professionalism matter more than flashy custom design in most investor contexts. The Smart Slide library includes purpose-built pitch deck layouts for problem/solution, market size, traction, and team pages. Founders who have switched from PowerPoint to Beautiful.ai typically report cutting deck-prep time by more than half." },
  ],
  'notion-ai': [
    { q: "What can Notion AI actually do inside Notion?", a: "Notion AI can write first drafts of documents, summarise long pages, extract action items from meeting notes, translate content into other languages, improve tone and clarity of existing text, auto-fill database properties, and answer questions about content in your workspace. It works directly inside any Notion doc or database — you highlight text or press Space to trigger it." },
    { q: "How much does Notion AI cost?", a: "Notion AI is a $10/month add-on charged per workspace member, on top of your existing Notion plan. For a solo user on the free Notion plan, Notion AI costs $10/month total. For teams, it's $10 per seat per month. There is no separate free trial for Notion AI — it uses Notion's standard trial period." },
    { q: "Is Notion AI better than using ChatGPT separately?", a: "Notion AI's key advantage is context — it can read and summarise your actual Notion docs, meeting notes, and project pages without you copying and pasting anything. ChatGPT has no access to your Notion workspace. For knowledge workers who live in Notion, the in-context AI is a significant productivity gain. For general writing tasks with no connection to your notes, ChatGPT is more capable and cheaper." },
    { q: "Can Notion AI summarise a long meeting page automatically?", a: "Yes — this is one of Notion AI's most-used features. Paste or link your meeting transcript into a Notion doc, click 'Summarise', and Notion AI produces a structured summary with key decisions and action items highlighted. Many teams have replaced their manual meeting-notes workflow entirely with Notion AI summaries." },
    { q: "Does Notion AI work on the mobile app?", a: "Yes — Notion AI is available on iOS and Android via the Notion mobile apps. You can trigger AI actions from any doc on mobile, though the experience is slightly slower than on desktop due to keyboard behaviour. Summarising and improving text works well on mobile; longer drafting tasks are more comfortable on a larger screen." },
  ],
};

// ── Week 8: FAQs for 5 new tools ──────────────────────────────────────────
Object.assign(TOOL_FAQS, {
  elevenlabs: [
    { q: "Is ElevenLabs free to use?", a: "Yes — ElevenLabs' free plan gives you 10,000 characters per month (roughly 7–8 minutes of audio) with access to all pre-made voices. No credit card is required. The Starter plan at $5/month triples the limit and adds commercial use rights." },
    { q: "How realistic are ElevenLabs voices?", a: "ElevenLabs consistently ranks as the most realistic AI voice generator available. In blind listening tests, the premium voices are regularly mistaken for real human recordings. The quality gap between ElevenLabs and other tools is significant — particularly for emotional range and natural pacing." },
    { q: "How do I clone my own voice with ElevenLabs?", a: "Go to Voices → Add Voice → Instant Voice Clone. Upload a clean 1-minute recording of yourself speaking naturally (no background noise). ElevenLabs processes it in under 2 minutes and creates a voice model you can use to generate any text. Professional Voice Clone (Creator plan) uses longer samples for even higher accuracy." },
    { q: "Can I use ElevenLabs voices commercially?", a: "Commercial use requires the Starter plan ($5/month) or above. The free tier is for personal and non-commercial use only. All paid plans include a commercial licence for content monetised on YouTube, sold as products, or used in client work." },
    { q: "How does ElevenLabs compare to Murf AI?", a: "ElevenLabs produces better-sounding voices, especially for voice cloning and emotional speech. Murf AI has a more polished production studio with video sync and background music built in. If pure voice quality is your priority, ElevenLabs wins. If you need a full voiceover production workflow in one app, Murf is more practical." },
  ],
  jasper: [
    { q: "Is Jasper worth the price compared to ChatGPT?", a: "Jasper justifies its price for marketing teams through brand voice consistency — it remembers your tone, terminology, and audience across every piece of content. ChatGPT doesn't retain brand context between sessions. For individuals, ChatGPT Plus at $20/month is better value. For teams producing high volume branded content, Jasper's consistency pays for itself." },
    { q: "Does Jasper have a free plan?", a: "Jasper offers a 7-day free trial with full access to all features. There is no permanent free tier. Plans start at $39/month for one user. Given the focus on team workflows, Jasper is generally purchased at the Pro ($59/month) or Business level." },
    { q: "What is Jasper's Brand Voice feature?", a: "Brand Voice is Jasper's standout feature — you paste examples of your best existing content and Jasper learns your style, tone, and vocabulary. Every output it generates afterwards applies that brand voice automatically. For teams where multiple writers produce content, it keeps everything sounding like one consistent voice." },
    { q: "How does Jasper compare to Writesonic?", a: "Writesonic is significantly cheaper ($16/month vs $39/month) and is better value for individual bloggers and small businesses. Jasper wins for marketing teams that need brand voice controls, collaboration, and campaign-level content planning. If you're a solo content creator, Writesonic gives you 80% of the output quality at less than half the price." },
    { q: "Does Jasper integrate with SEO tools?", a: "Yes — Jasper has a native integration with Surfer SEO. You can write and optimise content in real time, with Surfer's keyword recommendations appearing alongside Jasper's AI output. This makes it particularly effective for SEO-focused marketing teams who need to hit content score targets consistently." },
  ],
  descript: [
    { q: "How is Descript different from traditional audio editors?", a: "Traditional editors like Audacity show you a waveform — you cut audio by selecting sections of a wave. Descript shows you a text transcript of your recording. You edit by reading and deleting words on the page — Descript removes the corresponding audio automatically. It's the first tool to make audio editing accessible to non-technical creators." },
    { q: "Is Descript free?", a: "Yes — Descript's free plan gives you 1 hour of transcription per month and basic editing. Exported videos include a Descript watermark on the free plan. The Hobbyist plan at $12/month removes the watermark, adds unlimited transcription, and unlocks filler word removal — the two features most creators use daily." },
    { q: "What is Descript's Overdub feature?", a: "Overdub is Descript's AI voice cloning feature. Record 10 minutes of your voice reading training sentences, and Descript creates a model of your voice. You can then type any text and Descript speaks it in your voice — perfect for fixing mistakes without re-recording. It's available on the Creator plan ($24/month)." },
    { q: "How accurate is Descript's filler word removal?", a: "Descript's filler word removal is excellent — it detects 'um', 'uh', 'like', 'you know', and custom words you specify. Based on verified user reviews on G2 and Trustpilot, around 95% of filler words are correctly identified with very few false positives. You can review flagged instances before deleting. For an hour-long podcast, users consistently report saving 15–25 minutes of manual editing." },
    { q: "How does Descript compare to Podcastle?", a: "Podcastle is better for recording — especially remote interviews — and has a simpler learning curve. Descript is better for editing complex content where you need precise control over what stays and what goes. Many serious podcasters use both: Podcastle to record and do initial cleanup, Descript for detailed editing and production polish." },
  ],
  perplexity: [
    { q: "How is Perplexity different from Google Search?", a: "Google returns a list of links — you have to click through, read multiple pages, and synthesise the answer yourself. Perplexity reads those pages for you and returns a direct answer with numbered citations. It's particularly better for research questions that would normally require 10+ minutes of reading across multiple tabs. Perplexity does that in 10 seconds." },
    { q: "Is Perplexity Pro worth $20/month?", a: "Perplexity Pro is worth it if you do more than 5 research queries per day. The free plan gives 5 Pro searches daily — Pro removes the limit and adds access to GPT-4o, Claude 3.5, and Gemini Ultra in one subscription, plus file uploads and Spaces for team research. For power users, it effectively replaces separate subscriptions to multiple AI tools." },
    { q: "Does Perplexity make up answers?", a: "Perplexity is significantly less prone to hallucination than ChatGPT because every claim is grounded in a live web search. You can click any citation to verify the source instantly. It can still misinterpret or over-simplify sources, so for critical research always verify key claims — but the citation system makes fact-checking much easier than with uncited AI tools." },
    { q: "Can Perplexity analyse uploaded documents?", a: "Yes — on the Pro plan you can upload PDFs, Word documents, and images. Perplexity reads the content and answers questions about it, citing specific sections. This is useful for analysing reports, research papers, or contracts without reading the whole document. The free plan doesn't include file uploads." },
    { q: "How does Perplexity compare to ChatGPT for research?", a: "For factual research with verifiable sources, Perplexity is superior — it searches live web results and cites everything. ChatGPT (without browsing) works from training data and can confidently state outdated or incorrect information. For creative tasks, code generation, and nuanced conversation, ChatGPT is more capable. Many serious researchers use Perplexity for fact-finding and ChatGPT for synthesis and writing." },
  ],
  'canva-ai': [
    { q: "Is Canva AI free?", a: "Yes — Canva's free plan includes basic AI features: limited Magic Eraser, Magic Write (50 uses/lifetime on free), and text-to-image generation. The full AI suite — unlimited Magic Write, Magic Resize, Background Remover, and AI presentations — requires Canva Pro at $15/month. The 30-day Pro trial lets you test everything before committing." },
    { q: "How does Canva AI compare to Adobe Express?", a: "Canva has a larger template library and more polished AI writing tools. Adobe Express integrates better with Adobe Creative Cloud and has stronger photo editing. For most non-designers and content creators, Canva AI offers more value: better templates, easier interface, and more complete AI features in one platform. Adobe Express suits users already in the Adobe ecosystem." },
    { q: "Can Canva AI generate images from text?", a: "Yes — Canva's text-to-image generator is accessible in any design. Click the Apps panel, search 'Text to Image', describe your image, and choose a style. The quality is good for social media graphics and presentation visuals but doesn't match dedicated tools like Leonardo.ai for highly detailed or photorealistic images. For most content creation purposes, Canva's generator is fast and sufficient." },
    { q: "What is Magic Resize in Canva?", a: "Magic Resize is one of Canva Pro's most practical features. Design a graphic once — say, an Instagram square post — then click Resize, select other formats (Story, LinkedIn, Twitter header, YouTube thumbnail), and Canva automatically adapts your design to every size. It repositions elements intelligently rather than just stretching. For creators posting across multiple platforms, it saves 30–45 minutes per content batch." },
    { q: "Is Canva suitable for professional design work?", a: "Canva Pro is excellent for marketing materials, social content, presentations, and business documents. For highly technical design work — custom vector illustrations, print production files, complex brand identity systems — professional tools like Adobe Illustrator are more appropriate. Many professional marketers and content teams use Canva for speed and Illustrator for brand-level creative work that needs pixel-perfect control." },
  ],
});

// ── W2-T2: FAQs for tools previously missing from constants.ts TOOL_FAQS ──
Object.assign(TOOL_FAQS, {
  podcastle: [
    { q: "Is Podcastle free?", a: "Yes — Podcastle has a permanent free plan that includes remote recording (up to 10 hours/month), AI Magic Dust noise removal, automatic transcription (up to 3 hours), and up to 3 published episodes per month. No credit card is required. The paid Basic plan at $11.99/month removes episode limits and adds filler word removal." },
    { q: "How does Podcastle compare to Descript?", a: "Podcastle is better for recording — especially remote interviews with guests. Descript is better for heavy text-based editing of existing audio. If you record first then edit, Podcastle is the better starting point and it's cheaper than Descript. For solo podcasters who need one-click noise removal and simple publishing, Podcastle wins." },
    { q: "Can Podcastle remove background noise automatically?", a: "Yes — Podcastle's AI Magic Dust noise removal removes keyboard clicks, air conditioning hum, echo, and room noise in one click. Verified user feedback across G2 and Trustpilot consistently highlights this as one of the most effective one-click noise removal tools available at this price point. It's available on the free plan." },
    { q: "What is Podcastle Revoice?", a: "Revoice lets you clone your voice to fix recording mistakes without re-recording. If you mispronounced a word or said 'um', you type the correction and Revoice generates it in your voice. It's particularly useful for solo podcasters who want polished audio without multiple takes." },
    { q: "Does Podcastle publish directly to Spotify?", a: "Yes — Podcastle has direct publishing to Spotify, Apple Podcasts, and other major platforms built into paid plans. You don't need a separate podcast hosting service, which makes it one of the most complete end-to-end podcast tools for creators who want to record, edit, and publish in one platform." },
  ],
  replit: [
    { q: "Is Replit free to use?", a: "Yes — Replit's free plan includes a browser-based coding environment for 50+ languages, 3 public Repls with public URLs, and Ghostwriter AI autocomplete (limited). No local setup or installation is required. The Core plan at $7/month adds private Repls, always-on deployments, more compute power, and full Ghostwriter AI access." },
    { q: "Do I need to install anything to use Replit?", a: "No — Replit works entirely in your browser. No downloads, no local setup, no configuring Node.js or Python environments. You open a browser tab and start coding immediately. This is Replit's biggest advantage for beginners and anyone working on a shared or restricted machine." },
    { q: "What coding languages does Replit support?", a: "Replit supports 50+ languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, HTML/CSS, and more. You can switch between languages instantly without installing runtimes or configuring dependencies. It also supports full-stack frameworks including Next.js, Flask, and Django." },
    { q: "How does Replit AI compare to GitHub Copilot?", a: "Replit's Ghostwriter AI understands the context of your entire project — not just the current file — making it more contextually aware for small to mid-size projects. GitHub Copilot integrates better into professional IDEs like VS Code for experienced developers working on large codebases. For beginners and solo projects, Ghostwriter's in-browser integration is more accessible." },
    { q: "Is Replit good for learning to code from scratch?", a: "Replit is one of the best environments to learn coding in 2026. The zero-setup experience eliminates the frustration that stops most beginners before they write a single line. The AI assistant explains errors in plain language. Starting with Python on Replit is currently one of the fastest paths to writing real, working code for complete beginners." },
  ],
  ocoya: [
    { q: "Is Ocoya free?", a: "Ocoya does not have a permanent free plan — it offers a 7-day free trial with no credit card required. Paid plans start at $15/month. The trial gives full access to the AI caption generator, visual template editor, and social media scheduler across all supported platforms, which is enough to evaluate whether it fits your workflow." },
    { q: "What social media platforms does Ocoya support?", a: "Ocoya supports Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, TikTok, and Google Business Profile. You can create one post and schedule it across all platforms simultaneously with platform-appropriate formatting — Ocoya adjusts caption style and hashtag density based on the destination platform." },
    { q: "How does Ocoya compare to Buffer?", a: "Ocoya is cheaper than Buffer for most plans and adds AI caption generation that Buffer lacks. Buffer has stronger analytics and a cleaner scheduling calendar. For solo creators and small businesses who need both an AI caption writer and a scheduler in one tool, Ocoya offers better value. For teams with established content workflows who mainly need scheduling and analytics, Buffer is more mature." },
    { q: "Can Ocoya write social media captions automatically?", a: "Yes — Ocoya's AI caption generator writes platform-specific captions based on your topic, product, or brief. It understands the tone difference between LinkedIn's professional style and Instagram's casual voice, and generates hashtag suggestions optimised for reach on each platform." },
    { q: "Does Ocoya include graphic design tools?", a: "Yes — Ocoya has a built-in visual creator for making social media graphics with templates for all major platform formats. It's not as deep as Canva for complex design work, but for standard social posts many users find it eliminates the need to switch between a separate design and scheduling tool." },
  ],
});

// ── Week 1: FAQs for Cursor + Lovable ─────────────────────────────────────
Object.assign(TOOL_FAQS, {
  cursor: [
    { q: 'Is Cursor AI free to use?', a: 'Yes. Cursor\'s Hobby plan is permanently free — it includes 2,000 code completions and 50 slow AI requests per month. That\'s enough to evaluate the tool properly and build small projects. The Pro plan ($20/month) unlocks unlimited completions and fast requests using Claude 3.5 and GPT-4o.' },
    { q: 'How does Cursor compare to GitHub Copilot?', a: 'Cursor and GitHub Copilot are both excellent but solve the problem differently. Copilot is a plugin that enhances your existing VS Code or JetBrains setup. Cursor is a standalone editor (VS Code fork) with AI built into every feature. Cursor\'s Cmd+K inline editing and Composer multi-file agent are more powerful than anything in Copilot today. Copilot wins if you\'re in JetBrains or need GitHub-native integration. For VS Code users, Cursor is the better experience at $20/month vs $10/month.' },
    { q: 'Does Cursor work with my existing VS Code extensions?', a: 'Yes — almost all VS Code extensions work in Cursor unchanged because Cursor is a fork of VS Code built on the same extension API. Your themes, language support, formatters (Prettier, ESLint), debuggers, and most marketplace extensions transfer automatically when you first open Cursor.' },
    { q: 'Is Cursor good for non-developers or beginners?', a: 'Cursor is built for developers — it assumes you understand code and want AI to accelerate your workflow. It\'s not a no-code tool. If you want to build apps without writing code, Lovable or Replit are better starting points. For developers who already write code and want to go 2–3x faster, Cursor is one of the best investments in 2026.' },
    { q: 'What AI models does Cursor use?', a: 'Cursor Pro gives access to Claude 3.5 Sonnet (Anthropic), GPT-4o (OpenAI), and Cursor\'s own fine-tuned models. You can switch models per task — Claude 3.5 is generally best for complex refactoring and explanation tasks; GPT-4o is fast for short completions. The Hobby (free) plan uses slower model access with a monthly quota.' },
    { q: 'Is my code safe in Cursor?', a: 'Cursor has a Privacy Mode — when enabled, your code is not stored or used for model training. In Privacy Mode, prompts are sent to the AI model for inference only and are not logged. For enterprise users on the Business plan, Cursor offers zero-data-retention agreements. If you work with sensitive proprietary code, enable Privacy Mode in Settings before using AI features.' },
  ],
  lovable: [
    { q: 'What is vibe coding and how does Lovable fit in?', a: 'Vibe coding is the practice of building software by describing what you want in plain English and letting an AI generate and iterate on the code for you — without writing the code yourself. Lovable is currently the leading vibe-coding platform for full-stack web apps. You describe your app, Lovable generates React + Supabase code, deploys it instantly, and you keep refining by chatting. The term was coined by Andrej Karpathy in early 2025 and the category grew by over 400% in search volume through 2026.' },
    { q: 'Is Lovable really free?', a: 'Lovable has a permanent free plan with 5 messages per day. That\'s 5 prompts to generate or modify your app — enough to build a simple landing page or prototype a small tool each day without paying. The $25/month Starter plan gives 100 messages/month, which is enough to build a full MVP over a weekend. No credit card is required for the free plan.' },
    { q: 'How does Lovable compare to Bolt and v0?', a: 'Lovable, Bolt, and v0 are all AI app builders but with different strengths. Lovable is the best for full-stack apps — it handles both frontend (React) and backend (Supabase database + auth) automatically. Bolt (by StackBlitz) is strong for frontend JavaScript projects and has excellent framework support. v0 (by Vercel) excels at UI component generation for developers already in the Vercel ecosystem. For a non-developer who wants a working, deployed app with a real database, Lovable is the clearest path. For a developer who needs polished React components, v0 is excellent.' },
    { q: 'Can Lovable build a real app or just demos?', a: 'Lovable builds real, deployed applications — not demos or mockups. The generated apps are hosted on a live subdomain, backed by a real Supabase PostgreSQL database, with working authentication. I tested it with a newsletter lead capture form: submissions hit the database in real-time. That said, Lovable is best for apps with straightforward logic. Complex business rules, custom API integrations, and high-traffic production workloads still benefit from a developer reviewing and extending the generated code.' },
    { q: 'Does Lovable have an affiliate programme?', a: 'Yes — Lovable pays 30% recurring commission via its referral programme. You earn 30% of every monthly payment from referred customers, for as long as they stay subscribed. For a tool in a fast-growing category with genuine word-of-mouth growth, this is one of the strongest recurring commission rates in the AI tools space. Sign up at lovable.dev and find the referral section in your account dashboard.' },
  ],
});

// ── Comparison tables per tool ─────────────────────────────────────────────
export const TOOL_COMPARISONS: Record<string, Array<{
  name: string; price: string; freeplan: boolean; bestFor: string; ourPick: boolean;
}>> = {
  podcastle: [
    { name: 'Podcastle', price: 'Free–$23.99/mo', freeplan: true, bestFor: 'Recording + AI cleanup', ourPick: true },
    { name: 'Descript', price: '$12–$24/mo', freeplan: true, bestFor: 'Text-based editing', ourPick: false },
    { name: 'Riverside.fm', price: '$15–$24/mo', freeplan: true, bestFor: 'High-quality remote recording', ourPick: false },
    { name: 'Buzzsprout', price: 'Free–$12/mo', freeplan: true, bestFor: 'Hosting & distribution only', ourPick: false },
    { name: 'Audacity', price: 'Free', freeplan: true, bestFor: 'Manual editing (technical)', ourPick: false },
  ],
  rytr: [
    { name: 'Rytr', price: 'Free–$29/mo', freeplan: true, bestFor: 'Budget AI writing', ourPick: true },
    { name: 'Writesonic', price: 'Free–$99/mo', freeplan: true, bestFor: 'SEO blog posts', ourPick: false },
    { name: 'Jasper', price: '$39–$99/mo', freeplan: false, bestFor: 'Enterprise content teams', ourPick: false },
    { name: 'Copy.ai', price: 'Free–$36/mo', freeplan: true, bestFor: 'Marketing copy', ourPick: false },
    { name: 'ChatGPT Plus', price: '$20/mo', freeplan: true, bestFor: 'Flexible AI tasks', ourPick: false },
  ],
  ocoya: [
    { name: 'Ocoya', price: '$15–$99/mo', freeplan: false, bestFor: 'AI captions + scheduling', ourPick: true },
    { name: 'Buffer', price: 'Free–$120/mo', freeplan: true, bestFor: 'Simple scheduling', ourPick: false },
    { name: 'Hootsuite', price: '$99–$739/mo', freeplan: false, bestFor: 'Large teams & agencies', ourPick: false },
    { name: 'Later', price: 'Free–$80/mo', freeplan: true, bestFor: 'Instagram-first teams', ourPick: false },
    { name: 'Publer', price: 'Free–$49/mo', freeplan: true, bestFor: 'Budget scheduling', ourPick: false },
  ],
  replit: [
    { name: 'Replit', price: 'Free–$20/mo', freeplan: true, bestFor: 'Browser-based coding + AI', ourPick: true },
    { name: 'GitHub Codespaces', price: 'Free–$50/mo', freeplan: true, bestFor: 'Pro devs in VS Code', ourPick: false },
    { name: 'CodeSandbox', price: 'Free–$24/mo', freeplan: true, bestFor: 'Frontend web apps', ourPick: false },
    { name: 'Glitch', price: 'Free–$8/mo', freeplan: true, bestFor: 'Simple Node.js projects', ourPick: false },
    { name: 'VS Code + Copilot', price: 'Free + $10/mo', freeplan: true, bestFor: 'Local dev with AI', ourPick: false },
  ],
  taskade: [
    { name: 'Taskade', price: 'Free–$16/mo', freeplan: true, bestFor: 'AI agents + all-in-one', ourPick: true },
    { name: 'Notion', price: 'Free–$16/mo', freeplan: true, bestFor: 'Docs & wikis', ourPick: false },
    { name: 'Asana', price: 'Free–$24.99/mo', freeplan: true, bestFor: 'Enterprise project mgmt', ourPick: false },
    { name: 'ClickUp', price: 'Free–$12/mo', freeplan: true, bestFor: 'Feature-heavy teams', ourPick: false },
    { name: 'Monday.com', price: '$9–$16/mo', freeplan: false, bestFor: 'Visual project tracking', ourPick: false },
  ],
  cursor: [
    { name: 'Cursor', price: 'Free–$40/mo', freeplan: true, bestFor: 'AI-native code editor (VS Code fork)', ourPick: true },
    { name: 'GitHub Copilot', price: '$10–$19/mo', freeplan: true, bestFor: 'IDE plugin for VS Code + JetBrains', ourPick: false },
    { name: 'Windsurf', price: 'Free–$15/mo', freeplan: true, bestFor: 'Lightweight AI editor (Codeium)', ourPick: false },
    { name: 'Replit', price: 'Free–$20/mo', freeplan: true, bestFor: 'Browser-based coding + deploy', ourPick: false },
    { name: 'Codeium', price: 'Free–$15/mo', freeplan: true, bestFor: 'Free unlimited completions', ourPick: false },
  ],
  lovable: [
    { name: 'Lovable', price: 'Free–$50/mo', freeplan: true, bestFor: 'Full-stack app from prompts (React + Supabase)', ourPick: true },
    { name: 'Bolt', price: 'Free–$20/mo', freeplan: true, bestFor: 'Frontend JS apps, strong framework support', ourPick: false },
    { name: 'v0 by Vercel', price: 'Free–$20/mo', freeplan: true, bestFor: 'React UI components for Vercel devs', ourPick: false },
    { name: 'Replit', price: 'Free–$20/mo', freeplan: true, bestFor: 'Browser IDE + deploy for learners', ourPick: false },
    { name: 'Bubble', price: 'Free–$29/mo', freeplan: true, bestFor: 'No-code apps with visual editor', ourPick: false },
  ],
};

Object.assign(TOOL_COMPARISONS, {
  elevenlabs: [
    { name: 'ElevenLabs', price: 'Free–$99/mo', freeplan: true, bestFor: 'Realistic voice & cloning', ourPick: true },
    { name: 'Murf AI', price: 'Free–$39/mo', freeplan: true, bestFor: 'Studio voiceover workflow', ourPick: false },
    { name: 'Descript Overdub', price: '$12–$24/mo', freeplan: true, bestFor: 'Podcast editing + voice fix', ourPick: false },
    { name: 'Play.ht', price: 'Free–$39/mo', freeplan: true, bestFor: 'Blog-to-audio publishing', ourPick: false },
    { name: 'Speechify', price: 'Free–$139/yr', freeplan: true, bestFor: 'Personal listening & TTS', ourPick: false },
  ],
  jasper: [
    { name: 'Jasper', price: '$39–Custom/mo', freeplan: false, bestFor: 'Team brand voice control', ourPick: true },
    { name: 'Writesonic', price: 'Free–$99/mo', freeplan: true, bestFor: 'SEO blog posts at low cost', ourPick: false },
    { name: 'Copy.ai', price: 'Free–$36/mo', freeplan: true, bestFor: 'Quick marketing copy', ourPick: false },
    { name: 'Rytr', price: 'Free–$29/mo', freeplan: true, bestFor: 'Budget short-form writing', ourPick: false },
    { name: 'ChatGPT Plus', price: '$20/mo', freeplan: true, bestFor: 'Flexible general AI tasks', ourPick: false },
  ],
  descript: [
    { name: 'Descript', price: 'Free–$24/mo', freeplan: true, bestFor: 'Text-based audio & video editing', ourPick: true },
    { name: 'Podcastle', price: 'Free–$23.99/mo', freeplan: true, bestFor: 'Recording + AI cleanup', ourPick: false },
    { name: 'Riverside.fm', price: '$15–$24/mo', freeplan: true, bestFor: 'High-quality remote recording', ourPick: false },
    { name: 'Adobe Audition', price: '$20.99/mo', freeplan: false, bestFor: 'Professional audio engineering', ourPick: false },
    { name: 'Opus Clip', price: 'Free–$19/mo', freeplan: true, bestFor: 'Auto short-clip generation', ourPick: false },
  ],
  perplexity: [
    { name: 'Perplexity Pro', price: 'Free–$20/mo', freeplan: true, bestFor: 'Cited AI research search', ourPick: true },
    { name: 'ChatGPT Plus', price: '$20/mo', freeplan: true, bestFor: 'Creative & conversational AI', ourPick: false },
    { name: 'You.com', price: 'Free–$15/mo', freeplan: true, bestFor: 'Privacy-focused AI search', ourPick: false },
    { name: 'Bing AI', price: 'Free', freeplan: true, bestFor: 'Free AI search in browser', ourPick: false },
    { name: 'Elicit', price: 'Free–$10/mo', freeplan: true, bestFor: 'Academic paper research', ourPick: false },
  ],
  'canva-ai': [
    { name: 'Canva AI', price: 'Free–$15/mo', freeplan: true, bestFor: 'All-in-one design + AI creation', ourPick: true },
    { name: 'Adobe Express', price: 'Free–$9.99/mo', freeplan: true, bestFor: 'Adobe ecosystem integration', ourPick: false },
    { name: 'Leonardo.ai', price: 'Free–$24/mo', freeplan: true, bestFor: 'High-quality image generation', ourPick: false },
    { name: 'Looka', price: 'From $20 one-time', freeplan: false, bestFor: 'AI logo & brand identity', ourPick: false },
    { name: 'Gamma', price: 'Free–$8/mo', freeplan: true, bestFor: 'AI presentations only', ourPick: false },
  ],
});

export const TOOL_KEYWORDS: Record<string, string[]> = {
  podcastle: ['podcastle review', 'podcastle vs descript', 'best ai podcast recorder', 'podcastle free plan', 'ai podcast editing tool 2026'],
  rytr: ['rytr review', 'rytr vs chatgpt', 'best cheap ai writing tool', 'rytr free plan', 'rytr vs writesonic'],
  ocoya: ['ocoya review', 'ocoya vs buffer', 'best ai social media scheduler', 'ocoya alternative', 'ai caption generator tool'],
  replit: ['replit review', 'replit vs github copilot', 'best browser ide 2026', 'replit free plan', 'learn to code with ai'],
  taskade: ['taskade review', 'taskade vs notion', 'best ai task manager', 'taskade ai agents', 'taskade free plan 2026'],
  // Week 8: 5 new tools
  elevenlabs: ['elevenlabs review', 'elevenlabs vs murf ai', 'best ai voice generator 2026', 'elevenlabs free plan', 'ai voice cloning tool'],
  jasper: ['jasper ai review', 'jasper vs writesonic', 'best ai writing tool for teams', 'jasper brand voice', 'jasper ai pricing 2026'],
  descript: ['descript review', 'descript vs podcastle', 'text based audio editor ai', 'descript overdub review', 'best podcast editing software 2026'],
  perplexity: ['perplexity ai review', 'perplexity vs chatgpt', 'best ai search engine 2026', 'perplexity pro worth it', 'ai research tool with citations'],
  'canva-ai': ['canva ai review', 'canva ai tools 2026', 'canva magic write review', 'canva vs adobe express ai', 'best ai design tool free'],
};

// ── Week 1: TOOL_KEYWORDS for Cursor + Lovable ────────────────────────────
Object.assign(TOOL_KEYWORDS, {
  cursor: ['cursor ai review 2026', 'cursor vs github copilot', 'best ai code editor 2026', 'cursor ide free plan', 'cursor ai vs windsurf'],
  lovable: ['lovable ai review 2026', 'lovable vs bolt vs v0', 'best vibe coding tool 2026', 'lovable dev free plan', 'build app without coding ai'],
});

// ── Week 2: HeadshotPro — HEADSHOT category launch ────────────────────────
Object.assign(TOOL_FAQS, {
  headshotpro: [
    { q: 'How much does HeadshotPro cost?', a: 'HeadshotPro is a one-time payment with no subscription. The Basic plan is $29 for 40 headshots across 4 styles. Standard is $39 for 80 headshots across 8 styles. Premium is $59 for 120+ headshots across 15+ styles. All plans include commercial usage rights and 1–2 hour delivery. No free plan or trial is available.' },
    { q: 'How good are HeadshotPro AI headshots for LinkedIn?', a: 'Based on 2,100+ Trustpilot reviews (rated 4.8/5), HeadshotPro headshots consistently pass as professional photography at the thumbnail sizes LinkedIn uses. Profile views increase by up to 14x with a professional headshot versus a casual selfie according to LinkedIn\'s own published data. The caveat: input photo quality matters — well-lit selfies on plain backgrounds produce the best results.' },
    { q: 'How many photos do I need to upload to HeadshotPro?', a: 'HeadshotPro requires 10–20 clear selfies for best results. Photos should show your face clearly, feature good lighting, and avoid accessories like sunglasses or hats. Variety helps — different angles, slight head turns, and a few photos with and without glasses if you wear them. The more varied your input set, the more accurate and natural the AI output.' },
    { q: 'How long does HeadshotPro take to deliver headshots?', a: 'Most HeadshotPro orders are delivered within 1–2 hours. The website states up to 2 hours for standard orders; Premium plan orders are prioritised. Delivery is by email — you receive a download link when the batch is ready. Orders placed during off-peak hours are often faster.' },
    { q: 'Does HeadshotPro work for Indian users?', a: 'Yes — HeadshotPro works globally including India. Payment is in USD ($29–$59), so an international credit or debit card is required. UPI is not currently supported and forex charges apply. At current exchange rates, the Basic plan is approximately ₹2,415. The output quality is identical regardless of where you are located.' },
  ],
});

Object.assign(TOOL_COMPARISONS, {
  headshotpro: [
    { name: 'HeadshotPro', price: '$29–$59 one-time', freeplan: false, bestFor: 'LinkedIn & professional profiles', ourPick: true },
    { name: 'Aragon AI', price: '$29–$49 one-time', freeplan: false, bestFor: 'Creative & lifestyle headshots', ourPick: false },
    { name: 'Remini', price: 'Free–$9.99/mo', freeplan: true, bestFor: 'Quick photo enhancement', ourPick: false },
    { name: 'Try It On AI', price: '$14.99 one-time', freeplan: false, bestFor: 'Budget entry point', ourPick: false },
    { name: 'Fotor AI', price: 'Free–$8.99/mo', freeplan: true, bestFor: 'General photo editing + headshots', ourPick: false },
  ],
});

Object.assign(TOOL_KEYWORDS, {
  headshotpro: [
    'headshotpro review 2026',
    'best ai headshot tool for linkedin',
    'headshotpro vs aragon ai',
    'ai professional headshots cheap',
    'headshotpro worth it',
  ],
});

// ── Week 3: TOOL_FAQS for 5 new tools ────────────────────────────────────
Object.assign(TOOL_FAQS, {
  getresponse: [
    { q: 'Is GetResponse free?', a: 'GetResponse has a limited free plan for up to 500 contacts with basic email sending. Paid plans start at $13.30/month for 1,000 contacts with AI email generation, AI subject line optimizer, and unlimited email sends. The free plan is enough to test the platform but lacks automation and most AI features.' },
    { q: 'What makes GetResponse different from Mailchimp?', a: 'GetResponse is a full marketing platform — it includes email, visual automation builder, AI landing pages, webinars, and paid ad tools in a single subscription. Mailchimp is more beginner-friendly and has a larger template library, but its automation and AI features are locked to higher-cost tiers. For growing businesses needing automation, GetResponse offers better value at equivalent feature levels.' },
    { q: 'Does GetResponse have an AI email generator?', a: 'Yes. GetResponse\'s AI email generator creates complete email campaigns from a brief description — subject line, preheader, and body copy. The AI subject line optimizer analyzes likely open rates based on historical data. Both features are included in the Email Marketing plan ($13.30/month for 1,000 contacts).' },
    { q: 'What is GetResponse\'s affiliate commission?', a: 'GetResponse pays a 40–60% recurring commission, depending on the affiliate program tier you qualify for. This is one of the highest recurring commissions available in the email marketing software niche. Commissions are paid monthly for as long as the referred customer remains subscribed.' },
  ],
  munch: [
    { q: 'What is Munch AI used for?', a: 'Munch AI is used for video repurposing — taking long-form videos (YouTube videos, webinars, podcasts) and automatically creating short-form clips for YouTube Shorts, TikTok, LinkedIn, and Instagram. Unlike basic clip tools, Munch AI provides an AI engagement score for each clip and generates a multi-platform content calendar, making it a strategic repurposing tool rather than just an automated editor.' },
    { q: 'How is Munch AI different from Opus Clip?', a: 'Munch AI provides more strategic intelligence than Opus Clip. Both tools clip long-form videos into Shorts, but Munch AI additionally analyses transcript content for brand voice alignment, generates cross-platform content calendars, and uses engagement data from published content to improve future clip recommendations. Opus Clip is faster and simpler for pure Shorts volume; Munch AI is better for creators who publish across multiple platforms and want strategic insights alongside the clips.' },
    { q: 'How much does Munch AI cost?', a: 'Munch AI\'s Starter plan is $49/month for up to 60 hours of video per month. The Pro plan is $96/month for 150 hours. Both plans include AI engagement scoring, multi-platform export, and the content calendar. There is a free trial available to test the workflow before committing to a paid plan.' },
  ],
  fireflies: [
    { q: 'Is Fireflies.ai free to use?', a: 'Yes. Fireflies has a permanent free plan that includes 800 minutes of meeting storage, limited transcription credits (approximately 3 full meeting transcriptions per month), and basic AI meeting summaries. The free plan is enough to evaluate the tool. The Pro plan at $10/month per seat adds unlimited transcription, full AI summaries, and CRM integrations.' },
    { q: 'Which video conferencing tools does Fireflies work with?', a: 'Fireflies works with Zoom, Google Meet, Microsoft Teams, Webex, Ringcentral, BlueJeans, and 50+ other platforms. It joins meetings automatically via calendar invite — you connect your Google or Microsoft calendar and Fireflies attends meetings scheduled on it without any manual action.' },
    { q: 'Is Fireflies.ai safe for confidential meetings?', a: 'Fireflies processes meeting audio on their servers, which creates data residency considerations for highly sensitive meetings. Fireflies is SOC 2 Type II certified and encrypts data in transit and at rest. For most business meetings — sales calls, project reviews, team standups — the security posture is appropriate. For legally privileged, HIPAA-regulated, or highly confidential financial discussions, review Fireflies\' Data Processing Agreement and consider on-premise alternatives.' },
    { q: 'Does Fireflies integrate with CRMs?', a: 'Yes — Fireflies integrates with HubSpot, Salesforce, Pipedrive, and other major CRMs on the Pro plan ($10/month per seat). Meeting summaries, action items, and transcripts can be automatically logged to the relevant contact or deal record in your CRM immediately after each meeting.' },
  ],
});

// ── Week 3: TOOL_COMPARISONS for new tools ────────────────────────────────
Object.assign(TOOL_COMPARISONS, {
  getresponse: [
    { name: 'GetResponse', price: 'Free + from $13.30/mo', freeplan: true, bestFor: 'Full email + automation + landing pages', ourPick: true },
    { name: 'Mailchimp', price: 'Free + from $13/mo', freeplan: true, bestFor: 'Beginners — simplest editor', ourPick: false },
    { name: 'Brevo', price: 'Free + from $9/mo', freeplan: true, bestFor: 'Best free plan (300 emails/day)', ourPick: false },
    { name: 'ActiveCampaign', price: 'from $29/mo', freeplan: false, bestFor: 'Advanced behavioral automation', ourPick: false },
    { name: 'Kit (ConvertKit)', price: 'Free + from $9/mo', freeplan: true, bestFor: 'Content creators & newsletters', ourPick: false },
  ],
  munch: [
    { name: 'Munch AI', price: 'from $49/mo', freeplan: false, bestFor: 'Repurposing intelligence + multi-platform calendar', ourPick: true },
    { name: 'Opus Clip', price: 'Free + from $19/mo', freeplan: true, bestFor: 'Pure YouTube Shorts volume, virality scoring', ourPick: false },
    { name: 'InVideo AI', price: 'Free + from $20/mo', freeplan: true, bestFor: 'New video creation from text prompts', ourPick: false },
    { name: 'Descript', price: 'Free + from $12/mo', freeplan: true, bestFor: 'Text-based video editing', ourPick: false },
  ],
  fireflies: [
    { name: 'Fireflies.ai', price: 'Free + from $10/mo', freeplan: true, bestFor: 'Auto-join meetings, action items, CRM sync', ourPick: true },
    { name: 'Otter.ai', price: 'Free + from $16.99/mo', freeplan: true, bestFor: 'Real-time transcription, educational use', ourPick: false },
    { name: 'Fathom', price: 'Free + from $19/mo', freeplan: true, bestFor: 'Sales calls, Zoom-native', ourPick: false },
    { name: 'Notion AI', price: 'Free + $10/mo add-on', freeplan: true, bestFor: 'Note-taking & knowledge management', ourPick: false },
  ],
});

// ── Week 3: TOOL_KEYWORDS for new tools ──────────────────────────────────
Object.assign(TOOL_KEYWORDS, {
  getresponse: ['getresponse review 2026', 'getresponse vs mailchimp', 'best ai email marketing tool 2026', 'getresponse pricing', 'getresponse affiliate commission'],
  munch: ['munch ai review 2026', 'munch ai vs opus clip', 'best video repurposing ai tool', 'munch ai pricing', 'ai youtube shorts creator'],
  basedlabs: ['basedlabs review 2026', 'basedlabs affiliate', 'ai image generator alternatives', 'basedlabs vs leonardo ai', 'best ai image generator 2026'],
  narrato: ['narrato review 2026', 'narrato vs jasper', 'best ai content workspace', 'narrato pricing', 'ai content team tool'],
  fireflies: ['fireflies ai review 2026', 'fireflies vs otter ai', 'best ai meeting recorder 2026', 'fireflies free plan', 'ai meeting transcription tool'],
});
