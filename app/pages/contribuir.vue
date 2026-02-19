<template>
  <NuxtLayout>
    <section ref="topRef" class="py-20 bg-cantuaria-oxford text-white overflow-hidden relative">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000')] bg-cover bg-center grayscale scale-110"></div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-6xl font-serif mb-6 leading-tight">Envio Rápido <br />de Documentos</h1>
          <p class="text-white/60 text-lg leading-relaxed">
            Selecione múltiplos arquivos para contribuir com o acervo. Nossa equipe (e nossa IA) cuidará de toda a catalogação técnica.
          </p>
        </div>
      </div>
    </section>

    <section class="py-20 bg-cantuaria-cream">
      <div class="container mx-auto px-6">
        <div v-if="success" class="max-w-2xl mx-auto text-center py-20 animate-fade-in">
          <LucideCheckCircle class="w-20 h-20 text-cantuaria-gold mx-auto mb-8" />
          <h2 class="text-4xl font-serif text-cantuaria-oxford mb-4">Arquivos enviados com sucesso!</h2>
          <p class="text-cantuaria-charcoal/60 mb-10 leading-relaxed">
            Muito obrigado por sua contribuição. Os documentos já estão na nossa fila de curadoria.
          </p>
          <button @click="resetFlow" class="btn-primary">Enviar mais arquivos</button>
        </div>

        <div v-else class="max-w-4xl mx-auto">
          <!-- Dropzone -->
          <div 
            @click="($refs.fileInput as HTMLInputElement).click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
              'border-2 border-dashed p-16 text-center group transition-all cursor-pointer bg-white shadow-sm',
              isDragging ? 'border-cantuaria-gold bg-cantuaria-gold/5 scale-[1.01]' : 'border-cantuaria-charcoal/10 hover:border-cantuaria-oxford/30'
            ]"
          >
            <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileSelect" accept=".pdf,.epub,.docx,.txt" />
            
            <div class="flex flex-col items-center">
              <div class="w-20 h-20 bg-cantuaria-oxford/5 flex items-center justify-center rounded-full mb-6 group-hover:bg-cantuaria-oxford group-hover:text-white transition-colors">
                <LucideFileUp class="w-10 h-10 text-cantuaria-oxford/40 group-hover:text-white" />
              </div>
              <h3 class="text-xl font-serif text-cantuaria-oxford mb-2">Arraste seus arquivos aqui</h3>
              <p class="text-sm text-cantuaria-charcoal/40 font-medium">Ou <span class="text-cantuaria-oxford underline">clique para selecionar do computador</span></p>
              <p class="text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest mt-4 font-bold">PDF, EPUB ou DOCX</p>
            </div>
          </div>

          <!-- Selected Files List -->
          <div v-if="selectedFiles.length > 0" id="file-list" ref="listRef" class="mt-12 space-y-4 animate-fade-in">
            <div class="flex justify-between items-center mb-6">
              <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Arquivos Selecionados ({{ selectedFiles.length }})</h4>
              <button @click="selectedFiles = []" class="text-[10px] uppercase font-bold text-cantuaria-crimson hover:underline">Limpar Tudo</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(file, idx) in selectedFiles" :key="idx" class="flex items-center justify-between p-4 bg-white border border-cantuaria-charcoal/5 shadow-sm">
                <div class="flex items-center gap-3 truncate">
                  <LucideFileText class="w-5 h-5 text-cantuaria-oxford/20" />
                  <div class="truncate">
                    <p class="text-sm font-bold text-cantuaria-oxford truncate">{{ file.name }}</p>
                    <p class="text-[10px] text-cantuaria-charcoal/40 uppercase">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
                  </div>
                </div>
                <button @click.stop="removeFile(idx)" class="p-2 hover:bg-cantuaria-crimson/5 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors">
                  <LucideX class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="duplicatesFound.length > 0" class="p-4 bg-amber-50 border border-cantuaria-gold/20 rounded">
              <div class="flex items-center gap-3 text-amber-800 mb-2 font-bold text-xs">
                <LucideAlertTriangle class="w-4 h-4" />
                Arquivos já existentes no acervo:
              </div>
              <ul class="text-[10px] text-amber-700 list-disc list-inside">
                <li v-for="name in duplicatesFound" :key="name">{{ name }}</li>
              </ul>
              <p class="mt-2 text-[9px] text-amber-600 uppercase font-bold">Eles serão ignorados no envio.</p>
            </div>

            <div v-if="error" class="text-sm text-cantuaria-crimson font-medium bg-cantuaria-crimson/5 p-4 rounded border border-cantuaria-crimson/10 mt-8">
              {{ error }}
            </div>

            <div class="pt-12">
              <button 
                @click="handleSubmit" 
                :disabled="uploading || (selectedFiles.length === duplicatesFound.length)"
                class="w-full py-6 bg-cantuaria-oxford text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cantuaria-oxford/90 shadow-2xl transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <template v-if="uploading">
                  <LucideLoader2 class="w-5 h-5 animate-spin" />
                  Enviando {{ currentUploadIndex + 1 }} de {{ selectedFiles.length - duplicatesFound.length }}...
                </template>
                <template v-else>
                  Confirmar Envio de {{ selectedFiles.length - duplicatesFound.length }} Arquivos
                </template>
              </button>
              <p class="text-center text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest mt-8 italic">
                "O conhecimento é a luz que não se apaga."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  FileUp as LucideFileUp, 
  FileText as LucideFileText, 
  CheckCircle as LucideCheckCircle,
  Loader2 as LucideLoader2,
  X as LucideX,
  AlertTriangle as LucideAlertTriangle
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const uploading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const selectedFiles = ref<File[]>([])
const duplicatesFound = ref<string[]>([])
const isDragging = ref(false)
const currentUploadIndex = ref(0)

