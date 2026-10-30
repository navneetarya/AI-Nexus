// tests/check-sections.test.ts  (T6.1) - the guardrail in scripts/check-homepage-sections.mjs
import { describe, it, expect } from 'vitest';
import { homepageProblems, categoryProblems, HOME_ALLOW_LIST } from '../scripts/check-homepage-sections.mjs';

const page = (ids: string[]) => ids.map(id => `<section id="${id}"><h2>x</h2></section>`).join('');

describe('homepage section check', () => {
  const json = ['key-takeaways', 'faq'];
  it('passes when every static section is in the JSON or allow-listed', () => {
    expect(homepageProblems(page(['key-takeaways', 'start-here', 'faq']), json)).toEqual([]);
  });
  it('fails when a section exists only in the static HTML (added in prerender.mjs only)', () => {
    const p = homepageProblems(page(['key-takeaways', 'brand-new', 'faq']), json);
    expect(p).toHaveLength(1);
    expect(p[0]).toContain('brand-new');
  });
  it('fails when a JSON section is missing from the static HTML', () => {
    expect(homepageProblems(page(['key-takeaways']), json).join()).toContain('"faq"');
  });
  it('keeps the allow-list short', () => {
    expect(HOME_ALLOW_LIST).toEqual(['start-here', 'compare-tools', 'ai-blog-guides']);
  });
});

describe('category page check', () => {
  const cat = { intro: [{ type: 'paragraph', text: 'a' }, { type: 'h2', text: 'How we researched [x](https://e.com/)' }] };
  const h = (...t: string[]) => t.map(x => `<h2 style="a">${x}</h2>`).join('');
  const full = ['Key takeaways', 'How we researched x', 'A closer look at each tool', 'Pricing at a glance', 'Common mistakes to avoid', 'Frequently asked questions'];
  it('passes when the headings are exactly the JSON-driven ones', () => {
    expect(categoryProblems('s', h(...full), cat)).toEqual([]);
  });
  it('fails on a heading that exists only in the static HTML', () => {
    expect(categoryProblems('s', h(...full, 'Extra'), cat).join()).toContain('Extra');
  });
  it('fails when a JSON heading is missing from the static HTML', () => {
    expect(categoryProblems('s', h(...full.slice(1)), cat).join()).toContain('Key takeaways');
  });
});
