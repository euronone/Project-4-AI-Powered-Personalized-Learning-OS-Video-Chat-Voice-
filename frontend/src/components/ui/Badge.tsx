import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-slate-700/50 text-slate-300': variant === 'default',
          'bg-green-900/40 text-green-400': variant === 'success',
          'bg-yellow-900/40 text-yellow-400': variant === 'warning',
          'bg-red-900/40 text-red-400': variant === 'danger',
          'bg-blue-900/40 text-blue-400': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
