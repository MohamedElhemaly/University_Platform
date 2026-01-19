import { useState } from 'react'
import {
  Bell,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { announcements, professorCourses } from '../../data/mockData'
import { formatDate } from '../../lib/utils'

export function ProfessorAnnouncements() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('all')

  const allAnnouncements = [
    ...announcements,
    {
      id: 4,
      subjectId: 2,
      title: 'موعد الاختبار النهائي',
      content: 'سيكون الاختبار النهائي يوم الأحد القادم في القاعة الرئيسية. يرجى الحضور قبل 15 دقيقة.',
      date: '2026-01-19',
      important: true,
      course: 'مقدمة في البرمجة',
    },
    {
      id: 5,
      subjectId: 3,
      title: 'مشروع نهاية الفصل',
      content: 'تم نشر تفاصيل مشروع نهاية الفصل. يرجى مراجعة المتطلبات والبدء في العمل.',
      date: '2026-01-16',
      important: false,
      course: 'تحليل وتصميم النظم',
    },
  ]

  const filteredAnnouncements = selectedCourse === 'all'
    ? allAnnouncements
    : allAnnouncements.filter(a => a.subjectId === parseInt(selectedCourse))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعلانات</h1>
          <p className="text-gray-500 mt-1">إدارة إعلانات المقررات</p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          إعلان جديد
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">تصفية حسب المقرر:</span>
          <Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-48"
          >
            <option value="all">جميع المقررات</option>
            {professorCourses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                announcement.important ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {announcement.important ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Bell className="w-6 h-6 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  {announcement.important && <Badge variant="danger">مهم</Badge>}
                  <Badge variant="info">{announcement.course || 'هندسة البرمجيات'}</Badge>
                </div>
                <p className="text-gray-600 mb-2">{announcement.content}</p>
                <p className="text-sm text-gray-400">{formatDate(announcement.date)}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredAnnouncements.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد إعلانات</h3>
            <p className="text-gray-500">لم يتم نشر أي إعلانات لهذا المقرر</p>
          </Card>
        )}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إعلان جديد</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المقرر</label>
                <Select>
                  <option value="">اختر المقرر</option>
                  {professorCourses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الإعلان</label>
                <Input placeholder="أدخل عنوان الإعلان" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الإعلان</label>
                <Textarea rows={4} placeholder="اكتب محتوى الإعلان..." />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="important" className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="important" className="text-sm text-gray-700">تحديد كإعلان مهم</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button>
                  <Send className="w-4 h-4" />
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
