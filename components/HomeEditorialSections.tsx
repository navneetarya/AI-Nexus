/**
 * components/HomeEditorialSections.tsx  (T3.1)
 *
 * The homepage's editorial sections (key takeaways, how to choose, FAQ, ...) rendered in React from
 * data/homepage-content.json, the same file the prerendered static HTML is built from. Section ids match
 * the static HTML, so Table-of-Contents anchors work in both.
 *
 * Not placed in HomePage.tsx yet (T3.2). Usage there:
 *   <HomeEditorialSections C={C} isDark={isDark} navigate={navigate} tools={TOOLS} />
 *
 * Sections already built in React under other headings (start-here, compare-tools, ai-blog-guides) are not in the JSON.
 */
import React from 'react';
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
