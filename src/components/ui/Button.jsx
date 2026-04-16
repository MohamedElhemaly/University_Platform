import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-[linear-gradient(135deg,#fde047_0%,#eab308_58%,#ca8a04_100%)] text-black shadow-[0_18px_35px_-20px_rgba(250,204,21,0.65)] hover:brightness-105',
  secondary: 'border border-primary-500/10 bg-white/[0.04] text-gray-100 hover:border-primary-400/25 hover:bg-white/[0.08]',
  outline: 'border border-primary-500/20 bg-transparent text-primary-300 hover:bg-primary-500/10 hover:text-primary-200',
  ghost: 'text-gray-200 hover:bg-white/[0.06]',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_18px_35px_-22px_rgba(220,38,38,0.6)]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-[#050505] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
