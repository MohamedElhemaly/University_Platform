import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  FileText,
  Video,
  Download,
  Edit3,
  Save,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  Send,
  Trash2,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Textarea } from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { professorService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, getRelativeTime } from '../../lib/utils'

export function LectureManagement() {
  const { courseId, lectureId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()
  const fileInputRef = useRef(null)
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [summary, setSummary] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (lectureId) loadLecture()
  }, [lectureId])

  const loadLecture = async () => {
    try {
      setLoading(true)
      const data = await professorService.getLectureDetail(lectureId)
      setLecture(data)
      setSummary(data.ai_summary || '')
    } catch (error) {
      console.error('Error loading lecture:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSummary = async () => {
    try {
      setSaving(true)
      await professorService.updateLecture(lectureId, { ai_summary: summary })
      setIsEditingSummary(false)
    } catch (error) {
      console.error('Error saving summary:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReply = async (questionId) => {
    if (!replyText.trim()) return
    try {
      setSaving(true)
      await professorService.answerQuestion(user.id, questionId, replyText)
      setReplyingTo(null)
      setReplyText('')
      await loadLecture()
    } catch (error) {
      console.error('Error answering question:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLecture = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) return
    try {
      await professorService.deleteLecture(lectureId)
      navigate(`/professor/courses/${courseId}`)
    } catch (error) {
      console.error('Error deleting lecture:', error)
    }
  }

  const handleUploadFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      setUploading(true)
      for (const file of files) {
        const fileType = file.name.endsWith('.pdf') ? 'pdf'
          : file.type.startsWith('video/') ? 'video'
          : 'other'
        await professorService.uploadMaterial(lectureId, file, {
          name: file.name,
          type: fileType
        })
      }
      showToast(`تم رفع ${files.length} ملف بنجاح`, 'success')
      await loadLecture()
    } catch (error) {
      console.error('Error uploading files:', error)
      showToast('حدث خطأ أثناء رفع الملفات', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return
    try {
      await professorService.deleteLectureMaterial(materialId)
      showToast('تم حذف الملف بنجاح', 'success')
      await loadLecture()
    } catch (error) {
      console.error('Error deleting material:', error)
      showToast('حدث خطأ أثناء حذف الملف', 'error')
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
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على المحاضرة</p>
      </div>
    )
  }

  const lectureMaterials = lecture.lecture_materials || []
  const lectureQuestions = lecture.lecture_questions || []
  const unansweredCount = lectureQuestions.filter(q => !q.answer_text).length

  return (
    <div className="space-y-6">
      {ToastComponent}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.zip,.png,.jpg,.jpeg"
        onChange={handleUploadFiles}
        className="hidden"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link to="/professor/courses" className="hover:text-primary-600">المقررات</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/professor/courses/${courseId}`} className="hover:text-primary-600">
          {lecture.materials?.name || 'المقرر'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{lecture.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lecture.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {lecture.date && <span>{formatDate(lecture.date)}</span>}
          {lecture.time && (
            <>
              <span>•</span>
              <span>{lecture.time}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>مواد المحاضرة</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  رفع ملف
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lectureMaterials.length > 0 ? lectureMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    material.type === 'pdf' ? 'bg-red-100' : material.type === 'video' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {material.type === 'video' ? (
                      <Video className="w-5 h-5 text-purple-600" />
                    ) : (
                      <FileText className={`w-5 h-5 ${material.type === 'pdf' ? 'text-red-600' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{material.file_size || ''}</p>
                  </div>
                  {material.file_url && (
                    <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد مواد مرفوعة بعد</p>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <CardTitle>ملخص المحاضرة</CardTitle>
                </div>
                {!isEditingSummary ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)}>
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSaveSummary} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingSummary ? (
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              ) : summary ? (
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                  <div className="whitespace-pre-wrap">{summary}</div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا يوجد ملخص بعد. انقر على تعديل لإضافة ملخص.</p>
              )}
            </CardContent>
          </Card>

          {/* Student Questions */}
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
              {lectureQuestions.length > 0 ? lectureQuestions.map((q) => {
                const studentName = q.students?.profiles?.name || 'طالب'
                const answeredByName = q.professors?.profiles?.name || ''

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-start gap-3">
                      <Avatar name={studentName} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{studentName}</span>
                          <span className="text-xs text-gray-400">{getRelativeTime(q.created_at)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{q.question_text}</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="default">
                            <ThumbsUp className="w-3 h-3 ml-1" />
                            {q.votes || 0} صوت
                          </Badge>
                        </div>

                        {q.answer_text ? (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{answeredByName}</span>
                            </div>
                            <p className="text-sm text-green-700">{q.answer_text}</p>
                          </div>
                        ) : (
                          <>
                            {replyingTo === q.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="اكتب إجابتك..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="secondary" size="sm" onClick={() => setReplyingTo(null)}>
                                    إلغاء
                                  </Button>
                                  <Button size="sm" onClick={() => handleReply(q.id)} disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    إرسال الرد
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setReplyingTo(q.id)}>
                                الرد على السؤال
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد أسئلة بعد</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات المحاضرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">الأسئلة</span>
                <span className="font-bold text-gray-900 dark:text-white">{lectureQuestions.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">أسئلة بدون رد</span>
                <span className="font-bold text-orange-600">{unansweredCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">المواد المرفقة</span>
                <span className="font-bold text-gray-900 dark:text-white">{lectureMaterials.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200"
                onClick={handleDeleteLecture}
              >
                <Trash2 className="w-4 h-4" />
                حذف المحاضرة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
