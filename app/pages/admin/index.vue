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
        <!-- Tabs & Actions Bar -->
        <div class="flex flex-col space-y-6 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-center border-b border-cantuaria-oxford/10 gap-4">
            <div class="flex gap-8">
              <button 
                @click="currentTab = 'pending'; currentPage = 0"
                :class="['pb-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2', 
                currentTab === 'pending' ? 'border-cantuaria-oxford text-cantuaria-oxford' : 'border-transparent text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
              >
                Pendentes ({{ pendingCount }})
              </button>
              <button 
                @click="currentTab = 'published'; currentPage = 0"
                :class="['pb-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2', 
                currentTab === 'published' ? 'border-cantuaria-oxford text-cantuaria-oxford' : 'border-transparent text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
              >
                Publicados
              </button>
              <button 
                @click="currentTab = 'removal'; currentPage = 0"
                :class="['pb-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2', 
                currentTab === 'removal' ? 'border-cantuaria-oxford text-cantuaria-oxford' : 'border-transparent text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
              >
                Solicitações ({{ removalRequests.length }})
              </button>
            </div>

            <div v-if="selectedIds.length > 0 && currentTab !== 'removal'" class="pb-4 flex gap-3 animate-fade-in">
              <button 
                v-if="currentTab === 'pending'"
                @click="startBatchAnalysis"
                class="flex items-center gap-2 px-6 py-2 bg-cantuaria-gold text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all"
              >
                <LucideSparkles class="w-4 h-4" />
                Analisar com IA
              </button>
              <button 
                @click="deleteSelected"
                :disabled="deletingBulk"
                class="flex items-center gap-2 px-6 py-2 bg-cantuaria-crimson text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <LucideLoader2 v-if="deletingBulk" class="w-4 h-4 animate-spin" />
                <LucideTrash2 v-else class="w-4 h-4" />
                Excluir {{ selectedIds.length }} selecionados
              </button>
            </div>
          </div>

          <!-- Filters Bar -->
          <div v-if="currentTab !== 'removal'" class="flex flex-col md:flex-row gap-4 bg-white p-4 border border-cantuaria-charcoal/5 shadow-sm rounded-sm">
            <div class="relative flex-grow">
              <LucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cantuaria-charcoal/30" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Pesquisar por título, autor ou tag..." 
                class="w-full pl-10 pr-4 py-2 bg-cantuaria-cream/50 border border-cantuaria-charcoal/10 focus:outline-none focus:border-cantuaria-oxford text-xs font-sans rounded-sm transition-colors"
              />
            </div>
            <div class="flex gap-4">
              <select v-model="orderBy" class="bg-cantuaria-cream/50 border border-cantuaria-charcoal/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-cantuaria-oxford rounded-sm">
                <option value="created_at:desc">Mais recentes</option>
                <option value="created_at:asc">Mais antigos</option>
                <option value="title:asc">Título (A-Z)</option>
                <option value="title:desc">Título (Z-A)</option>
              </select>
              <select v-model="pageSize" class="bg-cantuaria-cream/50 border border-cantuaria-charcoal/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-cantuaria-oxford rounded-sm">
                <option :value="10">10 por pág</option>
                <option :value="25">25 por pág</option>
                <option :value="50">50 por pág</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <!-- Removal Requests View -->
        <div v-else-if="currentTab === 'removal'" class="space-y-6">
          <div v-if="removalRequests.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
            <LucideShieldCheck class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
            <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhuma solicitação de remoção pendente.</p>
          </div>
          <div v-else class="grid grid-cols-1 gap-6">
            <div v-for="req in removalRequests" :key="req.id" class="bg-white border border-cantuaria-charcoal/5 p-8 shadow-sm flex flex-col md:flex-row justify-between gap-8 group hover:border-cantuaria-gold/30 transition-all">
              <div class="space-y-4 max-w-2xl">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-crimson bg-cantuaria-crimson/5 px-2 py-1">Solicitação de Remoção</span>
                  <span class="text-[10px] text-cantuaria-charcoal/40 uppercase tracking-widest font-bold">{{ new Date(req.created_at).toLocaleDateString() }}</span>
                </div>
                <h3 class="font-serif text-2xl text-cantuaria-oxford">{{ req.documents?.title }}</h3>
                <div class="grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <span class="block text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Solicitante</span>
                    <span class="font-bold text-cantuaria-charcoal">{{ req.requester_name }}</span>
                    <span class="block text-cantuaria-charcoal/60">{{ req.requester_email }}</span>
                  </div>
                  <div>
                    <span class="block text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Motivo</span>
                    <p class="text-cantuaria-charcoal/80 leading-relaxed italic">"{{ req.reason }}"</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <button @click="handleRemoval(req.id, 'deny')" class="px-6 py-3 border border-cantuaria-charcoal/10 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal hover:bg-cantuaria-charcoal/5 transition-all">Ignorar</button>
                <button @click="handleRemoval(req.id, 'approve')" class="px-6 py-3 bg-cantuaria-crimson text-white text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-crimson/90 shadow-lg transition-all">Excluir Obra</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="items.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
          <LucideCheckCircle class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
          <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhum documento encontrado.</p>
        </div>

        <div v-else class="space-y-6">
          <div class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden rounded-sm">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
                  <th class="px-6 py-4 w-10">
                    <input type="checkbox" @change="toggleAll" :checked="allSelected" class="w-4 h-4 accent-cantuaria-oxford" />
                  </th>
                  <th class="px-6 py-4">Obra</th>
                  <th class="px-6 py-4">Data</th>
                  <th class="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-cantuaria-charcoal/5">
                <tr v-for="item in items" :key="item.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
                  <td class="px-6 py-6">
                    <input type="checkbox" v-model="selectedIds" :value="item.id" class="w-4 h-4 accent-cantuaria-oxford" />
                  </td>
                  <td class="px-6 py-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-cantuaria-oxford/5 flex items-center justify-center rounded text-cantuaria-oxford overflow-hidden shrink-0 shadow-inner border border-cantuaria-charcoal/5">
                        <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
                        <LucideFileText v-else class="w-5 h-5" />
                      </div>
                      <div class="min-w-0">
                        <div class="font-medium text-cantuaria-oxford truncate max-w-md">{{ item.title }}</div>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-[8px] px-1.5 py-0.5 bg-cantuaria-oxford/5 text-cantuaria-oxford/60 uppercase tracking-widest font-bold rounded-sm">{{ item.type }}</span>
                          <span v-if="item.authors_list" class="text-[9px] text-cantuaria-charcoal/40 font-serif italic truncate max-w-xs">{{ item.authors_list }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 text-sm text-cantuaria-charcoal/60">{{ new Date(item.created_at).toLocaleDateString() }}</td>
                  <td class="px-6 py-6 text-right whitespace-nowrap">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="openReview(item)" class="px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all">Editar</button>
                      <button @click="deleteItem(item)" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors"><LucideTrash2 class="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination UI -->
          <div class="flex items-center justify-between px-2 py-4">
            <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">
              Mostrando {{ items.length }} de {{ totalItems }} itens
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 0"
                class="p-2 border border-cantuaria-charcoal/10 rounded-sm hover:bg-white disabled:opacity-30 transition-colors"
              >
                <LucideChevronLeft class="w-4 h-4" />
              </button>
              <span class="text-xs font-bold text-cantuaria-oxford px-4">Página {{ currentPage + 1 }} de {{ Math.ceil(totalItems / pageSize) }}</span>
              <button 
                @click="currentPage++" 
                :disabled="(currentPage + 1) * pageSize >= totalItems"
                class="p-2 border border-cantuaria-charcoal/10 rounded-sm hover:bg-white disabled:opacity-30 transition-colors"
              >
                <LucideChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
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
            <button v-if="!isAnalyzingBatch && !publishingBatch" @click="closeBatch" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
          </header>

          <div class="flex-grow overflow-auto p-8 bg-cantuaria-cream/20">
            <div class="grid grid-cols-1 gap-6">
              <div v-for="res in batchResults" :key="res.id" class="border border-cantuaria-charcoal/10 p-6 rounded-sm bg-white shadow-sm hover:border-cantuaria-gold/50">
                <div class="flex flex-col lg:flex-row gap-8" :class="{ 'opacity-50 pointer-events-none': publishingBatch }">
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
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Título</label><input type="text" v-model="res.data.title" :disabled="publishingBatch" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-sm font-serif bg-transparent disabled:opacity-50" /></div>
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Autores</label><input type="text" v-model="res.data.authors_list" :disabled="publishingBatch" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Ano</label><input type="number" v-model="res.data.publication_year" :disabled="publishingBatch" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                        <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Categoria</label><input type="text" v-model="res.data.category_name" :disabled="publishingBatch" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Resumo</label><textarea rows="3" v-model="res.data.summary" :disabled="publishingBatch" class="w-full border border-cantuaria-charcoal/10 p-2 focus:outline-none focus:border-cantuaria-gold text-xs leading-relaxed bg-cantuaria-cream/10 disabled:opacity-50"></textarea></div>
                      <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Tags</label><input type="text" v-model="res.data.tags_list" :disabled="publishingBatch" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="p-8 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-between items-center">
            <div class="flex items-center gap-4"><span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">{{ completedCount }} de {{ batchResults.length }} processados</span></div>
            <div class="flex gap-4">
              <button v-if="!isAnalyzingBatch && !publishingBatch" @click="closeBatch" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
              <button @click="saveBatchResults" :disabled="isAnalyzingBatch || completedCount === 0 || publishingBatch" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">
                <template v-if="publishingBatch"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Salvando...</template>
                <template v-else>Publicar Todos</template>
              </button>
            </div>
          </footer>
        </div>
      </div>

      <!-- Review/Edit Modal -->
      <div v-if="editingItem" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
          <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
            <h3 class="font-serif text-2xl text-cantuaria-oxford">Gerenciamento de Documento</h3>
            <button @click="editingItem = null" :disabled="publishing" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full disabled:opacity-30"><LucideX class="w-6 h-6" /></button>
          </header>

          <div class="flex-grow flex overflow-hidden">
            <div class="hidden lg:block w-1/2 bg-cantuaria-charcoal border-r border-cantuaria-charcoal/10 overflow-hidden">
              <Reader :url="editingItem.file_url" :type="editingItem.type" />
            </div>

            <div class="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 space-y-10" :class="{ 'opacity-50 pointer-events-none': publishing }">
              <div class="flex justify-between items-center border-b border-cantuaria-oxford/5 pb-6">
                <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Dados da Obra</h4>
                <div class="flex gap-2">
                  <button v-if="editingItem.file_url?.toLowerCase().endsWith('.pdf')" @click="runOCRAnalysis" :disabled="analyzing || publishing || performingOCR" class="flex items-center gap-2 px-4 py-2 border border-cantuaria-gold text-cantuaria-gold text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-all disabled:opacity-50">
                    <LucideLoader2 v-if="performingOCR" class="w-3.5 h-3.5 animate-spin" />
                    <LucideSparkles v-else class="w-3.5 h-3.5" />
                    {{ performingOCR ? 'Extraindo Texto...' : 'Análise com OCR' }}
                  </button>
                  <button @click="analyzeWithAI()" :disabled="analyzing || publishing || performingOCR" class="flex items-center gap-2 px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50">
                    <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': analyzing }" />
                    {{ analyzing ? 'Analisando...' : 'Re-analisar com IA' }}
                  </button>
                </div>
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
                    <button @click.stop="generateInstitutionalCover" :disabled="publishing" class="w-full py-2 border border-cantuaria-gold text-cantuaria-gold text-[8px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-all disabled:opacity-50">Gerar Capa Cantuária</button>
                    <button 
                      v-if="editingItem.file_url?.toLowerCase().endsWith('.pdf')" 
                      @click.stop="capturePdfCover" 
                      :disabled="capturingPdf || publishing"
                      class="w-full py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[8px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50"
                    >
                      {{ capturingPdf ? 'Capturando...' : 'Usar 1ª pág como Capa' }}
                    </button>
                  </div>
                </div>
                <div class="md:col-span-2 space-y-6">
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título Final</label>
                    <input type="text" v-model="editingItem.title" @input="updateSlugSuggestion" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl bg-transparent disabled:opacity-50" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Link Amigável (Slug)</label>
                    <input type="text" v-model="editingItem.slug" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-oxford text-[10px] font-mono bg-transparent text-cantuaria-charcoal/40 disabled:opacity-50" />
                  </div>
                  <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Autor(es)</label><input type="text" v-model="editingItem.authors_list" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano</label><input type="number" v-model="editingItem.publication_year" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
                    <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Idioma</label><input type="text" v-model="editingItem.language" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
                  </div>
                  <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label><input type="text" v-model="editingItem.category_name" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tipo de Documento</label>
                    <select v-model="editingItem.type" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none disabled:opacity-50">
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
              <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo</label><textarea rows="6" v-model="editingItem.summary" :disabled="publishing" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed bg-cantuaria-cream/10 disabled:opacity-50"></textarea></div>
              <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags</label><input type="text" v-model="editingItem.tags_list" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
              <div class="pt-10 flex justify-end gap-4 border-t border-cantuaria-oxford/5">
                <button @click="editingItem = null" :disabled="publishing" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors disabled:opacity-50">Cancelar</button>
                <button @click="publish" :disabled="publishing" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">
                  <template v-if="publishing"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Salvando...</template>
                  <template v-else>Salvar & Publicar</template>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Crop Modal -->
      <div v-if="showCropModal" class="fixed inset-0 z-[150] bg-cantuaria-oxford/98 backdrop-blur-xl flex flex-col items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
          <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center">
            <h3 class="font-serif text-xl text-cantuaria-oxford">Ajustar Capa</h3>
            <button @click="showCropModal = false" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-5 h-5" /></button>
          </header>
          
          <div class="flex-grow bg-cantuaria-charcoal overflow-hidden flex items-center justify-center p-4">
            <img ref="cropImgRef" :src="croppingImage" class="max-w-full max-h-full block" />
          </div>

          <footer class="p-6 border-t border-cantuaria-charcoal/5 flex justify-between items-center bg-cantuaria-cream/30">
            <div class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">
              Arraste e redimensione para definir a capa (Proporção 3:4.5)
            </div>
            <div class="flex gap-4">
              <button @click="showCropModal = false" class="px-6 py-2 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
              <button @click="confirmCrop" :disabled="uploadingCover" class="px-10 py-3 bg-cantuaria-gold text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-gold/90 transition-all shadow-lg disabled:opacity-50">
                <template v-if="uploadingCover"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Enviando...</template>
                <template v-else>Confirmar Capa</template>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  ShieldCheck as LucideShieldCheck, 
  FileText as LucideFileText, 
  Sparkles as LucideSparkles, 
  X as LucideX, 
  Image as LucideImage, 
  Loader2 as LucideLoader2, 
  CheckCircle as LucideCheckCircle, 
  Trash2 as LucideTrash2,
  Search as LucideSearch,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight
} from 'lucide-vue-next'
import 'cropperjs/dist/cropper.css'

