import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

// Middleware to properly serve admin files in dev mode
const adminMiddlewarePlugin = {
  name: 'admin-middleware',
  apply: 'serve',
  configureServer(server) {
    return () => {
      server.middlewares.use((req, res, next) => {
        // Handle /admin/ requests
        if (req.url === '/admin' || req.url === '/admin/') {
          req.url = '/admin/index.html';
        }
        
        // For files inside /admin/, serve them directly from public/admin/
        if (req.url.startsWith('/admin/')) {
          const filePath = path.join(__dirname, 'public', req.url);
          
          // Check if file exists
          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              const content = fs.readFileSync(filePath, 'utf-8');
              const ext = path.extname(filePath);
              
              // Set appropriate content type
              let contentType = 'text/plain';
              if (ext === '.html') contentType = 'text/html';
              else if (ext === '.js') contentType = 'application/javascript';
              else if (ext === '.json') contentType = 'application/json';
              else if (ext === '.css') contentType = 'text/css';
              else if (ext === '.yml' || ext === '.yaml') contentType = 'text/yaml';
              
              res.setHeader('Content-Type', contentType);
              res.end(content);
              return;
            }
          }
        }
        
        next();
      });
    };
  }
};

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public'),
  base: '/',
  plugins: [adminMiddlewarePlugin],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
    open: true,
    fs: {
      allow: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'public')
      ]
    }
  }
});
