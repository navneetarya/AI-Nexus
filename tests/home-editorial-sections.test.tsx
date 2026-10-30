import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeEditorialSections } from '../components/HomeEditorialSections';
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
