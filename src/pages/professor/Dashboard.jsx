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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { currentProfessor, professorCourses, studentPerformance, questions } from '../../data/mockData'

export function ProfessorDashboard() {
  const totalStudents = professorCourses.reduce((sum, c) => sum + c.students, 0)
  const totalLectures = professorCourses.reduce((sum, c) => sum + c.lecturesCount, 0)
  const activeQuizzes = professorCourses.reduce((sum, c) => sum + c.activeQuizzes, 0)
  const unansweredQuestions = questions.filter(q => !q.answer).length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">مرحباً، {currentProfessor.name}! 👋</h1>
            <p className="text-green-100">
              {currentProfessor.title} • {currentProfessor.department}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{professorCourses.length}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLectures}</p>
              <p className="text-sm text-gray-500">محاضرة</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeQuizzes}</p>
              <p className="text-sm text-gray-500">اختبار نشط</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{studentPerformance.stats.averageScore}%</p>
              <p className="text-sm text-gray-500">متوسط الدرجات</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
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
            {professorCourses.map((course) => (
              <Link key={course.id} to={`/professor/courses/${course.id}`}>
                <Card className="group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: course.color }}
                    >
                      {course.code.slice(0, 2)}
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
                          <span>{course.students} طالب</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.completedLectures}/{course.lecturesCount} محاضرة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{course.activeQuizzes} اختبار</span>
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">تقدم المقرر</span>
                      <span className="font-medium text-gray-900">
                        {Math.round((course.completedLectures / course.lecturesCount) * 100)}%
                      </span>
                    </div>
                    <Progress value={course.completedLectures} max={course.lecturesCount} />
                  </div>
                </Card>
              </Link>
            ))}
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
              {questions.filter(q => !q.answer).slice(0, 3).map((question) => (
                <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 line-clamp-2">{question.question}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{question.studentName}</span>
                    <Badge variant="info">{question.votes} صوت</Badge>
                  </div>
                </div>
              ))}
              {unansweredQuestions === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">لا توجد أسئلة بانتظار الرد</p>
              )}
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل الطلاب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentPerformance.topStudents.map((student, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.quizzes} اختبارات</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{student.score}%</p>
                  </div>
                </div>
              ))}
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
