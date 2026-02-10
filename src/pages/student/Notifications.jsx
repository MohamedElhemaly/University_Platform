import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  FileText,
  Award,
  Megaphone,
  Briefcase,
  Trophy,
  CheckCircle2,
  Circle,
  Trash2,
  Filter,
  Loader2,
  BookOpen,
  Calendar,
  Settings,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { getRelativeTime } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function StudentNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await studentService.getNotifications(user.id, 50)
      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quiz':
        return { icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' }
      case 'announcement':
        return { icon: Megaphone, bg: 'bg-orange-100', color: 'text-orange-600' }
      case 'grade':
        return { icon: Award, bg: 'bg-green-100', color: 'text-green-600' }
      case 'activity':
        return { icon: Briefcase, bg: 'bg-purple-100', color: 'text-purple-600' }
      case 'points':
        return { icon: Trophy, bg: 'bg-yellow-100', color: 'text-yellow-600' }
      case 'system':
        return { icon: BookOpen, bg: 'bg-indigo-100', color: 'text-indigo-600' }
      case 'reminder':
        return { icon: Calendar, bg: 'bg-teal-100', color: 'text-teal-600' }
      default:
        return { icon: Bell, bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-600 dark:text-gray-400' }
    }
  }

  const markAsRead = async (id) => {
    try {
      await studentService.markNotificationRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await studentService.markAllNotificationsRead(user.id)
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await studentService.deleteNotification(id)
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.type === filter)

  const filterOptions = [
    { id: 'all', label: 'الكل' },
    { id: 'unread', label: 'غير مقروءة' },
    { id: 'quiz', label: 'الاختبارات' },
    { id: 'announcement', label: 'الإعلانات' },
    { id: 'activity', label: 'الأنشطة' },
    { id: 'system', label: 'المواد الدراسية' },
    { id: 'reminder', label: 'التقويم' },
    { id: 'grade', label: 'الدرجات' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.id}
            variant={filter === option.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(option.id)}
          >
            {option.label}
            {option.id === 'unread' && unreadCount > 0 && (
              <Badge variant="danger" className="mr-2">{unreadCount}</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const { icon: Icon, bg, color } = getNotificationIcon(notification.type)
          
          return (
            <Card
              key={notification.id}
              className={cn(
                'transition-colors',
                !notification.is_read && 'bg-primary-50/50 border-primary-100'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', bg)}>
                  <Icon className={cn('w-6 h-6', color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      'font-medium',
                      notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                  <p className={cn(
                    'text-sm mb-2',
                    notification.is_read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getRelativeTime(notification.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notification.link && (
                    <Link to={notification.link}>
                      <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                        عرض
                      </Button>
                    </Link>
                  )}
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد إشعارات</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unread' 
              ? 'لا توجد إشعارات غير مقروءة' 
              : 'لا توجد إشعارات في هذه الفئة'}
          </p>
        </Card>
      )}
    </div>
  )
}
