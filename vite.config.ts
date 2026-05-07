import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // @ts-ignore process is always defined in the node build environment
    const root = process.cwd();
    const env = loadEnv(mode, root, '');
    
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
        'process.env': env
      },
      build: {
        rollupOptions: {
          output: {
            // Split React + ReactDOM into their own chunk so the browser can
            // cache vendor code separately from app code. Reduces re-download
            // on every deploy and improves LCP on repeat visits.
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
            },
          },
        },
      },
    };
});