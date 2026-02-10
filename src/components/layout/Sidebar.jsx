import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  Home,
  BookOpen,
  Calendar,
  Trophy,
  Sparkles,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  Users,
  FileText,
  X,
  Bell,
  Award,
  FolderOpen,
  ClipboardCheck,
  Building2,
  Shield,
  MessageCircle,
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">منصة التعلم</h1>
                  <p className="text-xs text-gray-500">الجامعية</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            {userType !== 'admin' && (
              <NavLink
                to={userType === 'professor' ? '/professor/settings' : '/student/settings'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-5 h-5" />
                الإعدادات
              </NavLink>
            )}
            <NavLink
              to={
                userType === 'admin' ? '/admin/login' :
                userType === 'professor' ? '/professor/login' :
                '/student/login'
              }
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
