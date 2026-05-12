import React, { useState, useEffect, Suspense } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { HomePage } from './pages/HomePage';
import { StickyNewsletterBar } from './components/BeehiivForm';

// ── Data-only imports (small, needed for routing on first render) ────────────
import { COMPARE_ARTICLES } from './pages/compare-data';
import { BLOG_POSTS } from './blog/index';

// ── Lazy page components — each becomes its own JS chunk ────────────────────
// These are only downloaded when the user actually navigates to that route,
// keeping the initial homepage bundle as small as possible.
const ToolPage           = React.lazy(() => import('./pages/ToolPage').then(m => ({ default: m.ToolPage })));
const AboutPage          = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const DisclosurePage     = React.lazy(() => import('./pages/DisclosurePage').then(m => ({ default: m.DisclosurePage })));
const MethodologyPage    = React.lazy(() => import('./pages/MethodologyPage').then(m => ({ default: m.MethodologyPage })));
const BlogPage           = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage       = React.lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const BestFreeAIToolsPage = React.lazy(() => import('./pages/BestFreeAIToolsPage').then(m => ({ default: m.BestFreeAIToolsPage })));
const CompareArticlePage = React.lazy(() => import('./pages/CompareArticlePage').then(m => ({ default: m.CompareArticlePage })));
const CategoryPage       = React.lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const GlossaryPage       = React.lazy(() => import('./pages/GlossaryPage').then(m => ({ default: m.GlossaryPage })));

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

function updateMeta(title: string, description: string, canonical: string) {
  document.title = title;
  const setMeta = (sel: string, val: string) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute('content', val);
  };
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonical);
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', canonical);
}

