import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeEditorialSections, HomeTableOfContents } from '../components/HomeEditorialSections';
import CONTENT from '../data/homepage-content.json';

const C = new Proxy({}, { get: () => 'var(--x)' }) as Record<string, string>;
const tools = Array.from({ length: 81 }, (_, i) => ({ slug: `t${i}`, name: `Tool ${i}`, tagline: 'tagline' }));

describe('HomeEditorialSections', () => {
  const html = renderToStaticMarkup(<HomeEditorialSections C={C} isDark={false} tools={tools} />);

  it('renders every section with the same ids as the static HTML, once each', () => {
    const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);
    expect(ids).toEqual(CONTENT.sections.map(s => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the inner anchors the Table of Contents and framework links rely on', () => {
    for (const id of ['step-1', 'step-2', 'step-3', 'decision-framework', 'framework-1', 'framework-2', 'framework-3', 'framework-4']) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it('has one h2 per section and no h1', () => {
    expect((html.match(/<h2/g) || []).length).toBe(CONTENT.sections.length);
    expect(html).not.toContain('<h1');
  });

  it('fills in variables (no raw {{...}} left, tool count shown)', () => {
    expect(html).not.toContain('{{');
    expect(html).toContain('All 81 tools verified');
  });

  it('renders nothing until the tool list has loaded', () => {
    expect(renderToStaticMarkup(<HomeEditorialSections C={C} isDark={false} tools={[]} />)).toBe('');
  });
});

describe('HomeTableOfContents (T3.2)', () => {
  const toc = (CONTENT as any).toc as { heading: string; items: { id: string; label: string; reactHref?: string }[] };
  const html = renderToStaticMarkup(<HomeTableOfContents C={C} tools={tools} />);

  it('lists every item of the shared toc with the same labels', () => {
    for (const item of toc.items) expect(html).toContain(item.label.replace(/&/g, '&amp;'));
    expect((html.match(/<li>/g) || []).length).toBe(toc.items.length);
  });

  it('every hash link points at a section id: a JSON section, or an id HomePage.tsx defines', () => {
    const sectionIds = new Set((CONTENT as any).sections.map((s: any) => s.id));
    const reactOnly = new Set(['start-here', 'compare-tools']); // ids on the React sections in pages/HomePage.tsx
    for (const item of toc.items) {
      if (item.reactHref) continue;
      expect(sectionIds.has(item.id) || reactOnly.has(item.id), item.id).toBe(true);
    }
  });

  it('items with reactHref link to that page instead of a hash', () => {
    for (const item of toc.items.filter(i => i.reactHref)) expect(html).toContain(`href="${item.reactHref}"`);
  });

  it('has one h2 and renders nothing until the tool list has loaded', () => {
    expect((html.match(/<h2/g) || []).length).toBe(1);
    expect(renderToStaticMarkup(<HomeTableOfContents C={C} tools={[]} />)).toBe('');
  });
});
