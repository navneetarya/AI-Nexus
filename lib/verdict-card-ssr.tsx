// lib/verdict-card-ssr.tsx  (Phase 2, task 2.4)
//
// Server-side (build-time) entry for the verdict card. scripts/prerender.mjs and
// scripts/verify-prerender.mjs bundle THIS file with esbuild and call it, so the
// HTML that crawlers read is produced by the very same <VerdictCard> component
// and the very same rule as the live page. There is no second copy to drift.
//
// THE RULE (must match pages/ToolPage.tsx):
//   the card shows only when the tool has an affiliate link AND getVerifiedFacts(slug)
//   returns an entry. If either is missing, nothing is rendered.
//
// Nothing in the browser bundle imports this file, so it adds no weight to the site.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { VerdictCard } from '../components/VerdictCard';
import { TOOLS } from '../constants';
import { cheapestPaidPlan, getVerifiedFacts, startsAtLabel, freePlanLabel } from './vendor-facts';

function affiliateLinkFor(slug: string): string | null {
  const tool = TOOLS.find((t) => t.slug === slug);
  return tool && tool.affiliateLink ? tool.affiliateLink : null;
}

/** True when the live ToolPage would show the card for this slug. */
export function hasVerdictCard(slug: string): boolean {
  return affiliateLinkFor(slug) !== null && getVerifiedFacts(slug) !== null;
}

/** The card as static HTML, or '' when the live page would not show it. */
export function renderVerdictCardHtml(slug: string): string {
  const link = affiliateLinkFor(slug);
  const facts = link ? getVerifiedFacts(slug) : null;
  if (!link || !facts) return '';
  return renderToStaticMarkup(<VerdictCard facts={facts} affiliateLink={link} />);
}

/** Slugs that have a card, for the build report and for verify-prerender. */
export function verdictCardSlugs(): string[] {
  return TOOLS.map((t) => t.slug).filter(hasVerdictCard);
}

export interface VerifiedOffer {
  /** Schema.org price as a string, or null when the facts publish no number. */
  price: string | null;
  priceCurrency: string;
  /** Human-readable summary, built from the same helpers the card uses. */
  description: string;
}

/**
 * Offer data for the JSON-LD of a tool with verified facts, or null for other tools.
 * price is "0" only when a free plan is verified. For trial-only tools it is the
 * cheapest published paid price, so the schema no longer says a tool is free when
 * the card says "No free plan".
 */
export function verifiedOffer(slug: string): VerifiedOffer | null {
  const facts = getVerifiedFacts(slug);
  if (!facts) return null;
  let price: string | null = null;
  if (facts.freeAccess === 'free-plan') {
    price = '0';
  } else {
    const plan = cheapestPaidPlan(facts);
    if (plan) {
      const nums = [plan.priceMonthly, plan.priceMonthlyBilledAnnually].filter(
        (n): n is number => typeof n === 'number',
      );
      if (nums.length > 0) price = String(Math.min(...nums));
    }
  }
  const description = [startsAtLabel(facts), freePlanLabel(facts)].filter(Boolean).join('. ');
  return { price, priceCurrency: facts.currency, description };
}
