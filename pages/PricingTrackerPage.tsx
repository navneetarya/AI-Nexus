import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SharedNav } from './SharedNav';
import { PricingTrackerNotes } from '../components/PricingTrackerNotes';
import {
  PRICING_SNAPSHOT, PRICING_HISTORY, recentChanges, sortTools, categoriesOf,
  perMonth, freeAccessText, shortDate, CHANGED_WITHIN_DAYS,
  type SortKey, type SortDir, type PricingSnapshot, type HistoryEntry,
} from '../lib/pricing-data';

// pages/PricingTrackerPage.tsx  (Phase 4, task 4.3)
//
// Sortable table of verified AI tool prices from the dated snapshot in data/pricing/.
//  - Only verified tools appear. "Not verified" means we have no checked number, never "free" or "none".
//  - Unverified prices sort last in both directions.
//  - "Changed" flag: the tool has a change-log entry within CHANGED_WITHIN_DAYS of the snapshot date.
//  - Pure and deterministic: nothing depends on the current time, so prerender can match it (task 4.5).
//  - Colours come from the CSS variables in index.html (light, dark, manual switch).

const C = {
  bg: 'var(--bg)', surf: 'var(--surf)', surf2: 'var(--surf2)', txt: 'var(--txt)', mut: 'var(--mut)',
  a1: 'var(--a1)', a1card: 'var(--a1-card)', a1brd: 'var(--a1-brd)', brd: 'var(--brd)',
};

interface BodyProps {
  /** Omitted when rendering static HTML for crawlers: links are then plain links. */
  navigate?: (to: string) => void;
  /** Test hooks. The live site uses the data files. */
  snapshot?: PricingSnapshot;
  history?: HistoryEntry[];
}

interface Props extends BodyProps {
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Tool' },
  { key: 'category', label: 'Category' },
  { key: 'startsAt', label: 'Starts at (monthly billing)' },
  { key: 'annual', label: 'Starts at (annual billing)' },
  { key: 'verified', label: 'Verified' },
];

/**
 * Everything under the page title: intro, filter, table and the text sections.
 * scripts/prerender.mjs renders THIS component (via lib/verdict-card-ssr.tsx), so crawlers
 * get exactly the markup readers get. Do not put the h1 here: the prerender shell adds its own.
 */
