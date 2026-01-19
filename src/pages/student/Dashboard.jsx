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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress, CircularProgress } from '../../components/ui/Progress'
import { AdBanner } from '../../components/ui/AdBanner'
import { currentStudent, subjects, quizzes, calendarEvents } from '../../data/mockData'
import { getRelativeTime } from '../../lib/utils'

export function StudentDashboard() {
  const upcomingQuizzes = quizzes.filter(q => q.status === 'not_started').slice(0, 3)
  const todayLectures = calendarEvents.filter(e => e.type === 'lecture' && e.date === '2026-01-19')
  const completedQuizzes = quizzes.filter(q => q.status === 'submitted').length
  const totalQuizzes = quizzes.length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">مرحباً، {currentStudent.name.split(' ')[0]}! 👋</h1>
            <p className="text-primary-100">
              {currentStudent.faculty} • {currentStudent.department} • {currentStudent.year}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{currentStudent.points}</p>
              <p className="text-primary-200 text-sm">نقطة</p>
            </div>
            <div className="w-px h-10 bg-primary-400" />
            <div className="text-center">
              <p className="text-3xl font-bold">#{currentStudent.rank}</p>
              <p className="text-primary-200 text-sm">الترتيب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
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
              <p className="text-sm text-gray-500">اختبار مكتمل</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-gray-500">معدل الإنجاز</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ad Banner */}
      <AdBanner
        logo="eyouth"
        tagline="نقطة التحول الخاصة بك"
        title="اطلق العنان لإمكانياتك"
        subtitle="دورات عملية عبر الإنترنت"
        speakerName="أحمد السيفي"
        speakerRole="رئيس تطوير الأعمال / مدرب المهارات الناعمة والتحدث أمام الجمهور"
        ctaText="سجل الآن"
        ctaLink="https://eyouth.com"
      />

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
            {subjects.slice(0, 4).map((subject) => (
              <Link key={subject.id} to={`/student/subjects/${subject.id}`}>
                <Card className="h-full">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.code.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{subject.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{subject.professor}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">التقدم</span>
                      <span className="font-medium text-gray-900">
                        {subject.completedLectures}/{subject.lecturesCount} محاضرة
                      </span>
                    </div>
                    <Progress value={subject.completedLectures} max={subject.lecturesCount} />
                  </div>

                  {subject.upcomingQuiz && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-600">{subject.upcomingQuiz.title}</span>
                      <Badge variant="warning">{getRelativeTime(subject.upcomingQuiz.date)}</Badge>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
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
              {todayLectures.length > 0 ? (
                todayLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-1 h-10 rounded-full"
                      style={{ backgroundColor: lecture.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{lecture.title}</p>
                      <p className="text-sm text-gray-500">{lecture.location}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{lecture.time}</p>
                      <p className="text-xs text-gray-500">{lecture.endTime}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">لا توجد محاضرات اليوم</p>
              )}
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
              {upcomingQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{quiz.title}</p>
                    <p className="text-sm text-gray-500">{quiz.subjectName}</p>
                  </div>
                  <Badge variant={quiz.type === 'online' ? 'info' : 'purple'}>
                    {getRelativeTime(quiz.dueDate)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progress Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص التقدم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <CircularProgress value={completedQuizzes} max={totalQuizzes} size={100} strokeWidth={8} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">الاختبارات المكتملة</p>
                <p className="font-semibold text-gray-900">{completedQuizzes} من {totalQuizzes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
