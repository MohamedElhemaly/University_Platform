import { Link } from 'react-router-dom'
import { BookOpen, Users, FileText, ChevronLeft } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { subjects } from '../../data/mockData'
import { getRelativeTime } from '../../lib/utils'

export function StudentSubjects() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">المواد الدراسية</h1>
        <p className="text-gray-500 mt-1">الفصل الدراسي الأول 2025-2026</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link key={subject.id} to={`/student/subjects/${subject.id}`}>
            <Card className="h-full group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.code.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">{subject.professor}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{subject.lecturesCount} محاضرة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{subject.students} طالب</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">التقدم</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((subject.completedLectures / subject.lecturesCount) * 100)}%
                    </span>
                  </div>
                  <Progress value={subject.completedLectures} max={subject.lecturesCount} />
                </div>

                {subject.upcomingQuiz && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">
                        {subject.upcomingQuiz.title}
                      </span>
                      <Badge variant="warning">{getRelativeTime(subject.upcomingQuiz.date)}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
