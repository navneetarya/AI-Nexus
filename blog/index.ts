// blog/index.ts
// Central registry of all blog posts — import from here in App.tsx and prerender.mjs

import type { BlogPost } from './types';
import post1 from './best-ai-writing-tools-for-beginners-2026';
import post2 from './best-ai-tools-for-freelancers-2026';
// Week 4 additions — alternatives pages (high buyer-intent)
import post3 from './best-grammarly-alternatives';
import post4 from './best-podcastle-alternatives';
// Week 5 additions — social media cluster + Rytr tutorial
import post5 from './best-ai-tools-for-social-media-2026';
import post6 from './how-to-use-rytr-to-write-blog-posts';
// Week 7 additions — long-tail content blitz (students + podcast clusters)
import post7 from './ai-tools-for-students-free-2026';
import post8 from './best-ai-podcast-tools-2026';

export const BLOG_POSTS: BlogPost[] = [post1, post2, post3, post4, post5, post6, post7, post8];

export type { BlogPost };
