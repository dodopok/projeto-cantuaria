<template>
  <div class="min-h-screen bg-cantuaria-cream flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center grayscale"></div>
    </div>

    <div class="w-full max-w-md bg-white p-12 shadow-2xl border border-cantuaria-charcoal/5 relative z-10">
      <div class="text-center mb-12">
        <NuxtLink to="/" class="inline-flex items-center gap-3 mb-8 group">
          <div class="w-12 h-12 bg-cantuaria-oxford flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
            <span class="font-serif text-3xl text-white">C</span>
          </div>
        </NuxtLink>
        <h1 class="font-serif text-3xl text-cantuaria-oxford mb-2">Acesso Restrito</h1>
        <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Curadoria & Administração</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">E-mail</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            class="w-full border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm bg-transparent transition-colors"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Senha</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm bg-transparent transition-colors"
          />
        </div>

        <div v-if="error" class="text-xs text-cantuaria-crimson font-medium bg-cantuaria-crimson/5 p-3 rounded">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-4 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl transition-all disabled:opacity-50"
        >
          {{ loading ? 'Autenticando...' : 'Entrar no Sistema' }}
        </button>
      </form>

      <div class="mt-12 pt-8 border-t border-cantuaria-charcoal/5 text-center">
        <p class="text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest leading-relaxed">
          "Pois nada há de oculto que não venha a ser revelado."
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

// Se já estiver logado, manda pro admin
onMounted(() => {
  watchEffect(() => {
    if (user.value) {
      navigateTo('/admin')
    }
  })
})

const handleLogin = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) {
      error.value = 'Falha na autenticação. Verifique suas credenciais.'
      return
    }
    
    // Se chegou aqui com data.user, o login foi um sucesso total
    if (data?.user) {
      await navigateTo('/admin', { replace: true })
    }
  } catch (err) {
    error.value = 'Ocorreu um erro inesperado no sistema.'
  } finally {
    loading.value = false
  }
}
</script>
