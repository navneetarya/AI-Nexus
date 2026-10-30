// tests/category-editorial.test.tsx  (T5.5)
// The prerendered category pages and the React category page read the same data/category-content.json.
// These tests fail if their visible text, headings or links ever differ.
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CategoryIntroSections, CategoryDetailSections, CategoryFaq, categoryFaqPlain } from '../components/CategoryEditorial';
import {
  loadCategoryContent, renderCategoryTakeawaysHtml, renderCategoryIntroHtml, renderCategoryDeepdiveHtml,
  renderCategoryPricingHtml, renderCategoryMistakesHtml, renderCategoryFaqHtml, categoryFaqItemsPlain,
} from '../scripts/category-content.mjs';

const C = new Proxy({}, { get: () => 'var(--x)' }) as Record<string, string>;
const content = loadCategoryContent(process.cwd());
const slugs = Object.keys(content.categories);

const text = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim();
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
const h2s = (html: string) => [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(m => text(m[1]));

const staticHtml = (slug: string) =>
  renderCategoryTakeawaysHtml(content, slug) + renderCategoryIntroHtml(content, slug) +
  renderCategoryDeepdiveHtml(content, slug) + renderCategoryPricingHtml(content, slug) +
  renderCategoryMistakesHtml(content, slug) + renderCategoryFaqHtml(content, slug);
// The accordion's "+" / "−" icon is decoration (aria-hidden), not content.
const reactHtml = (slug: string) => renderToStaticMarkup(
  <>
    <CategoryIntroSections slug={slug} C={C} />
    <CategoryDetailSections slug={slug} C={C} />
    <CategoryFaq slug={slug} C={C} />
  </>).replace(/<span aria-hidden="true"[^>]*>[^<]*<\/span>/g, '');

describe('category pages: static and React renderers show the same content', () => {
  for (const slug of slugs) {
    it(`${slug}: same headings, text and links`, () => {
      const s = staticHtml(slug);
      const r = reactHtml(slug);
      expect(h2s(r)).toEqual(h2s(s));
      expect(text(r)).toBe(text(s));
      expect(hrefs(r)).toEqual(hrefs(s));
    });
  }
});

describe('category pages: structure', () => {
  it('covers all eight category routes', () => {
    expect(slugs.sort()).toEqual([
      'best-ai-audio-tools', 'best-ai-coding-tools', 'best-ai-design-tools', 'best-ai-image-tools',
      'best-ai-marketing-tools', 'best-ai-productivity-tools', 'best-ai-video-tools', 'best-ai-writing-tools',
    ]);
  });

  it('every page has key takeaways, pricing, mistakes and FAQ headings and no h1', () => {
    for (const slug of slugs) {
      const headings = h2s(reactHtml(slug));
      for (const h of ['Key takeaways', 'A closer look at each tool', 'Pricing at a glance', 'Common mistakes to avoid', 'Frequently asked questions']) {
        expect(headings, `${slug}: ${h}`).toContain(h);
      }
      expect(reactHtml(slug)).not.toContain('<h1');
    }
  });

  it('FAQPage markup lists exactly the visible questions (static and React)', () => {
    for (const slug of slugs) {
      const plain = categoryFaqItemsPlain(content, slug)!;
      expect(categoryFaqPlain(slug)).toEqual(plain);
      const html = reactHtml(slug);
      for (const f of plain) expect(text(html)).toContain(f.q);
      expect(plain.length).toBe(content.categories[slug].faqs.length);
      for (const f of plain) expect(f.a).not.toMatch(/[<>]|\]\(/); // plain text: no markup left
    }
  });

  it('external links open safely', () => {
    for (const slug of slugs) {
      for (const a of staticHtml(slug).match(/<a [^>]*>/g) ?? []) expect(a).toContain('rel="noopener noreferrer"');
      for (const a of reactHtml(slug).match(/<a [^>]*>/g) ?? []) expect(a).toContain('rel="noopener noreferrer"');
    }
  });
});
