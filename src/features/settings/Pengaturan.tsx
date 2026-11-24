import { useState } from 'react'
import { usePeriods, useCreatePeriod, useUpdatePeriod, useDeletePeriod } from '@/features/periods/api'
import { useObstacleCategories } from '@/features/day/api'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'

export default function Pengaturan() {
  const { data: periods = [], isLoading } = usePeriods()
  const { data: kategori = [] }           = useObstacleCategories()
  const createPeriod = useCreatePeriod()
  const updatePeriod = useUpdatePeriod()
  const deletePeriod = useDeletePeriod()

  const todayStr = new Date().toISOString().slice(0, 10)
  const [mulai, setMulai] = useState(todayStr)
  const [akhir, setAkhir] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 29)
    return d.toISOString().slice(0, 10)
  })

  const activePeriod = periods.find((p) => p.aktif)

  function applyPreset(days: number) {
    const base = mulai ? new Date(mulai) : new Date()
    const target = new Date(base)
    target.setDate(base.getDate() + (days - 1))
    setAkhir(target.toISOString().slice(0, 10))
  }

  function handleCreatePeriod(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd   = new FormData(e.currentTarget)
    const nama = (fd.get('nama') as string).trim()
    if (!nama || !mulai || !akhir) return
    createPeriod.mutate({ nama, tanggal_mulai: mulai, tanggal_akhir: akhir, aktif: true })
    e.currentTarget.reset()
  }

  function handleExtendPeriod(periodId: string, currentEnd: string, additionalDays: number) {
    const d = new Date(currentEnd)
    d.setDate(d.getDate() + additionalDays)
    const newEnd = d.toISOString().slice(0, 10)
    updatePeriod.mutate({ id: periodId, tanggal_akhir: newEnd })
  }

  if (isLoading) return <Skeleton />

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-pengaturan">
      <h1 id="judul-pengaturan">Pengaturan</h1>

      {/* Periode aktif */}
      <h2>Periode aktif</h2>
      {activePeriod ? (
        <div className="well">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{activePeriod.nama}</p>
              <p className="helper">
                <time>{activePeriod.tanggal_mulai}</time> sampai <time>{activePeriod.tanggal_akhir}</time>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
              <Button onClick={() => handleExtendPeriod(activePeriod.id, activePeriod.tanggal_akhir, 30)}>
                +30 Hari
              </Button>
              <Button onClick={() => handleExtendPeriod(activePeriod.id, activePeriod.tanggal_akhir, 60)}>
                +60 Hari
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="section-note">Belum ada periode aktif.</p>
      )}

      {/* Semua periode */}
      <h2>Semua periode</h2>
      {periods.map((p) => (
        <div key={p.id} className="activity" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-sm)', padding: 'var(--space-md) 0', borderBottom: '1px solid var(--color-rule)' }}>
          <div>
            <p style={{ fontWeight: 500 }}>{p.nama} {p.aktif ? '(Aktif)' : ''}</p>
            <p className="helper"><time>{p.tanggal_mulai}</time> – <time>{p.tanggal_akhir}</time></p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {!p.aktif && (
              <Button onClick={() => updatePeriod.mutate({ id: p.id, aktif: true })}>
                Aktifkan
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(`Hapus periode "${p.nama}"? Semua data akan dihapus.`)) {
                  deletePeriod.mutate(p.id)
                }
              }}
            >
              Hapus
            </Button>
          </div>
        </div>
      ))}

      {/* Buat periode baru */}
      <h2>Buat periode baru (Berkelanjutan / Sustainable)</h2>
      <form className="well field-stack" onSubmit={handleCreatePeriod}>
        <div className="field">
          <label htmlFor="nama-periode">Nama periode</label>
          <input className="input" id="nama-periode" name="nama" type="text" required placeholder="Contoh: Coaching Semester 1" />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="mulai-periode">Tanggal mulai</label>
            <input
              className="input"
              id="mulai-periode"
              name="mulai"
              type="date"
              required
              value={mulai}
              onChange={(e) => setMulai(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="akhir-periode">Tanggal akhir</label>
            <input
              className="input"
              id="akhir-periode"
              name="akhir"
              type="date"
              required
              value={akhir}
              onChange={(e) => setAkhir(e.target.value)}
            />
          </div>
        </div>

        {/* Preset durasi */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Pilih Durasi Cepat:</span>
          <button className="chip" type="button" onClick={() => applyPreset(30)}>30 Hari</button>
          <button className="chip" type="button" onClick={() => applyPreset(60)}>60 Hari</button>
          <button className="chip" type="button" onClick={() => applyPreset(90)}>90 Hari</button>
          <button className="chip" type="button" onClick={() => applyPreset(180)}>6 Bulan</button>
          <button className="chip" type="button" onClick={() => applyPreset(365)}>1 Tahun</button>
        </div>

        <Button variant="primary" type="submit" busy={createPeriod.isPending}>
          {createPeriod.isPending ? 'Membuat…' : 'Buat & Aktifkan Periode'}
        </Button>
      </form>

      {/* Kategori hambatan */}
      <h2>Kategori hambatan</h2>
      <ul className="plain-list">
        {kategori.map((k) => <li key={k.id}>{k.nama}</li>)}
      </ul>
    </section>
  )
}
