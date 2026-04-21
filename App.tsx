import React, { useState, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { AboutPage } from './pages/AboutPage';
import { DisclosurePage } from './pages/DisclosurePage';

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

  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const tool = TOOLS.find(t => t.slug === toolMatch[1]);
    if (tool) {
      updateMeta(
        `${tool.name} Review ${new Date().getFullYear()} — Honest Take, Pricing & Free Trial | AI Nexus`,
        `${SITE_CONFIG.authorName}'s honest ${tool.name} review after personal testing. ${tool.tagline}. Real pros, cons, pricing, and who it's best for.`,
        `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`
      );
      return <ToolPage tool={tool} navigate={navigate} />;
    }
  }

  if (path === '/about') {
    updateMeta(
      `About ${SITE_CONFIG.authorName} — AI Nexus Reviewer`,
      `${SITE_CONFIG.authorName} personally tests every AI tool before recommending it. No sponsored reviews, no copying marketing pages.`,
      `${SITE_CONFIG.siteUrl}/about`
    );
    return <AboutPage navigate={navigate} />;
  }

  if (path === '/disclosure') {
    updateMeta(
      'Affiliate Disclosure | AI Nexus',
      'Full affiliate disclosure for AI Nexus. I earn a commission if you purchase through my links, at no extra cost to you.',
      `${SITE_CONFIG.siteUrl}/disclosure`
    );
    return <DisclosurePage navigate={navigate} />;
  }

  updateMeta(
    `AI Nexus — ${TOOLS.length} Best AI Tools Reviewed & Ranked ${new Date().getFullYear()}`,
    `Honest reviews of the best AI tools for writing, video, audio, podcasting, productivity & social media. Every tool personally tested by ${SITE_CONFIG.authorName}. Every link is a free trial.`,
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} />;
}

export default App;
