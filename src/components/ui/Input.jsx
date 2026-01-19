import { cn } from '../../lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
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
        'w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none',
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
        'w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
