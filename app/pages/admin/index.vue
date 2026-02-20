<template>
  <NuxtLayout>
    <div class="min-h-screen bg-cantuaria-cream/30">
      <AdminHeader @logout="logout" />

      <section class="container mx-auto px-6 py-12">
        <div class="flex flex-col space-y-6 mb-8">
          <AdminTabs 
            v-model:currentTab="currentTab"
            :pending-count="pendingCount"
            :removal-count="removalRequests.length"
            :publications-count="publications.length"
            :selected-count="selectedIds.length"
            :deleting-bulk="deletingBulk"
            @start-batch-analysis="startBatchAnalysis"
            @start-batch-ocr="startBatchOcr"
            @delete-selected="deleteSelected"
          />

          <AdminFilters 
            v-if="currentTab !== 'removal'"
            v-model:search-query="searchQuery"
            v-model:view-mode="viewMode"
            v-model:order-by="orderBy"
            v-model:page-size="pageSize"
            v-model:filter-no-markdown="filterNoMarkdown"
            v-model:filter-no-cover="filterNoCover"
          />
        </div>

        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <div v-else class="relative">
          <!-- Overlay de carregamento para detalhes -->
          <div v-if="loadingDetails" class="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <LucideLoader2 class="w-8 h-8 animate-spin text-cantuaria-oxford" />
          </div>

          <AdminRemovalRequests 
            v-if="currentTab === 'removal'"
            :requests="removalRequests"
            @handle-removal="handleRemoval"
          />

          <AdminPublicationsList 
            v-else-if="currentTab === 'publications'"
            :publications="publications"
            @open-new="openNewPublication"
            @open-edit="openEditPublication"
            @delete="deletePublication"
          />

          <AdminDocumentsView 
            v-else
            :items="items"
            :view-mode="viewMode"
            v-model:selected-ids="selectedIds"
            v-model:current-page="currentPage"
            :all-selected="allSelected"
            :total-items="totalItems"
            :page-size="pageSize"
            @open-review="openReview"
            @delete="deleteItem"
            @toggle-all="toggleAll"
          />
        </div>
      </section>

      <AdminBatchAnalysisModal 
        :active="batchAnalysisActive"
        :is-analyzing="isAnalyzingBatch"
        :publishing="publishingBatch"
        :results="batchResults"
        @close="closeBatch"
        @save="saveBatchResults"
      />

      <AdminBatchOcrModal 
        :active="batchOcrActive"
        :is-running="isRunningBatchOcr"
        :results="batchOcrResults"
        @close="closeBatchOcr"
      />

      <AdminDocumentModal 
        v-model="editingItem"
        :publications="publications"
        :analyzing="analyzing"
        :publishing="publishing"
        :uploading-cover="uploadingCover"
        :capturing-pdf="capturingPdf"
        :performing-o-c-r="performingOCR"
        @run-ocr="runOCRAnalysis"
        @analyze="analyzeWithAI()"
        @trigger-upload="($refs.coverInput as any).click()"
        @generate-cover="generateInstitutionalCover"
        @capture-pdf-cover="capturePdfCover"
        @update-slug="updateSlugSuggestion"
        @publish="publish"
      />

      <AdminPublicationModal 
        v-model="editingPublication"
        :saving="savingPublication"
        :uploading-cover="uploadingCover"
        @trigger-upload="($refs.pubCoverInput as any).click()"
        @update-slug="updatePublicationSlug"
        @save="savePublication"
      />

      <AdminCropModal 
        :show="showCropModal"
        :image="croppingImage"
        :loading="uploadingCover"
        @close="showCropModal = false"
        @confirm="confirmCrop"
      />

      <!-- Hidden Inputs for File Uploads -->
      <input ref="coverInput" type="file" class="hidden" @change="handleCoverUpload" accept="image/*" />
      <input ref="pubCoverInput" type="file" class="hidden" @change="handlePublicationCoverUpload" accept="image/*" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Loader2 as LucideLoader2 } from 'lucide-vue-next'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminTabs from '~/components/admin/AdminTabs.vue'
