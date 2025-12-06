import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
          <Search size={20} className="text-zinc-500 mr-3" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Find an AI tool..."
            className="w-full bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600"
          />
        </div>
      </div>
    </div>
  );
};