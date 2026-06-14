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
  // ── Week 2: HEADSHOT — bug fix (used in constants.ts since Week 2 but was missing here) ──
  HEADSHOT = 'Headshot',
  // ── Week 4: New categories for upcoming tool pages ────────────────────────
  EMAIL = 'Email',
  MEETING = 'Meeting',
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

  /**
   * Task 4 (AEO/GEO): External entity links for the tool's parent company/product —
   * Wikidata, Crunchbase, ProductHunt, etc. Read by scripts/prerender.mjs and merged
   * into the tool page's Review/SoftwareApplication JSON-LD as `sameAs`, helping
   * Google's Knowledge Graph and AI engines (Perplexity, ChatGPT, AI Overviews)
   * disambiguate which real-world entity this review refers to.
   */
  sameAs?: string[];
}

export interface FilterState {
  search: string;
  category: Category;
}

// ── BlogPost — central type for all blog/*.ts files ──────────────────────────
// Imported by blog/index.ts and re-exported as `BlogPost` for consumers.
export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  datePublished: string;   // ISO 8601 — "2026-05-28"
  dateModified: string;    // ISO 8601 — "2026-06-14"
  author: string;
  category: string;
  readTime: string;        // e.g. "9 min read"
  ogImage?: string;        // Absolute URL to OG image
  excerpt?: string;        // 1–2 sentence answer shown in the Quick Answer box
  content: string;         // Full HTML body of the post

  /** FAQs — rendered in the "Readers Also Ask" + "FAQ" sections and FAQ schema */
  faqs: { q: string; a: string }[];

  /** Optional Pros & Cons rendered as a two-column card after article body */
  proscons?: {
    pros: string[];
    cons: string[];
  };

  /** Optional outbound citations rendered as a Sources section (EEAT trust signal) */
  outboundCitations?: {
    url: string;
    label: string;
  }[];

  /** Optional explicit word count used in Article JSON-LD */
  wordCount?: number;

  /**
   * Task 6 (GEO/EEAT): Editor's personal take — rendered as a semantic
   * <blockquote> with "— Navneet Arya, AI Nexus" attribution immediately
   * after the Quick Answer excerpt box.
   *
   * Use 1–2 sentences in first-person present tense.
   * AI engines (Perplexity, ChatGPT, Google AIO) prioritise labelled expert
   * opinions when selecting content to cite — this field satisfies that signal.
   *
   * Example:
   *   myTake: "Fireflies.ai is the meeting tool I'd recommend to anyone running
   *            more than five remote calls a week — the CRM sync alone saves 30
   *            minutes of manual data entry per meeting."
   *
   * Populate for the top 10 highest-traffic posts first.
   */
  myTake?: string;
}
