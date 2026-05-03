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
}

export interface FilterState {
  search: string;
  category: Category;
}
