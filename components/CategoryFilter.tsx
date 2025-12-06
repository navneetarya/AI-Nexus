import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  currentCategory: Category;
  onSelect: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ currentCategory, onSelect }) => {
  const categories = Object.values(Category);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-8">
      <div className="flex gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide no-scrollbar mask-linear">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${currentCategory === cat 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 scale-105' 
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/5'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};