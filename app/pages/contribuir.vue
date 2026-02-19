<template>
  <NuxtLayout>
    <section class="py-20 bg-cantuaria-oxford text-white overflow-hidden relative">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000')] bg-cover bg-center grayscale scale-110"></div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-6xl font-serif mb-6 leading-tight">Expandindo <br />o Nosso Legado</h1>
          <p class="text-white/60 text-lg leading-relaxed">
            O Projeto Cantuária cresce através da generosidade de sua comunidade. Se você possui acesso a documentos, livros ou artigos que pertencem à tradição anglicana, compartilhe conosco.
          </p>
        </div>
      </div>
    </section>

    <section class="py-20 bg-cantuaria-cream">
      <div class="container mx-auto px-6">
        <div v-if="success" class="max-w-2xl mx-auto text-center py-20 animate-fade-in">
          <LucideCheckCircle class="w-20 h-20 text-cantuaria-gold mx-auto mb-8" />
          <h2 class="text-4xl font-serif text-cantuaria-oxford mb-4">Recebemos sua contribuição!</h2>
          <p class="text-cantuaria-charcoal/60 mb-10 leading-relaxed">
            Muito obrigado por ajudar a preservar a memória anglicana. Nossa equipe de curadoria analisará o documento em breve.
          </p>
          <button @click="success = false" class="btn-primary">Enviar outro documento</button>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div class="lg:col-span-4">
            <div class="sticky top-32 space-y-8">
              <div>
                <h3 class="font-serif text-2xl text-cantuaria-oxford mb-4">Diretrizes de Envio</h3>
                <ul class="space-y-4 text-sm text-cantuaria-charcoal/60 leading-relaxed">
                  <li class="flex gap-3">
                    <span class="w-5 h-5 flex items-center justify-center bg-cantuaria-gold/20 text-cantuaria-gold rounded-full shrink-0 font-bold text-[10px]">1</span>
                    Apenas documentos de domínio público ou com permissão explícita de distribuição.
                  </li>
                  <li class="flex gap-3">
                    <span class="w-5 h-5 flex items-center justify-center bg-cantuaria-gold/20 text-cantuaria-gold rounded-full shrink-0 font-bold text-[10px]">2</span>
                    Formatos aceitos: PDF (preferencial), EPUB ou imagens de alta resolução.
                  </li>
                  <li class="flex gap-3">
                    <span class="w-5 h-5 flex items-center justify-center bg-cantuaria-gold/20 text-cantuaria-gold rounded-full shrink-0 font-bold text-[10px]">3</span>
                    Todos os envios passam por uma revisão editorial antes da publicação.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="lg:col-span-8">
            <form @submit.prevent="handleSubmit" class="space-y-8 bg-white p-8 md:p-12 shadow-sm border border-cantuaria-charcoal/5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Título da Obra *</label>
                  <input v-model="form.title" type="text" placeholder="Ex: Livro de Oração Comum" required class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Autor(es) sugerido(s)</label>
                  <input v-model="form.author_hint" type="text" placeholder="Ex: Thomas Cranmer" class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Tipo de Documento *</label>
                  <select v-model="form.type" required class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford font-sans appearance-none bg-transparent">
                    <option value="Livro">Livro</option>
                    <option value="Artigo">Artigo / Ensaio</option>
                    <option value="Revista">Revista</option>
                    <option value="Documento">Documento Histórico</option>
                    <option value="LOC">Liturgia (LOC)</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Ano de Publicação (Aprox.)</label>
                  <input v-model="form.publication_year" type="number" placeholder="Ex: 1662" class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Arquivo do Documento *</label>
                <div 
                  @click="$refs.fileInput.click()"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  :class="[
                    'border-2 border-dashed p-12 text-center group transition-colors cursor-pointer bg-cantuaria-cream/20',
                    isDragging ? 'border-cantuaria-gold bg-cantuaria-gold/5' : 'border-cantuaria-charcoal/10 hover:border-cantuaria-oxford/30'
                  ]"
                >
                  <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" accept=".pdf,.epub,.docx,.txt" />
                  
                  <template v-if="!selectedFile">
                    <LucideFileUp class="w-10 h-10 mx-auto mb-4 text-cantuaria-charcoal/20 group-hover:text-cantuaria-oxford transition-colors" />
                    <p class="text-sm text-cantuaria-charcoal/40 font-medium">Arraste o arquivo aqui ou <span class="text-cantuaria-oxford underline">clique para selecionar</span></p>
                    <p class="text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest mt-2">PDF, EPUB ou DOCX (Máx. 50MB)</p>
                  </template>
                  <template v-else>
                    <LucideFileText class="w-10 h-10 mx-auto mb-4 text-cantuaria-oxford" />
                    <p class="text-sm text-cantuaria-oxford font-bold tracking-tight mb-1">{{ selectedFile.name }}</p>
                    <p class="text-[10px] text-cantuaria-charcoal/40 uppercase font-bold tracking-widest">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                    <button @click.stop="selectedFile = null" class="mt-4 text-[10px] text-cantuaria-crimson uppercase font-bold tracking-widest hover:underline">Remover</button>
                  </template>
                </div>
              </div>

              <div v-if="error" class="text-sm text-cantuaria-crimson font-medium bg-cantuaria-crimson/5 p-4 rounded border border-cantuaria-crimson/10">
                {{ error }}
              </div>

              <div class="pt-6">
                <button 
                  type="submit" 
                  :disabled="uploading"
                  class="w-full py-5 bg-cantuaria-oxford text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cantuaria-oxford/90 shadow-xl transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <span v-if="uploading" class="flex items-center justify-center gap-2">
                    <LucideLoader2 class="w-4 h-4 animate-spin" /> Enviando Arquivo...
                  </span>
                  <span v-else>Enviar para Revisão</span>
                </button>
                <p class="text-center text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest mt-6 italic">
                  "O conhecimento é a luz que não se apaga."
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { 
  FileUp as LucideFileUp, 
  FileText as LucideFileText, 
  CheckCircle as LucideCheckCircle,
  Loader2 as LucideLoader2
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const uploading = ref(false)
const success = ref(false)
const error = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)

const form = ref({
  title: '',
  author_hint: '',
  type: 'Livro',
  publication_year: null
})

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) selectedFile.value = file
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) selectedFile.value = file
}

const handleSubmit = async () => {
  if (!selectedFile.value) {
    error.value = 'Por favor, selecione um arquivo para enviar.'
    return
  }

  uploading.value = true
  error.value = null

  try {
    // 1. Upload do Arquivo para o Storage
    const fileExt = selectedFile.value.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, selectedFile.value)

    if (uploadError) throw uploadError

    // 2. Pegar URL Pública
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // 3. Criar registro na tabela documents (status pending)
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        title: form.value.title,
        type: form.value.type,
        publication_year: form.value.publication_year,
        file_url: publicUrl,
        slug: `${form.value.title.toLowerCase().replace(/ /g, '-')}-${Date.now().toString().slice(-4)}`,
        status: 'pending',
        summary: form.value.author_hint ? `Contribuição sugerindo autor: ${form.value.author_hint}` : null
      })

    if (dbError) throw dbError

    success.value = true
    // Reset form
    form.value = { title: '', author_hint: '', type: 'Livro', publication_year: null }
    selectedFile.value = null
  } catch (err) {
    console.error('Erro no envio:', err)
    error.value = 'Ocorreu um erro ao enviar o documento. Tente novamente.'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
