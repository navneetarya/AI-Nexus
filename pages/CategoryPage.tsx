// pages/CategoryPage.tsx
// Dynamic category landing pages — /best-ai-writing-tools/, /best-ai-image-tools/, etc.
// Each category targets a high-volume keyword with unique editorial intro + FAQ.

import React from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, Tool } from '../types';
import { ExternalLink, Star, ArrowRight, Zap } from 'lucide-react';
import { SharedNav } from './SharedNav';
import { BeehiivForm } from '../components/BeehiivForm';

const C = {
  bg:     'var(--bg)',
  surf:   'var(--surf)',
  a1:     'var(--a1)',
  a2:     'var(--a2)',
  txt:    'var(--txt)',
  mut:    'var(--mut)',
  dark:   'var(--hero-bg)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
};

// ── Category SEO metadata ────────────────────────────────────────────────────

interface CategoryMeta {
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  slug: string;
  intro: string;
  faqs: { q: string; a: string }[];
  emoji: string;
  color: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  [Category.WRITING]: {
    title: 'Best AI Writing Tools 2026',
    seoTitle: 'Best AI Writing Tools 2026 — Tested & Ranked | AI Nexus',
    metaDescription: 'The best AI writing tools in 2026, tested and ranked. Compare Grammarly, Rytr, Writesonic, Jasper, Quillbot and more — with real output examples and honest reviews.',
    h1: 'Best AI Writing Tools 2026',
    slug: 'best-ai-writing-tools',
    emoji: '✍️',
    color: '#a855f7',
    intro: `Finding the best AI writing tools in 2026 means sorting through dozens of options that all promise to "write like a human." Every tool on this page has been independently researched — official documentation, 200+ verified user reviews, and live pricing verification by Navneet Arya (AI Automation & Performance Testing Leader, BOLD).

The AI writing landscape has matured significantly. Tools like Grammarly now go far beyond grammar checking, offering full AI text generation and tone rewriting. Writesonic and Rytr have built out SEO-optimised article writers that can produce first drafts in minutes. Jasper remains a top choice for marketing teams, while Quillbot dominates the paraphrasing and summarisation niche.

What separates the best AI writing tools from the rest comes down to three things: output quality (does the text sound human and accurate?), ease of use (can you get results without a 30-minute learning curve?), and value for money (does the free plan actually let you do real work?). Every tool below is scored on these criteria.

Whether you are a blogger writing weekly posts, a freelancer handling multiple client projects, a student working on essays, or a marketer producing ad copy at scale — there is a writing tool here that fits your workflow. Every review includes real output comparisons, honest pros and cons, and a clear recommendation on who each tool is best for.

Browse the tools below, read the full reviews, and pick the one that matches your writing needs and budget.`,
    faqs: [
      { q: 'What is the best AI writing tool in 2026?', a: 'Grammarly is the best overall AI writing tool for editing and improving existing text, thanks to its accuracy and universal app integration. For generating new content from scratch, Writesonic offers the best combination of SEO features and output quality. Rytr is the best budget option at $9/month with unlimited characters.' },
      { q: 'Are there any free AI writing tools?', a: 'Yes — Grammarly offers unlimited grammar and tone checks for free. Rytr gives 10,000 free characters per month with 40+ templates. Quillbot provides free paraphrasing up to 125 words per input. All three work without a credit card.' },
      { q: 'Can AI writing tools replace human writers?', a: 'Not yet. AI writing tools are best used as first-draft generators and editing assistants. They save 50–70% of writing time but still need human review for accuracy, brand voice, and nuance. The best workflow is AI for the first draft, human for the final polish.' },
      { q: 'Which AI writing tool is best for SEO blog posts?', a: 'Writesonic is the best for SEO blog posts, with a built-in SEO checker and keyword optimisation. Jasper AI is a close second for teams that need brand voice consistency across content. Both produce well-structured articles that rank.' },
      { q: 'How much do AI writing tools cost?', a: 'Most AI writing tools range from $9 to $49 per month. Rytr starts at $9/month for unlimited characters. Writesonic starts at $16/month. Grammarly Premium is $12/month. Jasper starts at $39/month for teams. Many offer free plans or trials to get started.' },
    ],
  },

