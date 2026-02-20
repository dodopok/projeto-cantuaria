-- Adicionar coluna para cache de nomes de autores e tags para busca
ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_metadata TEXT;

-- Função para atualizar o search_metadata
CREATE OR REPLACE FUNCTION update_document_search_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE documents
  SET search_metadata = (
    SELECT COALESCE(string_agg(a.name, ' '), '')
    FROM authors a
    JOIN document_authors da ON a.id = da.author_id
    WHERE da.document_id = documents.id
  ) || ' ' || (
    SELECT COALESCE(string_agg(t.name, ' '), '')
    FROM tags t
    JOIN document_tags dt ON t.id = dt.tag_id
    WHERE dt.document_id = documents.id
  )
  WHERE id = COALESCE(NEW.document_id, OLD.document_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para document_authors
DROP TRIGGER IF EXISTS trigger_update_search_metadata_authors ON document_authors;
CREATE TRIGGER trigger_update_search_metadata_authors
AFTER INSERT OR UPDATE OR DELETE ON document_authors
FOR EACH ROW EXECUTE FUNCTION update_document_search_metadata();

-- Triggers para document_tags
DROP TRIGGER IF EXISTS trigger_update_search_metadata_tags ON document_tags;
CREATE TRIGGER trigger_update_search_metadata_tags
AFTER INSERT OR UPDATE OR DELETE ON document_tags
FOR EACH ROW EXECUTE FUNCTION update_document_search_metadata();

-- ATUALIZAÇÃO EM MASSA: Popular dados existentes
UPDATE documents d
SET search_metadata = (
  SELECT COALESCE(string_agg(a.name, ' '), '')
  FROM authors a
  JOIN document_authors da ON a.id = da.author_id
  WHERE da.document_id = d.id
) || ' ' || (
  SELECT COALESCE(string_agg(t.name, ' '), '')
  FROM tags t
  JOIN document_tags dt ON t.id = dt.tag_id
  WHERE dt.document_id = d.id
);

-- Atualizar search_vector para incluir a nova coluna
ALTER TABLE documents DROP COLUMN IF EXISTS search_vector;
ALTER TABLE documents ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('portuguese', title || ' ' || coalesce(summary, '') || ' ' || coalesce(content_text, '') || ' ' || coalesce(search_metadata, ''))
) STORED;

CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING GIN (search_vector);
