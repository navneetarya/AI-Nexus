import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { Category, FilterState, Tool } from './types';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';

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

  // Route: /tools/:slug
  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const slug = toolMatch[1];
    const tool = TOOLS.find(t => t.slug === slug);
    if (tool) return <ToolPage tool={tool} navigate={navigate} />;
  }

  // Default: homepage (/ or /tools)
  return <HomePage navigate={navigate} />;
}

export default App;
