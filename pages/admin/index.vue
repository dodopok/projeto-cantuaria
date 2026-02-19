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
                <span class="text-2xl font-serif text-cantuaria-gold">12</span>
              </div>
              <div class="bg-white/10 px-6 py-3 border border-white/10 text-center min-w-[120px]">
                <span class="block text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Aprovados</span>
                <span class="text-2xl font-serif">1.2k</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="container mx-auto px-6 py-12">
        <div class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center">
            <h2 class="font-serif text-2xl text-cantuaria-oxford">Documentos para Revisão</h2>
            <div class="flex gap-3">
              <input type="text" placeholder="Filtrar pendentes..." class="px-4 py-2 border border-cantuaria-charcoal/10 text-xs font-sans focus:outline-none focus:border-cantuaria-oxford" />
            </div>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
                <th class="px-6 py-4">Arquivo / Título Provisório</th>
                <th class="px-6 py-4">Enviado em</th>
                <th class="px-6 py-4">Status</th>
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
                      <div class="font-medium text-cantuaria-oxford">{{ item.filename }}</div>
                      <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">{{ item.size }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 text-sm text-cantuaria-charcoal/60">{{ item.date }}</td>
                <td class="px-6 py-6">
                  <span class="px-2 py-0.5 bg-cantuaria-gold/10 text-cantuaria-gold text-[8px] uppercase tracking-widest font-bold rounded-full">Pendente</span>
                </td>
                <td class="px-6 py-6 text-right">
                  <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="analyzeWithAI(item)" 
                      :disabled="analyzing === item.id"
                      class="flex items-center gap-2 px-3 py-1.5 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford/90 disabled:opacity-50"
                    >
                      <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-pulse': analyzing === item.id }" />
                      {{ analyzing === item.id ? 'Analisando...' : 'Analisar com IA' }}
                    </button>
                    <button class="px-3 py-1.5 border border-cantuaria-charcoal/10 text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-crimson hover:text-white hover:border-cantuaria-crimson transition-colors">
                      Descartar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- AI Results Modal (Simulado) -->
      <div v-if="aiResult" class="fixed inset-0 z-[100] bg-cantuaria-oxford/90 backdrop-blur-md flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl relative">
          <header class="p-8 border-b border-cantuaria-charcoal/5 sticky top-0 bg-white z-10 flex justify-between items-center">
            <div>
              <h3 class="font-serif text-3xl text-cantuaria-oxford mb-2">Sugestão da IA</h3>
              <p class="text-xs text-cantuaria-charcoal/40 uppercase tracking-widest font-bold">Confirme os dados extraídos pelo Perplexity</p>
            </div>
            <button @click="aiResult = null" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full">
              <LucideX class="w-6 h-6" />
            </button>
          </header>
          
          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título Sugerido</label>
                <input type="text" v-model="aiResult.title" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Autores</label>
                <input type="text" :value="aiResult.authors?.join(', ')" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label>
                <select v-model="aiResult.category" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm bg-transparent">
                  <option>Liturgia</option>
                  <option>Teologia</option>
                  <option>História</option>
                  <option>Sermões</option>
                </select>
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo Gerado</label>
                <textarea rows="6" v-model="aiResult.summary" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags Sugeridas</label>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in aiResult.tags" :key="tag" class="px-3 py-1 bg-cantuaria-oxford/5 text-[10px] uppercase tracking-widest font-bold text-cantuaria-oxford">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <footer class="p-8 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-end gap-4">
            <button @click="aiResult = null" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
            <button class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl transition-all">
              Aprovar & Publicar
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
  X as LucideX 
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin'
})

const analyzing = ref(null)
const aiResult = ref(null)

const pendingItems = ref([
  { id: 1, filename: 'reforma-anglicana-sec-xvi.pdf', size: '2.4 MB', date: 'Hoje, 14:20' },
  { id: 2, filename: 'common_prayer_1549.epub', size: '1.1 MB', date: 'Ontem, 09:15' },
  { id: 3, filename: 'artigo_hooker_polity.docx', size: '850 KB', date: '18 Fev 2026' }
])

const analyzeWithAI = async (item) => {
  analyzing.value = item.id
  
  try {
    // Simulação de chamada para o endpoint /api/analyze
    // Na vida real, você passaria o conteúdo extraído do arquivo
    const response = await $fetch('/api/analyze', {
      method: 'POST',
      body: {
        filename: item.filename,
        documentText: "Este é um texto simulado do documento " + item.filename
      }
    })
    
    aiResult.value = response
  } catch (error) {
    alert('Erro ao analisar com IA. Verifique se a API Key do Perplexity está configurada no .env')
  } finally {
    analyzing.value = null
  }
}
</script>
