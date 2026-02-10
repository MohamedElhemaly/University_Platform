import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Calendar,
  FileText,
  TrendingUp,
  Loader2,
  Megaphone,
  MapPin,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress, CircularProgress } from '../../components/ui/Progress'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { getRelativeTime } from '../../lib/utils'

export function StudentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [materials, setMaterials] = useState([])
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([])
  const [notifications, setNotifications] = useState([])
  const [completedQuizzes, setCompletedQuizzes] = useState(0)
  const [bannerActivity, setBannerActivity] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await studentService.getDashboard(user.id)
      setProfile(data.profile)
      setMaterials(data.materials || [])
      setUpcomingQuizzes(data.upcomingQuizzes || [])
      setNotifications(data.notifications || [])
      setCompletedQuizzes(data.completedQuizzes || 0)
      setBannerActivity(data.bannerActivity || null)
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

  const studentName = profile?.name || user?.name || 'الطالب'
  const studentPoints = profile?.points || 0
  const studentRank = profile?.rank || '-'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">مرحباً، {studentName.split(' ')[0]}! 👋</h1>
            <p className="text-primary-100">
              {profile?.colleges?.name || 'الكلية'} • {profile?.departments?.name || 'القسم'} • السنة {profile?.year || 1}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{studentPoints}</p>
              <p className="text-primary-200 text-sm">نقطة</p>
            </div>
            <div className="w-px h-10 bg-primary-400" />
            <div className="text-center">
              <p className="text-3xl font-bold">#{studentRank}</p>
              <p className="text-primary-200 text-sm">الترتيب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Activity */}
      {bannerActivity && (
        <div className="mt-2">
          <Link to="/student/activities">
            <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-l from-orange-50 via-amber-50 to-white hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 group">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-400/10 rounded-full blur-sm" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-400/10 rounded-full blur-sm" />
              <div className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-orange-500 to-amber-400 rounded-l-full" />
              <div className="relative flex items-center gap-5 p-5 pr-7">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                  <Megaphone className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      إعلان مهم
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-0.5">{bannerActivity.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-1">{bannerActivity.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-gray-400">
                    {bannerActivity.date && (
                      <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        {bannerActivity.date}
                      </span>
                    )}
                    {bannerActivity.location && (
                      <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        {bannerActivity.location}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-orange-300 group-hover:text-orange-500 group-hover:-translate-x-1 transition-all shrink-0" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              <p className="text-sm text-gray-500">مادة</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingQuizzes.length}</p>
              <p className="text-sm text-gray-500">اختبار قادم</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedQuizzes}</p>
              <p className="text-sm text-gray-500">اختبارات مكتملة</p>
            </div>
          </div>
        </Card>
      </div>


      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subjects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">المواد الدراسية</h2>
            <Link to="/student/subjects" className="text-primary-600 text-sm font-medium hover:underline">
              عرض الكل
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {materials.length > 0 ? materials.slice(0, 4).map((material) => (
              <Link key={material.id} to={`/student/subjects/${material.id}`}>
                <Card className="h-full">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: material.color || '#3B82F6' }}
                    >
                      {material.code?.slice(0, 2) || 'MA'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{material.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{material.professorName || 'غير معين'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">التقدم</span>
                      <span className="font-medium text-gray-900">0 محاضرة</span>
                    </div>
                    <Progress value={0} max={1} />
                  </div>
                </Card>
              </Link>
            )) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                لا توجد مواد مسجلة بعد
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Lectures */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <CardTitle>محاضرات اليوم</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-500 text-sm text-center py-4">لا توجد محاضرات اليوم</p>
            </CardContent>
          </Card>

          {/* Upcoming Quizzes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <CardTitle>الاختبارات القادمة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingQuizzes.length > 0 ? upcomingQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{quiz.title}</p>
                    <p className="text-sm text-gray-500">{quiz.materials?.name}</p>
                  </div>
                  <Badge variant="warning">
                    {quiz.due_date ? getRelativeTime(quiz.due_date) : 'قريباً'}
                  </Badge>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">لا توجد اختبارات قادمة</p>
              )}
            </CardContent>
          </Card>

          {/* Progress Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص التقدم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <CircularProgress value={0} max={1} size={100} strokeWidth={8} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">الاختبارات المكتملة</p>
              <p className="font-semibold text-gray-900">{completedQuizzes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
