import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // @ts-ignore process is always defined in the node build environment
    const root = process.cwd();
    
    return {
      base: '/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': root,
        }
      },
      define: {
        // Only expose NODE_ENV — never the entire process.env object
        // (passing the full object would leak OS-level vars like PATH into the bundle)
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
      build: {
        // Raise the warning threshold — the main bundle is intentionally large
        // because all tool/blog/compare data is statically bundled for fast navigation.
        // Gzipped transfer size is ~266 kB which is within acceptable range.
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks(id) {
              // ── Stable vendor chunks — cached across deploys ─────────────
              // React core: tiny shim after splitting (< 5KB), cached forever
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                return 'vendor-react';
              }
              // lucide-react: ~260KB tree-shakeable icon library.
              // Splitting it into its own chunk means a single icon change
              // in app code doesn't bust the icon cache.
              if (id.includes('node_modules/lucide-react')) {
                return 'vendor-icons';
              }
            },
          },
        },
      },
    };
});
