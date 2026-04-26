import { Category, Tool } from './types';

export const SITE_CONFIG = {
  name: "AI Nexus",
  tagline: "The Best AI Tools — Reviewed & Ranked",
  bio: "I'm Navneet Arya — I test every AI tool personally and share honest, no-BS reviews. Affiliate links help keep the reviews completely free.",
  authorName: "Navneet Arya",
  authorBio: "I've been testing AI tools since 2022 across writing, audio, video, design, and productivity. Based in India, I focus on what actually works for solo creators and small teams — not enterprise buyers.",
  authorExperience: "2+ years testing AI tools",
  siteUrl: "https://ainexustools.online",
  email: "navneetarya1989@gmail.com",
  twitterUrl: "https://twitter.com/ainexustools",
  newsletterNote: "No spam — just honest AI tool reviews, once a week.",
};

// ── Affiliate links — all verified & active ───────────────────────────────
// Rytr:      https://rytr.me/?via=navneet-arya         30% recurring
// Podcastle: https://podcastle.ai/?ref=ymi1ntf          20% recurring
// Ocoya:     https://www.ocoya.com/?via=navneet         30% recurring
// Replit:    https://replit.com/refer/navneetarya1989   referral bonus
// Taskade:   https://www.taskade.com/?via=rlqcxz        30% recurring

