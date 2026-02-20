export const purgeCache = async () => {
  try {
    const storage = useStorage('cache')
    
    // Em vez de filtrar, limpamos o storage de cache inteiro.
    // Isso garante que Home, Biblioteca, Documentos e APIs sejam invalidados simultaneamente.
    // É a única forma 100% garantida de evitar o erro 304 com dados antigos.
    await storage.clear()
    
    console.log(`[Cache Purge] 🚀 STORAGE DE CACHE TOTALMENTE LIMPO.`)
  } catch (err) {
    console.error('[Cache Purge] Erro ao limpar storage:', err)
  }
}