function getInitialTheme(): 'light' | 'dark' | 'system' {
  const saved = localStorage.getItem('ainexus-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
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

  const navigate = (to: string) => {
    const url = to !== '/' && !to.endsWith('/') ? to + '/' : to;
    window.history.pushState({}, '', url);
    setPath(normalizePath(to));
    window.scrollTo(0, 0);
  };

  const themeProps = { isDark, toggleTheme };

  // ── Route matching ────────────────────────────────────────────────────────
  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const tool = TOOLS.find(t => t.slug === toolMatch[1]);
    if (tool) {
      updateMeta(
        `${tool.name} Review 2026 — Personally Tested | AI Nexus`,
        `Honest ${tool.name} review by ${SITE_CONFIG.authorName}. ${tool.tagline}. Pros, cons, free plan breakdown — personally tested.`,
        `${SITE_CONFIG.siteUrl}/tools/${tool.slug}/`
      );
      return (
        <Suspense fallback={<PageLoader />}>
          <ToolPage tool={tool} navigate={navigate} {...themeProps} />
        </Suspense>
      );
    }
  }

  const compareMatch = path.match(/^\/compare\/([^/]+)$/);
  if (compareMatch) {
    const article = COMPARE_ARTICLES.find(a => a.slug === compareMatch[1]);
    if (article) {
      updateMeta(
        `${article.seoTitle ?? article.title} | AI Nexus`,
        article.metaDescription,
        `${SITE_CONFIG.siteUrl}/compare/${article.slug}/`
      );
      return (
        <Suspense fallback={<PageLoader />}>
          <CompareArticlePage article={article} navigate={navigate} {...themeProps} />
        </Suspense>
      );
    }
  }

  const blogPostMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogPostMatch) {
    const post = BLOG_POSTS.find(p => p.slug === blogPostMatch[1]);
    if (post) {
      updateMeta(
        `${post.seoTitle ?? post.title} | AI Nexus`,
        post.metaDescription,
        `${SITE_CONFIG.siteUrl}/blog/${post.slug}/`
      );
      return (
        <Suspense fallback={<PageLoader />}>
          <BlogPostPage post={post} navigate={navigate} {...themeProps} />
        </Suspense>
      );
    }
  }

  if (path === '/blog') {
    updateMeta(
      `AI Tools Blog — Guides & Reviews | AI Nexus by ${SITE_CONFIG.authorName}`,
      `In-depth AI tool guides and reviews by ${SITE_CONFIG.authorName}. Personally tested. No sponsored posts.`,
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
      `${SITE_CONFIG.authorName} personally tests every AI tool before recommending it. No sponsored reviews. Testing since 2022 across writing, audio, video, and productivity.`,
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

  if (path === '/glossary') {
    updateMeta(
      'AI Glossary — Key Terms Explained (2026) | AI Nexus',
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
      `Best Free AI Tools 2026 — Tested & Ranked | AI Nexus`,
      `13 AI tools with permanent free plans — personally tested. Writing, image generation, video, audio, design, coding, and productivity. No credit card required.`,
      `${SITE_CONFIG.siteUrl}/best-free-ai-tools/`
    );
    return (
      <Suspense fallback={<PageLoader />}>
        <BestFreeAIToolsPage navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  // ── Category landing pages ────────────────────────────────────────────────
  const CATEGORY_ROUTES: Record<string, { category: string; title: string; desc: string }> = {
    '/best-ai-writing-tools':      { category: 'Writing',      title: 'Best AI Writing Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI writing tools tested for 2026. Grammarly, Rytr, Writesonic, Frase, Jasper reviewed with free plans and honest verdicts.' },
    '/best-ai-image-tools':        { category: 'Image',        title: 'Best AI Image Generators 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI image generators tested in 2026. Leonardo.ai, PhotoRoom, and more — free plans, quality comparisons, honest reviews.' },
    '/best-ai-video-tools':        { category: 'Video',        title: 'Best AI Video Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI video tools tested in 2026. InVideo AI, Pictory, Opus Clip reviewed for faceless YouTube, Reels, and Shorts.' },
    '/best-ai-audio-tools':        { category: 'Audio',        title: 'Best AI Audio & Voice Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI audio tools tested in 2026. Murf AI, Podcastle, ElevenLabs for voiceovers, podcasts, and voice cloning.' },
    '/best-ai-marketing-tools':    { category: 'Marketing',    title: 'Best AI Marketing Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI marketing tools tested in 2026. Ocoya, Frase, and Jasper for SEO, social media, and content marketing.' },
    '/best-ai-design-tools':       { category: 'Design',       title: 'Best AI Design Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI design tools tested in 2026. Gamma, Looka, Canva AI for presentations, logos, and visual content.' },
    '/best-ai-coding-tools':       { category: 'Coding',       title: 'Best AI Coding Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI coding tools tested in 2026. Replit, GitHub Copilot alternatives — code generation, debugging, and deployment.' },
    '/best-ai-productivity-tools': { category: 'Productivity', title: 'Best AI Productivity Tools 2026 — Tested & Ranked | AI Nexus', desc: 'Best AI productivity tools tested in 2026. Taskade, Notion AI, Perplexity Pro for tasks, research, and workflows.' },
  };

  const catRoute = CATEGORY_ROUTES[path];
  if (catRoute) {
    updateMeta(catRoute.title, catRoute.desc, `${SITE_CONFIG.siteUrl}${path}/`);
    return (
      <Suspense fallback={<PageLoader />}>
        <CategoryPage category={catRoute.category} navigate={navigate} {...themeProps} />
      </Suspense>
    );
  }

  updateMeta(
    `Best AI Tools 2026 — Tested & Ranked | AI Nexus`,
    `Honest reviews of the best AI tools for writing, video, audio, podcasting, and productivity. Every tool personally tested by ${SITE_CONFIG.authorName}. Free trials only.`,
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} {...themeProps} />;
}

// W4-T21: StickyNewsletterBar is injected here so it persists across all route changes
// without re-mounting. It is mobile-only (CSS hides it ≥641px) and self-dismisses.
function AppWithStickyBar() {
  return (
    <>
      <App />
      <StickyNewsletterBar />
    </>
  );
}

export default AppWithStickyBar;
