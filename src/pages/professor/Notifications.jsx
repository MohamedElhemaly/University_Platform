import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  MessageCircle,
  FileText,
  Calendar,
  Settings,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { getRelativeTime } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function ProfessorNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user?.id) loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // Use allSettled so a single query failure doesn't break all notifications
      const results = await Promise.allSettled([
        professorService.getNotifications(user.id),
        professorService.getAllUnansweredQuestions(user.id),
        professorService.getUpcomingQuizDeadlines(user.id),
        professorService.getUpcomingLectures(user.id)
      ])

      const stored = results[0].status === 'fulfilled' ? results[0].value : []
      const questions = results[1].status === 'fulfilled' ? results[1].value : []
      const quizDeadlines = results[2].status === 'fulfilled' ? results[2].value : []
      const upcomingLectures = results[3].status === 'fulfilled' ? results[3].value : []

      // Log any failures for debugging
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Notification source ${i} failed:`, r.reason)
      })

      // Build live notifications from questions
      const questionNotifs = questions.map(q => ({
        id: `question-${q.id}`,
        type: 'question',
        title: `سؤال جديد من ${q.students?.profiles?.name || 'طالب'}`,
        message: q.question_text,
        link: `/professor/questions`,
        is_read: false,
        created_at: q.created_at,
        _live: true
      }))

      // Build live notifications from upcoming quiz deadlines
      const quizNotifs = quizDeadlines.map(q => {
        const dueDate = new Date(q.due_date)
        const now = new Date()
        const hoursLeft = Math.round((dueDate - now) / (1000 * 60 * 60))
        return {
          id: `quiz-deadline-${q.id}`,
          type: 'reminder',
          title: `اقتراب موعد انتهاء اختبار`,
          message: `الاختبار "${q.title}" في مقرر ${q.materials?.name || ''} ينتهي خلال ${hoursLeft} ساعة`,
          link: `/professor/courses/${q.material_id}`,
          is_read: false,
          created_at: new Date().toISOString(),
          _live: true
        }
      })

      // Build live notifications from upcoming lectures
      const lectureNotifs = upcomingLectures.map(l => {
        const lectureDate = new Date(`${l.date}T${l.time || '00:00'}`)
        const now = new Date()
        const hoursLeft = Math.round((lectureDate - now) / (1000 * 60 * 60))
        const timeLabel = hoursLeft <= 0 ? 'الآن' : hoursLeft < 1 ? 'أقل من ساعة' : `${hoursLeft} ساعة`
        return {
          id: `lecture-${l.id}`,
          type: 'reminder',
          title: `محاضرة قادمة`,
          message: `محاضرة "${l.title}" في مقرر ${l.materials?.name || ''} خلال ${timeLabel}`,
          link: `/professor/courses/${l.material_id}/lectures/${l.id}`,
          is_read: false,
          created_at: new Date().toISOString(),
          _live: true
        }
      })

      // Merge: live notifications first, then stored, deduplicated by id
      const allNotifs = [...questionNotifs, ...quizNotifs, ...lectureNotifs, ...stored]
      const seen = new Set()
      const deduped = allNotifs.filter(n => {
        if (seen.has(n.id)) return false
        seen.add(n.id)
        return true
      })

      // Sort by created_at descending
      deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setNotifications(deduped)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'question':
        return { icon: MessageCircle, bg: 'bg-blue-100', color: 'text-blue-600' }
      case 'submission':
        return { icon: FileText, bg: 'bg-green-100', color: 'text-green-600' }
      case 'reminder':
        return { icon: Calendar, bg: 'bg-orange-100', color: 'text-orange-600' }
      case 'system':
        return { icon: Settings, bg: 'bg-purple-100', color: 'text-purple-600' }
      default:
        return { icon: Bell, bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-600 dark:text-gray-400' }
    }
  }

  const markAsRead = async (id) => {
    try {
      const notif = notifications.find(n => n.id === id)
      if (notif && !notif._live) {
        await professorService.markNotificationRead(id)
      }
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await professorService.markAllNotificationsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const notif = notifications.find(n => n.id === id)
      if (notif && !notif._live) {
        await professorService.deleteNotification(id)
      }
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.type === filter)

  const filterOptions = [
    { id: 'all', label: 'الكل' },
    { id: 'unread', label: 'غير مقروءة' },
    { id: 'question', label: 'الأسئلة' },
    { id: 'submission', label: 'التسليمات' },
    { id: 'reminder', label: 'التذكيرات' },
  ]

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
                !notification.is_read && 'bg-green-50/50 border-green-100'
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
                      <span className="w-2 h-2 bg-green-600 rounded-full" />
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