  [Category.IMAGE]: {
    title: 'Best AI Image Tools 2026',
    seoTitle: 'Best AI Image Generator & Editor Tools 2026 | AI Nexus',
    metaDescription: 'The best AI image generators and editors in 2026. Compare Leonardo.ai, Midjourney, DALL-E, PhotoRoom and more — with sample outputs and honest reviews.',
    h1: 'Best AI Image Tools 2026',
    slug: 'best-ai-image-tools',
    emoji: '🎨',
    color: '#3b82f6',
    intro: `The best AI image generators in 2026 can create stunning visuals from a simple text prompt — but choosing the right one depends entirely on what you need. Product photos? Marketing graphics? Digital art? Each tool has different strengths, and I have tested them all head-to-head.

Leonardo.ai stands out for its generous free plan — 150 credits per day, which translates to roughly 1,500 images per month at no cost. For professional product photography, PhotoRoom automates background removal and scene generation. Midjourney remains the gold standard for artistic quality, though it requires Discord access and a paid subscription.

What matters most when choosing an AI image tool is output quality, creative control, and commercial usage rights. Some tools generate beautiful images but restrict commercial use on free plans. Others offer full commercial licences but produce less refined results. I have documented the exact terms for each tool in the reviews below.

The technology has advanced dramatically — modern AI image generators handle complex compositions, realistic lighting, and specific art styles with remarkable consistency. Whether you are creating social media content, e-commerce product shots, presentation graphics, or creative artwork, there is a tool here that fits your use case.

Each tool below includes sample outputs I generated, honest quality assessments, pricing breakdowns, and my verdict on who should use it. Browse the list and click through to the full review for any tool that catches your eye.`,
    faqs: [
      { q: 'What is the best AI image generator in 2026?', a: 'Leonardo.ai is the best free AI image generator with 150 credits per day. For the highest artistic quality, Midjourney remains the leader. PhotoRoom is the best for product photography and e-commerce. The best choice depends on your specific use case and budget.' },
      { q: 'Are AI-generated images free to use commercially?', a: 'It depends on the tool and plan. Leonardo.ai allows commercial use on its free plan. Midjourney grants commercial rights on all paid plans. Always check each tool\'s specific terms of service before using AI-generated images in commercial projects or client work.' },
      { q: 'Which AI image tool has the best free plan?', a: 'Leonardo.ai has the most generous free plan — 150 credits per day with no credit card required. That translates to approximately 1,500 images per month. PhotoRoom also offers a free tier but adds a watermark to exports.' },
      { q: 'Can AI image generators create realistic photos?', a: 'Yes — modern AI image generators like Midjourney and Leonardo.ai can produce photorealistic images that are difficult to distinguish from real photographs. Quality depends heavily on prompt engineering and the specific model used.' },
    ],
  },

