import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseVerdictTokens } from '../lib/blog-verdict-token';
import { TokenizedBlogContent } from '../pages/BlogPostPage';
import { renderVerdictCardHtml } from '../lib/verdict-card-ssr';

describe('blog verdict tokens', () => {
  it('preserves surrounding HTML and parses a verified token', () => {
    expect(parseVerdictTokens('<p>Before</p>{{verdict:elevenlabs}}<p>After</p>')).toEqual([
      { type: 'html', value: '<p>Before</p>' },
      { type: 'verdict', value: 'elevenlabs' },
      { type: 'html', value: '<p>After</p>' },
    ]);
  });

  it('rejects a token without verified facts', () => {
    expect(() => parseVerdictTokens('{{verdict:grammarly}}')).toThrow('Invalid verdict token');
  });

  it('renders the same card marker and content as the SSR source', () => {
    const live = renderToStaticMarkup(
      <TokenizedBlogContent html="<p>Before</p>{{verdict:elevenlabs}}<p>After</p>" navigate={() => {}} onClick={() => {}} />,
    );
    expect(live).toContain('data-verdict-card="elevenlabs"');
    expect(live).toContain(renderVerdictCardHtml('elevenlabs'));
  });
});