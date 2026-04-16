import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Menu,
  Megaphone,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Trophy,
  Users,
  BarChart3,
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'

const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  return `منذ ${diffDays} يوم`
}

const studentSearchItems = [
  { name: 'الرئيسية', href: '/student/dashboard', icon: Home, keywords: ['رئيسية', 'لوحة', 'dashboard', 'home'] },
  { name: 'المواد الدراسية', href: '/student/subjects', icon: BookOpen, keywords: ['مواد', 'دراسية', 'مادة', 'subjects', 'courses'] },
  { name: 'التقويم', href: '/student/calendar', icon: Calendar, keywords: ['تقويم', 'جدول', 'مواعيد', 'calendar'] },
  { name: 'مكتبة الموارد', href: '/student/resources', icon: FolderOpen, keywords: ['موارد', 'مكتبة', 'ملفات', 'مصادر', 'resources', 'files'] },
  { name: 'الأنشطة والفرص', href: '/student/activities', icon: Sparkles, keywords: ['أنشطة', 'فرص', 'نشاط', 'activities'] },
  { name: 'النقاط والترتيب', href: '/student/points', icon: Trophy, keywords: ['نقاط', 'ترتيب', 'points', 'ranking'] },
  { name: 'الإشعارات', href: '/student/notifications', icon: Bell, keywords: ['إشعارات', 'تنبيهات', 'notifications'] },
  { name: 'الإعدادات', href: '/student/settings', icon: Settings, keywords: ['إعدادات', 'حساب', 'settings'] },
]

const professorSearchItems = [
  { name: 'الرئيسية', href: '/professor/dashboard', icon: Home, keywords: ['رئيسية', 'لوحة', 'dashboard', 'home'] },
  { name: 'المقررات', href: '/professor/courses', icon: BookOpen, keywords: ['مقررات', 'مواد', 'كورسات', 'courses'] },
  { name: 'أسئلة الطلاب', href: '/professor/questions', icon: MessageCircle, keywords: ['أسئلة', 'طلاب', 'سؤال', 'questions'] },
  { name: 'نتائج الاختبارات', href: '/professor/grading', icon: ClipboardCheck, keywords: ['نتائج', 'اختبارات', 'درجات', 'grading', 'results'] },
  { name: 'أداء الطلاب', href: '/professor/performance', icon: BarChart3, keywords: ['أداء', 'طلاب', 'إحصائيات', 'performance'] },
  { name: 'الجدول', href: '/professor/calendar', icon: Calendar, keywords: ['جدول', 'تقويم', 'مواعيد', 'calendar'] },
  { name: 'الإعلانات', href: '/professor/announcements', icon: FileText, keywords: ['إعلانات', 'تنبيهات', 'إعلان', 'announcements'] },
  { name: 'الإشعارات', href: '/professor/notifications', icon: Bell, keywords: ['إشعارات', 'تنبيهات', 'notifications'] },
  { name: 'الإعدادات', href: '/professor/settings', icon: Settings, keywords: ['إعدادات', 'حساب', 'settings'] },
]

const adminSearchItems = [
  { name: 'لوحة التحكم', href: '/admin/dashboard', icon: Home, keywords: ['رئيسية', 'لوحة', 'تحكم', 'dashboard'] },
  { name: 'إدارة الطلاب', href: '/admin/students', icon: Users, keywords: ['طلاب', 'طالب', 'students'] },
  { name: 'إدارة الأساتذة', href: '/admin/professors', icon: GraduationCap, keywords: ['أساتذة', 'أستاذ', 'دكتور', 'professors'] },
  { name: 'إدارة الكليات', href: '/admin/colleges', icon: Building2, keywords: ['كليات', 'كلية', 'أقسام', 'colleges'] },
  { name: 'إدارة المقررات', href: '/admin/materials', icon: BookOpen, keywords: ['مقررات', 'مواد', 'materials', 'courses'] },
  { name: 'إدارة الأنشطة', href: '/admin/activities', icon: Sparkles, keywords: ['أنشطة', 'نشاط', 'activities'] },
]