definePageMeta({ middleware: 'admin' })

const supabase = useSupabaseClient()
const loading = ref(true)
const currentTab = ref<'pending' | 'published' | 'removal'>('pending')
const items = ref<any[]>([])
const pendingCount = ref(0)
const editingItem = ref<any>(null)
const analyzing = ref(false)
const publishing = ref(false)
const uploadingCover = ref(false)
const capturingPdf = ref(false)
const performingOCR = ref(false)
const deletingBulk = ref(false)

// Remoção
const removalRequests = ref<any[]>([])

// Pagination & Search
const searchQuery = ref('')
const currentPage = ref(0)
const pageSize = ref(10)
const totalItems = ref(0)
const orderBy = ref('created_at:desc')

// Crop related
const showCropModal = ref(false)
const croppingImage = ref('')
const cropImgRef = ref<HTMLImageElement | null>(null)
let cropperInstance: any = null

const selectedIds = ref<string[]>([])
const allSelected = computed(() => items.value.length > 0 && selectedIds.value.length === items.value.length)
const batchAnalysisActive = ref(false)
const isAnalyzingBatch = ref(false)
const publishingBatch = ref(false)
const batchResults = ref<any[]>([])
const completedCount = computed(() => batchResults.value.filter(r => r.status === 'complete').length)

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
    await $fetch('/api/admin/handle-removal', {
      method: 'POST',
      body: { requestId, action }
    })
    await fetchRemovalRequests()
    await fetchData()
  } catch (err) {
    alert('Erro ao processar solicitação.')
  }
}

