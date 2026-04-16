import { ExternalLink, Sparkles } from 'lucide-react'
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
        'relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] border border-gray-800/80 shadow-[0_8px_30px_-4px_rgba(234,179,8,0.1)] group',
        className
      )}
    >
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

      {/* Ad Label */}
      <div className="absolute top-4 left-4 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-primary-400 text-xs font-semibold border border-primary-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          إعلان مميز
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch min-h-[220px]">
        {/* Content Side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between z-10">
          {/* Logo */}
          <div className="mb-5">
            <span className="text-white text-3xl font-extrabold tracking-tight drop-shadow-sm">
              '{logo}
            </span>
            <p className="text-primary-400/90 font-medium text-sm mt-1">{tagline}</p>
          </div>

          {/* Main Text */}
          <div className="mb-8">
            <h3 className="text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-300 text-2xl md:text-3xl font-bold mb-2">
              {title}
            </h3>
            <p className="text-gray-400 text-base md:text-lg">{subtitle}</p>
          </div>

          {/* Speaker Info & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 p-[2px] shadow-lg shadow-primary-500/20 md:hidden">
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-white font-bold">{speakerName}</p>
                <p className="text-gray-500 text-xs md:text-sm max-w-[220px] leading-relaxed">{speakerRole}</p>
              </div>
            </div>
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-400 text-black font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 whitespace-nowrap"
            >
              {ctaText}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Image/Accent Side */}
        <div className="hidden md:block relative w-[300px] lg:w-[350px] overflow-hidden">
          {/* Yellow accent shape geometric */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent">
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Speaker avatar showcase */}
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary-400 blur-2xl opacity-20 rounded-full"></div>
              <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 p-1 flex items-center justify-center shadow-2xl">
                <div className="w-full h-full rounded-full bg-[#141414] border-4 border-[#141414] flex items-center justify-center overflow-hidden">
                   <svg
                    className="w-20 h-20 lg:w-24 lg:h-24 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
