import { Link } from 'react-router-dom'
import { useActivePeriod } from '@/features/periods/api'
import { useDayProgress } from './api'
import { scoreClass } from '@/lib/metrics'
import { useNavigate } from 'react-router-dom'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

export default function Kalender() {
  const { data: period, isLoading: loadPeriod } = useActivePeriod()
  const { data: progress = [], isLoading, isError, refetch } = useDayProgress(period?.id ?? '')
  const navigate = useNavigate()

  if (loadPeriod || isLoading) return <Skeleton />

  if (!period) {
    return (
      <section className="screen" style={{ display: 'block', paddingTop: 'var(--space-lg)' }}>
        <div className="well" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 'var(--space-md)' }}>Belum ada periode aktif.</p>
          <Link className="btn btn--primary" to="/pengaturan">
            Buka Pengaturan & Buat Periode
          </Link>
        </div>
      </section>
    )
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-kalender">
      <h1 id="judul-kalender">Kalender periode</h1>
      <p className="date-line">
        <time>{period.tanggal_mulai}</time> sampai <time>{period.tanggal_akhir}</time>
      </p>

      <div
        className="calendar-grid"
        role="group"
        aria-label="Hari-hari periode, ditandai menurut progres"
      >
        {progress.map((dp) => (
          <button
            key={dp.day_id}
            className={`day-cell ${scoreClass(dp.warna)}`}
            type="button"
            data-day={dp.nomor_hari}
            aria-label={`Hari ${dp.nomor_hari}, progres ${dp.progres}%`}
            onClick={() => navigate(`/hari/${dp.day_id}`)}
          >
            <span className="num">{dp.nomor_hari}</span>
            <span className="num">{dp.progres}%</span>
          </button>
        ))}
      </div>

    </section>
  )
}
