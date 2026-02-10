import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

export function StudentPerformance() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('all')

  useEffect(() => {
    if (user?.id) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [submissionData, courseData] = await Promise.all([
        professorService.getStudentPerformance(user.id),
        professorService.getCourses(user.id)
      ])
      setSubmissions(submissionData)
      setCourses(courseData)
    } catch (error) {
      console.error('Error loading performance data:', error)
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

  // Filter submissions by selected course (String() needed: material_id is integer, select value is string)
  const filteredSubmissions = selectedCourse === 'all'
    ? submissions
    : submissions.filter(sub => String(sub.quizzes?.material_id) === String(selectedCourse))

  // Process submissions into student performance data
  const studentMap = {}
  filteredSubmissions.forEach(sub => {
    const studentId = sub.students?.id
    if (!studentId) return
    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        id: studentId,
        name: sub.students?.profiles?.name || 'طالب',
        submissions: [],
        totalScore: 0,
        count: 0
      }
    }
    studentMap[studentId].submissions.push(sub)
    if (sub.score !== null && sub.score !== undefined) {
      studentMap[studentId].totalScore += sub.score
      studentMap[studentId].count++
    }
  })

  const students = Object.values(studentMap).map(s => ({
    ...s,
    avgScore: s.count > 0 ? Math.round(s.totalScore / s.count) : 0,
    quizCount: s.submissions.length
  })).sort((a, b) => b.avgScore - a.avgScore)

  const uniqueStudents = new Set(filteredSubmissions.map(s => s.students?.id)).size
  const avgScore = filteredSubmissions.length > 0
    ? Math.round(filteredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / filteredSubmissions.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أداء الطلاب</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">تحليلات وإحصائيات أداء الطلاب</p>
        </div>
        
        <div className="flex items-center gap-2">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueStudents}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">طلاب شاركوا</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">متوسط الدرجات</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSubmissions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي التسليمات</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Students */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="space-y-4">
              {students.slice(0, 10).map((student, index) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700 dark:text-gray-300' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.quizCount} اختبارات مكتملة</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white">{student.avgScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">المعدل</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد بيانات أداء بعد</p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل أداء الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">الطالب</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">الاختبارات</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">المعدل</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} size="sm" />
                          <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.quizCount}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          student.avgScore >= 90 ? 'text-green-600' :
                          student.avgScore >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {student.avgScore}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={student.avgScore >= 80 ? 'success' : student.avgScore >= 60 ? 'warning' : 'danger'}>
                          {student.avgScore >= 80 ? 'ممتاز' : student.avgScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد بيانات بعد</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
