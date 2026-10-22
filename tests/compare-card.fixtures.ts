// tests/compare-card.fixtures.ts  (Phase 3, task 3.1)
//
// Fixtures for rendering <CompareCard /> in isolation. Nothing in the site imports
// this file. The synthetic values are made up on purpose: they exercise layout
// (long text, one-sided rows, different dates) and are never shown to readers.
import type { ToolFacts } from '../lib/vendor-facts';
import { fixtureFull, fixtureTrialOnly, fixtureMinimal, fixtureLongText } from './verdict-card.fixtures';

const a: ToolFacts = { ...fixtureFull, slug: 'fixture-a', name: 'Alpha Voice' };
const b: ToolFacts = { ...fixtureTrialOnly, slug: 'fixture-b', name: 'Beta Voice', verifiedISO: '2026-09-30' };

export const comparePairs = {
  /** Both full, same date, A wins. */
  sameDate: { facts: { a, b: { ...b, verifiedISO: a.verifiedISO } }, winnerSlug: 'fixture-a' },
  /** Different verification dates, B wins. */
  differentDates: { facts: { a, b }, winnerSlug: 'fixture-b' },
  /** B has no prices and no card text: its column says "Not verified" where A has values. */
  oneSided: { facts: { a, b: { ...fixtureMinimal, slug: 'fixture-m', name: 'Minimal Tool' } }, winnerSlug: 'fixture-a' },
  /** Long unbroken text on both sides, for 375px overflow checks. */
  longText: {
    facts: { a: { ...fixtureLongText, slug: 'fixture-l1' }, b: { ...fixtureLongText, slug: 'fixture-l2', name: 'Another Extraordinarily Long Product Name Studio' } },
    winnerSlug: 'fixture-l2',
  },
};
