// pages/BlogPostPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
// Shield icon removed — T1.7 author strip now uses plain "About the reviewer →" anchor
import { SharedNav } from './SharedNav';
import type { BlogPost } from '../blog/types';
import { SITE_CONFIG, TOOLS } from '../constants';
import { BeehiivForm } from '../components/BeehiivForm';

// ── W3-T16: Related tool reviews per blog post ─────────────────────────────
// Maps each blog slug → up to 3 tool slugs to surface as "Related Reviews"
// at the bottom of the post. Distributes PageRank from high-traffic blog posts
// to individual tool review pages. Keep the most relevant tools first.
const BLOG_RELATED_TOOLS: Record<string, string[]> = {
  'best-ai-writing-tools-for-beginners-2026':        ['grammarly', 'rytr', 'writesonic'],
  'best-ai-tools-for-freelancers-2026':              ['rytr', 'grammarly', 'notion-ai'],
  'best-grammarly-alternatives':                     ['quillbot', 'writesonic', 'rytr'],
  'best-podcastle-alternatives':                     ['podcastle', 'descript', 'murf-ai'],
  'best-notion-ai-alternatives-2026':                ['notion-ai', 'taskade', 'replit'],
  'best-invideo-alternatives-2026':                  ['invideo', 'opus-clip', 'pictory'],
  'best-ai-tools-for-social-media-2026':             ['ocoya', 'canva-ai', 'rytr'],
  'how-to-use-rytr-to-write-blog-posts':             ['rytr', 'grammarly', 'writesonic'],
  'ai-tools-for-students-free-2026':                 ['grammarly', 'quillbot', 'gamma'],
  'best-ai-podcast-tools-2026':                      ['podcastle', 'descript', 'murf-ai'],
  'jasper-ai-alternatives':                          ['rytr', 'writesonic', 'grammarly'],
  'chatgpt-alternatives-free-2026':                  ['perplexity', 'writesonic', 'rytr'],
  'best-ai-coding-tools-2026':                       ['replit', 'taskade', 'notion-ai'],
  'best-ai-logo-makers-free-2026':                   ['looka', 'canva-ai', 'gamma'],
  'best-ai-marketing-tools-2026':                    ['ocoya', 'writesonic', 'grammarly'],
  'ai-tools-for-teachers-2026':                      ['grammarly', 'gamma', 'notion-ai'],
  'best-midjourney-alternatives-2026':               ['leonardo-ai', 'photoroom', 'canva-ai'],
  'how-to-use-ai-for-content-creation-2026':         ['rytr', 'grammarly', 'canva-ai'],
  'best-ai-tools-in-india-2026':                     ['grammarly', 'canva-ai', 'photoroom'],
  'best-ai-tools-for-freelancers-india-2026':        ['rytr', 'grammarly', 'taskade'],
  'best-free-ai-tools-for-students-in-india-2026':   ['grammarly', 'canva-ai', 'gamma'],
  'best-ai-tools-for-content-creators-free-2026':    ['canva-ai', 'opus-clip', 'rytr'],
  'best-ai-tools-for-developers-2026':          ['replit', 'notion-ai', 'taskade'],
  'best-ai-tools-for-automation-engineers-2026': ['replit', 'notion-ai', 'taskade'],
  'best-ai-tools-for-youtubers-2026':            ['invideo', 'opus-clip', 'pictory'],
  'best-ai-tools-for-startups-2026':             ['notion-ai', 'canva-ai', 'gamma'],
  'taskade-vs-notion-vs-asana-2026':                 ['taskade', 'notion-ai', 'replit'],
  'leonardo-vs-midjourney-2026':                     ['leonardo-ai', 'photoroom', 'canva-ai'],
  'ai-api-pricing-comparison-2026':                  ['replit', 'notion-ai', 'taskade'],
  'best-free-ai-tool-plans-2026':                    ['grammarly', 'canva-ai', 'gamma'],
  'fastest-growing-ai-startups-2026':                ['perplexity', 'replit', 'taskade'],
  'cheapest-ai-coding-tools-2026':                   ['replit', 'notion-ai', 'taskade'],
  'ai-ecosystem-growth-report-2026':                 ['grammarly', 'canva-ai', 'leonardo-ai'],
};

