/**
 * components/ContentBlocks.tsx  (T1.3)
 *
 * React renderer for data/homepage-content.json (spec: docs/homepage-content-format.md).
 * The static renderer (scripts/homepage-content.mjs) reads the SAME JSON and the SAME inline
 * parser (lib/content-inline.mjs), so the prerendered homepage and the live homepage cannot drift.
 *
 * Colours come from the page palette `C` (CSS variables), so light and dark mode follow the theme.
 * Internal links use `navigate` when given (client-side routing) and fall back to plain anchors.
 */
import React from 'react';
import { tokenizeInline } from '../lib/content-inline.mjs';

export type Palette = Record<string, string>;
export type DateVar = { iso: string; label: string };
export interface ContentVars {
  site: string;
  toolCount: number;
  year: number;
  pricingToolCount: number;
  homeDate: DateVar;
  pricingDate: DateVar;
  [key: string]: unknown;
}
export interface ToolLite { slug: string; name: string; tagline: string }

export type Block =
  | { type: 'paragraph'; variant: string; text: string; speakable?: string; showIf?: string; linkWeight?: number }
  | { type: 'list' | 'orderedList'; items: string[]; showIf?: string; linkWeight?: number }
  | { type: 'toolList'; count: number; showIf?: string }
  | { type: 'table'; caption?: string; columns: string[]; rows: string[][]; linkWeight?: number; showIf?: string }
  | { type: 'definitionList'; items: { term: string; text: string; more?: { label: string; href: string } }[]; showIf?: string }
  | { type: 'faq'; items: { q: string; a: string }[]; showIf?: string };

export interface Section {
  id: string;
  ariaLabel?: string;
  variant: string;
  heading: { text: string; speakable?: string };
  blocks: Block[];
}

interface Ctx {
  vars: ContentVars;
  tools?: ToolLite[];
  C: Palette;
  isDark: boolean;
  navigate?: (to: string) => void;
}

function Inline({ text, ctx, linkWeight }: { text: string; ctx: Ctx; linkWeight?: number }) {
  const { C, navigate } = ctx;
  const linkStyle: React.CSSProperties = { color: C.a1, ...(linkWeight ? { fontWeight: linkWeight } : {}) };
  return (
    <>
      {tokenizeInline(text, ctx.vars).map((tok: any, i: number) => {
        switch (tok.t) {
          case 'bold': return <strong key={i}>{tok.v}</strong>;
          case 'date': return <time key={i} dateTime={tok.iso}>{tok.label}</time>;
          case 'link':
            return tok.external
              ? <a key={i} href={tok.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{tok.label}</a>
              : <a key={i} href={tok.href} style={linkStyle}
                   onClick={navigate ? (e => { e.preventDefault(); navigate(tok.href); }) : undefined}>{tok.label}</a>;
          default: return <React.Fragment key={i}>{tok.v}</React.Fragment>;
        }
      })}
    </>
  );
}

const sectionStyle = (variant: string, C: Palette): React.CSSProperties => {
  const base: React.CSSProperties = { marginBottom: 28, scrollMarginTop: 80 };
  if (variant === 'callout') {
    return { ...base, background: C.a1card, borderLeft: `4px solid ${C.a1}`, padding: '16px 20px', borderRadius: 8 };
  }
  if (variant === 'plain' || variant === 'faq') return base;
  throw new Error(`ContentBlocks: unknown section variant "${variant}"`);
};

const headingStyle = (variant: string, C: Palette): React.CSSProperties => {
  const base: React.CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, color: C.txt, lineHeight: 1.25 };
  if (variant === 'callout') return { ...base, fontSize: '1.1rem', margin: '0 0 10px' };
  if (variant === 'faq') return { ...base, fontSize: '1.3rem', margin: '0 0 14px' };
  return { ...base, fontSize: '1.3rem', margin: '0 0 8px' };
};

const paraStyle = (variant: string, C: Palette): React.CSSProperties => {
  const body: React.CSSProperties = { fontSize: '.95rem', lineHeight: 1.7, color: C.mut };
  switch (variant) {
    case 'lead': return { fontSize: '.95rem', lineHeight: 1.5, color: C.txt, marginBottom: 12 };
    case 'body': return { ...body, marginBottom: 12 };
    case 'bodyTight': return { ...body, marginBottom: 8 };
    case 'bodyEnd': return body;
    case 'note': return { fontSize: '.875rem', color: C.mut2 };
    case 'fineprint': return { fontSize: '.8rem', color: C.mut2 };
    case 'follow': return { fontSize: '.9rem', lineHeight: 1.7, color: C.mut, marginTop: 12 };
    case 'followLg': return { fontSize: '.9rem', lineHeight: 1.7, color: C.mut, marginTop: 14 };
    default: throw new Error(`ContentBlocks: unknown paragraph variant "${variant}"`);
  }
};

