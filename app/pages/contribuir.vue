<template>
  <NuxtLayout>
    <section ref="topRef" class="py-6 bg-cantuaria-oxford text-white overflow-hidden relative">
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

    <section class="py-6 bg-cantuaria-cream">
      <div class="container mx-auto px-6">
        <div v-if="allFinished && successCount > 0" class="max-w-2xl mx-auto text-center py-20 animate-fade-in">
          <LucideCheckCircle class="w-20 h-20 text-cantuaria-gold mx-auto mb-8" />
          <h2 class="text-4xl font-serif text-cantuaria-oxford mb-4">{{ successCount }} arquivos enviados com sucesso!</h2>
          <p v-if="errorCount > 0" class="text-cantuaria-crimson mb-6 font-bold">Nota: {{ errorCount }} arquivos falharam no processo.</p>
          <p class="text-cantuaria-charcoal/60 mb-10 leading-relaxed">
            Muito obrigado por sua contribuição. Os documentos já estão na nossa fila de curadoria.
          </p>
          <button @click="resetFlow" class="btn-primary">Enviar mais arquivos</button>
        </div>

        <div v-else class="max-w-4xl mx-auto">
          <!-- Dropzone -->
          <div 
            v-if="!isUploading"
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
              <p class="text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest mt-4 font-bold">PDF, EPUB ou DOCX (Máx 50MB por arquivo)</p>
            </div>
          </div>

          <!-- Upload Status View -->
          <div v-if="filesStatus.length > 0" id="file-list" class="mt-12 space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
              <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Fila de Envio ({{ filesStatus.length }})</h4>
              <button v-if="!isUploading" @click="clearList" class="text-[10px] uppercase font-bold text-cantuaria-crimson hover:underline">Limpar Tudo</button>
            </div>

            <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(file, idx) in filesStatus" :key="idx" 
                class="bg-white border p-4 shadow-sm transition-all flex flex-col gap-3"
                :class="[
                  file.status === 'success' ? 'border-green-100 bg-green-50/10' : 
                  file.status === 'error' ? 'border-red-100 bg-red-50/10' : 'border-cantuaria-charcoal/5'
                ]"
              >
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 truncate">
                    <LucideFileText class="w-5 h-5" :class="file.status === 'success' ? 'text-green-500' : file.status === 'error' ? 'text-red-500' : 'text-cantuaria-oxford/20'" />
                    <div class="truncate">
                      <p class="text-sm font-bold text-cantuaria-oxford truncate">{{ file.name }}</p>
                      <p class="text-[10px] text-cantuaria-charcoal/40 uppercase">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3 shrink-0">
                    <span v-if="file.status === 'processing'" class="text-[8px] uppercase font-bold text-cantuaria-gold animate-pulse">Enviando...</span>
                    <span v-if="file.status === 'success'" class="text-[8px] uppercase font-bold text-green-600 flex items-center gap-1"><LucideCheck class="w-3 h-3" /> Concluído</span>
                    <span v-if="file.status === 'error'" class="text-[8px] uppercase font-bold text-red-600" :title="file.error">{{ file.error }}</span>
                    <button v-if="file.status === 'idle' && !isUploading" @click="removeFile(idx)" class="p-1 hover:text-cantuaria-crimson text-cantuaria-charcoal/20 transition-colors"><LucideX class="w-4 h-4" /></button>
                  </div>
                </div>

                <!-- Progress Bar Individual -->
                <div v-if="file.status === 'processing'" class="h-1 bg-cantuaria-oxford/5 w-full overflow-hidden rounded-full">
                  <div class="h-full bg-cantuaria-gold animate-progress-indefinite"></div>
                </div>
              </div>
            </div>

            <div v-if="!isUploading" class="pt-8">
              <button 
                @click="startUploadFlow" 
                :disabled="idleFilesCount === 0"
                class="w-full py-6 bg-cantuaria-oxford text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cantuaria-oxford/90 shadow-2xl transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <span>Enviar {{ idleFilesCount }} Arquivos</span>
              </button>
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
  Check as LucideCheck
} from 'lucide-vue-next'

