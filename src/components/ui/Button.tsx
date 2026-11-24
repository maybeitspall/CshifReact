import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default' | 'danger'
  busy?: boolean
}

export default function Button({
  variant = 'default',
  busy,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const cls = [
    'btn',
    variant === 'primary' ? 'btn--primary' : '',
    variant === 'danger'  ? 'btn--danger'  : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      className={cls}
      aria-busy={busy || undefined}
      {...props}
    >
      {children}
    </button>
  )
}
