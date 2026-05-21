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
}

export interface FilterState {
  search: string;
  category: Category;
}