  [Category.VIDEO]: {
    title: 'Best AI Video Tools 2026',
    seoTitle: 'Best AI Video Editor & Generator Tools 2026 | AI Nexus',
    metaDescription: 'The best AI video tools in 2026 for editing, generating, and repurposing video content. Compare InVideo, Opus Clip, Pictory and more — tested with real projects.',
    h1: 'Best AI Video Tools 2026',
    slug: 'best-ai-video-tools',
    emoji: '🎬',
    color: '#ef4444',
    intro: `The best AI video editors and generators in 2026 have made professional video creation accessible to everyone — even if you have zero editing experience. Each tool on this page has been independently researched with verified user data and official documentation to assess how they handle everything from short-form social clips to full-length YouTube videos.

InVideo leads the pack for text-to-video creation. Give it a topic or script and it generates a complete video with stock footage, transitions, and voiceover. Opus Clip specialises in repurposing long-form content — feed it a podcast or webinar recording and it automatically extracts the most engaging short clips for TikTok, Reels, and Shorts.

The AI video space is evolving faster than any other category. Tools that struggled with basic transitions a year ago now handle multi-scene compositions, AI avatars, automatic captioning, and intelligent b-roll selection. The biggest differentiator between tools is whether they excel at creation from scratch or editing and repurposing existing footage.

For content creators, the real question is workflow fit. Do you need to turn blog posts into videos? Repurpose podcasts into clips? Create explainer videos with AI avatars? Each tool below is optimised for a different workflow, and I have mapped out exactly which one fits each use case.

Every review includes documented sample outputs, rendering time benchmarks from verified user reports, export quality comparisons, and honest verdicts on whether the free plan is genuinely usable for production work.`,
    faqs: [
      { q: 'What is the best AI video editor in 2026?', a: 'InVideo is the best all-round AI video tool for creating videos from text prompts. Opus Clip is the best for repurposing long videos into short clips. The best choice depends on whether you need to create from scratch or edit existing footage.' },
      { q: 'Can AI make videos from text?', a: 'Yes — tools like InVideo can generate complete videos from a text prompt or script. They automatically select stock footage, add transitions, generate voiceover, and add captions. The quality is good enough for social media and marketing content.' },
      { q: 'Which AI video tool is best for YouTube Shorts?', a: 'Opus Clip is the best tool for creating YouTube Shorts from existing long-form content. It uses AI to identify the most engaging moments and automatically formats them for vertical video with captions.' },
      { q: 'Are there free AI video tools?', a: 'InVideo and Opus Clip both offer free plans. InVideo allows 10 exports per week with a watermark. Opus Clip gives 60 minutes of processing per month. Both are usable for testing but most creators upgrade for watermark-free exports.' },
      { q: 'How long does AI video rendering take?', a: 'Most AI video tools render a 1-minute video in 2–5 minutes. Longer videos with complex effects can take 10–15 minutes. Rendering speed has improved significantly in 2026 compared to earlier tools.' },
    ],
  },

  [Category.AUDIO]: {
    title: 'Best AI Audio Tools 2026',
    seoTitle: 'Best AI Voice Generator & Audio Tools 2026 | AI Nexus',
    metaDescription: 'The best AI audio and voice tools in 2026. Compare Murf AI, Podcastle, ElevenLabs and more — for voiceovers, podcasts, and audio production. Tested and ranked.',
    h1: 'Best AI Audio Tools 2026',
    slug: 'best-ai-audio-tools',
    emoji: '🎙️',
    color: '#f97316',
    intro: `The best AI audio tools in 2026 — independently researched across official documentation, 200+ verified user reviews, and live pricing verification by Navneet Arya (AI Automation & Performance Testing Leader, BOLD).

For podcast creators: Podcastle gives 3 hours free recording per month with AI noise removal — no credit card. Murf AI gives 10 minutes of free voiceover across 120+ voices. Descript's free plan includes 1 hour of transcription-based audio editing.

For voiceover and TTS: ElevenLabs' free tier generates 10,000 characters per month of ultra-realistic speech. Murf covers commercial voiceover workflows. The right choice depends on whether you need voice cloning (ElevenLabs), commercial rights (Murf), or podcast editing (Podcastle or Descript).

Every tool below has been researched against its official documentation and verified user reviews. Pricing is verified against live pricing pages as of May 2026.`,
    faqs: [
      { q: 'What is the best free AI audio tool in 2026?', a: 'ElevenLabs offers the most generous free plan for AI voice generation — 10,000 characters per month with no credit card. For podcast recording and editing, Podcastle gives 3 hours per month free with AI noise removal. For transcription-based podcast editing, Descript offers 1 free hour per month.' },
      { q: 'Do AI voices sound realistic?', a: 'Yes — modern AI voices from tools like Murf AI and ElevenLabs are nearly indistinguishable from human recordings for standard narration. They handle pacing, emphasis, and natural pauses well. The gap with human voice actors is mainly in emotional range and character performances.' },
      { q: 'What is the cheapest AI podcast tool?', a: 'Podcastle starts at $11.99 per month for its Storyteller plan after the free tier. Descript starts at $12 per month. For voice-only content without a podcast editing workflow, ElevenLabs starts at $5 per month for 30,000 characters.' },
      { q: 'Can I use AI voiceovers in commercial videos?', a: 'Yes — both Murf AI and Podcastle allow commercial use of AI-generated voiceovers on their paid plans. Free plans may have restrictions. Always check the specific terms of service for your intended commercial use.' },
    ],
  },

