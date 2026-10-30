import { describe, it, expect } from 'vitest';
import { applyVars, renderInlineHtml, renderHomeSectionHtml, loadHomepageContent } from '../scripts/homepage-content.mjs';

const ctx = { site: 'https://ainexustools.online', author: 'Navneet Arya', toolCount: 81, pricingToolCount: 14, year: 2026,
  homeDate: { iso: '2026-10-27', label: 'October 27, 2026' }, pricingDate: { iso: '2026-10-22', label: 'October 22, 2026' } };

describe('homepage-content static renderer', () => {
  it('replaces variables and rejects unknown ones', () => {
    expect(applyVars('All {{toolCount}} tools', ctx)).toBe('All 81 tools');
    expect(() => applyVars('{{nope}}', ctx)).toThrow(/unknown variable/);
  });

  it('renders inline bold, internal and external links, and escapes text', () => {
    expect(renderInlineHtml('G2 & Trustpilot', ctx)).toBe('G2 &amp; Trustpilot');
    expect(renderInlineHtml('[Rytr](/tools/rytr/)', ctx)).toBe(
      '<a href="https://ainexustools.online/tools/rytr/" style="color:#0D9488">Rytr</a>');
    expect(renderInlineHtml('[S](https://schema.org/Review)', ctx)).toContain('target="_blank" rel="noopener noreferrer"');
    expect(renderInlineHtml('**x**', ctx)).toBe('<strong>x</strong>');
    expect(() => renderInlineHtml('[bad](tools/x)', ctx)).toThrow(/must start with/);
  });

  it('renders the key-takeaways section with its id, h2 and list', () => {
    const content = loadHomepageContent(process.cwd());
    const html = renderHomeSectionHtml(content, 'key-takeaways', ctx);
    expect(html).toContain('<section id="key-takeaways"');
    expect(html).toContain('>Key Takeaways</h2>');
    expect(html).toContain('All 81 tools verified');
    expect((html.match(/<li>/g) || []).length).toBe(5);
  });

  it('fails loudly for block types the renderer does not have yet', () => {
    const content = { version: 1, sections: [{ id: 'x', ariaLabel: 'x', variant: 'callout', heading: { text: 'x' }, blocks: [{ type: 'carousel' }] }] };
    expect(() => renderHomeSectionHtml(content, 'x', ctx)).toThrow(/not implemented/);
  });
});
