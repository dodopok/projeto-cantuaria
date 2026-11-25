export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  // Sem sessão: vai para o login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Logado, mas sem papel de curadoria (app_metadata.role = 'admin'): volta para a home.
  // A proteção real fica no servidor (requireAdmin) e no RLS (public.is_admin());
  // isto só evita mostrar um painel que não vai funcionar.
  if ((user.value as any)?.app_metadata?.role !== 'admin') {
    return navigateTo('/?acesso=restrito')
  }
})
