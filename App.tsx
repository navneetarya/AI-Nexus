import React, { useState, useEffect, Suspense } from 'react';
import { SITE_CONFIG } from './site-config';
import { HomePage } from './pages/HomePage';
const StickyNewsletterBar = React.lazy(() => import('./components/BeehiivForm').then(m => ({ default: m.StickyNewsletterBar })));
const ScrollNewsletterPopup = React.lazy(() => import('./components/BeehiivForm').then(m => ({ default: m.ScrollNewsletterPopup })));
import type { BlogPost } from './blog/types';
import type { CompareArticle } from './pages/compare-data';
import type { Tool } from './types';

// C4: Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// ── Data-only imports (small, needed for routing on first render) ────────────
import { COMPARE_META_BY_SLUG } from './pages/compare-metadata';
import { BLOG_POST_META_BY_SLUG } from './blog/metadata';
import { loadBlogPostBySlug } from './blog/loaders';
import { registerWebMCPTools } from './lib/webmcp';

// ── Lazy page components — each becomes its own JS chunk ────────────────────
// These are only downloaded when the user actually navigates to that route,
// keeping the initial homepage bundle as small as possible.
const ToolPage           = React.lazy(() => import('./pages/ToolPage').then(m => ({ default: m.ToolPage })));
const AboutPage          = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const DisclosurePage     = React.lazy(() => import('./pages/DisclosurePage').then(m => ({ default: m.DisclosurePage })));
const PrivacyPage        = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage          = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const MethodologyPage    = React.lazy(() => import('./pages/MethodologyPage').then(m => ({ default: m.MethodologyPage })));
const BlogPage           = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage       = React.lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const BestFreeAIToolsPage = React.lazy(() => import('./pages/BestFreeAIToolsPage').then(m => ({ default: m.BestFreeAIToolsPage })));
const BestAIToolsIndiaPage = React.lazy(() => import('./pages/BestAIToolsIndiaPage').then(m => ({ default: m.BestAIToolsIndiaPage })));
const BestAILogoMakersPage = React.lazy(() => import('./pages/BestAILogoMakersPage').then(m => ({ default: m.BestAILogoMakersPage })));
const CompareArticlePage = React.lazy(() => import('./pages/CompareArticlePage').then(m => ({ default: m.CompareArticlePage })));
const CompareIndexPage   = React.lazy(() => import('./pages/CompareIndexPage').then(m => ({ default: m.CompareIndexPage })));
const CategoryPage       = React.lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const GlossaryPage       = React.lazy(() => import('./pages/GlossaryPage').then(m => ({ default: m.GlossaryPage })));
const EditorialPolicyPage = React.lazy(() => import('./pages/EditorialPolicyPage').then(m => ({ default: m.EditorialPolicyPage })));
const HowWeAnalyzePage    = React.lazy(() => import('./pages/HowWeAnalyzePage').then(m => ({ default: m.HowWeAnalyzePage })));
const ContactPage         = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

// ── Minimal loading fallback — avoids layout shift during chunk load ─────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid var(--brd)',
        borderTopColor: 'var(--a1)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function updateMeta(title: string, description: string, canonical: string, ogImage?: string) {
  document.title = title;
  const setMeta = (sel: string, val: string) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute('content', val);
  };
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonical);
  if (ogImage) {
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[name="twitter:image"]', ogImage);
  }
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', canonical);
}

