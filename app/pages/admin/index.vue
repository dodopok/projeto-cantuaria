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
        <!-- Tabs & Bulk Actions -->
        <div class="flex flex-col md:flex-row justify-between items-center border-b border-cantuaria-oxford/10 mb-8 gap-4">
          <div class="flex gap-8">
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

          <div v-if="selectedIds.length > 0 && currentTab === 'pending'" class="pb-4 animate-fade-in">
            <button 
              @click="startBatchAnalysis"
              class="flex items-center gap-2 px-6 py-2 bg-cantuaria-gold text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all"
            >
              <LucideSparkles class="w-4 h-4" />
              Analisar {{ selectedIds.length }} selecionados com IA
            </button>
          </div>
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
                <th v-if="currentTab === 'pending'" class="px-6 py-4 w-10">
                  <input type="checkbox" @change="toggleAll" :checked="allSelected" class="w-4 h-4 accent-cantuaria-oxford" />
                </th>
                <th class="px-6 py-4">Obra</th>
                <th class="px-6 py-4">Data</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-cantuaria-charcoal/5">
              <tr v-for="item in items" :key="item.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
                <td v-if="currentTab === 'pending'" class="px-6 py-6">
                  <input type="checkbox" v-model="selectedIds" :value="item.id" class="w-4 h-4 accent-cantuaria-oxford" />
                </td>
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

      <!-- Batch Analysis Modal -->
      <div v-if="batchAnalysisActive" class="fixed inset-0 z-[110] bg-cantuaria-oxford/98 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
          <header class="p-8 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
            <div>
              <h3 class="font-serif text-3xl text-cantuaria-oxford">Processamento em Lote</h3>
              <p class="text-xs text-cantuaria-charcoal/40 uppercase tracking-widest font-bold mt-1">Análise inteligente de múltiplos documentos simultaneamente</p>
            </div>
            <button v-if="!isAnalyzingBatch" @click="closeBatch" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
          </header>

          <div class="flex-grow overflow-auto p-8 bg-cantuaria-cream/20">
            <div class="grid grid-cols-1 gap-6">
              <div v-for="res in batchResults" :key="res.id" class="border border-cantuaria-charcoal/10 p-6 rounded-sm bg-white shadow-sm hover:border-cantuaria-gold/50">
                <div class="flex flex-col lg:flex-row gap-8">
                  <div class="lg:w-1/4">
                    <div class="flex items-center gap-3 mb-4">
                      <LucideFileText v-if="res.status !== 'complete'" class="w-5 h-5 text-cantuaria-charcoal/20" />
                      <LucideCheckCircle v-else class="w-5 h-5 text-green-600" />
                      <span class="font-bold text-cantuaria-oxford truncate" :title="res.originalTitle">{{ res.originalTitle }}</span>
                    </div>
                    <div v-if="res.status === 'processing'" class="space-y-2">
                      <div class="h-1 bg-cantuaria-oxford/5 overflow-hidden rounded-full"><div class="h-full bg-cantuaria-gold animate-progress-indefinite"></div></div>
                      <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-gold animate-pulse">Extraindo dados...</span>
                    </div>
                    <div v-else-if="res.status === 'error'" class="text-xs text-cantuaria-crimson bg-cantuaria-crimson/5 p-3 border border-cantuaria-crimson/10 rounded">{{ res.errorMessage }}</div>
                  </div>

                  <div v-if="res.status === 'complete'" class="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div class="space-y-4">
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Título</label><input type="text" v-model="res.data.title" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-sm font-serif bg-transparent" /></div>
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Autores</label><input type="text" v-model="res.data.authors_list" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent" /></div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Ano</label><input type="number" v-model="res.data.publication_year" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent" /></div>
                        <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Categoria</label><input type="text" v-model="res.data.category_name" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent" /></div>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Resumo</label><textarea rows="3" v-model="res.data.summary" class="w-full border border-cantuaria-charcoal/10 p-2 focus:outline-none focus:border-cantuaria-gold text-xs leading-relaxed bg-cantuaria-cream/10"></textarea></div>
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Tags</label><input type="text" v-model="res.data.tags_list" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="p-8 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-between items-center">
            <div class="flex items-center gap-4"><span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">{{ completedCount }} de {{ batchResults.length }} processados</span></div>
            <div class="flex gap-4">
              <button v-if="!isAnalyzingBatch" @click="closeBatch" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
              <button @click="saveBatchResults" :disabled="isAnalyzingBatch || completedCount === 0 || publishingBatch" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">{{ publishingBatch ? 'Salvando...' : 'Publicar Todos' }}</button>
            </div>
          </footer>
        </div>
      </div>

      <!-- Review/Edit Modal -->
      <div v-if="editingItem" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
          <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
            <h3 class="font-serif text-2xl text-cantuaria-oxford">Gerenciamento de Documento</h3>
            <button @click="editingItem = null" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
          </header>

          <div class="flex-grow flex overflow-hidden">
            <div class="hidden lg:block w-1/2 bg-cantuaria-charcoal border-r border-cantuaria-charcoal/10 overflow-hidden">
              <Reader :url="editingItem.file_url" :type="editingItem.type" />
            </div>

            <div class="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 space-y-10">
              <div class="flex justify-between items-center border-b border-cantuaria-oxford/5 pb-6">
                <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Dados da Obra</h4>
                <button @click="analyzeWithAI" :disabled="analyzing" class="flex items-center gap-2 px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50">
                  <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': analyzing }" />
                  {{ analyzing ? 'Analisando...' : 'Re-analisar com IA' }}
                </button>
              </div>

              <!-- Cover & Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-1">
                  <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block mb-4">Capa</label>
                  <div @click="($refs.coverInput as HTMLInputElement).click()" class="aspect-[3/4.5] bg-cantuaria-cream/50 border-2 border-dashed border-cantuaria-charcoal/10 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-cantuaria-oxford/30 transition-colors group relative overflow-hidden shadow-inner">
                    <img v-if="editingItem.thumbnail_url" :src="editingItem.thumbnail_url" class="absolute inset-0 w-full h-full object-cover" />
                    <template v-else><LucideImage class="w-8 h-8 text-cantuaria-charcoal/20 group-hover:text-cantuaria-oxford transition-colors mb-2" /><span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 text-center">Subir Imagem</span></template>
                    <div v-if="uploadingCover || capturingPdf" class="absolute inset-0 bg-white/80 flex items-center justify-center"><LucideLoader2 class="w-6 h-6 animate-spin text-cantuaria-oxford" /></div>
                    <input ref="coverInput" type="file" class="hidden" @change="handleCoverUpload" accept="image/*" />
                  </div>
                  <div class="flex flex-col gap-2 mt-4">
                    <button @click.stop="generateInstitutionalCover" class="w-full py-2 border border-cantuaria-gold text-cantuaria-gold text-[8px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-all">Gerar Capa Cantuária</button>
                    <button 
                      v-if="editingItem.file_url?.toLowerCase().endsWith('.pdf')" 
                      @click.stop="capturePdfCover" 
                      :disabled="capturingPdf"
                      class="w-full py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[8px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50"
                    >
                      {{ capturingPdf ? 'Capturando...' : 'Usar 1ª pág como Capa' }}
                    </button>
                  </div>
                </div>
                <div class="md:col-span-2 space-y-6">
                  <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título Final</label><input type="text" v-model="editingItem.title" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl bg-transparent" /></div>
                  <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Autor(es)</label><input type="text" v-model="editingItem.authors_list" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" /></div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano</label><input type="number" v-model="editingItem.publication_year" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" /></div>
                    <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Idioma</label><input type="text" v-model="editingItem.language" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" /></div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label>
                    <input type="text" v-model="editingItem.category_name" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tipo de Documento</label>
                    <select v-model="editingItem.type" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none">
                      <option value="Livro">Livro</option>
                      <option value="Artigo">Artigo</option>
                      <option value="LOC">Liturgia (LOC)</option>
                      <option value="Revista">Revista</option>
                      <option value="Foto">Foto</option>
                      <option value="Documento">Documento Histórico</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo</label><textarea rows="6" v-model="editingItem.summary" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed bg-cantuaria-cream/10"></textarea></div>
              <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags</label><input type="text" v-model="editingItem.tags_list" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" /></div>
              <div class="pt-10 flex justify-end gap-4 border-t border-cantuaria-oxford/5">
                <button @click="editingItem = null" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
                <button @click="publish" :disabled="publishing" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">Salvar & Publicar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ShieldCheck as LucideShieldCheck, FileText as LucideFileText, Sparkles as LucideSparkles, X as LucideX, Image as LucideImage, Loader2 as LucideLoader2, CheckCircle as LucideCheckCircle, Trash2 as LucideTrash2 } from 'lucide-vue-next'
