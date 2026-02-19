import { createClient } from '@supabase/supabase-js'

/**
 * Cria um cliente Supabase para ser usado exclusivamente no servidor.
 * Este cliente usa a SERVICE_ROLE_KEY, permitindo que as rotas da API
 * executem operações sem as restrições de RLS (Row Level Security).
 */
export const useAdminSupabase = () => {
  // Nota: No Nuxt 3, usamos process.env para acesso direto no servidor
  // ou runtimeConfig configurado no nuxt.config.ts
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações do Supabase (URL ou SERVICE_KEY) ausentes no .env'
    })
  }

  return createClient(supabaseUrl, serviceKey)
}
