import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Tool } from '../types';
import { Icon } from './Icon';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <motion.a
      href={tool.affiliateLink}
      target="_blank"
      rel="noopener noreferrer"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative flex flex-col p-5 bg-white/5 hover:bg-white/[0.07] backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 overflow-hidden h-full"
    >
      {/* Glow Effect */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100" 
        style={{ background: `radial-gradient(circle, ${tool.color}33 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 shadow-inner text-white group-hover:scale-110 transition-transform duration-300">
           <Icon name={tool.iconName} size={24} color={tool.color} />
        </div>
        
        <div className="p-2 rounded-full bg-white/5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
           <ExternalLink size={16} />
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
          {tool.name}
        </h3>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="relative z-10 mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
        <span className="bg-white/5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold border border-white/5">{tool.category}</span>
        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 font-semibold">
          Visit Site
        </div>
      </div>
    </motion.a>
  );
};