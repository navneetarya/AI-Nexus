import { TOOLS } from '../constants';
import { getVerifiedFacts, type ToolFacts } from './vendor-facts';

export type MatcherTask = 'audio' | 'video' | 'writing' | 'presentations';
export type MatcherBudget = 'free' | 'under20' | 'any';
export type MatcherConstraint = 'commercial' | 'cloning' | 'long-form' | 'none';

export interface MatcherAnswers {
  task: MatcherTask;
  budget: MatcherBudget;
  constraint: MatcherConstraint;
}

export interface MatcherCandidate {
  slug: string;
  name: string;
  task: MatcherTask;
  bestFor: string;
  skipIf: string;
  freePlan: boolean;
  commercialUse: boolean;
  cloning: boolean;
  longForm: boolean;
  lowestPaidMonthly: number | null;
  sourceUrl: string;
  affiliateLink: string;
}

export interface MatcherResult extends MatcherCandidate {
  score: number;
  reasons: string[];
}

function taskFor(slug: string): MatcherTask | null {
  if (slug === 'elevenlabs' || slug === 'murf-ai' || slug === 'podcastle') return 'audio';
  if (slug === 'pictory') return 'video';
  if (slug === 'jasper') return 'writing';
  if (slug === 'gamma') return 'presentations';
  return null;
}

function lowestPaidMonthly(facts: ToolFacts): number | null {
  const prices = facts.plans
    .filter((plan) => !plan.isFree)
    .flatMap((plan) => [plan.priceMonthly, plan.priceMonthlyBilledAnnually])
    .filter((price): price is number => typeof price === 'number');
  return prices.length ? Math.min(...prices) : null;
}

function hasHighlight(facts: ToolFacts, phrase: string): boolean {
  return facts.plans.some((plan) => plan.highlights.some((highlight) => highlight.toLowerCase().includes(phrase)));
}

function hasAllowanceUnit(facts: ToolFacts, units: string[]): boolean {
  return facts.plans.some((plan) => plan.allowance && units.includes(plan.allowance.unit));
}

function candidateFor(facts: ToolFacts): MatcherCandidate | null {
  const task = taskFor(facts.slug);
  const tool = TOOLS.find((entry) => entry.slug === facts.slug);
  if (!task || !tool || !facts.card || !facts.pricingPageUrl || !tool.affiliateLink) return null;
  return {
    slug: facts.slug,
    name: facts.name,
    task,
    bestFor: facts.card.bestFor,
    skipIf: facts.card.skipIf,
    freePlan: facts.freeAccess === 'free-plan',
    commercialUse: facts.plans.some((plan) => plan.commercialUse === true),
    cloning: hasHighlight(facts, 'clon'),
    longForm: hasAllowanceUnit(facts, ['minutes', 'hours']),
    lowestPaidMonthly: lowestPaidMonthly(facts),
    sourceUrl: facts.pricingPageUrl,
    affiliateLink: tool.affiliateLink,
  };
}

export function verifiedMatcherCandidates(): MatcherCandidate[] {
  return [
    ...new Set(TOOLS.map((tool) => tool.slug)),
  ]
    .map((slug) => getVerifiedFacts(slug))
    .filter((facts): facts is ToolFacts => facts !== null)
    .map(candidateFor)
    .filter((candidate): candidate is MatcherCandidate => candidate !== null);
}

function budgetFits(candidate: MatcherCandidate, budget: MatcherBudget): boolean {
  if (budget === 'free') return candidate.freePlan;
  if (budget === 'under20') return candidate.freePlan || (candidate.lowestPaidMonthly !== null && candidate.lowestPaidMonthly < 20);
  return true;
}

export function matchTools(answers: MatcherAnswers, candidates = verifiedMatcherCandidates()): MatcherResult[] {
  return candidates
    .filter((candidate) => candidate.task === answers.task && budgetFits(candidate, answers.budget))
    .map((candidate) => {
      const reasons = ['Matches your selected task'];
      let score = 2;
      if (answers.constraint === 'commercial' && candidate.commercialUse) { score += 2; reasons.push('Commercial use is stated for at least one plan'); }
      if (answers.constraint === 'cloning' && candidate.cloning) { score += 2; reasons.push('Voice cloning is listed in the verified plan facts'); }
      if (answers.constraint === 'long-form' && candidate.longForm) { score += 2; reasons.push('A verified plan includes a minutes- or hours-based allowance'); }
      if (answers.budget === 'free' && candidate.freePlan) { score += 1; reasons.push('A verified free plan is available'); }
      if (answers.budget === 'under20' && candidate.lowestPaidMonthly !== null && candidate.lowestPaidMonthly < 20) { score += 1; reasons.push('A verified paid price is below $20/month'); }
      return { ...candidate, score, reasons };
    })
    .sort((a, b) => b.score - a.score || (a.lowestPaidMonthly ?? Number.POSITIVE_INFINITY) - (b.lowestPaidMonthly ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name));
}