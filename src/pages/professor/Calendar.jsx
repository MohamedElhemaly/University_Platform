import { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  X,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input, Select } from '../../components/ui/Input'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const EVENT_COLORS = {
  lecture: '#3B82F6',
  office_hours: '#8B5CF6',
  meeting: '#F59E0B',
  exam: '#EF4444',
  other: '#6B7280',
}

export function ProfessorCalendar() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '', type: 'lecture', date: '', time: '', end_time: '', location: '', color: EVENT_COLORS.lecture
  })

  useEffect(() => {
    if (user?.id) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventData, courseData] = await Promise.all([
        professorService.getCalendarEvents(user.id),
        professorService.getCourses(user.id)
      ])
      setEvents(eventData)
      setCourses(courseData)
    } catch (error) {
      console.error('Error loading calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return
    try {
      setSaving(true)
      await professorService.createCalendarEvent(user.id, {
        title: newEvent.title,
        type: newEvent.type,
        date: newEvent.date,
        time: newEvent.time || null,
        end_time: newEvent.end_time || null,
        location: newEvent.location || null,
        color: EVENT_COLORS[newEvent.type] || EVENT_COLORS.other
      })
      setShowAddModal(false)
      setNewEvent({ title: '', type: 'lecture', date: '', time: '', end_time: '', location: '', color: EVENT_COLORS.lecture })
      await loadData()
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحدث؟')) return
    try {
      await professorService.deleteCalendarEvent(eventId)
      setSelectedEvent(null)
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
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
      case 'lecture': return { label: 'محاضرة', variant: 'info' }
      case 'office_hours': return { label: 'ساعات مكتبية', variant: 'purple' }
      case 'meeting': return { label: 'اجتماع', variant: 'warning' }
      case 'exam': return { label: 'اختبار', variant: 'danger' }
      default: return { label: 'حدث', variant: 'default' }
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

  const todayEvents = getEventsForDate(new Date())

  const stats = {
    lectures: events.filter(e => e.type === 'lecture').length,
    officeHours: events.filter(e => e.type === 'office_hours').length,
    meetings: events.filter(e => e.type === 'meeting').length,
    exams: events.filter(e => e.type === 'exam').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الجدول الدراسي</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة المحاضرات والساعات المكتبية</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'week' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('week')}
            className={view === 'week' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            أسبوعي
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            قائمة
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
            إضافة حدث
          </Button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">أحداث اليوم</h2>
            <Badge variant="info">{todayEvents.length} أحداث</Badge>
          </div>
          {todayEvents.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {todayEvents.map((event) => {
                const { label, variant } = getEventTypeStyle(event.type)
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[280px] shrink-0 border-r-4"
                    style={{ borderRightColor: event.color || EVENT_COLORS[event.type] || '#6B7280' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        <Badge variant={variant} className="text-xs">{label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {event.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد أحداث اليوم</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">ملخص الأحداث</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">محاضرات</span>
              <span className="font-bold text-blue-700">{stats.lectures}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">ساعات مكتبية</span>
              <span className="font-bold text-purple-700">{stats.officeHours}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <span className="text-sm text-orange-700">اجتماعات</span>
              <span className="font-bold text-orange-700">{stats.meetings}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <span className="text-sm text-red-700">اختبارات</span>
              <span className="font-bold text-red-700">{stats.exams}</span>
            </div>
          </div>
        </Card>
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
                <div className={cn(
                  'text-center p-2 rounded-lg',
                  dayIsToday ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  <p className={cn('text-xs', dayIsToday ? 'text-green-100' : 'text-gray-500 dark:text-gray-400')}>
                    {DAYS[day.getDay()]}
                  </p>
                  <p className={cn('text-lg font-bold', dayIsToday ? 'text-white' : 'text-gray-900 dark:text-white')}>
                    {day.getDate()}
                  </p>
                </div>
                
                <div className="space-y-2 min-h-[200px]">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm cursor-pointer hover:shadow-md transition-shadow border-r-4"
                        style={{ borderRightColor: event.color || EVENT_COLORS[event.type] || '#6B7280' }}
                      >
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{event.title}</p>
                        {event.time && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                        )}
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

      {/* List View */}
      {view === 'list' && (
        <Card>
          {events.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {events.map((event) => {
                const { label, variant } = getEventTypeStyle(event.type)
                return (
                  <div
                    key={event.id}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: event.color || EVENT_COLORS[event.type] || '#6B7280' }}
                    />
                    <div className="w-20 text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {new Date(event.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {DAYS[new Date(event.date).getDay()]}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h3>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {event.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">لا توجد أحداث</div>
          )}
        </Card>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة حدث جديد</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان الحدث</label>
                <Input
                  placeholder="أدخل عنوان الحدث"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الحدث</label>
                <Select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option value="lecture">محاضرة</option>
                  <option value="office_hours">ساعات مكتبية</option>
                  <option value="meeting">اجتماع</option>
                  <option value="exam">اختبار</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ</label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المكان</label>
                  <Input
                    placeholder="القاعة أو المكتب"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وقت البداية</label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وقت النهاية</label>
                  <Input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateEvent} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  إضافة الحدث
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تفاصيل الحدث</CardTitle>
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="p-4 rounded-xl border-r-4"
                style={{
                  borderRightColor: selectedEvent.color || EVENT_COLORS[selectedEvent.type] || '#6B7280',
                  backgroundColor: `${selectedEvent.color || EVENT_COLORS[selectedEvent.type] || '#6B7280'}10`
                }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{selectedEvent.title}</h3>
                <Badge variant={getEventTypeStyle(selectedEvent.type).variant}>
                  {getEventTypeStyle(selectedEvent.type).label}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Clock className="w-5 h-5" />
                    <span>{selectedEvent.time}{selectedEvent.end_time ? ` - ${selectedEvent.end_time}` : ''}</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-5 h-5" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
