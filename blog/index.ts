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

export const BLOG_POSTS: BlogPost[] = [
  post1, post2, post3, post4, post5, post6, post7, post8,
  post9, post10, post11, post12, post13, post14, post15,
  post16, post17, post18, post19, post20, post21, post22,
  post23, post24, post25,
];

export type { BlogPost };
