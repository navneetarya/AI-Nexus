import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    // Fix: Use path.resolve('.') as a replacement for process.cwd() to resolve type errors.
    const root = path.resolve('.');
    const env = loadEnv(mode, root, '');
    
    return {
      // CRITICAL: Set base to '/' for Netlify. Do NOT use '/AI-Nexus/'
      base: '/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // Fix: Use root path derived from path.resolve('.') to avoid __dirname undefined error.
          '@': root,
        }
      },
      // This allows you to access process.env.GEMINI_API_KEY in your code
      define: {
        'process.env': env
      }
    };
});