const topRef = ref<HTMLElement | null>(null)

useSeoMeta({
  title: 'Contribuir | Projeto Cantuária',
  description: 'Envie documentos históricos, livros ou artigos para serem preservados em nossa biblioteca digital.'
})

// Função para calcular SHA-256 do arquivo (DNA do conteúdo)
const calculateHash = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const slugify = (text: string) => {
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')
}

const handleFileSelect = (e: any) => {
  const files = Array.from(e.target.files) as File[]
  addFiles(files)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files) as File[]
    addFiles(files)
  }
}

const addFiles = async (newFiles: File[]) => {
  const allowedExts = ['pdf', 'epub', 'docx', 'txt']
  const filtered = newFiles.filter(f => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    return ext && allowedExts.includes(ext)
  })
  
  selectedFiles.value = [...selectedFiles.value, ...filtered]
  error.value = null
  duplicatesFound.value = []

  // Verificar duplicatas no banco via Hash
  for (const file of selectedFiles.value) {
    const hash = await calculateHash(file)
    const { data } = await supabase.from('documents').select('title').eq('file_hash', hash).maybeSingle()
    if (data) {
      duplicatesFound.value.push(file.name)
    }
  }

  if (filtered.length > 0) {
    nextTick(() => {
      const el = document.getElementById('file-list')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

const removeFile = (index: number) => {
  const name = selectedFiles.value[index].name
  selectedFiles.value.splice(index, 1)
  duplicatesFound.value = duplicatesFound.value.filter(n => n !== name)
}

const resetFlow = () => {
  success.value = false
  selectedFiles.value = []
  duplicatesFound.value = []
  error.value = null
  topRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const handleSubmit = async () => {
  const filesToUpload = selectedFiles.value.filter(f => !duplicatesFound.value.includes(f.name))
  if (filesToUpload.length === 0) return

  uploading.value = true
  error.value = null

  try {
    for (let i = 0; i < filesToUpload.length; i++) {
      currentUploadIndex.value = i
      const file = filesToUpload[i]
      const hash = await calculateHash(file)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

      const provTitle = file.name.replace(/\.[^/.]+$/, "")
      const { error: dbError } = await supabase.from('documents').insert({
        title: provTitle,
        type: 'Documento', 
        file_url: publicUrl,
        file_hash: hash,
        slug: `${slugify(provTitle)}-${Date.now().toString().slice(-4)}`,
        status: 'pending'
      })

      if (dbError) throw dbError
    }

    success.value = true
    nextTick(() => { topRef.value?.scrollIntoView({ behavior: 'smooth' }) })
  } catch (err) {
    console.error('Erro no envio múltiplo:', err)
    error.value = 'Erro ao enviar. Verifique sua conexão.'
  } finally {
    uploading.value = false
    currentUploadIndex.value = 0
  }
}
</script>

<style scoped>
@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #C5A059; }
</style>
