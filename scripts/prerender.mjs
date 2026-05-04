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

// ── Tool FAQs (mirrors TOOL_FAQS in constants.ts) ────────────────────────────
// These are injected as FAQPage JSON-LD into each tool page's static HTML,
// giving Google the data it needs to show FAQ rich results in SERPs.
const TOOL_FAQS = {
  rytr: [
    { q: 'Is Rytr really free?', a: "Yes. Rytr's free plan gives you 10,000 characters per month — enough to write 3–4 short blog posts or 20+ social media captions. No credit card required to sign up." },
    { q: 'How does Rytr compare to ChatGPT?', a: 'ChatGPT is more flexible for conversation and complex tasks. Rytr is faster for specific writing jobs like ad copy, bios, and outlines — it has 40+ pre-built use cases. For $9/month unlimited, Rytr is far better value if you write structured content regularly.' },
    { q: 'Does Rytr work in languages other than English?', a: 'Yes — Rytr supports 30+ languages including Hindi, Spanish, French, German, and Arabic. The quality in non-English languages is solid for short-form content.' },
    { q: "What is Rytr's affiliate commission?", a: 'Rytr pays 30% recurring commission. That means if someone you refer stays subscribed, you earn 30% of their monthly payment every single month — indefinitely.' },
    { q: 'Can Rytr write full blog posts?', a: 'Rytr can write blog outlines, intros, and sections, but the free and Saver plans limit output length. For full 1,500+ word articles, the Unlimited plan at $29/month works, or a dedicated tool like Writesonic.' },
  ],
  podcastle: [
    { q: 'Is Podcastle free to use?', a: "Yes. Podcastle's free plan lets you record and edit podcasts with basic features. The main limitation is export quality and total recording minutes. For starting a first show or low-volume podcasting, the free plan is genuinely functional." },
    { q: 'How does Podcastle compare to Descript?', a: 'Podcastle is better for recording — especially remote interviews with guests. Descript is better for heavy text-based editing of existing audio. If you record first then edit, Podcastle is the better starting point and it\'s cheaper than Descript too.' },
    { q: 'Can Podcastle remove background noise automatically?', a: "Yes. Podcastle's AI noise removal is one of its best features — it removes keyboard clicks, air conditioning hum, echo, and room noise in one click. I've tested it on recordings made in a noisy apartment and the results are impressive." },
    { q: 'What is the Revoice feature?', a: "Revoice lets you clone your voice and fix mistakes in your recording without re-recording. If you mispronounced a word or said 'um', you type the correction and Revoice generates it in your voice. It's the most useful feature for solo podcasters." },
    { q: 'Does Podcastle publish directly to Spotify?', a: "Yes — Podcastle has direct publishing to Spotify, Apple Podcasts, and other major platforms built into paid plans. You don't need a separate podcast hosting service." },
  ],
  ocoya: [
    { q: 'What platforms does Ocoya schedule to?', a: 'Ocoya supports Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, TikTok, and Google Business Profile. You can create one post and schedule it across all platforms simultaneously.' },
    { q: 'How does Ocoya compare to Buffer or Hootsuite?', a: "Ocoya is significantly cheaper than Hootsuite and adds AI content generation that Buffer lacks. Buffer is better for detailed analytics. Hootsuite is better for large agency teams with multiple clients. For solo creators and small businesses, Ocoya offers the best value." },
    { q: 'Can Ocoya write captions automatically?', a: "Yes — Ocoya's AI caption generator writes platform-specific captions based on your topic, product, or brief. It understands the difference between LinkedIn's professional tone and Instagram's casual voice." },
    { q: 'Is there a free plan for Ocoya?', a: "Ocoya offers a free trial but no permanent free plan. Paid plans start at $15/month. At that price it replaces a standalone caption writer ($10–15/month) plus a scheduler ($10–15/month) — so it actually saves money." },
    { q: 'Does Ocoya include graphic design tools?', a: "Yes — Ocoya has a built-in visual creator for making social media graphics. It's not as powerful as Canva for complex designs, but for standard social posts many users find they don't need Canva at all after switching to Ocoya." },
  ],
  replit: [
    { q: 'Do I need to install anything to use Replit?', a: "No. Replit works entirely in your browser. No downloads, no local setup, no configuring Node.js or Python environments. You open a browser tab and start coding immediately. This is Replit's biggest advantage for beginners." },
    { q: 'What coding languages does Replit support?', a: 'Replit supports 50+ languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, and more. You can switch between languages instantly without installing anything on your machine.' },
    { q: "How does Replit's AI compare to GitHub Copilot?", a: "Replit's AI (Ghostwriter) understands the context of your entire project — not just the current file. For beginners and solo projects it's very useful. GitHub Copilot integrates better into professional IDEs like VS Code for experienced developers." },
    { q: 'Can I host my app on Replit for free?', a: "Yes — Replit's free plan gives you a public URL for every project instantly. The free hosting has limits on RAM and always-on uptime. The Core plan ($7/month) removes most limits and is excellent value for indie projects." },
    { q: 'Is Replit good for learning to code from scratch?', a: "Replit is one of the best environments to learn coding in 2026. The zero-setup experience eliminates the frustration that stops most beginners. The AI assistant explains errors in plain language. Starting with Python on Replit is currently one of the fastest paths to writing real, working code." },
  ],
  taskade: [
    { q: 'What makes Taskade different from Notion or Asana?', a: "Taskade combines task management + team chat + video calls + AI agents in one tool. Notion is better for documents and wikis. Asana is better for large enterprise project management. Taskade is the best all-in-one for small teams and freelancers who don't want 4 separate subscriptions." },
    { q: 'What are Taskade AI agents?', a: "Taskade lets you build custom AI agents that automate your specific workflows. For example: an agent that takes a client brief and automatically creates a full project plan with tasks and deadlines. These agents run autonomously and can save 30–60 minutes per new project." },
    { q: "Is Taskade's free plan actually useful?", a: "Yes — unlike many tools where the free plan is just a limited demo, Taskade's free tier gives you real access to AI features, projects, and collaboration. A small team of 2–3 people can operate effectively on the free plan." },
    { q: 'Does Taskade have a mobile app?', a: "Yes, Taskade has iOS and Android apps. The desktop experience is significantly better than mobile — the mobile app is functional but complex features like building AI agents work better on a computer or tablet." },
    { q: 'What is the Taskade affiliate commission rate?', a: "Taskade pays 30% recurring commission for the lifetime of the customer. This means every person you refer continues generating 30% commission on their subscription each month, indefinitely." },
  ],
  grammarly: [
    { q: 'Is Grammarly free?', a: "Yes — Grammarly's free plan covers basic grammar, spelling, and punctuation checks. It works across Gmail, Google Docs, and most web apps via the browser extension. Premium unlocks tone detection, clarity rewrites, and plagiarism checking." },
    { q: 'How accurate is Grammarly?', a: "For standard business and academic writing, Grammarly's accuracy is excellent — better than Microsoft Word's built-in checker. It occasionally over-corrects creative writing by applying formal grammar rules to intentional stylistic choices." },
    { q: 'Does Grammarly work internationally?', a: "Yes — Grammarly works globally via browser extension and desktop app across Gmail, Google Docs, Word, and 500+ other apps. It's effective in any country and supports American, British, Canadian, and Australian English style preferences." },
  ],
};

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
  {
    slug: 'leonardo-vs-midjourney',
    title: 'Leonardo.ai vs Midjourney (2026): Which AI Image Generator Should You Use?',
    metaDescription: 'Leonardo.ai vs Midjourney compared for creators, designers, and game developers. Real output quality, pricing, commercial rights, and an honest verdict on which image AI wins in 2026.',
    faqs: [
      { q: 'Is Leonardo.ai better than Midjourney?', a: 'They excel at different things. Midjourney produces the highest aesthetic quality for one-off images — painterly, cinematic outputs that other tools struggle to match. Leonardo.ai gives you far more control: 150+ fine-tuned models, custom model training, and a canvas editor. For consistent brand or character visuals across many images, Leonardo.ai wins. For single standout images where quality is everything, Midjourney wins.' },
      { q: 'Does Leonardo.ai have a free plan?', a: 'Yes. Leonardo.ai\'s free plan gives 150 tokens per day — roughly 30–40 standard images per day. Commercial use is permitted on the free plan, which is more permissive than Midjourney\'s free-tier policy. Midjourney has no permanent free plan; subscriptions start at $10/month.' },
      { q: 'Can I use Leonardo.ai images commercially?', a: 'Yes. Paid plan users have full commercial rights to generated images. Free plan users also have commercial usage rights for outputs, though terms should be confirmed in Leonardo\'s current license. Midjourney paid plans (Basic and above) also include commercial rights.' },
      { q: 'What is custom model training in Leonardo.ai?', a: 'Leonardo.ai lets you upload 15–20 reference images and fine-tune a model on your specific art style, character, or brand visuals. Once trained, the model consistently reproduces that style across new generations. This is the most practical way to generate a recurring character or product that looks the same across many different images.' },
      { q: 'Which AI image generator is better for beginners?', a: 'Leonardo.ai is more accessible for beginners. The model selector, preset styles, and intuitive interface give you a clear starting point without needing to learn complex prompt engineering. Midjourney\'s output quality ceiling is higher, but reaching it consistently requires significant time learning prompt syntax and iteration strategies.' },
    ],
  },
  {
    slug: 'replit-vs-github-copilot',
    title: 'Replit vs GitHub Copilot (2026): Which AI Coding Tool Is Right for You?',
    metaDescription: 'Replit vs GitHub Copilot compared for beginners, indie developers, and professionals. What each tool actually does, where each wins, and which AI coding tool to use in 2026.',
    faqs: [
      { q: 'Is Replit better than GitHub Copilot?', a: 'They solve different problems. Replit is a browser-based coding environment with built-in AI — you write, run, and deploy code all in one place, no local setup needed. GitHub Copilot is an AI autocomplete assistant that works inside existing IDEs like VS Code. If you\'re a beginner or building side projects, Replit is more useful. If you\'re a professional developer already in VS Code, Copilot is what you actually want.' },
      { q: 'Does Replit have a free plan?', a: 'Yes. Replit\'s free plan includes unlimited public projects, 3 private projects, and basic Ghostwriter AI features. Paid plans start at $7/month and unlock more compute, unlimited private projects, and advanced AI agent features. GitHub Copilot has no permanent free plan — it costs $10/month for individuals, with free access available through GitHub Education for students and verified open-source contributors.' },
      { q: 'Can Replit replace GitHub Copilot?', a: 'Not directly. Replit is a complete coding environment; GitHub Copilot is a plugin for existing environments. If you use VS Code with a local development setup, Copilot integrates into that workflow — Replit cannot. If you want a browser-based environment with AI assistance included, Replit covers that use case entirely.' },
      { q: 'What is Replit Ghostwriter?', a: 'Ghostwriter is Replit\'s built-in AI coding assistant. It provides code completion, debugging help, code explanation, and an AI agent that can execute multi-step tasks across your project — such as adding a feature, refactoring code, or fixing all errors in a file. Unlike GitHub Copilot, Ghostwriter has access to your entire project context, not just the current file.' },
      { q: 'Which AI coding tool is best for learning to code?', a: 'Replit is significantly better for learning. The browser-based environment eliminates the setup friction that causes most beginners to quit before writing a single line. Ghostwriter can explain what code does and why it works — it\'s designed partly as a learning tool. GitHub Copilot autocompletes code at high speed, which can produce code you don\'t understand, undermining the learning process.' },
    ],
  },
  {
    slug: 'taskade-vs-notion',
    title: 'Taskade vs Notion (2026): Which AI Productivity Tool Actually Gets Work Done?',
    metaDescription: 'Taskade vs Notion compared for freelancers, solopreneurs, and small teams. Real breakdown of AI features, project management, knowledge base capabilities, and pricing in 2026.',
    faqs: [
      { q: 'Is Taskade better than Notion?', a: 'For execution and project management — getting tasks done, moving work forward, automating repetitive workflows — Taskade is better. Its AI agents generate project plans and run automations proactively. For knowledge management, documentation, and building complex interconnected information systems, Notion\'s flexibility is unmatched. The right choice depends on whether your biggest friction is doing work or organising knowledge.' },
      { q: 'Does Taskade have a free plan?', a: 'Yes. Taskade\'s free plan includes unlimited projects, basic collaboration, and 5 AI agent runs per month. Paid plans start at $8/month per workspace. Notion also has a free plan (unlimited pages, limited collaboration features, 7-day history). Notion AI is a $10/month add-on to any Notion plan.' },
      { q: 'What are Taskade AI agents?', a: 'Taskade AI agents are custom AI assistants assigned to specific projects. You can create agents that automatically generate project plans from a goal description, draft task content, summarise project status for weekly reports, or run other repetitive workflows inside your workspace. They run inside your projects and have access to your task data — unlike generic AI chatbots.' },
      { q: 'Can Taskade replace Notion?', a: 'For most project management and team collaboration use cases, yes. Taskade covers task management, AI-assisted planning, real-time collaboration, and basic documentation. For complex knowledge management — interconnected databases, research wikis, custom CRMs — Notion\'s flexibility and database features are significantly more powerful and Taskade would feel limiting.' },
      { q: 'Which productivity tool is better for solopreneurs and freelancers?', a: 'Taskade is typically better for solopreneurs and freelancers who want to move fast. The AI project scaffolding, built-in agent automation, and lower setup overhead mean you spend more time doing work and less time building your productivity system. Notion requires more upfront setup but offers more long-term flexibility as your workflows grow in complexity.' },
    ],
  },

  // ── Week 6 additions ────────────────────────────────────────────────────────
  {
    slug: 'grammarly-vs-writesonic',
    title: 'Grammarly vs Writesonic (2026): Which AI Writing Tool Is Right for You?',
    metaDescription: 'Grammarly vs Writesonic compared for freelancers, bloggers, and content creators. One fixes your writing; the other generates it. Here\'s which one you actually need in 2026.',
    faqs: [
      { q: 'Is Grammarly better than Writesonic for writing?', a: 'They do different things. Grammarly improves writing you\'ve already produced — grammar, clarity, tone. Writesonic generates new content from scratch. For editing and proofreading, Grammarly wins. For generating blog posts and marketing copy, Writesonic wins. Most serious content creators use both.' },
      { q: 'Can Writesonic replace a human writer?', a: 'Writesonic can replace the first-draft phase of writing for structured content like blog posts, product descriptions, and ad copy. It significantly reduces time-to-draft. However, the output still needs editing for voice, nuance, and accuracy. It works best as a writing accelerator rather than a full replacement for human judgement.' },
      { q: 'Does Grammarly work with Google Docs?', a: 'Yes. Grammarly has a browser extension that works inside Google Docs, Gmail, LinkedIn, Twitter, and most web-based text editors. It also has native desktop apps for Mac and Windows, and a Microsoft Office add-in for Word and Outlook. The free plan includes all platform integrations.' },
      { q: 'Which has a better free plan — Grammarly or Writesonic?', a: 'Grammarly\'s free plan is better for most users — it provides unlimited grammar and spelling checks with no word count limits. Writesonic\'s free plan gives 10,000 words per month, which is enough to test the tool but limiting for regular use. For casual writers, Grammarly free is the better starting point.' },
    ],
  },
  {
    slug: 'murf-ai-vs-elevenlabs',
    title: 'Murf AI vs ElevenLabs (2026): Which AI Voice Generator Is Worth It?',
    metaDescription: 'Murf AI vs ElevenLabs compared for content creators, podcasters, and video producers. Real voice quality, pricing, and an honest verdict on which AI voice tool wins in 2026.',
    faqs: [
      { q: 'Is Murf AI or ElevenLabs better for YouTube videos?', a: 'Murf AI is better for most YouTube creators. Its built-in video sync, script editor, and professional voice library make voiceover production faster and easier than ElevenLabs\' workflow. ElevenLabs is worth considering for creators who want to clone their own voice for consistent channel identity across a large volume of videos.' },
      { q: 'Can ElevenLabs clone any voice?', a: 'ElevenLabs can create a voice clone from audio you provide — your own voice, a public domain recording, or audio you have rights to use. Creating unauthorised clones of other people\'s voices without consent violates ElevenLabs\' Terms of Service and is illegal in many jurisdictions. The tool is designed for legitimate voice replication use cases.' },
      { q: 'Which AI voice tool is best for e-learning?', a: 'Murf AI is the better choice for e-learning production. The professional voice library with accent variety, the pronunciation editor for technical terms, and the video sync feature make it a complete e-learning voiceover tool. The collaboration features on Team plans also suit instructional design workflows with multiple contributors.' },
      { q: 'Does Murf AI offer voice cloning?', a: 'Yes. Murf AI offers voice cloning on its Enterprise plan. However, ElevenLabs provides more accessible and accurate voice cloning on lower-cost plans (Creator plan at $22/month). If custom voice cloning is your primary need, ElevenLabs is the better and more affordable option for most creators.' },
    ],
  },
  {
    slug: 'taskade-vs-asana',
    title: 'Taskade vs Asana (2026): Which Project Management Tool Should You Use?',
    metaDescription: 'Taskade vs Asana compared for freelancers, small teams, and remote workers. AI features, pricing, and an honest verdict on which project management tool wins in 2026.',
    faqs: [
      { q: 'Is Taskade better than Asana for small teams?', a: 'For teams of 1–8 people, Taskade offers better value than Asana in 2026. The workspace-based pricing (not per user) makes it dramatically cheaper, the AI agents that generate project plans and status reports are more integrated than Asana\'s AI add-ons, and the free plan is more functional. Asana\'s depth becomes worthwhile at larger team sizes and enterprise complexity.' },
      { q: 'Does Asana have AI features?', a: 'Yes. Asana Intelligence (available on Advanced and Enterprise plans) includes smart fields, AI-generated status updates, and goal alignment suggestions. However, the AI features are add-ons to an existing product rather than built into the core workflow. Taskade\'s AI agents are more deeply integrated and available on lower-cost plans.' },
      { q: 'Can Taskade replace Asana for a mid-size company?', a: 'Taskade can replace Asana for most mid-size teams focused on execution and collaboration. However, companies that rely on Asana\'s portfolio management, advanced reporting, 200+ native integrations, or custom approval workflows may find Taskade\'s feature set limiting. Evaluate which specific Asana features your team actively uses before switching.' },
      { q: 'What is the free plan difference between Taskade and Asana?', a: 'Both tools have free plans. Asana\'s free plan supports up to 15 users but limits features significantly — no custom fields, no advanced automation, and no reporting. Taskade\'s free plan offers unlimited projects and workspaces with basic AI credits. For individual users and very small teams, Taskade\'s free tier provides more practical functionality.' },
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
function buildPage(template, { title, description, canonical, schemas = [], robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1', datePublished = null, bodyHtml = null }) {
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

  // ── Body content injection for non-JS crawlers & GEO signals ────────────────
  // React replaces <div id="root"> contents on mount. Until then, crawlers see
  // a real H1, author byline, datePublished, and description — boosting GEO score
  // signals: H1 (+10%), Author (+10%), Date (+5%), Content depth (+5%).
  const publishDate = datePublished || TODAY;
  const displayDate = new Date(publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  // Strip "| AI Nexus" suffix for the H1 so it reads naturally
  const h1Text = esc(title.replace(/ \| AI Nexus$/, ''));
  const pageBody = bodyHtml
    ? `<div id="pre-render" style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
      <h1 style="font-size:1.6rem;line-height:1.25;margin-bottom:12px">${h1Text}</h1>
      <p style="color:#555;font-size:.875rem;margin-bottom:16px">By <strong>${esc(AUTHOR)}</strong> · <time datetime="${publishDate}">Updated ${displayDate}</time></p>
      ${bodyHtml}
    </div>`
    : `<div id="pre-render" style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
      <h1 style="font-size:1.6rem;line-height:1.25;margin-bottom:12px">${h1Text}</h1>
      <p style="color:#555;font-size:.875rem;margin-bottom:16px">By <strong>${esc(AUTHOR)}</strong> · <time datetime="${publishDate}">Updated ${displayDate}</time></p>
      <p style="font-size:1rem;line-height:1.6;color:#333">${esc(description)}</p>
    </div>`;

  // Replace <div id="root"></div> — React will re-render on mount
  html = html.replace('<div id="root"></div>', `<div id="root">${pageBody}</div>`);

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

  // Static pages — all with trailing slashes (canonical form served by GitHub Pages)
  urls.push({ loc: `${SITE}/about/`,           priority: '0.7', freq: 'monthly', mod: TODAY });
  urls.push({ loc: `${SITE}/disclosure/`,       priority: '0.3', freq: 'yearly',  mod: TODAY });
  urls.push({ loc: `${SITE}/methodology/`,      priority: '0.7', freq: 'monthly', mod: TODAY });
  urls.push({ loc: `${SITE}/best-free-ai-tools/`, priority: '0.9', freq: 'weekly', mod: TODAY });

  // Blog list + individual blog posts
  urls.push({ loc: `${SITE}/blog/`, priority: '0.8', freq: 'weekly', mod: TODAY });
  for (const post of BLOG_POSTS) {
    urls.push({ loc: `${SITE}/blog/${post.slug}/`, priority: '0.85', freq: 'monthly', mod: post.dateModified });
  }

  // Compare pages
  for (const a of COMPARE_ARTICLES) {
    urls.push({ loc: `${SITE}/compare/${a.slug}/`, priority: '0.95', freq: 'monthly', mod: TODAY });
  }

  // Tool pages — affiliate picks get 0.9, rest 0.8
  const affiliatePicks = new Set(['rytr', 'podcastle', 'ocoya', 'replit', 'taskade']);
  for (const t of TOOLS) {
    urls.push({
      loc: `${SITE}/tools/${t.slug}/`,
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

// ── Blog post data (mirrors blog/ folder) ─────────────────────────────────────
// IMPORTANT: Every entry here must match the slug and metadata in blog/*.ts
// When adding new blog posts, add them here AND in blog/index.ts
const BLOG_POSTS = [
  {
    slug: 'best-ai-writing-tools-for-beginners-2026',
    title: 'Best AI Writing Tools for Beginners 2026 — Tested & Ranked',
    metaDescription: 'Looking for the best AI writing tools for beginners? I personally tested Rytr, Grammarly, QuillBot, and Writesonic so you can start writing smarter in 2026.',
    datePublished: '2026-05-03',
    dateModified: '2026-05-03',
    faqs: [
      { q: 'What is the best free AI writing tool for beginners?', a: 'Grammarly offers the best free plan for beginners — it catches grammar, spelling, and tone issues across every app you use, from Gmail to Google Docs, with no word limit on the free tier.' },
      { q: 'Which AI writing tool is easiest for complete beginners?', a: 'Rytr is the easiest AI writing tool for beginners. You pick a use case (blog post, ad, bio), enter a few keywords, and Rytr writes the content. No learning curve, no complex settings.' },
      { q: 'Can AI writing tools replace a human writer?', a: 'No. AI writing tools generate drafts and starting points, but they lack personal experience, nuanced opinions, and original research. They work best as a co-writer — handling the first draft while you edit, add examples, and inject your voice.' },
      { q: 'How much do AI writing tools cost for beginners?', a: 'Most AI writing tools have a usable free plan. Paid plans start at $9/month (Rytr) and $9.95/month (QuillBot). Grammarly Pro is $12/month. Writesonic starts at $16/month. You can get started with zero cost using free tiers.' },
    ],
  },
  {
    slug: 'best-ai-tools-for-freelancers-2026',
    title: 'Best AI Tools for Freelancers 2026 — Work Faster, Earn More',
    metaDescription: 'The best AI tools for freelancers in 2026 — tested across writing, design, productivity, social media and coding. Cut your workload in half without cutting your rates.',
    datePublished: '2026-05-03',
    dateModified: '2026-05-03',
    faqs: [
      { q: 'Are AI tools worth it for freelancers?', a: "Yes — with one condition. AI tools are worth it when they speed up tasks you already do repeatedly, like writing first drafts, editing photos, or generating social captions. They are not worth it if you buy tools you don't have a workflow for yet. Start with one tool that solves your biggest bottleneck." },
      { q: 'What is the best free AI tool for freelancers?', a: "Grammarly's free plan is the highest-value free AI tool for most freelancers — it improves every client email, proposal, and deliverable you write. For content creation, Rytr's free plan (10,000 characters/month) is the best no-cost option for generating drafts." },
      { q: 'Can AI tools replace a freelancer?', a: 'No. AI tools handle repetitive, template-driven work — first drafts, background removal, caption generation. They cannot replace the client relationship, creative strategy, domain expertise, or accountability that clients pay a freelancer for.' },
    ],
  },
  // ── Week 4 additions ──────────────────────────────────────────────────────
  {
    slug: 'best-grammarly-alternatives',
    title: 'Best Grammarly Alternatives in 2026 — Tested & Ranked',
    metaDescription: 'Looking for a cheaper or better alternative to Grammarly? I tested QuillBot, Writesonic, Rytr, and ProWritingAid. Here are the best Grammarly alternatives that actually work.',
    datePublished: '2026-05-03',
    dateModified: '2026-05-03',
    faqs: [
      { q: 'What is the best free alternative to Grammarly?', a: "QuillBot is the best free Grammarly alternative for most users. Its free paraphraser, summariser, and grammar checker cover the core writing improvement needs without a subscription. For real-time grammar checking while you write, LanguageTool's free browser extension is the closest free alternative to Grammarly's core workflow." },
      { q: 'Is QuillBot better than Grammarly?', a: "QuillBot and Grammarly solve different problems. Grammarly excels at real-time grammar, tone, and clarity improvements as you write. QuillBot excels at paraphrasing and restructuring existing text. If you write original content, Grammarly is better. If you rewrite or summarise content regularly, QuillBot is the better tool." },
      { q: 'Why do people look for Grammarly alternatives?', a: "The most common reasons are: (1) Grammarly Premium costs $12–$15/month, which is expensive for casual writers. (2) Some users want a paraphrasing tool rather than a grammar checker. (3) Grammarly's browser extension can slow down older computers. (4) Some writers find Grammarly's suggestions overly prescriptive for creative writing." },
      { q: 'What is the cheapest Grammarly alternative?', a: "Rytr at $9/month is the cheapest paid alternative that covers AI writing assistance. QuillBot Premium at $9.95/month is the cheapest alternative focused on paraphrasing and grammar. For completely free alternatives, QuillBot's free plan and LanguageTool's free plan are both functional for regular use." },
    ],
  },
  {
    slug: 'best-podcastle-alternatives',
    title: 'Best Podcastle Alternatives in 2026 — For Podcasters Who Need More',
    metaDescription: 'Looking for a Podcastle alternative? I tested Descript, Riverside.fm, and Adobe Podcast. Here are the best alternatives for recording, editing, and publishing podcasts in 2026.',
    datePublished: '2026-05-03',
    dateModified: '2026-05-03',
    faqs: [
      { q: 'What is the best free alternative to Podcastle?', a: "Adobe Podcast's Enhance Speech tool is the best free alternative for audio quality cleanup — it removes background noise from any recording instantly, no account required. For recording, Riverside.fm's free plan (2 hours of recording per month) is the strongest free Podcastle alternative for remote guest interviews." },
      { q: 'Is Riverside.fm better than Podcastle?', a: "Riverside.fm produces higher recording quality than Podcastle at comparable price points — it captures local tracks at up to 4K video and 48kHz audio. Podcastle has a stronger AI editing suite, better noise removal, and a more integrated publishing workflow. Riverside wins on raw recording quality; Podcastle wins on post-production AI features." },
      { q: 'Can I switch from Podcastle to Descript easily?', a: "Yes — switching is straightforward. Export your existing recordings from Podcastle as WAV or MP3 files, then import them into Descript. Descript will transcribe them automatically. The editing workflow is different (text-based rather than waveform), but your existing audio content transfers cleanly." },
      { q: 'Which Podcastle alternative is best for video podcasts?', a: "Riverside.fm is the best alternative for video podcasts — it records separate high-quality video tracks from each participant locally, produces up to 4K video output, and has a clips editor for creating social media snippets. Descript also handles video podcasts well with its transcript-based video editing, but Riverside's raw recording quality is higher." },
    ],
  },
  // ── Week 5 additions ──────────────────────────────────────────────────────
  {
    slug: 'best-ai-tools-for-social-media-2026',
    title: 'Best AI Tools for Social Media 2026 — Create, Schedule & Grow Faster',
    metaDescription: 'The best AI tools for social media in 2026 — tested across content creation, scheduling, short-form video, and image generation. Cut your content creation time by 70%.',
    datePublished: '2026-05-04',
    dateModified: '2026-05-04',
    faqs: [
      { q: 'What is the best AI tool for social media content creation?', a: "Ocoya is the best all-in-one AI tool for social media content, combining an AI caption writer, visual template library, and scheduling platform for Instagram, LinkedIn, Twitter, TikTok, and Pinterest. For AI-generated images specifically, Leonardo.ai has the best free plan (150 credits/day). For video repurposing, Opus Clip turns long videos into short clips automatically." },
      { q: 'Can AI tools write social media captions?', a: "Yes — and they do it well for most standard content types. Ocoya generates captions with hashtags and emoji for any topic, tone, and platform. Rytr has a dedicated Social Media Post template. For best results, give the AI a specific brief (topic, tone, target audience, key message) rather than a vague prompt — the quality difference is significant." },
      { q: 'Is Ocoya worth it for social media management?', a: "Ocoya is worth it if you manage social media professionally — for yourself or clients. At $15/month, it replaces a separate AI writing tool, a Canva-style template library, and a scheduling platform like Buffer. If you only manage your own personal accounts, Buffer's free plan is probably sufficient." },
      { q: 'What AI tools do social media managers use?', a: "The most commonly used AI tools among social media managers in 2026 are: Ocoya (captions + scheduling), Opus Clip (short-form video from long content), Leonardo.ai (image generation for organic posts), and Canva AI (templates + image editing). Most managers combine 2–3 of these rather than relying on a single tool." },
    ],
  },
  {
    slug: 'how-to-use-rytr-to-write-blog-posts',
    title: 'How to Use Rytr to Write Blog Posts (Step-by-Step, 2026)',
    metaDescription: 'How to use Rytr to write blog posts in 2026 — a step-by-step tutorial covering setup, the best templates, and the exact workflow to cut first-draft time by 60%.',
    datePublished: '2026-05-04',
    dateModified: '2026-05-04',
    faqs: [
      { q: 'Can Rytr write a full blog post?', a: "Yes — Rytr can write a full blog post using the Blog Idea & Outline template followed by the Blog Section Writing template. The realistic workflow is: use Rytr to generate an outline and first draft of each section, then rewrite and personalise each section in your own voice. Expect to spend 20–30 minutes editing a Rytr-generated 1,000-word draft into a publishable post." },
      { q: 'Is Rytr good for SEO blog posts?', a: "Rytr is useful for generating SEO-structured blog posts when you give it your target keyword in the brief. It will naturally include the keyword in headings and body copy. However, Rytr does not do keyword research or competitor analysis — you'll need to bring your own keyword data and manually ensure keyword density and internal links. For SEO-specific AI writing, Frase.io is a more specialised option." },
      { q: "How many blog posts can you write on Rytr's free plan?", a: "Rytr's free plan gives 10,000 characters per month, which translates to roughly 1,500–2,000 words of usable AI output (accounting for regenerations and variations you don't keep). That's enough for one 1,000–1,200 word blog post per month on the free plan. For 4+ posts per month, the $9/month Saver plan with unlimited characters is more practical." },
      { q: 'Does Rytr plagiarise content?', a: "Rytr generates original content on each run — it is not copying and pasting from existing sources. However, AI-generated content can produce generic phrasing that appears in other AI-generated content. Rytr includes a built-in plagiarism checker on the Saver and Unlimited plans. On the free plan, run your output through a free tool like Copyscape or Grammarly's plagiarism check before publishing." },
    ],
  },
  // ── Week 7 additions ──────────────────────────────────────────────────────
  {
    slug: 'ai-tools-for-students-free-2026',
    title: 'Best Free AI Tools for Students 2026 — Essays, Research & Presentations',
    metaDescription: 'The best free AI tools for students in 2026 — tested for essays, research summaries, paraphrasing, and presentations. All tools have a genuinely useful free plan.',
    datePublished: '2026-05-04',
    dateModified: '2026-05-04',
    faqs: [
      { q: 'What is the best free AI tool for students writing essays?', a: "Grammarly is the best free AI tool for essays — it checks grammar, spelling, tone, and clarity as you type, and works directly inside Google Docs and Microsoft Word. For generating essay first drafts and outlines, Rytr's free plan (10,000 characters/month) is the most practical option with no credit card required. Combine both: use Rytr to draft, Grammarly to refine." },
      { q: 'Is QuillBot free for students?', a: "Yes — QuillBot has a permanent free plan that includes a paraphraser (up to 125 words per paraphrase), a summariser (up to 1,200 words per summary), and basic grammar checking. The free plan does not include the Fluency and Creative paraphrase modes, word flipper, or plagiarism checker — those require QuillBot Premium at $9.95/month. For most students, the free plan covers 80% of use cases." },
      { q: 'Can students use AI tools without getting caught for plagiarism?', a: "AI tools used for grammar checking, paraphrasing, and outlining are not plagiarism — they're productivity tools, similar to a spell checker. The risk is submitting AI-generated content as your own original analysis or argument. Use these tools to improve clarity, structure, and language — not to replace your own thinking and research. Always check your institution's AI policy, as guidelines vary by school and course." },
      { q: 'What AI tool is best for making presentation slides quickly?', a: "Gamma is the best free AI tool for creating presentation slides fast. You type a topic or paste your essay outline, and Gamma generates a full slide deck with structure, content, and visual design in under 3 minutes. The free plan gives 400 AI credits on sign-up — enough for 4–5 complete presentations. No design skills required." },
      { q: 'Which free AI writing tool gives the most characters per month?', a: "Rytr's free plan gives 10,000 characters per month — roughly 1,500–2,000 words of usable AI output. This is the highest free character allowance among dedicated AI writing tools. Writesonic's free plan is more restrictive. For unlimited AI writing at no cost, the free tier of ChatGPT (GPT-3.5) has no monthly character cap but lacks the structured student-focused templates that Rytr provides." },
    ],
  },
  {
    slug: 'best-ai-podcast-tools-2026',
    title: 'Best AI Podcast Tools 2026 — Record, Edit & Enhance Your Show',
    metaDescription: 'The best AI podcast tools in 2026 — tested for recording, editing, voice enhancement, and transcription. Covers Podcastle, Murf AI, Descript, and Adobe Podcast with honest free plan notes.',
    datePublished: '2026-05-04',
    dateModified: '2026-05-04',
    faqs: [
      { q: 'What is the best AI tool for podcast recording and editing in 2026?', a: "Podcastle is the best all-in-one AI podcast tool for creators who record and edit in the same platform. It handles remote recording (up to 4K quality), AI noise removal, filler word detection, and automatic transcript-based editing. For creators who only need AI editing on pre-recorded files, Descript's text-based editor is the most intuitive option — you edit audio by editing a transcript like a Google Doc." },
      { q: 'Is Podcastle free?', a: "Yes — Podcastle has a permanent free plan that includes remote recording (up to 10 hours/month), AI magic dust noise removal, automatic transcription (up to 3 hours), and up to 3 published episodes. The free plan is genuinely usable for a new podcast that publishes 2–3 episodes per month. The paid Basic plan at $11.99/month removes episode limits and adds filler word removal." },
      { q: 'Can AI remove background noise from podcast recordings?', a: "Yes — Podcastle's Magic Dust feature and Adobe Podcast's Enhance Speech tool both use AI to remove background noise, hum, echo, and room reverb from recordings. Adobe Podcast Enhance is particularly impressive: upload a noisy recording and it returns a studio-quality clean version in seconds, completely free. It works on recordings made on laptop microphones, phone audio, and even noisy outdoor recordings." },
      { q: 'What is the difference between Podcastle and Descript?', a: "Podcastle is primarily a recording and production platform — it excels at remote recording quality and AI audio cleanup. Descript is primarily an editing platform — you edit your podcast by editing the automatically generated transcript (delete a line of text and the audio is removed). Podcastle is better for the recording stage; Descript is better if you have a lot of recorded audio to cut down and structure." },
      { q: 'Do I need Murf AI for podcasts if I already have a microphone?', a: "Murf AI is not a recording or editing tool — it's a text-to-speech voice generator. You use it for podcast intros, outros, ad reads, and voiceover narration when you don't want to record those sections yourself, or when you need a consistent branded voice for a show with multiple hosts. If you have a microphone and record all your own audio, you don't need Murf for the recording process itself." },
    ],
  },
];
console.log('\n🔧  Pre-rendering routes for Google & Bing crawlability...\n');

const template = readTemplate();

// ── 1. Tool pages ─────────────────────────────────────────────────────────────
console.log('Tool pages:');
for (const tool of TOOLS) {
  const canonical = `${SITE}/tools/${tool.slug}/`;
  // Week 1 Task 4: tagline in title matches App.tsx template — Google indexes the static HTML first
  const title = `${tool.name} Review ${YEAR}: ${tool.tagline} | AI Nexus`;
  const description = `Honest ${tool.name} review by ${AUTHOR} — personally tested. ${tool.tagline}. Pros, cons, real verdict, and a free trial link.`;

  const schemas = [
    reviewSchema(tool, canonical),
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'AI Tools', `${SITE}/tools`],
      [3, `${tool.name} Review`, canonical],
    ]),
  ];

  // Inject FAQPage schema if Q&As exist for this tool — enables FAQ rich results in SERPs
  if (TOOL_FAQS[tool.slug] && TOOL_FAQS[tool.slug].length > 0) {
    schemas.push(faqSchema(TOOL_FAQS[tool.slug]));
  }

  writeRoute(`tools/${tool.slug}`, buildPage(template, { title, description, canonical, schemas }));
}

// ── 2. Compare pages ──────────────────────────────────────────────────────────
console.log('\nCompare pages:');
for (const art of COMPARE_ARTICLES) {
  const canonical = `${SITE}/compare/${art.slug}/`;
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
  const canonical = `${SITE}/about/`;
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
        image: `${SITE}/author-photo.jpg`,
        sameAs: ['https://www.linkedin.com/in/navneetarya/'],
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
  const canonical = `${SITE}/disclosure/`;
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

// ── 5. Methodology page ───────────────────────────────────────────────────────
{
  const canonical = `${SITE}/methodology/`;
  const title = `How I Review AI Tools — Testing Methodology | AI Nexus`;
  const description = `The exact 7-step process ${AUTHOR} uses to test every AI tool on AI Nexus. Real standards, paid plan testing, head-to-head comparisons, and the one rule that doesn't bend.`;
  const schemas = [
    articleSchema({ title, description, canonical }),
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'Review Methodology', canonical],
    ]),
    faqSchema([
      { q: `Does ${AUTHOR} personally test every AI tool?`, a: `Yes. Every tool reviewed on AI Nexus has been signed up for and used on real work tasks for a minimum of 2–4 weeks before a review is published. Both free and paid plans are tested.` },
      { q: 'How long does testing take before a review goes live?', a: `A minimum of 2–4 weeks for individual tool reviews. Comparison articles require simultaneous side-by-side testing of 2–3 tools on the same tasks, which typically takes 4–6 weeks in total.` },
      { q: 'Does the affiliate commission affect ratings or recommendations?', a: `No. Tools are evaluated and rated before checking whether an affiliate programme exists. The review verdict is written independently of any commission. ${AUTHOR} has published critical reviews of tools that have affiliate programmes, and positive reviews of tools that do not.` },
      { q: 'What does "personally tested" mean on AI Nexus?', a: `It means ${AUTHOR} signed up for a real account (free tier first, then paid), used the tool on actual work tasks — not demo prompts — for at least 2 weeks, and documented real strengths and weaknesses from that experience. It does not mean a 10-minute trial or a review based on other sources.` },
      { q: 'Are there any sponsored reviews on AI Nexus?', a: `No. AI Nexus does not accept payment from tool companies to publish positive reviews or adjust ratings. All editorial content reflects ${AUTHOR}'s independent assessment after personal testing.` },
    ]),
  ];
  writeRoute('methodology', buildPage(template, { title, description, canonical, schemas }));
}

// ── Week 3: Blog list page (/blog) ────────────────────────────────────────────
console.log('\nBlog pages:');
{
  const canonical = `${SITE}/blog/`;
  const title = `AI Tools Blog — Guides & Reviews | AI Nexus by ${AUTHOR}`;
  const description = `In-depth AI tool guides and reviews by ${AUTHOR}. Personally tested. No sponsored posts.`;
  const schemas = [
    articleSchema({ title, description, canonical }),
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'Blog', canonical],
    ]),
  ];
  writeRoute('blog', buildPage(template, { title, description, canonical, schemas }));
}

