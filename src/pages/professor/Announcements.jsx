import { useState, useEffect } from 'react'
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  BookOpen,
  AlertTriangle,
  X,
  Send,
  Trash2,
  Edit3,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../lib/utils'

export function ProfessorAnnouncements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    material_id: '',
    title: '',
    content: '',
    is_important: false
  })

  useEffect(() => {
    if (user?.id) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [announcementData, courseData] = await Promise.all([
        professorService.getAnnouncements(user.id),
        professorService.getCourses(user.id)
      ])
      setAnnouncements(announcementData)
      setCourses(courseData)
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newAnnouncement.title || !newAnnouncement.material_id) return
    try {
      setSaving(true)
      await professorService.createAnnouncement(user.id, parseInt(newAnnouncement.material_id), {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        is_important: newAnnouncement.is_important
      })
      setShowAddForm(false)
      setNewAnnouncement({ material_id: '', title: '', content: '', is_important: false })
      await loadData()
    } catch (error) {
      console.error('Error creating announcement:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    try {
      await professorService.deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredAnnouncements = announcements.filter((a) => {
    if (selectedCourse !== 'all' && a.material_id !== parseInt(selectedCourse)) return false
    if (searchQuery && !a.title?.includes(searchQuery) && !a.content?.includes(searchQuery)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإعلانات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة الإعلانات والتنبيهات للطلاب</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" />
          إعلان جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="البحث في الإعلانات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-48"
          >
            <option value="all">جميع المقررات</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={announcement.is_important ? 'border-orange-200 bg-orange-50/30' : ''}>
            <div className="flex items-start gap-4 p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                announcement.is_important ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                {announcement.is_important ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                ) : (
                  <Megaphone className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                  {announcement.is_important && (
                    <Badge variant="warning">مهم</Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{announcement.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(announcement.created_at)}</span>
                  </div>
                  {announcement.materials?.name && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{announcement.materials.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(announcement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card className="p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد إعلانات</h3>
          <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على إعلانات</p>
        </Card>
      )}

      {/* Add Announcement Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إعلان جديد</CardTitle>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المقرر</label>
                <Select
                  value={newAnnouncement.material_id}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, material_id: e.target.value })}
                >
                  <option value="">اختر المقرر</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان الإعلان</label>
                <Input
                  placeholder="أدخل عنوان الإعلان"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص الإعلان</label>
                <Textarea
                  rows={4}
                  placeholder="اكتب نص الإعلان هنا..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  className="rounded"
                  checked={newAnnouncement.is_important}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, is_important: e.target.checked })}
                />
                <label htmlFor="important" className="text-sm text-gray-700 dark:text-gray-300">إعلان مهم</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddForm(false)}>إلغاء</Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  نشر الإعلان
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
