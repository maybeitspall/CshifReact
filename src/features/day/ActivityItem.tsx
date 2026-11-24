import { useState } from 'react'
import StatusChip from '@/components/ui/StatusChip'
import { OBSTACLE_STATUSES, STATUS_LABEL } from '@/lib/metrics'
import { keterlambatanMenit } from '@/lib/metrics'
import { useUpdateActivity, useDeleteActivity, useObstacleCategories, useUpsertObstacle } from './api'
import type { Activity, ActivityStatus, Obstacle } from '@/types'

interface ActivityItemProps {
  activity: Activity
  onStatusToggle: (activity: Activity, next: ActivityStatus) => void
  obstacle?: Obstacle | null
}

export default function ActivityItem({ activity, onStatusToggle, obstacle }: ActivityItemProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const updateActivity = useUpdateActivity()
  const deleteActivity = useDeleteActivity()
  const butuhObstacle  = OBSTACLE_STATUSES.includes(activity.status)
  const telat          = keterlambatanMenit(activity.jam_rencana_mulai, activity.jam_aktual_mulai)

  return (
    <div className="activity">
      <div className="activity__main">
        <p className="activity__time num">
          <time>{activity.jam_rencana_mulai ?? '--'}</time>
          {' '}sampai{' '}
          <time>{activity.jam_rencana_selesai ?? '--'}</time>
        </p>
        <p className="activity__name">{activity.nama}</p>
        {(activity.jam_aktual_mulai || activity.jam_aktual_selesai) && (
          <p className="activity__actual num">
            Aktual {activity.jam_aktual_mulai ?? '--'} sampai {activity.jam_aktual_selesai ?? '--'}
          </p>
        )}
        {telat !== null && (
          <p className="activity__actual">
            {telat > 0
              ? `Terlambat ${telat} menit`
              : telat < 0
              ? `${Math.abs(telat)} menit lebih awal`
              : 'Tepat waktu'}
          </p>
        )}
      </div>

      <div className="activity__actions">
        <StatusChip
          status={activity.status}
          activityId={activity.id}
          onToggle={(next) => onStatusToggle(activity, next)}
        />
        <button
          className="quiet-btn"
          type="button"
          aria-expanded={editorOpen}
          onClick={() => setEditorOpen((v) => !v)}
        >
          Ubah
        </button>
      </div>

      {/* Obstacle form — muncul hanya saat status perlu */}
      {butuhObstacle && (
        <ObstacleInline activityId={activity.id} obstacle={obstacle} />
      )}

      {/* Editor inline */}
      {editorOpen && (
        <ActivityEditor
          activity={activity}
          onSave={(data) => {
            updateActivity.mutate({ id: activity.id, ...data })
            setEditorOpen(false)
          }}
          onDelete={() => {
            if (window.confirm(`Hapus kegiatan ${activity.nama}?`)) {
              deleteActivity.mutate({ id: activity.id, dayId: activity.day_id })
            }
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}

// ---- Obstacle inline ----
function ObstacleInline({
  activityId,
  obstacle,
}: {
  activityId: string
  obstacle?: Obstacle | null
}) {
  const { data: kategoriList = [] } = useObstacleCategories()
  const upsert = useUpsertObstacle()

  function handleChange(field: string, value: string) {
    upsert.mutate({
      activity_id: activityId,
      tipe:        field === 'tipe'    ? (value as Obstacle['tipe']) : obstacle?.tipe ?? 'internal',
      kategori_id: field === 'kategori_id' ? value : obstacle?.kategori_id ?? null,
      deskripsi:   field === 'deskripsi' ? value : obstacle?.deskripsi ?? '',
      ...(obstacle?.id ? { id: obstacle.id } : {}),
    })
  }

  return (
    <div className="obstacle">
      <div className="field">
        <label>Tipe hambatan</label>
        <select
          className="input"
          defaultValue={obstacle?.tipe ?? 'internal'}
          onChange={(e) => handleChange('tipe', e.target.value)}
        >
          <option value="internal">Internal</option>
          <option value="eksternal">Eksternal</option>
        </select>
      </div>
      <div className="field">
        <label>Kategori</label>
        <select
          className="input"
          defaultValue={obstacle?.kategori_id ?? ''}
          onChange={(e) => handleChange('kategori_id', e.target.value)}
        >
          <option value="">Pilih kategori</option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.id}>{k.nama}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Catatan singkat</label>
        <input
          className="input"
          type="text"
          defaultValue={obstacle?.deskripsi ?? ''}
          placeholder="Apa yang mengganggu?"
          onBlur={(e) => handleChange('deskripsi', e.target.value)}
        />
      </div>
    </div>
  )
}

// ---- Activity editor inline ----
function ActivityEditor({
  activity,
  onSave,
  onDelete,
  onClose,
}: {
  activity: Activity
  onSave: (data: Partial<Activity>) => void
  onDelete: () => void
  onClose: () => void
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const nama = (fd.get('nama') as string).trim()
    if (!nama) return
    onSave({
      nama,
      jam_rencana_mulai:   fd.get('mulai')         as string || null,
      jam_rencana_selesai: fd.get('selesai')        as string || null,
      jam_aktual_mulai:    fd.get('aktualMulai')    as string || null,
      jam_aktual_selesai:  fd.get('aktualSelesai')  as string || null,
      status:              fd.get('status')          as ActivityStatus,
      catatan:             fd.get('catatan')         as string || null,
    })
  }

  return (
    <details className="editor" open>
      <summary className="edit-summary">Ubah detail kegiatan</summary>
      <form className="editor__form field-stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor={`edit-nama-${activity.id}`}>Nama kegiatan</label>
          <input className="input" id={`edit-nama-${activity.id}`} name="nama"
            type="text" required defaultValue={activity.nama} />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor={`edit-mulai-${activity.id}`}>Rencana mulai</label>
            <input className="input" id={`edit-mulai-${activity.id}`} name="mulai"
              type="time" defaultValue={activity.jam_rencana_mulai ?? ''} />
          </div>
          <div className="field">
            <label htmlFor={`edit-selesai-${activity.id}`}>Rencana selesai</label>
            <input className="input" id={`edit-selesai-${activity.id}`} name="selesai"
              type="time" defaultValue={activity.jam_rencana_selesai ?? ''} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Aktual mulai</label>
            <input className="input" name="aktualMulai" type="time"
              defaultValue={activity.jam_aktual_mulai ?? ''} />
          </div>
          <div className="field">
            <label>Aktual selesai</label>
            <input className="input" name="aktualSelesai" type="time"
              defaultValue={activity.jam_aktual_selesai ?? ''} />
          </div>
        </div>
        <div className="field">
          <label>Status</label>
          <select className="input" name="status" defaultValue={activity.status}>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Catatan kegiatan</label>
          <textarea className="input" name="catatan" rows={2}
            defaultValue={activity.catatan ?? ''} />
        </div>
        <div className="editor__actions">
          <button className="btn btn--primary" type="submit">Simpan perubahan</button>
          <button className="btn" type="button" onClick={onClose}>Batal</button>
          <button className="btn btn--danger" type="button" onClick={onDelete}>Hapus</button>
        </div>
      </form>
    </details>
  )
}
