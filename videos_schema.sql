-- Tabela de Playlists (Equivalente a Publicações para Vídeos)
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT, -- Thumbnail da playlist
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vídeos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL, -- URL do YouTube
  youtube_id TEXT NOT NULL, -- ID extraído para o embed
  summary TEXT,
  thumbnail_url TEXT,
  publication_year INTEGER,
  category_id UUID REFERENCES categories(id),
  playlist_id UUID REFERENCES playlists(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vetor de busca para vídeos
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', title || ' ' || coalesce(summary, ''))
  ) STORED
);

-- Pivot: Vídeos <-> Autores
CREATE TABLE video_authors (
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, author_id)
);

-- Pivot: Vídeos <-> Tags
CREATE TABLE video_tags (
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

-- Atualizar Tabela de Remoção para suportar Vídeos
ALTER TABLE removal_requests ADD COLUMN video_id UUID REFERENCES videos(id) ON DELETE CASCADE;
-- Ajustar constraint original de document_id para ser opcional
ALTER TABLE removal_requests ALTER COLUMN document_id DROP NOT NULL;

-- Índices
CREATE INDEX idx_videos_search ON videos USING GIN (search_vector);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_playlist ON videos(playlist_id);

-- RLS para Vídeos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published videos" ON videos FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access videos" ON videos FOR ALL USING (auth.role() = 'authenticated');

-- RLS para Playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read playlists" ON playlists FOR SELECT USING (true);
CREATE POLICY "Admin full access playlists" ON playlists FOR ALL USING (auth.role() = 'authenticated');
