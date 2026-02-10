import { Link } from 'react-router-dom'
import { Calendar, MapPin, ArrowLeft, GraduationCap, Megaphone } from 'lucide-react'
import { cn } from '../../lib/utils'

export function UniversityNewsBanner({
  type = 'news',
  title = 'أخبار الجامعة',
  description = 'آخر المستجدات والأخبار',
  date,
  location,
  ctaText = 'عرض التفاصيل',
  ctaLink = '#',
  className,
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary-600 via-primary-700 to-primary-800',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* News Label */}
      <div className="absolute top-3 left-3 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
          <Megaphone className="w-3.5 h-3.5" />
          {type === 'news' ? 'أخبار الجامعة' : type === 'event' ? 'فعالية' : 'إعلان'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch min-h-[180px]">
        {/* Content Side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between z-10">
          {/* Main Text */}
          <div className="mb-4 mt-6 md:mt-0">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
              {title}
            </h3>
            <p className="text-primary-100 text-sm md:text-base max-w-lg">
              {description}
            </p>
          </div>

          {/* Meta Info & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-center gap-4 text-primary-200 text-sm">
              {date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>
            <Link
              to={ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-primary-700 font-semibold rounded-xl transition-colors text-sm"
            >
              {ctaText}
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Icon Side */}
        <div className="hidden md:flex relative w-[200px] lg:w-[240px] items-center justify-center">
          <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <GraduationCap className="w-16 h-16 lg:w-20 lg:h-20 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  )
}
