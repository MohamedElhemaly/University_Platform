import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  FileText,
  Bell,
  Calendar,
  ChevronLeft,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { subjects, lectures, quizzes, announcements } from '../../data/mockData'
import { formatDate, getRelativeTime } from '../../lib/utils'

export function SubjectDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('lectures')
  
  const subject = subjects.find(s => s.id === parseInt(id)) || subjects[0]
  const subjectLectures = lectures.filter(l => l.subjectId === subject.id)
  const subjectQuizzes = quizzes.filter(q => q.subjectId === subject.id)
  const subjectAnnouncements = announcements.filter(a => a.subjectId === subject.id)

  const tabs = [
    { id: 'lectures', label: 'المحاضرات', count: subjectLectures.length },
    { id: 'quizzes', label: 'الاختبارات', count: subjectQuizzes.length },
    { id: 'announcements', label: 'الإعلانات', count: subjectAnnouncements.length },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">مكتملة</Badge>
      case 'current':
        return <Badge variant="info">الحالية</Badge>
      case 'upcoming':
        return <Badge variant="default">قادمة</Badge>
      default:
        return null
    }
  }

  const getQuizStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="success">تم التسليم</Badge>
      case 'not_started':
        return <Badge variant="warning">لم يبدأ</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/student/subjects" className="hover:text-primary-600">المواد الدراسية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{subject.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: subject.color }}
          >
            {subject.code.slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-gray-500">{subject.professor}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{subject.code}</span>
              <span>•</span>
              <span>{subject.lecturesCount} محاضرة</span>
              <span>•</span>
              <span>{subject.students} طالب</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="lectures" onChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'lectures' && (
        <div className="space-y-3">
          {subjectLectures.map((lecture, index) => (
            <Link
              key={lecture.id}
              to={`/student/subjects/${subject.id}/lectures/${lecture.id}`}
            >
              <Card className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {lecture.title}
                    </h3>
                    {getStatusBadge(lecture.status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(lecture.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lecture.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lecture.hasQuiz && (
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className="w-4 h-4 text-orange-500" />
                      {lecture.quizCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-orange-500">اختبار</span>
                      )}
                    </div>
                  )}
                  {lecture.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {subjectQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                quiz.type === 'online' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <FileText className={`w-6 h-6 ${
                  quiz.type === 'online' ? 'text-blue-600' : 'text-purple-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                  {getQuizStatusBadge(quiz.status)}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{quiz.questions} سؤال</span>
                  <span>•</span>
                  <span>{quiz.duration}</span>
                  <span>•</span>
                  <span>{quiz.points} نقطة</span>
                </div>
              </div>
              <div className="text-left">
                {quiz.status === 'submitted' ? (
                  <div>
                    <p className="text-lg font-bold text-green-600">{quiz.score}/{quiz.points}</p>
                    <p className="text-xs text-gray-500">الدرجة</p>
                  </div>
                ) : (
                  <div>
                    <Badge variant={quiz.type === 'online' ? 'info' : 'purple'}>
                      {quiz.type === 'online' ? 'إلكتروني' : 'حضوري'}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{getRelativeTime(quiz.dueDate)}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-3">
          {subjectAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  announcement.important ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <Bell className={`w-5 h-5 ${
                    announcement.important ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                    {announcement.important && <Badge variant="danger">مهم</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(announcement.date)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
