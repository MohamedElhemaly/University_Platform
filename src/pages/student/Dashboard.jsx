import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Megaphone,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress, CircularProgress } from '../../components/ui/Progress'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { getRelativeTime } from '../../lib/utils'

const statsCards = [
  { key: 'materials', label: 'مادة', icon: BookOpen, iconClass: 'bg-primary-500 text-black' },
  { key: 'upcomingQuizzes', label: 'اختبار قادم', icon: Clock, iconClass: 'bg-white text-black' },
  { key: 'completedQuizzes', label: 'اختبارات مكتملة', icon: CheckCircle2, iconClass: 'bg-emerald-500 text-black' },
]

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
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    )
  }

  const studentName = profile?.name || user?.name || 'الطالب'
  const studentPoints = profile?.points || 0
  const studentRank = profile?.rank || '-'
  const completionRatio = materials.length > 0 ? Math.min(100, Math.round((completedQuizzes / materials.length) * 100)) : 0

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-primary-500/10 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(250,204,21,0.02)_48%,rgba(255,255,255,0.02))] p-6 shadow-[0_25px_80px_-35px_rgba(250,204,21,0.4)]">
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-primary-300/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-black/30 px-4 py-1.5 text-xs font-semibold text-primary-300">
              <Sparkles className="h-4 w-4" />
              Welcome back
            </div>
            <h1 className="text-3xl font-bold text-white lg:text-4xl">أهلاً، {studentName.split(' ')[0]}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
              كل شيء مهم لك في مكان واحد: المواد الحالية، الاختبارات القادمة، والإعلانات التي تحتاج تتصرف معها بسرعة.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <div className="rounded-2xl border border-primary-500/10 bg-black/30 px-4 py-3">
                <p className="text-xs text-gray-500">الكلية</p>
                <p className="mt-1 font-semibold text-white">{profile?.colleges?.name || 'غير محددة'}</p>
              </div>
              <div className="rounded-2xl border border-primary-500/10 bg-black/30 px-4 py-3">
                <p className="text-xs text-gray-500">القسم</p>
                <p className="mt-1 font-semibold text-white">{profile?.departments?.name || 'غير محدد'}</p>
              </div>
              <div className="rounded-2xl border border-primary-500/10 bg-black/30 px-4 py-3">
                <p className="text-xs text-gray-500">السنة</p>
                <p className="mt-1 font-semibold text-white">السنة {profile?.year || 1}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-[28px] border border-primary-500/10 bg-black/35 p-4 backdrop-blur-sm">
            <div className="rounded-2xl border border-primary-500/10 bg-white/[0.04] p-4">
              <p className="text-xs text-gray-500">النقاط</p>
              <p className="mt-3 text-4xl font-bold text-white">{studentPoints}</p>
            </div>
            <div className="rounded-2xl border border-primary-500/10 bg-white/[0.04] p-4">
              <p className="text-xs text-gray-500">الترتيب</p>
              <p className="mt-3 text-4xl font-bold text-primary-300">#{studentRank}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-primary-500/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">جاهزية الفصل</p>
                <p className="text-sm font-semibold text-white">{completionRatio}%</p>
              </div>
              <div className="mt-3">
                <Progress value={completionRatio} max={100} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {bannerActivity && (
        <Link to="/student/activities" className="block">
          <section className="group relative overflow-hidden rounded-[32px] border border-primary-500/15 bg-[linear-gradient(120deg,#0d0d0d_0%,#121212_46%,#19140a_100%)] shadow-[0_28px_90px_-40px_rgba(250,204,21,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_110px_-44px_rgba(250,204,21,0.5)]">
            <div className="absolute inset-y-0 right-0 w-2 bg-[linear-gradient(180deg,#fde047,#ca8a04)]" />
            <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-primary-500/12 blur-3xl" />
            <div className="absolute -bottom-28 left-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

            <div className="relative grid items-stretch gap-0 md:grid-cols-[280px_1fr]">
              <div className="relative flex min-h-[220px] items-center justify-center border-b border-primary-500/10 bg-black/40 p-5 md:min-h-full md:border-b-0 md:border-l">
                {bannerActivity.image_url ? (
                  <div className="relative w-full max-w-[210px]">
                    <div className="absolute inset-0 rounded-[28px] bg-primary-500/10 blur-2xl" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-primary-500/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3 shadow-[0_24px_60px_-30px_rgba(250,204,21,0.35)]">
                      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-[#171717]">
                        <img
                          src={bannerActivity.image_url}
                          alt={bannerActivity.title}
                          className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,rgba(250,204,21,0.18),transparent_60%)]">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fde047,#ca8a04)] shadow-[0_0_45px_rgba(250,204,21,0.35)]">
                      <Megaphone className="h-12 w-12 text-black" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col p-6 md:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400" />
                    إعلان مهم
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-400">
                    <Sparkles className="h-3.5 w-3.5 text-primary-300" />
                    فرصة تستحق المتابعة
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white md:text-3xl">{bannerActivity.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 md:text-base">{bannerActivity.description}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {bannerActivity.date && (
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-primary-500/10 bg-black/35 px-4 py-2 text-sm text-gray-200">
                      <Calendar className="h-4 w-4 text-primary-400" />
                      {bannerActivity.date}
                    </div>
                  )}
                  {bannerActivity.location && (
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-primary-500/10 bg-black/35 px-4 py-2 text-sm text-gray-200">
                      <MapPin className="h-4 w-4 text-primary-400" />
                      {bannerActivity.location}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-primary-300">
                  عرض التفاصيل
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </div>
              </div>
            </div>
          </section>
        </Link>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          const value =
            stat.key === 'materials'
              ? materials.length
              : stat.key === 'upcomingQuizzes'
                ? upcomingQuizzes.length
                : completedQuizzes

          return (
            <Card key={stat.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </section>

      <section className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">المواد الدراسية</h2>
              <Link to="/student/subjects" className="text-sm font-medium text-primary-300 hover:text-primary-200">
                عرض الكل
              </Link>
            </div>

            {materials.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {materials.slice(0, 1).map((material) => (
                  <Link key={material.id} to={`/student/subjects/${material.id}`} className="md:col-span-2">
                    <Card className="h-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-40 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.12),transparent_70%)]" />
                      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] text-base font-bold text-white shadow-lg"
                            style={{ backgroundColor: material.color || '#eab308' }}
                          >
                            {material.code?.slice(0, 2) || 'MA'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.3em] text-primary-300/80">featured subject</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">{material.name}</h3>
                            <p className="mt-1 text-sm text-gray-400">{material.professorName || 'غير معين'}</p>
                          </div>
                        </div>

                        <div className="min-w-[220px] rounded-2xl border border-primary-500/10 bg-white/[0.03] p-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-500">التقدم</span>
                            <span className="font-medium text-gray-200">0 محاضرة</span>
                          </div>
                          <Progress value={0} max={1} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}

                {materials.slice(1, 5).map((material) => (
                  <Link key={material.id} to={`/student/subjects/${material.id}`}>
                    <Card className="h-full">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg"
                          style={{ backgroundColor: material.color || '#eab308' }}
                        >
                          {material.code?.slice(0, 2) || 'MA'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-white">{material.name}</h3>
                          <p className="truncate text-sm text-gray-400">{material.professorName || 'غير معين'}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-500">التقدم</span>
                          <span className="font-medium text-gray-200">0 محاضرة</span>
                        </div>
                        <Progress value={0} max={1} />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <div className="py-8 text-center text-gray-400">لا توجد مواد مسجلة بعد</div>
              </Card>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-400" />
                  <CardTitle>محاضرات اليوم</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex min-h-[180px] flex-col items-center justify-center rounded-[20px] border border-dashed border-primary-500/10 bg-white/[0.02] px-5 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10">
                  <Calendar className="h-6 w-6 text-primary-300" />
                </div>
                <p className="text-sm font-medium text-white">لا توجد محاضرات مجدولة اليوم</p>
                <p className="mt-2 max-w-xs text-xs leading-6 text-gray-400">
                  أول محاضرة جديدة ستظهر هنا مباشرة لمتابعة جدولك بشكل أرتب.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>ملخص التقدم</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right xl:flex-col xl:text-center 2xl:flex-row 2xl:text-right">
                <div className="flex shrink-0 items-center justify-center">
                  <CircularProgress value={completionRatio} max={100} size={96} strokeWidth={8} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">الاختبارات المكتملة</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{completedQuizzes}</p>
                  <p className="mt-1 text-sm text-gray-400">جاهزية الفصل الحالية {completionRatio}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)]">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-400" />
                <CardTitle>الاختبارات القادمة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {upcomingQuizzes.length > 0 ? (
                upcomingQuizzes.map((quiz) => (
                  <div key={quiz.id} className="rounded-2xl border border-primary-500/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">{quiz.title}</p>
                        <p className="text-sm text-gray-400">{quiz.materials?.name}</p>
                      </div>
                      <Badge variant="warning">
                        {quiz.due_date ? getRelativeTime(quiz.due_date) : 'قريبًا'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2">
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[22px] border border-dashed border-primary-500/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_58%)] px-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10">
                      <FileText className="h-7 w-7 text-primary-300" />
                    </div>
                    <p className="text-base font-semibold text-white">لا توجد اختبارات قادمة</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                      لم تُضف اختبارات جديدة حتى الآن، وهذه فرصة جيدة للتركيز على المواد الحالية.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary-400" />
                <CardTitle>آخر الإشعارات</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="rounded-2xl border border-primary-500/10 bg-white/[0.03] p-3">
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[22px] border border-dashed border-primary-500/10 bg-white/[0.02] px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10">
                    <Trophy className="h-6 w-6 text-primary-300" />
                  </div>
                  <p className="text-base font-semibold text-white">لا توجد إشعارات جديدة</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                    عند وصول أي تحديثات أو تنبيهات مهمة ستجدها هنا بشكل واضح ومنظم.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
