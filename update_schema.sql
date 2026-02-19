-- Atualização da tabela de documentos
ALTER TABLE documents ADD COLUMN IF NOT EXISTS publication_year INTEGER;

-- Tornar a data de publicação opcional (muitas obras antigas só têm o ano ou século)
ALTER TABLE documents ALTER COLUMN publication_date DROP NOT NULL;

-- Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;
