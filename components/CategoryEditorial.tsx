/**
 * components/CategoryEditorial.tsx  (T5.4)
 *
 * The editorial sections of the category pages (/best-ai-writing-tools/ etc.) rendered in React from
 * data/category-content.json, the same file the prerendered static HTML is built from
 * (scripts/category-content.mjs). Both use the same inline parser (lib/content-inline.mjs), and
 * tests/category-editorial.test.tsx fails if the visible text or links ever differ.
 *
 * Used by pages/CategoryPage.tsx:
 *   <CategoryIntroSections slug={meta.slug} .../>   key takeaways + how we researched + landscape/comparison/use case
 *   <CategoryDetailSections slug={meta.slug} .../>  closer look at each tool + pricing at a glance + common mistakes
 *   <CategoryFaq slug={meta.slug} .../>             FAQ accordion (the FAQPage JSON-LD uses categoryFaqPlain())
 */
import React, { useState } from 'react';
import CONTENT from '../data/category-content.json';
import { stripInline, tokenizeInline } from '../lib/content-inline.mjs';

type Palette = Record<string, string>;
interface IntroBlock { type: 'paragraph' | 'h2' | 'h3'; text: string }
interface CategoryContent {
  takeaways: string[];
  intro: IntroBlock[];
  deepdive: { name: string; text: string }[];
  pricing: { name: string; price: string; bestFor: string }[];
  mistakes: string[];
  faqs: { q: string; a: string }[];
}

const categories = CONTENT.categories as unknown as Record<string, CategoryContent>;
const citation = CONTENT.shared.citation;

/** FAQ as plain { q, a }, for the FAQPage JSON-LD: exactly the questions the page shows. */
export function categoryFaqPlain(slug: string): { q: string; a: string }[] {
  return (categories[slug]?.faqs ?? []).map(f => ({ q: f.q, a: stripInline(f.a, {}) }));
}

function Inline({ text, C, navigate }: { text: string; C: Palette; navigate?: (to: string) => void }) {
  return (
    <>
      {tokenizeInline(text, {}).map((tok: any, i: number) => {
        if (tok.t === 'link') {
          return tok.external
            ? <a key={i} href={tok.href} target="_blank" rel="noopener noreferrer" style={{ color: C.a1 }}>{tok.label}</a>
            : <a key={i} href={tok.href} style={{ color: C.a1 }}
                 onClick={navigate ? (e => { e.preventDefault(); navigate(tok.href); }) : undefined}>{tok.label}</a>;
        }
        return <React.Fragment key={i}>{tok.v}</React.Fragment>;
      })}
    </>
  );
}

interface Props { slug: string; C: Palette; navigate?: (to: string) => void }

const FONT = "'Inter',sans-serif";
const h2Style = (C: Palette): React.CSSProperties => ({ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.txt, margin: '0 0 14px' });
const h3Style = (C: Palette): React.CSSProperties => ({ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.txt, margin: '18px 0 6px' });
const pStyle = (C: Palette): React.CSSProperties => ({ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: '0 0 10px' });

/** Key takeaways, then the intro blocks (how we researched, landscape, comparison / use case) and the citation. */
export function CategoryIntroSections({ slug, C, navigate }: Props) {
  const cat = categories[slug];
  if (!cat) return null;
  return (
    <div data-category-editorial="intro">
      <section style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderLeft: `4px solid ${C.a1}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <h2 style={{ ...h2Style(C), fontSize: 16, marginBottom: 8 }}>Key takeaways</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: C.txt }}>
          {cat.takeaways.map((t, i) => <li key={i}><Inline text={t} C={C} navigate={navigate} /></li>)}
        </ul>
      </section>
      <section style={{ background: C.surf, border: `1px solid ${C.barBrd}`, borderRadius: 16, padding: '24px 28px' }}>
        {cat.intro.map((b, i) => {
          const inner = <Inline text={b.text} C={C} navigate={navigate} />;
          if (b.type === 'h2') return <h2 key={i} style={{ ...h2Style(C), fontSize: 18, margin: i === 0 ? '0 0 10px' : '24px 0 10px' }}>{inner}</h2>;
          if (b.type === 'h3') return <h3 key={i} style={h3Style(C)}>{inner}</h3>;
          return <p key={i} style={pStyle(C)}>{inner}</p>;
        })}
        <p style={{ ...pStyle(C), fontSize: 13, color: C.mut, marginTop: 14, marginBottom: 0 }}>
          <Inline text={citation} C={C} navigate={navigate} />
        </p>
      </section>
    </div>
  );
}

/** A closer look at each tool, pricing at a glance and common mistakes. */
export function CategoryDetailSections({ slug, C, navigate }: Props) {
  const cat = categories[slug];
  if (!cat) return null;
  const cell: React.CSSProperties = { padding: '8px 10px', textAlign: 'left' };
  return (
    <div data-category-editorial="details">
      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style(C)}>A closer look at each tool</h2>
        {cat.deepdive.map((t, i) => (
          <React.Fragment key={i}>
            <h3 style={h3Style(C)}><Inline text={t.name} C={C} navigate={navigate} /></h3>
            <p style={pStyle(C)}><Inline text={t.text} C={C} navigate={navigate} /></p>
          </React.Fragment>
        ))}
      </section>
      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style(C)}>Pricing at a glance</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: C.txt }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.barBrd}` }}>
                <th style={cell}>Tool</th><th style={cell}>Starting price</th><th style={cell}>Best for</th>
              </tr>
            </thead>
            <tbody>
              {cat.pricing.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.barBrd}` }}>
                  <td style={{ ...cell, fontWeight: 600 }}>{r.name}</td>
                  <td style={cell}>{r.price}</td>
                  <td style={{ ...cell, color: C.mut }}>{r.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style(C)}>Common mistakes to avoid</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.75, color: C.txt }}>
          {cat.mistakes.map((m, i) => <li key={i} style={{ marginBottom: 6 }}>{m}</li>)}
        </ul>
      </section>
    </div>
  );
}

/**
 * FAQ accordion. Every answer stays in the DOM (hidden until opened), so the text on the page always
 * matches the FAQPage JSON-LD and the static HTML.
 */
export function CategoryFaq({ slug, C, navigate }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const cat = categories[slug];
  if (!cat) return null;
  return (
    <section data-category-editorial="faq">
      <h2 style={h2Style(C)}>Frequently asked questions</h2>
      {cat.faqs.map((f, i) => {
        const open = openIdx === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${C.barBrd}` }}>
            <h3 style={{ margin: 0, fontSize: 14 }}>
              <button
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                aria-controls={`${slug}-faq-${i}`}
                style={{
                  width: '100%', textAlign: 'left', padding: '18px 0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', gap: 12,
                  fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.txt,
                }}
              >
                <span>{f.q}</span>
                <span aria-hidden="true" style={{ color: C.a1, fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{open ? '−' : '+'}</span>
              </button>
            </h3>
            <p id={`${slug}-faq-${i}`} hidden={!open} style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: '0 0 18px' }}>
              <Inline text={f.a} C={C} navigate={navigate} />
            </p>
          </div>
        );
      })}
    </section>
  );
}
