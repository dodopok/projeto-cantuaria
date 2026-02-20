-- Migração: Adiciona coluna content_markdown para armazenar o conteúdo OCR gerado pelo Gemini
-- Executar no SQL Editor do Supabase

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS content_markdown TEXT;

COMMENT ON COLUMN documents.content_markdown IS 'Conteúdo do documento em Markdown, gerado via OCR do Gemini 2.0 Flash';