import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

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
const capturingPdf = ref(false)

const selectedIds = ref<string[]>([])
const allSelected = computed(() => items.value.length > 0 && selectedIds.value.length === items.value.length)
const batchAnalysisActive = ref(false)
const isAnalyzingBatch = ref(false)
const publishingBatch = ref(false)
const batchResults = ref<any[]>([])
const completedCount = computed(() => batchResults.value.filter(r => r.status === 'complete').length)

const fetchData = async () => {
  loading.value = true; selectedIds.value = []
  const { data } = await supabase.from('documents').select('*, authors(name), categories(name), tags(name)').eq('status', currentTab.value).order('created_at', { ascending: false })
  items.value = data?.map(doc => ({ ...doc, authors_list: doc.authors?.map((a: any) => a.name).join(', '), tags_list: doc.tags?.map((t: any) => t.name).join(', '), category_name: doc.categories?.name })) || []
  const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  pendingCount.value = count || 0; loading.value = false
}

const toggleAll = () => { selectedIds.value = allSelected.value ? [] : items.value.map(i => i.id) }
const openReview = (item: any) => { editingItem.value = JSON.parse(JSON.stringify(item)) }

const generateInstitutionalCover = async () => {
  if (!editingItem.value.title) return; uploadingCover.value = true
  try {
    const { url }: any = await $fetch('/api/generate-cover', { method: 'POST', body: { title: editingItem.value.title, author: editingItem.value.authors_list?.split(',')[0] } })
    editingItem.value.thumbnail_url = url
  } finally { uploadingCover.value = false }
}

