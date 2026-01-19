import { Link } from 'react-router-dom'
import { BookOpen, Users, FileText, ChevronLeft, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/Progress'
import { professorCourses } from '../../data/mockData'

export function ProfessorCourses() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المقررات الدراسية</h1>
          <p className="text-gray-500 mt-1">إدارة المقررات والمحاضرات</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professorCourses.map((course) => (
          <Link key={course.id} to={`/professor/courses/${course.id}`}>
            <Card className="h-full group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.code.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-500">{course.code}</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-4">{course.semester}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{course.students}</p>
                    <p className="text-xs text-gray-500">طالب</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{course.lecturesCount}</p>
                    <p className="text-xs text-gray-500">محاضرة</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{course.activeQuizzes}</p>
                    <p className="text-xs text-gray-500">اختبار</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">تقدم المقرر</span>
                    <span className="font-medium text-gray-900">
                      {course.completedLectures}/{course.lecturesCount}
                    </span>
                  </div>
                  <Progress value={course.completedLectures} max={course.lecturesCount} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
