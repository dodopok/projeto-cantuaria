// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@vueuse/nuxt'
  ],
  app: {
    head: {
      title: 'Projeto Cantuária | Biblioteca Digital Anglicana',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Uma biblioteca pública digital dedicada à preservação e disseminação da produção litúrgica, teológica e histórica anglicana em língua portuguesa.' },
        { name: 'format-detection', content: 'telephone=no' },
        // SEO Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://projeto-cantuaria.vercel.app/' },
        { property: 'og:title', content: 'Projeto Cantuária | Biblioteca Digital Anglicana' },
        { property: 'og:description', content: 'Acesse séculos de sabedoria anglicana: livros, artigos, Liturgia e documentos históricos.' },
        { property: 'og:image', content: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Projeto Cantuária' },
        { name: 'twitter:description', content: 'Biblioteca Digital da tradição anglicana em português.' },
        { name: 'twitter:image', content: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap' }
      ]
    }
  },

  // Cache & Performance Rules
  routeRules: {
    // Static pages with SWR (Stale-While-Revalidate)
    '/': { swr: 3600 }, // 1 hour cache
    '/biblioteca': { swr: 600 }, // 10 min cache
    '/autores': { swr: 3600 },
    '/categorias': { swr: 3600 },
    '/contribuir': { static: true },
    
    // API Caching
    '/api/categories': { cache: { maxAge: 3600 } },
    '/api/authors': { cache: { maxAge: 3600 } },
    '/api/documents': { cache: { maxAge: 600 } }
  },

  runtimeConfig: {
    // Private keys are only available on the server
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,

    // Public keys are exposed to the client
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  },
  supabase: {
    redirect: false
  },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      rollupOptions: {
        external: ['pdfjs-dist']
      }
    },
    optimizeDeps: {
      include: ['pdfjs-dist']
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
