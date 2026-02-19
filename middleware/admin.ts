export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Se o usuário não estiver autenticado, redireciona para login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Futuro: Adicionar verificação de role (ex: if (user.value.role !== 'admin'))
})
