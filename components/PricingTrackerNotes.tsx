import React from 'react';
import {
  PRICING_SNAPSHOT, PRICING_HISTORY, changesThisMonth, corrections, monthLabel, shortDate,
  type PricingSnapshot, type HistoryEntry,
} from '../lib/pricing-data';

// components/PricingTrackerNotes.tsx  (Phase 4, task 4.4)
//
// The three text sections under the pricing table: "What changed this month", "How we
// verify prices" and "Corrections". Pure and deterministic (no Date.now) so prerender can
// render the same HTML (task 4.5).
//
// The first two lists are driven by data/pricing/history.json; the methodology copy is fixed
// text that describes what the data files actually do. Keep the two in step: if the process
// changes (for example a re-check schedule is adopted), edit METHOD_STEPS below.

interface Props {
  snapshot?: PricingSnapshot;
  history?: HistoryEntry[];
  navigate?: (to: string) => void;
}

const C = { txt: 'var(--txt)', mut: 'var(--mut)', a1: 'var(--a1)', surf: 'var(--surf)', brd: 'var(--brd)', a1card: 'var(--a1-card)', a1brd: 'var(--a1-brd)' };

const METHOD_STEPS: string[] = [
  'Every price comes from the vendor’s own pricing page. We read the page, copy the number and record the date we checked it. Third-party roundups are not used as a source of prices.',
  'Prices are list prices in the currency shown, before tax. Introductory discounts and limited-time promotions are left out.',
  '“Starts at (monthly billing)” is the lowest published paid plan billed month to month. “Starts at (annual billing)” is the lowest price per month when the plan is billed yearly. Plans that only say “contact sales” have no number here.',
  '“Not verified” means we could not confirm a value from an official page. It never means “free” or “not offered”, and we never fill a gap with an estimate.',
  'Each table is a dated snapshot. When prices are re-verified we freeze a new snapshot and compare it with the previous one. The comparison drafts the change entries, and a person checks each draft against the vendor’s page before it is published.',
];

const h2: React.CSSProperties = { fontSize: 'clamp(20px, 3.5vw, 24px)', fontWeight: 800, lineHeight: 1.25, margin: '0 0 10px', letterSpacing: '-0.01em', color: C.txt };
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.7, color: C.mut, margin: '0 0 10px', maxWidth: 720 };

function formatValue(v: unknown, currency: string, field: string | null): string {
  if (v === null || v === undefined) return 'not verified';
  if (typeof v === 'number' && field && /price/i.test(field)) {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v);
  }
  return String(v);
}

export function PricingTrackerNotes({ snapshot = PRICING_SNAPSHOT, history = PRICING_HISTORY, navigate }: Props) {
  const month = monthLabel(snapshot.snapshotISO);
  const changes = changesThisMonth(snapshot, history);
  const fixes = corrections(history);
  const link = (to: string) => navigate ? (e: React.MouseEvent) => { e.preventDefault(); navigate(to); } : undefined;
  const a: React.CSSProperties = { color: C.a1, textDecoration: 'underline' };

  return (
    <div data-pricing-notes="true" style={{ marginTop: 48, display: 'grid', gap: 40 }}>
      <section aria-labelledby="pt-changed">
        <h2 id="pt-changed" style={h2}>What changed in {month}</h2>
        {changes.length === 0 ? (
          <p style={p}>
            No verified price changes have been recorded in {month}. The snapshot of {shortDate(snapshot.snapshotISO)} is
            the baseline for this tracker, so changes are logged from that date onward.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, maxWidth: 720 }}>
            {changes.map((e) => (
              <li key={e.id} style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.a1 }}>
                  <time dateTime={e.dateISO}>{shortDate(e.dateISO)}</time> · {e.tool}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.55, color: C.txt, marginTop: 4 }}>{e.summary}</div>
                {(e.from !== null && e.to !== null && e.field && /price/i.test(e.field)) && (
                  <div style={{ fontSize: 13, color: C.mut, marginTop: 2 }}>
                    {formatValue(e.from, e.currency, e.field)} → {formatValue(e.to, e.currency, e.field)}
                  </div>
                )}
                <a href={e.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" style={{ ...a, fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
                  Source: vendor pricing page →
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pt-method">
        <h2 id="pt-method" style={h2}>How we verify prices</h2>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8, maxWidth: 720 }}>
          {METHOD_STEPS.map((s) => (
            <li key={s} style={{ fontSize: 15, lineHeight: 1.7, color: C.mut }}>{s}</li>
          ))}
        </ol>
        <p style={{ ...p, marginTop: 12 }}>
          Our wider process is in the <a href="/methodology/" onClick={link('/methodology')} style={a}>methodology</a> and{' '}
          <a href="/editorial-policy/" onClick={link('/editorial-policy')} style={a}>editorial policy</a>. Some links to vendors
          elsewhere on this site are affiliate links, and we may earn a commission. That does not change what is listed in this table
          (see the <a href="/disclosure/" onClick={link('/disclosure')} style={a}>affiliate disclosure</a>).
        </p>
      </section>

      <section aria-labelledby="pt-corrections">
        <h2 id="pt-corrections" style={h2}>Corrections</h2>
        <p style={p}>
          Prices change often and we can be wrong. If a number here does not match the vendor&apos;s pricing page, tell us through the{' '}
          <a href="/contact/" onClick={link('/contact')} style={a}>contact page</a> and include a link to the page you checked.
          We re-check it, fix it if we got it wrong, and list the fix below with its date.
        </p>
        {fixes.length === 0 ? (
          <p style={{ ...p, fontStyle: 'italic' }}>No corrections have been published yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, maxWidth: 720 }}>
            {fixes.map((e) => (
              <li key={e.id} style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.a1 }}>
                  <time dateTime={e.dateISO}>{shortDate(e.dateISO)}</time> · {e.tool}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.55, color: C.txt, marginTop: 4 }}>{e.summary}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default PricingTrackerNotes;
