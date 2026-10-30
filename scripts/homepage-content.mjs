/**
 * scripts/homepage-content.mjs
 *
 * Static-HTML renderer for data/homepage-content.json (spec: docs/homepage-content-format.md).
 * Used by scripts/prerender.mjs. The React renderer (components/ContentBlocks.tsx) reads the SAME
 * JSON and the SAME inline parser (lib/content-inline.mjs), so the prerendered homepage and the
 * live homepage cannot drift. Output matches the markup that used to be hand-written in prerender.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { applyVars, tokenizeInline, stripInline } from '../lib/content-inline.mjs';

export { applyVars, stripInline };

const LINK_COLOR = '#0D9488';

// Static-HTML style presets. Variants are named in the JSON; inline CSS never is.
const SECTION_STYLE = {
  callout: 'background:#f0faf9;border-left:4px solid #0D9488;padding:16px 20px;border-radius:8px;margin-bottom:28px',
  plain: 'margin-bottom:28px',
  faq: 'margin-bottom:28px',
  spaced: 'margin-bottom:28px',
  compact: 'margin-bottom:24px',
};
const HEADING_STYLE = {
  callout: 'font-size:1.1rem;margin:0 0 10px;color:#0F1C1A',
  plain: 'font-size:1.3rem;margin:0 0 8px;color:#0F1C1A',
  faq: 'font-size:1.3rem;margin:0 0 14px;color:#0F1C1A',
  spaced: 'font-size:1.3rem;margin:0 0 10px;color:#0F1C1A',
  compact: 'font-size:1.3rem;margin:0 0 8px;color:#0F1C1A',
};
// list/orderedList looks: `list` is the <ul>/<ol> style, `li` the optional per-item style.
const LIST_STYLE = {
  callout: { list: 'margin:0;padding-left:18px;line-height:1.9;font-size:.95rem;color:#333', li: '' },
  steps: { list: 'margin:0 0 14px;padding-left:22px;line-height:1.9;font-size:.95rem;color:#444', li: 'margin-bottom:8px' },
  compact: { list: 'margin:0 0 14px;padding-left:22px;line-height:1.8;font-size:.9rem;color:#444', li: 'margin-bottom:6px' },
};
const SUBHEADING_STYLE = {
  sub: 'font-size:1.05rem;margin:16px 0 6px;color:#0F1C1A',
  subFlat: 'font-size:1.05rem;margin:0 0 6px;color:#0F1C1A',
};
const QUOTE = {
  quote: 'margin:0 0 14px;padding:14px 18px;border-left:4px solid #0D9488;background:#f7fafa;border-radius:0 8px 8px 0;font-size:.95rem;line-height:1.7;color:#333;font-style:italic',
  footer: 'margin-top:8px;font-size:.8rem;color:#666;font-style:normal',
};
const PARA_STYLE = {
  lead: 'font-size:.95rem;line-height:1.5;color:#333;margin-bottom:12px',
  body: 'font-size:.95rem;line-height:1.7;color:#444;margin-bottom:12px',
  bodyTight: 'font-size:.95rem;line-height:1.7;color:#444;margin-bottom:8px',
  bodyEnd: 'font-size:.95rem;line-height:1.7;color:#444',
  note: 'font-size:.875rem;color:#666',
  noteLoose: 'font-size:.875rem;color:#666;line-height:1.7',
  small: 'font-size:.9rem;line-height:1.7;color:#444;margin-bottom:8px',
  smallLoose: 'font-size:.9rem;line-height:1.7;color:#444;margin-bottom:10px',
  smallWide: 'font-size:.9rem;line-height:1.7;color:#444;margin-bottom:16px',
  smallEnd: 'font-size:.9rem;line-height:1.7;color:#444;margin-bottom:0',
  leadLoose: 'font-size:.95rem;line-height:1.5;color:#333;margin-bottom:14px',
  leadTight: 'font-size:.95rem;line-height:1.5;color:#333;margin-bottom:10px',
  fineprint: 'font-size:.8rem;color:#888',
  follow: 'font-size:.9rem;line-height:1.7;color:#444;margin-top:12px',
  followLg: 'font-size:.9rem;line-height:1.7;color:#444;margin-top:14px',
};
const TABLE = {
  wrap: 'overflow-x:auto;margin-bottom:12px',
  table: 'width:100%;border-collapse:collapse;font-size:.875rem',
  caption: 'text-align:left;font-size:.8rem;color:#666;padding-bottom:6px;caption-side:top',
  headRow: 'background:#0D9488;color:#fff',
  th: 'padding:8px 10px;text-align:left;font-weight:600',
  td: 'padding:8px 10px',
};
const DL = {
  dl: 'margin:0;font-size:.9rem;line-height:1.8',
  dt: 'font-weight:700;color:#0F1C1A;margin-top:12px',
  dd: 'margin-left:0;color:#444;padding:6px 12px;border-left:3px solid #0D9488;background:#fafafa;border-radius:0 4px 4px 0',
  more: 'color:#0D9488;font-size:.85rem',
};
const FAQ = {
  details: 'border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:8px',
  summary: 'font-weight:600;cursor:pointer;font-size:.95rem;color:#0F1C1A;list-style:none',
  answer: 'margin-top:10px;font-size:.9rem;line-height:1.7;color:#444',
};
const TOOL_LIST_STYLE = 'margin:0 0 14px;padding-left:20px;line-height:1.9;font-size:.95rem';

export function loadHomepageContent(root) {
  const file = path.join(root, 'data', 'homepage-content.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (json.version !== 1 || !Array.isArray(json.sections)) {
    throw new Error('homepage-content.json: expected { version: 1, sections: [...] }');
  }
  const ids = new Set();
  for (const s of json.sections) {
    if (!s.id || ids.has(s.id)) throw new Error(`homepage-content.json: missing or duplicate section id "${s.id}"`);
    ids.add(s.id);
  }
  return json;
}

// Text escaping matches what the hand-written markup did: & < > only (quotes stay raw in text).
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline markup to HTML. opts.linkWeight adds font-weight to links; opts.linkStyle replaces the link style. */
export function renderInlineHtml(text, vars, opts = {}) {
  const linkStyle = opts.linkStyle ?? `color:${LINK_COLOR}${opts.linkWeight ? `;font-weight:${opts.linkWeight}` : ''}`;
  return tokenizeInline(text, vars)
    .map(tok => {
      switch (tok.t) {
        case 'text': return escText(tok.v);
        case 'bold': return `<strong>${escText(tok.v)}</strong>`;
        case 'date': return `<time datetime="${escAttr(tok.iso)}">${escText(tok.label)}</time>`;
        case 'link':
          return tok.external
            ? `<a href="${escAttr(tok.href)}" target="_blank" rel="noopener noreferrer" style="${linkStyle}">${escText(tok.label)}</a>`
            : `<a href="${escAttr(vars.site + tok.href)}" style="${linkStyle}">${escText(tok.label)}</a>`;
      }
    })
    .join('');
}

