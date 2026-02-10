import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, FileText, ChevronLeft, Loader2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

export function ProfessorCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) loadCourses()
  }, [user])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await professorService.getCourses(user.id)
      setCourses(data)
    } catch (error) {
      console.error('Error loading courses:', error)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المقررات الدراسية</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة المقررات والمحاضرات</p>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const studentCount = course.student_materials?.[0]?.count || 0
            const lectureCount = course.lectures?.[0]?.count || 0
            const quizCount = course.quizzes?.[0]?.count || 0

            return (
              <Link key={course.id} to={`/professor/courses/${course.id}`}>
                <Card className="h-full group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: course.color || '#3B82F6' }}
                      >
                        {course.code?.slice(0, 2) || 'MA'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {course.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{course.code}</p>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{course.semesters?.name || ''}</p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{studentCount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">طالب</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{lectureCount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">محاضرة</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{quizCount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">اختبار</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد مقررات</h3>
          <p className="text-gray-500 dark:text-gray-400">لم يتم تعيين أي مقررات لك بعد</p>
        </Card>
      )}
    </div>
  )
}