import AdminFilters from '~/components/admin/AdminFilters.vue'
import AdminRemovalRequests from '~/components/admin/AdminRemovalRequests.vue'
import AdminPublicationsList from '~/components/admin/AdminPublicationsList.vue'
import AdminDocumentsView from '~/components/admin/AdminDocumentsView.vue'
import AdminBatchAnalysisModal from '~/components/admin/AdminBatchAnalysisModal.vue'
import AdminBatchOcrModal from '~/components/admin/AdminBatchOcrModal.vue'
import AdminDocumentModal from '~/components/admin/AdminDocumentModal.vue'
import AdminPublicationModal from '~/components/admin/AdminPublicationModal.vue'
import AdminCropModal from '~/components/admin/AdminCropModal.vue'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()
const loading = ref(true)
const loadingDetails = ref(false)
const currentTab = ref<'pending' | 'published' | 'removal' | 'publications'>('pending')
const items = ref<any[]>([])
const pendingCount = ref(0)
const editingItem = ref<any>(null)
const analyzing = ref(false)
const publishing = ref(false)
const uploadingCover = ref(false)
const capturingPdf = ref(false)
const performingOCR = ref(false)
const deletingBulk = ref(false)
const viewMode = ref<'table' | 'grid'>('table')
const croppingTarget = ref<'document' | 'publication'>('document')

const removalRequests = ref<any[]>([])
const searchQuery = ref('')
const currentPage = ref(0)
const pageSize = ref(10)
const totalItems = ref(0)
const orderBy = ref('created_at:desc')
const filterNoMarkdown = ref(false)
const filterNoCover = ref(false)

const showCropModal = ref(false)
const croppingImage = ref('')
const selectedIds = ref<string[]>([])
const allSelected = computed(() => items.value.length > 0 && selectedIds.value.length === items.value.length)
const batchAnalysisActive = ref(false)
const isAnalyzingBatch = ref(false)
const publishingBatch = ref(false)
const batchResults = ref<any[]>([])

const publications = ref<any[]>([])
const editingPublication = ref<any>(null)
const savingPublication = ref(false)

const batchOcrActive = ref(false)
const isRunningBatchOcr = ref(false)
const batchOcrResults = ref<any[]>([])

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

const updateSlugSuggestion = () => {
  if (editingItem.value && editingItem.value.title) {
    const cleanSlug = slugify(editingItem.value.title)
    if (!editingItem.value.slug || editingItem.value.slug.length < 5) {
      editingItem.value.slug = `${cleanSlug}-${Math.random().toString(36).slice(-4)}`
    }
  }
}

const fetchRemovalRequests = async () => {
  try {
    const data: any = await $fetch('/api/admin/removal-requests')
    removalRequests.value = data
  } catch (err) {
    console.error('Erro ao buscar solicitações:', err)
  }
}

const handleRemoval = async (requestId: string, action: 'approve' | 'deny') => {
  if (action === 'approve' && !confirm('Tem certeza que deseja EXCLUIR permanentemente esta obra?')) return
  try {
    await $fetch('/api/admin/handle-removal', { method: 'POST', body: { requestId, action } })
    await fetchRemovalRequests()
    await fetchData()
  } catch (err) {
    alert('Erro ao processar solicitação.')
  }
}

const fetchData = async () => {
  loading.value = true
  selectedIds.value = []
  if (currentTab.value === 'publications') {
    await fetchPublications()
    loading.value = false
    return
  }
  if (currentTab.value === 'removal') {
    await fetchRemovalRequests()
    loading.value = false
    return
  }
  
  // Seleção otimizada para listagem (usando a coluna virtual has_markdown)
  const optimizedSelect = 'id, title, slug, type, thumbnail_url, publication_year, language, created_at, status, has_markdown, authors(name), categories(name), tags(name)'
  
  let query = supabase.from('documents').select(optimizedSelect, { count: 'exact' }).eq('status', currentTab.value)
  if (searchQuery.value) query = query.textSearch('search_vector', searchQuery.value, { config: 'portuguese', type: 'websearch' })
  
  if (filterNoMarkdown.value) query = query.is('content_markdown', null)
  if (filterNoCover.value) query = query.is('thumbnail_url', null)

  const [column, direction] = orderBy.value.split(':')
  query = query.order(column, { ascending: direction === 'asc' })
  const from = currentPage.value * pageSize.value
  const to = from + pageSize.value - 1
  query = query.range(from, to)
  const { data, count, error } = await query
  if (!error && data) {
    items.value = data.map(doc => ({ 
      ...doc, 
      authors_list: doc.authors?.map((a: any) => a.name).join(', '), 
      tags_list: doc.tags?.map((t: any) => t.name).join(', '), 
      category_name: doc.categories?.name 
    }))
    totalItems.value = count || 0
  }
  const { count: pCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  pendingCount.value = pCount || 0
  fetchRemovalRequests()
  loading.value = false
}

watchDebounced(searchQuery, () => { currentPage.value = 0; fetchData() }, { debounce: 500 })
watch([currentPage, pageSize, orderBy, currentTab, filterNoMarkdown, filterNoCover], () => { fetchData() })

const toggleAll = () => { selectedIds.value = allSelected.value ? [] : items.value.map(i => i.id) }
const openReview = async (item: any) => {
  loadingDetails.value = true
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*, authors(name), categories(name), tags(name)')
      .eq('id', item.id)
      .single()
    if (data) {
      editingItem.value = {
        ...data,
        authors_list: data.authors?.map((a: any) => a.name).join(', '), 
        tags_list: data.tags?.map((t: any) => t.name).join(', '), 
        category_name: data.categories?.name 
      }
    }
  } finally { loadingDetails.value = false }
}

