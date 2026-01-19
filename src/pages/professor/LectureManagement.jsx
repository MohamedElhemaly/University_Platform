import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  Pin,
  CheckCircle2,
  Send,
  Trash2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Textarea } from '../../components/ui/Input'
import { lectureDetail, questions } from '../../data/mockData'
import { formatDate, getRelativeTime } from '../../lib/utils'

export function LectureManagement() {
  const { courseId, lectureId } = useParams()
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [summary, setSummary] = useState(lectureDetail.aiSummary)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const lecture = lectureDetail

  const handleSaveSummary = () => {
    setIsEditingSummary(false)
  }

  const handleReply = (questionId) => {
    setReplyingTo(null)
    setReplyText('')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/professor/courses" className="hover:text-primary-600">المقررات</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/professor/courses/${courseId}`} className="hover:text-primary-600">
          {lecture.subjectName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{lecture.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{lecture.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatDate(lecture.date)}</span>
          <span>•</span>
          <span>{lecture.time}</span>
          <span>•</span>
          <span>{lecture.duration}</span>
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
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4" />
                  إضافة ملف
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lecture.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
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
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <CardTitle>ملخص المحاضرة بالذكاء الاصطناعي</CardTitle>
                </div>
                {!isEditingSummary ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)}>
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSaveSummary}>
                    <Save className="w-4 h-4" />
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
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <div className="whitespace-pre-wrap">{summary}</div>
                </div>
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
                <Badge variant="info">{questions.length} سؤال</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className={`p-4 rounded-xl ${q.isPinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <Avatar name={q.studentName} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{q.studentName}</span>
                        <span className="text-xs text-gray-400">{getRelativeTime(q.timestamp)}</span>
                        {q.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <p className="text-gray-700 mb-3">{q.question}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default">
                          <ThumbsUp className="w-3 h-3 ml-1" />
                          {q.votes} صوت
                        </Badge>
                      </div>

                      {q.answer ? (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">{q.answeredBy}</span>
                          </div>
                          <p className="text-sm text-green-700">{q.answer}</p>
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
                                <Button size="sm" onClick={() => handleReply(q.id)}>
                                  <Send className="w-4 h-4" />
                                  إرسال الرد
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => setReplyingTo(q.id)}>
                                الرد على السؤال
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Pin className="w-4 h-4" />
                                تثبيت
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">المشاهدات</span>
                <span className="font-bold text-gray-900">42</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">الأسئلة</span>
                <span className="font-bold text-gray-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">أسئلة بدون رد</span>
                <span className="font-bold text-orange-600">{questions.filter(q => !q.answer).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">إتمام الاختبار</span>
                <span className="font-bold text-gray-900">78%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="w-4 h-4" />
                إعادة توليد الملخص
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                إنشاء اختبار من المحاضرة
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200">
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
