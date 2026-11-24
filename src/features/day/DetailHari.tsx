import { useParams } from 'react-router-dom'
import { useDay, useActivities, useUpdateActivity, useUpdateDay } from './api'
import ActivityItem from './ActivityItem'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import { progresHarian, scoreClass, levelMotivasi } from '@/lib/metrics'
import { useState, useRef } from 'react'

export default function DetailHari() {
  const { id } = useParams<{ id: string }>()
  const { data: day, isLoading: loadDay, isError: errDay, refetch } = useDay(id ?? '')
  const { data: activities = [], isLoading: loadAct } = useActivities(id ?? '')
  const updateDay      = useUpdateDay()
  const updateActivity = useUpdateActivity()
  const saveTimer      = useRef<ReturnType<typeof setTimeout>>()
  const [saveMsg, setSaveMsg]   = useState('')

  const progres = progresHarian(activities)

  function scheduleSaveDay(patch: Parameters<typeof updateDay.mutate>[0]) {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateDay.mutate(patch, {
        onSuccess: () => setSaveMsg(`Tersimpan pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.`),
        onError:   () => setSaveMsg('Gagal menyimpan.'),
      })
    }, 600)
  }

  if (loadDay || loadAct) return <Skeleton />
  if (errDay || !day)     return <ErrorState onRetry={refetch} />

  const tanggalLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(day.tanggal))

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-detail">
      <div className="page-head">
        <div>
          <h1 id="judul-detail">Hari ke-{day.nomor_hari}</h1>
          <p className="date-line"><time dateTime={day.tanggal}>{tanggalLabel}</time></p>
        </div>
      </div>

      {/* Progress */}
      <div className={`progress-panel ${scoreClass(progres.warna)}`}>
        <div className="progress-panel__top">
          <div>
            <p className="progress-figure num">{progres.progres}%</p>
            <p className="progress-caption">progres hari ini</p>
          </div>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span className="progress-fill" style={{ '--value': progres.progres / 100 } as React.CSSProperties} />
        </div>
      </div>

      {/* Motivasi */}
      <h2>Motivasi pagi</h2>
      <div className="well field-stack">
        <div className="field">
          <label htmlFor="motivasi-range">Motivasi, 1 sampai 10</label>
          <div className="range-row">
            <input
              id="motivasi-range"
              type="range" min={1} max={10} step={1}
              defaultValue={day.motivasi ?? 5}
              onChange={(e) => scheduleSaveDay({ id: day.id, motivasi: Number(e.target.value), period_id: day.period_id })}
            />
            <output className="num range-value">{day.motivasi ?? '—'}</output>
          </div>
          <p className="helper">{day.motivasi ? levelMotivasi(day.motivasi) : ''}</p>
        </div>
        <div className="field">
          <label htmlFor="teks-motivasi">Catatan motivasi, opsional</label>
          <input
            className="input" id="teks-motivasi" type="text"
            defaultValue={day.teks_motivasi ?? ''}
            placeholder="Contoh: ingin konsisten besok"
            onBlur={(e) => scheduleSaveDay({ id: day.id, teks_motivasi: e.target.value, period_id: day.period_id })}
          />
        </div>
      </div>

      {/* Kegiatan */}
      <h2>Kegiatan</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onStatusToggle={(act, next) => updateActivity.mutate({ id: act.id, status: next })}
          />
        ))}
      </div>

      {/* Refleksi */}
      <h2>Refleksi malam</h2>
      <div className="well field-stack">
        <div className="field">
          <label htmlFor="penundaan">Jumlah penundaan</label>
          <input
            className="input num" id="penundaan" type="number" min={0}
            defaultValue={day.jumlah_penundaan}
            onBlur={(e) => scheduleSaveDay({ id: day.id, jumlah_penundaan: Math.max(0, Number(e.target.value)), period_id: day.period_id })}
          />
        </div>
        <div className="field">
          <label htmlFor="catatan-akhir">Pemicu utama hari ini</label>
          <textarea
            className="input" id="catatan-akhir" rows={3}
            defaultValue={day.catatan_akhir ?? ''}
            placeholder="Tidak ada hambatan sejauh ini…"
            onBlur={(e) => scheduleSaveDay({ id: day.id, catatan_akhir: e.target.value, period_id: day.period_id })}
          />
        </div>
      </div>

      <p className="save-status" role="status" aria-live="polite">{saveMsg}</p>
    </section>
  )
}
