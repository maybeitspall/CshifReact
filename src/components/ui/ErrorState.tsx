interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = 'Gagal memuat data.', onRetry }: ErrorStateProps) {
  return (
    <div className="well" style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-sm)' }}>{message}</p>
      {onRetry && (
        <button className="btn" type="button" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  )
}
