<template>
  <!-- Seção completa (home) -->
  <section v-if="variant === 'section'" class="py-16 md:py-24 bg-cantuaria-oxford text-white" aria-labelledby="ordo-titulo">
    <div class="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <p class="text-xs uppercase tracking-[0.25em] font-bold text-cantuaria-gold">Do mesmo ecossistema · Caminho Anglicano</p>
        <h2 id="ordo-titulo" class="text-4xl md:text-5xl font-serif leading-tight">Do acervo para a oração diária: conheça o Ordo</h2>
        <p class="text-white/80 text-lg leading-relaxed">
          Muitas obras desta biblioteca nasceram para a oração. O <strong class="text-white">Ordo</strong> é o app de
          <a :href="links.oficioDiario" class="underline decoration-cantuaria-gold/60 underline-offset-4 hover:text-cantuaria-gold">Ofício Diário</a>
          que monta os salmos, as leituras, os cânticos e as orações de cada dia segundo o calendário litúrgico e o
          <a :href="links.appLoc" class="underline decoration-cantuaria-gold/60 underline-offset-4 hover:text-cantuaria-gold">Livro de Oração Comum</a> da sua igreja.
        </p>
        <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
          <li>Mais de 20 livros de oração</li>
          <li>iPhone, Android e web</li>
          <li>Grátis e sem anúncios</li>
        </ul>
        <div class="flex flex-wrap gap-3 pt-2">
          <a :href="links.appStore" target="_blank" rel="noopener" class="ordo-btn bg-white text-cantuaria-oxford hover:bg-cantuaria-gold">App Store</a>
          <a :href="links.googlePlay" target="_blank" rel="noopener" class="ordo-btn bg-white text-cantuaria-oxford hover:bg-cantuaria-gold">Google Play</a>
          <a :href="links.web" target="_blank" rel="noopener" class="ordo-btn border border-white/30 text-white hover:bg-white/10">Usar na web</a>
        </div>
      </div>
      <div class="bg-white/5 border border-white/10 p-8 md:p-10 space-y-5">
        <p class="font-serif text-2xl text-white/90 leading-snug">O Ofício Diário de hoje, pronto em um toque</p>
        <ul class="space-y-3 text-white/75">
          <li>Salmos, leituras, cânticos e orações do dia</li>
          <li>Segue o calendário litúrgico e o livro de oração que você escolher</li>
          <li>Funciona sem internet, em 5 línguas</li>
        </ul>
        <a :href="links.site" class="inline-flex items-center gap-2 text-sm font-bold text-cantuaria-gold hover:text-white pt-2">
          Saiba mais em oficio.app <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Cartão contextual (página de obra litúrgica) -->
  <aside v-else-if="variant === 'card'" class="border border-cantuaria-gold/30 bg-white p-6 space-y-3" aria-label="Orar com o Ordo">
    <p class="text-xs uppercase tracking-[0.2em] font-bold text-cantuaria-gold">Orar com este livro</p>
    <p class="font-serif text-xl text-cantuaria-oxford leading-snug">
      <template v-if="book">O {{ book.label }} está no Ordo, pronto para o Ofício Diário de hoje.</template>
      <template v-else>Ore o Ofício Diário com o Livro de Oração da sua igreja no Ordo.</template>
    </p>
    <p class="text-sm text-cantuaria-charcoal/80 leading-relaxed">
      Salmos, leituras e orações do dia montados segundo o calendário litúrgico. Grátis, sem anúncios, no iPhone, Android e web.
    </p>
    <div class="flex flex-wrap gap-3 pt-1">
      <a :href="book?.url || links.web" target="_blank" rel="noopener" class="ordo-btn bg-cantuaria-oxford text-white hover:bg-cantuaria-oxford/90">
        {{ book ? 'Abrir no Ordo' : 'Abrir o Ordo na web' }}
      </a>
      <a :href="links.site" target="_blank" rel="noopener" class="ordo-btn border border-cantuaria-oxford/20 text-cantuaria-oxford hover:border-cantuaria-oxford">Baixar o app</a>
    </div>
  </aside>

  <!-- Linha discreta (rodapé / fim da leitura) -->
  <p v-else class="text-sm leading-relaxed" :class="dark ? 'text-cantuaria-cream/70' : 'text-cantuaria-charcoal/80'">
    Para orar o Ofício Diário com os Livros de Oração Comum, use o
    <a :href="links.site" target="_blank" rel="noopener" class="font-semibold underline underline-offset-4" :class="dark ? 'text-white hover:text-cantuaria-gold' : 'text-cantuaria-oxford hover:text-cantuaria-gold'">Ordo, app de Ofício Diário</a>.
  </p>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'section' | 'card' | 'inline'
  slug?: string | null
  dark?: boolean
}>(), { variant: 'inline', slug: null, dark: false })

const book = computed(() => ordoBookFor(props.slug))
// Constantes de app/utils/site.ts passam pelo script para ficarem visíveis no template
const links = ORDO
</script>

<style scoped>
.ordo-btn {
  @apply inline-flex items-center justify-center min-h-[44px] px-5 text-sm font-bold tracking-wide transition-colors;
}
</style>