const capturePdfCover = async () => {
  if (!editingItem.value.file_url) return; capturingPdf.value = true
  try {
    const loadingTask = pdfjs.getDocument(editingItem.value.file_url)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas'); const context = canvas.getContext('2d')
    canvas.height = viewport.height; canvas.width = viewport.width
    await page.render({ canvasContext: context!, viewport }).promise
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.8))
    const fileName = `covers/pdf-capture-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('covers').upload(fileName, blob)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName)
    editingItem.value.thumbnail_url = publicUrl
  } catch (err) { alert('Erro na captura. Verifique o acesso CORS do arquivo.') } finally { capturingPdf.value = false }
}

const startBatchAnalysis = async () => {
  batchAnalysisActive.value = true; isAnalyzingBatch.value = true
  const selectedItems = items.value.filter(i => selectedIds.value.includes(i.id))
  batchResults.value = selectedItems.map(i => ({ id: i.id, originalTitle: i.title, file_url: i.file_url, type: i.type, status: 'processing', data: null, errorMessage: null }))
  const promises = batchResults.value.map(async (res) => {
    try {
      const analysis: any = await $fetch('/api/analyze', { method: 'POST', body: { documentId: res.id, fileUrl: res.file_url, filename: res.originalTitle } })
      res.data = analysis; res.status = 'complete'
    } catch (err: any) { res.status = 'error'; res.errorMessage = err.message }
  })
  await Promise.all(promises); isAnalyzingBatch.value = false
}

const saveBatchResults = async () => {
  publishingBatch.value = true
  try {
    for (const res of batchResults.value.filter(r => r.status === 'complete')) { await publishItem(res.data, res.id) }
    closeBatch(); await fetchData()
  } finally { publishingBatch.value = false }
}

const closeBatch = () => { batchAnalysisActive.value = false; batchResults.value = []; selectedIds.value = [] }

const publishItem = async (data: any, id: string) => {
  let categoryId = null
  if (data.category_name) {
    const slug = data.category_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')
    const { data: cat } = await supabase.from('categories').upsert({ name: data.category_name, slug }, { onConflict: 'slug' }).select().single()
    if (cat) categoryId = (cat as any).id
  }
  await supabase.from('documents').update({ title: data.title, type: data.type || 'Documento', summary: data.summary, publication_year: data.publication_year, language: data.language, thumbnail_url: data.thumbnail_url, category_id: categoryId, status: 'published' }).eq('id', id)
  
  if (data.authors_list) {
    await supabase.from('document_authors').delete().eq('document_id', id)
    for (const name of data.authors_list.split(',').map((a: string) => a.trim())) {
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')
      const { data: aut } = await supabase.from('authors').upsert({ name, slug }, { onConflict: 'slug' }).select().single()
      if (aut) await supabase.from('document_authors').insert({ document_id: id, author_id: (aut as any).id })
    }
  }

  if (data.tags_list) {
    await supabase.from('document_tags').delete().eq('document_id', id)
    for (const name of data.tags_list.split(',').map((t: string) => t.trim())) {
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')
      const { data: tag } = await supabase.from('tags').upsert({ name, slug }, { onConflict: 'slug' }).select().single()
      if (tag) await supabase.from('document_tags').insert({ document_id: id, tag_id: (tag as any).id })
    }
  }
}

const publish = async () => { publishing.value = true; try { await publishItem(editingItem.value, editingItem.value.id); editingItem.value = null; await fetchData() } finally { publishing.value = false } }

const handleCoverUpload = async (e: any) => {
  const file = e.target.files[0]; if (!file) return; uploadingCover.value = true
  try {
    const fileName = `covers/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('covers').upload(fileName, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName)
    editingItem.value.thumbnail_url = publicUrl
  } finally { uploadingCover.value = false }
}

const analyzeWithAI = async () => {
  analyzing.value = true
  try {
    const analysis: any = await $fetch('/api/analyze', { method: 'POST', body: { documentId: editingItem.value.id, fileUrl: editingItem.value.file_url, filename: editingItem.value.title } })
    editingItem.value = { ...editingItem.value, ...analysis }
  } finally { analyzing.value = false }
}

const deleteItem = async (item: any) => { 
  if (!confirm('Remover permanentemente?')) return
  try { await $fetch(`/api/documents/${item.id}`, { method: 'DELETE' }); await fetchData() } catch (err) { alert('Erro ao deletar documento.') }
}

const logout = async () => { await supabase.auth.signOut(); navigateTo('/login') }

watch(currentTab, fetchData)
onMounted(fetchData)
</script>

<style scoped>
.animate-progress-indefinite { width: 100%; animation: progress-indefinite 2s infinite linear; transform-origin: 0% 50%; }
@keyframes progress-indefinite { 0% { transform: translateX(0) scaleX(0); } 40% { transform: translateX(0) scaleX(0.4); } 100% { transform: translateX(100%) scaleX(0.5); } }
</style>
