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

export const BLOG_POSTS: BlogPost[] = [post1, post2, post3, post4, post5, post6, post7, post8, post9, post10, post11, post12, post13, post14, post15, post16, post17];

export type { BlogPost };
