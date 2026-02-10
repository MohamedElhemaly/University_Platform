import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  FileText,
  Video,
  Download,
  Clock,
  Calendar,
  Sparkles,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Pin,
  CheckCircle2,
  Bot,
  User,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Input, Textarea } from '../../components/ui/Input'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, getRelativeTime } from '../../lib/utils'

export function LectureDetail() {
  const { subjectId, lectureId } = useParams()
  const { user } = useAuth()
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا المساعد الذكي لهذه المحاضرة. يمكنك سؤالي عن أي شيء يتعلق بمحتوى المحاضرة.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)

  useEffect(() => {
    if (user?.id && lectureId) {
      loadLectureDetail()
    }
  }, [user, lectureId])

  const loadLectureDetail = async () => {
    try {
      setLoading(true)
      const data = await studentService.getLectureDetail(lectureId, user.id)
      setLecture(data)
      if (data.chatHistory?.length > 0) {
        setChatMessages(data.chatHistory)
      }
    } catch (error) {
      console.error('Error loading lecture detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    
    setChatMessages([
      ...chatMessages,
      { role: 'user', content: chatInput },
      { role: 'assistant', content: 'هذه الميزة قيد التطوير. سيتم ربطها بنموذج ذكاء اصطناعي قريباً.' },
    ])
    setChatInput('')
  }

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return
    try {
      setSubmittingQuestion(true)
      await studentService.askQuestion(user.id, lectureId, newQuestion)
      setNewQuestion('')
      await loadLectureDetail()
    } catch (error) {
      console.error('Error asking question:', error)
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const handleVote = async (questionId, voteType) => {
    try {
      await studentService.voteQuestion(user.id, questionId, voteType)
      await loadLectureDetail()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lecture) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>لم يتم العثور على المحاضرة</p>
      </div>
    )
  }

  const lectureMaterials = lecture.lecture_materials || []
  const lectureQuestions = lecture.lecture_questions || []
  const lectureQuizzes = lecture.quizzes || []
  const materialName = lecture.materials?.name || 'المادة'
  const aiCredits = user?.ai_credits ?? 50
  const maxAiCredits = user?.max_ai_credits ?? 50

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link to="/student/subjects" className="hover:text-primary-600">المواد</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/student/subjects/${subjectId}`} className="hover:text-primary-600">
          {materialName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{lecture.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lecture.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {aiCredits}/{maxAiCredits} رصيد ذكاء
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>مواد المحاضرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lectureMaterials.length > 0 ? lectureMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mat.type === 'pdf' ? 'bg-red-100' : mat.type === 'video' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {mat.type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-red-600" />
                    ) : (
                      <Video className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{mat.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mat.file_size || ''}
                    </p>
                  </div>
                  {mat.file_url && (
                    <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد مواد مرفقة</p>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          {lecture.ai_summary && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <CardTitle>ملخص المحاضرة بالذكاء الاصطناعي</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                  <div className="whitespace-pre-wrap">{lecture.ai_summary}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Q&A Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <CardTitle>أسئلة الطلاب</CardTitle>
                </div>
                <Badge variant="info">{lectureQuestions.length} سؤال</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Question Form */}
              <div className="flex gap-3">
                <Textarea
                  placeholder="اكتب سؤالك هنا..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={2}
                />
                <Button className="shrink-0" onClick={handleAskQuestion} disabled={submittingQuestion}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {lectureQuestions.length > 0 ? lectureQuestions.map((q) => (
                  <div key={q.id} className={`p-4 rounded-xl ${q.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={q.students?.profiles?.name || 'طالب'} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{q.students?.profiles?.name || 'طالب'}</span>
                          {q.is_pinned && (
                            <Pin className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{q.question_text}</p>
                        
                        {q.answer_text && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{q.professors?.profiles?.name || 'الأستاذ'}</span>
                            </div>
                            <p className="text-sm text-green-700">{q.answer_text}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600"
                            onClick={() => handleVote(q.id, 'up')}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{q.votes || 0}</span>
                          </button>
                          <button
                            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
                            onClick={() => handleVote(q.id, 'down')}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(q.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد أسئلة بعد. كن أول من يسأل!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz */}
          {lectureQuizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>اختبارات المحاضرة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lectureQuizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{quiz.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <p>{quiz.duration_minutes || 0} دقيقة</p>
                      {quiz.due_date && <p>الموعد النهائي: {getRelativeTime(quiz.due_date)}</p>}
                    </div>
                    <Link to={`/student/quiz/${quiz.id}`}>
                      <Button className="w-full" size="sm">
                        ابدأ الاختبار
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Chat */}
          <Card className="flex flex-col h-[500px]">
            <CardHeader className="shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" />
                <CardTitle>المساعد الذكي</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-primary-100' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="flex gap-2 shrink-0">
                <Input
                  placeholder="اسأل عن المحاضرة..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <Button onClick={handleSendChat} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