function pick(table, key, what) {
  if (!(key in table)) throw new Error(`homepage-content: no static ${what} style for "${key}"`);
  return table[key];
}

function renderBlockHtml(block, variant, vars) {
  if (block.showIf && !vars[block.showIf]) return '';
  const inline = (t, o) => renderInlineHtml(t, vars, { linkWeight: block.linkWeight, ...o });
  switch (block.type) {
    case 'paragraph': {
      const speakable = block.speakable ? ` data-speakable="${escAttr(block.speakable)}"` : '';
      return `      <p${speakable} style="${pick(PARA_STYLE, block.variant, 'paragraph')}">${inline(block.text)}</p>`;
    }
    case 'list':
    case 'orderedList': {
      const tag = block.type === 'list' ? 'ul' : 'ol';
      const look = pick(LIST_STYLE, block.variant ?? variant, 'list');
      const items = block.items.map(i => {
        const { id, text } = typeof i === 'string' ? { id: undefined, text: i } : i;
        const attrs = `${id ? ` id="${escAttr(id)}"` : ''}${look.li ? ` style="${look.li}"` : ''}`;
        return `        <li${attrs}>${inline(text)}</li>`;
      }).join('\n');
      return `      <${tag} style="${look.list}">\n${items}\n      </${tag}>`;
    }
    case 'heading': {
      if (block.level !== 3) throw new Error('homepage-content: only level-3 heading blocks are supported');
      const id = block.id ? ` id="${escAttr(block.id)}"` : '';
      return `      <h3${id} style="${pick(SUBHEADING_STYLE, block.variant, 'heading block')}">${inline(block.text)}</h3>`;
    }
    case 'quote': {
      const cite = block.cite ? ` cite="${escAttr(vars.site + classifyInternal(block.cite))}"` : '';
      return `      <blockquote${cite} style="${QUOTE.quote}">\n        ${inline(block.text)}\n        <footer style="${QUOTE.footer}">— <cite>${inline(block.attribution)}</cite></footer>\n      </blockquote>`;
    }
    case 'toolList': {
      const tools = (vars.tools || []).slice(0, block.count);
      if (!tools.length) throw new Error('homepage-content: toolList needs vars.tools');
      const items = tools
        .map(t => `        <li><a href="${escAttr(`${vars.site}/tools/${t.slug}/`)}" style="color:#0D9488;text-decoration:none">${escText(t.name)} — ${escText(t.tagline.slice(0, 60))}</a></li>`)
        .join('\n');
      return `      <ul style="${TOOL_LIST_STYLE}">\n${items}\n      </ul>`;
    }
    case 'table': {
      const head = block.columns.map(c => `              <th style="${TABLE.th}">${inline(c)}</th>`).join('\n');
      const last = block.rows.length - 1;
      const rows = block.rows.map((row, i) => {
        const st = [i !== last ? 'border-bottom:1px solid #e5e7eb' : '', i % 2 === 1 ? 'background:#f9fafb' : ''].filter(Boolean).join(';');
        const cells = row.map(c => `              <td style="${TABLE.td}">${inline(c)}</td>`).join('\n');
        return `            <tr${st ? ` style="${st}"` : ''}>\n${cells}\n            </tr>`;
      }).join('\n');
      const caption = block.caption ? `          <caption style="${TABLE.caption}">${inline(block.caption, { linkWeight: undefined })}</caption>\n` : '';
      return `      <div style="${TABLE.wrap}">\n        <table style="${TABLE.table}">\n${caption}          <thead>\n            <tr style="${TABLE.headRow}">\n${head}\n            </tr>\n          </thead>\n          <tbody>\n${rows}\n          </tbody>\n        </table>\n      </div>`;
    }
    case 'definitionList': {
      const items = block.items.map(it => {
        const more = it.more ? `<br><a href="${escAttr(vars.site + classifyInternal(it.more.href))}" style="${DL.more}">${escText(it.more.label)}</a>` : '';
        return `        <dt style="${DL.dt}">${inline(it.term)}</dt>\n        <dd style="${DL.dd}">${inline(it.text)}${more}</dd>`;
      }).join('\n');
      return `      <dl style="${DL.dl}">\n${items}\n      </dl>`;
    }
    case 'faq': {
      const items = block.items.map(it =>
        `      <details style="${FAQ.details}">\n        <summary style="${FAQ.summary}">${inline(it.q)}</summary>\n        <p style="${FAQ.answer}">${inline(it.a)}</p>\n      </details>`).join('\n\n');
      return `\n${items}\n`;
    }
    default:
      throw new Error(`homepage-content: block type "${block.type}" is not implemented in the static renderer yet`);
  }
}

