import { Category, Tool } from './types';

export const SITE_CONFIG = {
  name: "AI Nexus",
  tagline: "The Best AI Tools — Reviewed & Ranked",
  bio: "I'm Navneet Arya — I test every AI tool personally and share honest, no-BS reviews. Affiliate links help keep the reviews completely free.",
  authorName: "Navneet Arya",
  authorBio: "I've been testing AI tools since 2022 across writing, audio, video, design, and productivity. I focus on what actually works for solo creators, freelancers, and small teams worldwide — not enterprise buyers with unlimited budgets.",
  authorExperience: "2+ years testing AI tools",
  siteUrl: "https://ainexustools.online",
  email: "hello@ainexustools.online",
  twitterUrl: "https://twitter.com/ainexustools",
  newsletterNote: "Get notified when new AI tool reviews drop. No spam.",

  // ── Beehiiv newsletter embed ───────────────────────────────────────────
  // HOW TO GET THIS URL (one-time setup):
  //   1. Sign up at https://www.beehiiv.com  (free up to 2,500 subscribers)
  //   2. Create a new Publication  →  name it "AI Nexus Weekly"
  //   3. Dashboard → Grow → Forms → "+ Create Form"
  //   4. Choose "Embed" type → style it → click "Get Embed Code"
  //   5. Copy the URL inside src="..." — it looks like:
  //        https://embeds.beehiiv.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  //   6. Paste it below, replacing YOUR_EMBED_ID
  //   7. Commit & push — both the hero strip and compare pages will go live.
  beehiivEmbedUrl: "https://ainexus-weekly.beehiiv.com/",
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
    notForYou: 'Large agencies managing 20+ client accounts that need white-label PDF reporting, granular multi-user approval workflows, and enterprise-grade analytics dashboards. Ocoya\'s analytics are functional but not deep — if your agency delivers detailed monthly performance reports to clients, Sprout Social or Hootsuite\'s infrastructure is more appropriate for that scale.',
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
  },

  // AUDIO (additional)
  {
    id: 'a3', slug: 'elevenlabs',
    name: 'ElevenLabs', tagline: 'The most realistic AI voice generator on the planet',
    description: 'ElevenLabs creates the most natural-sounding AI voices available. Clone your own voice, generate studio-quality narration, and build voice-powered products with the industry-leading speech API.',
    category: Category.AUDIO, affiliateLink: 'https://elevenlabs.io?via=ainexus',
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
  },

  // PRODUCTIVITY (additional)
  {
    id: 'p3', slug: 'perplexity',
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
  },

  // DESIGN (additional)
  {
    id: 'd3', slug: 'canva-ai',
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
    notForYou: 'Large enterprises that need complex role-based permission systems, SOC2 compliance, audit logs, enterprise SSO, and legal-grade data governance. Taskade is built for small, agile teams of 2–20 people. For enterprise project management at scale with compliance requirements, look at Asana Business or Monday Enterprise.',
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
    { q: "How accurate is PhotoRoom's background removal?", a: "PhotoRoom's background removal is among the best available — it handles complex edges like hair, fur, and transparent objects better than most competitors. In my testing on 50+ product photos it required manual touch-up on fewer than 10% of images, mostly on translucent items like glass." },
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
    { q: "How accurate is Descript's filler word removal?", a: "Descript's filler word removal is excellent — it detects 'um', 'uh', 'like', 'you know', and custom words you specify. In my testing it correctly identified around 95% of filler words with very few false positives. You can review flagged instances before deleting. For an hour-long podcast, it typically saves 15–25 minutes of manual editing." },
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

// ── Week 8: Comparisons for 5 new tools ───────────────────────────────────
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
