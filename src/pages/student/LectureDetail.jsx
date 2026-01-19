import { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Input, Textarea } from '../../components/ui/Input'
import { lectureDetail, questions, currentStudent } from '../../data/mockData'
import { formatDate, getRelativeTime } from '../../lib/utils'

export function LectureDetail() {
  const { subjectId, lectureId } = useParams()
  const [activeSection, setActiveSection] = useState('materials')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا المساعد الذكي لهذه المحاضرة. يمكنك سؤالي عن أي شيء يتعلق بأنماط التصميم البرمجي.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [newQuestion, setNewQuestion] = useState('')

  const lecture = lectureDetail

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    
    setChatMessages([
      ...chatMessages,
      { role: 'user', content: chatInput },
      { role: 'assistant', content: 'هذا مثال على رد المساعد الذكي. في النسخة الفعلية، سيتم ربط هذا بنموذج ذكاء اصطناعي للإجابة على أسئلتك حول المحاضرة.' },
    ])
    setChatInput('')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/student/subjects" className="hover:text-primary-600">المواد</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/student/subjects/${subjectId}`} className="hover:text-primary-600">
          {lecture.subjectName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{lecture.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{lecture.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(lecture.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lecture.time} • {lecture.duration}</span>
              </div>
              <span>{lecture.professor}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {currentStudent.aiCredits}/{currentStudent.maxAiCredits} رصيد ذكاء
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
              {lecture.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    material.type === 'pdf' ? 'bg-red-100' : 'bg-purple-100'
                  }`}>
                    {material.type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-red-600" />
                    ) : (
                      <Video className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{material.name}</p>
                    <p className="text-sm text-gray-500">
                      {material.size || material.duration}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <CardTitle>ملخص المحاضرة بالذكاء الاصطناعي</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{lecture.aiSummary}</div>
              </div>
            </CardContent>
          </Card>

          {/* Q&A Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <CardTitle>أسئلة الطلاب</CardTitle>
                </div>
                <Badge variant="info">{questions.length} سؤال</Badge>
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
                <Button className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {questions.map((q) => (
                  <div key={q.id} className={`p-4 rounded-xl ${q.isPinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={q.studentName} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{q.studentName}</span>
                          {q.isPinned && (
                            <Pin className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-gray-700">{q.question}</p>
                        
                        {q.answer && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{q.answeredBy}</span>
                            </div>
                            <p className="text-sm text-green-700">{q.answer}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3">
                          <button className={`flex items-center gap-1 text-sm ${q.userVoted ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}>
                            <ThumbsUp className="w-4 h-4" />
                            <span>{q.votes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(q.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz */}
          {lecture.quizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>اختبارات المحاضرة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lecture.quizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="font-medium text-gray-900 mb-2">{quiz.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>{quiz.questions} سؤال • {quiz.duration}</p>
                      <p>الموعد النهائي: {getRelativeTime(quiz.dueDate)}</p>
                    </div>
                    <Button className="w-full" size="sm">
                      ابدأ الاختبار
                    </Button>
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
                      msg.role === 'user' ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700'
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