interface FileEntry {
  file: File;
  name: string;
  size: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  error?: string;
}

const supabase = useSupabaseClient()
const isDragging = ref(false)
const isUploading = ref(false)
const allFinished = ref(false)
const filesStatus = ref<FileEntry[]>([])
const topRef = ref<HTMLElement | null>(null)

const successCount = computed(() => filesStatus.value.filter(f => f.status === 'success').length)
const errorCount = computed(() => filesStatus.value.filter(f => f.status === 'error').length)
const idleFilesCount = computed(() => filesStatus.value.filter(f => f.status === 'idle').length)

const calculateHash = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const slugify = (text: string) => text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')

const handleFileSelect = (e: any) => addFiles(Array.from(e.target.files) as File[])
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files) as File[])
}

const addFiles = (newFiles: File[]) => {
  const allowedExts = ['pdf', 'epub', 'docx', 'txt']
  const maxSizeBytes = 50 * 1024 * 1024 // 50MB

  newFiles.forEach(f => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    let initialStatus: any = 'idle'
    let initialError = ''

    if (!ext || !allowedExts.includes(ext)) {
      initialStatus = 'error'
      initialError = 'Formato não suportado'
    } else if (f.size > maxSizeBytes) {
      initialStatus = 'error'
      initialError = 'Arquivo muito grande (Máx 50MB)'
    }

    filesStatus.value.push({
      file: f,
      name: f.name,
      size: f.size,
      status: initialStatus,
      error: initialError
    })
  })

  nextTick(() => {
    document.getElementById('file-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const removeFile = (idx: number) => filesStatus.value.splice(idx, 1)
const clearList = () => filesStatus.value = []
const resetFlow = () => {
  allFinished.value = false
  filesStatus.value = []
  isUploading.value = false
  topRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const startUploadFlow = async () => {
  isUploading.value = true
  
  for (let i = 0; i < filesStatus.value.length; i++) {
    const entry = filesStatus.value[i]
    if (entry.status !== 'idle') continue

    entry.status = 'processing'
    
    try {
      // 1. Verificar Duplicidade
      const hash = await calculateHash(entry.file)
      const { data: duplicate } = await supabase.from('documents').select('id').eq('file_hash', hash).maybeSingle()
      
      if (duplicate) {
        entry.status = 'error'
        entry.error = 'Arquivo já existe no acervo'
        continue
      }

      // 2. Upload para Storage
      const fileExt = entry.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, entry.file)
      if (uploadError) throw new Error('Falha no upload do arquivo')

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

      // 3. Inserir no Banco
      const provTitle = entry.name.replace(/\.[^/.]+$/, "")
      const { error: dbError } = await supabase.from('documents').insert({
        title: provTitle,
        type: 'Documento', 
        file_url: publicUrl,
        file_hash: hash,
        slug: `${slugify(provTitle)}-${Date.now().toString().slice(-4)}`,
        status: 'pending'
      })

      if (dbError) throw new Error('Falha ao registrar no banco')

      entry.status = 'success'
    } catch (err: any) {
      console.error(`Erro no arquivo ${entry.name}:`, err)
      entry.status = 'error'
      entry.error = err.message || 'Erro desconhecido'
    }
  }

  isUploading.value = false
  allFinished.value = true
}
</script>

<style scoped>
@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #C5A059; }

.animate-progress-indefinite { width: 100%; animation: progress-indefinite 2s infinite linear; transform-origin: 0% 50%; }
@keyframes progress-indefinite { 0% { transform: translateX(0) scaleX(0); } 40% { transform: translateX(0) scaleX(0.4); } 100% { transform: translateX(100%) scaleX(0.5); } }
</style>
