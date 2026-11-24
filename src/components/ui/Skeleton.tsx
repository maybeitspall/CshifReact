export default function Skeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="screen" style={{ display: 'block', paddingTop: 'var(--space-lg)' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '1.2rem',
            marginBottom: 'var(--space-md)',
            borderRadius: 'var(--radius-input)',
            background: 'var(--color-paper-2)',
            width: i % 3 === 2 ? '60%' : '100%',
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  )
}
