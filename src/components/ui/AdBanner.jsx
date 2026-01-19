import { ExternalLink } from 'lucide-react'
import { cn } from '../../lib/utils'

export function AdBanner({
  logo = 'eyouth',
  tagline = 'نقطة التحول الخاصة بك',
  title = 'اطلق العنان لإمكانياتك',
  subtitle = 'دورات عملية عبر الإنترنت',
  speakerName = 'أحمد السيفي',
  speakerRole = 'رئيس تطوير الأعمال / مدرب المهارات الناعمة والتحدث أمام الجمهور',
  ctaText = 'سجل الآن',
  ctaLink = '#',
  className,
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-[#1a4fd8]',
        className
      )}
    >
      {/* Ad Label */}
      <div className="absolute top-3 left-3 z-20">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-md text-white text-xs font-medium border border-white/30">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          إعلان
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch min-h-[200px]">
        {/* Content Side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between z-10">
          {/* Logo */}
          <div className="mb-4">
            <span className="text-white text-2xl font-bold tracking-tight">
              '{logo}
            </span>
            <p className="text-blue-200 text-sm mt-0.5">{tagline}</p>
          </div>

          {/* Main Text */}
          <div className="mb-6">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
              {title}
            </h3>
            <p className="text-blue-100 text-base md:text-lg">{subtitle}</p>
          </div>

          {/* Speaker Info & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-white font-semibold">{speakerName}</p>
              <p className="text-blue-200 text-xs max-w-[200px]">{speakerRole}</p>
            </div>
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8f542] hover:bg-[#d4f75e] text-[#1a4fd8] font-semibold rounded-lg transition-colors text-sm"
            >
              {ctaText}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Image/Accent Side */}
        <div className="hidden md:block relative w-[280px] lg:w-[320px]">
          {/* Lime accent shape */}
          <div className="absolute inset-0">
            <svg
              viewBox="0 0 320 200"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M80 0 C40 0 0 40 0 100 C0 160 40 200 80 200 L320 200 L320 0 Z"
                fill="#c8f542"
              />
            </svg>
          </div>
          
          {/* Placeholder for speaker image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-[#b8e532] flex items-center justify-center">
              <svg
                className="w-20 h-20 lg:w-24 lg:h-24 text-[#1a4fd8]/30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom tagline for mobile */}
      <div className="md:hidden px-6 pb-4">
        <p className="text-[#c8f542] text-xs text-center">{tagline}</p>
      </div>
    </div>
  )
}
