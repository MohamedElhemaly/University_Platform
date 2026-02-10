import { useState, useEffect } from 'react'
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Target,
  Loader2,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function ProfessorGrading() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [expandedQuiz, setExpandedQuiz] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user?.id) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [quizData, courseData] = await Promise.all([
        professorService.getGradingData(user.id),
        professorService.getCourses(user.id)
      ])
      setQuizzes(quizData)
      setCourses(courseData)
      if (quizData.length > 0) setExpandedQuiz(quizData[0].id)
    } catch (error) {
      console.error('Error loading grading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return 'success'
    if (percentage >= 80) return 'info'
    if (percentage >= 70) return 'warning'
    return 'danger'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredQuizzes = selectedCourse === 'all'
    ? quizzes
    : quizzes.filter(q => q.material_id === parseInt(selectedCourse))

  const totalSubmissions = quizzes.reduce((sum, q) => sum + (q.quiz_submissions?.length || 0), 0)
  const quizzesWithSubmissions = quizzes.filter(q => q.quiz_submissions?.length > 0)
  const overallAverage = quizzesWithSubmissions.length > 0
    ? Math.round(
        quizzesWithSubmissions.reduce((sum, q) => {
          const subs = q.quiz_submissions || []
          const avg = subs.length > 0
            ? subs.reduce((s, sub) => s + ((sub.score || 0) / q.total_points * 100), 0) / subs.length
            : 0
          return sum + avg
        }, 0) / quizzesWithSubmissions.length
      )
    : 0

  const toggleQuiz = (id) => {
    setExpandedQuiz(expandedQuiz === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نتائج الاختبارات</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">متابعة نتائج الاختبارات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">اختبارات</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubmissions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">تسليم</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallAverage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">متوسط الدرجات</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
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

      {/* Quiz Results List */}
      <div className="space-y-4">
        {filteredQuizzes.map((quiz) => {
          const submissions = quiz.quiz_submissions || []
          const submissionCount = submissions.length
          const totalStudents = quiz.materials?.student_materials?.[0]?.count || 0
          const avgScore = submissionCount > 0
            ? Math.round(submissions.reduce((s, sub) => s + ((sub.score || 0) / quiz.total_points * 100), 0) / submissionCount)
            : 0

          return (
            <Card key={quiz.id} className="overflow-hidden">
              <button
                onClick={() => toggleQuiz(quiz.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                      {!quiz.is_published && <Badge variant="default">مسودة</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {quiz.materials?.name} • {quiz.duration_minutes} دقيقة • {quiz.total_points} نقطة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">التسليمات</p>
                    <p className="font-bold text-gray-900 dark:text-white">{submissionCount}/{totalStudents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">المتوسط</p>
                    <p className={cn('font-bold', avgScore >= 70 ? 'text-green-600' : 'text-orange-600')}>
                      {avgScore}%
                    </p>
                  </div>
                  {expandedQuiz === quiz.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedQuiz === quiz.id && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  {submissionCount > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">الطالب</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">الدرجة</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">النسبة</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">الوقت المستغرق</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ التسليم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {submissions
                            .filter(s => {
                              if (!searchQuery) return true
                              const name = s.students?.profiles?.name || ''
                              return name.toLowerCase().includes(searchQuery.toLowerCase())
                            })
                            .sort((a, b) => (b.score || 0) - (a.score || 0))
                            .map((sub, index) => {
                              const studentName = sub.students?.profiles?.name || 'طالب'
                              const percentage = quiz.total_points > 0 ? Math.round((sub.score || 0) / quiz.total_points * 100) : 0

                              return (
                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {index + 1}
                                      </span>
                                      <Avatar name={studentName} size="sm" />
                                      <span className="font-medium text-gray-900 dark:text-white">{studentName}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {sub.score || 0}/{quiz.total_points}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge variant={getScoreBadge(percentage)}>
                                      {percentage}%
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                                    {sub.time_spent || '-'}
                                  </td>
                                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                                    {sub.submitted_at ? formatDate(sub.submitted_at) : '-'}
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      لا توجد تسليمات لهذا الاختبار بعد
                    </div>
                  )}

                  {quiz.due_date && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        الموعد النهائي: {formatDate(quiz.due_date)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {filteredQuizzes.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد نتائج</h3>
          <p className="text-gray-500 dark:text-gray-400">لا توجد اختبارات في هذا المقرر</p>
        </Card>
      )}
    </div>
  )
}
