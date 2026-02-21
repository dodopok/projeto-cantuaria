<template>
  <footer class="bg-cantuaria-charcoal text-cantuaria-cream/80 py-12 border-t border-white/5">
    <div class="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div class="col-span-1 md:col-span-1">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 bg-white/10 flex items-center justify-center rounded-sm">
            <span class="font-serif text-lg text-white">C</span>
          </div>
          <span class="font-serif text-lg font-bold text-white tracking-tight">Projeto Cantuária</span>
        </div>
        <p class="text-sm leading-relaxed max-w-xs text-cantuaria-cream/60 mb-6">
          Uma biblioteca pública digital dedicada à preservação e disseminação da produção litúrgica, teológica e histórica anglicana.
        </p>
        <div class="pt-6 border-t border-white/5">
          <p class="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-2">Iniciativa</p>
          <a href="https://www.caminhoanglicano.com.br/" target="_blank" class="group flex items-center gap-2 text-sm text-cantuaria-cream/60 hover:text-cantuaria-gold transition-colors">
            Parte do <span class="text-white font-medium group-hover:text-cantuaria-gold transition-colors">Caminho Anglicano</span>
            <LucideExternalLink class="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      <div>
        <h4 class="font-serif text-lg text-white mb-6">Acervo</h4>
        <ul class="space-y-3 text-sm">
          <li><NuxtLink to="/biblioteca?tipo=livro" class="hover:text-cantuaria-gold transition-colors">Livros</NuxtLink></li>
          <li><NuxtLink to="/biblioteca?tipo=artigo" class="hover:text-cantuaria-gold transition-colors">Artigos & Ensaios</NuxtLink></li>
          <li><NuxtLink to="/biblioteca?tipo=LOC" class="hover:text-cantuaria-gold transition-colors">Livros de Oração</NuxtLink></li>
          <li><NuxtLink to="/biblioteca?tipo=revista" class="hover:text-cantuaria-gold transition-colors">Revistas Históricas</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h4 class="font-serif text-lg text-white mb-6">Recursos</h4>
        <ul class="space-y-3 text-sm">
          <li><NuxtLink to="/pesquisa" class="hover:text-cantuaria-gold transition-colors">Pesquisa Avançada</NuxtLink></li>
          <li><NuxtLink to="/contribuir" class="hover:text-cantuaria-gold transition-colors">Enviar Documento</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h4 class="font-serif text-lg text-white mb-6">Contato</h4>
        <p class="text-sm text-cantuaria-cream/60 mb-4 italic">
          "Pois onde estiverem dois ou três reunidos em meu nome, ali estou eu no meio deles."
        </p>
        <a href="mailto:dodopokcamilo@gmail.com" class="text-sm hover:text-cantuaria-gold transition-colors border-b border-white/20 pb-1">
          dodopokcamilo@gmail.com
        </a>
      </div>
    </div>
    <div class="container mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/40">
      <span>&copy; {{ new Date().getFullYear() }} Projeto Cantuária. Ad Majorem Dei Gloriam.</span>
      <div class="flex gap-6 italic lowercase">
        <span>Desenvolvido com Nuxt & Supabase</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ExternalLink as LucideExternalLink } from 'lucide-vue-next'
</script>
