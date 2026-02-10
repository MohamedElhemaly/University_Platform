import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  Upload,
  FileText,
  Calendar,
  Clock,
  Settings,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Users,
  X,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  GripVertical,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../components/ui/Toast'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../lib/utils'

const emptyQuestion = () => ({
  question_text: '',
  question_type: 'multiple_choice',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 1,
})

export function CourseManagement() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast, ToastComponent } = useToast()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('lectures')
  const [showAddLecture, setShowAddLecture] = useState(false)
  const [showAddQuiz, setShowAddQuiz] = useState(false)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Lecture state
  const [newLecture, setNewLecture] = useState({ title: '', date: '', time: '' })
  const [lectureFiles, setLectureFiles] = useState([])

  // Quiz state
  const [newQuiz, setNewQuiz] = useState({ title: '', type: 'online', duration: 20, points: 50, due_date: '', max_attempts: 1 })
  const [quizQuestions, setQuizQuestions] = useState([emptyQuestion()])
  const [quizStep, setQuizStep] = useState(1)

  // Settings state
  const [courseSettings, setCourseSettings] = useState({ name: '', code: '' })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (id) loadCourse()
  }, [id])

  useEffect(() => {
    if (course) {
      setCourseSettings({
        name: course.name || '',
        code: course.code || ''
      })
    }
  }, [course])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const data = await professorService.getCourseDetail(id)
      setCourse(data)
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  // ---- LECTURE HANDLERS ----
  const handleCreateLecture = async () => {
    if (!newLecture.title.trim()) {
      showToast('يرجى إدخال عنوان المحاضرة', 'warning')
      return
    }
    try {
      setSaving(true)
      const lecture = await professorService.createLecture({
        material_id: parseInt(id),
        title: newLecture.title,
        date: newLecture.date || null,
        time: newLecture.time || null,
        order_index: (course?.lectures?.length || 0) + 1
      })

      // Upload files if any
      if (lectureFiles.length > 0 && lecture?.id) {
        for (const file of lectureFiles) {
          const fileType = file.name.endsWith('.pdf') ? 'pdf'
            : file.type.startsWith('video/') ? 'video'
            : 'other'
          await professorService.uploadMaterial(lecture.id, file, {
            name: file.name,
            type: fileType
          })
        }
      }

      setShowAddLecture(false)
      setNewLecture({ title: '', date: '', time: '' })
      setLectureFiles([])
      showToast('تم إنشاء المحاضرة بنجاح', 'success')
      await loadCourse()
    } catch (error) {
      console.error('Error creating lecture:', error)
      showToast('حدث خطأ أثناء إنشاء المحاضرة', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    setLectureFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setLectureFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ---- QUIZ HANDLERS ----
  const handleCreateQuiz = async () => {
    if (!newQuiz.title.trim()) {
      showToast('يرجى إدخال عنوان الاختبار', 'warning')
      return
    }

    // Validate questions
    if (newQuiz.type === 'online') {
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i]
        if (!q.question_text.trim()) {
          showToast(`يرجى إدخال نص السؤال ${i + 1}`, 'warning')
          return
        }
        const filledOptions = q.options.filter(o => o.trim())
        if (filledOptions.length < 2) {
          showToast(`السؤال ${i + 1} يجب أن يحتوي على خيارين على الأقل`, 'warning')
          return
        }
        if (!q.correct_answer.trim()) {
          showToast(`يرجى تحديد الإجابة الصحيحة للسؤال ${i + 1}`, 'warning')
          return
        }
        if (!filledOptions.includes(q.correct_answer)) {
          showToast(`الإجابة الصحيحة للسؤال ${i + 1} يجب أن تكون من ضمن الخيارات`, 'warning')
          return
        }
      }
    }

    try {
      setSaving(true)
      const totalPts = newQuiz.type === 'online'
        ? quizQuestions.reduce((sum, q) => sum + (q.points || 1), 0)
        : newQuiz.points

      const questionsCount = newQuiz.type === 'online' ? quizQuestions.length : 0

      const quizData = {
        material_id: parseInt(id),
        title: newQuiz.title,
        type: newQuiz.type,
        duration: newQuiz.duration,
        points: totalPts,
        questions_count: questionsCount,
        due_date: newQuiz.due_date || new Date().toISOString(),
        max_attempts: newQuiz.max_attempts || 1,
        is_published: false
      }

      const questions = newQuiz.type === 'online'
        ? quizQuestions.map(q => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options.filter(o => o.trim()),
            correct_answer: q.correct_answer,
            points: q.points || 1,
          }))
        : []

      await professorService.createQuiz(quizData, questions)

      setShowAddQuiz(false)
      setNewQuiz({ title: '', type: 'online', duration: 20, points: 50, due_date: '', max_attempts: 1 })
      setQuizQuestions([emptyQuestion()])
      setQuizStep(1)
      showToast('تم إنشاء الاختبار بنجاح', 'success')
      await loadCourse()
    } catch (error) {
      console.error('Error creating quiz:', error)
      showToast('حدث خطأ أثناء إنشاء الاختبار', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, emptyQuestion()])
  }

  const removeQuestion = (index) => {
    if (quizQuestions.length <= 1) {
      showToast('يجب أن يحتوي الاختبار على سؤال واحد على الأقل', 'warning')
      return
    }
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...quizQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setQuizQuestions(updated)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions]
    const newOptions = [...updated[qIndex].options]
    newOptions[oIndex] = value
    updated[qIndex] = { ...updated[qIndex], options: newOptions }
    setQuizQuestions(updated)
  }

  const addOption = (qIndex) => {
    const updated = [...quizQuestions]
    updated[qIndex] = { ...updated[qIndex], options: [...updated[qIndex].options, ''] }
    setQuizQuestions(updated)
  }

  const removeOption = (qIndex, oIndex) => {
    const updated = [...quizQuestions]
    const newOptions = updated[qIndex].options.filter((_, i) => i !== oIndex)
    if (newOptions.length < 2) {
      showToast('يجب أن يكون هناك خياران على الأقل', 'warning')
      return
    }
    // Clear correct answer if it was the removed option
    if (updated[qIndex].correct_answer === updated[qIndex].options[oIndex]) {
      updated[qIndex] = { ...updated[qIndex], options: newOptions, correct_answer: '' }
    } else {
      updated[qIndex] = { ...updated[qIndex], options: newOptions }
    }
    setQuizQuestions(updated)
  }

  // ---- QUIZ MANAGEMENT ----
  const handlePublishQuiz = async (quizId, isPublished) => {
    try {
      await professorService.publishQuiz(quizId, isPublished)

      // Notifications are now handled automatically via DB triggers

      showToast(isPublished ? 'تم نشر الاختبار بنجاح' : 'تم إلغاء نشر الاختبار', 'success')
      await loadCourse()
    } catch (error) {
      console.error('Error toggling quiz publish:', error)
      showToast('حدث خطأ أثناء تحديث الاختبار', 'error')
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return
    try {
      await professorService.deleteQuiz(quizId)
      showToast('تم حذف الاختبار بنجاح', 'success')
      await loadCourse()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      showToast('حدث خطأ أثناء حذف الاختبار', 'error')
    }
  }

  // ---- SETTINGS HANDLERS ----
  const handleSaveSettings = async () => {
    if (!courseSettings.name.trim()) {
      showToast('يرجى إدخال اسم المقرر', 'warning')
      return
    }
    if (!courseSettings.code.trim()) {
      showToast('يرجى إدخال رمز المقرر', 'warning')
      return
    }
    try {
      setSavingSettings(true)
      await professorService.updateCourse(parseInt(id), {
        name: courseSettings.name,
        code: courseSettings.code
      })
      showToast('تم حفظ إعدادات المقرر بنجاح', 'success')
      await loadCourse()
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast('حدث خطأ أثناء حفظ الإعدادات', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على المقرر</p>
      </div>
    )
  }

  const courseLectures = course.lectures || []
  const courseQuizzes = course.quizzes || []
  const studentCount = course.student_materials?.length || 0

  const tabs = [
    { id: 'lectures', label: 'المحاضرات', count: courseLectures.length },
    { id: 'quizzes', label: 'الاختبارات', count: courseQuizzes.length },
    { id: 'settings', label: 'الإعدادات' },
  ]

  return (
    <div className="space-y-6">
      {ToastComponent}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/professor/courses" className="hover:text-primary-600">المقررات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{course.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: course.color || '#3B82F6' }}
            >
              {course.code?.slice(0, 2) || 'MA'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{course.code}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{studentCount} طالب</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{courseLectures.length} محاضرة</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAddLecture(true)}>
              <Upload className="w-4 h-4" />
              رفع محاضرة
            </Button>
            <Button onClick={() => setShowAddQuiz(true)}>
              <Plus className="w-4 h-4" />
              إنشاء اختبار
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="lectures" onChange={setActiveTab} />

      {/* Lectures Tab */}
      {activeTab === 'lectures' && (
        <div className="space-y-3">
          {courseLectures.length > 0 ? courseLectures.map((lecture, index) => (
            <Link
              key={lecture.id}
              to={`/professor/courses/${course.id}/lectures/${lecture.id}`}
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
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {lecture.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(lecture.date)}</span>
                      </div>
                    )}
                    {lecture.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{lecture.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </Card>
            </Link>
          )) : (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد محاضرات بعد</p>
            </Card>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-3">
          {courseQuizzes.length > 0 ? courseQuizzes.map((quiz) => (
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
                  <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                  <Badge variant={quiz.type === 'online' ? 'info' : 'purple'}>
                    {quiz.type === 'online' ? 'إلكتروني' : 'حضوري'}
                  </Badge>
                  {quiz.is_published
                    ? <Badge variant="success">منشور</Badge>
                    : <Badge variant="default">مسودة</Badge>
                  }
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{quiz.duration} دقيقة</span>
                  <span>•</span>
                  <span>{quiz.points} نقطة</span>
                  {quiz.due_date && (
                    <>
                      <span>•</span>
                      <span>{formatDate(quiz.due_date)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePublishQuiz(quiz.id, !quiz.is_published)}
                  title={quiz.is_published ? 'إلغاء النشر' : 'نشر الاختبار'}
                >
                  {quiz.is_published
                    ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    : <Eye className="w-4 h-4 text-green-600" />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )) : (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد اختبارات بعد</p>
            </Card>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>إعدادات المقرر</CardTitle>
              <Button onClick={handleSaveSettings} disabled={savingSettings}>
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ التغييرات
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المقرر</label>
                <Input
                  value={courseSettings.name}
                  onChange={(e) => setCourseSettings({ ...courseSettings, name: e.target.value })}
                  placeholder="اسم المقرر"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رمز المقرر</label>
                <Input
                  value={courseSettings.code}
                  onChange={(e) => setCourseSettings({ ...courseSettings, code: e.target.value })}
                  placeholder="رمز المقرر"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Lecture Modal */}
      {showAddLecture && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>رفع محاضرة جديدة</CardTitle>
                <button onClick={() => { setShowAddLecture(false); setLectureFiles([]) }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان المحاضرة *</label>
                <Input
                  placeholder="أدخل عنوان المحاضرة"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ</label>
                  <Input
                    type="date"
                    value={newLecture.date}
                    onChange={(e) => setNewLecture({ ...newLecture, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوقت</label>
                  <Input
                    type="time"
                    value={newLecture.time}
                    onChange={(e) => setNewLecture({ ...newLecture, time: e.target.value })}
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مواد المحاضرة (PDF, فيديو, ملفات)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.zip,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">اضغط لاختيار الملفات أو اسحبها هنا</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word, PowerPoint, فيديو, صور</p>
                </button>

                {lectureFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {lectureFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button onClick={() => removeFile(index)} className="p-1 hover:bg-gray-200 rounded">
                          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { setShowAddLecture(false); setLectureFiles([]) }}>إلغاء</Button>
                <Button onClick={handleCreateLecture} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  رفع المحاضرة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Quiz Modal */}
      {showAddQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {quizStep === 1 ? 'إنشاء اختبار جديد' : `إضافة الأسئلة (${quizQuestions.length} سؤال)`}
                </CardTitle>
                <button onClick={() => { setShowAddQuiz(false); setQuizStep(1); setQuizQuestions([emptyQuestion()]) }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Step indicator */}
              {newQuiz.type === 'online' && (
                <div className="flex items-center gap-2 mt-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${quizStep === 1 ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <span>1</span>
                    <span>معلومات الاختبار</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-300" />
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${quizStep === 2 ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <span>2</span>
                    <span>الأسئلة والإجابات</span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Quiz Details */}
              {quizStep === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان الاختبار *</label>
                    <Input
                      placeholder="أدخل عنوان الاختبار"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الاختبار</label>
                    <Select
                      value={newQuiz.type}
                      onChange={(e) => setNewQuiz({ ...newQuiz, type: e.target.value })}
                    >
                      <option value="online">إلكتروني (أسئلة وإجابات)</option>
                      <option value="offline">حضوري</option>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المدة (دقيقة)</label>
                      <Input
                        type="number"
                        value={newQuiz.duration}
                        onChange={(e) => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) || 20 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عدد المحاولات</label>
                      <Input
                        type="number"
                        min="1"
                        value={newQuiz.max_attempts}
                        onChange={(e) => setNewQuiz({ ...newQuiz, max_attempts: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                    </div>
                  </div>
                  {newQuiz.type === 'offline' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النقاط</label>
                      <Input
                        type="number"
                        value={newQuiz.points}
                        onChange={(e) => setNewQuiz({ ...newQuiz, points: parseInt(e.target.value) || 50 })}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الموعد النهائي</label>
                    <Input
                      type="datetime-local"
                      value={newQuiz.due_date}
                      onChange={(e) => setNewQuiz({ ...newQuiz, due_date: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={() => { setShowAddQuiz(false); setQuizStep(1); setQuizQuestions([emptyQuestion()]) }}>إلغاء</Button>
                    {newQuiz.type === 'online' ? (
                      <Button onClick={() => {
                        if (!newQuiz.title.trim()) {
                          showToast('يرجى إدخال عنوان الاختبار', 'warning')
                          return
                        }
                        setQuizStep(2)
                      }}>
                        التالي: إضافة الأسئلة
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleCreateQuiz} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        إنشاء الاختبار
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Questions Builder */}
              {quizStep === 2 && (
                <>
                  <div className="space-y-6">
                    {quizQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">السؤال {qIndex + 1}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500 dark:text-gray-400">النقاط:</label>
                              <Input
                                type="number"
                                value={q.points}
                                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                                className="w-16 !py-1 text-sm text-center"
                                min="1"
                              />
                            </div>
                            <button
                              onClick={() => removeQuestion(qIndex)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Input
                            placeholder="نص السؤال"
                            value={q.question_text}
                            onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                          />

                          <div className="space-y-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">الخيارات (اضغط على الخيار لتحديده كإجابة صحيحة):</label>
                            {q.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (option.trim()) {
                                      updateQuestion(qIndex, 'correct_answer', option)
                                    }
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    q.correct_answer === option && option.trim()
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-300 hover:border-green-400'
                                  }`}
                                >
                                  {q.correct_answer === option && option.trim() && (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  )}
                                </button>
                                <Input
                                  placeholder={`الخيار ${oIndex + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    // If this was the correct answer, update it
                                    if (q.correct_answer === option && option.trim()) {
                                      updateQuestion(qIndex, 'correct_answer', e.target.value)
                                    }
                                    updateOption(qIndex, oIndex, e.target.value)
                                  }}
                                  className="flex-1"
                                />
                                <button
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(qIndex)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              إضافة خيار
                            </button>
                          </div>

                          {q.correct_answer && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">الإجابة الصحيحة: {q.correct_answer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addQuestion}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة سؤال جديد
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      إجمالي النقاط: <strong>{quizQuestions.reduce((sum, q) => sum + (q.points || 1), 0)}</strong> نقطة
                      &nbsp;•&nbsp; عدد الأسئلة: <strong>{quizQuestions.length}</strong>
                    </p>
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setQuizStep(1)}>
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </Button>
                    <Button onClick={handleCreateQuiz} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      إنشاء الاختبار
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
