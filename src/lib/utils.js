import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diff = target - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'اليوم'
  if (days === 1) return 'غداً'
  if (days === -1) return 'أمس'
  if (days > 0 && days <= 7) return `بعد ${days} أيام`
  if (days < 0 && days >= -7) return `منذ ${Math.abs(days)} أيام`
  
  return formatDate(date)
}
