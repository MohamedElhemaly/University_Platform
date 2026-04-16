import { cn } from '../../lib/utils'

const variants = {
  default: 'border border-white/10 bg-white/[0.05] text-gray-200',
  success: 'border border-green-500/20 bg-green-500/10 text-green-300',
  warning: 'border border-primary-500/20 bg-primary-500/10 text-primary-300',
  danger: 'border border-red-500/20 bg-red-500/10 text-red-300',
  info: 'border border-sky-500/20 bg-sky-500/10 text-sky-300',
  purple: 'border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300',
  secondary: 'border border-white/10 bg-[#1a1a1a] text-gray-300',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