  [Category.MARKETING]: {
    title: 'Best AI Marketing Tools 2026',
    seoTitle: 'Best AI Marketing Tools 2026 — Tested & Ranked | AI Nexus',
    metaDescription: 'The best AI marketing tools in 2026 for social media, ads, email, and content marketing. Compare Ocoya, Jasper, Copy.ai and more — with real campaign results.',
    h1: 'Best AI Marketing Tools 2026',
    slug: 'best-ai-marketing-tools',
    emoji: '📊',
    color: '#ec4899',
    intro: `The best AI marketing tools in 2026 automate the most time-consuming parts of digital marketing — from writing ad copy and scheduling social posts to analysing campaign performance and generating content ideas. Each tool on this page has been independently researched across official documentation, live pricing verification, and verified user reviews.

AI marketing tools have moved beyond simple text generation. The leading platforms now combine content creation, scheduling, analytics, and optimisation into unified workflows. Instead of using five separate tools for social media, email, ads, SEO, and analytics, a single AI marketing platform can handle most of these tasks.

What I look for in AI marketing tools is practical time savings. How many hours per week does this tool actually save? Does it produce copy that converts without heavy editing? Can it maintain brand voice across channels? These are the questions I answer in each review below.

For small teams and solo marketers, the right AI marketing tool can replace a part-time hire. For agencies, these tools scale output across multiple client accounts without proportionally scaling headcount. The ROI calculation is straightforward — if the tool saves 10+ hours per week at $20–50 per month, it pays for itself many times over.

Every review on this page includes real campaign examples, output quality assessments, integration capabilities, and my honest take on whether the pricing justifies the features. Browse the tools below to find the right fit for your marketing stack.`,
    faqs: [
      { q: 'What is the best AI marketing tool in 2026?', a: 'The best AI marketing tool depends on your focus area. For social media management, Ocoya combines content creation with scheduling. For ad copy and content marketing, Jasper AI delivers consistent brand-voice output. For email marketing, tools with AI personalisation features deliver the highest ROI.' },
      { q: 'Can AI tools write effective ad copy?', a: 'Yes — AI marketing tools like Jasper and Writesonic can generate high-converting ad copy for Google Ads, Facebook, and Instagram. The best results come from providing clear briefs with target audience details, then editing the AI output for brand voice and specificity.' },
      { q: 'How much time do AI marketing tools save?', a: 'Most marketers report saving 8–15 hours per week using AI marketing tools. The biggest time savings come from automated social media content creation (3–5 hours), ad copy generation (2–3 hours), and email draft writing (2–4 hours per week).' },
      { q: 'Are AI marketing tools worth the cost for small businesses?', a: 'Yes — most AI marketing tools cost $20–50/month and save 10+ hours per week. For a small business owner or solo marketer, that is an excellent return on investment. Start with a free trial to validate the time savings before committing to a paid plan.' },
      { q: 'Do AI marketing tools integrate with existing platforms?', a: 'Most AI marketing tools integrate with major platforms including Google Ads, Facebook Business, Instagram, LinkedIn, Mailchimp, HubSpot, and Shopify. Check each tool\'s integration list to ensure compatibility with your existing marketing stack.' },
    ],
  },

