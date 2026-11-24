-- 002_views.sql

CREATE OR REPLACE VIEW v_day_progress AS
SELECT
  d.id AS day_id,
  d.period_id,
  d.nomor_hari,
  d.tanggal,
  COALESCE(
    ROUND(
      (
        COUNT(*) FILTER (WHERE a.status = 'selesai')::numeric * 1.0 +
        COUNT(*) FILTER (WHERE a.status = 'setengah')::numeric * 0.5
      ) / NULLIF(COUNT(a.id), 0) * 100
    ),
    0
  )::int AS progres,
  CASE
    WHEN COUNT(a.id) = 0 THEN 'netral'
    WHEN ROUND(
      (
        COUNT(*) FILTER (WHERE a.status = 'selesai')::numeric * 1.0 +
        COUNT(*) FILTER (WHERE a.status = 'setengah')::numeric * 0.5
      ) / NULLIF(COUNT(a.id), 0) * 100
    ) >= 80 THEN 'hijau'
    WHEN ROUND(
      (
        COUNT(*) FILTER (WHERE a.status = 'selesai')::numeric * 1.0 +
        COUNT(*) FILTER (WHERE a.status = 'setengah')::numeric * 0.5
      ) / NULLIF(COUNT(a.id), 0) * 100
    ) >= 50 THEN 'kuning'
    ELSE 'merah'
  END AS warna,
  COUNT(a.id)::int AS jumlah_kegiatan,
  (
    COUNT(a.id) FILTER (WHERE a.status IN ('terkendala', 'tidak_selesai')) =
    COUNT(o.id) FILTER (WHERE a.status IN ('terkendala', 'tidak_selesai'))
  ) AS lengkap
FROM days d
LEFT JOIN activities a ON d.id = a.day_id AND TRIM(a.nama) <> ''
LEFT JOIN obstacles o ON a.id = o.activity_id
GROUP BY d.id, d.period_id, d.nomor_hari, d.tanggal;

CREATE OR REPLACE VIEW v_activity_derived AS
SELECT
  a.*,
  CASE
    WHEN a.jam_rencana_mulai IS NOT NULL AND a.jam_aktual_mulai IS NOT NULL THEN
      EXTRACT(EPOCH FROM (a.jam_aktual_mulai - a.jam_rencana_mulai)) / 60
    ELSE NULL
  END::int AS keterlambatan_menit
FROM activities a;
