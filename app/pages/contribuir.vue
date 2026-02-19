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
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
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

              <div class="p-6 bg-cantuaria-oxford/5 border border-cantuaria-oxford/10 rounded-sm">
                <LucideShieldCheck class="w-8 h-8 text-cantuaria-oxford mb-4" />
                <h4 class="font-serif text-lg text-cantuaria-oxford mb-2">Segurança & Privacidade</h4>
                <p class="text-xs text-cantuaria-charcoal/50 leading-relaxed">Seus dados pessoais não serão exibidos publicamente sem sua autorização. O foco é a preservação do documento.</p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-8">
            <form @submit.prevent class="space-y-8 bg-white p-8 md:p-12 shadow-sm border border-cantuaria-charcoal/5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Título da Obra *</label>
                  <input type="text" placeholder="Ex: Livro de Oração Comum" class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Autor(es)</label>
                  <input type="text" placeholder="Ex: Thomas Cranmer" class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Tipo de Documento *</label>
                  <select class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans appearance-none">
                    <option>Livro</option>
                    <option>Artigo / Ensaio</option>
                    <option>Revista</option>
                    <option>Documento Histórico</option>
                    <option>Liturgia</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Ano de Publicação (Aprox.)</label>
                  <input type="text" placeholder="Ex: 1662" class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Resumo ou Descrição</label>
                <textarea rows="4" placeholder="Conte-nos brevemente sobre a importância deste documento..." class="w-full bg-cantuaria-cream/30 border-b border-cantuaria-charcoal/10 py-3 focus:outline-none focus:border-cantuaria-oxford transition-colors font-sans resize-none"></textarea>
              </div>

              <!-- File Upload Area -->
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Arquivo do Documento *</label>
                <div class="border-2 border-dashed border-cantuaria-charcoal/10 p-12 text-center group hover:border-cantuaria-oxford/30 transition-colors cursor-pointer bg-cantuaria-cream/20">
                  <LucideFileUp class="w-10 h-10 mx-auto mb-4 text-cantuaria-charcoal/20 group-hover:text-cantuaria-oxford transition-colors" />
                  <p class="text-sm text-cantuaria-charcoal/40 font-medium">Arraste o arquivo aqui ou <span class="text-cantuaria-oxford underline">clique para selecionar</span></p>
                  <p class="text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest mt-2">PDF, EPUB ou ZIP (Máx. 50MB)</p>
                </div>
              </div>

              <div class="pt-6">
                <button type="submit" class="w-full py-5 bg-cantuaria-oxford text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cantuaria-oxford/90 shadow-xl transition-all active:scale-[0.99]">
                  Enviar para Revisão
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
import { FileUp as LucideFileUp, ShieldCheck as LucideShieldCheck } from 'lucide-vue-next'
</script>
