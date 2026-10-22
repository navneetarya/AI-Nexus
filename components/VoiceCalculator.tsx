import React, { useId, useMemo, useState } from 'react';
import {
  compareVoiceVendors,
  fmtInt,
  validateScenario,
  type BillingPeriod,
  type PlanEvaluation,
  type VendorResult,
  type VoiceScenario,
} from '../lib/calc/voice';
import {
  ASSUMPTION_TEXT,
  DEFAULT_ASSUMPTIONS,
  type CloningLevel,
  type ConversionAssumptions,
  type VoiceVendorId,
} from '../lib/calc/voice-inputs';
import {
  FX_CONFIRMATION_NOTE,
  INDIA_GENERAL_NOTES,
  NO_INDIA_NOTE,
  USD_INR_REFERENCE,
  fmtInr,
  fxDateLabel,
  getIndiaNote,
  parseRate,
  usdToInr,
  validateRate,
  type FxReference,
} from '../lib/calc/fx';

// components/VoiceCalculator.tsx  (Phase 5, task 5.5)
//
// The voice cost calculator: four inputs, one result card per vendor, caveats.
//  - All plan selection lives in lib/calc/voice.ts. This file only collects input and shows the result.
//  - Renders the same on the server and in the browser: no window, no Date, no randomness, so the
//    prerendered default scenario (task 5.7) matches what React hydrates.
//  - Works without JavaScript for everything that is already on the page (details elements, links).
//  - Colours come from the CSS variables in index.html (light, dark, manual switch).
//  - Affiliate links are optional. They never change which plan is recommended, and the page says so.

export type Currency = 'USD' | 'INR';

/** How amounts are shown. `conv` turns US dollars into the display currency, `fmt` formats that number. */
export interface Money {
  currency: Currency;
  rate: number;
  conv: (usd: number) => number;
  fmt: (n: number) => string;
  /** Convert and format in one step. */
  show: (usd: number) => string;
}

export function makeMoney(currency: Currency, rate: number): Money {
  if (currency === 'INR') {
    const conv = (usd: number) => usdToInr(usd, rate);
    return { currency, rate, conv, fmt: fmtInr, show: (usd) => fmtInr(conv(usd)) };
  }
  return { currency: 'USD', rate, conv: (usd) => usd, fmt: fmtMoney, show: fmtMoney };
}

export const DEFAULT_VOICE_SCENARIO: VoiceScenario = {
  monthlyCharacters: 50_000,
  commercialUse: true,
  cloning: 'none',
  billing: 'annual',
};

const CHARACTER_PRESETS: { label: string; value: number }[] = [
  { label: '10k', value: 10_000 },
  { label: '50k', value: 50_000 },
  { label: '100k', value: 100_000 },
  { label: '500k', value: 500_000 },
  { label: '1M', value: 1_000_000 },
];

