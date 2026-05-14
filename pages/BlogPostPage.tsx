// pages/BlogPostPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
// Shield icon removed — T1.7 author strip now uses plain "About the reviewer →" anchor
import { SharedNav } from './SharedNav';
import { BlogPost } from '../blog/index';
import { SITE_CONFIG, TOOLS } from '../constants';
import { BeehiivForm } from '../components/BeehiivForm';

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
 * Wraps first occurrence of each tool name in blog HTML with an anchor tag.
 * Skips text already inside an <a> tag to avoid nested links.
 * Uses a single regex pass per tool so we only link the first mention.
 */
function autoLinkToolMentions(html: string, accentColor: string): string {
  let result = html;
  for (const [name, slug] of Object.entries(TOOL_MENTION_MAP)) {
    // Escape special regex chars in the tool name
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the tool name NOT preceded by href=" (i.e. not already in a link)
    // and not inside an existing anchor tag
    const pattern = new RegExp(
      `(?<!href=[^>]*)(?<!<a[^>]*)\\b(${escaped})\\b`,
      'i'
    );
    const replacement =
      `<a href="/tools/${slug}" style="color:${accentColor};text-decoration:underline;text-underline-offset:2px;font-weight:600;" ` +
      `title="${name} review — AI Nexus">$1</a>`;
    result = result.replace(pattern, replacement);
  }
  return result;
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
  brd:  'var(--brd)',
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
  // H5: auto-linked blog content — memoised so it only re-runs when post changes
  const linkedContent = useMemo(
    () => autoLinkToolMentions(post.content, C.a1),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post.slug]
  );
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
              marginBottom: 28,
              fontSize: 15,
              lineHeight: 1.65,
              color: C.txt,
            }}
          >
            <span style={{ fontWeight: 700, color: C.a1, marginRight: 6 }}>
              Quick answer:
            </span>
            {post.excerpt}
          </div>
        )}

        {/* Article content */}
        <div
          style={{ color: C.txt, lineHeight: 1.75, fontSize: 16 }}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: linkedContent }}
        />

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
              Every tool personally tested by {SITE_CONFIG.authorName}
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
