import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  BookOpen,
  Building2,
  Calendar,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X,
  BarChart3,
} from 'lucide-react'

const studentNav = [
  { name: 'الرئيسية', href: '/student/dashboard', icon: Home },
  { name: 'المواد الدراسية', href: '/student/subjects', icon: BookOpen },
  { name: 'التقويم', href: '/student/calendar', icon: Calendar },
  { name: 'مكتبة الموارد', href: '/student/resources', icon: FolderOpen },
  { name: 'الأنشطة والفرص', href: '/student/activities', icon: Sparkles },
  { name: 'النقاط والترتيب', href: '/student/points', icon: Trophy },
]

const professorNav = [
  { name: 'الرئيسية', href: '/professor/dashboard', icon: Home },
  { name: 'المقررات', href: '/professor/courses', icon: BookOpen },
  { name: 'أسئلة الطلاب', href: '/professor/questions', icon: MessageCircle },
  { name: 'نتائج الاختبارات', href: '/professor/grading', icon: ClipboardCheck },
  { name: 'أداء الطلاب', href: '/professor/performance', icon: BarChart3 },
  { name: 'الجدول', href: '/professor/calendar', icon: Calendar },
  { name: 'الإعلانات', href: '/professor/announcements', icon: FileText },
]

const adminNav = [
  { name: 'لوحة التحكم', href: '/admin/dashboard', icon: Home },
  { name: 'إدارة الطلاب', href: '/admin/students', icon: Users },
  { name: 'إدارة الأساتذة', href: '/admin/professors', icon: GraduationCap },
  { name: 'إدارة الكليات', href: '/admin/colleges', icon: Building2 },
  { name: 'إدارة المقررات', href: '/admin/materials', icon: BookOpen },
  { name: 'إدارة الأنشطة', href: '/admin/activities', icon: Sparkles },
]

export function Sidebar({ userType, isOpen, onClose }) {
  const location = useLocation()
  const navItems = userType === 'admin' ? adminNav : userType === 'professor' ? professorNav : studentNav

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-72 transform border-l border-primary-500/10 bg-[#080808]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-primary-500/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fde047_0%,#eab308_60%,#ca8a04_100%)] shadow-[0_18px_34px_-18px_rgba(250,204,21,0.75)]">
                  <Shield className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h1 className="font-bold text-white">University Hub</h1>
                  <p className="text-xs text-primary-300">Black Edition UI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-primary-500/10 bg-white/[0.03] p-2 text-gray-300 hover:border-primary-400/25 hover:bg-white/[0.06] lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-primary-500/10 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(250,204,21,0.02))] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-300/80">Workspace</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {userType === 'admin' ? 'Control Center' : userType === 'professor' ? 'Teaching Flow' : 'Student Journey'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {location.pathname}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border border-primary-500/20 bg-primary-500/10 text-primary-200 shadow-[0_18px_40px_-28px_rgba(250,204,21,0.55)]'
                      : 'border border-transparent text-gray-400 hover:border-primary-500/10 hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                      isActive ? 'bg-primary-500 text-black' : 'bg-white/[0.04] text-gray-400 group-hover:text-primary-300'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="border-t border-primary-500/10 p-4">
            {userType !== 'admin' && (
              <NavLink
                to={userType === 'professor' ? '/professor/settings' : '/student/settings'}
                className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <Settings className="h-5 w-5 text-primary-300" />
                الإعدادات
              </NavLink>
            )}

            <NavLink
              to={userType === 'admin' ? '/admin/login' : userType === 'professor' ? '/professor/login' : '/student/login'}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
