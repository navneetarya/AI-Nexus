/**
 * scripts/category-content.mjs  (T5.3)
 *
 * Static-HTML renderer for data/category-content.json: the editorial sections of the eight category pages
 * (/best-ai-writing-tools/ etc.): key takeaways, how we researched, landscape / comparison / use-case,
 * a closer look at each tool, pricing at a glance, common mistakes and the FAQ.
 *
 * Used by scripts/prerender.mjs. The React category page (components/CategoryEditorial.tsx) reads the SAME
 * JSON and the SAME inline parser (lib/content-inline.mjs), so the prerendered page and the live page
 * cannot drift. tests/category-editorial.test.tsx fails if their text or links ever differ.
 *
 * Inline markup is the same as the homepage JSON: [label](https://...) links, nothing else.
 */
import fs from 'node:fs';
import path from 'node:path';
import { tokenizeInline, stripInline } from '../lib/content-inline.mjs';

export { stripInline };

// Same escaping as prerender.mjs `esc` (quotes escaped) and as the old raw-HTML copy (quotes left alone).
const escAll = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SECTION_KEYS = ['takeaways', 'intro', 'deepdive', 'pricing', 'mistakes', 'faqs'];

export function loadCategoryContent(root) {
  const file = path.join(root, 'data', 'category-content.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (json.version !== 1 || !json.categories || !json.shared?.citation) {
    throw new Error('category-content.json: expected { version: 1, shared: { citation }, categories: {...} }');
  }
  for (const [slug, cat] of Object.entries(json.categories)) {
    for (const key of SECTION_KEYS) {
      if (!Array.isArray(cat[key]) || cat[key].length === 0) throw new Error(`category-content.json: ${slug}.${key} must be a non-empty list`);
    }
    for (const b of cat.intro) {
      if (!['paragraph', 'h2', 'h3'].includes(b.type)) throw new Error(`category-content.json: ${slug}.intro has unknown block type "${b.type}"`);
    }
  }
  return json;
}

/** Inline markup to HTML. Only text and links exist in this JSON. Quotes in text stay raw unless escQuotes. */
export function categoryInlineHtml(text, { escQuotes = false } = {}) {
  const esc = escQuotes ? escAll : escText;
  return tokenizeInline(text, {})
    .map(tok => {
      if (tok.t === 'text') return esc(tok.v);
      if (tok.t === 'link') {
        const rel = tok.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escAll(tok.href)}"${rel}>${esc(tok.label)}</a>`;
      }
      throw new Error(`category-content: "${tok.t}" markup is not supported in category content`);
    })
    .join('');
}

/** The Stanford AI Index paragraph that follows the intro (also used by the blog index page). */
export function renderCitationHtml(content) {
  return `<p style="font-size:.9rem;line-height:1.7;color:#444;margin-top:14px">${categoryInlineHtml(content.shared.citation)}</p>`;
}

export function renderCategoryTakeawaysHtml(content, slug) {
  const items = content.categories[slug]?.takeaways;
  if (!items) return '';
  return `<div style="margin-top:16px;padding:14px 18px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px">
        <h2 style="font-size:1rem;font-weight:700;color:#0D9488;margin-bottom:8px">Key takeaways</h2>
        <ul style="margin:0;padding-left:18px;font-size:.9rem;line-height:1.7;color:#333">
          ${items.map(t => `<li>${categoryInlineHtml(t)}</li>`).join('')}
        </ul>
      </div>`;
}

export function renderCategoryIntroHtml(content, slug) {
  const blocks = content.categories[slug]?.intro;
  if (!blocks) return '';
  return `<div style="margin-top:16px">` +
    blocks.map(b => {
      const html = categoryInlineHtml(b.text);
      if (b.type === 'h3') return `<h3 style="font-size:1rem;font-weight:600;margin-top:20px;margin-bottom:8px;color:#222">${html}</h3>`;
      if (b.type === 'h2') return `<h2 style="font-size:1.15rem;font-weight:700;margin-top:26px;margin-bottom:10px;color:#111">${html}</h2>`;
      return `<p style="font-size:.95rem;line-height:1.75;color:#444;margin-bottom:12px">${html}</p>`;
    }).join('') +
    renderCitationHtml(content) +
    `</div>`;
}

export function renderCategoryDeepdiveHtml(content, slug) {
  const items = content.categories[slug]?.deepdive;
  if (!items) return '';
  return `<div style="margin-top:22px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:10px;color:#111">A closer look at each tool</h2>
    ${items.map(t => `<h3 style="font-size:1rem;font-weight:600;margin-top:16px;margin-bottom:6px;color:#222">${categoryInlineHtml(t.name, { escQuotes: true })}</h3><p style="font-size:.9rem;line-height:1.75;color:#444">${categoryInlineHtml(t.text, { escQuotes: true })}</p>`).join('')}
  </div>`;
}

export function renderCategoryPricingHtml(content, slug) {
  const rows = content.categories[slug]?.pricing;
  if (!rows) return '';
  return `<div style="margin-top:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:10px;color:#111">Pricing at a glance</h2>
    <table style="width:100%;border-collapse:collapse;font-size:.88rem">
      <thead><tr style="border-bottom:2px solid #e2e8f0;text-align:left">
        <th style="padding:6px 8px">Tool</th><th style="padding:6px 8px">Starting price</th><th style="padding:6px 8px">Best for</th>
      </tr></thead>
      <tbody>
        ${rows.map(r => `<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:6px 8px;font-weight:600">${escAll(r.name)}</td><td style="padding:6px 8px">${escAll(r.price)}</td><td style="padding:6px 8px;color:#555">${escAll(r.bestFor)}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

export function renderCategoryMistakesHtml(content, slug) {
  const items = content.categories[slug]?.mistakes;
  if (!items) return '';
  return `<div style="margin-top:22px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:10px;color:#111">Common mistakes to avoid</h2>
    <ul style="margin:0;padding-left:18px;font-size:.9rem;line-height:1.75;color:#444">
      ${items.map(m => `<li style="margin-bottom:6px">${escAll(m)}</li>`).join('')}
    </ul>
  </div>`;
}

export function renderCategoryFaqHtml(content, slug) {
  const faqs = content.categories[slug]?.faqs;
  if (!faqs) return '';
  return `<div style="margin-top:26px"><h2 style="font-size:1.15rem;font-weight:700;margin-bottom:10px;color:#111">Frequently asked questions</h2>` +
    faqs.map(f => `<h3 style="font-size:1rem;font-weight:600;margin-top:14px;margin-bottom:4px;color:#222">${categoryInlineHtml(f.q, { escQuotes: true })}</h3><p style="font-size:.9rem;line-height:1.7;color:#555">${categoryInlineHtml(f.a)}</p>`).join('') +
    `</div>`;
}

/** FAQ as plain { q, a } for the FAQPage JSON-LD: exactly the questions the page shows. */
export function categoryFaqItemsPlain(content, slug) {
  const faqs = content.categories[slug]?.faqs;
  if (!faqs) return null;
  return faqs.map(f => ({ q: f.q, a: stripInline(f.a, {}) }));
}