export const TOOLS: Tool[] = [

  // WRITING
  {
    id: 'w1', slug: 'grammarly',
    name: 'Grammarly', tagline: 'AI writing assistant used by 40 million people',
    description: 'Grammarly checks grammar, spelling, tone, and clarity across every app you use — from Gmail to Google Docs. The most widely used AI writing tool in the world.',
    category: Category.WRITING, affiliateLink: 'https://grammarly.com?affiliateId=ainexus',
    iconName: 'CheckSquare', color: '#15a672', accentColor: '#0d7a54',
    userBadge: 'Most popular', pricing: 'Free + $12/month', bestFor: 'Everyone who writes',
    features: ['Grammar & spell check', 'Tone detection', 'Plagiarism checker', 'Works in 500+ apps'],
    pros: ['Works everywhere — browser, Word, Gmail', 'Best free plan in writing tools', 'Very accurate'],
    cons: ['Premium needed for full features', 'Can over-correct creative writing'],
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
  },

  // VIDEO
  {
    id: 'v1', slug: 'pictory',
    name: 'Pictory', tagline: 'Turn your articles and scripts into videos automatically',
    description: 'Pictory converts blog posts, scripts, and long-form content into short branded videos. The fastest way to repurpose written content into video for YouTube or Reels.',
    category: Category.VIDEO, affiliateLink: 'https://pictory.ai?via=ainexus',
    iconName: 'Film', color: '#818cf8', accentColor: '#6366f1',
    userBadge: 'Free trial ✓', pricing: 'From $19/month', bestFor: 'Bloggers & content repurposers',
    features: ['Article to video AI', 'Auto captions', 'Brand kit', 'AI voiceover'],
    pros: ['Saves hours of video editing', 'Great for repurposing blogs', 'Easy for non-editors'],
    cons: ['Limited design customisation', 'AI voice sounds robotic on some plans'],
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
  },
  {
    id: 'v3', slug: 'invideo',
    name: 'InVideo AI', tagline: 'Create faceless YouTube videos from a text prompt',
    description: 'InVideo AI generates complete videos from a text prompt — script, voiceover, stock footage, and captions included. Perfect for creating faceless YouTube channels at scale.',
    category: Category.VIDEO, affiliateLink: 'https://invideo.io?via=ainexus',
    iconName: 'Video', color: '#10b981', accentColor: '#059669',
    userBadge: 'Free plan ✓', pricing: 'Free + from $20/month', bestFor: 'Faceless YouTube creators',
    features: ['Text to video AI', 'AI script writer', 'AI voiceover', '16M+ media library'],
    pros: ['Entire video from one prompt', 'Great for faceless channels', 'Generous free tier'],
    cons: ['Stock footage can look generic', 'Needs editing for premium feel'],
  },

  // AUDIO
  {
    id: 'a1', slug: 'murf-ai',
    name: 'Murf AI', tagline: 'Studio-quality AI voiceovers in minutes',
    description: 'Murf AI creates studio-quality voiceovers for videos, presentations, and e-learning using 120+ realistic AI voices across 20 languages. No microphone needed.',
    category: Category.AUDIO, affiliateLink: 'https://murf.ai?via=ainexus',
    iconName: 'Mic', color: '#a78bfa', accentColor: '#7c3aed',
    userBadge: 'Free plan ✓', pricing: 'Free + from $19/month', bestFor: 'Video creators & eLearning',
    features: ['120+ AI voices', 'Voice changer', 'Background music library', 'Video sync'],
    pros: ['Very natural-sounding voices', 'Easy video sync', 'Great for eLearning content'],
    cons: ['Minute limits on lower plans', 'No voice cloning on basic plans'],
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
  },

  // PRODUCTIVITY
  {
    id: 'p1', slug: 'notion-ai',
    name: 'Notion AI', tagline: 'AI built directly inside your notes and workspace',
    description: 'Notion AI gives you the power of AI directly inside your notes, docs, and team wikis. Summarise meetings, write drafts, translate, and automate tasks without switching apps.',
    category: Category.PRODUCTIVITY, affiliateLink: 'https://notion.so?via=ainexus',
    iconName: 'FileText', color: '#6366f1', accentColor: '#4f46e5',
    userBadge: 'Most popular', pricing: '$10/month add-on', bestFor: 'Teams & knowledge workers',
    features: ['AI writing in docs', 'Auto-summarise pages', 'Action items from meetings', 'AI database fills'],
    pros: ['Built into your existing workflow', 'Great for teams', 'Covers writing, tasks, and wikis'],
    cons: ['Requires a Notion subscription', 'AI is an additional cost'],
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
  ],
  podcastle: [
    { q: "Is Podcastle free to use?", a: "Yes. Podcastle's free plan lets you record and edit podcasts with basic features. The main limitation is export quality and total recording minutes. For starting a first show or low-volume podcasting, the free plan is genuinely functional." },
    { q: "How does Podcastle compare to Descript?", a: "Podcastle is better for recording — especially remote interviews with guests. Descript is better for heavy text-based editing of existing audio. If you record first then edit, Podcastle is the better starting point and it's cheaper than Descript too." },
    { q: "Can Podcastle remove background noise automatically?", a: "Yes. Podcastle's AI noise removal is one of its best features — it removes keyboard clicks, air conditioning hum, echo, and room noise in one click. I've tested it on recordings made in a noisy apartment and the results are impressive." },
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
    { q: "Does Grammarly work in India?", a: "Yes — Grammarly works globally via browser extension and desktop app. It's widely used by Indian students, content writers, and professionals writing for international audiences." },
  ],
};

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
};

// ── GSC target keywords per tool ──────────────────────────────────────────
export const TOOL_KEYWORDS: Record<string, string[]> = {
  podcastle: ['podcastle review', 'podcastle vs descript', 'best ai podcast recorder', 'podcastle free plan', 'ai podcast editing tool 2026'],
  rytr: ['rytr review', 'rytr vs chatgpt', 'best cheap ai writing tool', 'rytr free plan', 'rytr vs writesonic'],
  ocoya: ['ocoya review', 'ocoya vs buffer', 'best ai social media scheduler', 'ocoya alternative', 'ai caption generator tool'],
  replit: ['replit review', 'replit vs github copilot', 'best browser ide 2026', 'replit free plan', 'learn to code with ai'],
  taskade: ['taskade review', 'taskade vs notion', 'best ai task manager', 'taskade ai agents', 'taskade free plan 2026'],
};
