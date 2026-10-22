import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SharedNav } from './SharedNav';
import { matchTools, type MatcherAnswers, type MatcherBudget, type MatcherConstraint, type MatcherResult, type MatcherTask } from '../lib/matcher';

interface Props {
  navigate?: (to: string) => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

const DEFAULT_ANSWERS: MatcherAnswers = { task: 'audio', budget: 'any', constraint: 'none' };

function track(name: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, params);
}

function Option<T extends string>({ label, value, current, onChange }: { label: string; value: T; current: T; onChange: (value: T) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '8px 12px', border: `1px solid ${value === current ? 'var(--a1)' : 'var(--brd)'}`, borderRadius: 10, background: value === current ? 'var(--a1-card)' : 'var(--surf)', cursor: 'pointer' }}>
      <input type="radio" checked={value === current} onChange={() => onChange(value)} />
      <span>{label}</span>
    </label>
  );
}

export function MatcherBody() {
  const [answers, setAnswers] = useState<MatcherAnswers>(DEFAULT_ANSWERS);
  const [results, setResults] = useState<MatcherResult[]>(() => matchTools(DEFAULT_ANSWERS));

  useEffect(() => {
    track('matcher_start', { matcher: 'verified_tool_matcher' });
  }, []);

  const update = <K extends keyof MatcherAnswers>(key: K, value: MatcherAnswers[K]) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    const nextResults = matchTools(next);
    setResults(nextResults);
    track('matcher_complete', { matcher: 'verified_tool_matcher', task: next.task, budget: next.budget, constraint: next.constraint, result_count: nextResults.length });
  };

  return (
    <div data-tool-matcher style={{ display: 'grid', gap: 20 }}>
      <section style={{ display: 'grid', gap: 18, padding: 'clamp(16px, 4vw, 24px)', background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 16 }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          <legend style={{ fontWeight: 700, marginBottom: 8 }}>What are you trying to make?</legend>
          {([['audio', 'Voice, podcast or audio work'], ['video', 'Videos and short-form clips'], ['writing', 'Marketing or written content'], ['presentations', 'Presentations and slides']] as [MatcherTask, string][]).map(([value, label]) => <React.Fragment key={value}><Option label={label} value={value} current={answers.task} onChange={(next) => update('task', next)} /></React.Fragment>)}
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          <legend style={{ fontWeight: 700, marginBottom: 8 }}>What is your budget?</legend>
          {([['free', 'Free plan required'], ['under20', 'Under $20/month if paid'], ['any', 'Show any verified price']] as [MatcherBudget, string][]).map(([value, label]) => <React.Fragment key={value}><Option label={label} value={value} current={answers.budget} onChange={(next) => update('budget', next)} /></React.Fragment>)}
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          <legend style={{ fontWeight: 700, marginBottom: 8 }}>What matters most?</legend>
          {([['commercial', 'Commercial use'], ['cloning', 'Voice cloning'], ['long-form', 'Long-form audio'], ['none', 'No extra constraint']] as [MatcherConstraint, string][]).map(([value, label]) => <React.Fragment key={value}><Option label={label} value={value} current={answers.constraint} onChange={(next) => update('constraint', next)} /></React.Fragment>)}
        </fieldset>
      </section>

      <section aria-live="polite" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>Verified matches</h2>
        {results.length === 0 ? <p style={{ color: 'var(--mut)' }}>No verified tool currently matches all three answers. Try a broader budget or remove the extra constraint.</p> : results.slice(0, 3).map((result) => <React.Fragment key={result.slug}><Result result={result} /></React.Fragment>)}
        <p style={{ fontSize: 12, color: 'var(--mut)', lineHeight: 1.6, margin: 0 }}>Ranking uses task fit, your selected constraint, and verified price/free-plan facts. Affiliate status does not affect the score. Facts are linked to each vendor&apos;s pricing page.</p>
      </section>
    </div>
  );
}

function Result({ result }: { result: MatcherResult }) {
  const click = () => track('matcher_result_click', { matcher: 'verified_tool_matcher', tool: result.slug, link_url: result.affiliateLink });
  return (
    <article style={{ display: 'grid', gap: 8, padding: '16px 18px', background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{result.name}</h3>
        <span style={{ color: 'var(--a1)', fontWeight: 700 }}>{result.score} fit points</span>
      </div>
      <p style={{ margin: 0, color: 'var(--mut)', lineHeight: 1.55 }}>{result.bestFor}</p>
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--mut)', lineHeight: 1.55 }}>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={result.affiliateLink} target="_blank" rel="sponsored nofollow noopener noreferrer" onClick={click} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 9, background: 'var(--a1)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Check {result.name} <ExternalLink size={14} /></a>
        <a href={result.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'var(--a1)', fontSize: 13 }}>Official pricing</a>
      </div>
    </article>
  );
}

export function MatcherPage({ navigate, isDark, toggleTheme }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--txt)' }}>
      {navigate && typeof isDark === 'boolean' && toggleTheme ? <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} /> : null}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px) 80px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 12px' }}>Find an AI tool for your workflow</h1>
        <p style={{ maxWidth: 720, margin: '0 0 24px', color: 'var(--mut)', lineHeight: 1.65 }}>Answer three questions and get up to three recommendations from the currently verified facts dataset.</p>
        <MatcherBody />
      </main>
    </div>
  );
}

export default MatcherPage;