const fetchData = async () => {
  loading.value = true
  selectedIds.value = []
  
  if (currentTab.value === 'removal') {
    await fetchRemovalRequests()
    loading.value = false
    return
  }

  let query = supabase
    .from('documents')
    .select('*, authors(name), categories(name), tags(name)', { count: 'exact' })
    .eq('status', currentTab.value)

  // Aplica busca se houver
  if (searchQuery.value) {
    query = query.textSearch('search_vector', searchQuery.value, { 
      config: 'portuguese',
      type: 'websearch'
    })
  }

  // Aplica ordenação
  const [column, direction] = orderBy.value.split(':')
  query = query.order(column, { ascending: direction === 'asc' })

  // Aplica paginação
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

  // Atualiza contador de pendentes (global)
  const { count: pCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  pendingCount.value = pCount || 0
  
  // Atualiza também contagem de remoção em background
  fetchRemovalRequests()
  
  loading.value = false
}

// Debounce para busca
watchDebounced(searchQuery, () => {
  currentPage.value = 0
  fetchData()
}, { debounce: 500 })

// Watchers para paginação e ordenação
watch([currentPage, pageSize, orderBy, currentTab], () => {
  fetchData()
})

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
  if (!editingItem.value.file_url || !process.client) return; 
  capturingPdf.value = true
  try {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    const loadingTask = pdfjs.getDocument({ url: editingItem.value.file_url, disableFontFace: true })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas'); const context = canvas.getContext('2d')
    canvas.height = viewport.height; canvas.width = viewport.width
    await page.render({ canvasContext: context!, viewport }).promise
    
    const Cropper = (await import('cropperjs')).default
    croppingImage.value = canvas.toDataURL('image/jpeg', 0.9)
    showCropModal.value = true
    
    nextTick(() => {
      if (cropperInstance) cropperInstance.destroy()
      cropperInstance = new Cropper(cropImgRef.value!, {
        aspectRatio: 3 / 4.5,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        background: false,
      })
    })
  } catch (err) { 
    console.error('Erro na captura:', err)
    alert('Erro na captura. Verifique o acesso CORS do arquivo.') 
  } finally { 
    capturingPdf.value = false 
  }
}

