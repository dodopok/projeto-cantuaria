-- Adiciona campo de ordenação dentro de uma playlist
ALTER TABLE videos ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Índice para ordenação por posição
CREATE INDEX IF NOT EXISTS idx_videos_position ON videos(playlist_id, position);
