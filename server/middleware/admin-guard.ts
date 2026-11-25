import { defineEventHandler, getRequestURL } from 'h3'

/**
 * Proteção central da API (bloqueio por padrão).
 *
 * Todas as rotas em server/api usam a SERVICE_KEY (ignora o RLS), então a
 * autorização precisa acontecer aqui:
 *   - /api/admin/**                → sempre exige administrador;
 *   - qualquer método que não seja GET/HEAD em /api/** → exige administrador,
 *     exceto as rotas públicas listadas em PUBLIC_WRITE_ROUTES.
 *
 * Uma rota nova de escrita nasce protegida; para torná-la pública é preciso
 * incluí-la explicitamente na lista abaixo.
 */
const PUBLIC_WRITE_ROUTES = new Set([
  'POST /api/documents/view',            // contador de visualizações
  'POST /api/documents/request-removal'  // pedido público de remoção (take-down)
])

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname.replace(/\/+$/, '')
  if (!path.startsWith('/api/')) return

  const method = event.method.toUpperCase()
  const isRead = method === 'GET' || method === 'HEAD'

  if (path.startsWith('/api/admin/') || path === '/api/admin') {
    await requireAdmin(event)
    return
  }

  if (!isRead && !PUBLIC_WRITE_ROUTES.has(`${method} ${path}`)) {
    await requireAdmin(event)
  }
})
