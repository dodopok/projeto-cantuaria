<template>
  <NuxtLayout>
    <div class="min-h-screen bg-cantuaria-cream/30">
      <header class="bg-cantuaria-oxford text-white py-12">
        <div class="container mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div class="flex items-center gap-3 mb-4 text-cantuaria-gold">
                <LucideShieldCheck class="w-5 h-5" />
                <span class="text-[10px] uppercase tracking-[0.3em] font-bold">Painel de Administração</span>
              </div>
              <h1 class="text-4xl md:text-5xl font-serif">Gestão do Acervo</h1>
            </div>
            <div class="flex gap-4">
              <button @click="logout" class="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <section class="container mx-auto px-6 py-12">
        <!-- Tabs -->
        <div class="flex gap-8 border-b border-cantuaria-oxford/10 mb-8">
          <button 
            @click="currentTab = 'pending'"
            :class="['pb-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2', 
            currentTab === 'pending' ? 'border-cantuaria-oxford text-cantuaria-oxford' : 'border-transparent text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
          >
            Pendentes ({{ pendingCount }})
          </button>
          <button 
            @click="currentTab = 'published'"
            :class="['pb-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2', 
            currentTab === 'published' ? 'border-cantuaria-oxford text-cantuaria-oxford' : 'border-transparent text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
          >
            Publicados
          </button>
        </div>

        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <div v-else-if="items.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
          <LucideCheckCircle class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
          <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhum documento encontrado.</p>
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
              <tr v-for="item in items" :key="item.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
                <td class="px-6 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-cantuaria-oxford/5 flex items-center justify-center rounded text-cantuaria-oxford overflow-hidden">
                      <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
                      <LucideFileText v-else class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="font-medium text-cantuaria-oxford">{{ item.title }}</div>
                      <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">{{ item.type }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 text-sm text-cantuaria-charcoal/60">{{ new Date(item.created_at).toLocaleDateString() }}</td>
                <td class="px-6 py-6 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openReview(item)" class="px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all">Editar</button>
                    <button @click="deleteItem(item)" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors"><LucideTrash2 class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Review/Edit Modal -->
      <div v-if="editingItem" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
          <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
            <h3 class="font-serif text-2xl text-cantuaria-oxford">Gerenciamento de Documento</h3>
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
                <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Dados da Obra</h4>
                <button 
                  @click="analyzeWithAI" 
                  :disabled="analyzing"
                  class="flex items-center gap-2 px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50"
                >
                  <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': analyzing }" />
                  {{ analyzing ? 'Analisando...' : 'Re-analisar com IA' }}
                </button>
              </div>

              <!-- Cover & Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-1">
                  <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block mb-4">Capa</label>
                  <div 
                    @click="($refs.coverInput as HTMLInputElement).click()"
                    class="aspect-[3/4.5] bg-cantuaria-cream/50 border-2 border-dashed border-cantuaria-charcoal/10 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-cantuaria-oxford/30 transition-colors group relative overflow-hidden shadow-inner"
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
                  
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Autor(es) (separados por vírgula)</label>
                    <input type="text" v-model="editingItem.authors_list" placeholder="Ex: John Donne, Richard Hooker" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm" />
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

                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label>
                    <input type="text" v-model="editingItem.category_name" placeholder="Ex: Liturgia" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm" />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo da Obra</label>
                <textarea rows="6" v-model="editingItem.summary" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed"></textarea>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags (separadas por vírgula)</label>
                <input type="text" v-model="editingItem.tags_list" placeholder="Ex: BCP, Reforma, 1662" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm" />
              </div>

              <div class="pt-10 flex justify-end gap-4 border-t border-cantuaria-oxford/5">
                <button @click="editingItem = null" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford">Cancelar</button>
                <button 
                  @click="publish" 
                  :disabled="publishing"
                  class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50"
                >
                  {{ publishing ? 'Salvando...' : 'Salvar & Publicar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  ShieldCheck as LucideShieldCheck, FileText as LucideFileText, 
  Sparkles as LucideSparkles, X as LucideX, Image as LucideImage,
  Loader2 as LucideLoader2, CheckCircle as LucideCheckCircle,
  Trash2 as LucideTrash2
} from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()
const loading = ref(true)
const currentTab = ref<'pending' | 'published'>('pending')
const items = ref<any[]>([])
const pendingCount = ref(0)
const editingItem = ref<any>(null)
const analyzing = ref(false)
const publishing = ref(false)
const uploadingCover = ref(false)

const fetchData = async () => {
  loading.value = true
  
  const { data } = await supabase
    .from('documents')
    .select('*, authors(name), categories(name), tags(name)')
    .eq('status', currentTab.value)
    .order('created_at', { ascending: false })
  
  items.value = data?.map(doc => ({
    ...doc,
    authors_list: doc.authors?.map((a: any) => a.name).join(', '),
    tags_list: doc.tags?.map((t: any) => t.name).join(', '),
    category_name: doc.categories?.name
  })) || []

  // Atualiza contagem de pendentes
  const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  pendingCount.value = count || 0
  
  loading.value = false
}

const openReview = (item: any) => {
  editingItem.value = JSON.parse(JSON.stringify(item))
}

const handleCoverUpload = async (e: any) => {
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
    const analysis: any = await $fetch('/api/analyze', {
      method: 'POST',
      body: { 
        documentId: editingItem.value.id,
        fileUrl: editingItem.value.file_url,
        filename: editingItem.value.title 
      }
    })
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
    // 1. Categoria
    let categoryId = null
    if (editingItem.value.category_name) {
      const slug = editingItem.value.category_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')
      const { data: catData } = await supabase
        .from('categories')
        .upsert({ name: editingItem.value.category_name, slug }, { onConflict: 'slug' })
        .select().single()
      if (catData) categoryId = (catData as any).id
    }

    // 2. Documento
    const { error: docError } = await supabase
      .from('documents')
      .update({
        title: editingItem.value.title,
        summary: editingItem.value.summary,
        publication_year: editingItem.value.publication_year,
        language: editingItem.value.language,
        thumbnail_url: editingItem.value.thumbnail_url,
        category_id: categoryId,
        status: 'published'
      })
      .eq('id', editingItem.value.id)
    
    if (docError) throw docError

    // 3. Autores (M-M)
    if (editingItem.value.authors_list) {
      // Remove vínculos antigos para evitar duplicatas ou órfãos se a lista mudou
      await supabase.from('document_authors').delete().eq('document_id', editingItem.value.id)
      
      const authors = editingItem.value.authors_list.split(',').map((a: string) => a.trim())
      for (const name of authors) {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')
        const { data: autData } = await supabase
          .from('authors')
          .upsert({ name, slug }, { onConflict: 'slug' })
          .select()
          .single()
        
        if (autData) {
          await supabase.from('document_authors').insert({ document_id: editingItem.value.id, author_id: (autData as any).id })
        }
      }
    }

    // 4. Tags (M-M)
    if (editingItem.value.tags_list) {
      // Remove vínculos antigos
      await supabase.from('document_tags').delete().eq('document_id', editingItem.value.id)
      
      const tags = editingItem.value.tags_list.split(',').map((t: string) => t.trim())
      for (const name of tags) {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')
        const { data: tagData } = await supabase
          .from('tags')
          .upsert({ name, slug }, { onConflict: 'slug' })
          .select()
          .single()
        
        if (tagData) {
          await supabase.from('document_tags').insert({ document_id: editingItem.value.id, tag_id: (tagData as any).id })
        }
      }
    }

    editingItem.value = null
    await fetchData()
  } catch (err) {
    alert('Erro ao salvar')
  } finally {
    publishing.value = false
  }
}

const deleteItem = async (item: any) => {
  if (!confirm('Deseja remover esta obra permanentemente?')) return
  const { error } = await supabase.from('documents').delete().eq('id', item.id)
  if (!error) fetchData()
}

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}

watch(currentTab, fetchData)
onMounted(fetchData)
</script>