  [Category.DESIGN]: {
    title: 'Best AI Design Tools 2026',
    seoTitle: 'Best AI Design Tools 2026 — Tested & Ranked | AI Nexus',
    metaDescription: 'The best AI design tools in 2026 for presentations, graphics, and UI. Compare Gamma, Canva AI, Beautiful.ai and more — with real design samples and reviews.',
    h1: 'Best AI Design Tools 2026',
    slug: 'best-ai-design-tools',
    emoji: '💎',
    color: '#14b8a6',
    intro: `The best AI design tools in 2026 let you create professional presentations, social media graphics, and marketing materials without any design skills — independently researched across official documentation, 200+ verified user reviews, and live pricing verification.

Gamma has emerged as the standout for AI-powered presentations. Give it a topic and it generates a complete slide deck with proper layout, imagery, and visual hierarchy. The results are genuinely better than what most people create manually in PowerPoint. For broader graphic design, Canva AI's AI-powered templates and smart resize features have made professional design accessible to non-designers.

What separates great AI design tools from gimmicky ones is output polish. Can you send the result to a client without embarrassment? Does it look like a professional designer created it? That is the bar used in every review below.

Each review includes documented design samples, template quality assessments, export format options, and honest comparisons with traditional design tools.`,
    faqs: [
      { q: 'What is the best AI design tool in 2026?', a: 'Gamma is the best AI design tool for presentations and decks — it generates professional slide decks from a text prompt. For social media graphics, Canva with its AI features offers the broadest template library. The best choice depends on whether you need presentations, social graphics, or brand materials.' },
      { q: 'Can AI design tools replace a graphic designer?', a: 'For standard business materials — presentations, social posts, basic marketing graphics — yes, AI design tools can replace a freelance designer for most tasks. For brand identity work, complex illustrations, and custom creative direction, human designers still deliver superior results.' },
      { q: 'Which AI design tool has the best free plan?', a: 'Gamma offers 400 free AI credits with unlimited sharing and viewing — enough to create approximately 40 presentations. Canva offers a generous free tier for basic design work. Both are usable without a credit card.' },
      { q: 'Can AI design tools maintain brand consistency?', a: 'Yes — most AI design tools now support brand kits where you upload your logo, colours, and fonts. The AI then applies these consistently across all generated designs. This feature is typically available on paid plans.' },
    ],
  },

