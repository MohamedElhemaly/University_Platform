import { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

export function StudentCalendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('week')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await studentService.getCalendarEvents(user.id)
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDays = (date) => {
    const week = []
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentDate)

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.date === dateStr)
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const getEventTypeStyle = (type) => {
    switch (type) {
      case 'lecture':
        return 'border-r-4'
      case 'quiz_online':
        return 'border-r-4 border-r-red-500 bg-red-50'
      case 'quiz_offline':
        return 'border-r-4 border-r-orange-500 bg-orange-50'
      case 'exam':
        return 'border-r-4 border-r-red-600 bg-red-50'
      default:
        return ''
    }
  }

  const getEventTypeBadge = (type) => {
    switch (type) {
      case 'lecture':
        return <Badge variant="info">محاضرة</Badge>
      case 'quiz_online':
        return <Badge variant="danger">اختبار إلكتروني</Badge>
      case 'quiz_offline':
        return <Badge variant="warning">اختبار حضوري</Badge>
      case 'exam':
        return <Badge variant="danger">اختبار</Badge>
      case 'office_hours':
        return <Badge variant="purple">ساعات مكتبية</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التقويم الدراسي</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">جدول المحاضرات والاختبارات</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'week' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('week')}
          >
            أسبوعي
          </Button>
          <Button
            variant={view === 'month' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('month')}
          >
            شهري
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {weekDays[0].getDate()} - {weekDays[6].getDate()} {MONTHS[weekDays[6].getMonth()]}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Week View */}
      {view === 'week' && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const dayIsToday = isToday(day)
            
            return (
              <div key={index} className="space-y-2">
                <div className={`text-center p-2 rounded-lg ${dayIsToday ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <p className={`text-xs ${dayIsToday ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {DAYS[day.getDay()]}
                  </p>
                  <p className={`text-lg font-bold ${dayIsToday ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {day.getDate()}
                  </p>
                </div>
                
                <div className="space-y-2 min-h-[200px]">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm ${getEventTypeStyle(event.type)}`}
                        style={event.type === 'lecture' ? { borderRightColor: event.color || '#3b82f6' } : {}}
                      >
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{event.title}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400">لا توجد أحداث</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Month View - Simplified list */}
      {view === 'month' && (
        <Card>
          <div className="divide-y divide-gray-100">
            {events.length > 0 ? events.map((event) => (
              <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                <div
                  className="w-1 h-12 rounded-full"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                />
                <div className="w-16 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Date(event.date).getDate()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {MONTHS[new Date(event.date).getMonth()]}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h3>
                    {getEventTypeBadge(event.type)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">لا توجد أحداث في التقويم</div>
            )}
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">دليل الألوان</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">محاضرات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">اختبارات إلكترونية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">اختبارات حضورية</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
