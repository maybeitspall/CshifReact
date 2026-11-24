import { Link } from 'react-router-dom'
import { useActivePeriod } from '@/features/periods/api'
import { useSyntheses, useUpsertSynthesis } from './api'
import { usePeriodSummary } from '@/features/dashboard/api'
import Skeleton from '@/components/ui/Skeleton'
import { useRef, useState } from 'react'

export default function Sintesis() {
  const { data: period, isLoading: loadPeriod } = useActivePeriod()
  const { data: syntheses = [], isLoading } = useSyntheses(period?.id ?? '')
  const { data: summary } = usePeriodSummary(period?.id)
  const upsert = useUpsertSynthesis()
  const [saveMsg, setSaveMsg] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function getSynthesis(jenis: '1-2' | '2-3') {
    return syntheses.find((s) => s.jenis === jenis)?.isi ?? ''
  }

  function handleChange(jenis: '1-2' | '2-3', value: string) {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (!period) return
      upsert.mutate({ period_id: period.id, jenis, isi: value }, {
        onSuccess: () => setSaveMsg(`Tersimpan pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.`),
      })
    }, 600)
  }

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

  return (
    <section className="screen" style={{ display: 'block' }} aria-labelledby="judul-sintesis">
      <h1 id="judul-sintesis">Sintesis sesi</h1>

      {/* Bahan ringkasan */}
      {summary && (
        <div className="well">
          <h2>Bahan ringkasan</h2>
          <dl className="rank-list">
            <div><dt>Pemicu teratas</dt><dd>{summary.top_kategori[0]?.nama ?? 'belum ada'}</dd></div>
            <div><dt>Rata motivasi</dt><dd>{summary.rata_motivasi?.toLocaleString('id-ID', { minimumFractionDigits: 1 }) ?? '—'}</dd></div>
            <div><dt>Hari terbaik</dt><dd>{summary.hari_terbaik.join(', ') || '—'}</dd></div>
            <div><dt>Hari terburuk</dt><dd>{summary.hari_terburuk.join(', ') || '—'}</dd></div>
          </dl>
        </div>
      )}

      <h2>Sesi 1 ke Sesi 2</h2>
      <div className="field">
        <label htmlFor="sintesis-1-2">Catatan sintesis</label>
        <textarea
          className="input" id="sintesis-1-2" rows={6}
          defaultValue={getSynthesis('1-2')}
          placeholder="Apa yang berubah dari rencana awal?"
          onChange={(e) => handleChange('1-2', e.target.value)}
        />
      </div>

      <h2>Sesi 2 ke Sesi 3</h2>
      <div className="field">
        <label htmlFor="sintesis-2-3">Catatan sintesis</label>
        <textarea
          className="input" id="sintesis-2-3" rows={6}
          defaultValue={getSynthesis('2-3')}
          placeholder="Pola apa yang ingin dibawa ke sesi berikutnya?"
          onChange={(e) => handleChange('2-3', e.target.value)}
        />
      </div>

      <p className="save-status" role="status" aria-live="polite">{saveMsg}</p>
    </section>
  )
}
