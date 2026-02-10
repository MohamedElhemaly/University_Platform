import { useState, useEffect } from 'react'
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { adminService } from '../../services/supabaseService'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    studentsCount: 0,
    professorsCount: 0,
    collegesCount: 0,
    materialsCount: 0,
    pendingActivitiesCount: 0
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [recentProfessors, setRecentProfessors] = useState([])
  const [pendingActivities, setPendingActivities] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, studentsData, professorsData, activitiesData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getStudents(),
        adminService.getProfessors(),
        adminService.getActivities('pending')
      ])
      
      setStats(statsData)
      setRecentStudents(studentsData.slice(0, 5))
      setRecentProfessors(professorsData.slice(0, 3))
      setPendingActivities(activitiesData)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة تحكم المدير</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">مرحباً بك في لوحة إدارة النظام</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studentsCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">طالب</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.professorsCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">أستاذ</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.collegesCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">كلية</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.materialsCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">مقرر</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Activities Alert */}
      {pendingActivities.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">أنشطة بانتظار الموافقة</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pendingActivities.length} نشاط مقدم من الطلاب بانتظار المراجعة</p>
              </div>
            </div>
            <Link to="/admin/activities">
              <Button variant="outline" size="sm">
                مراجعة الأنشطة
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>أحدث الطلاب المسجلين</CardTitle>
              <Link to="/admin/students">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.length > 0 ? recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.profiles?.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{student.profiles?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.student_id}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                      {student.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا يوجد طلاب مسجلين بعد</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Professors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>الأساتذة</CardTitle>
              <Link to="/admin/professors">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProfessors.length > 0 ? recentProfessors.map((professor) => (
                <div key={professor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar name={professor.profiles?.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{professor.profiles?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{professor.departments?.name}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant={professor.status === 'active' ? 'success' : 'secondary'}>
                      {professor.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا يوجد أساتذة مسجلين بعد</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/students">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>إضافة طالب</span>
              </Button>
            </Link>
            <Link to="/admin/professors">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <GraduationCap className="w-6 h-6" />
                <span>إضافة أستاذ</span>
              </Button>
            </Link>
            <Link to="/admin/materials">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <BookOpen className="w-6 h-6" />
                <span>إضافة مقرر</span>
              </Button>
            </Link>
            <Link to="/admin/activities">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span>إنشاء نشاط</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
