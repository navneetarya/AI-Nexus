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
}

export interface FilterState {
  search: string;
  category: Category;
}
