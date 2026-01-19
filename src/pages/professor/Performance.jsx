import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  FileText,
  MessageCircle,
  Filter,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { studentPerformance, professorCourses } from '../../data/mockData'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export function StudentPerformance() {
  const [selectedCourse, setSelectedCourse] = useState('all')

  const stats = studentPerformance.stats

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أداء الطلاب</h1>
          <p className="text-gray-500 mt-1">تحليلات وإحصائيات أداء الطلاب</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-48"
          >
            <option value="all">جميع المقررات</option>
            {professorCourses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-sm text-gray-500">إجمالي الطلاب</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              <p className="text-sm text-gray-500">متوسط الدرجات</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              <p className="text-sm text-gray-500">نسبة الإكمال</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              <p className="text-sm text-gray-500">إجمالي الأسئلة</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quiz Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>نسبة إكمال الاختبارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentPerformance.quizCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Scores */}
        <Card>
          <CardHeader>
            <CardTitle>متوسط الدرجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentPerformance.averageScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement by Lecture */}
        <Card>
          <CardHeader>
            <CardTitle>التفاعل حسب المحاضرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentPerformance.engagementByLecture}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="المشاهدات" />
                  <Bar dataKey="questions" fill="#f59e0b" radius={[4, 4, 0, 0]} name="الأسئلة" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل الطلاب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.quizzes} اختبارات مكتملة</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{student.score}%</p>
                    <p className="text-xs text-gray-500">المعدل</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تفاصيل أداء الطلاب</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
              تصفية
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الطالب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الاختبارات</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المعدل</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentPerformance.topStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" />
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{student.quizzes}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        student.score >= 90 ? 'text-green-600' :
                        student.score >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {student.score}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={student.score >= 80 ? 'success' : student.score >= 60 ? 'warning' : 'danger'}>
                        {student.score >= 80 ? 'ممتاز' : student.score >= 60 ? 'جيد' : 'يحتاج تحسين'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
