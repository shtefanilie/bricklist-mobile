CREATE TABLE IF NOT EXISTS sets (
  set_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  year INTEGER NOT NULL,
  piece_count INTEGER NOT NULL,
  image_url TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sets_theme_idx ON sets(theme);
CREATE INDEX IF NOT EXISTS sets_name_idx ON sets(name);
