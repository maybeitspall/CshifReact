import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useActivePeriod } from '@/features/periods/api'
import { useDay, useActivities, useUpdateActivity, useCreateActivity } from './api'
import ActivityItem from './ActivityItem'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import { progresHarian, scoreClass } from '@/lib/metrics'
import type { Activity, ActivityStatus } from '@/types'

export default function HariIni() {
  const { data: period } = useActivePeriod()

  // Hitung nomor hari secara presisi berdasarkan kalender lokal (tanpa pergeseran zona waktu)
  const todayNomor = period ? (() => {
    const now = new Date()
    const todayYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startObj = new Date(period.tanggal_mulai)
    const startYMD = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate()).getTime()
    const diffDays = Math.round((todayYMD - startYMD) / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays + 1)
  })() : 1

  const [customNomor, setCustomNomor] = useState<number | null>(null)
  const activeNomor = customNomor ?? todayNomor

  // Ambil day berdasarkan period + nomorHari
  const { data: days } = useDay(period?.id && activeNomor ? `${period.id}__${activeNomor}` : '')
  const day = Array.isArray(days) ? days[0] : days

  const { data: activities = [], isLoading, isError, refetch } = useActivities(day?.id ?? '')
  const updateActivity = useUpdateActivity()
  const createActivity = useCreateActivity()

  const progres = progresHarian(activities)

  const handleStatusToggle = useCallback((activity: Activity, next: ActivityStatus) => {
    updateActivity.mutate({ id: activity.id, status: next })
  }, [updateActivity])

  if (!period) return (
    <div className="screen" style={{ display: 'block', paddingTop: 'var(--space-lg)' }}>
      <div className="well" style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: 'var(--space-md)' }}>Belum ada periode aktif.</p>
        <Link className="btn btn--primary" to="/pengaturan">
          Buka Pengaturan & Buat Periode
        </Link>
      </div>
    </div>
  )
  if (isLoading) return <Skeleton />
  if (isError)   return <ErrorState onRetry={refetch} />

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-hari-ini">
      {/* Header dengan pager */}
      <div className="page-head">
        <div>
          <h1 id="judul-hari-ini">Hari ke-{day?.nomor_hari ?? activeNomor}</h1>
          <p className="date-line">
            <time dateTime={day?.tanggal}>
              {day?.tanggal
                ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    .format(new Date(day.tanggal))
                : '—'}
            </time>
          </p>
        </div>
        <div className="pager">
          <button
            className="icon-btn"
            type="button"
            aria-label="Hari sebelumnya"
            disabled={activeNomor <= 1}
            onClick={() => setCustomNomor(Math.max(1, activeNomor - 1))}
          >
            <svg className="icon" aria-hidden="true"><use href="#i-prev" /></svg>
          </button>
          <button
            className="icon-btn"
            type="button"
            aria-label="Hari berikutnya"
            onClick={() => setCustomNomor(activeNomor + 1)}
          >
            <svg className="icon" aria-hidden="true"><use href="#i-next" /></svg>
          </button>
        </div>
      </div>

      {/* Progress panel */}
      <div className={`progress-panel ${scoreClass(progres.warna)}`}>
        <div className="progress-panel__top">
          <div>
            <p className="progress-figure num">{progres.progres}%</p>
            <p className="progress-caption">progres hari ini</p>
          </div>
          <p className="progress-color">
            {progres.warna === 'netral' ? 'kosong' : progres.warna}
          </p>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span
            className="progress-fill"
            style={{ '--value': progres.progres / 100 } as React.CSSProperties}
          />
        </div>
        <p className="progress-detail">
          {progres.selesai} selesai, {progres.setengah} setengah, {progres.total} kegiatan terisi
        </p>
      </div>

      {/* Daftar kegiatan */}
      <h2>Kegiatan</h2>
      <p className="section-note">
        Ketuk status untuk mengubahnya. Pilih Ubah untuk mengedit, memindah, atau menghapus kegiatan.
      </p>
      <div className="activity-list">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onStatusToggle={handleStatusToggle}
          />
        ))}
      </div>

      {/* Form tambah kegiatan */}
      <TambahKegiatanForm
        dayId={day?.id ?? ''}
        nextUrutan={activities.length + 1}
        onSubmit={createActivity.mutate}
      />

      {/* Refleksi malam */}
      {day && <RefleksiMalam day={day} />}

      <p className="save-status" role="status" aria-live="polite">
        {updateActivity.isSuccess ? 'Tersimpan.' : ''}
      </p>
    </section>
  )
}

// ---- Sub-components ----

function TambahKegiatanForm({
  dayId,
  nextUrutan,
  onSubmit,
}: {
  dayId: string
  nextUrutan: number
  onSubmit: (data: Omit<Activity, 'id' | 'updated_at'>) => void
}) {
  const [open, setOpen] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const nama = (fd.get('nama') as string).trim()
    if (!nama) return
    onSubmit({
      day_id:              dayId,
      urutan:              nextUrutan,
      nama,
      jam_rencana_mulai:   fd.get('mulai')        as string || null,
      jam_rencana_selesai: fd.get('selesai')      as string || null,
      jam_aktual_mulai:    fd.get('aktualMulai')  as string || null,
      jam_aktual_selesai:  fd.get('aktualSelesai') as string || null,
      catatan:             fd.get('catatan')       as string || null,
      status:              'belum',
    })
    e.currentTarget.reset()
    setOpen(false)
  }

  return (
    <details className="add-form" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <svg className="icon" aria-hidden="true"><use href="#i-plus" /></svg>
        <span>Tambah kegiatan</span>
      </summary>
      <form className="field-stack" onSubmit={handleSubmit} style={{ marginTop: 'var(--space-md)' }}>
        <div className="field">
          <label htmlFor="baru-nama">Nama kegiatan</label>
          <input className="input" id="baru-nama" name="nama" type="text" required autoComplete="off" />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="baru-mulai">Rencana mulai</label>
            <input className="input" id="baru-mulai" name="mulai" type="time" />
          </div>
          <div className="field">
            <label htmlFor="baru-selesai">Rencana selesai</label>
            <input className="input" id="baru-selesai" name="selesai" type="time" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="baru-catatan">Catatan, opsional</label>
          <textarea className="input" id="baru-catatan" name="catatan" rows={2} />
        </div>
        <Button variant="primary" type="submit">Tambah kegiatan</Button>
      </form>
    </details>
  )
}

function RefleksiMalam({ day }: { day: import('@/types').Day }) {
  return (
    <div>
      <h2>Refleksi malam</h2>
      <div className="well field-stack">
        <div className="field">
          <label htmlFor="jumlah-penundaan">Jumlah penundaan</label>
          <input
            className="input num"
            id="jumlah-penundaan"
            type="number"
            min={0}
            defaultValue={day.jumlah_penundaan}
          />
        </div>
        <div className="field">
          <label htmlFor="catatan-akhir">Pemicu utama hari ini</label>
          <textarea
            className="input"
            id="catatan-akhir"
            rows={3}
            defaultValue={day.catatan_akhir ?? ''}
            placeholder="Tidak ada hambatan sejauh ini…"
          />
        </div>
      </div>
    </div>
  )
}
