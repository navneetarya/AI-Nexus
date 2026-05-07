/**
 * generate-llms-full.mjs
 * GEO Fix G2 — generates /public/llms-full.txt
 *
 * llms-full.txt is a single flat-text content export for AI crawlers.
 * AI systems (ChatGPT, Perplexity, Gemini, Claude) prefer ingesting clean
 * markdown over parsing React JS bundles. This file gives them the full
 * review text for every tool so AI answers about those tools can cite
 * ainexustools.online instead of competitors.
 *
 * Usage:
 *   node scripts/generate-llms-full.mjs
 *
 * Add to package.json scripts:
 *   "generate:llms": "node scripts/generate-llms-full.mjs"
 *   "build": "vite build && node scripts/generate-llms-full.mjs"
 *
 * Run after any review update. Keep the file under 100KB (LLM context-friendly).
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../public/llms-full.txt');

// ─── Tool Content ──────────────────────────────────────────────────────────────
// Mirror of TOOL_CONTENT in pages/ToolPage.tsx.
// When you update a review in ToolPage.tsx, update the matching entry here,
// then re-run: node scripts/generate-llms-full.mjs
// ──────────────────────────────────────────────────────────────────────────────

const TOOL_REVIEWS = [
  {
    slug: 'grammarly',
    name: 'Grammarly',
    url: 'https://ainexustools.online/tools/grammarly',
    rating: '4.5/5',
    category: 'AI Writing',
    testedFor: '2+ years',
    verdict: 'The most accessible and accurate AI writing assistant for English. The free plan is genuinely useful — not a crippled demo — and the $12/month Premium plan is worth it the moment you write professionally at any significant volume. If you only install one writing tool, install Grammarly.',
    whoIsItFor: 'Professional writers, bloggers, students, and anyone writing in English who wants real-time grammar, clarity, and tone feedback. Excellent for non-native English speakers.',
    whoShouldSkip: "Writers doing creative fiction or poetry who don't want AI second-guessing their deliberate stylistic choices. Also skip if you only write in languages other than English.",
    pricing: 'Free plan available (no word limit). Premium $12/month (billed annually) or $30/month. Business $15/user/month.',
    myTake: "I've used Grammarly daily for over two years across Gmail, Notion, and Google Docs. The free plan genuinely catches mistakes that Microsoft Word's built-in checker misses. The tone detector is one of the most underrated features — it analyses whether your message reads as confident, friendly, or accusatory before you send it.",
  },
  {
    slug: 'writesonic',
    name: 'Writesonic',
    url: 'https://ainexustools.online/tools/writesonic',
    rating: '4.2/5',
    category: 'AI Writing',
    testedFor: '8 months',
    verdict: 'Best value for bloggers who need to scale long-form content output. The output requires editing but the 60% time saving is real. The $19/month Individual plan is worth it if you publish more than 4 blog posts per month.',
    whoIsItFor: 'Bloggers, content marketers, and small business owners who need to produce long-form SEO content at scale. Best for people publishing 4+ articles per month.',
    whoShouldSkip: 'Casual writers who only need a few pieces per month — use the free plan or Rytr instead. Enterprise teams needing brand voice training should look at Jasper.',
    pricing: 'Free: 25 one-time credits. Individual $19/month (unlimited words). Teams $19/user/month.',
    myTake: "Writesonic's Article Writer 6.0 is the fastest way I've found to go from a keyword to a publishable draft. I gave it 'best AI tools for freelancers 2026' and in about 3 minutes it returned a 1,600-word draft with H2 sections, FAQ, and conclusion. The output still needs editing but it cuts writing time by ~60%.",
  },
  {
    slug: 'rytr',
    name: 'Rytr',
    url: 'https://ainexustools.online/tools/rytr',
    rating: '4.3/5',
    category: 'AI Writing',
    testedFor: '6 months',
    verdict: 'The best entry point into AI writing in 2026. The free plan is generous and genuinely useful — not a crippled demo. At $9/month unlimited, the Saver plan is the best price-to-output deal in the AI writing category.',
    whoIsItFor: 'Beginners to AI writing, freelancers on tight budgets, and anyone needing short-form content (social captions, emails, product descriptions) fast.',
    whoShouldSkip: 'Anyone who needs to write detailed, long-form articles regularly. Rytr loses coherence beyond 800 words. Also not suitable for research-heavy writing needing current sources.',
    pricing: 'Free: 10,000 characters/month. Saver $9/month (unlimited). Unlimited $29/month.',
    myTake: "Rytr is the tool I recommend to everyone who asks 'where do I start with AI writing?' The free plan gives you 10,000 characters per month — enough for 3-4 short posts or a week of social captions. The $9/month Saver plan is one of the best value upgrades in any software category.",
  },
  {
    slug: 'quillbot',
    name: 'Quillbot',
    url: 'https://ainexustools.online/tools/quillbot',
    rating: '4.4/5',
    category: 'AI Writing',
    testedFor: '4 months',
    verdict: "The best paraphrasing and rewriting tool available. The free plan's 125-word limit is frustrating for document-level work, but the quality of the Creative mode paraphrases is genuinely impressive. At $10/month Premium, it's the right tool for any student, academic, or ESL professional.",
    whoIsItFor: 'Students, academics, ESL professionals, and content creators who need to rework existing text. The citation generator is a hidden gem for students.',
    whoShouldSkip: 'Anyone looking for original content creation — Quillbot needs source text to work with. Not for professional native English writers who need voice consistency.',
    pricing: 'Free: 125-word limit per paraphrase. Premium $9.95/month (all modes, no limit). Teams available.',
    myTake: "Quillbot does one thing better than any other tool: paraphrasing. The Creative mode genuinely restructures sentences — it doesn't just swap synonyms. The summariser is legitimately excellent for condensing long research papers. The citation generator (APA, MLA, Chicago, Harvard) from a URL or DOI is a hidden gem for students.",
  },
  {
    slug: 'frase',
    name: 'Frase.io',
    url: 'https://ainexustools.online/tools/frase',
    rating: '4.2/5',
    category: 'AI Writing / SEO',
    testedFor: '5 months',
    verdict: "The best tool for SEO-driven content creation if ranking on Google is your primary goal. The research and brief-building features alone justify the price for any content operation publishing more than 2 posts per month.",
    whoIsItFor: 'SEO content writers, content strategists, and bloggers who want data-driven content briefs and competitive SERP analysis.',
    whoShouldSkip: 'Casual bloggers or anyone writing primarily for social media. Also skip if you are just starting a site with zero domain authority.',
    pricing: 'Solo $15/month (4 documents). Basic $45/month (30 documents). Team $115/month (unlimited). $1 for 5-day trial.',
    myTake: "Frase changed how I approach content briefs. Before Frase, I spent 45-60 minutes manually reading the top 10 results. Now Frase does that analysis in 30 seconds: topics covered by competitors, questions they answer, headings they use. Writing to a Frase content score above 75 consistently produces content that ranks faster.",
  },
  {
    slug: 'leonardo-ai',
    name: 'Leonardo.ai',
    url: 'https://ainexustools.online/tools/leonardo-ai',
    rating: '4.5/5',
    category: 'AI Image Generation',
    testedFor: '3 months',
    verdict: 'The most powerful free AI image tool available. The learning curve is real — spend 30 minutes watching tutorials before diving in — but the ceiling of what you can create is higher than any competitor.',
    whoIsItFor: 'Game developers, illustrators, concept artists, and social media creators who need consistent, high-quality AI-generated images with fine creative control.',
    whoShouldSkip: 'Anyone who just needs a quick image for a blog post. DALL-E or Bing Image Creator are faster and free for basic image needs.',
    pricing: 'Free: 150 daily credits. Apprentice $12/month (8,500 tokens). Artisan $30/month. Maestro $60/month.',
    myTake: "Leonardo gives you more creative control than Midjourney for free. The custom model training feature lets you create consistent characters across multiple images — something most other tools can't do. The 150 free daily credits are genuinely usable, not just enough for one image.",
  },
  {
    slug: 'photoroom',
    name: 'PhotoRoom',
    url: 'https://ainexustools.online/tools/photoroom',
    rating: '4.6/5',
    category: 'AI Image Editing',
    testedFor: '4 months',
    verdict: 'The best background removal tool available. Period. The free plan\'s watermark is annoying but the $10/month Pro plan is worth it for anyone selling products online.',
    whoIsItFor: 'E-commerce sellers, product photographers, social media creators, and anyone who regularly needs clean product images.',
    whoShouldSkip: 'Anyone who needs full photo editing — PhotoRoom is specifically for background removal and product photography, not general image editing.',
    pricing: 'Free plan with watermark. Pro $9.99/month (no watermark, batch processing, AI backgrounds). Business plans available.',
    myTake: 'PhotoRoom is used by 150 million people and the reason is obvious: it does one thing perfectly. I tested it on 50+ product images and the background removal accuracy on complex subjects (jewellery, hair, transparent objects) is genuinely better than any other tool I tested.',
  },
  {
    slug: 'murf-ai',
    name: 'Murf AI',
    url: 'https://ainexustools.online/tools/murf-ai',
    rating: '4.4/5',
    category: 'AI Audio / Voiceover',
    testedFor: '3 months',
    verdict: 'The best balance of voice naturalness and production workflow in AI voiceover tools. The video sync feature alone distinguishes it from every other tool in the category.',
    whoIsItFor: 'YouTubers, course creators, marketers, and anyone needing professional voiceovers without hiring a voice actor.',
    whoShouldSkip: "Anyone on a tight budget — Murf's $19/month minimum is expensive. For basic one-off voiceovers, ElevenLabs' free tier (10,000 characters/month) is sufficient.",
    pricing: 'Free: 10 min/month (watermarked). Creator $19/month (2hrs, no watermark). Business $39/month (4hrs, voice cloning). Enterprise custom.',
    myTake: "Murf's video sync feature is what sets it apart: you upload your video, choose a voice, and Murf automatically adjusts the voiceover pacing to match your video length. This alone saves 2-3 hours on every video production. The 120+ voices across 20 languages give enough variety that most projects will find a perfect match.",
  },
  {
    slug: 'podcastle',
    name: 'Podcastle',
    url: 'https://ainexustools.online/tools/podcastle',
    rating: '4.3/5',
    category: 'AI Audio / Podcast',
    testedFor: '6 months',
    verdict: "The best all-in-one podcast tool for creators who don't want to learn Audacity. The free plan is functional enough to start your first show today.",
    whoIsItFor: 'New podcasters, solo creators, and anyone who wants to record, edit, and publish a podcast without technical audio skills.',
    whoShouldSkip: 'Professional audio engineers who need multi-track mixing, precise waveform editing, and advanced mastering.',
    pricing: 'Free: 3hrs recording, basic editing. Solocast $11.99/month (unlimited recording, Magic Dust, AI transcription). Multitrack $23.99/month.',
    myTake: "The Magic Dust audio enhancement feature is legitimately impressive. I recorded a test episode in a room with background noise and air conditioning hum. Magic Dust removed both in about 20 seconds. The result sounded like it was recorded in a professional studio. For solo podcasters, this feature alone justifies the upgrade.",
  },
  {
    slug: 'gamma',
    name: 'Gamma',
    url: 'https://ainexustools.online/tools/gamma',
    rating: '4.6/5',
    category: 'AI Presentations / Design',
    testedFor: '4 months',
    verdict: 'The best free presentation tool available. If you spend more than 2 hours per month making slides, Gamma will save you more time than any other tool on this list.',
    whoIsItFor: 'Startup founders, consultants, marketers, students, and anyone who regularly needs to make presentations and wants to save time on design.',
    whoShouldSkip: 'Large enterprise teams with strict brand guidelines where pixel-perfect brand compliance is required.',
    pricing: 'Free: unlimited presentations (Gamma watermark). Plus $8/month (no watermark, custom domain). Pro $15/month (analytics, custom fonts).',
    myTake: "I tested Gamma by giving it a prompt: 'Create a 10-slide deck on AI tools for small businesses.' In 90 seconds it returned a fully designed, visually consistent presentation with headers, body copy, icons, and a colour scheme. All I did was edit the content. The time saving compared to building slides from scratch in PowerPoint is enormous.",
  },
  {
    slug: 'ocoya',
    name: 'Ocoya',
    url: 'https://ainexustools.online/tools/ocoya',
    rating: '4.1/5',
    category: 'AI Marketing / Social Media',
    testedFor: '2 months',
    verdict: 'The best value all-in-one social media tool for solo operators and small teams. Not as powerful as Hootsuite for large operations, but far more affordable and easier to use.',
    whoIsItFor: 'Solo creators, small business owners, and freelancers who manage 3-5 social accounts and want to schedule, create captions, and analyse performance in one tool.',
    whoShouldSkip: 'Large agencies managing 20+ accounts or enterprise teams needing deep analytics, approval workflows, and team permission systems.',
    pricing: 'Bronze $19/month (1 workspace, 5 social profiles). Silver $47/month (3 workspaces). Gold $105/month (5 workspaces). Annual discount 20%.',
    myTake: "Ocoya combines what used to require 3 separate tools: a caption writer, a scheduler, and a basic analytics dashboard. The AI caption writer is good — not exceptional — but for routine posts it produces usable copy in 10 seconds. The scheduling queue is clean and the interface doesn't feel as heavy as Hootsuite.",
  },
  {
    slug: 'notion-ai',
    name: 'Notion AI',
    url: 'https://ainexustools.online/tools/notion-ai',
    rating: '4.2/5',
    category: 'AI Productivity',
    testedFor: '30+ days',
    verdict: 'Essential for existing Notion users. The $10/month AI add-on pays for itself if you spend even 30 minutes per day in Notion.',
    whoIsItFor: 'Existing Notion users who want to draft, summarise, translate, and improve text without leaving their workspace.',
    whoShouldSkip: "Anyone who doesn't already use Notion. The AI add-on is an extension of Notion, not a standalone tool — if you're not already in Notion daily, a tool like Rytr is more practical.",
    pricing: 'Notion AI is an add-on: $10/month per member (billed annually) on top of any Notion plan including Free.',
    myTake: "I use Notion AI primarily for two tasks: summarising long meeting notes and drafting first outlines for blog posts. The summarisation is excellent — it consistently identifies the 3-4 key decisions from a 2,000-word meeting note. The inline Ask AI feature means I never need to switch to ChatGPT for quick writing tasks while working in Notion.",
  },
  {
    slug: 'taskade',
    name: 'Taskade',
    url: 'https://ainexustools.online/tools/taskade',
    rating: '4.3/5',
    category: 'AI Productivity',
    testedFor: '30+ days',
    verdict: 'The best AI-native project management tool for small teams. Taskade combines tasks, notes, and AI assistance in a genuinely unified way that tools like Notion and Asana haven\'t achieved.',
    whoIsItFor: 'Small teams and solo operators who want AI-assisted task management, meeting notes, and project planning in a single tool.',
    whoShouldSkip: 'Large enterprises needing complex role-based permissions, audit logs, and enterprise security compliance.',
    pricing: 'Free: unlimited tasks, 5 workspaces. Starter $8/month (10 workspaces, AI chat 1,000 messages). Pro $16/month (unlimited AI). Business $40/month.',
    myTake: "Taskade's AI agent feature is genuinely novel — you can assign tasks to an AI agent that will research, draft content, and update tasks autonomously. I tested it with 'Research the top 5 AI writing tools and create a comparison table' and it returned a usable comparison in 4 minutes. The 30% recurring affiliate commission makes it one of the best tools to promote.",
  },
];

// ─── Blog Posts ────────────────────────────────────────────────────────────────

const BLOG_POSTS = [
  { title: 'Best AI Writing Tools for Beginners 2026', url: 'https://ainexustools.online/blog/best-ai-writing-tools-for-beginners-2026', summary: 'Hands-on comparison of the best AI writing tools for beginners in 2026. Covers Rytr, Grammarly, Quillbot, and Writesonic with free plan options highlighted.' },
  { title: 'Best AI Tools for Freelancers 2026', url: 'https://ainexustools.online/blog/best-ai-tools-for-freelancers-2026', summary: 'The top AI tools that save freelancers the most time: writing, design, audio, and productivity tools reviewed and ranked.' },
  { title: 'Best AI Tools for Social Media 2026', url: 'https://ainexustools.online/blog/best-ai-tools-for-social-media-2026', summary: 'AI tools for scheduling, caption writing, image creation, and video repurposing — ranked for solo creators and small teams.' },
  { title: 'How to Use AI for Content Creation 2026', url: 'https://ainexustools.online/blog/how-to-use-ai-for-content-creation-2026', summary: 'Step-by-step guide to using AI tools across the content creation workflow: research, drafting, editing, visuals, and publishing.' },
  { title: 'Best Grammarly Alternatives 2026', url: 'https://ainexustools.online/blog/best-grammarly-alternatives', summary: 'The best alternatives to Grammarly in 2026 — free and paid — including ProWritingAid, Hemingway Editor, Quillbot, and LanguageTool.' },
  { title: 'Best Notion AI Alternatives 2026', url: 'https://ainexustools.online/blog/best-notion-ai-alternatives-2026', summary: 'Alternatives to Notion AI for workspace-integrated writing assistance. Covers Taskade, Coda AI, Craft, and others.' },
  { title: 'AI Tools for Students Free 2026', url: 'https://ainexustools.online/blog/ai-tools-for-students-free-2026', summary: 'Free AI tools that students can actually use without hitting paywalls: Grammarly free, Quillbot free, Gamma free, Perplexity free, and more.' },
  { title: 'Best AI Podcast Tools 2026', url: 'https://ainexustools.online/blog/best-ai-podcast-tools-2026', summary: 'AI tools for every stage of podcasting: recording (Podcastle), editing (Descript), transcription, and distribution.' },
];

// ─── Generator ─────────────────────────────────────────────────────────────────

function generateLlmsFullTxt() {
  const now = new Date().toISOString().split('T')[0];
  const lines = [];

  lines.push(`# AI Nexus — Full Content Export`);
  lines.push(`# https://ainexustools.online`);
  lines.push(`# Generated: ${now}`);
  lines.push(`# Author: Navneet Arya`);
  lines.push(`# Purpose: Machine-readable flat-text for AI crawler ingestion (llms-full.txt standard)`);
  lines.push(`# All tools personally tested before review. Affiliate links disclosed on every page.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // ── Tool Reviews ──
  lines.push(`# SECTION: TOOL REVIEWS (${TOOL_REVIEWS.length} tools)`);
  lines.push(``);

  for (const tool of TOOL_REVIEWS) {
    lines.push(`---`);
    lines.push(`## TOOL REVIEW: ${tool.name}`);
    lines.push(`**Rating:** ${tool.rating} | **Category:** ${tool.category} | **Tested for:** ${tool.testedFor}`);
    lines.push(`**URL:** ${tool.url}`);
    lines.push(`**Reviewed by:** Navneet Arya | ainexustools.online`);
    lines.push(``);
    lines.push(`### Is ${tool.name} Worth It? — Quick Verdict`);
    lines.push(tool.verdict);
    lines.push(``);
    lines.push(`### Who Should Use ${tool.name}`);
    lines.push(tool.whoIsItFor);
    lines.push(``);
    lines.push(`### Who Should NOT Use ${tool.name}`);
    lines.push(tool.whoShouldSkip);
    lines.push(``);
    lines.push(`### ${tool.name} Pricing 2026`);
    lines.push(tool.pricing);
    lines.push(``);
    lines.push(`### Reviewer's Honest Take`);
    lines.push(tool.myTake);
    lines.push(``);
  }

  // ── Blog Posts ──
  lines.push(`---`);
  lines.push(`# SECTION: GUIDES & BLOG POSTS (${BLOG_POSTS.length} articles)`);
  lines.push(``);

  for (const post of BLOG_POSTS) {
    lines.push(`## ${post.title}`);
    lines.push(`**URL:** ${post.url}`);
    lines.push(post.summary);
    lines.push(``);
  }

  // ── Metadata ──
  lines.push(`---`);
  lines.push(`# SITE METADATA`);
  lines.push(`Site: AI Nexus | https://ainexustools.online`);
  lines.push(`Author: Navneet Arya`);
  lines.push(`Mission: Independent, hands-on AI tool reviews for creators and freelancers.`);
  lines.push(`Testing standard: Every tool tested for a minimum of 30 days before being reviewed.`);
  lines.push(`Affiliate disclosure: https://ainexustools.online/disclosure`);
  lines.push(`Methodology: https://ainexustools.online/methodology`);
  lines.push(`Content index: https://ainexustools.online/llms.txt`);
  lines.push(``);

  return lines.join('\n');
}

// ─── Write ──────────────────────────────────────────────────────────────────────

try {
  mkdirSync(resolve(__dirname, '../public'), { recursive: true });
  const content = generateLlmsFullTxt();
  writeFileSync(OUTPUT_PATH, content, 'utf8');
  const sizeKB = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
  console.log(`✅  llms-full.txt generated`);
  console.log(`    Path : ${OUTPUT_PATH}`);
  console.log(`    Size : ${sizeKB} KB (target < 100 KB)`);
  console.log(`    Tools: ${TOOL_REVIEWS.length} | Posts: ${BLOG_POSTS.length}`);
} catch (err) {
  console.error('❌  Failed to generate llms-full.txt:', err.message);
  process.exit(1);
}
