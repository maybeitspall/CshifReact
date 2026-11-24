-- 004_seed.sql

INSERT INTO obstacle_categories (nama)
VALUES
  ('Bangun kesiangan'),
  ('Tidur larut'),
  ('Nongkrong/sosial'),
  ('Gawai/media sosial'),
  ('Kelelahan'),
  ('Tugas mendadak'),
  ('Gangguan teman/keluarga'),
  ('Masalah teknis'),
  ('Lainnya')
ON CONFLICT (nama) DO NOTHING;
