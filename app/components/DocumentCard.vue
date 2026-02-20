<template>
  <div class="group cursor-pointer">
    <div class="relative aspect-[3/4.5] bg-cantuaria-charcoal mb-4 overflow-hidden border border-cantuaria-charcoal/5 shadow-sm group-hover:shadow-xl transition-all duration-500">
      <img :src="document.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'" :alt="document.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div class="absolute inset-0 bg-cantuaria-oxford/0 group-hover:bg-cantuaria-oxford/20 transition-colors duration-500"></div>
      
      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-2">
        <span class="px-2 py-0.5 bg-white/90 text-[8px] uppercase tracking-widest font-bold text-cantuaria-oxford backdrop-blur-sm">
          {{ document.type }}
        </span>
      </div>

      <!-- Quick Actions -->
      <div class="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-cantuaria-oxford to-transparent">
        <button class="w-full py-2 bg-white text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-colors">
          Ler Agora
        </button>
      </div>
    </div>
    
    <div class="space-y-1">
      <h3 class="font-serif text-lg leading-snug text-cantuaria-oxford group-hover:text-cantuaria-crimson transition-colors line-clamp-2">
        {{ document.title }}
      </h3>
      <p class="font-sans text-xs text-cantuaria-charcoal/50 uppercase tracking-wider">
        {{ authorsText }}
      </p>
      
      <div class="flex items-center gap-3 pt-2">
        <span class="text-[10px] text-cantuaria-charcoal/30 italic font-serif">
          {{ document.publication_year || 'Séc. XIX' }}
        </span>
        <span class="w-1 h-1 rounded-full bg-cantuaria-gold/30"></span>
        <span class="text-[10px] text-cantuaria-charcoal/30 uppercase tracking-widest font-bold">
          {{ document.language }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  document: any
}>()

const authorsText = computed(() => {
  if (!props.document.authors || props.document.authors.length === 0) {
    return 'Autor Desconhecido'
  }
  return props.document.authors.map((a: any) => a.name).join(', ')
})
</script>