export interface VoiceCalculatorProps {
  initialScenario?: Partial<VoiceScenario>;
  initialAssumptions?: ConversionAssumptions;
  /** Currency the prices open in. Default USD, which is what the prerendered page shows. */
  initialCurrency?: Currency;
  /** Dated reference rate for the INR view (lib/calc/fx.ts). Tests can pass their own. */
  fxReference?: FxReference;
  /** Affiliate URL per vendor (from constants.ts via AFFILIATE_LINKS). Omit to show plain pricing links only. */
  affiliateLinks?: Partial<Record<VoiceVendorId, string>>;
  /** Fired when a result card's main link is clicked (analytics wiring, task 5.9). */
  onCtaClick?: (vendor: VoiceVendorId, e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Fired after any input changes with the values currently shown (analytics wiring, task 5.9). */
  onChange?: (scenario: VoiceScenario, assumptions: ConversionAssumptions, view: { currency: Currency; fxRate: number }) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers (exported so they can be tested without a DOM)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads what a person typed into the characters box: "50000", "50,000", "50 000", "50k", "1.5m".
 * Returns NaN when it is not a number at all. A negative number is returned as is, and the validator explains it.
 */
export function parseCharacters(raw: string): number {
  const t = raw.trim().toLowerCase().replace(/[,\s_]/g, '');
  const m = /^(-?)(\d+(?:\.\d+)?|\.\d+)([km])?$/.exec(t);
  if (!m) return Number.NaN;
  const mult = m[3] === 'k' ? 1_000 : m[3] === 'm' ? 1_000_000 : 1;
  // A leading minus is kept so the validator can say "cannot be negative" instead of a vague error.
  const n = Math.round(Number(m[2]) * mult);
  return m[1] ? -n : n;
}

/** Dollars: whole amounts without cents, otherwise two decimals. */
export function fmtMoney(n: number): string {
  return Number.isInteger(n)
    ? `$${n.toLocaleString('en-US')}`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDuration(min: number): string {
  if (min >= 120) return `${(Math.round((min / 60) * 10) / 10).toLocaleString('en-US')} hours`;
  return `${(Math.round(min * 10) / 10).toLocaleString('en-US')} minutes`;
}

/** "12,000 of 30,000 credits a month" / "720 minutes of 1,440 minutes a year" */
export function usageText(plan: PlanEvaluation): string | null {
  const u = plan.usage;
  if (!u) return null;
  if (u.unit === 'credits per month') return `${fmtInt(u.needed)} of ${fmtInt(u.included)} credits a month`;
  const period = u.unit === 'minutes per year' ? 'a year' : 'a month';
  return `about ${fmtDuration(u.needed)} of ${fmtDuration(u.included)} audio ${period}`;
}

/** One sentence comparing the two vendors, or saying why it cannot. Amounts are shown in the chosen currency. */
export function comparisonSentence(
  results: VendorResult[],
  cheaper: VoiceVendorId | 'tie' | null,
  diff: number | null,
  money: Pick<Money, 'conv' | 'fmt'> = { conv: (n) => n, fmt: fmtMoney },
): string {
  const priced = results.filter((r) => r.status === 'recommended' && r.plan?.yearlyCost != null);
  const amount = (r: VendorResult) => money.conv(r.plan!.yearlyCost as number);
  if (cheaper === 'tie') return `Both vendors come to ${money.fmt(amount(priced[0]))} a year for this scenario.`;
  if (cheaper && diff !== null) {
    const win = results.find((r) => r.vendor === cheaper)!;
    const lose = priced.find((r) => r.vendor !== cheaper)!;
    // Subtract the amounts as shown, so the difference always matches the two figures beside it.
    const gap = Math.round((amount(lose) - amount(win)) * 100) / 100;
    return `${win.name} ${win.plan!.planName} is cheaper by ${money.fmt(gap)} a year (${money.fmt(amount(win))} against ${money.fmt(amount(lose))} for ${lose.name} ${lose.plan!.planName}).`;
  }
  if (priced.length === 1) return `Only ${priced[0].name} has a plan with a published price that fits this scenario, so there is no price comparison.`;
  return 'No plan with a published price fits this scenario at either vendor, so there is no price comparison.';
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const S = {
  panel: {
    background: 'var(--surf)',
    border: '1px solid var(--brd)',
    borderRadius: 16,
    padding: 'clamp(16px, 4vw, 24px)',
    boxSizing: 'border-box',
    maxWidth: '100%',
  } as React.CSSProperties,
  legend: { fontSize: 13, fontWeight: 700, color: 'var(--txt)', padding: 0, marginBottom: 8 } as React.CSSProperties,
  hint: { fontSize: 13, color: 'var(--mut)', lineHeight: 1.55, margin: '6px 0 0' } as React.CSSProperties,
  input: {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 44,
    padding: '10px 12px',
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--txt)',
    background: 'var(--bg)',
    border: '1px solid var(--brd-lg)',
    borderRadius: 10,
  } as React.CSSProperties,
  chip: {
    minHeight: 36,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    color: 'var(--txt)',
    background: 'var(--surf2)',
    border: '1px solid var(--brd)',
    borderRadius: 999,
    cursor: 'pointer',
  } as React.CSSProperties,
  link: { color: 'var(--a1)', textDecoration: 'underline', textUnderlineOffset: 2 } as React.CSSProperties,
  small: { fontSize: 12, color: 'var(--mut)', lineHeight: 1.55 } as React.CSSProperties,
};

// ─────────────────────────────────────────────────────────────────────────────
// Small building blocks
// ─────────────────────────────────────────────────────────────────────────────

function Choice<T extends string>(props: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={S.legend}>{props.legend}</legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {props.options.map((o) => {
          const on = o.value === props.value;
          return (
            <label
              key={o.value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 44,
                padding: '8px 14px',
                boxSizing: 'border-box',
                fontSize: 14,
                cursor: 'pointer',
                color: 'var(--txt)',
                background: on ? 'var(--a1-card)' : 'var(--bg)',
                border: `1px solid ${on ? 'var(--a1)' : 'var(--brd-lg)'}`,
                borderRadius: 10,
              }}
            >
              <input
                type="radio"
                name={props.name}
                value={o.value}
                checked={on}
                onChange={() => props.onChange(o.value)}
                style={{ margin: 0, accentColor: 'var(--a1)' }}
              />
              <span>
                {o.label}
                {o.hint ? <span style={{ color: 'var(--mut)' }}> {o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Badge({ confirmed }: { confirmed: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
        padding: '3px 8px',
        borderRadius: 999,
        color: confirmed ? 'var(--a1)' : 'var(--txt)',
        background: confirmed ? 'var(--a1-card)' : 'var(--surf2)',
        border: `1px solid ${confirmed ? 'var(--a1-brd)' : '#D97706'}`,
      }}
    >
      {confirmed ? 'Read from the vendor page' : 'Not yet confirmed on the vendor page'}
    </span>
  );
}

function UsageBar({ plan }: { plan: PlanEvaluation }) {
  const u = plan.usage;
  if (!u || u.included <= 0) return null;
  const used = Math.max(0, Math.min(100, (u.needed / u.included) * 100));
  const text = usageText(plan);
  return (
    <div style={{ margin: '14px 0 0' }}>
      <div
        role="img"
        aria-label={`${Math.round(used)} percent of the allowance used`}
        style={{ height: 8, borderRadius: 999, background: 'var(--surf2)', border: '1px solid var(--brd)', overflow: 'hidden' }}
      >
        <div style={{ width: `${used}%`, height: '100%', background: 'var(--a1)' }} />
      </div>
      <div style={{ ...S.small, marginTop: 6 }}>
        {text}
        {plan.headroomPercent !== null ? ` (${plan.headroomPercent}% left over)` : ''}
      </div>
    </div>
  );
}

function PlanChecks({ result, money }: { result: VendorResult; money: Money }) {
  return (
    <details style={{ marginTop: 14 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>
        How each {result.name} plan was checked
      </summary>
      <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
        {result.considered.map((e) => {
          const chosen = result.plan?.planId === e.planId;
          const verdict = chosen
            ? result.status === 'contact-sales'
              ? 'Quoted by the vendor'
              : 'Chosen'
            : e.custom
              ? 'Contact sales, not priced here'
              : e.eligible
                ? 'Fits, but costs more'
                : 'Ruled out';
          return (
            <li key={e.planId} style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--txt)' }}>
              <strong>{e.planName}</strong>
              <span style={{ color: 'var(--mut)' }}>
                {' '}
                &middot; {verdict}
                {e.yearlyCost !== null ? ` · ${money.show(e.yearlyCost)} a year` : e.custom ? ' · no published price' : ''}
              </span>
              {!e.eligible && !e.custom && e.reasons.length > 0 && !chosen ? (
                <div style={{ color: 'var(--mut)' }}>{e.reasons.join(' ')}</div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function ResultCard({
  result,
  money,
  affiliateLink,
  onCtaClick,
}: {
  result: VendorResult;
  money: Money;
  affiliateLink?: string;
  onCtaClick?: VoiceCalculatorProps['onCtaClick'];
}) {
  const p = result.plan;
  const confirmed = result.confidence === 'vendor-page';
  const hasPrice = result.status === 'recommended' && p && p.yearlyCost !== null;

  return (
    <article
      aria-label={`${result.name} result`}
      data-calc-result={result.vendor}
      style={{ ...S.panel, display: 'flex', flexDirection: 'column', borderColor: hasPrice ? 'var(--a1-brd)' : 'var(--brd)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{result.name}</h3>
        <Badge confirmed={confirmed} />
      </div>

      <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.55, color: 'var(--txt)' }}>{result.headline}</p>

      {hasPrice && p ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a1)' }}>{p.planName} plan</div>
          <div style={{ fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {money.show(p.yearlyCost as number)}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mut)' }}> a year</span>
          </div>
          {money.currency === 'INR' ? (
            <div style={S.small}>
              List price {fmtMoney(p.yearlyCost as number)} a year, converted at {'\u20B9'}{money.rate} per US dollar
            </div>
          ) : null}
          <div style={S.small}>
            {p.monthlyPrice === 0
              ? 'Free plan'
              : `${money.show(p.monthlyPrice as number)} a month${p.billingUsed === 'annual' ? ', billed annually' : ', billed monthly'}`}
            {p.annualSavings !== null ? ` \u00B7 annual billing saves ${money.show(p.annualSavings)} a year` : ''}
          </div>
          <UsageBar plan={p} />
        </div>
      ) : null}

      {result.status === 'contact-sales' && p ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a1)' }}>{p.planName} plan</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Contact sales</div>
          <div style={S.small}>No price is published, so none is shown.</div>
        </div>
      ) : null}

      {result.status === 'no-match' ? (
        <p style={{ ...S.small, marginTop: 10 }}>
          Try lowering the cloning level, or check the list below to see which requirement ruled each plan out.
        </p>
      ) : null}

      {result.caveats.length > 0 ? (
        <ul style={{ ...S.small, margin: '14px 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
          {result.caveats.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : null}

      <PlanChecks result={result} money={money} />

      {money.currency === 'INR' ? (
        <div data-calc-india-note={result.vendor} style={{ ...S.small, marginTop: 14 }}>
          <strong style={{ color: 'var(--txt)' }}>Paying from India: </strong>
          {getIndiaNote(result.vendor) ?? NO_INDIA_NOTE}
        </div>
      ) : null}

      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px' }}>
        {affiliateLink ? (
          <a
            href={affiliateLink}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            data-calc-cta={result.vendor}
            onClick={(e) => onCtaClick?.(result.vendor, e)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '0 18px',
              boxSizing: 'border-box',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
              background: 'linear-gradient(135deg,var(--a1),var(--a2))',
              borderRadius: 10,
            }}
          >
            Check {result.name} pricing
          </a>
        ) : null}
        <a
          href={result.pricingPageUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          data-calc-vendor-page={result.vendor}
          style={{ ...S.link, fontSize: 13 }}
        >
          {result.name} official pricing page
        </a>
      </div>
      <div style={{ ...S.small, marginTop: 8 }}>Figures checked {result.checkedISO}. List prices before tax, promotions excluded.</div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The calculator
// ─────────────────────────────────────────────────────────────────────────────

export function VoiceCalculator({
  initialScenario,
  initialAssumptions = DEFAULT_ASSUMPTIONS,
  initialCurrency = 'USD',
  fxReference = USD_INR_REFERENCE,
  affiliateLinks,
  onCtaClick,
  onChange,
}: VoiceCalculatorProps) {
  const uid = useId();
  const start: VoiceScenario = { ...DEFAULT_VOICE_SCENARIO, ...initialScenario };

  // The characters and assumption boxes keep what was typed, so typing "5" on the way to "50" is never rewritten.
  const [charsRaw, setCharsRaw] = useState<string>(fmtInt(start.monthlyCharacters));
  const [commercialUse, setCommercialUse] = useState<boolean>(start.commercialUse);
  const [cloning, setCloning] = useState<CloningLevel>(start.cloning);
  const [billing, setBilling] = useState<BillingPeriod>(start.billing);
  const [creditsRaw, setCreditsRaw] = useState<string>(String(initialAssumptions.creditsPerCharacter));
  const [cpmRaw, setCpmRaw] = useState<string>(String(initialAssumptions.charactersPerMinute));
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [rateRaw, setRateRaw] = useState<string>(String(fxReference.rate));

  const scenario: VoiceScenario = { monthlyCharacters: parseCharacters(charsRaw), commercialUse, cloning, billing };
  const assumptions: ConversionAssumptions = {
    creditsPerCharacter: creditsRaw.trim() === '' ? Number.NaN : Number(creditsRaw),
    charactersPerMinute: cpmRaw.trim() === '' ? Number.NaN : Number(cpmRaw),
  };

  // INR view: an unusable rate falls back to dollars and says why, so a typo never shows a wrong rupee price.
  const rate = parseRate(rateRaw);
  const rateProblem = currency === 'INR' ? validateRate(rate) : null;
  const money = makeMoney(currency === 'INR' && !rateProblem ? 'INR' : 'USD', rate);

  const problems = useMemo(
    () => validateScenario(scenario, assumptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [charsRaw, commercialUse, cloning, billing, creditsRaw, cpmRaw],
  );
  const comparison = useMemo(
    () => (problems.length === 0 ? compareVoiceVendors(scenario, assumptions) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problems, charsRaw, commercialUse, cloning, billing, creditsRaw, cpmRaw],
  );

  // Report a change only when the values are valid, so analytics never sees half-typed input.
  const notify = (
    next: Partial<{ chars: string; c: boolean; cl: CloningLevel; b: BillingPeriod; cr: string; cp: string; cu: Currency; rr: string }>,
  ) => {
    if (!onChange) return;
    const s: VoiceScenario = {
      monthlyCharacters: parseCharacters(next.chars ?? charsRaw),
      commercialUse: next.c ?? commercialUse,
      cloning: next.cl ?? cloning,
      billing: next.b ?? billing,
    };
    const crRaw = next.cr ?? creditsRaw;
    const cpRaw = next.cp ?? cpmRaw;
    const a: ConversionAssumptions = {
      creditsPerCharacter: crRaw.trim() === '' ? Number.NaN : Number(crRaw),
      charactersPerMinute: cpRaw.trim() === '' ? Number.NaN : Number(cpRaw),
    };
    const cu = next.cu ?? currency;
    const fxRate = parseRate(next.rr ?? rateRaw);
    if (cu === 'INR' && validateRate(fxRate) !== null) return;
    if (validateScenario(s, a).length === 0) onChange(s, a, { currency: cu, fxRate });
  };

  const setChars = (v: string) => { setCharsRaw(v); notify({ chars: v }); };
  const setCommercial = (v: boolean) => { setCommercialUse(v); notify({ c: v }); };
  const setCloningLevel = (v: CloningLevel) => { setCloning(v); notify({ cl: v }); };
  const setBillingPeriod = (v: BillingPeriod) => { setBilling(v); notify({ b: v }); };
  const setCredits = (v: string) => { setCreditsRaw(v); notify({ cr: v }); };
  const setCpm = (v: string) => { setCpmRaw(v); notify({ cp: v }); };
  const setCurrencyChoice = (v: Currency) => { setCurrency(v); notify({ cu: v }); };
  const setRate = (v: string) => { setRateRaw(v); notify({ rr: v }); };
  const resetRate = () => { setRateRaw(String(fxReference.rate)); notify({ rr: String(fxReference.rate) }); };
  const rateChanged = parseRate(rateRaw) !== fxReference.rate;

  const resetAssumptions = () => {
    setCreditsRaw(String(DEFAULT_ASSUMPTIONS.creditsPerCharacter));
    setCpmRaw(String(DEFAULT_ASSUMPTIONS.charactersPerMinute));
    notify({ cr: String(DEFAULT_ASSUMPTIONS.creditsPerCharacter), cp: String(DEFAULT_ASSUMPTIONS.charactersPerMinute) });
  };

  const assumptionsChanged =
    assumptions.creditsPerCharacter !== DEFAULT_ASSUMPTIONS.creditsPerCharacter ||
    assumptions.charactersPerMinute !== DEFAULT_ASSUMPTIONS.charactersPerMinute;

  const charsValid = Number.isFinite(scenario.monthlyCharacters);
  const words = charsValid ? Math.round(scenario.monthlyCharacters / 6) : null;
  const minutes =
    charsValid && Number.isFinite(assumptions.charactersPerMinute) && assumptions.charactersPerMinute > 0
      ? scenario.monthlyCharacters / assumptions.charactersPerMinute
      : null;

  const charsId = `${uid}-chars`;
  const charsHelpId = `${uid}-chars-help`;
  const hasAffiliate = !!affiliateLinks && Object.values(affiliateLinks).some(Boolean);

  return (
    <div data-voice-calculator style={{ display: 'grid', gap: 20, fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--txt)' }}>
      {/* ── Inputs ─────────────────────────────────────────────────────── */}
      <section aria-label="Your scenario" style={S.panel}>
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label htmlFor={charsId} style={{ ...S.legend, display: 'block' }}>
              Characters of script per month
            </label>
            <input
              id={charsId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={charsRaw}
              onChange={(e) => setChars(e.target.value)}
              onBlur={() => {
                const n = parseCharacters(charsRaw);
                if (Number.isFinite(n)) setCharsRaw(fmtInt(n));
              }}
              aria-describedby={charsHelpId}
              aria-invalid={!charsValid || undefined}
              style={{ ...S.input, maxWidth: 280 }}
            />
            <div role="group" aria-label="Quick amounts" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {CHARACTER_PRESETS.map((pr) => (
                <button key={pr.value} type="button" style={S.chip} onClick={() => setChars(fmtInt(pr.value))}>
                  {pr.label}
                </button>
              ))}
            </div>
            <p id={charsHelpId} style={S.hint}>
              {words !== null && minutes !== null
                ? `About ${fmtInt(words)} words, or ${fmtDuration(minutes)} of audio a month. You can type 50k or 1.5m.`
                : 'Type a number such as 50,000, 50k or 1.5m.'}
            </p>
          </div>

          <Choice
            legend="Will the audio be published or sold?"
            name={`${uid}-commercial`}
            value={commercialUse ? 'yes' : 'no'}
            onChange={(v) => setCommercial(v === 'yes')}
            options={[
              { value: 'yes', label: 'Yes, commercial use', hint: '(ads, YouTube income, client work, products)' },
              { value: 'no', label: 'No, personal or practice' },
            ]}
          />

          <Choice
            legend="Voice cloning"
            name={`${uid}-cloning`}
            value={cloning}
            onChange={setCloningLevel}
            options={[
              { value: 'none', label: 'Not needed' },
              { value: 'instant', label: 'Instant clone', hint: '(from a short sample)' },
              { value: 'professional', label: 'Professional clone', hint: '(trained on hours of audio)' },
            ]}
          />

          <Choice
            legend="Billing"
            name={`${uid}-billing`}
            value={billing}
            onChange={setBillingPeriod}
            options={[
              { value: 'annual', label: 'Annual', hint: '(pay for the year, lower monthly price)' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />

          <Choice
            legend="Show prices in"
            name={`${uid}-currency`}
            value={currency}
            onChange={setCurrencyChoice}
            options={[
              { value: 'USD', label: 'US dollars' },
              { value: 'INR', label: 'Indian rupees', hint: '(\u20B9, converted)' },
            ]}
          />

          {currency === 'INR' ? (
            <div data-calc-fx>
              <label htmlFor={`${uid}-rate`} style={{ ...S.legend, display: 'block' }}>
                Rupees per US dollar
              </label>
              <input
                id={`${uid}-rate`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={rateRaw}
                onChange={(e) => setRate(e.target.value)}
                aria-invalid={rateProblem !== null || undefined}
                style={{ ...S.input, maxWidth: 160 }}
              />
              {rateChanged ? (
                <button type="button" style={{ ...S.chip, marginLeft: 8 }} onClick={resetRate}>
                  Use the reference rate
                </button>
              ) : null}
              <p style={S.hint}>
                Default rate: {'\u20B9'}{fxReference.rate} per US dollar, {fxReference.source}, for {fxDateLabel(fxReference.rateDateISO)}.{' '}
                <a href={fxReference.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" style={S.link}>
                  Check the current rate
                </a>
                {fxReference.confidence === 'secondary' ? ` ${FX_CONFIRMATION_NOTE}` : ''}
              </p>
              <ul style={{ ...S.small, margin: '8px 0 0', paddingLeft: 18, display: 'grid', gap: 4 }}>
                {INDIA_GENERAL_NOTES.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <details style={{ marginTop: 20 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Conversion assumptions{assumptionsChanged ? ' (changed)' : ''}
          </summary>
          <div style={{ display: 'grid', gap: 16, marginTop: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
            <div>
              <label htmlFor={`${uid}-cpc`} style={{ ...S.legend, display: 'block' }}>
                ElevenLabs credits per character
              </label>
              <input
                id={`${uid}-cpc`}
                type="text"
                inputMode="decimal"
                value={creditsRaw}
                onChange={(e) => setCredits(e.target.value)}
                style={{ ...S.input, maxWidth: 140 }}
              />
              <p style={S.hint}>{ASSUMPTION_TEXT.creditsPerCharacter}</p>
            </div>
            <div>
              <label htmlFor={`${uid}-cpm`} style={{ ...S.legend, display: 'block' }}>
                Murf characters per minute of audio
              </label>
              <input
                id={`${uid}-cpm`}
                type="text"
                inputMode="numeric"
                value={cpmRaw}
                onChange={(e) => setCpm(e.target.value)}
                style={{ ...S.input, maxWidth: 140 }}
              />
              <p style={S.hint}>{ASSUMPTION_TEXT.charactersPerMinute}</p>
            </div>
          </div>
          {assumptionsChanged ? (
            <button type="button" style={{ ...S.chip, marginTop: 12 }} onClick={resetAssumptions}>
              Reset to defaults
            </button>
          ) : null}
        </details>
      </section>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <section aria-label="Results" aria-live="polite" style={{ display: 'grid', gap: 16 }}>
        {problems.length > 0 || rateProblem ? (
          <div role="alert" style={{ ...S.panel, borderColor: '#D97706' }}>
            <strong style={{ fontSize: 14 }}>Check your inputs</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
              {[...problems, ...(rateProblem ? [`${rateProblem} Prices are shown in US dollars until it is fixed.`] : [])].map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {comparison ? (
          <>
            <div
              data-calc-summary
              style={{ ...S.panel, background: 'var(--a1-card)', borderColor: 'var(--a1-brd)' }}
            >
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.55 }}>
                {comparisonSentence(comparison.results, comparison.cheaper, comparison.yearlyDifference, money)}
              </p>
              {comparison.involvesUnconfirmedFigures ? (
                <p style={{ ...S.small, margin: '8px 0 0' }}>
                  This comparison uses Murf figures that have not yet been confirmed on murf.ai.
                </p>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
              {comparison.results.map((r) => (
                <React.Fragment key={r.vendor}>
                  <ResultCard result={r} money={money} affiliateLink={affiliateLinks?.[r.vendor]} onCtaClick={onCtaClick} />
                </React.Fragment>
              ))}
            </div>

            {hasAffiliate ? (
              <p style={{ ...S.small, margin: 0 }}>
                Some links on this page are affiliate links, and we may earn a commission if you sign up. They do not change which
                plan the calculator recommends.
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

export default VoiceCalculator;
