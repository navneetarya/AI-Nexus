export enum Category {
  ALL = 'All',
  WRITING = 'Writing',
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  MARKETING = 'Marketing',
  DESIGN = 'Design',
  CODING = 'Coding',
  PRODUCTIVITY = 'Productivity',
  HEADSHOT = 'Headshot',
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: Category;
  affiliateLink: string;
  iconName: string;
  color: string;
  accentColor: string;
  userBadge?: string;
  pricing?: string;
  bestFor?: string;
  pros?: string[];
  cons?: string[];
  features?: string[];

  // ── Week 2: Affiliate page expansion fields ──────────────────────────────
  /** Pricing tier breakdown — renders a visual pricing table on the tool page */
  pricingBreakdown?: {
    tier: string;       // e.g. "Free", "Saver", "Premium"
    price: string;      // e.g. "$0/month", "$9/month"
    highlight: string;  // Key features for this tier in one line
  }[];

  /** 4-step getting started guide — renders a numbered onboarding section */
  setupSteps?: string[];

  /** A real output sample with editorial commentary */
  realOutputExample?: {
    output: string;       // The actual AI-generated text
    editorialNote: string; // Your honest take on the quality
  };

  /** "5 things I use it for daily" list */
  dailyUseCases?: string[];

  /** "Who should NOT use this" — different from whoShouldSkip in TOOL_CONTENT */
  notForYou?: string;

  /** W3-1: ISO 8601 date the tool was last tested — used in Review schema dateModified */
  lastTestedISO?: string;

  /**
   * Optional custom <title> for the tool page. When present, App.tsx uses this
   * instead of the generic "[Tool] Review 2026 — Independently Researched" pattern.
   * Use question-format titles for "is it worth it" tools (higher CTR).
   */
  titleTemplate?: string;

  /**
   * W2-T1 (no-screenshot variant): Research basis data shown as a visible citation bar
   * on the tool page. Replaces the screenshot requirement by surfacing the independent
   * data sources that back up the review — satisfying EEAT Trustworthiness for quality raters.
   */
  researchSources?: {
    trustpilot?: { rating: number; count: number; url: string };
    g2?: { rating: number; count: number };
    reddit?: string;          // e.g. "Positive — r/Blogging, r/freelanceWriters"
    lastVerified: string;     // ISO 8601 — "2026-05-12"
  };

  /**
   * W4: India-specific pricing in INR — rendered as a localised pricing note on the
   * tool page for Indian visitors. Supports UPI/Razorpay context and GST notes.
   */
  indiaPricing?: {
    free: string;   // e.g. "Free forever" or "No free plan (7-day trial)"
    paid: string;   // e.g. "₹1,000/month Premium"
    note: string;   // Payment method / GST / accessibility note
  };

  /**
   * W3: Dated update log — shown on tool pages as a "Review Updates" section.
   * Each entry captures a date and a brief note about what was verified/changed.
   */
  updateLog?: {
    date: string;  // e.g. "May 2026"
    note: string;  // Short note about what was verified or updated
  }[];

  /** W3: Review type — 'hands-on' for tools personally tested, 'research-based' for tools reviewed through official documentation and aggregated user reviews. */
  reviewType?: 'hands-on' | 'research-based';
}

export interface FilterState {
  search: string;
  category: Category;
}

// ── BlogPost ─────────────────────────────────────────────────────────────────
// Central type for all blog posts. Every field used in blog/*.ts files must
// be declared here. Individual blog post files import this from './types'.
// blog/index.ts re-exports it for page components and prerender.mjs.
export interface BlogPost {
  /** URL slug — e.g. "cursor-ai-review-2026" */
  slug: string;
  /** H1 / <title> headline */
  title: string;
  /** Optional custom <title> tag (50–60 chars) — falls back to title if omitted */
  seoTitle: string;
  /** Meta description (150–160 chars) */
  metaDescription: string;
  /** ISO 8601 publish date — e.g. "2026-05-25" */
  datePublished: string;
  /** ISO 8601 last-modified date — refreshed on every content update */
  dateModified: string;
  /** Display name of the author — "Navneet Arya" */
  author: string;
  /** Category label shown on the post card — e.g. "Writing", "Coding" */
  category: string;
  /** Estimated read time — e.g. "9 min read" */
  readTime: string;
  /**
   * Absolute URL of the OG image used for social sharing.
   * e.g. "https://ainexustools.online/og/blog/cursor-ai-review-2026.webp"
   * Falls back to the homepage OG image when omitted.
   */
  ogImage?: string;
  /**
   * One-paragraph "Quick Answer" shown above the article body.
   * Targeted by Speakable schema in prerender.mjs for AI engine citations.
   */
  excerpt?: string;
  /**
   * FAQ pairs — rendered as both an interactive accordion (ReadersAlsoAsk)
   * and a static FAQ section. Also used for FAQPage JSON-LD in prerender.mjs.
   * Minimum 3 pairs recommended for FAQ rich result eligibility.
   */
  faqs: { q: string; a: string }[];
  /** Raw HTML article body — must contain h2 headings for the auto-generated TOC */
  content: string;
  /**
   * T5 (EEAT-High): Optional visual pros/cons table.
   * Renders a two-column green/red card block after the article body.
   * Boosts scannability and qualifies the post for ItemList-style rich results.
   * Populate per post separately — omit the field to hide the section entirely.
   *
   * @example
   * proscons: {
   *   pros: ['Generous free plan', 'Works in Google Docs'],
   *   cons: ['No Android app', 'Limited to 10k characters on free tier'],
   * }
   */
  proscons?: {
    pros: string[];
    cons: string[];
  };
  /**
   * T7 (EEAT-Medium): Optional outbound citations — renders a "Sources" section
   * at the bottom of the post with dofollow links to G2, Trustpilot, pricing pages.
   * Populate per post separately.
   */
  outboundCitations?: {
    label: string;  // e.g. "Fireflies.ai on G2"
    url: string;    // e.g. "https://www.g2.com/products/fireflies-ai/reviews"
  }[];
}
