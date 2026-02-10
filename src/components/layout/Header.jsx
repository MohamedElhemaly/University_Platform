import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, FileText, Megaphone, Award, Briefcase, Trophy, MessageCircle, Clock, CheckCircle2, Home, BookOpen, Calendar, Sparkles, FolderOpen, ClipboardCheck, BarChart3, Users, GraduationCap, Building2, Settings } from 'lucide-react'
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
  
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Fetch notifications from database
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
      } catch (err) {
        console.error('Error fetching notifications:', err)
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

  // Search filtering logic
  const searchItems = userType === 'admin' ? adminSearchItems : userType === 'professor' ? professorSearchItems : studentSearchItems

  const searchResults = searchQuery.trim()
    ? searchItems.filter((item) => {
        const q = searchQuery.trim().toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(q))
        )
      })
    : []

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quiz': return FileText
      case 'announcement': return Megaphone
      case 'grade': return Award
      case 'activity': return Briefcase
      case 'points': return Trophy
      case 'question': return MessageCircle
      case 'submission': return FileText
      case 'reminder': return Clock
      default: return Bell
    }
  }

  const markAsRead = async (id) => {
    // Update in database
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ))
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    
    // Update all in database
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="hidden sm:block relative" ref={searchRef}>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 w-64 lg:w-80">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(e.target.value.trim().length > 0)
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setShowSearchResults(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearchResults(false)
                    e.target.blur()
                  }
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    navigate(searchResults[0].href)
                    setSearchQuery('')
                    setShowSearchResults(false)
                    e.target.blur()
                  }
                }}
                className="bg-transparent border-none outline-none text-sm flex-1 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xs">✕</span>
                </button>
              )}
            </div>

            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
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
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-right"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <Search className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">لا توجد نتائج لـ "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
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
                            'flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50',
                            !notification.is_read && 'bg-blue-50/50'
                          )}
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                            !notification.is_read ? 'bg-primary-100' : 'bg-gray-100'
                          )}>
                            <Icon className={cn(
                              'w-4 h-4',
                              !notification.is_read ? 'text-primary-600' : 'text-gray-500'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                'text-sm truncate',
                                !notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'
                              )}>
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getRelativeTime(notification.created_at)}
                            </p>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">لا توجد إشعارات</p>
                    </div>
                  )}
                </div>

                <Link
                  to={userType === 'admin' ? '/admin/notifications' : userType === 'professor' ? '/professor/notifications' : '/student/notifications'}
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 text-center text-sm text-primary-600 hover:bg-gray-50 border-t border-gray-100"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'مستخدم'}</p>
              <p className="text-xs text-gray-500">
                {userType === 'admin' ? 'مدير النظام' : userType === 'professor' ? (user?.title || 'أستاذ') : (user?.colleges?.name || user?.college_name || '')}
              </p>
            </div>
            <Avatar name={user?.name} size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}
