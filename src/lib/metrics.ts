// ============================================================
// Pure functions — identik dengan SQL view/RPC di server
// Unit test: tests/unit/metrics.test.ts
// ============================================================

import type { Activity, ActivityStatus, ProgresHarian, WarnaProgres } from '@/types'

// Urutan siklus status (ketuk chip untuk maju)
export const STATUS_ORDER: ActivityStatus[] = [
  'belum',
  'selesai',
  'setengah',
  'terkendala',
  'tidak_selesai',
]

export const STATUS_LABEL: Record<ActivityStatus, string> = {
  belum:          'Belum',
  selesai:        'Selesai',
  setengah:       'Setengah',
  terkendala:     'Terkendala',
  tidak_selesai:  'Tidak selesai',
}

export const OBSTACLE_STATUSES: ActivityStatus[] = ['terkendala', 'tidak_selesai']

/** Hitung progres satu hari — identik dengan SQL view v_day_progress */
export function progresHarian(activities: Activity[]): ProgresHarian {
  const terisi = activities.filter((a) => a.nama.trim() !== '')
  if (terisi.length === 0) {
    return { progres: 0, kosong: true, warna: 'netral', selesai: 0, setengah: 0, total: 0 }
  }
  const selesai  = terisi.filter((a) => a.status === 'selesai').length
  const setengah = terisi.filter((a) => a.status === 'setengah').length
  const skor     = selesai + setengah * 0.5
  const progres  = Math.round((skor / terisi.length) * 100)
  return {
    progres,
    kosong: false,
    warna: warnaProgres(progres),
    selesai,
    setengah,
    total: terisi.length,
  }
}

export function warnaProgres(progres: number): WarnaProgres {
  if (progres >= 80) return 'hijau'
  if (progres >= 50) return 'kuning'
  return 'merah'
}

/** Level motivasi dari angka 1–10 */
export function levelMotivasi(n: number): 'Rendah' | 'Sedang' | 'Tinggi' {
  if (n <= 3) return 'Rendah'
  if (n <= 6) return 'Sedang'
  return 'Tinggi'
}

/** Keterlambatan dalam menit (negatif = lebih awal) */
export function keterlambatanMenit(
  rencanaMulai: string | null,
  aktualMulai: string | null,
): number | null {
  if (!rencanaMulai || !aktualMulai) return null
  return toMenit(aktualMulai) - toMenit(rencanaMulai)
}

function toMenit(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Korelasi Pearson — identik dengan fn_period_summary SQL */
export function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length
  if (n < 5) return null
  const mx = rata(xs)
  const my = rata(ys)
  let atas = 0, bX = 0, bY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    atas += dx * dy
    bX   += dx * dx
    bY   += dy * dy
  }
  if (bX === 0 || bY === 0) return null
  return atas / Math.sqrt(bX * bY)
}

export function rata(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** Status berikutnya dalam siklus */
export function nextStatus(current: ActivityStatus): ActivityStatus {
  const idx = STATUS_ORDER.indexOf(current)
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
}

/** CSS class untuk warna progres */
export function scoreClass(warna: WarnaProgres): string {
  return {
    hijau:  'score-hijau',
    kuning: 'score-kuning',
    merah:  'score-merah',
    netral: '',
  }[warna]
}