function getInitialTheme(): 'light' | 'dark' | 'system' {
  const saved = localStorage.getItem('ainexus-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
}

async function loadCompareArticleBySlug(slug: string): Promise<CompareArticle | null> {
  const { COMPARE_ARTICLES } = await import('./pages/compare-data');
  return COMPARE_ARTICLES.find(article => article.slug === slug) ?? null;
}

async function loadToolBySlug(slug: string): Promise<Tool | null> {
  const { TOOLS } = await import('./constants');
  return TOOLS.find(tool => tool.slug === slug) ?? null;
}

function LazyBlogPostRoute({
  slug,
  navigate,
  isDark,
  toggleTheme,
}: {
  slug: string;
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPost(null);
    loadBlogPostBySlug(slug)
      .then(result => {
        if (mounted) setPost(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!post) return <NotFoundPage navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />;

  return (
    <Suspense fallback={<PageLoader />}>
      <BlogPostPage post={post} navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
    </Suspense>
  );
}

function LazyCompareArticleRoute({
  slug,
  navigate,
  isDark,
  toggleTheme,
}: {
  slug: string;
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}) {
  const [article, setArticle] = useState<CompareArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setArticle(null);
    loadCompareArticleBySlug(slug)
      .then(result => {
        if (mounted) setArticle(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!article) return <NotFoundPage navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />;

  return (
    <Suspense fallback={<PageLoader />}>
      <CompareArticlePage article={article} navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
    </Suspense>
  );
}

function LazyToolRoute({
  slug,
  navigate,
  isDark,
  toggleTheme,
  currentYear,
}: {
  slug: string;
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentYear: number;
}) {
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setTool(null);
    loadToolBySlug(slug)
      .then(result => {
        if (mounted) setTool(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!tool) return <NotFoundPage navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />;

  updateMeta(
    tool.titleTemplate ?? `${tool.name} Review ${currentYear} — Independently Researched | AI Nexus`,
    tool.metaDescription ?? `${tool.name} review 2026 — Researched by ${SITE_CONFIG.authorName}. ${tool.tagline}. Pricing, pros, cons, and who it's actually for.`,
    `${SITE_CONFIG.siteUrl}/tools/${tool.slug}/`
  );

  return (
    <Suspense fallback={<PageLoader />}>
      <ToolPage tool={tool} navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
    </Suspense>
  );
}

function App() {
  const normalizePath = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);

  const [path, setPath] = useState(normalizePath(window.location.pathname));
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(getInitialTheme);

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'system') {
      html.removeAttribute('data-theme');
      localStorage.removeItem('ainexus-theme');
    } else {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('ainexus-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Agent-Ready: register WebMCP tools (navigator.modelContext) once per load.
  // No-op in every browser that doesn't support it yet.
  useEffect(() => {
    registerWebMCPTools();
  }, []);

  // GA4-2: shared so both the initial mount and SPA navigation tag pages
  // the same way.
  const getPageType = (url: string) => (
    url.startsWith('/tools/') ? 'tool_page'
      : url.startsWith('/blog/') ? 'blog_post'
      : url.startsWith('/compare/') ? 'compare'
      : url.startsWith('/best-') ? 'category'
      : url === '/' ? 'homepage' : 'static'
  );

  const fireGaPageView = (url: string) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: url,
      page_type: getPageType(url),
    });
  };

  // FIX (2026-08-21): navigate() only ever fired on SPA route changes, so
  // a visitor's very first page (direct hit, organic landing, backlink,
  // AI-assistant referral) never sent a page_view — GA4 showed these as
  // "(not set)" landing pages and 0% engagement. Fire one page_view for
  // the entry URL as soon as the app mounts.
  useEffect(() => {
    // Wait a tick so document.title (set by the route's <Helmet>/head logic)
    // has updated before we read it, without delaying beyond first paint.
    const id = window.setTimeout(() => {
      fireGaPageView(window.location.pathname);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (to: string) => {
    const url = to !== '/' && !to.endsWith('/') ? to + '/' : to;
    window.history.pushState({}, '', url);
    setPath(normalizePath(to));
    window.scrollTo(0, 0);
    // C4 Fix: Fire GA4 page_view for SPA navigation
    fireGaPageView(url);
  };

  const themeProps = { isDark, toggleTheme };
  const CURRENT_YEAR = new Date().getFullYear();

  // ── Route matching ────────────────────────────────────────────────────────
  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    return <LazyToolRoute slug={toolMatch[1]} navigate={navigate} {...themeProps} currentYear={CURRENT_YEAR} />;
  }

  const compareMatch = path.match(/^\/compare\/([^/]+)$/);
  if (path === '/compare') {
    updateMeta(
      `AI Tool Comparisons ${CURRENT_YEAR} — Side-by-Side Reviews | AI Nexus`,
      'Side-by-side comparisons of the best AI tools, independently researched by Navneet Arya. No sponsored opinions.',
      `${SITE_CONFIG.siteUrl}/compare/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <CompareIndexPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }
  if (compareMatch) {
    const article = COMPARE_META_BY_SLUG[compareMatch[1]];
    if (article) {
      updateMeta(
        `${article.seoTitle ?? article.title} | AI Nexus`,
        article.metaDescription,
        `${SITE_CONFIG.siteUrl}/compare/${article.slug}/`
      );
      return (
        <LazyCompareArticleRoute slug={article.slug} navigate={navigate} {...themeProps} />
      );
    }
    // Fallback: if slug exists as a blog post, render that instead
    const blogFallback = BLOG_POST_META_BY_SLUG[compareMatch[1]];
    if (blogFallback) {
      updateMeta(
        `${blogFallback.seoTitle ?? blogFallback.title} | AI Nexus`,
        blogFallback.metaDescription,
        `${SITE_CONFIG.siteUrl}/blog/${blogFallback.slug}/`,
        blogFallback.ogImage
      );
      return <LazyBlogPostRoute slug={blogFallback.slug} navigate={navigate} {...themeProps} />;
    }
  }

  const blogPostMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogPostMatch) {
    const post = BLOG_POST_META_BY_SLUG[blogPostMatch[1]];
    if (post) {
      updateMeta(
        `${post.seoTitle ?? post.title} | AI Nexus`,
        post.metaDescription,
        `${SITE_CONFIG.siteUrl}/blog/${post.slug}/`,
        post.ogImage
      );
      return <LazyBlogPostRoute slug={post.slug} navigate={navigate} {...themeProps} />;
    }
  }

  if (path === '/blog') {
    updateMeta(
      `AI Tools Blog — Guides & Reviews | AI Nexus by ${SITE_CONFIG.authorName}`,
      `In-depth AI tool guides and reviews by ${SITE_CONFIG.authorName}. Independently researched. No sponsored posts.`,

      `${SITE_CONFIG.siteUrl}/blog/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <BlogPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/about') {
    updateMeta(
      `About ${SITE_CONFIG.authorName} — The Person Behind AI Nexus`,
      `${SITE_CONFIG.authorName} independently researches AI tools since 2022 — official docs, 200+ verified reviews, and live pricing verification. No sponsored reviews.`,

      `${SITE_CONFIG.siteUrl}/about/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <AboutPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/disclosure') {
    updateMeta(
      'Affiliate Disclosure | AI Nexus',
      'Full affiliate disclosure for AI Nexus. I earn a commission if you purchase through my links, at no extra cost to you.',
      `${SITE_CONFIG.siteUrl}/disclosure/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <DisclosurePage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/privacy') {
    updateMeta(
      'Privacy Policy | AI Nexus',
      'Privacy policy for AI Nexus (ainexustools.online). How we handle data, Google Analytics usage, cookies, and your rights.',
      `${SITE_CONFIG.siteUrl}/privacy/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/terms') {
    updateMeta(
      'Terms of Service | AI Nexus',
      'Terms of Service for AI Nexus (ainexustools.online): use of content, affiliate disclosures, limitations, and contact details.',
      `${SITE_CONFIG.siteUrl}/terms/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <TermsPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/methodology') {
    updateMeta(
      'How I Review AI Tools — Testing Methodology | AI Nexus',
      `The 7-step process ${SITE_CONFIG.authorName} uses to test every AI tool on AI Nexus. Real standards, paid plan testing, head-to-head comparisons, and honest verdicts.`,
      `${SITE_CONFIG.siteUrl}/methodology/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <MethodologyPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/editorial-policy') {
    updateMeta(
      'Editorial Policy | AI Nexus',
      'AI Nexus editorial standards: independent research, no sponsored reviews, verified pricing, and transparent methodology.',
      `${SITE_CONFIG.siteUrl}/editorial-policy/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <EditorialPolicyPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/how-we-analyze-ai-tools') {
    updateMeta(
      'How We Analyze AI Tools — 6-Step Research Process | AI Nexus',
      'The 6-step process Navneet Arya uses to independently research and compare AI tools — official docs, 200+ reviews, live pricing verification.',
      `${SITE_CONFIG.siteUrl}/how-we-analyze-ai-tools/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <HowWeAnalyzePage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/contact') {
    updateMeta(
      'Contact AI Nexus — Editorial, Research & Press Enquiries',
      'Contact Navneet Arya at AI Nexus for editorial enquiries, research collaboration, press contact, and affiliate partnership questions.',
      `${SITE_CONFIG.siteUrl}/contact/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <ContactPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/glossary') {
    updateMeta(
      `AI Glossary — Key Terms Explained (${CURRENT_YEAR}) | AI Nexus`,
      'Clear definitions of 49 AI terms — LLM, GPT, RAG, prompt engineering, fine-tuning, and more. Written for beginners, updated for 2026.',
      `${SITE_CONFIG.siteUrl}/glossary/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <GlossaryPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/best-free-ai-tools') {
    updateMeta(
      `Best Free AI Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`,
      `13 AI tools with permanent free plans — independently researched. Writing, image generation, video, audio, design, coding, and productivity. No credit card required.`,
      `${SITE_CONFIG.siteUrl}/best-free-ai-tools/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <BestFreeAIToolsPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }


  if (path === '/best-ai-tools-india') {
    updateMeta(
      `Best AI Tools for India ${CURRENT_YEAR} — INR Pricing & Hindi Support | AI Nexus`,
      `10 best AI tools for India in 2026 — independently analyzed with INR pricing, Hindi support status, VPN requirements, and India-specific use cases.`,
      `${SITE_CONFIG.siteUrl}/best-ai-tools-india/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <BestAIToolsIndiaPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/best-ai-logo-makers') {
    updateMeta(
      `Best Free AI Logo Makers ${CURRENT_YEAR} — Researched & Compared | AI Nexus`,
      `4 AI logo tools independently analyzed — Looka, Canva AI, Leonardo.ai, and PhotoRoom. Free plan limits, INR pricing, and honest verdicts for solo creators and freelancers.`,
      `${SITE_CONFIG.siteUrl}/best-ai-logo-makers/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <BestAILogoMakersPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  if (path === '/best-ai-tools-for-freelancers') {
    const postMeta = BLOG_POST_META_BY_SLUG['best-ai-tools-for-freelancers-2026'];
    if (!postMeta) {
      return <NotFoundPage navigate={navigate} {...themeProps} />;
    }
    updateMeta(
      `Best AI Tools for Freelancers ${CURRENT_YEAR} — Independently Researched | AI Nexus`,
      `The best AI tools for freelancers in 2026 — writing, design, audio, and productivity tools reviewed and ranked for independent professionals.`,
      `${SITE_CONFIG.siteUrl}/best-ai-tools-for-freelancers/`
    );
    return <LazyBlogPostRoute slug={postMeta.slug} navigate={navigate} {...themeProps} />;
  }

  // ── Category landing pages ────────────────────────────────────────────────
  const CATEGORY_ROUTES: Record<string, { category: string; title: string; desc: string; canonicalOverride?: string }> = {
    '/best-ai-writing-tools':      { category: 'Writing',      title: `Best AI Writing Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI writing tools independently researched for 2026. Grammarly, Rytr, Writesonic, Frase, Jasper reviewed with free plans and honest verdicts.', canonicalOverride: 'https://ainexustools.online/blog/best-ai-writing-tools-2026/' },
    '/best-ai-image-tools':        { category: 'Image',        title: `Best AI Image Generators ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI image generators independently researched in 2026. Leonardo.ai, PhotoRoom, and more — free plans, quality comparisons, honest reviews.' },
    '/best-ai-video-tools':        { category: 'Video',        title: `Best AI Video Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI video tools independently researched in 2026. InVideo AI, Pictory, Opus Clip reviewed for faceless YouTube, Reels, and Shorts.' },
    '/best-ai-audio-tools':        { category: 'Audio',        title: `Best AI Audio & Voice Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI audio tools independently researched in 2026. Murf AI, Podcastle, ElevenLabs for voiceovers, podcasts, and voice cloning.' },
    '/best-ai-marketing-tools':    { category: 'Marketing',    title: `Best AI Marketing Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI marketing tools independently researched in 2026. Ocoya, Frase, and Jasper for SEO, social media, and content marketing.', canonicalOverride: 'https://ainexustools.online/blog/best-ai-marketing-tools-2026/' },
    '/best-ai-design-tools':       { category: 'Design',       title: `Best AI Design Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI design tools independently researched in 2026. Gamma, Looka, Canva AI for presentations, logos, and visual content.' },
    '/best-ai-coding-tools':       { category: 'Coding',       title: `Best AI Coding Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI coding tools independently researched in 2026. Replit, GitHub Copilot alternatives — code generation, debugging, and deployment.', canonicalOverride: 'https://ainexustools.online/blog/best-ai-coding-tools-2026/' },
    '/best-ai-productivity-tools': { category: 'Productivity', title: `Best AI Productivity Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`, desc: 'Best AI productivity tools independently researched in 2026. Taskade, Notion AI, Perplexity Pro for tasks, research, and workflows.' },
  };

  const catRoute = CATEGORY_ROUTES[path];
  if (catRoute) {
    updateMeta(catRoute.title, catRoute.desc, catRoute.canonicalOverride || `${SITE_CONFIG.siteUrl}${path}/`);
    return (
      <Suspense fallback={<PageLoader />}>
        <CategoryPage category={catRoute.category} navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  // ── 404 catch-all: unknown paths get a not-found page instead of silently serving the homepage ──
  if (path !== '/' && path !== '') {
    updateMeta(
      'Page Not Found — AI Nexus',
      'The page you requested does not exist on AI Nexus.',
      `${SITE_CONFIG.siteUrl}${path}/`
    );
    return <NotFoundPage navigate={navigate} {...themeProps} />;
  }

  updateMeta(
      `Best AI Tools ${CURRENT_YEAR} — Researched & Ranked | AI Nexus`,
    `Honest reviews of the best AI tools for writing, video, audio, podcasting, and productivity. Independently researched by ${SITE_CONFIG.authorName} — official docs, 200+ verified reviews per tool, live pricing verified May 2026.`,
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} {...themeProps} />;
}

// ── 404 Not Found page ──────────────────────────────────────────────────────
function NotFoundPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 32 }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--a1)', margin: '0 0 16px' }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--txt)', margin: '0 0 24px', textAlign: 'center' }}>This page doesn't exist on AI Nexus.</p>
      <button onClick={() => navigate('/')} style={{ padding: '12px 24px', background: 'var(--a1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
        Back to Home
      </button>
    </div>
  );
}

// W4-T21: StickyNewsletterBar is injected here so it persists across all route changes
// without re-mounting. It is mobile-only (CSS hides it ≥641px) and self-dismisses.
// W2-T2: ScrollNewsletterPopup fires at 65% scroll depth on /tools/* and /blog/* pages.
function AppWithStickyBar() {
  return (
    <>
      <App />
      <Suspense fallback={null}>
        <StickyNewsletterBar />
        <ScrollNewsletterPopup />
      </Suspense>
    </>
  );
}

export default AppWithStickyBar;
