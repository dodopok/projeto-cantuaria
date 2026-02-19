<template>
  <NuxtLayout>
    <section class="py-20 bg-cantuaria-oxford text-white overflow-hidden relative">
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
          <div v-if="selectedFiles.length > 0" class="mt-12 space-y-4 animate-fade-in">
            <div class="flex justify-between items-center mb-6">
              <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Arquivos Selecionados ({{ selectedFiles.length }})</h4>
              <button @click="selectedFiles = []" class="text-[10px] uppercase font-bold text-cantuaria-crimson hover:underline">Limpar Tudo</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div v-if="error" class="text-sm text-cantuaria-crimson font-medium bg-cantuaria-crimson/5 p-4 rounded border border-cantuaria-crimson/10 mt-8">
              {{ error }}
            </div>

            <div class="pt-12">
              <button 
                @click="handleSubmit" 
                :disabled="uploading"
                class="w-full py-6 bg-cantuaria-oxford text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cantuaria-oxford/90 shadow-2xl transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <template v-if="uploading">
                  <LucideLoader2 class="w-5 h-5 animate-spin" />
                  Enviando {{ currentUploadIndex + 1 }} de {{ selectedFiles.length }}...
                </template>
                <template v-else>
                  Confirmar Envio de {{ selectedFiles.length }} Arquivos
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
  X as LucideX
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const uploading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const selectedFiles = ref<File[]>([])
const isDragging = ref(false)
const currentUploadIndex = ref(0)

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

const addFiles = (newFiles: File[]) => {
  // Filtra por extensões permitidas
  const allowedExts = ['pdf', 'epub', 'docx', 'txt']
  const filtered = newFiles.filter(f => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    return ext && allowedExts.includes(ext)
  })
  
  selectedFiles.value = [...selectedFiles.value, ...filtered]
  error.value = null
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const resetFlow = () => {
  success.value = false
  selectedFiles.value = []
  error.value = null
}

const handleSubmit = async () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  error.value = null

  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      currentUploadIndex.value = i
      const file = selectedFiles.value[i]
      
      // 1. Upload para o Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Pegar URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // 3. Criar registro (título provisório = nome do arquivo sem extensão)
      const provTitle = file.name.replace(/\.[^/.]+$/, "")
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title: provTitle,
          type: 'Documento', // Default inicial
          file_url: publicUrl,
          slug: `${provTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
          status: 'pending'
        })

      if (dbError) throw dbError
    }

    success.value = true
  } catch (err) {
    console.error('Erro no envio múltiplo:', err)
    error.value = 'Ocorreu um erro ao enviar um ou mais documentos. Verifique sua conexão.'
  } finally {
    uploading.value = false
    currentUploadIndex.value = 0
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
