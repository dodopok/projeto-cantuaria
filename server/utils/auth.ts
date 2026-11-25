import type { H3Event } from 'h3'
import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Papel de administrador: vem de `app_metadata.role` do usuário no Supabase Auth.
 * `app_metadata` só pode ser alterado com a service role (painel/SQL), nunca pelo próprio usuário,
 * então é seguro usar como fonte de autorização. O mesmo critério é usado no RLS (`public.is_admin()`).
 */
export const isAdminClaims = (claims: any): boolean => claims?.app_metadata?.role === 'admin'

/** Retorna os claims do usuário logado, ou null (sem lançar erro) quando não há sessão válida. */
export const getSessionClaims = async (event: H3Event): Promise<any | null> => {
  try {
    return await serverSupabaseUser(event)
  } catch {
    return null
  }
}

/** true quando a requisição vem de um administrador logado. */
export const isAdminRequest = async (event: H3Event): Promise<boolean> => {
  return isAdminClaims(await getSessionClaims(event))
}

/**
 * Exige um administrador logado. Use no início de toda rota que escreve dados,
 * lê dados privados ou gasta cota de IA/APIs pagas.
 */
export const requireAdmin = async (event: H3Event) => {
  const claims = await getSessionClaims(event)
  if (!claims) {
    throw createError({ statusCode: 401, statusMessage: 'Autenticação necessária.' })
  }
  if (!isAdminClaims(claims)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso restrito à curadoria.' })
  }
  return claims
}
