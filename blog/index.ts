// blog/index.ts
// Central registry of all blog posts — import from here in App.tsx and prerender.mjs

import type { BlogPost } from './types';
import post1 from './best-ai-writing-tools-for-beginners-2026';
import post2 from './best-ai-tools-for-freelancers-2026';
// Week 4 additions — alternatives pages (high buyer-intent)
import post3 from './best-grammarly-alternatives';
import post4 from './best-podcastle-alternatives';
import post9 from './best-notion-ai-alternatives-2026';
import post10 from './best-invideo-alternatives-2026';
// Week 5 additions — social media cluster + Rytr tutorial
import post5 from './best-ai-tools-for-social-media-2026';
import post6 from './how-to-use-rytr-to-write-blog-posts';
// Week 7 additions — long-tail content blitz (students + podcast clusters)
import post7 from './ai-tools-for-students-free-2026';
import post8 from './best-ai-podcast-tools-2026';
// SEO-07 Tier 2: jasper ai alternatives — 3,200/mo, KD 24, high buyer intent
import post11 from './jasper-ai-alternatives';
// Week 2 additions — H7, H9, H10, H15, M8, M9
import post12 from './chatgpt-alternatives-free-2026';
import post13 from './best-ai-coding-tools-2026';
import post14 from './best-ai-logo-makers-free-2026';
import post15 from './best-ai-marketing-tools-2026';
import post16 from './ai-tools-for-teachers-2026';
import post17 from './best-midjourney-alternatives-2026';
import post18 from './how-to-use-ai-for-content-creation-2026';
// W2-T7: India-specific post — near-zero competition, Page 1 in 3–4 weeks possible
import post19 from './best-ai-tools-in-india-2026';
// W3-T3: India freelancers post — KD 8, 1,100/mo, zero competition from MarketerMilk
import post20 from './best-ai-tools-for-freelancers-india-2026';
// W2-T2: India students post — KD 4, 2,400/mo, free plan focus for Indian college students
import post21 from './best-free-ai-tools-for-students-in-india-2026';
// T2.7: Content creators free post — 3,200/mo, low competition, free-plan focused
// Target keyword: "best ai tools for content creators free 2026"
import post22 from './best-ai-tools-for-content-creators-free-2026';
// T4.5: 3-way comparison blog — consolidates taskade-vs-notion + taskade-vs-asana compare pages
// Target keyword: "taskade vs notion vs asana" — new 3-way search query
import post23 from './taskade-vs-notion-vs-asana-2026';
// T4.5: Leonardo vs Midjourney free plan blog — expands compare page with free-tier focus
// Target keyword: "leonardo ai vs midjourney 2026" — 1,200/mo, image generator comparison
import post24 from './leonardo-vs-midjourney-2026';
// P3 keyword gap: "best ai writing tools" — 5,400/mo, Medium KD
// /best-ai-writing-tools route is a CategoryPage — dedicated editorial post needed to compete
import post25 from './best-ai-writing-tools-2026';
// T3.1: Free AI writing tools — 4,200/mo, KD 22 — "no credit card" angle
import post26 from './best-free-ai-writing-tools-2026';
// T3.2: Grammarly Premium worth it — 3,600/mo, KD 22 — upgrade-intent query
import post27 from './is-grammarly-premium-worth-it-2026';
// W2-T1: Grok 4 vs ChatGPT vs Claude — 🔥 Trending +450% — 22K+/mo, KD 12 — CRITICAL first-mover
import post28 from './grok-4-vs-chatgpt-vs-claude-content-creators-2026';
// 🔥 Trending +550% — Google Gemini AI Review — 18K+/mo, KD 19
// Angle: "Can Gemini replace Grammarly + ChatGPT for my writing workflow?" — Google Workspace users
import post29 from './google-gemini-ai-review-2026';
// 🔥 Trending +380% — Claude Code vs GitHub Copilot vs Replit — 9K+/mo, KD 14
// Angle: "Which AI coding tool is best if you're not a professional developer?"
import post30 from './claude-code-vs-github-copilot-vs-replit-2026';
// 📈 Rising +280% — Perplexity AI Review — 14K+/mo, KD 22
// Angle: "Is Perplexity replacing Google for you?" — AI search vs traditional search
import post31 from './perplexity-ai-review-2026';
// 🏆 Pillar post: Best AI chatbot 2026 — 18K+/mo, KD 28 — mega-comparison targeting featured snippet
import post32 from './best-ai-chatbot-2026';
// 🔥 Trending: Perplexity Pro vs ChatGPT Plus vs Claude Pro — buyer-intent $20/month comparison
// Angle: same 5 tasks, 3 AIs, honest task-by-task verdict — 2026-05-23
import post33 from './perplexity-pro-vs-chatgpt-plus-vs-claude-pro-freelancers-2026';
// Week 2 EEAT: ChatGPT Free vs Claude Free vs Gemini Free — high-volume evergreen comparison
// Target keyword: "chatgpt free vs claude free" — free plan comparison for freelancers
import post34 from './chatgpt-free-vs-claude-free-vs-gemini-free-2026';
// Use-case pages — developers, automation engineers, YouTubers, startups
import post35 from './best-ai-tools-for-developers-2026';
import post36 from './best-ai-tools-for-automation-engineers-2026';
import post37 from './best-ai-tools-for-youtubers-2026';
import post38 from './best-ai-tools-for-startups-2026';
// Research Intelligence pages — API pricing, free plans, startup growth, ecosystem analysis
import post39 from './ai-api-pricing-comparison-2026';
import post40 from './best-free-ai-tool-plans-2026';
import post41 from './fastest-growing-ai-startups-2026';
import post42 from './cheapest-ai-coding-tools-2026';
import post43 from './ai-ecosystem-growth-report-2026';
// ── Week 1 (Jun 5–11): Trending spike content ─────────────────────────────
// 🔥 +480% trending — GPT-5.5 vs Claude Opus 4.8 vs Grok 4 — 22K+/mo, KD 15
import post44 from './gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026';
// 🔥 New zero-competition category — Best vibe coding tools 2026 (Lovable vs Bolt vs v0)
import post45 from './best-vibe-coding-tools-2026';
// ── Week 2: Headshot category launch — KD 12, 2k–4k/mo, affiliate monetised ─
// Target keyword: "best ai headshot tools for linkedin 2026" — HeadshotPro #1
import post46 from './best-ai-headshot-tools-linkedin-2026';

export const BLOG_POSTS: BlogPost[] = [
  post46, // Week 2 headshot post — new HEADSHOT category launch
  post45, post44, // Week 1 trending posts — pinned to top for freshness signals
  post43, post42, post41, post40, post39,
  post38, post37, post36, post35,
  post34, post33,
  post1, post2, post3, post4, post5, post6, post7, post8,
  post9, post10, post11, post12, post13, post14, post15,
  post16, post17, post18, post19, post20, post21, post22,
  post23, post24, post25,
  post26, post27, post28,
  post29, post30, post31, post32,
];

export type { BlogPost };
