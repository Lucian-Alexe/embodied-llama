-- Embodied Llama D1 Schema
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_contents (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed data for page contents
INSERT OR IGNORE INTO page_contents (key, value) VALUES 
('home_title', 'Embodied Llama'),
('home_hero_heading', 'Welcome to Embodied Llama'),
('home_hero_subtitle', 'Leading edge development, high-performance static delivery, and in-browser content management.');

