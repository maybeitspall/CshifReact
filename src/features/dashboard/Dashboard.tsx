import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useActivePeriod } from '@/features/periods/api'
import { usePeriodSummary } from './api'
import { useDayProgress } from '@/features/day/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import { STATUS_LABEL } from '@/lib/metrics'

export default function Dashboard() {
  const [rentang, setRentang] = useState<'7' | '30' | 'semua'>('semua')
  const { data: period, isLoading: loadPeriod } = useActivePeriod()
  const { data: summary, isLoading, isError, refetch } = usePeriodSummary(period?.id)
  const { data: dayProgress = [] } = useDayProgress(period?.id ?? '')

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

  const filteredDays = rentang === '7'
    ? dayProgress.slice(-7)
    : rentang === '30'
    ? dayProgress.slice(-30)
    : dayProgress

  const progresData  = filteredDays.map((dp) => ({ hari: dp.nomor_hari, progres: dp.progres }))
  const totalStatus  = Object.values(summary.distribusi).reduce((a, b) => a + b, 0) || 1

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-dashboard">
      <h1 id="judul-dashboard">Dashboard periode</h1>

      <div className="field field--inline" style={{ marginTop: 'var(--space-md)' }}>
        <label htmlFor="rentang">Rentang yang ditampilkan</label>
        <select
          className="input"
          id="rentang"
          value={rentang}
          onChange={(e) => setRentang(e.target.value as '7' | '30' | 'semua')}
        >
          <option value="semua">Semua hari ({dayProgress.length} hari)</option>
          <option value="30">30 hari terakhir</option>
          <option value="7">7 hari terakhir</option>
        </select>
      </div>

      {/* KPI */}
      <div className="stats" aria-label="Ringkasan periode">
        <div className="stat">
          <p className="stat__value num">{summary.rata_progres}%</p>
          <p className="stat__label">rata-rata progres</p>
        </div>
        <div className="stat">
          <p className="stat__value num">
            {summary.rata_motivasi?.toLocaleString('id-ID', { minimumFractionDigits: 1 }) ?? '—'}
          </p>
          <p className="stat__label">rata-rata motivasi</p>
        </div>
        <div className="stat">
          <p className="stat__value num">{summary.total_penundaan}</p>
          <p className="stat__label">total penundaan</p>
        </div>
        <div className="stat">
          <p className="stat__value num">{summary.hari_terisi} hari</p>
          <p className="stat__label">hari terisi</p>
        </div>
      </div>

      {/* Grafik progres */}
      <h2>Progres harian</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height={96}>
          <LineChart data={progresData}>
            <XAxis dataKey="hari" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip formatter={(v) => [`${v}%`, 'Progres']} />
            <Line
              type="monotone" dataKey="progres"
              stroke="var(--color-accent)" strokeWidth={2} dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribusi status */}
      <h2>Distribusi status</h2>
      <div className="dist" role="img" aria-label="Distribusi lima status kegiatan">
        {Object.entries(summary.distribusi).map(([status, count]) => (
          <span
            key={status}
            className="dist__seg"
            style={{
              '--share': count / totalStatus,
              '--seg-color': `var(--status-${status === 'selesai' ? 'done' : status === 'setengah' ? 'half' : 'none'})`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <dl className="dist-legend">
        {Object.entries(summary.distribusi).map(([status, count]) => (
          <div key={status}>
            <dt>{STATUS_LABEL[status as keyof typeof STATUS_LABEL]}</dt>
            <dd className="num">{count}</dd>
          </div>
        ))}
      </dl>

      {/* Rekap tabel progres */}
      <h2>Rekap progres</h2>
      <table className="rekap">
        <thead>
          <tr>
            <th scope="col">Hari</th>
            <th scope="col">Progres</th>
          </tr>
        </thead>
        <tbody>
          {filteredDays.slice().reverse().map((dp) => (
            <tr key={dp.day_id}>
              <td>Hari {dp.nomor_hari}</td>
              <td data-label="Progres" className="num">{dp.progres}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
