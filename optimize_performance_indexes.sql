-- Migration: Adicionar índices para performance de filtros e ordenação

-- 1. Índice para acelerar a busca por publicação (muito usado no infinite scroll das publicações)
CREATE INDEX IF NOT EXISTS idx_documents_publication_id ON documents(publication_id);

-- 2. Índice para acelerar o filtro e ordenação por ano (Biblioteca e Pesquisa)
CREATE INDEX IF NOT EXISTS idx_documents_publication_year ON documents(publication_year DESC);

-- 3. Índice para acelerar filtros de tipo e idioma (Pesquisa)
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_language ON documents(language);

-- 4. Índice composto para a ordenação padrão da biblioteca (mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_documents_status_created_at ON documents(status, created_at DESC) WHERE status = 'published';

-- 5. Índice para acelerar a listagem de publicações por ano de início
CREATE INDEX IF NOT EXISTS idx_publications_start_year ON publications(start_year DESC);

-- 6. Índice para o slug da categoria (usado no join !inner da biblioteca)
-- (Nota: A coluna slug já tem UNIQUE, que cria um índice automaticamente)