// ── H5 (SEO-High): Auto-link tool name mentions to /tools/{slug} pages ────────
// Passes PageRank from blog content to monetisable tool review pages.
// Keys are the display name (or alias) as it appears in blog prose;
// values are the corresponding URL slug.
const TOOL_MENTION_MAP: Record<string, string> = {
  // Writing
  'Grammarly':    'grammarly',
  'Writesonic':   'writesonic',
  'Rytr':         'rytr',
  'QuillBot':     'quillbot',
  'Quillbot':     'quillbot',
  'Frase':        'frase',
  'Frase.io':     'frase',
  'Jasper':       'jasper',
  // Image
  'Leonardo.ai':  'leonardo-ai',
  'PhotoRoom':    'photoroom',
  'Photoroom':    'photoroom',
  'Looka':        'looka',
  // Video
  'Pictory':      'pictory',
  'Opus Clip':    'opus-clip',
  'InVideo AI':   'invideo',
  'InVideo':      'invideo',
  // Audio
  'Murf AI':      'murf-ai',
  'Murf':         'murf-ai',
  'Podcastle':    'podcastle',
  'ElevenLabs':   'elevenlabs',
  'Descript':     'descript',
  // Design / Productivity
  'Gamma':        'gamma',
  'Beautiful.ai': 'beautiful-ai',
  'Ocoya':        'ocoya',
  'Canva AI':     'canva-ai',
  'Notion AI':    'notion-ai',
  'Taskade':      'taskade',
  // Coding / Other
  'Replit':       'replit',
  'Perplexity':   'perplexity',
};

/**
 * Wraps the first occurrence of each tool name in blog HTML with an anchor.
 *
 * Uses DOM-tree walking instead of regex on raw HTML strings, which avoids:
 *   - Matching text already inside <a> tags (nested-link bug)
 *   - Case-sensitivity issues with mixed-case replacements
 *   - First-mention detection failures when the first occurrence is in a table
 *     header that already has a link
 *
 * Strategy:
 *   1. Parse the HTML string into a real DOM element.
 *   2. Walk all text nodes, skipping those inside <a>, <code>, <script>, <style>.
 *   3. For each text node, find every unlinked tool name (longest names first to
 *      handle "InVideo AI" before "InVideo") and replace them in one pass.
 *   4. Serialise back to innerHTML.
 */
function autoLinkToolMentions(html: string, accentColor: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;

  // Track which names have already been linked (one link per tool)
  const linked = new Set<string>();

  // Sort longest-first so "InVideo AI" matches before "InVideo", etc.
  const entries = Object.entries(TOOL_MENTION_MAP)
    .sort(([a], [b]) => b.length - a.length);

  /**
   * Recursively walk the DOM. Process leaf text nodes; recurse into elements
   * that are NOT anchors/code/script/style (those are skip zones).
   */
  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const text = textNode.nodeValue ?? '';
      if (!text.trim()) return;

      // Collect all unlinked matches in this text node
      type MatchInfo = { start: number; end: number; name: string; slug: string; original: string };
      const matches: MatchInfo[] = [];

      for (const [name, slug] of entries) {
        if (linked.has(name)) continue;
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const m = new RegExp(`\\b${escaped}\\b`, 'i').exec(text);
        if (m) {
          matches.push({ start: m.index, end: m.index + m[0].length, name, slug, original: m[0] });
        }
      }

      if (matches.length === 0) return;

      // Sort by position, remove overlapping entries (keep the earlier one)
      matches.sort((a, b) => a.start - b.start);
      const nonOverlapping: MatchInfo[] = [];
      let lastEnd = 0;
      for (const m of matches) {
        if (m.start >= lastEnd) { nonOverlapping.push(m); lastEnd = m.end; }
      }

      // Rebuild the text node as a mix of text nodes + anchor elements
      const parent = textNode.parentNode!;
      let cursor = 0;
      for (const m of nonOverlapping) {
        if (m.start > cursor) {
          parent.insertBefore(document.createTextNode(text.slice(cursor, m.start)), textNode);
        }
        const a = document.createElement('a');
        a.href = `/tools/${m.slug}/`;
        a.style.cssText = `color:${accentColor};text-decoration:underline;text-underline-offset:2px;font-weight:600;`;
        a.title = `${m.name} review — AI Nexus`;
        a.textContent = m.original;
        parent.insertBefore(a, textNode);
        linked.add(m.name);
        cursor = m.end;
      }
      if (cursor < text.length) {
        parent.insertBefore(document.createTextNode(text.slice(cursor)), textNode);
      }
      parent.removeChild(textNode);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as Element).tagName.toLowerCase();
      // Skip entire subtree for these elements
      if (tag === 'a' || tag === 'code' || tag === 'script' || tag === 'style') return;
    }

    // Snapshot childNodes before mutation (insertBefore can shift live NodeList)
    const children = Array.from(node.childNodes);
    for (const child of children) processNode(child);
  }

  processNode(container);
  return container.innerHTML;
}

