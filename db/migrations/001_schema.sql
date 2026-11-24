-- 001_schema.sql
-- Enums & Tables for Timeblocking Single User (Architecture.md)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE activity_status AS ENUM
  ('selesai','belum','setengah','terkendala','tidak_selesai');

CREATE TYPE obstacle_type AS ENUM ('internal','eksternal');

CREATE TYPE synthesis_kind AS ENUM ('1-2','2-3');

CREATE TABLE IF NOT EXISTS periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  tanggal_mulai date NOT NULL,
  tanggal_akhir date NOT NULL,
  aktif boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (tanggal_akhir >= tanggal_mulai)
);

CREATE TABLE IF NOT EXISTS days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  nomor_hari int NOT NULL,
  tanggal date NOT NULL,
  motivasi int CHECK (motivasi BETWEEN 1 AND 10),
  teks_motivasi text,
  jumlah_penundaan int NOT NULL DEFAULT 0 CHECK (jumlah_penundaan >= 0),
  catatan_akhir text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (period_id, nomor_hari),
  UNIQUE (period_id, tanggal)
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  urutan int NOT NULL,
  jam_rencana_mulai time,
  jam_rencana_selesai time,
  nama text NOT NULL,
  jam_aktual_mulai time,
  jam_aktual_selesai time,
  status activity_status NOT NULL DEFAULT 'belum',
  catatan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS obstacle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS obstacles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  tipe obstacle_type NOT NULL,
  kategori_id uuid REFERENCES obstacle_categories(id),
  deskripsi text
);

CREATE TABLE IF NOT EXISTS syntheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  jenis synthesis_kind NOT NULL,
  isi text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (period_id, jenis)
);

CREATE TABLE IF NOT EXISTS notification_prefs (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pagi boolean NOT NULL DEFAULT true,
  malam boolean NOT NULL DEFAULT true,
  jam_pagi time NOT NULL DEFAULT '07:00',
  jam_malam time NOT NULL DEFAULT '21:00',
  channel text NOT NULL DEFAULT 'email'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_days_period_date ON days(period_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_activities_day_order ON activities(day_id, urutan);
CREATE INDEX IF NOT EXISTS idx_obstacles_act_type ON obstacles(activity_id, tipe);
CREATE INDEX IF NOT EXISTS idx_syntheses_period ON syntheses(period_id);
