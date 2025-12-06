import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Instagram, Mail } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="relative z-10 w-full max-w-3xl mx-auto pt-12 pb-6 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
            <img 
              src={SITE_CONFIG.profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border border-background shadow-lg">
            <Sparkles size={14} fill="white" />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
          {SITE_CONFIG.name}
        </h1>
        <p className="mt-2 text-sm font-medium text-primary/80 uppercase tracking-widest">
          {SITE_CONFIG.tagline}
        </p>
        <p className="mt-4 text-zinc-400 max-w-md mx-auto leading-relaxed">
          {SITE_CONFIG.bio}
        </p>

        <div className="mt-6 flex gap-4">
          <a 
            href={SITE_CONFIG.instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-pink-500 transition-colors border border-white/5"
          >
            <Instagram size={20} />
          </a>
          <a 
            href={`mailto:${SITE_CONFIG.email}`}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-blue-400 transition-colors border border-white/5"
          >
            <Mail size={20} />
          </a>
        </div>
      </motion.div>
    </header>
  );
};