export function Header({ userType, onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  const unreadCount = notifications.filter((notification) => !notification.is_read).length
  const searchItems =
    userType === 'admin'
      ? adminSearchItems
      : userType === 'professor'
        ? professorSearchItems
        : studentSearchItems

  const searchResults = searchQuery.trim()
    ? searchItems.filter((item) => {
        const query = searchQuery.trim().toLowerCase()
        return item.name.toLowerCase().includes(query) || item.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      })
    : []

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!error && data) {
          setNotifications(data)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()
  }, [user?.id])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quiz':
        return FileText
      case 'announcement':
        return Megaphone
      case 'grade':
        return Award
      case 'activity':
        return Briefcase
      case 'points':
        return Trophy
      case 'question':
        return MessageCircle
      case 'submission':
        return FileText
      case 'reminder':
        return Clock
      default:
        return Bell
    }
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)

    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification))
    )
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
  }

  return (
    <header className="sticky top-0 z-30 border-b border-primary-500/10 bg-[#050505]/88 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-primary-500/10 bg-white/[0.03] p-2 text-gray-200 hover:border-primary-400/25 hover:bg-white/[0.06] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden sm:block" ref={searchRef}>
            <div className="flex w-64 items-center gap-2 rounded-2xl border border-primary-500/10 bg-white/[0.04] px-4 py-2.5 lg:w-80">
              <Search className="h-4 w-4 text-primary-400" />
              <input
                type="text"
                placeholder="ابحث بسرعة داخل المنصة"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setShowSearchResults(event.target.value.trim().length > 0)
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchResults(true)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setShowSearchResults(false)
                    event.target.blur()
                  }

                  if (event.key === 'Enter' && searchResults.length > 0) {
                    navigate(searchResults[0].href)
                    setSearchQuery('')
                    setShowSearchResults(false)
                    event.target.blur()
                  }
                }}
                className="flex-1 bg-transparent text-sm text-gray-100 outline-none placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  className="text-gray-500 hover:text-primary-300"
                >
                  <span className="text-xs">X</span>
                </button>
              )}
            </div>

            {showSearchResults && (
              <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-primary-500/10 bg-[#101010] shadow-[0_24px_70px_-30px_rgba(250,204,21,0.35)]">
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((item) => {
                      const Icon = item.icon

                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            navigate(item.href)
                            setSearchQuery('')
                            setShowSearchResults(false)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-right transition-colors hover:bg-white/[0.05]"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
                            <Icon className="h-4 w-4 text-primary-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-100">{item.name}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <Search className="mx-auto mb-1 h-6 w-6 text-gray-600" />
                    <p className="text-sm text-gray-400">لا توجد نتائج لـ "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative rounded-xl border border-primary-500/10 bg-white/[0.03] p-2 hover:border-primary-400/25 hover:bg-white/[0.06]"
            >
              <Bell className="h-5 w-5 text-gray-200" />
              {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
            </button>

            {showNotifications && (
              <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-primary-500/10 bg-[#101010] shadow-[0_24px_70px_-30px_rgba(250,204,21,0.35)] sm:w-96">
                <div className="flex items-center justify-between border-b border-primary-500/10 p-3">
                  <h3 className="font-semibold text-white">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary-300 hover:text-primary-200">
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 6).map((notification) => {
                      const Icon = getNotificationIcon(notification.type)

                      return (
                        <Link
                          key={notification.id}
                          to={notification.link || '#'}
                          onClick={() => {
                            markAsRead(notification.id)
                            setShowNotifications(false)
                          }}
                          className={cn(
                            'flex items-start gap-3 border-b border-primary-500/5 p-3 transition-colors hover:bg-white/[0.04]',
                            !notification.is_read && 'bg-primary-500/5'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                              !notification.is_read ? 'bg-primary-500/10' : 'bg-white/[0.05]'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4',
                                !notification.is_read ? 'text-primary-300' : 'text-gray-500'
                              )}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className={cn('truncate text-sm', !notification.is_read ? 'font-medium text-white' : 'text-gray-300')}>
                                {notification.title}
                              </p>
                              {!notification.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-gray-500">{notification.message}</p>
                            <p className="mt-1 text-xs text-gray-600">{getRelativeTime(notification.created_at)}</p>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <Bell className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                      <p className="text-sm text-gray-400">لا توجد إشعارات</p>
                    </div>
                  )}
                </div>

                <Link
                  to={userType === 'admin' ? '/admin/notifications' : userType === 'professor' ? '/professor/notifications' : '/student/notifications'}
                  onClick={() => setShowNotifications(false)}
                  className="block border-t border-primary-500/10 p-3 text-center text-sm text-primary-300 hover:bg-white/[0.04]"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-white">{user?.name || 'مستخدم'}</p>
              <p className="text-xs text-gray-500">
                {userType === 'admin'
                  ? 'مدير النظام'
                  : userType === 'professor'
                    ? (user?.title || 'أستاذ')
                    : (user?.colleges?.name || user?.college_name || '')}
              </p>
            </div>
            <Avatar name={user?.name} size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}
