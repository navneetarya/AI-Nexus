import { describe, expect, it } from 'vitest';
import { candidateCountsByTask, matchTools, verifiedMatcherCandidates, type MatcherCandidate } from '../lib/matcher';
import { ALL_TOOL_FACTS } from '../lib/vendor-facts';

const candidates: MatcherCandidate[] = [
  {
    slug: 'alpha', name: 'Alpha', task: 'audio', bestFor: 'Audio work', skipIf: 'You need video',
    freePlan: true, commercialUse: true, cloning: true, longForm: false, lowestPaidMonthly: 10,
    sourceUrl: 'https://alpha.example/pricing', affiliateLink: 'https://alpha.example',
  },
  {
    slug: 'beta', name: 'Beta', task: 'audio', bestFor: 'Audio work', skipIf: 'You need cloning',
    freePlan: false, commercialUse: true, cloning: false, longForm: true, lowestPaidMonthly: 30,
    sourceUrl: 'https://beta.example/pricing', affiliateLink: 'https://beta.example',
  },
];

describe('matchTools', () => {
  it('filters by task and budget without inventing candidates', () => {
    const results = matchTools({ task: 'audio', budget: 'free', constraint: 'none' }, candidates);
    expect(results.map((result) => result.slug)).toEqual(['alpha']);
  });

  it('ranks a verified constraint match first', () => {
    const results = matchTools({ task: 'audio', budget: 'any', constraint: 'cloning' }, candidates);
    expect(results[0].slug).toBe('alpha');
    expect(results[0].reasons).toContain('Voice cloning is listed in the verified plan facts');
  });

  it('uses deterministic price then name tie-breakers', () => {
    const tied = candidates.map((candidate) => ({ ...candidate, cloning: false, lowestPaidMonthly: 10 }));
    expect(matchTools({ task: 'audio', budget: 'any', constraint: 'none' }, tied).map((result) => result.name)).toEqual(['Alpha', 'Beta']);
  });
});

describe('matchTools: budget, constraints and ordering', () => {
  it('under20 keeps free plans and paid plans below $20 and drops the rest', () => {
    const pricey: MatcherCandidate = { ...candidates[1], slug: 'gamma-like', name: 'Gamma-like', lowestPaidMonthly: 20 };
    const cheap: MatcherCandidate = { ...candidates[1], slug: 'cheap', name: 'Cheap', lowestPaidMonthly: 19.99 };
    const slugs = matchTools({ task: 'audio', budget: 'under20', constraint: 'none' }, [candidates[0], pricey, cheap]).map((r) => r.slug);
    expect(slugs).toContain('alpha');
    expect(slugs).toContain('cheap');
    expect(slugs).not.toContain('gamma-like');
  });

  it('never returns a tool from another task', () => {
    const video: MatcherCandidate = { ...candidates[0], slug: 'vid', name: 'Vid', task: 'video' };
    expect(matchTools({ task: 'audio', budget: 'any', constraint: 'none' }, [candidates[0], video]).map((r) => r.slug)).toEqual(['alpha']);
  });

  it('returns an empty list instead of inventing a match', () => {
    expect(matchTools({ task: 'writing', budget: 'any', constraint: 'none' }, candidates)).toEqual([]);
  });

  it('awards commercial and long-form points only when the verified fact is true', () => {
    const results = matchTools({ task: 'audio', budget: 'any', constraint: 'long-form' }, candidates);
    expect(results[0].slug).toBe('beta');
    expect(results[0].reasons).toContain('A verified plan includes a minutes- or hours-based allowance');
    expect(results[1].reasons.join(' ')).not.toContain('minutes- or hours-based');
  });

  it('adds a point for a free plan when the budget is free', () => {
    const [first] = matchTools({ task: 'audio', budget: 'free', constraint: 'none' }, candidates);
    expect(first.score).toBe(3);
  });
});

describe('matcher data comes from vendor-facts', () => {
  it('every candidate takes its task from the vendor-facts file', () => {
    for (const candidate of verifiedMatcherCandidates()) {
      const facts = ALL_TOOL_FACTS.find((f) => f.slug === candidate.slug);
      expect(facts?.matcherTask).toBe(candidate.task);
    }
  });

  it('every matcherTask in the data file is a known task', () => {
    const known = Object.keys(candidateCountsByTask([]));
    for (const facts of ALL_TOOL_FACTS) {
      if (facts.matcherTask) expect(known).toContain(facts.matcherTask);
    }
  });

  it('does not list a tool that has no matcherTask', () => {
    const slugs = verifiedMatcherCandidates().map((c) => c.slug);
    for (const facts of ALL_TOOL_FACTS) {
      if (!facts.matcherTask) expect(slugs).not.toContain(facts.slug);
    }
  });

  it('counts verified tools per task', () => {
    const counts = candidateCountsByTask(verifiedMatcherCandidates());
    expect(counts.audio).toBeGreaterThanOrEqual(3);
    expect(counts.transcription).toBeGreaterThanOrEqual(1);
  });
});
