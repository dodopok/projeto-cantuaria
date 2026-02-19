<template>
  <NuxtLayout>
    <div class="min-h-screen bg-cantuaria-cream/30">
      <header class="bg-cantuaria-oxford text-white py-12">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div class="flex items-center gap-3 mb-4 text-cantuaria-gold">
                <LucideShieldCheck class="w-5 h-5" />
                <span class="text-[10px] uppercase tracking-[0.3em] font-bold">Painel de Curadoria</span>
              </div>
              <h1 class="text-4xl md:text-5xl font-serif">Gestão do Acervo</h1>
            </div>
            <div class="flex gap-4">
              <div class="bg-white/10 px-6 py-3 border border-white/10 text-center min-w-[120px]">
                <span class="block text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Pendentes</span>
                <span class="text-2xl font-serif text-cantuaria-gold">{{ pendingItems.length }}</span>
              </div>
              <button @click="logout" class="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <section class="container mx-auto px-6 py-12">
        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <div v-else-if="pendingItems.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
          <LucideCheckCircle class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
          <p class="font-serif text-xl text-cantuaria-oxford/50">Tudo em ordem. Nenhum documento pendente para revisão.</p>
        </div>

        <div v-else class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center">
            <h2 class="font-serif text-2xl text-cantuaria-oxford">Documentos para Revisão</h2>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
                <th class="px-6 py-4">Título Provisório / Tipo</th>
                <th class="px-6 py-4">Enviado em</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-cantuaria-charcoal/5">
              <tr v-for="item in pendingItems" :key="item.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
                <td class="px-6 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-cantuaria-oxford/5 flex items-center justify-center rounded text-cantuaria-oxford">
                      <LucideFileText class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="font-medium text-cantuaria-oxford">{{ item.title }}</div>
                      <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">{{ item.type }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 text-sm text-cantuaria-charcoal/60">
                  {{ new Date(item.created_at).toLocaleDateString('pt-BR') }}
                </td>
                <td class="px-6 py-6 text-right">
                  <div class="flex justify-end gap-3">
                    <button 
                      @click="analyzeWithAI(item)" 
                      :disabled="analyzing === item.id"
                      class="flex items-center gap-2 px-4 py-2 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford/90 disabled:opacity-50 transition-all"
                    >
                      <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': analyzing === item.id }" />
                      {{ analyzing === item.id ? 'Analisando...' : 'Analisar com IA' }}
                    </button>
                    <button @click="deleteItem(item)" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors">
                      <LucideTrash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- AI Results Modal -->
      <div v-if="aiResult" class="fixed inset-0 z-[100] bg-cantuaria-oxford/90 backdrop-blur-md flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl relative animate-fade-in">
          <header class="p-8 border-b border-cantuaria-charcoal/5 sticky top-0 bg-white z-10 flex justify-between items-center">
            <div>
              <h3 class="font-serif text-3xl text-cantuaria-oxford mb-2">Sugestão da IA</h3>
              <p class="text-xs text-cantuaria-charcoal/40 uppercase tracking-widest font-bold">Revise e publique o documento no acervo</p>
            </div>
            <button @click="aiResult = null" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full">
              <LucideX class="w-6 h-6" />
            </button>
          </header>
          
          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título Final</label>
                <input type="text" v-model="aiResult.title" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano de Publicação</label>
                <input type="number" v-model="aiResult.publication_year" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label>
                <input type="text" v-model="aiResult.category" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm" />
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo Gerado</label>
                <textarea rows="6" v-model="aiResult.summary" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags Sugeridas (Separadas por vírgula)</label>
                <input type="text" :value="aiResult.tags?.join(', ')" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm" />
              </div>
            </div>
          </div>

          <footer class="p-8 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-end gap-4">
            <button @click="aiResult = null" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
            <button 
              @click="publishDocument" 
              :disabled="publishing"
              class="px-12 py-3 bg-cantuaria- gold bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl transition-all disabled:opacity-50"
            >
              {{ publishing ? 'Publicando...' : 'Aprovar & Publicar' }}
            </button>
          </footer>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { 
  ShieldCheck as LucideShieldCheck, 
  FileText as LucideFileText, 
  Sparkles as LucideSparkles,
  Trash2 as LucideTrash2,
  Loader2 as LucideLoader2,
  CheckCircle as LucideCheckCircle,
  X as LucideX 
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin'
})

const supabase = useSupabaseClient()
const loading = ref(true)
const publishing = ref(false)
const analyzing = ref(null)
const pendingItems = ref([])
const aiResult = ref(null)
const currentItem = ref(null)

const fetchPending = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  
  if (!error) pendingItems.value = data
  loading.value = false
}

const analyzeWithAI = async (item) => {
  analyzing.value = item.id
  currentItem.value = item
  
  try {
    const response = await $fetch('/api/analyze', {
      method: 'POST',
      body: {
        filename: item.title,
        documentId: item.id,
        documentText: `Documento tipo ${item.type} publicado em ${item.publication_year || 'desconhecido'}. URL: ${item.file_url}`
      }
    })
    
    aiResult.value = response
  } catch (error) {
    alert('Erro na análise por IA. Verifique as chaves no .env')
  } finally {
    analyzing.value = null
  }
}

const publishDocument = async () => {
  if (!currentItem.value || !aiResult.value) return
  publishing.value = true

  try {
    const { error } = await supabase
      .from('documents')
      .update({
        title: aiResult.value.title,
        summary: aiResult.value.summary,
        publication_year: aiResult.value.publication_year,
        language: aiResult.value.language,
        status: 'published'
      })
      .eq('id', currentItem.value.id)

    if (error) throw error
    
    aiResult.value = null
    await fetchPending()
  } catch (err) {
    alert('Erro ao publicar documento.')
  } finally {
    publishing.value = false
  }
}

const deleteItem = async (item) => {
  if (!confirm('Tem certeza que deseja descartar este envio?')) return
  const { error } = await supabase.from('documents').delete().eq('id', item.id)
  if (!error) fetchPending()
}

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}

onMounted(fetchPending)
</script>
