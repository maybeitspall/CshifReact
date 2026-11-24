import type { Day, Activity } from '@/types'
import { progresHarian } from './metrics'

// ============================================================
// Ekspor CSV — identik dengan prototype app.js
// ============================================================

export function eksporCsv(days: Day[], activitiesByDay: Record<string, Activity[]>): void {
  const header = [
    'hari', 'tanggal', 'progres', 'motivasi', 'penundaan', 'catatan_akhir',
    'kegiatan', 'jam_rencana_mulai', 'jam_rencana_selesai',
    'jam_aktual_mulai', 'jam_aktual_selesai',
    'status', 'catatan_kegiatan',
  ]
  const rows: string[][] = [header]

  for (const day of days) {
    const activities = activitiesByDay[day.id] ?? []
    const { progres } = progresHarian(activities)
    const baseRow = [
      String(day.nomor_hari),
      day.tanggal,
      String(progres),
      day.motivasi == null ? '' : String(day.motivasi),
      String(day.jumlah_penundaan),
      day.catatan_akhir ?? '',
    ]
    if (!activities.length) {
      rows.push([...baseRow, '', '', '', '', '', '', ''])
      continue
    }
    for (const a of activities) {
      rows.push([
        ...baseRow,
        a.nama,
        a.jam_rencana_mulai  ?? '',
        a.jam_rencana_selesai ?? '',
        a.jam_aktual_mulai   ?? '',
        a.jam_aktual_selesai ?? '',
        a.status,
        a.catatan ?? '',
      ])
    }
  }

  const csv = rows
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href     = url
  link.download = 'rekap-timeblocking-shf-c.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
