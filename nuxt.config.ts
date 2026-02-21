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
      htmlAttrs: {
        lang: 'pt-BR'
      },
      title: 'Projeto Cantuária | Biblioteca Digital Anglicana',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
        { name: 'description', content: 'Uma biblioteca pública digital dedicada à preservação e disseminação da produção litúrgica, teológica e histórica anglicana em língua portuguesa.' },
        { name: 'format-detection', content: 'telephone=no' },
        // SEO Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://cantuaria.caminhoanglicano.com.br/' },
        { property: 'og:title', content: 'Projeto Cantuária | Biblioteca Digital Anglicana' },
        { property: 'og:description', content: 'Acesse séculos de sabedoria anglicana: livros, artigos, Liturgia e documentos históricos.' },
        { property: 'og:image', content: 'https://cantuaria.caminhoanglicano.com.br/og-image.jpg' }, // Ideal ter uma imagem fixa na public/
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Projeto Cantuária' },
        { name: 'twitter:description', content: 'Biblioteca Digital da tradição anglicana em português.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
    '/autores': { swr: 600 },
    '/categorias': { swr: 3600 },
    '/contribuir': { static: true },
    
    // API Caching (Short lived for faster updates)
    '/api/categories': { cache: { maxAge: 60 } },
    '/api/authors': { cache: { maxAge: 60 } },
    '/api/documents': { cache: { maxAge: 60 } },
    
    // API Detalhes: Desativamos cache no navegador para evitar dados antigos (304) 
    // após limpeza do cache do servidor via Admin
    '/api/documents/publish': { cache: false },
    '/api/documents/batch-delete': { cache: false },
    '/api/documents/request-removal': { cache: false },
    '/api/documents/view': { cache: false },
    '/api/documents/**': { cache: false }, 
    '/api/authors/**': { cache: false },
    '/api/publications/**': { cache: false },
    
    // Document & Author Pages (SWR for better SEO)
    '/documento/**': { swr: 600 },
    '/autores/**': { swr: 600 },
    '/publicacao/**': { swr: 600 }
  },

  runtimeConfig: {
    // Private keys are only available on the server
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,

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
  build: {
    transpile: ['pdfjs-dist']
  },
  vite: {
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
