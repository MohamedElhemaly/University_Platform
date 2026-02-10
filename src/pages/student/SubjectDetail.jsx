import { useState, useEffect } from 'react'
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
  Loader2,
  BookOpen,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, getRelativeTime } from '../../lib/utils'

export function SubjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('lectures')
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizSubmissions, setQuizSubmissions] = useState({})

  useEffect(() => {
    if (user?.id && id) {
      loadMaterialDetail()
    }
  }, [user, id])

  const loadMaterialDetail = async () => {
    try {
      setLoading(true)
      const [data, submissions] = await Promise.all([
        studentService.getMaterialDetail(id, user.id),
        studentService.getMaterialQuizSubmissions(parseInt(id), user.id)
      ])
      setMaterial(data)

      // Group submissions by quiz_id, keeping best score and count
      const grouped = {}
      for (const sub of submissions) {
        const qid = sub.quiz_id
        if (!grouped[qid]) {
          grouped[qid] = { best: sub, attempts: 1 }
        } else {
          grouped[qid].attempts++
          if ((sub.score || 0) > (grouped[qid].best.score || 0)) {
            grouped[qid].best = sub
          }
        }
      }
      setQuizSubmissions(grouped)
    } catch (error) {
      console.error('Error loading material detail:', error)
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

  if (!material) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>لم يتم العثور على المادة</p>
      </div>
    )
  }

  const subjectLectures = material.lectures || []
  const subjectQuizzes = (material.quizzes || []).filter(q => q.is_published)
  const subjectAnnouncements = material.announcements || []
  const professorName = material.professors?.profiles?.name || 'غير معين'
  const completedLectures = material.progress?.filter(p => p.completed)?.length || 0

  const tabs = [
    { id: 'lectures', label: 'المحاضرات', count: subjectLectures.length },
    { id: 'quizzes', label: 'الاختبارات', count: subjectQuizzes.length },
    { id: 'announcements', label: 'الإعلانات', count: subjectAnnouncements.length },
  ]

  const isLectureCompleted = (lectureId) => {
    return material.progress?.some(p => p.lecture_id === lectureId && p.completed)
  }

  const getQuizStatusBadge = (quiz) => {
    const submission = quizSubmissions[quiz.id]
    if (submission) {
      const pct = submission.best.total_points > 0
        ? Math.round((submission.best.score / submission.best.total_points) * 100)
        : 0
      return <Badge variant={pct >= 60 ? 'success' : 'danger'}>{pct}%</Badge>
    }
    if (quiz.due_date && new Date(quiz.due_date) < new Date()) {
      return <Badge variant="default">انتهى</Badge>
    }
    return <Badge variant="warning">لم يبدأ</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/student/subjects" className="hover:text-primary-600">المواد الدراسية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{material.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: material.color || '#3B82F6' }}
          >
            {material.code?.slice(0, 2) || 'MA'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{material.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{professorName}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{material.code}</span>
              <span>•</span>
              <span>{subjectLectures.length} محاضرة</span>
              <span>•</span>
              <span>{completedLectures} مكتملة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="lectures" onChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'lectures' && (
        <div className="space-y-3">
          {subjectLectures.length > 0 ? subjectLectures.map((lecture, index) => {
            const completed = isLectureCompleted(lecture.id)
            return (
              <Link
                key={lecture.id}
                to={`/student/subjects/${material.id}/lectures/${lecture.id}`}
              >
                <Card className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                        {lecture.title}
                      </h3>
                      {completed && <Badge variant="success">مكتملة</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      {lecture.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(lecture.date)}</span>
                        </div>
                      )}
                      {lecture.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{lecture.duration} دقيقة</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </Card>
              </Link>
            )
          }) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد محاضرات بعد</div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {subjectQuizzes.length > 0 ? subjectQuizzes.map((quiz) => {
            const isExpired = quiz.due_date && new Date(quiz.due_date) < new Date()
            const submission = quizSubmissions[quiz.id]
            const attemptCount = submission?.attempts || 0
            const maxAttempts = quiz.max_attempts || 1
            const hasAttemptsLeft = attemptCount < maxAttempts
            const canTake = quiz.type === 'online' && !isExpired && hasAttemptsLeft
            const canReview = quiz.type === 'online' && submission

            return (
              <Card key={quiz.id} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  submission ? 'bg-green-100' : quiz.type === 'online' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {submission ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <FileText className={`w-6 h-6 ${
                      quiz.type === 'online' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                    {getQuizStatusBadge(quiz)}
                    <Badge variant={quiz.type === 'online' ? 'info' : 'purple'}>
                      {quiz.type === 'online' ? 'إلكتروني' : 'حضوري'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{quiz.duration || 0} دقيقة</span>
                    <span>•</span>
                    <span>{quiz.points || 0} نقطة</span>
                    {submission && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          أفضل درجة: {submission.best.score}/{submission.best.total_points}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>المحاولات: {attemptCount}/{maxAttempts}</span>
                  </div>
                  {quiz.due_date && (
                    <p className="text-xs text-gray-400 mt-1">{getRelativeTime(quiz.due_date)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {canReview && (
                    <Link to={`/student/quizzes/${quiz.id}?review=true`}>
                      <Button variant="outline" size="sm">
                        مراجعة الإجابات
                      </Button>
                    </Link>
                  )}
                  {canTake && (
                    <Link to={`/student/quizzes/${quiz.id}`}>
                      <Button size="sm">
                        <PlayCircle className="w-4 h-4" />
                        {submission ? 'إعادة الاختبار' : 'ابدأ الاختبار'}
                      </Button>
                    </Link>
                  )}
                  {!canTake && !canReview && isExpired && (
                    <Badge variant="default">انتهى</Badge>
                  )}
                  {!canTake && !canReview && !isExpired && submission && (
                    <Badge variant="success">مكتمل</Badge>
                  )}
                </div>
              </Card>
            )
          }) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد اختبارات بعد</div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-3">
          {subjectAnnouncements.length > 0 ? subjectAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  announcement.is_important ? 'bg-red-100' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Bell className={`w-5 h-5 ${
                    announcement.is_important ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{announcement.title}</h3>
                    {announcement.is_important && <Badge variant="danger">مهم</Badge>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(announcement.created_at)}</p>
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">لا توجد إعلانات بعد</div>
          )}
        </div>
      )}
    </div>
  )
}
