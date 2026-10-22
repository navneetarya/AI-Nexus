import { describe, expect, it } from 'vitest';
import { matchTools, type MatcherCandidate } from '../lib/matcher';

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