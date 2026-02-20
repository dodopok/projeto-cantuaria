-- Tabela de publicações periódicas (revistas, jornais, séries, coleções)
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  publisher TEXT,
  publication_type TEXT CHECK (publication_type IN ('Revista', 'Jornal', 'Série', 'Coleção', 'Outro')),
  start_year INTEGER,
  end_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coluna de vínculo em documents
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS publication_id UUID REFERENCES publications(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publicações visíveis publicamente" ON publications
  FOR SELECT USING (true);

CREATE POLICY "Apenas service role escreve publicações" ON publications
  FOR ALL USING (auth.role() = 'service_role');
