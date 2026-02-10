import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Send,
  Loader2,
  RotateCcw,
  Eye,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

export function StudentQuiz() {
  const { quizId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isReviewMode = searchParams.get('review') === 'true'
  
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [previousSubmissions, setPreviousSubmissions] = useState([])
  const [attemptsBlocked, setAttemptsBlocked] = useState(false)
  const [maxAttempts, setMaxAttempts] = useState(1)

  // Load quiz data
  useEffect(() => {
    if (quizId && user?.id) {
      loadQuiz()
    }
  }, [quizId, user])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const [data, submissions] = await Promise.all([
        studentService.getQuiz(quizId),
        studentService.getQuizSubmissions(quizId, user.id)
      ])

      if (data) {
        const formattedQuiz = {
          id: data.id,
          title: data.title,
          subjectId: data.material_id,
          subjectName: data.materials?.name || 'المادة',
          duration: data.duration || 20,
          maxAttempts: data.max_attempts || 1,
          totalPoints: data.points || data.quiz_questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0,
          questions: (data.quiz_questions || []).map(q => ({
            id: q.id,
            text: q.question_text,
            type: q.question_type || 'multiple_choice',
            options: q.options || [],
            points: q.points || 0,
            correctAnswer: q.correct_answer,
          })),
        }
        setQuiz(formattedQuiz)
        setMaxAttempts(data.max_attempts || 1)
        setPreviousSubmissions(submissions)

        const attemptCount = submissions.length
        const blocked = attemptCount >= (data.max_attempts || 1)

        // If review mode, show best submission results
        if (isReviewMode && submissions.length > 0) {
          const best = submissions.reduce((a, b) => (a.score || 0) > (b.score || 0) ? a : b)
          const questionResults = {}
          formattedQuiz.questions.forEach(q => {
            const userAnswer = best.answers?.[q.id] || null
            const isCorrect = userAnswer === q.correctAnswer
            questionResults[q.id] = {
              userAnswer,
              correctAnswer: q.correctAnswer,
              isCorrect,
              points: isCorrect ? q.points : 0,
            }
          })
          setResult({
            score: best.score || 0,
            totalPoints: best.total_points || formattedQuiz.totalPoints,
            percentage: best.total_points > 0 ? Math.round((best.score / best.total_points) * 100) : 0,
            questionResults,
            timeSpent: best.time_spent || 0,
          })
          setIsSubmitted(true)
          setAttemptsBlocked(blocked)
          return
        }

        // If no attempts left and not review mode, block
        if (blocked && !isReviewMode) {
          setAttemptsBlocked(true)
          // Still show results of best submission
          if (submissions.length > 0) {
            const best = submissions.reduce((a, b) => (a.score || 0) > (b.score || 0) ? a : b)
            const questionResults = {}
            formattedQuiz.questions.forEach(q => {
              const userAnswer = best.answers?.[q.id] || null
              const isCorrect = userAnswer === q.correctAnswer
              questionResults[q.id] = {
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                points: isCorrect ? q.points : 0,
              }
            })
            setResult({
              score: best.score || 0,
              totalPoints: best.total_points || formattedQuiz.totalPoints,
              percentage: best.total_points > 0 ? Math.round((best.score / best.total_points) * 100) : 0,
              questionResults,
              timeSpent: best.time_spent || 0,
            })
            setIsSubmitted(true)
          }
          return
        }

        setTimeLeft(formattedQuiz.duration * 60)
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  // Timer
  useEffect(() => {
    if (!quiz || isSubmitted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit(true) // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, isSubmitted])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const toggleFlag = (questionId) => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId)
    } else {
      newFlagged.add(questionId)
    }
    setFlaggedQuestions(newFlagged)
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true)
      return
    }

    setIsSubmitting(true)
    setShowConfirmSubmit(false)

    try {
      const timeSpent = quiz.duration * 60 - timeLeft

      // Grade locally using the correct answers from quiz_questions
      let score = 0
      const questionResults = {}
      
      quiz.questions.forEach((q) => {
        const isCorrect = answers[q.id] === q.correctAnswer
        questionResults[q.id] = {
          userAnswer: answers[q.id],
          correctAnswer: q.correctAnswer,
          isCorrect,
          points: isCorrect ? q.points : 0,
        }
        if (isCorrect) score += q.points
      })

      // Submit to backend with score
      await studentService.submitQuiz(quizId, user.id, answers, timeSpent, score, quiz.totalPoints)

      setResult({
        score,
        totalPoints: quiz.totalPoints,
        percentage: quiz.totalPoints > 0 ? Math.round((score / quiz.totalPoints) * 100) : 0,
        questionResults,
        timeSpent,
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const answeredCount = Object.keys(answers).length
  const unansweredCount = quiz.questions.length - answeredCount

  // Results View
  if (isSubmitted && result) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/student/subjects" className="hover:text-primary-600">المواد</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/student/subjects/${quiz.subjectId}`} className="hover:text-primary-600">
            {quiz.subjectName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">نتيجة {quiz.title}</span>
        </div>

        {/* Result Summary */}
        <Card className="text-center p-8">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
            result.percentage >= 60 ? "bg-green-100" : "bg-red-100"
          )}>
            {result.percentage >= 60 ? (
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {result.score} / {result.totalPoints}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{result.percentage}%</p>
          <Badge variant={result.percentage >= 60 ? "success" : "danger"} className="text-base px-4 py-1">
            {result.percentage >= 90 ? 'ممتاز' : 
             result.percentage >= 75 ? 'جيد جداً' : 
             result.percentage >= 60 ? 'جيد' : 'يحتاج تحسين'}
          </Badge>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            الوقت المستغرق: {formatTime(result.timeSpent)}
          </p>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الإجابات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((q, index) => {
              const qResult = result.questionResults[q.id]
              return (
                <div
                  key={q.id}
                  className={cn(
                    "p-4 rounded-xl border-2",
                    qResult.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      qResult.isCorrect ? "bg-green-200" : "bg-red-200"
                    )}>
                      {qResult.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-700" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {index + 1}. {q.text}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className={cn(
                          qResult.isCorrect ? "text-green-700" : "text-red-700"
                        )}>
                          إجابتك: {qResult.userAnswer || 'لم تجب'}
                        </p>
                        {!qResult.isCorrect && (
                          <p className="text-green-700">
                            الإجابة الصحيحة: {qResult.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={cn(
                        "font-bold",
                        qResult.isCorrect ? "text-green-600" : "text-red-600"
                      )}>
                        {qResult.points}/{q.points}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Attempt Info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>المحاولات: {previousSubmissions.length}/{maxAttempts}</span>
            </div>
            <div className="flex gap-3">
              {!attemptsBlocked && previousSubmissions.length < maxAttempts && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false)
                    setResult(null)
                    setAnswers({})
                    setCurrentQuestion(0)
                    setFlaggedQuestions(new Set())
                    setTimeLeft(quiz.duration * 60)
                    setShowConfirmSubmit(false)
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة الاختبار
                </Button>
              )}
              <Button onClick={() => navigate(`/student/subjects/${quiz.subjectId}`)}>
                العودة للمادة
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Quiz Taking View
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.subjectName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold",
              timeLeft <= 60 ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            )}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="info">
                السؤال {currentQuestion + 1} من {quiz.questions.length}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{question.points} نقاط</span>
                <button
                  onClick={() => toggleFlag(question.id)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    flaggedQuestions.has(question.id)
                      ? "bg-orange-100 text-orange-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-400"
                  )}
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question.id, option)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-right transition-all",
                    answers[question.id] === option
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                      answers[question.id] === option
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300"
                    )}>
                      {answers[question.id] === option && (
                        <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-800" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowRight className="w-4 h-4" />
                السابق
              </Button>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                >
                  التالي
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Question Navigator */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">الأسئلة</h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-10 h-10 rounded-lg font-medium text-sm relative",
                    currentQuestion === index
                      ? "bg-primary-600 text-white"
                      : answers[q.id]
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  )}
                >
                  {index + 1}
                  {flaggedQuestions.has(q.id) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Status */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">الحالة</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">تمت الإجابة</span>
                <span className="font-medium text-green-600">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">لم تتم الإجابة</span>
                <span className="font-medium text-gray-600 dark:text-gray-400">{unansweredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">مُعلّمة</span>
                <span className="font-medium text-orange-600">{flaggedQuestions.size}</span>
              </div>
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">الدليل</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary-600" />
                <span className="text-gray-600 dark:text-gray-400">الحالي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100" />
                <span className="text-gray-600 dark:text-gray-400">تمت الإجابة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700" />
                <span className="text-gray-600 dark:text-gray-400">لم تتم الإجابة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">مُعلّم للمراجعة</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تأكيد التسليم</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                هل أنت متأكد من تسليم الاختبار؟
                {unansweredCount > 0 && (
                  <span className="block text-orange-600 mt-2">
                    لديك {unansweredCount} أسئلة لم تتم الإجابة عليها
                  </span>
                )}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                  مراجعة الإجابات
                </Button>
                <Button onClick={() => handleSubmit(true)} className="bg-green-600 hover:bg-green-700">
                  تسليم الاختبار
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
