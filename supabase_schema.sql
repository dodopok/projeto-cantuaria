-- Tabela de Autores
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  born_year INTEGER,
  died_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Categorias
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content_text TEXT, -- Versão texto para leitura fluida e SEO
  file_url TEXT,     -- Link do PDF no Storage
  thumbnail_url TEXT,
  type TEXT CHECK (type IN ('Livro', 'LOC', 'Artigo', 'Revista', 'Foto', 'Documento')),
  language TEXT DEFAULT 'Português',
  publication_date DATE,
  category_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'published')),
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vetor para Full-Text Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', title || ' ' || coalesce(summary, '') || ' ' || coalesce(content_text, ''))
  ) STORED
);

-- Tabela Pivot Documentos <-> Autores (M-M)
CREATE TABLE document_authors (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, author_id)
);

-- Tabela Pivot Documentos <-> Tags (M-M)
CREATE TABLE document_tags (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

-- Índices para performance
CREATE INDEX idx_documents_search ON documents USING GIN (search_vector);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_status ON documents(status);

-- RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer um pode ler documentos PUBLICADOS
DROP POLICY IF EXISTS "Public can read published documents" ON documents;
CREATE POLICY "Public can read published documents" ON documents
  FOR SELECT USING (status = 'published');

-- 2. Qualquer um pode ENVIAR novas sugestões (Contribuir)
-- Mas só podem inserir com status 'pending'
DROP POLICY IF EXISTS "Public can insert suggestions" ON documents;
CREATE POLICY "Public can insert suggestions" ON documents
  FOR INSERT WITH CHECK (status = 'pending');

-- 3. Curadores autenticados têm acesso total
DROP POLICY IF EXISTS "Admin full access" ON documents;
CREATE POLICY "Admin full access" ON documents
  FOR ALL USING (auth.role() = 'authenticated');