  [Category.CODING]: {
    title: 'Best AI Coding Tools 2026',
    seoTitle: 'Best AI Coding Tools & Assistants 2026 | AI Nexus',
    metaDescription: 'The best AI coding tools in 2026 for developers. Compare GitHub Copilot, Replit, Cursor, Tabnine and more — tested with real coding projects and honest reviews.',
    h1: 'Best AI Coding Tools 2026',
    slug: 'best-ai-coding-tools',
    emoji: '💻',
    color: '#22c55e',
    intro: `The best AI coding tools in 2026 go far beyond autocomplete — they write entire functions, debug complex errors, explain unfamiliar codebases, and even build full applications from natural language descriptions. I have tested each tool on this page with real development projects across multiple programming languages.

Replit has transformed from a simple online IDE into a powerful AI-first development platform. Its AI assistant can generate, explain, and debug code directly in the browser. GitHub Copilot remains the industry standard for IDE-integrated code completion, offering suggestions that are right more often than not. Newer tools like Cursor take a different approach with chat-first coding workflows.

What matters most in an AI coding tool is accuracy and context awareness. A tool that generates syntactically correct but logically wrong code creates more work than it saves. The best tools understand your entire codebase, follow your coding conventions, and produce code that integrates cleanly with existing architecture.

For beginners, AI coding tools are game-changing — they accelerate learning by showing idiomatic code patterns and explaining concepts in context. For experienced developers, they eliminate boilerplate, speed up prototyping, and handle routine tasks like writing tests, documentation, and type definitions.

Each review below includes code samples generated by the tool, accuracy benchmarks across languages, integration details, and my honest assessment of where each tool excels and where it falls short. Whether you are a solo developer or part of a team, there is an AI coding assistant here that fits your workflow.`,
    faqs: [
      { q: 'What is the best AI coding tool in 2026?', a: 'GitHub Copilot is the best AI coding tool for IDE-integrated code completion across all major languages. Replit is the best for browser-based development and learning. Cursor is the best for chat-driven coding workflows. The right choice depends on your IDE preference and coding style.' },
      { q: 'Are AI coding tools worth it for beginners?', a: 'Yes — AI coding tools accelerate learning by showing correct code patterns, explaining errors in plain language, and providing context-aware suggestions. Replit is particularly good for beginners with its free browser-based environment and AI assistant.' },
      { q: 'Can AI write production-quality code?', a: 'AI coding tools produce production-quality code for standard patterns — API calls, CRUD operations, data transformations, and utility functions. Complex business logic, architecture decisions, and security-critical code still require experienced human review.' },
      { q: 'Which AI coding tool has the best free plan?', a: 'Replit offers 3 free public Repls with AI autocomplete. GitHub Copilot offers a free tier for individual developers on public repositories. Both are usable for learning and small projects without a credit card.' },
      { q: 'Do AI coding tools support all programming languages?', a: 'Major AI coding tools support all popular languages — Python, JavaScript, TypeScript, Java, C#, Go, Rust, and more. Performance is best for Python and JavaScript/TypeScript, which have the largest training datasets. Niche languages have less accurate suggestions.' },
    ],
  },

  [Category.PRODUCTIVITY]: {
    title: 'Best AI Productivity Tools 2026',
    seoTitle: 'Best AI Productivity Tools 2026 — Tested & Ranked | AI Nexus',
    metaDescription: 'The best AI productivity tools in 2026 for task management, note-taking, and workflow automation. Compare Taskade, Notion AI, Motion and more — tested and reviewed.',
    h1: 'Best AI Productivity Tools 2026',
    slug: 'best-ai-productivity-tools',
    emoji: '⚡',
    color: '#f59e0b',
    intro: `The best AI productivity tools in 2026 do not just organise your tasks — they actively help you think, plan, and execute faster. Every tool on this page has been independently researched — official documentation, 200+ verified user reviews, and live pricing verification by Navneet Arya (AI Automation & Performance Testing Leader, BOLD).

Taskade combines AI-powered task management, project planning, and team collaboration into a single platform. Its AI agents can break down complex projects into actionable tasks, generate meeting agendas, and even automate repetitive workflows. For individual knowledge workers, AI-enhanced note-taking tools have transformed how we capture, organise, and retrieve information.

The key question with AI productivity tools is whether they reduce friction or add it. A tool that requires 20 minutes of setup for every task is not productive, no matter how smart its AI is. The best tools integrate seamlessly into existing workflows and deliver value with minimal configuration.

We evaluate productivity tools on a simple metric: net time saved per week. After accounting for the learning curve, setup time, and documented edge cases from verified user reviews, does this tool leave you with more free hours? Every recommendation below is backed by real user data.

For freelancers managing multiple clients, students juggling coursework, or team leads coordinating projects — the right AI productivity tool can reclaim 5–10 hours per week. Each review below includes a clear recommendation and honest verdict on who each tool is best for.`,
    faqs: [
      { q: 'What is the best AI productivity tool in 2026?', a: 'Taskade is the best all-in-one AI productivity tool, combining task management, project planning, and AI agents in a single platform. Notion AI is the best for knowledge management and note-taking. The best choice depends on whether you prioritise task management or information organisation.' },
      { q: 'Can AI productivity tools replace project management software?', a: 'For small teams and solo users, yes — tools like Taskade handle tasks, projects, timelines, and collaboration with AI assistance. For large teams with complex workflows, dedicated project management tools like Jira or Asana still offer more granular control and enterprise features.' },
      { q: 'How much time do AI productivity tools actually save?', a: 'Research shows AI productivity tools save 5–10 hours per week for active users. The biggest savings come from AI task breakdown (turning vague goals into actionable steps), automated meeting notes, and intelligent task prioritisation.' },
      { q: 'Are there free AI productivity tools?', a: 'Taskade offers a free plan with 1 workspace and 5 projects. Notion offers a free personal plan with AI features. Both are genuinely usable on the free tier for individual productivity, though teams will need paid plans for collaboration features.' },
      { q: 'Do AI productivity tools work offline?', a: 'Most AI productivity tools require an internet connection for AI features since processing happens on remote servers. Some, like Notion, offer offline editing with AI features syncing when you reconnect. Check each tool\'s offline capabilities if this is important for your workflow.' },
    ],
  },
};

