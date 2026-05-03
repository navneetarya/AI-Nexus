// blog/types.ts
// Shared type for all blog posts in AI Nexus

export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  datePublished: string;  // YYYY-MM-DD
  dateModified: string;   // YYYY-MM-DD
  author: string;
  category: string;
  readTime: string;
  excerpt: string;
  /** Full article body as an HTML string */
  content: string;
  /** FAQ pairs — rendered as FAQPage JSON-LD schema + visible Q&A section */
  faqs: { q: string; a: string }[];
}