const generateInstitutionalCover = async () => {
  if (!editingItem.value.title) return; uploadingCover.value = true
  try {
    const { url }: any = await $fetch('/api/generate-cover', { method: 'POST', body: { title: editingItem.value.title, author: editingItem.value.authors_list?.split(',')[0] } })
    editingItem.value.thumbnail_url = url
  } finally { uploadingCover.value = false }
}

const capturePdfCover = async () => {
  if (!editingItem.value.file_url || !process.client) return; 
  capturingPdf.value = true
  try {
    const pdfjs = await import('pdfjs-dist')
    const version = '5.4.624'
    const cdnBase = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}`
    
    pdfjs.GlobalWorkerOptions.workerSrc = `${cdnBase}/build/pdf.worker.min.mjs`
    
    const loadingTask = pdfjs.getDocument({ 
      url: editingItem.value.file_url, 
      disableFontFace: true,
      cMapUrl: `${cdnBase}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${cdnBase}/standard_fonts/`,
      wasmUrl: `${cdnBase}/wasm/`
    })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas'); const context = canvas.getContext('2d')
    canvas.height = viewport.height; canvas.width = viewport.width
    await page.render({ canvasContext: context!, viewport }).promise
    croppingImage.value = canvas.toDataURL('image/jpeg', 0.9)
    showCropModal.value = true
  } catch (err) { 
    console.error('Erro na captura:', err); alert('Erro na captura. Verifique o acesso CORS do arquivo.') 
  } finally { capturingPdf.value = false }
}

const confirmCrop = async (cropperInstance: any) => {
  uploadingCover.value = true
  try {
    const canvas = cropperInstance.getCroppedCanvas({ width: 600, height: 900 })
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.85))
    const fileName = `covers/pdf-capture-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('covers').upload(fileName, blob)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName)
    await new Promise((resolve, reject) => {
      const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = publicUrl
    })
    if (croppingTarget.value === 'publication') { editingPublication.value.cover_url = publicUrl } 
    else { editingItem.value.thumbnail_url = publicUrl }
    showCropModal.value = false
  } catch (err) {
    console.error('Erro ao salvar recorte:', err); alert('Erro ao salvar o recorte da imagem.')
  } finally { uploadingCover.value = false }
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
    for (const res of batchResults.value.filter(r => r.status === 'complete')) { 
      res.data.slug = res.data.slug || `${slugify(res.data.title)}-${Math.random().toString(36).slice(-4)}`
      await $fetch('/api/documents/publish', { method: 'POST', body: { id: res.id, data: res.data } })
    }
    closeBatch(); await fetchData()
  } catch (err) { alert('Erro ao salvar lote.') } finally { publishingBatch.value = false }
}

const closeBatch = () => { batchAnalysisActive.value = false; batchResults.value = []; selectedIds.value = [] }

const deleteSelected = async () => {
  if (!confirm(`Tem certeza que deseja excluir permanentemente ${selectedIds.value.length} itens?`)) return
  deletingBulk.value = true
  try {
    await $fetch('/api/documents/batch-delete', { method: 'POST', body: { ids: selectedIds.value } })
    selectedIds.value = []; await fetchData()
  } catch (err) { alert('Erro ao excluir itens em lote.') } finally { deletingBulk.value = false }
}

const publish = async () => { 
  publishing.value = true
  try { 
    await $fetch('/api/documents/publish', { method: 'POST', body: { id: editingItem.value.id, data: editingItem.value } })
    
    // Atualização local otimizada
    const index = items.value.findIndex(i => i.id === editingItem.value.id)
    if (index !== -1) {
      if (currentTab.value === 'pending') {
        // Se saiu de pendente, remove da lista
        items.value.splice(index, 1)
        totalItems.value--
        pendingCount.value--
      } else {
        // Se já estava em publicado, atualiza os dados
        items.value[index] = { 
          ...items.value[index], 
          ...editingItem.value,
          has_markdown: !!editingItem.value.content_markdown
        }
      }
    }
    
    editingItem.value = null
  } catch (err) { alert('Erro ao publicar documento.') } finally { publishing.value = false } 
}