// ── Tool logo with local-first fallback ──────────────────────────────────────

function ToolLogo({ tool, size = 40 }: { tool: Tool; size?: number }) {
  const [err, setErr] = React.useState(false);
  const r = Math.round(size * 0.27);
  const initial = tool.name[0].toUpperCase();

  if (!err) {
    return (
      <img
        src={`/logos/${tool.slug}.png`}
        alt={tool.name}
        width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: r, background: tool.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 700, fontFamily: "'Inter', sans-serif", flexShrink: 0,
    }}>
      {initial}
    </span>
  );
}

// ── Tool card ────────────────────────────────────────────────────────────────

const ToolCard: React.FC<{ tool: Tool; navigate: (to: string) => void }> = ({ tool, navigate }) => (
  <div
    style={{
      background: C.surf, borderRadius: 16,
      border: `1px solid ${C.barBrd}`,
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'box-shadow .2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,148,136,.12)')}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
  >
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ToolLogo tool={tool} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt }}>
          {tool.name}
        </span>
        {tool.userBadge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, marginLeft: 8,
            background: 'rgba(13,148,136,.1)', color: C.a1, border: '1px solid rgba(13,148,136,.25)',
          }}>
            {tool.userBadge}
          </span>
        )}
        <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{tool.tagline}</div>
      </div>
    </div>

    {/* Description */}
    <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0 }}>
      {tool.description}
    </p>

    {/* Features */}
    {tool.features && tool.features.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tool.features.slice(0, 4).map(f => (
          <span key={f} style={{
            fontSize: 11, padding: '3px 9px', borderRadius: 100,
            background: C.barBg, border: `1px solid ${C.barBrd}`, color: C.mut,
          }}>
            {f}
          </span>
        ))}
      </div>
    )}

    {/* Best for + pricing */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      {tool.bestFor && (
        <div style={{ fontSize: 12, color: C.mut }}>
          <span style={{ color: C.txt, fontWeight: 600 }}>Best for:</span> {tool.bestFor}
        </div>
      )}
      {tool.pricing && (
        <div style={{ fontSize: 11, color: C.mut }}>
          From <strong style={{ color: C.txt }}>{tool.pricing}</strong>
        </div>
      )}
    </div>

    {/* CTA buttons */}
    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
      <a
        href={tool.affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: C.a1, color: '#fff', borderRadius: 8,
          fontSize: 12.5, fontWeight: 700, padding: '8px 14px',
          textDecoration: 'none',
        }}
      >
        <ExternalLink size={12} /> Try It
      </a>
      <button
        onClick={() => navigate(`/tools/${tool.slug}`)}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          background: C.barBg, border: `1px solid ${C.barBrd}`, color: C.txt,
          borderRadius: 8, fontSize: 12.5, fontWeight: 600, padding: '8px 14px',
          cursor: 'pointer',
        }}
      >
        Full Review <ArrowRight size={12} />
      </button>
    </div>
  </div>
);

