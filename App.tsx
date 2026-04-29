import React, { useState, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { AboutPage } from './pages/AboutPage';
import { DisclosurePage } from './pages/DisclosurePage';
import { CompareArticlePage, COMPARE_ARTICLES } from './pages/CompareArticlePage';

function updateMeta(title: string, description: string, canonical: string) {
  document.title = title;
  const set = (sel: string, val: string) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  set('meta[name="description"]', description);
  set('meta[property="og:title"]', title);
  set('meta[property="og:description"]', description);
  set('meta[property="og:url"]', canonical);
  set('meta[name="twitter:title"]', title);
  set('meta[name="twitter:description"]', description);
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', canonical);
}

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  const yr = new Date().getFullYear();

  // Tool pages
  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const tool = TOOLS.find(t => t.slug === toolMatch[1]);
    if (tool) {
      updateMeta(
        `${tool.name} Review ${yr} — Honest Verdict, Pros, Cons & Pricing | AI Nexus`,
        `${SITE_CONFIG.authorName}'s honest ${tool.name} review after personal testing. ${tool.tagline}. Real pros, cons, pricing, and who it's actually for.`,
        `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`
      );
      return <ToolPage tool={tool} navigate={navigate} />;
    }
  }

  // Compare pages
  const compareMatch = path.match(/^\/compare\/([^/]+)$/);
  if (compareMatch) {
    const article = COMPARE_ARTICLES.find(a => a.slug === compareMatch[1]);
    if (article) {
      updateMeta(
        `${article.title} | AI Nexus`,
        article.metaDescription,
        `${SITE_CONFIG.siteUrl}/compare/${article.slug}`
      );
      return <CompareArticlePage article={article} navigate={navigate} />;
    }
  }

  if (path === '/about') {
    updateMeta(
      `About ${SITE_CONFIG.authorName} — AI Tools Reviewer | AI Nexus`,
      `${SITE_CONFIG.authorName} personally tests every AI tool before recommending it. ${SITE_CONFIG.authorExperience} of testing across writing, audio, video, design, coding, and productivity tools.`,
      `${SITE_CONFIG.siteUrl}/about`
    );
    return <AboutPage navigate={navigate} />;
  }

  if (path === '/disclosure') {
    updateMeta(
      'Affiliate Disclosure | AI Nexus',
      'Full affiliate disclosure for AI Nexus. I earn a commission if you purchase through my links, at no extra cost to you. FTC compliant.',
      `${SITE_CONFIG.siteUrl}/disclosure`
    );
    return <DisclosurePage navigate={navigate} />;
  }

  // Home
  updateMeta(
    `Best AI Tools Reviewed & Ranked ${yr} | AI Nexus`,
    `Honest, independent reviews of the best AI tools for writing, video, audio, podcasting, productivity, and social media. Every tool personally tested by ${SITE_CONFIG.authorName}. Every link is a free trial.`,
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} />;
}

export default App;
