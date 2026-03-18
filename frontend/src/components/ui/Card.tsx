import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export default function Card({ className, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-[#0f1629] rounded-2xl shadow-sm border border-white/[0.06]',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
