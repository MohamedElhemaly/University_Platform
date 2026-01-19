import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Upload,
  FileText,
  Calendar,
  Clock,
  Settings,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Users,
  X,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { professorCourses, lectures, quizzes } from '../../data/mockData'
import { formatDate } from '../../lib/utils'

export function CourseManagement() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('lectures')
  const [showAddLecture, setShowAddLecture] = useState(false)
  const [showAddQuiz, setShowAddQuiz] = useState(false)
  
  const course = professorCourses.find(c => c.id === parseInt(id)) || professorCourses[0]
  const courseLectures = lectures.filter(l => l.subjectId === 1)
  const courseQuizzes = quizzes.filter(q => q.subjectId === 1)

  const tabs = [
    { id: 'lectures', label: 'المحاضرات', count: courseLectures.length },
    { id: 'quizzes', label: 'الاختبارات', count: courseQuizzes.length },
    { id: 'settings', label: 'الإعدادات' },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/professor/courses" className="hover:text-primary-600">المقررات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{course.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: course.color }}
            >
              {course.code.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-gray-500">{course.code} • {course.semester}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students} طالب</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{course.lecturesCount} محاضرة</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAddLecture(true)}>
              <Upload className="w-4 h-4" />
              رفع محاضرة
            </Button>
            <Button onClick={() => setShowAddQuiz(true)}>
              <Plus className="w-4 h-4" />
              إنشاء اختبار
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="lectures" onChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'lectures' && (
        <div className="space-y-3">
          {courseLectures.map((lecture, index) => (
            <Link
              key={lecture.id}
              to={`/professor/courses/${course.id}/lectures/${lecture.id}`}
            >
              <Card className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {lecture.title}
                    </h3>
                    <Badge variant={lecture.status === 'completed' ? 'success' : lecture.status === 'current' ? 'info' : 'default'}>
                      {lecture.status === 'completed' ? 'مكتملة' : lecture.status === 'current' ? 'الحالية' : 'قادمة'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(lecture.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lecture.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lecture.hasQuiz && (
                    <Badge variant="warning">يوجد اختبار</Badge>
                  )}
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {courseQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                quiz.type === 'online' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <FileText className={`w-6 h-6 ${
                  quiz.type === 'online' ? 'text-blue-600' : 'text-purple-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                  <Badge variant={quiz.type === 'online' ? 'info' : 'purple'}>
                    {quiz.type === 'online' ? 'إلكتروني' : 'حضوري'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{quiz.questions} سؤال</span>
                  <span>•</span>
                  <span>{quiz.duration}</span>
                  <span>•</span>
                  <span>{quiz.points} نقطة</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">الموعد النهائي</p>
                <p className="font-medium text-gray-900">{formatDate(quiz.dueDate)}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>إعدادات المقرر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المقرر</label>
                <Input defaultValue={course.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رمز المقرر</label>
                <Input defaultValue={course.code} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف المقرر</label>
              <Textarea rows={4} placeholder="أضف وصفاً للمقرر..." />
            </div>
            <div className="flex justify-end">
              <Button>حفظ التغييرات</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Lecture Modal */}
      {showAddLecture && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>رفع محاضرة جديدة</CardTitle>
                <button onClick={() => setShowAddLecture(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المحاضرة</label>
                <Input placeholder="أدخل عنوان المحاضرة" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوقت</label>
                  <Input type="time" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رفع الملفات</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">اسحب الملفات هنا أو انقر للرفع</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, PPT, Video (حتى 100MB)</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddLecture(false)}>إلغاء</Button>
                <Button>رفع المحاضرة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Quiz Modal */}
      {showAddQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إنشاء اختبار جديد</CardTitle>
                <button onClick={() => setShowAddQuiz(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الاختبار</label>
                <Input placeholder="أدخل عنوان الاختبار" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الاختبار</label>
                <Select>
                  <option value="online">إلكتروني</option>
                  <option value="offline">حضوري</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدة</label>
                  <Select>
                    <option>15 دقيقة</option>
                    <option>20 دقيقة</option>
                    <option>30 دقيقة</option>
                    <option>45 دقيقة</option>
                    <option>60 دقيقة</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">النقاط</label>
                  <Input type="number" placeholder="50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموعد النهائي</label>
                <Input type="datetime-local" />
              </div>

              {/* AI Generate Option */}
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-800">توليد بالذكاء الاصطناعي</span>
                </div>
                <p className="text-sm text-primary-700 mb-3">
                  يمكن للذكاء الاصطناعي توليد أسئلة بناءً على محتوى المحاضرة
                </p>
                <Button variant="outline" className="w-full border-primary-300 text-primary-700 hover:bg-primary-100">
                  <Sparkles className="w-4 h-4" />
                  توليد أسئلة تلقائياً
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddQuiz(false)}>إلغاء</Button>
                <Button>إنشاء الاختبار</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