export function PricingTrackerBody({ navigate, snapshot = PRICING_SNAPSHOT, history = PRICING_HISTORY }: BodyProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [category, setCategory] = useState<string>('All');

  const categories = useMemo(() => categoriesOf(snapshot.tools), [snapshot]);
  const changes = useMemo(() => recentChanges(snapshot, history), [snapshot, history]);
  const rows = useMemo(() => {
    const filtered = category === 'All' ? snapshot.tools : snapshot.tools.filter((t) => t.category === category);
    return sortTools(filtered, sortKey, sortDir);
  }, [snapshot, category, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const go = (to: string) => (navigate ? (e: React.MouseEvent) => { e.preventDefault(); navigate(to); } : undefined);
  const changedCount = rows.filter((t) => changes.has(t.slug)).length;

  const th: React.CSSProperties = { textAlign: 'left', padding: 0, borderBottom: `1px solid ${C.brd}`, whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', borderBottom: `1px solid ${C.brd}`, fontSize: 14, verticalAlign: 'top', color: C.txt };

  return (
    <div data-pricing-tracker="true">
      <p style={{ fontSize: 16, color: C.mut, lineHeight: 1.65, maxWidth: 680, margin: '0 0 8px' }}>
        Published prices for {snapshot.toolCount} AI tools, each checked against the vendor&apos;s own pricing page.
        Snapshot of {shortDate(snapshot.snapshotISO)}.
      </p>
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6, maxWidth: 680, margin: '0 0 24px' }}>
        &ldquo;Not verified&rdquo; means we could not confirm a price from an official page. It does not mean the tool is free.
        Prices are list prices before tax and exclude promotions.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px', marginBottom: 16 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: C.mut }}>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ minHeight: 40, padding: '6px 10px', fontSize: 14, color: C.txt, background: C.surf, border: `1px solid ${C.a1brd}`, borderRadius: 8 }}
          >
            <option value="All">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <span style={{ fontSize: 13, color: C.mut }} aria-live="polite">
          {rows.length} tool{rows.length === 1 ? '' : 's'}
          {changedCount > 0 ? ` · ${changedCount} changed in the last ${CHANGED_WITHIN_DAYS} days` : ''}
        </span>
      </div>

      <div
        data-pricing-table="true"
        style={{ overflowX: 'auto', border: `1px solid ${C.brd}`, borderRadius: 12, background: C.surf, maxWidth: '100%' }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            AI tool prices, sortable by column
          </caption>
          <thead>
            <tr>
              {COLUMNS.map(({ key, label }) => {
                const active = sortKey === key;
                return (
                  <th key={key} scope="col" aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} style={th}>
                    <button
                      type="button"
                      onClick={() => onSort(key)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 44,
                        padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                        textTransform: 'uppercase', color: active ? C.a1 : C.mut,
                      }}
                    >
                      {label}
                      {active ? (sortDir === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />) : <ArrowUpDown size={13} aria-hidden="true" />}
                    </button>
                  </th>
                );
              })}
              <th scope="col" style={{ ...th, padding: '10px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.mut }}>
                Free access
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const recent = changes.get(t.slug);
              const monthly = perMonth(t.startsAtMonthly, t.currency);
              const annual = perMonth(t.startsAtMonthlyBilledAnnually, t.currency);
              return (
                <tr key={t.slug} data-tool={t.slug} data-changed={recent ? 'true' : undefined}>
                  <td style={{ ...td, minWidth: 170 }}>
                    <a
                      href={`/tools/${t.slug}/`}
                      onClick={go(`/tools/${t.slug}/`)}
                      style={{ color: C.a1, fontWeight: 700, textDecoration: 'none' }}
                    >
                      {t.name}
                    </a>
                    {recent && (
                      <div style={{ marginTop: 6 }}>
                        <span
                          data-changed-flag="true"
                          style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', background: C.a1, borderRadius: 100, padding: '2px 9px', whiteSpace: 'nowrap' }}
                        >
                          Changed {shortDate(recent[0].dateISO)}
                        </span>
                        <div style={{ fontSize: 12, color: C.mut, marginTop: 4, lineHeight: 1.45, maxWidth: 260 }}>{recent[0].summary}</div>
                      </div>
                    )}
                  </td>
                  <td style={td}>{t.category ?? '—'}</td>
                  <td style={{ ...td, color: monthly ? C.txt : C.mut, fontStyle: monthly ? 'normal' : 'italic' }}>{monthly ?? 'Not verified'}</td>
                  <td style={{ ...td, color: annual ? C.txt : C.mut, fontStyle: annual ? 'normal' : 'italic' }}>{annual ?? 'Not verified'}</td>
                  <td style={td}>
                    <time dateTime={t.verifiedISO}>{shortDate(t.verifiedISO)}</time>
                    <div style={{ marginTop: 4 }}>
                      <a href={t.pricingPageUrl} target="_blank" rel="nofollow noopener noreferrer" style={{ fontSize: 12, color: C.a1, fontWeight: 600, textDecoration: 'none' }}>
                        Vendor pricing →
                      </a>
                    </div>
                  </td>
                  <td style={td}>{freeAccessText(t)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: C.mut, lineHeight: 1.6, margin: '14px 0 0', maxWidth: 680 }}>
        Some links to vendors are affiliate links elsewhere on this site; the links in this table go to each vendor&apos;s own
        pricing page and are not affiliate links. See the{' '}
        <a href="/disclosure/" onClick={go('/disclosure')} style={{ color: C.a1, textDecoration: 'underline' }}>affiliate disclosure</a>.
      </p>

      <PricingTrackerNotes snapshot={snapshot} history={history} navigate={navigate} />
    </div>
  );
}

export function PricingTrackerPage({ navigate, isDark, toggleTheme, snapshot, history }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="pricing" />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px) 80px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          AI Tool Pricing Tracker
        </h1>
        <PricingTrackerBody navigate={navigate} snapshot={snapshot} history={history} />
      </main>
    </div>
  );
}


export default PricingTrackerPage;
