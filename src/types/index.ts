// ============================================================
// Tipe domain — sesuai skema DB di architecture.md
// ============================================================

export type ActivityStatus =
  | 'selesai'
  | 'belum'
  | 'setengah'
  | 'terkendala'
  | 'tidak_selesai'

export type ObstacleType = 'internal' | 'eksternal'
export type SynthesisKind = '1-2' | '2-3'

export interface Period {
  id: string
  nama: string
  tanggal_mulai: string   // ISO date YYYY-MM-DD
  tanggal_akhir: string
  aktif: boolean
  created_at: string
}

export interface Day {
  id: string
  period_id: string
  nomor_hari: number
  tanggal: string         // ISO date
  motivasi: number | null // 1–10
  teks_motivasi: string | null
  jumlah_penundaan: number
  catatan_akhir: string | null
  updated_at: string
}

export interface Activity {
  id: string
  day_id: string
  urutan: number
  jam_rencana_mulai: string | null  // "HH:MM"
  jam_rencana_selesai: string | null
  nama: string
  jam_aktual_mulai: string | null
  jam_aktual_selesai: string | null
  status: ActivityStatus
  catatan: string | null
  updated_at: string
}

export interface ObstacleCategory {
  id: string
  nama: string
}

export interface Obstacle {
  id: string
  activity_id: string
  tipe: ObstacleType
  kategori_id: string | null
  deskripsi: string | null
  kategori?: ObstacleCategory
}

export interface Synthesis {
  id: string
  period_id: string
  jenis: SynthesisKind
  isi: string
  updated_at: string
}

// ============================================================
// Tipe kalkulasi — dari lib/metrics.ts
// ============================================================

export type WarnaProgres = 'hijau' | 'kuning' | 'merah' | 'netral'

export interface ProgresHarian {
  progres: number       // 0–100
  kosong: boolean
  warna: WarnaProgres
  selesai: number
  setengah: number
  total: number
}

// ============================================================
// Tipe respons API
// ============================================================

export interface PeriodSummary {
  rata_progres: number
  rata_motivasi: number | null
  total_penundaan: number
  hari_terisi: number
  distribusi: Record<ActivityStatus, number>
  internal: number
  eksternal: number
  top_kategori: { nama: string; tipe: ObstacleType; jumlah: number }[]
  hari_terbaik: number[]
  hari_terburuk: number[]
  korelasi: number | null
  pasangan_count: number
}

export interface DayProgress {
  day_id: string
  nomor_hari: number
  tanggal: string
  progres: number
  warna: WarnaProgres
  jumlah_kegiatan: number
  lengkap: boolean
}
