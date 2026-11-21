import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Configuración de Vite para la aplicación de gestión de reservas.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // La aplicación se actualiza sola cuando hay una versión nueva.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Gestión de Reservas - Cabañas Puerto Iguazú',
        short_name: 'Cabañas Iguazú',
        description:
          'Sistema privado de gestión de reservas de las cuatro cabañas del Ejército Argentino en Puerto Iguazú, Misiones.',
        lang: 'es-AR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f4f6f5',
        theme_color: '#14532d',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Se precargan únicamente los recursos propios de la aplicación.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Las consultas a Supabase son de otro origen y NO se cachean:
        // los datos de reservas siempre se piden en línea.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      }
    })
  ],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Se separan las librerías en bloques propios para mejorar
        // el almacenamiento en caché y el tamaño de cada descarga.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers']
        }
      }
    }
  }
})
