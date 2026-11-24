-- 003_functions.sql

CREATE OR REPLACE FUNCTION fn_period_summary(p_period_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_rata_progres numeric := 0;
  v_rata_motivasi numeric := NULL;
  v_total_penundaan int := 0;
  v_hari_terisi int := 0;
  v_distribusi jsonb;
  v_internal int := 0;
  v_eksternal int := 0;
  v_top_kategori jsonb := '[]'::jsonb;
  v_hari_terbaik int[] := ARRAY[]::int[];
  v_hari_terburuk int[] := ARRAY[]::int[];
  v_korelasi numeric := NULL;
  v_pasangan_count int := 0;
  v_max_progres int;
  v_min_progres int;
BEGIN
  -- Rata-rata progres
  SELECT
    COALESCE(ROUND(AVG(progres)), 0),
    COUNT(*)
  INTO v_rata_progres, v_hari_terisi
  FROM v_day_progress
  WHERE period_id = p_period_id AND jumlah_kegiatan > 0;

  -- Rata-rata motivasi & total penundaan
  SELECT
    ROUND(AVG(motivasi), 1),
    COALESCE(SUM(jumlah_penundaan), 0)
  INTO v_rata_motivasi, v_total_penundaan
  FROM days
  WHERE period_id = p_period_id;

  -- Distribusi status kegiatan
  SELECT jsonb_build_object(
    'selesai', COUNT(*) FILTER (WHERE a.status = 'selesai'),
    'setengah', COUNT(*) FILTER (WHERE a.status = 'setengah'),
    'belum', COUNT(*) FILTER (WHERE a.status = 'belum'),
    'terkendala', COUNT(*) FILTER (WHERE a.status = 'terkendala'),
    'tidak_selesai', COUNT(*) FILTER (WHERE a.status = 'tidak_selesai')
  )
  INTO v_distribusi
  FROM days d
  JOIN activities a ON d.id = a.day_id
  WHERE d.period_id = p_period_id;

  -- Internal vs Eksternal
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE o.tipe = 'internal'), 0),
    COALESCE(COUNT(*) FILTER (WHERE o.tipe = 'eksternal'), 0)
  INTO v_internal, v_eksternal
  FROM days d
  JOIN activities a ON d.id = a.day_id
  JOIN obstacles o ON a.id = o.activity_id
  WHERE d.period_id = p_period_id;

  -- Top kategori hambatan
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'nama', oc.nama,
        'tipe', sub.tipe,
        'jumlah', sub.cnt
      )
    ),
    '[]'::jsonb
  )
  INTO v_top_kategori
  FROM (
    SELECT o.kategori_id, o.tipe, COUNT(*) as cnt
    FROM days d
    JOIN activities a ON d.id = a.day_id
    JOIN obstacles o ON a.id = o.activity_id
    WHERE d.period_id = p_period_id AND o.kategori_id IS NOT NULL
    GROUP BY o.kategori_id, o.tipe
    ORDER BY cnt DESC
    LIMIT 3
  ) sub
  JOIN obstacle_categories oc ON sub.kategori_id = oc.id;

  -- Hari terbaik dan terburuk
  SELECT MAX(progres), MIN(progres)
  INTO v_max_progres, v_min_progres
  FROM v_day_progress
  WHERE period_id = p_period_id AND jumlah_kegiatan > 0;

  IF v_max_progres IS NOT NULL THEN
    SELECT array_agg(nomor_hari) INTO v_hari_terbaik
    FROM v_day_progress
    WHERE period_id = p_period_id AND jumlah_kegiatan > 0 AND progres = v_max_progres;

    SELECT array_agg(nomor_hari) INTO v_hari_terburuk
    FROM v_day_progress
    WHERE period_id = p_period_id AND jumlah_kegiatan > 0 AND progres = v_min_progres;
  END IF;

  -- Korelasi Pearson (motivasi vs progres)
  SELECT
    COUNT(*),
    CASE WHEN COUNT(*) >= 5 THEN
      ROUND(corr(d.motivasi, dp.progres)::numeric, 2)
    ELSE NULL END
  INTO v_pasangan_count, v_korelasi
  FROM days d
  JOIN v_day_progress dp ON d.id = dp.day_id
  WHERE d.period_id = p_period_id AND d.motivasi IS NOT NULL AND dp.jumlah_kegiatan > 0;

  RETURN jsonb_build_object(
    'rata_progres', COALESCE(v_rata_progres, 0),
    'rata_motivasi', v_rata_motivasi,
    'total_penundaan', COALESCE(v_total_penundaan, 0),
    'hari_terisi', COALESCE(v_hari_terisi, 0),
    'distribusi', COALESCE(v_distribusi, '{}'::jsonb),
    'internal', v_internal,
    'eksternal', v_eksternal,
    'top_kategori', COALESCE(v_top_kategori, '[]'::jsonb),
    'hari_terbaik', COALESCE(v_hari_terbaik, ARRAY[]::int[]),
    'hari_terburuk', COALESCE(v_hari_terburuk, ARRAY[]::int[]),
    'korelasi', v_korelasi,
    'pasangan_count', v_pasangan_count
  );
END;
$$;
