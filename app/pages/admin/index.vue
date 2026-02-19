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
              <button @click="logout" class="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold">Sair</button>
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
          <p class="font-serif text-xl text-cantuaria-oxford/50">Tudo em ordem.</p>
        </div>

        <div v-else class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
                <th class="px-6 py-4">Obra</th>
                <th class="px-6 py-4">Data</th>
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
                <td class="px-6 py-6 text-sm text-cantuaria-charcoal/60">{{ new Date(item.created_at).toLocaleDateString() }}</td>
                <td class="px-6 py-6 text-right">
                  <button @click="openReview(item)" class="px-4 py-2 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford/90">Revisar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Review Modal -->
      <div v-if="editingItem" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
          <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
            <h3 class="font-serif text-2xl text-cantuaria-oxford">Curadoria de Documento</h3>
            <button @click="editingItem = null" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
          </header>

          <div class="flex-grow flex overflow-hidden">
            <!-- Left: Document Preview -->
            <div class="hidden lg:block w-1/2 bg-cantuaria-charcoal border-r border-cantuaria-charcoal/10 overflow-hidden">
              <Reader :url="editingItem.file_url" :type="editingItem.type" />
            </div>

            <!-- Right: Edit Form -->
            <div class="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 space-y-10">
              <div class="flex justify-between items-center border-b border-cantuaria-oxford/5 pb-6">
                <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Metadados da Obra</h4>
                <button 
                  @click="analyzeWithAI" 
                  :disabled="analyzing"
                  class="flex items-center gap-2 px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50"
                >
                  <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': analyzing }" />
                  {{ analyzing ? 'Analisando...' : 'Analisar com IA' }}
                </button>
              </div>

              <!-- Cover & Title -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-1">
                  <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block mb-4">Capa da Obra</label>
                  <div 
                    @click="$refs.coverInput.click()"
                    class="aspect-[3/4.5] bg-cantuaria-cream/50 border-2 border-dashed border-cantuaria-charcoal/10 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-cantuaria-oxford/30 transition-colors group relative overflow-hidden"
                  >
                    <img v-if="editingItem.thumbnail_url" :src="editingItem.thumbnail_url" class="absolute inset-0 w-full h-full object-cover" />
                    <template v-else>
                      <LucideImage class="w-8 h-8 text-cantuaria-charcoal/20 group-hover:text-cantuaria-oxford transition-colors mb-2" />
                      <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 text-center">Subir Imagem</span>
                    </template>
                    <div v-if="uploadingCover" class="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <LucideLoader2 class="w-6 h-6 animate-spin text-cantuaria-oxford" />
                    </div>
                    <input ref="coverInput" type="file" class="hidden" @change="handleCoverUpload" accept="image/*" />
                  </div>
                </div>
                <div class="md:col-span-2 space-y-6">
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título Final</label>
                    <input type="text" v-model="editingItem.title" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano</label>
                      <input type="number" v-model="editingItem.publication_year" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Idioma</label>
                      <input type="text" v-model="editingItem.language" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo da Obra</label>
                <textarea rows="6" v-model="editingItem.summary" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed"></textarea>
              </div>

              <div class="pt-10 flex justify-end gap-4 border-t border-cantuaria-oxford/5">
                <button @click="editingItem = null" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford">Cancelar</button>
                <button 
                  @click="publish" 
                  :disabled="publishing"
                  class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50"
                >
                  {{ publishing ? 'Publicando...' : 'Aprovar & Publicar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { 
  ShieldCheck as LucideShieldCheck, FileText as LucideFileText, 
  Sparkles as LucideSparkles, X as LucideX, Image as LucideImage,
  Loader2 as LucideLoader2, CheckCircle as LucideCheckCircle
} from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()
const loading = ref(true)
const pendingItems = ref([])
const editingItem = ref(null)
const analyzing = ref(false)
const publishing = ref(false)
const uploadingCover = ref(false)

const fetchPending = async () => {
  loading.value = true
  const { data } = await supabase.from('documents').select('*').eq('status', 'pending').order('created_at', { ascending: false })
  pendingItems.value = data || []
  loading.value = false
}

const openReview = (item) => {
  editingItem.value = JSON.parse(JSON.stringify(item)) // Deep copy
}

const handleCoverUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploadingCover.value = true
  
  try {
    const fileName = `covers/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('covers').upload(fileName, file)
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName)
    editingItem.value.thumbnail_url = publicUrl
  } catch (err) {
    alert('Erro no upload da capa')
  } finally {
    uploadingCover.value = false
  }
}

const analyzeWithAI = async () => {
  analyzing.value = true
  try {
    const analysis = await $fetch('/api/analyze', {
      method: 'POST',
      body: { 
        documentId: editingItem.value.id,
        fileUrl: editingItem.value.file_url,
        filename: editingItem.value.title 
      }
    })
    // Merge results
    editingItem.value = { ...editingItem.value, ...analysis }
  } catch (err) {
    alert('Erro na IA')
  } finally {
    analyzing.value = false
  }
}

const publish = async () => {
  publishing.value = true
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        title: editingItem.value.title,
        summary: editingItem.value.summary,
        publication_year: editingItem.value.publication_year,
        language: editingItem.value.language,
        thumbnail_url: editingItem.value.thumbnail_url,
        status: 'published'
      })
      .eq('id', editingItem.value.id)
    
    if (error) throw error
    editingItem.value = null
    await fetchPending()
  } catch (err) {
    alert('Erro ao publicar')
  } finally {
    publishing.value = false
  }
}

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}

onMounted(fetchPending)
</script>