function BlockView({ block, variant, ctx }: { block: Block; variant: string; ctx: Ctx }) {
  const { C, isDark, vars } = ctx;
  if (block.showIf && !vars[block.showIf]) return null;
  switch (block.type) {
    case 'paragraph':
      return (
        <p data-speakable={block.speakable} style={paraStyle(block.variant, C)}>
          <Inline text={block.text} ctx={ctx} linkWeight={block.linkWeight} />
        </p>
      );
    case 'list':
    case 'orderedList': {
      const Tag = block.type === 'list' ? 'ul' : 'ol';
      const style: React.CSSProperties = variant === 'callout'
        ? { margin: 0, paddingLeft: 18, lineHeight: 1.9, fontSize: '.95rem', color: C.mut }
        : { margin: '0 0 14px', paddingLeft: 20, lineHeight: 1.9, fontSize: '.95rem', color: C.mut };
      return <Tag style={style}>{block.items.map((t, i) => <li key={i}><Inline text={t} ctx={ctx} linkWeight={block.linkWeight} /></li>)}</Tag>;
    }
    case 'toolList': {
      const tools = (ctx.tools ?? []).slice(0, block.count);
      return (
        <ul style={{ margin: '0 0 14px', paddingLeft: 20, lineHeight: 1.9, fontSize: '.95rem' }}>
          {tools.map(t => (
            <li key={t.slug}>
              <a href={`/tools/${t.slug}/`} style={{ color: C.a1, textDecoration: 'none' }}
                 onClick={ctx.navigate ? (e => { e.preventDefault(); ctx.navigate!(`/tools/${t.slug}/`); }) : undefined}>
                {t.name} — {t.tagline.slice(0, 60)}
              </a>
            </li>
          ))}
        </ul>
      );
    }
    case 'table': {
      const last = block.rows.length - 1;
      const stripe = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb';
      const border = `1px solid ${C.a1brd}`;
      return (
        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', color: C.txt }}>
            {block.caption && (
              <caption style={{ textAlign: 'left', fontSize: '.8rem', color: C.mut2, paddingBottom: 6, captionSide: 'top' }}>
                <Inline text={block.caption} ctx={ctx} />
              </caption>
            )}
            <thead>
              <tr style={{ background: '#0D9488', color: '#fff' }}>
                {block.columns.map((c, i) => <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}><Inline text={c} ctx={ctx} /></th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} style={{ ...(ri !== last ? { borderBottom: border } : {}), ...(ri % 2 === 1 ? { background: stripe } : {}) }}>
                  {row.map((c, ci) => <td key={ci} style={{ padding: '8px 10px' }}><Inline text={c} ctx={ctx} linkWeight={block.linkWeight} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'definitionList':
      return (
        <dl style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.8 }}>
          {block.items.map((it, i) => (
            <React.Fragment key={i}>
              <dt style={{ fontWeight: 700, color: C.txt, marginTop: 12 }}><Inline text={it.term} ctx={ctx} /></dt>
              <dd style={{ marginLeft: 0, color: C.mut, padding: '6px 12px', borderLeft: `3px solid ${C.a1}`, background: C.a1card, borderRadius: '0 4px 4px 0' }}>
                <Inline text={it.text} ctx={ctx} />
                {it.more && (
                  <>
                    <br />
                    <a href={it.more.href} style={{ color: C.a1, fontSize: '.85rem' }}
                       onClick={ctx.navigate ? (e => { e.preventDefault(); ctx.navigate!(it.more!.href); }) : undefined}>{it.more.label}</a>
                  </>
                )}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      );
    case 'faq':
      return (
        <>
          {block.items.map((it, i) => (
            <details key={i} style={{ border: `1px solid ${C.a1brd}`, borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '.95rem', color: C.txt, listStyle: 'none' }}><Inline text={it.q} ctx={ctx} /></summary>
              <p style={{ marginTop: 10, fontSize: '.9rem', lineHeight: 1.7, color: C.mut }}><Inline text={it.a} ctx={ctx} /></p>
            </details>
          ))}
        </>
      );
    default:
      throw new Error(`ContentBlocks: unknown block type "${(block as { type: string }).type}"`);
  }
}

/** Render a list of blocks inside a section of the given variant. */
export function ContentBlocks(props: { blocks: Block[]; variant: string } & Ctx) {
  const { blocks, variant, ...ctx } = props;
  return <>{blocks.map((b, i) => <React.Fragment key={i}><BlockView block={b} variant={variant} ctx={ctx} /></React.Fragment>)}</>;
}

/** Render one full section (<section id> + <h2> + blocks). The id matches the static HTML so Table-of-Contents anchors work. */
export function ContentSection(props: { section: Section } & Ctx) {
  const { section, ...ctx } = props;
  return (
    <section id={section.id} aria-label={section.ariaLabel} style={sectionStyle(section.variant, ctx.C)}>
      <h2 data-speakable={section.heading.speakable} style={headingStyle(section.variant, ctx.C)}>{section.heading.text}</h2>
      <ContentBlocks blocks={section.blocks} variant={section.variant} {...ctx} />
    </section>
  );
}
