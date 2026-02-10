import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Send,
  Loader2,
  Search,
  BookOpen,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { getRelativeTime } from '../../lib/utils'

export function ProfessorQuestions() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [questionsData, coursesData] = await Promise.all([
        professorService.getAllUnansweredQuestions(user.id),
        professorService.getCourses(user.id)
      ])
      setQuestions(questionsData)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (questionId) => {
    if (!answerText.trim()) return
    try {
      setSubmitting(true)
      await professorService.answerQuestion(user.id, questionId, answerText.trim())
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      setAnsweringId(null)
      setAnswerText('')
    } catch (error) {
      console.error('Error answering question:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesCourse = selectedCourse === 'all' || String(q.lectures?.materials?.id) === String(selectedCourse)
    const matchesSearch = !searchQuery || 
      q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.students?.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCourse && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أسئلة الطلاب</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {questions.length > 0 
              ? `${questions.length} سؤال بانتظار الرد`
              : 'لا توجد أسئلة بانتظار الرد'}
          </p>
        </div>
        <Badge variant="warning" className="text-base px-4 py-1.5">
          {questions.length} بانتظار الرد
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث في الأسئلة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full sm:w-56"
        >
          <option value="all">جميع المقررات</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </Select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? filteredQuestions.map((question) => (
          <Card key={question.id} hover={false}>
            <div className="space-y-3">
              {/* Header: student info + course/lecture */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={question.students?.profiles?.name} 
                    src={question.students?.profiles?.avatar_url}
                    size="md" 
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {question.students?.profiles?.name || 'طالب'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRelativeTime(question.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">
                    <BookOpen className="w-3 h-3 ml-1" />
                    {question.lectures?.materials?.name || 'مقرر'}
                  </Badge>
                  <Badge variant="default">
                    {question.lectures?.title || 'محاضرة'}
                  </Badge>
                </div>
              </div>

              {/* Question text */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-gray-800 leading-relaxed">{question.question_text}</p>
                </div>
                {question.votes > 0 && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    👍 {question.votes} صوت من الطلاب
                  </div>
                )}
              </div>

              {/* Answer area */}
              {answeringId === question.id ? (
                <div className="space-y-3 border-t pt-3">
                  <Textarea
                    placeholder="اكتب إجابتك هنا..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setAnsweringId(null); setAnswerText('') }}
                      disabled={submitting}
                    >
                      إلغاء
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAnswer(question.id)}
                      disabled={submitting || !answerText.trim()}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      إرسال الإجابة
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-t pt-3">
                  <Link 
                    to={`/professor/courses/${question.lectures?.materials?.id}/lectures/${question.lectures?.id}`}
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                  >
                    الذهاب للمحاضرة
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => setAnsweringId(question.id)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    إجابة السؤال
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )) : (
          <Card className="p-12 text-center" hover={false}>
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد أسئلة</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedCourse !== 'all'
                ? 'لا توجد أسئلة مطابقة للفلتر الحالي'
                : 'لا توجد أسئلة بانتظار الرد حالياً'}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
