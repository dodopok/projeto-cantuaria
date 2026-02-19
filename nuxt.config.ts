// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
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
        { name: 'description', content: 'Biblioteca pública digital para anglicanos: livros, artigos, revistas e fotos.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap' }
      ]
    }
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
  css: ['~/assets/css/main.css']
})
