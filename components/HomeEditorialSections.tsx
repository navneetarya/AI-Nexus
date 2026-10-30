/**
 * components/HomeEditorialSections.tsx  (T3.1)
 *
 * The homepage's editorial sections (key takeaways, how to choose, FAQ, ...) rendered in React from
 * data/homepage-content.json, the same file the prerendered static HTML is built from. Section ids match
 * the static HTML, so Table-of-Contents anchors work in both.
 *
 * Placed in HomePage.tsx (T3.2) after "Popular Comparisons", with the shared Table of Contents above it:
 *   <HomeTableOfContents C={C} navigate={navigate} tools={TOOLS} />
 *   <HomeEditorialSections C={C} isDark={isDark} navigate={navigate} tools={TOOLS} />
 *
 * Sections already built in React under other headings (start-here, compare-tools, ai-blog-guides) are not in the JSON.
 */
import React, { useEffect } from 'react';
import CONTENT from '../data/homepage-content.json';
import { SITE_CONFIG } from '../site-config';
import { PRICING_SNAPSHOT } from '../lib/pricing-data';
import { ContentSection, type ContentVars, type Palette, type Section, type ToolLite } from './ContentBlocks';

/** Same format the static build uses for its date labels, e.g. "October 23, 2026". */
const dateLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

interface Props {
  C: Palette;
  isDark: boolean;
  tools: ToolLite[];
  navigate?: (to: string) => void;
}

export function HomeEditorialSections({ C, isDark, tools, navigate }: Props) {
  // Wait for the tool list: "All {{toolCount}} tools" must never flash "0".
  if (!tools.length) return null;

  const vars: ContentVars = {
    site: SITE_CONFIG.siteUrl,
    author: SITE_CONFIG.authorName,
    toolCount: tools.length,
    year: new Date().getFullYear(),
    pricingToolCount: PRICING_SNAPSHOT.tools.length,
    homeDate: { iso: CONTENT.updated, label: dateLabel(CONTENT.updated) },
    pricingDate: { iso: PRICING_SNAPSHOT.snapshotISO, label: dateLabel(PRICING_SNAPSHOT.snapshotISO) },
  };

  return (
    <div id="home-editorial" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {(CONTENT.sections as unknown as Section[]).map(section => (
        <React.Fragment key={section.id}>
          <ContentSection section={section} vars={vars} tools={tools} C={C} isDark={isDark} navigate={navigate} />
        </React.Fragment>
      ))}
    </div>
  );
}

interface TocItem { id: string; label: string; reactHref?: string }

/**
 * Table of Contents. Same list as the static HTML (data/homepage-content.json "toc").
 * #start-here and #compare-tools are ids on the React sections in HomePage.tsx; an item with
 * "reactHref" (the blog guides, which have no React section of their own) links to that page instead.
 */
export function HomeTableOfContents({ C, tools, navigate }: { C: Palette; tools: ToolLite[]; navigate?: (to: string) => void }) {
  // Opening the page with a #section link: scroll once the sections exist (they render after the tool list loads).
  const ready = tools.length > 0;
  useEffect(() => {
    if (!ready || typeof window === 'undefined' || !window.location.hash) return;
    const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [ready]);

  if (!ready) return null;
  const toc = CONTENT.toc as { heading: string; items: TocItem[] };
  return (
    <>
      <style>{'#start-here,#compare-tools,#home-editorial section{scroll-margin-top:84px}'}</style>
      <nav id="table-of-contents" aria-label={toc.heading}
        style={{ maxWidth: 800, margin: '24px auto 0', padding: '0 16px', boxSizing: 'border-box' }}>
        <div style={{ background: C.surf, border: '1px solid var(--brd-xs)', borderRadius: 10, padding: '14px 18px' }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt, margin: '0 0 8px' }}>{toc.heading}</h2>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 14 }}>
            {toc.items.map(item => {
              const internal = item.reactHref && navigate;
              return (
                <li key={item.id}>
                  <a
                    href={item.reactHref ?? `#${item.id}`}
                    style={{ color: C.a1 }}
                    onClick={internal ? (e) => { e.preventDefault(); navigate!(item.reactHref!); } : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