function classifyInternal(href) {
  if (!href.startsWith('/')) throw new Error(`homepage-content: "more" link must start with "/": ${href}`);
  return href;
}

/** Render one section by id to static HTML (starts at "<section", no leading indent). */
export function renderHomeSectionHtml(content, id, vars) {
  const s = content.sections.find(x => x.id === id);
  if (!s) throw new Error(`homepage-content: no section "${id}"`);
  const v = s.variant;
  const h = s.heading;
  const speakable = h.speakable ? ` data-speakable="${escAttr(h.speakable)}"` : '';
  const aria = s.ariaLabel ? ` aria-label="${escAttr(s.ariaLabel)}"` : '';
  const blocks = s.blocks.map(b => renderBlockHtml(b, v, vars)).filter(Boolean).join('\n');
  return [
    `<section id="${escAttr(s.id)}"${aria} style="${pick(SECTION_STYLE, v, 'section')}">`,
    `      <h2${speakable} style="${pick(HEADING_STYLE, v, 'heading')}">${escText(h.text)}</h2>`,
    blocks,
    `    </section>`,
  ].join('\n');
}

/** The question/answer pairs of a section's FAQ block as plain text, for FAQPage JSON-LD. */
export function faqItemsPlain(content, id, vars) {
  const s = content.sections.find(x => x.id === id);
  if (!s) throw new Error(`homepage-content: no section "${id}"`);
  const faq = s.blocks.find(b => b.type === 'faq');
  if (!faq) throw new Error(`homepage-content: section "${id}" has no faq block`);
  return faq.items.map(i => ({ q: stripInline(i.q, vars), a: stripInline(i.a, vars) }));
}

/** Table of Contents nav (T3.2). Same list drives the React ToC (components/HomeEditorialSections.tsx). */
export function renderHomeTocHtml(content) {
  const toc = content.toc;
  if (!toc || !Array.isArray(toc.items) || !toc.items.length) throw new Error('homepage-content: missing "toc" { heading, items[] }');
  const items = toc.items
    .map(i => `        <li><a href="#${escAttr(i.id)}" style="color:#0D9488">${escText(i.label)}</a></li>`)
    .join('\n');
  return [
    `<nav id="table-of-contents" aria-label="Table of Contents" style="background:#fafafa;border:1px solid #e5e7eb;padding:14px 18px;border-radius:8px;margin-bottom:28px">`,
    `      <h2 style="font-size:.95rem;font-weight:700;margin:0 0 8px;color:#0F1C1A">${escText(toc.heading)}</h2>`,
    `      <ol style="margin:0;padding-left:20px;line-height:1.9;font-size:.875rem">`,
    items,
    `      </ol>`,
    `    </nav>`,
  ].join('\n');
}