const handleCoverUpload = (e: any) => {
  croppingTarget.value = 'document'
  const file = e.target.files[0]; if (!file) return; 
  const reader = new FileReader()
  reader.onload = (event) => { croppingImage.value = event.target?.result as string; showCropModal.value = true }
  reader.readAsDataURL(file)
}

const handlePublicationCoverUpload = (e: any) => {
  croppingTarget.value = 'publication'
  const file = e.target.files[0]; if (!file) return; 
  const reader = new FileReader()
  reader.onload = (event) => { croppingImage.value = event.target?.result as string; showCropModal.value = true }
  reader.readAsDataURL(file)
}

const analyzeWithAI = async (ocrText?: string) => {
  analyzing.value = true
  try {
    const analysis: any = await $fetch('/api/analyze', { method: 'POST', body: { documentId: editingItem.value.id, fileUrl: editingItem.value.file_url, filename: editingItem.value.title, ocrText } })
    editingItem.value = { ...editingItem.value, ...analysis }; updateSlugSuggestion()
  } finally { analyzing.value = false }
}

const runOCRAnalysis = async () => {
  if (!editingItem.value?.file_url || !editingItem.value?.id) return
  performingOCR.value = true
  try {
    const result: any = await $fetch('/api/ocr', { method: 'POST', body: { documentId: editingItem.value.id, fileUrl: editingItem.value.file_url } })
    editingItem.value.content_markdown = result.markdown
    if (result.extractedText) await analyzeWithAI(result.extractedText)
  } catch (err: any) { alert('Erro no OCR: ' + (err.data?.message || err.message)) } finally { performingOCR.value = false }
}

const startBatchOcr = async () => {
  batchOcrActive.value = true; isRunningBatchOcr.value = true
  const selectedItems = items.value.filter(i => selectedIds.value.includes(i.id))
  batchOcrResults.value = selectedItems.map(i => ({ id: i.id, originalTitle: i.title, file_url: i.file_url, status: 'pending', chars: 0, errorMessage: null }))
  const promises = batchOcrResults.value.map(async (res) => {
    res.status = 'processing'
    try {
      const result: any = await $fetch('/api/ocr', { method: 'POST', body: { documentId: res.id, fileUrl: res.file_url } })
      res.chars = result.markdown?.length || 0; res.status = 'complete'
    } catch (err: any) { res.status = 'error'; res.errorMessage = err.data?.message || err.message }
  })
  await Promise.all(promises); isRunningBatchOcr.value = false
}

const closeBatchOcr = () => { batchOcrActive.value = false; batchOcrResults.value = []; selectedIds.value = [] }

const deleteItem = async (item: any) => { 
  if (!confirm('Remover permanentemente?')) return
  try { await $fetch(`/api/documents/${item.id}`, { method: 'DELETE' }); await fetchData() } catch (err) { alert('Erro ao deletar documento.') }
}

const logout = async () => { await supabase.auth.signOut(); navigateTo('/login') }

const fetchPublications = async () => { publications.value = await $fetch('/api/publications') as any[] }
const openNewPublication = () => { editingPublication.value = { title: '', slug: '', description: '', cover_url: null, publisher: '', publication_type: '', start_year: null, end_year: null } }
const openEditPublication = (pub: any) => { editingPublication.value = JSON.parse(JSON.stringify(pub)) }
const updatePublicationSlug = () => { if (editingPublication.value?.title && !editingPublication.value.id) editingPublication.value.slug = slugify(editingPublication.value.title) }

const savePublication = async () => {
  if (!editingPublication.value.title || !editingPublication.value.slug) return alert('Preencha título e slug.')
  savingPublication.value = true
  try {
    if (editingPublication.value.id) await $fetch(`/api/publications/${editingPublication.value.id}`, { method: 'PUT', body: editingPublication.value })
    else await $fetch('/api/publications', { method: 'POST', body: editingPublication.value })
    editingPublication.value = null; await fetchPublications()
  } catch (err: any) { alert('Erro ao salvar: ' + (err.data?.message || err.message)) } finally { savingPublication.value = false }
}

const deletePublication = async (pub: any) => {
  if (!confirm(`Excluir "${pub.title}"?`)) return
  try { await $fetch(`/api/publications/${pub.id}`, { method: 'DELETE' }); await fetchPublications() } catch (err) { alert('Erro ao excluir.') }
}

onMounted(() => { fetchData(); fetchPublications() })
</script>

<style scoped>
.animate-progress-indefinite { width: 100%; animation: progress-indefinite 2s infinite linear; transform-origin: 0% 50%; }
@keyframes progress-indefinite { 0% { transform: translateX(0) scaleX(0); } 40% { transform: translateX(0) scaleX(0.4); } 100% { transform: translateX(100%) scaleX(0.5); } }
</style>