interface BlogPostPageProps {
  post:        BlogPost;
  navigate:    (to: string) => void;
  isDark:      boolean;
  toggleTheme: () => void;
}

const C = {
  bg:   'var(--bg)',
  surf: 'var(--surf)',
  txt:  'var(--txt)',
  mut:  'var(--mut)',
  mut2: 'var(--mut2)',
  a1:   'var(--a1)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  brd:    'var(--brd)',
  brdSm:  'var(--brd-sm)'
};

function ReadersAlsoAsk({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section aria-label="Readers also ask" style={{ margin: '40px 0' }}>
      <h2 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 20, fontWeight: 800,
        color: C.txt, marginBottom: 16,
      }}>
        Readers Also Ask
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
        {faqs.slice(0, 5).map(({ q, a }, i) => (
          <div key={i}
            style={{
              background: C.surf,
              border: `1px solid ${C.brd}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left' as const,
                padding: '14px 18px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 14, fontWeight: 600, color: C.txt,
                fontFamily: 'inherit',
              }}
            >
              {q}
              <span style={{
                transform: open === i ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform .2s',
                fontSize: 12, color: C.mut2, flexShrink: 0, marginLeft: 12,
              }}>▼</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 18px 14px', fontSize: 14, color: C.mut, lineHeight: 1.65 }}>
                {a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function BlogPostPage({ post, navigate, isDark, toggleTheme }: BlogPostPageProps) {
  // Extract h2 headings from raw content for the Table of Contents
  const tocItems = useMemo(() => {
    const matches = [...post.content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    return matches.map(m => {
      const text = m[1].replace(/<[^>]+>/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return { text, id };
    });
  }, [post.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // H5: auto-linked blog content — memoised so it only re-runs when post changes
  // Also injects id attributes into h2 tags for TOC anchor links
  const linkedContent = useMemo(() => {
    const withLinks = autoLinkToolMentions(post.content, C.a1);
    return withLinks.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    });
  }, [post.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  // Inject Article + FAQPage JSON-LD schema into <head>
  useEffect(() => {
    const canonical = `${SITE_CONFIG.siteUrl}/blog/${post.slug}`;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.metaDescription,
      url: canonical,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      // FIX 2 (SEO-High): wordCount + image added — recommended by Google's Article rich result spec
      wordCount: (post as any).wordCount || 1800,
      image: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
      },
      // W4-T2: @id links this Person entity to the canonical About page URL so Google's
      // Knowledge Graph can reliably associate "Navneet Arya" with ainexustools.online.
      // sameAs array cross-links the author's LinkedIn, Twitter, and GitHub profiles —
      // AI engines (Perplexity, ChatGPT, Google AIO) use these to verify author identity
      // and boost E-E-A-T signals on every blog post. Mirrors the AUTHOR_SAME_AS array
      // used in prerender.mjs so static and client-side schemas stay in sync.
      author: {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.siteUrl}/about/#author`,
        name: post.author,
        url: `${SITE_CONFIG.siteUrl}/about`,
        jobTitle: 'Independent AI Tools Researcher',
        worksFor: [
          { '@type': 'Organization', name: 'AI Nexus', url: SITE_CONFIG.siteUrl },
          {
            '@type': 'Organization',
            name: 'BOLD',
            url: 'https://www.bold.com',
            description: 'AI Automation & Performance Testing — Navneet Arya\'s primary employer, where AI tools are evaluated for real production workflows.',
          },
        ],
        sameAs: [
          'https://www.linkedin.com/in/navneetarya/',
          'https://twitter.com/ainexustools',
          `${SITE_CONFIG.siteUrl}/about/`,
          'https://github.com/navneetarya',
        ],
      },
      publisher: {
        '@type': 'Organization',
        name: 'AI Nexus',
        url: SITE_CONFIG.siteUrl,
      },
      inLanguage: 'en-US',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AI Nexus', item: SITE_CONFIG.siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_CONFIG.siteUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    };

    // NOTE: FAQPage schema is already injected by the prerender script into the static HTML.
    // Do NOT add a second FAQPage here — Google will flag it as "Duplicate field 'FAQPage'".
    const schemas = [articleSchema, breadcrumbSchema];

    // Remove any previously injected blog schemas
    document.querySelectorAll('script[data-blog-schema]').forEach(el => el.remove());

    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-blog-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-blog-schema]').forEach(el => el.remove());
    };
  }, [post]);

  // GA4-5 Fix: Scroll milestone tracking — measures content engagement depth
  useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const fired = new Set<number>();
    const handleScroll = () => {
      const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      for (const m of milestones) {
        if (scrollPct >= m && !fired.has(m)) {
          fired.add(m);
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'content_milestone', {
              milestone: `scroll_${m}`,
              post_slug: post.slug,
              page_path: window.location.pathname,
            });
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.slug]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <SharedNav
        navigate={navigate}
        isDark={isDark}
        toggleTheme={toggleTheme}
        activePage="blog"
      />

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: C.mut2, marginBottom: 28,
        }}>
          <span
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', color: C.a1 }}
          >
            AI Nexus
          </span>
          <span>›</span>
          <span
            onClick={() => navigate('/blog')}
            style={{ cursor: 'pointer', color: C.a1 }}
          >
            Blog
          </span>
          <span>›</span>
          <span style={{ color: C.mut }}>{post.category}</span>
        </nav>

        {/* Category + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' as const }}>
          <span style={{
            padding: '3px 12px', borderRadius: 100,
            background: C.a1card, color: C.a1,
            border: `1px solid ${C.a1brd}`,
            fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' as const,
          }}>
            {post.category}
          </span>
          <span style={{ fontSize: 13, color: C.mut2 }}>{post.readTime}</span>
          <span style={{ fontSize: 13, color: C.mut2 }}>
            Updated {new Date(post.dateModified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(26px, 5vw, 38px)',
          fontWeight: 800,
          color: C.txt,
          lineHeight: 1.2,
          marginBottom: 20,
        }}>
          {post.title}
        </h1>

        {/* T1.7: Author byline strip — upgraded with job title + "About the reviewer" link.
            Audit spec: every page must show author credentials, not just the About page. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: C.surf,
          border: `1px solid ${C.brd}`,
          borderRadius: 12,
          marginBottom: 40,
        }}>
          <img
            src="/author-avatar.png"
            alt={`${post.author} — AI tools reviewer and founder of AI Nexus`}
            width={40} height={40}
            style={{ borderRadius: '50%', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.txt }}>{post.author}</div>
            <div style={{ fontSize: 12, color: C.mut2 }}>
              {SITE_CONFIG.authorTitle} · Published {new Date(post.datePublished).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {/* T9 (EEAT-Medium): BOLD credibility line — surfaces the primary
                credibility signal to readers and quality raters, not just JSON-LD. */}
            <div style={{ fontSize: 12, color: C.mut2, marginTop: 2 }}>
              {SITE_CONFIG.authorTitleSecondary}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a
              href="/about/"
              style={{
                fontSize: 12, color: C.a1, textDecoration: 'none',
                padding: '5px 12px', borderRadius: 8,
                background: C.a1card, border: `1px solid ${C.a1brd}`,
                fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              About the reviewer →
            </a>
          </div>
        </div>

        {/* FIX 9 (AEO-High): Quick Answer TLDR box
            Google AI Overviews + Perplexity pull the first direct-answer paragraph.
            This styled excerpt box (class="post-excerpt") is also targeted by Speakable schema
            in prerender.mjs so AI engines know exactly which element to cite. */}
        {post.excerpt && (
          <div
            className="post-excerpt"
            style={{
              background: C.a1card,
              border: `1px solid ${C.a1brd}`,
              borderRadius: 10,
              padding: '14px 20px',
              marginBottom: 16,
              fontSize: 15,
              lineHeight: 1.65,
              color: C.txt,
            }}
          >
            <span className="qa-label" style={{ fontWeight: 700, color: C.a1, marginRight: 6 }}>
              Quick Answer:
            </span>
            {post.excerpt}
          </div>
        )}

        {/* Task 6 (GEO/EEAT): Expert opinion blockquote — rendered only when myTake is populated.
            AI engines (Perplexity, ChatGPT, Google AIO) prioritise labelled expert opinions
            when selecting content to cite. The cite attribute links back to the About page
            for author authority. Placed directly after the Quick Answer box so it appears
            above the fold alongside the primary answer signal. */}
        {post.myTake && (
          <blockquote
            cite="/about/"
            style={{
              margin: '0 0 28px',
              padding: '14px 20px',
              background: C.surf,
              border: `1px solid ${C.brdSm}`,
              borderLeft: `3px solid ${C.a1}`,
              borderRadius: '0 10px 10px 0',
            }}
          >
            <p style={{
              fontSize: 15,
              fontStyle: 'italic',
              color: C.txt,
              lineHeight: 1.7,
              margin: '0 0 8px',
            }}>
              &ldquo;{post.myTake}&rdquo;
            </p>
            <footer style={{
              fontSize: 13,
              color: C.mut2,
              fontWeight: 600,
              fontStyle: 'normal',
            }}>
              — {post.author}, AI Nexus
            </footer>
          </blockquote>
        )}

        {/* Table of Contents */}
        {tocItems.length >= 3 && (
          <nav
            aria-label="Table of contents"
            style={{
              background: C.surf,
              border: `1px solid ${C.brd}`,
              borderRadius: 10,
              padding: '14px 20px',
              marginBottom: 28,
              fontSize: 14,
            }}
          >
            <div style={{ fontWeight: 700, color: C.txt, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              In this article
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tocItems.map(({ text, id }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    style={{ color: C.a1, textDecoration: 'none', lineHeight: 1.5 }}
                    onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* T4 (EEAT-High): "About This Review" credibility box ────────────────
            The #1 missing visual EEAT signal flagged by the audit. Google quality
            raters and AI engines look for explicit review provenance above the fold.
            Wires to post.author + post.dateModified — zero new data required.
            Displayed between the TOC and the article body so it is always visible
            before the reader reaches any substantive claim. */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 18px',
          background: C.a1card,
          border: `1px solid ${C.a1brd}`,
          borderLeft: `3px solid ${C.a1}`,
          borderRadius: 10,
          marginBottom: 26,
        }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 3, flexShrink: 0 }} aria-hidden="true">🛡️</span>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: C.a1,
              letterSpacing: '0.07em', textTransform: 'uppercase' as const,
              marginBottom: 4,
            }}>
              About This Review
            </div>
            <div style={{ fontSize: 13, color: C.mut, lineHeight: 1.65 }}>
              Reviewed by{' '}
              <strong style={{ color: C.txt, fontWeight: 600 }}>{post.author}</strong>
              {' · '}Last verified:{' '}
              <strong style={{ color: C.txt, fontWeight: 600 }}>
                {new Date(post.dateModified).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </strong>
              {' · '}Based on G2, Trustpilot &amp; Reddit analysis
            </div>
          </div>
        </div>

        {/* Article content */}
        <div
          style={{ color: C.txt, lineHeight: 1.75, fontSize: 16 }}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: linkedContent }}
        />

        {/* T5 (EEAT-High): Pros/Cons table ─────────────────────────────────────
            Renders only when post.proscons is populated. Two-column green/red card
            layout — boosts scannability and qualifies the post for rich result
            eligibility. Placed after the article body so it acts as a visual
            summary before the reader hits the newsletter CTA.
            Populate `proscons` in individual blog post .ts files separately. */}
        {post.proscons && (post.proscons.pros.length > 0 || post.proscons.cons.length > 0) && (
          <section style={{ marginTop: 44 }} aria-label="Pros and cons">
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20, fontWeight: 800,
              color: C.txt, marginBottom: 16,
              letterSpacing: '-0.02em',
            }}>
              Pros &amp; Cons
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
            }}>
              {post.proscons.pros.length > 0 && (
                <div style={{
                  background: 'rgba(16,185,129,.05)',
                  border: '1px solid rgba(16,185,129,.22)',
                  borderTop: '2px solid #10b981',
                  borderRadius: 12,
                  padding: '18px 20px',
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: '#10b981',
                    letterSpacing: '0.07em', textTransform: 'uppercase' as const,
                    marginBottom: 14,
                  }}>
                    ✓ Pros
                  </div>
                  <ul style={{
                    margin: 0, padding: '0 0 0 16px',
                    display: 'flex', flexDirection: 'column' as const, gap: 9,
                  }}>
                    {post.proscons.pros.map((p, i) => (
                      <li key={i} style={{ fontSize: 14, color: C.txt, lineHeight: 1.55 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {post.proscons.cons.length > 0 && (
                <div style={{
                  background: 'rgba(239,68,68,.05)',
                  border: '1px solid rgba(239,68,68,.2)',
                  borderTop: '2px solid #ef4444',
                  borderRadius: 12,
                  padding: '18px 20px',
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: '#ef4444',
                    letterSpacing: '0.07em', textTransform: 'uppercase' as const,
                    marginBottom: 14,
                  }}>
                    ✗ Cons
                  </div>
                  <ul style={{
                    margin: 0, padding: '0 0 0 16px',
                    display: 'flex', flexDirection: 'column' as const, gap: 9,
                  }}>
                    {post.proscons.cons.map((c, i) => (
                      <li key={i} style={{ fontSize: 14, color: C.txt, lineHeight: 1.55 }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* T7 (EEAT-Medium): Sources section ──────────────────────────────────
            Renders only when post.outboundCitations is populated. Dofollow links
            to G2, Trustpilot, and official pricing pages address the audit finding
            of zero outbound citations — a key EEAT trust signal for quality raters
            and AI engines. Placed after Pros & Cons, before the newsletter CTA.
            Populate `outboundCitations` in individual blog post .ts files separately. */}
        {post.outboundCitations && post.outboundCitations.length > 0 && (
          <section style={{ marginTop: 44 }} aria-label="Sources">
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20, fontWeight: 800,
              color: C.txt, marginBottom: 16,
              letterSpacing: '-0.02em',
            }}>
              Sources
            </h2>
            <ul style={{
              margin: 0, padding: '0 0 0 18px',
              display: 'flex', flexDirection: 'column' as const, gap: 8,
            }}>
              {post.outboundCitations.map((c, i) => (
                <li key={i} style={{ fontSize: 14, color: C.mut, lineHeight: 1.6 }}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: C.a1, textDecoration: 'underline', textUnderlineOffset: 2 }}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* M6: Inline newsletter CTA */}
        <div style={{
          margin: '40px 0',
          padding: '24px 28px',
          background: `linear-gradient(135deg, var(--a1-card), var(--surf))`,
          border: `1px solid var(--a1-brd)`,
          borderRadius: 14,
          textAlign: 'center' as const,
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 6 }}>
            Get weekly AI tool updates
          </div>
          <div style={{ fontSize: 13, color: C.mut, marginBottom: 14 }}>
            New reviews, free tool alerts, and workflow tips — every Tuesday.
          </div>
          <BeehiivForm />
        </div>

        {/* M21: Readers Also Ask — PAA-style expandable section */}
        {post.faqs.length > 0 && (
          <ReadersAlsoAsk faqs={post.faqs} />
        )}

        {/* FAQ Section */}
        {post.faqs.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 22, fontWeight: 800,
              color: C.txt, marginBottom: 20,
            }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
              {post.faqs.map(({ q, a }, i) => (
                <div
                  key={i}
                  style={{
                    background: C.surf,
                    border: `1px solid ${C.brd}`,
                    borderRadius: 12,
                    padding: '18px 22px',
                  }}
                >
                  <h3 style={{
                    fontSize: 15, fontWeight: 700,
                    color: C.txt, marginBottom: 8,
                  }}>
                    {q}
                  </h3>
                  <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, margin: 0 }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── W3-T16: Related Reviews — 3 tool cards from BLOG_RELATED_TOOLS map ── */}
        {(() => {
          const relatedSlugs = BLOG_RELATED_TOOLS[post.slug] || [];
          const relatedTools = relatedSlugs
            .map(slug => TOOLS.find(t => t.slug === slug))
            .filter(Boolean) as typeof TOOLS;
          if (relatedTools.length === 0) return null;
          return (
            <section style={{ marginTop: 52 }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 18, fontWeight: 800,
                color: C.txt, marginBottom: 16,
                letterSpacing: '-0.02em',
              }}>
                Related Reviews
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 12,
              }}>
                {relatedTools.map(t => (
                  <button
                    key={t.slug}
                    onClick={() => navigate(`/tools/${t.slug}`)}
                    style={{
                      background: C.surf,
                      border: `1px solid ${C.brd}`,
                      borderRadius: 12,
                      padding: '16px 18px',
                      textAlign: 'left' as const,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: 6,
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = C.a1)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.brd)}
                  >
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: C.txt, fontFamily: "'Inter', sans-serif",
                    }}>
                      {t.name}
                    </span>
                    <span style={{
                      fontSize: 11, color: C.mut2,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase' as const,
                    }}>
                      {t.category}
                    </span>
                    <span style={{
                      fontSize: 12, color: C.a1,
                      fontFamily: "'Inter', sans-serif",
                      marginTop: 2,
                    }}>
                      Read review →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Back + explore CTA */}
        <div style={{
          marginTop: 56,
          padding: '24px 28px',
          background: C.surf,
          border: `1px solid ${C.brd}`,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: 14,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.txt, marginBottom: 4 }}>
              Explore all AI tool reviews
            </div>
            <div style={{ fontSize: 13, color: C.mut2 }}>
              Every tool independently researched by {SITE_CONFIG.authorName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/blog')}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: '9px 18px', borderRadius: 9,
                background: C.a1card, border: `1px solid ${C.a1brd}`,
                color: C.a1, cursor: 'pointer',
              }}
            >
              ← More Posts
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: '9px 18px', borderRadius: 9,
                background: `linear-gradient(135deg, var(--a1), #0b7a6e)`,
                border: 'none', color: '#fff', cursor: 'pointer',
              }}
            >
              All Tools →
            </button>
          </div>
        </div>

      </article>

      {/* Scoped blog content styles */}
      <style>{`
        .blog-content h2 {
          font-family: 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--txt);
          margin: 36px 0 14px;
          line-height: 1.25;
        }
        .blog-content h3 {
          font-family: 'Inter', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--txt);
          margin: 26px 0 10px;
        }
        .blog-content p {
          margin-bottom: 18px;
          color: var(--txt);
        }
        .blog-content ul, .blog-content ol {
          color: var(--txt);
        }
        .blog-content li {
          margin-bottom: 4px;
        }
        .blog-content strong {
          color: var(--txt);
          font-weight: 700;
        }
        .blog-content table {
          border-radius: 10px;
          overflow: hidden;
        }
        .blog-content th {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--txt);
        }
        .blog-content td {
          color: var(--txt);
        }
      `}</style>

      {/* Footer */}
      <footer style={{
        background: 'var(--footer-bg)',
        padding: '32px 20px',
        textAlign: 'center' as const,
        color: 'rgba(255,255,255,.3)',
        fontSize: 13,
      }}>
        <p>© {new Date().getFullYear()} AI Nexus by {SITE_CONFIG.authorName} ·{' '}
          <span
            onClick={() => navigate('/disclosure')}
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'rgba(255,255,255,.4)' }}
          >
            Affiliate Disclosure
          </span>
        </p>
      </footer>
    </div>
  );
}
