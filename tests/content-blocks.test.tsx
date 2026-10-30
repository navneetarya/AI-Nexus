import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContentSection } from '../components/ContentBlocks';
import { loadHomepageContent, renderHomeSectionHtml, faqItemsPlain } from '../scripts/homepage-content.mjs';

const vars = {
  site: 'https://ainexustools.online', toolCount: 81, year: 2026, pricingToolCount: 14,
  homeDate: { iso: '2026-10-27', label: 'October 27, 2026' },
  pricingDate: { iso: '2026-10-22', label: 'October 22, 2026' },
  tools: [] as any[],
};
vars.tools = Array.from({ length: 8 }, (_, i) => ({ slug: `tool-${i}`, name: `Tool ${i}`, tagline: 'A tagline & more '.repeat(6) }));
const C = new Proxy({}, { get: () => 'var(--x)' }) as Record<string, string>;

/** Tags -> space, entities decoded, whitespace collapsed. Same tag structure on both sides => same text. */
const text = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim();

const content = loadHomepageContent(process.cwd());

describe('static and React renderers show the same content', () => {
  for (const section of content.sections) {
    it(`section "${section.id}": same text and same links`, () => {
      const staticHtml = renderHomeSectionHtml(content, section.id, vars);
      const reactHtml = renderToStaticMarkup(
        <ContentSection section={section} vars={vars as any} tools={vars.tools} C={C} isDark={false} />);
      expect(text(reactHtml)).toBe(text(staticHtml));
      const hrefs = (h: string) => [...h.matchAll(/href="([^"]+)"/g)].map(m => m[1].replace(vars.site, ''));
      expect(hrefs(reactHtml).map(h => h.replace(/&amp;/g, '&'))).toEqual(hrefs(staticHtml).map(h => h.replace(/&amp;/g, '&')));
      expect(reactHtml).toContain(`id="${section.id}"`);
    });
  }
});

describe('FAQ markup matches the visible FAQ', () => {
  it('schema list has exactly the visible questions', () => {
    const items = faqItemsPlain(content, 'faq', vars);
    const faq = content.sections.find((s: any) => s.id === 'faq').blocks[0];
    expect(items.length).toBe(faq.items.length);
    const html = renderHomeSectionHtml(content, 'faq', vars);
    expect((html.match(/<details/g) || []).length).toBe(items.length);
    for (const it of items) expect(text(html)).toContain(it.q);
  });
});
