/**
 * lib/content-inline.mjs
 *
 * Shared, dependency-free parsing of the inline markup used in data/homepage-content.json
 * (spec: docs/homepage-content-format.md). Imported by BOTH renderers:
 *   - scripts/homepage-content.mjs   (static HTML for prerender.mjs)
 *   - components/ContentBlocks.tsx   (React)
 * so link, bold, variable and date handling can never differ between them.
 * Must stay free of node: imports (it is bundled for the browser).
 */

/** True for a date variable: { iso: '2026-10-22', label: 'October 22, 2026' } */
const isDateVar = v => v !== null && typeof v === 'object' && 'iso' in v && 'label' in v;

/** Replace {{name}} for scalar variables. Date variables are left for the tokenizer. Unknown name = error. */
export function applyVars(text, vars) {
  return String(text).replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in vars)) throw new Error(`homepage-content: unknown variable {{${name}}}`);
    const v = vars[name];
    if (isDateVar(v)) return whole;
    if (v !== null && typeof v === 'object') throw new Error(`homepage-content: {{${name}}} is not a text variable`);
    return String(v);
  });
}

/** Split a link target into { href, external }. Internal targets get the site origin only in the static renderer. */
export function classifyHref(href) {
  if (/^https?:\/\//.test(href)) return { href, external: true };
  if (href.startsWith('/')) return { href, external: false };
  throw new Error(`homepage-content: link must start with "/" or "http": ${href}`);
}

/**
 * Tokenize inline markup into:
 *   { t:'text', v } | { t:'bold', v } | { t:'link', label, href, external } | { t:'date', iso, label }
 */
export function tokenizeInline(text, vars) {
  const src = applyVars(text, vars);
  const out = [];
  for (const part of src.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\{\{\w+\}\})/)) {
    if (part === '') continue;
    let m;
    if ((m = part.match(/^\*\*([^*]+)\*\*$/))) out.push({ t: 'bold', v: m[1] });
    else if ((m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/))) out.push({ t: 'link', label: m[1], ...classifyHref(m[2]) });
    else if ((m = part.match(/^\{\{(\w+)\}\}$/))) {
      const v = vars[m[1]];
      if (!isDateVar(v)) throw new Error(`homepage-content: {{${m[1]}}} cannot be used here`);
      out.push({ t: 'date', iso: v.iso, label: v.label });
    } else out.push({ t: 'text', v: part });
  }
  return out;
}

/** Plain text of an inline string (no markup), e.g. for FAQPage JSON-LD. Dates are not allowed here. */
export function stripInline(text, vars) {
  return tokenizeInline(text, vars)
    .map(tok => {
      if (tok.t === 'text' || tok.t === 'bold') return tok.v;
      if (tok.t === 'link') return tok.label;
      throw new Error('homepage-content: dates are not allowed in plain-text (schema) strings');
    })
    .join('');
}
