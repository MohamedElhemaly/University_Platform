import { cn } from '../../lib/utils'
import { User } from 'lucide-react'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ src, name, size = 'md', className }) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  )
}
