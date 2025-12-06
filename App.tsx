import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ToolCard } from './components/ToolCard';
import { TOOLS } from './constants';
import { Category, FilterState } from './types';

function App() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: Category.ALL,
  });

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                          tool.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === Category.ALL || tool.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [filters]);

  const handleCategorySelect = (category: Category) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-blob mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-blob animation-delay-2000 mix-blend-screen"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen pb-20">
        <Header />
        
        <SearchBar value={filters.search} onChange={handleSearch} />
        
        <CategoryFilter 
          currentCategory={filters.category} 
          onSelect={handleCategorySelect} 
        />

        <main className="w-full max-w-5xl px-4">
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredTools.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-zinc-500">No tools found matching your criteria.</p>
              <button 
                onClick={() => setFilters({ search: '', category: Category.ALL })}
                className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </main>
        
        <footer className="mt-auto pt-12 text-center text-zinc-600 text-sm pb-8">
          <p>© {new Date().getFullYear()} AI Nexus. All links are affiliate links.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;