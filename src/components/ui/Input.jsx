import { cn } from '../../lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'w-full rounded-xl border border-primary-500/10 bg-[#111111]/90 px-4 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-colors',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full resize-none rounded-xl border border-primary-500/10 bg-[#111111]/90 px-4 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-colors',
        className
      )}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full cursor-pointer appearance-none rounded-xl border border-primary-500/10 bg-[#111111]/90 px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