// ── Week 3: Individual blog post pages (/blog/:slug) ──────────────────────────
for (const post of BLOG_POSTS) {
  const canonical = `${SITE}/blog/${post.slug}/`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.metaDescription,
      url: canonical,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: { '@type': 'Person', name: AUTHOR, url: `${SITE}/about` },
      publisher: { '@type': 'Organization', name: 'AI Nexus', url: SITE },
      inLanguage: 'en-US',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    },
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'Blog', `${SITE}/blog/`],
      [3, post.title, canonical],
    ]),
    ...(post.faqs.length > 0 ? [faqSchema(post.faqs)] : []),
  ];
  writeRoute(
    `blog/${post.slug}`,
    buildPage(template, { title: `${post.title} | AI Nexus`, description: post.metaDescription, canonical, schemas, datePublished: post.datePublished })
  );
}

// ── 6. Best Free AI Tools landing page (/best-free-ai-tools) ────────────────
{
  const canonical = `${SITE}/best-free-ai-tools/`;
  const title = `Best Free AI Tools 2026 — Tested & Ranked | AI Nexus`;
  const description = `13 AI tools with permanent free plans — personally tested by ${AUTHOR}. Covers writing, image generation, video, audio, design, coding and productivity. No credit card required for any.`;
  const schemas = [
    articleSchema({ title, description, canonical }),
    breadcrumbs([
      [1, 'AI Nexus', SITE],
      [2, 'Best Free AI Tools', canonical],
    ]),
    faqSchema([
      { q: 'What are the best free AI tools in 2026?', a: 'The best free AI tools in 2026 include Grammarly (writing), Leonardo.ai (image generation), Gamma (presentations), Podcastle (podcasting), Replit (coding), and Rytr (content writing). All have permanent free plans — no credit card required.' },
      { q: 'Which free AI tool is best for students?', a: 'Grammarly (grammar & clarity), QuillBot (paraphrasing & summarising), and Gamma (presentations) are the most useful free AI tools for students. All have generous free plans that cover core academic writing needs.' },
      { q: 'Are free AI tools as good as paid ones?', a: 'Free AI tools cover 70–80% of most users\' needs. The paid plans mainly add higher usage limits, advanced features, and removal of watermarks. For light-to-moderate use, the free tiers of Grammarly, Leonardo.ai, Rytr, and Replit are genuinely functional.' },
      { q: 'Do any free AI tools work without signing up?', a: 'Adobe Podcast Enhance Speech works without creating an account — paste your audio and get noise-removed output instantly. Most other free AI tools require a free account but no credit card.' },
    ]),
  ];
  writeRoute('best-free-ai-tools', buildPage(template, {
    title, description, canonical, schemas,
    bodyHtml: `<p style="font-size:1rem;line-height:1.6;color:#333">${esc(description)}</p>
    <p style="font-size:.95rem;line-height:1.6;color:#555;margin-top:12px">Every tool on this list has been personally tested by ${esc(AUTHOR)} on real tasks — not just sign-up and screenshot. The selection covers writing, image generation, video editing, audio production, design, coding, and productivity.</p>`,
  }));
  console.log('\n  ✓  /best-free-ai-tools/');
}

// ── Sitemap ────────────────────────────────────────────────────────────────────
generateSitemap();

// ── Done ──────────────────────────────────────────────────────────────────────
const total = TOOLS.length + COMPARE_ARTICLES.length + 4 + BLOG_POSTS.length + 1; // +1 blog list, +4 static
console.log(`\n✅  ${total} routes pre-rendered. Every URL now returns HTTP 200.\n`);
console.log('   Google Search Console: re-request indexing for all sitemap URLs.');
console.log('   Bing Webmaster Tools: submit sitemap at /sitemap.xml\n');