// ── JSON-LD schemas ──────────────────────────────────────────────────────────

function BreadcrumbSchema({ meta }: { meta: CategoryMeta }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.siteUrl },
      { '@type': 'ListItem', position: 2, name: meta.title, item: `${SITE_CONFIG.siteUrl}/${meta.slug}` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

function ItemListSchema({ tools, meta }: { tools: Tool[]; meta: CategoryMeta }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.title,
    description: meta.metaDescription,
    numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${SITE_CONFIG.siteUrl}/tools/${t.slug}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  category: string;
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function CategoryPage({ category, navigate, isDark, toggleTheme }: Props) {
  const meta = CATEGORY_META[category];

  // Fallback if category not found
  if (!meta) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.txt, padding: 48, textAlign: 'center' }}>
        <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />
        <h1 style={{ fontFamily: "'Inter',sans-serif", marginTop: 80 }}>Category not found</h1>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, color: C.a1, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  const filteredTools = TOOLS.filter(t => t.category === category);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.txt }}>
      <BreadcrumbSchema meta={meta} />
      <FAQSchema faqs={meta.faqs} />
      <ItemListSchema tools={filteredTools} meta={meta} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '16px 24px 0' }}>
        <nav style={{ fontSize: 12, color: C.mut }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontSize: 12, padding: 0 }}
          >
            Home
          </button>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: C.txt, fontWeight: 600 }}>{meta.title}</span>
        </nav>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{
        background: C.dark,
        padding: '56px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginTop: 12,
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${meta.color}33 0%, transparent 70%)`,
        }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
            color: meta.color, fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
            padding: '5px 14px', borderRadius: 100, marginBottom: 20,
          }}>
            <Zap size={11} /> {filteredTools.length} TOOLS ANALYZED & RANKED
          </div>
          <h1 style={{
            fontFamily: "'Inter',sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px,5vw,48px)', color: '#fff',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            {meta.h1.replace(/ 2026$/, '')}<br />
            <span style={{ color: 'var(--a2)' }}>2026</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            {meta.metaDescription}
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: String(filteredTools.length), label: 'Tools reviewed' },
              { n: String(filteredTools.filter(t => t.pricing?.toLowerCase().includes('free')).length), label: 'With free plans' },
              { n: '2026', label: 'Last updated' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--a2)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Editorial intro ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 8px' }}>
        <div style={{
          background: C.surf, border: `1px solid ${C.barBrd}`, borderRadius: 16, padding: '24px 28px',
        }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 12 }}>
            {meta.emoji} How we research these {meta.title.replace('Best AI ', '').replace(' 2026', '').toLowerCase()}
          </h2>
          {meta.intro.split('\n\n').map((p, i) => (
            <p key={i} style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, marginBottom: i < meta.intro.split('\n\n').length - 1 ? 10 : 0 }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* ── Tool grid ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{
          fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{meta.emoji}</span> All {filteredTools.length} {meta.title.replace('Best ', '')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredTools.map(t => <ToolCard key={t.id} tool={t} navigate={navigate} />)}
        </div>

        {filteredTools.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.mut }}>
            <p style={{ fontSize: 16 }}>No tools found in this category yet.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: 12, color: C.a1, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              ← Browse all tools
            </button>
          </div>
        )}
      </div>

      {/* ── FAQ section ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        {meta.faqs.map(({ q, a }, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${C.barBrd}`, padding: '18px 0' }}>
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 8 }}>
              {q}
            </h3>
            <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>

      {/* ── Newsletter CTA ───────────────────────────────────────────────── */}
      <div style={{ background: C.dark, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Get notified when I review new {meta.title.replace('Best AI ', '').replace(' 2026', '').toLowerCase()}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 24 }}>
            I test new AI tools every week. Subscribe to get honest reviews and comparison guides delivered to your inbox.
          </p>
          <BeehiivForm variant="hero" />
        </div>
      </div>
    </div>
  );
}
