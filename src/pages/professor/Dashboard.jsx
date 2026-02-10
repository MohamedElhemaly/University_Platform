import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  ChevronLeft,
  Clock,
  CheckCircle2,
  MessageCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

export function ProfessorDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [recentQuestions, setRecentQuestions] = useState([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await professorService.getDashboard(user.id)
      setProfile(data.profile)
      setCourses(data.courses || [])
      setRecentQuestions(data.recentQuestions || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const professorName = profile?.name || user?.name || 'الأستاذ'
  const professorTitle = profile?.title || 'أستاذ'
  const professorDept = profile?.departments?.name || 'القسم'
  const totalStudents = courses.reduce((sum, c) => sum + (c.student_materials?.[0]?.count || 0), 0)
  const totalQuizzes = courses.reduce((sum, c) => sum + (c.quizzes?.[0]?.count || 0), 0)
  const unansweredQuestions = recentQuestions.length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">مرحباً، {professorName}! 👋</h1>
            <p className="text-green-100">
              {professorTitle} • {professorDept}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{courses.length}</p>
              <p className="text-green-200 text-sm">مقرر</p>
            </div>
            <div className="w-px h-10 bg-green-400" />
            <div className="text-center">
              <p className="text-3xl font-bold">{totalStudents}</p>
              <p className="text-green-200 text-sm">طالب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
              <p className="text-sm text-gray-500">اختبار</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0%</p>
              <p className="text-sm text-gray-500">متوسط الدرجات</p>
            </div>
          </div>
        </Card>
        <Link to="/professor/questions">
          <Card className="p-4 hover:border-purple-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unansweredQuestions}</p>
                <p className="text-sm text-gray-500">سؤال بانتظار الرد</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">المقررات الدراسية</h2>
            <Link to="/professor/courses" className="text-primary-600 text-sm font-medium hover:underline">
              عرض الكل
            </Link>
          </div>
          
          <div className="space-y-4">
            {courses.length > 0 ? courses.map((course) => (
              <Link key={course.id} to={`/professor/courses/${course.id}`}>
                <Card className="group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: course.color || '#3B82F6' }}
                    >
                      {course.code?.slice(0, 2) || 'MA'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {course.name}
                        </h3>
                        <Badge variant="info">{course.code}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.student_materials?.[0]?.count || 0} طالب</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.lectures?.[0]?.count || 0} محاضرة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{course.quizzes?.[0]?.count || 0} اختبار</span>
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">تقدم المقرر</span>
                      <span className="font-medium text-gray-900">0%</span>
                    </div>
                    <Progress value={0} max={1} />
                  </div>
                </Card>
              </Link>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد مقررات مسجلة بعد</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>أسئلة بانتظار الرد</CardTitle>
                <Badge variant="warning">{unansweredQuestions}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentQuestions.length > 0 ? recentQuestions.slice(0, 3).map((question) => (
                <Link key={question.id} to="/professor/questions">
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm text-gray-900 line-clamp-2">{question.question_text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{question.students?.profiles?.name}</span>
                      <Badge variant="info">{question.votes || 0} صوت</Badge>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">لا توجد أسئلة بانتظار الرد</p>
              )}
              {recentQuestions.length > 0 && (
                <Link
                  to="/professor/questions"
                  className="block text-center text-sm text-primary-600 hover:underline pt-2"
                >
                  عرض جميع الأسئلة
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل الطلاب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-500 text-sm text-center py-4">لا توجد بيانات بعد</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                to="/professor/courses/1"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">إنشاء اختبار جديد</span>
              </Link>
              <Link
                to="/professor/announcements"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">نشر إعلان</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
