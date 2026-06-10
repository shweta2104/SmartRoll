import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8188',
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: {
          '*': ''
        },
        cookiePathRewrite: {
          '*': ''
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const host = req.headers.host;
            // If accessed via IP address (not localhost), proxy to the same IP
            if (host && (host.includes('192.168') || host.match(/^\d+\.\d+\.\d+\.\d+/))) {
              const ipAddress = host.split(':')[0];
              proxyReq.setHeader('X-Forwarded-Host', host);
              proxyReq.setHeader('X-Forwarded-Proto', 'http');
              proxy.options.target = `http://${ipAddress}:8188`;
            }
            console.log('Sending Request to the Target:', req.method, req.url, 'via', proxy.options.target);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Add CORS headers for mobile access
            proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          });
        },
      },
    },
  },
})
