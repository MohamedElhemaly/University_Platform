import { cn } from '../../lib/utils'

export function Card({ children, className, onClick, hover = true }) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 transition-all duration-300',
        'bg-[linear-gradient(180deg,rgba(22,22,22,0.96),rgba(8,8,8,0.98))] border-primary-500/10 shadow-[0_18px_60px_-34px_rgba(250,204,21,0.35)] backdrop-blur-sm',
        hover && 'hover:-translate-y-0.5 hover:border-primary-400/25 hover:shadow-[0_28px_80px_-38px_rgba(250,204,21,0.45)]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('mt-1 text-sm text-gray-400', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('mt-4 border-t border-primary-500/10 pt-4', className)}>
      {children}
    </div>
  )
}
