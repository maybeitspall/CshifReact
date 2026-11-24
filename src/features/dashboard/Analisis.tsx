import { Link } from 'react-router-dom'
import { useActivePeriod } from '@/features/periods/api'
import { usePeriodSummary } from './api'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

export default function Analisis() {
  const { data: period, isLoading: loadPeriod } = useActivePeriod()
  const { data: summary, isLoading, isError, refetch } = usePeriodSummary(period?.id)

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

  if (isError || !summary) return <ErrorState onRetry={refetch} />

  const total = (summary.internal + summary.eksternal) || 1

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-analisis">
      <h1 id="judul-analisis">Analisis hambatan</h1>

      <h2>Internal dan eksternal</h2>
      <div className="compare">
        <div className="compare__row"><span>Internal</span><span className="num">{summary.internal}</span></div>
        <div className="bar-track" aria-hidden="true">
          <span className="bar-fill" style={{ '--value': summary.internal / total } as React.CSSProperties} />
        </div>
      </div>
      <div className="compare">
        <div className="compare__row"><span>Eksternal</span><span className="num">{summary.eksternal}</span></div>
        <div className="bar-track" aria-hidden="true">
          <span className="bar-fill bar-fill--muted" style={{ '--value': summary.eksternal / total } as React.CSSProperties} />
        </div>
      </div>

      <h2>Pemicu teratas</h2>
      <dl className="rank-list">
        {summary.top_kategori.length ? summary.top_kategori.map((item, i) => (
          <div key={i}>
            <dt>{item.nama}</dt>
            <dd className="num">{item.jumlah} {item.tipe}</dd>
          </div>
        )) : (
          <div><dt>Belum ada hambatan tercatat</dt><dd>Isi hambatan saat status terkendala.</dd></div>
        )}
      </dl>

      <h2>Hubungan motivasi dan progres</h2>
      <div className="well">
        <p className="corr-figure num">
          {summary.korelasi !== null
            ? `r = ${summary.korelasi.toFixed(2)} dari ${summary.pasangan_count} hari`
            : 'data belum cukup'}
        </p>
        <p className="helper">
          {summary.korelasi !== null
            ? 'Korelasi tidak membuktikan sebab-akibat.'
            : `Diperlukan minimal 5 hari lengkap. Tersedia ${summary.pasangan_count} hari.`}
        </p>
      </div>

      <dl className="rank-list">
        <div>
          <dt>Hari terbaik</dt>
          <dd>{summary.hari_terbaik.join(', ') || '—'}</dd>
        </div>
        <div>
          <dt>Hari terburuk</dt>
          <dd>{summary.hari_terburuk.join(', ') || '—'}</dd>
        </div>
      </dl>
    </section>
  )
}