const confirmCrop = async () => {
  if (!cropperInstance) return
  uploadingCover.value = true
  
  try {
    const canvas = cropperInstance.getCroppedCanvas({
      width: 600,
      height: 900,
    })
    
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.85))
    const fileName = `covers/pdf-capture-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('covers').upload(fileName, blob)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName)
    
    // Aguarda a imagem carregar no navegador antes de remover o loading
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = publicUrl
    })

    editingItem.value.thumbnail_url = publicUrl
    showCropModal.value = false
  } catch (err) {
    console.error('Erro ao salvar recorte:', err)
    alert('Erro ao salvar o recorte da imagem.')
  } finally {
    uploadingCover.value = false
  }
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
  if (!confirm(`Tem certeza que deseja excluir permanentemente ${selectedIds.value.length} itens e seus arquivos?`)) return
  deletingBulk.value = true
  try {
    await $fetch('/api/documents/batch-delete', {
      method: 'POST',
      body: { ids: selectedIds.value }
    })
    selectedIds.value = []
    await fetchData()
  } catch (err) {
    alert('Erro ao excluir itens em lote.')
  } finally {
    deletingBulk.value = false
  }
}

const publish = async () => { 
  publishing.value = true
  try { 
    await $fetch('/api/documents/publish', { 
      method: 'POST', 
      body: { id: editingItem.value.id, data: editingItem.value } 
    })
    editingItem.value = null
    await fetchData() 
  } catch (err) {
    alert('Erro ao publicar documento.')
  } finally { publishing.value = false } 
}

const handleCoverUpload = async (e: any) => {
  const file = e.target.files[0]; if (!file) return; 
  
  const reader = new FileReader()
  const Cropper = (await import('cropperjs')).default
  reader.onload = (event) => {
    croppingImage.value = event.target?.result as string
    showCropModal.value = true
    nextTick(() => {
      if (cropperInstance) cropperInstance.destroy()
      cropperInstance = new Cropper(cropImgRef.value!, {
        aspectRatio: 3 / 4.5,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        background: false,
      })
    })
  }
  reader.readAsDataURL(file)
}

const analyzeWithAI = async (ocrText?: string) => {
  analyzing.value = true
  try {
    const analysis: any = await $fetch('/api/analyze', { 
      method: 'POST', 
      body: { 
        documentId: editingItem.value.id, 
        fileUrl: editingItem.value.file_url, 
        filename: editingItem.value.title,
        ocrText: ocrText
      } 
    })
    editingItem.value = { ...editingItem.value, ...analysis }
    updateSlugSuggestion()
  } finally { analyzing.value = false }
}

const runOCRAnalysis = async () => {
  if (!editingItem.value.file_url || !process.client) return;
  performingOCR.value = true
  try {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    
    const loadingTask = pdfjs.getDocument({ url: editingItem.value.file_url, disableFontFace: true })
    const pdf = await loadingTask.promise
    
    const numPagesToOCR = Math.min(pdf.numPages, 3) 
    let fullOcrText = ""

    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('por')

    for (let i = 1; i <= numPagesToOCR; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      await page.render({ canvasContext: context!, viewport }).promise
      
      const { data: { text } } = await worker.recognize(canvas)
      fullOcrText += text + "\n\n"
    }

    await worker.terminate()
    await analyzeWithAI(fullOcrText)
    
  } catch (err) {
    console.error('Erro no OCR:', err)
    alert('Erro ao realizar OCR. Verifique o acesso do arquivo.')
  } finally {
    performingOCR.value = false
  }
}

const deleteItem = async (item: any) => { 
  if (!confirm('Remover permanentemente?')) return
  try { await $fetch(`/api/documents/${item.id}`, { method: 'DELETE' }); await fetchData() } catch (err) { alert('Erro ao deletar documento.') }
}

const logout = async () => { await supabase.auth.signOut(); navigateTo('/login') }

onMounted(fetchData)
</script>

<style scoped>
.animate-progress-indefinite { width: 100%; animation: progress-indefinite 2s infinite linear; transform-origin: 0% 50%; }
@keyframes progress-indefinite { 0% { transform: translateX(0) scaleX(0); } 40% { transform: translateX(0) scaleX(0.4); } 100% { transform: translateX(100%) scaleX(0.5); } }
</style>
