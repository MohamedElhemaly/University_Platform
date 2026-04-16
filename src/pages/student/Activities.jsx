import { useState, useEffect } from 'react'
import {
  Calendar,
  Briefcase,
  BookOpen,
  Headphones,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Filter,
  Plus,
  X,
  Send,
  AlertCircle,
  Loader2,
  Link2,
  Trash2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, getRelativeTime } from '../../lib/utils'

const ensureAbsoluteUrl = (url) => {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: null },
  { id: 'event', label: 'فعاليات', icon: Calendar },
  { id: 'internship', label: 'تدريب', icon: Briefcase },
  { id: 'course', label: 'دورات', icon: BookOpen },
  { id: 'podcast', label: 'بودكاست', icon: Headphones },
  { id: 'tool', label: 'أدوات', icon: Wrench },
]

const ACTIVITY_TYPES = [
  { id: 'event', label: 'فعالية' },
  { id: 'workshop', label: 'ورشة عمل' },
  { id: 'course', label: 'دورة' },
  { id: 'competition', label: 'مسابقة' },
  { id: 'club', label: 'نادي' },
  { id: 'volunteering', label: 'تطوع' },
]

export function StudentActivities() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('all')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [activities, setActivities] = useState([])
  const [myActivities, setMyActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    category: 'event',
    date: '',
    time: '',
    location: '',
    link: '',
    imageFile: null,
    imagePreview: null,
  })

  useEffect(() => {
    loadActivities()
  }, [user])

  const revokeImagePreview = (previewUrl) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const resetNewActivity = () => {
    revokeImagePreview(newActivity.imagePreview)
    setNewActivity({
      title: '',
      description: '',
      category: 'event',
      date: '',
      time: '',
      location: '',
      link: '',
      imageFile: null,
      imagePreview: null,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    revokeImagePreview(newActivity.imagePreview)
    const previewUrl = URL.createObjectURL(file)

    e.target.value = ''
    setNewActivity({
      ...newActivity,
      imageFile: file,
      imagePreview: previewUrl,
    })
  }

  const handleRemoveImage = () => {
    revokeImagePreview(newActivity.imagePreview)
    setNewActivity({
      ...newActivity,
      imageFile: null,
      imagePreview: null,
    })
  }

  const loadActivities = async () => {
    try {
      setLoading(true)
      const [approvedData, myData] = await Promise.all([
        studentService.getActivities(),
        user?.id ? studentService.getMyActivities(user.id) : Promise.resolve([])
      ])
      setActivities(approvedData || [])
      setMyActivities(myData || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(a => a.category === activeFilter)

  const handleSubmitActivity = async () => {
    if (!user?.id) return
    try {
      setSubmitting(true)
      let imageUrl = null

      if (newActivity.imageFile) {
        try {
          imageUrl = await studentService.uploadActivityImage(newActivity.imageFile)
        } catch (imgError) {
          console.error('Image upload failed, continuing without image:', imgError)
          imageUrl = null
        }
      }

      await studentService.submitActivity(user.id, {
        title: newActivity.title,
        description: newActivity.description,
        category: newActivity.category,
        date: newActivity.date || null,
        time: newActivity.time || null,
        location: newActivity.location || null,
        link: newActivity.link || null,
        image_url: imageUrl || null,
      })
      setShowSubmitModal(false)
      resetNewActivity()
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      await loadActivities()
    } catch (error) {
      console.error('Error submitting activity:', error)
      alert('حدث خطأ أثناء إرسال النشاط: ' + (error.message || 'خطأ غير معروف'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteActivity = async (activityId) => {
    try {
      setDeleting(true)
      await studentService.deleteActivity(activityId)
      setMyActivities((current) => current.filter((activity) => activity.id !== activityId))
      setActivities((current) => current.filter((activity) => activity.id !== activityId))
      setDeleteConfirm(null)
      await loadActivities()
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('حدث خطأ أثناء حذف النشاط: ' + (error.message || 'خطأ غير معروف'))
    } finally {
      setDeleting(false)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'event': return Calendar
      case 'internship': return Briefcase
      case 'course': return BookOpen
      case 'podcast': return Headphones
      case 'tool': return Wrench
      default: return Calendar
    }
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'event': return <Badge variant="info">فعالية</Badge>
      case 'internship': return <Badge variant="success">تدريب</Badge>
      case 'course': return <Badge variant="purple">دورة</Badge>
      case 'podcast': return <Badge variant="warning">بودكاست</Badge>
      case 'tool': return <Badge variant="default">أداة</Badge>
      default: return <Badge>{category}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingActivities = myActivities.filter(a => a.status === 'pending')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الأنشطة والفرص</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">فعاليات ودورات وفرص تدريبية معتمدة من الجامعة</p>
        </div>
        <Button onClick={() => setShowSubmitModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          اقتراح نشاط
        </Button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">تم إرسال اقتراحك بنجاح!</p>
            <p className="text-sm text-green-600">سيتم مراجعته من قبل الإدارة وإعلامك بالنتيجة.</p>
          </div>
        </div>
      )}

      {/* My Submitted Activities */}
      {pendingActivities.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Send className="w-4 h-4" />
            اقتراحاتي المقدمة
          </h3>
          <div className="space-y-2">
            {pendingActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date ? formatDate(activity.date) : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">
                    <Clock className="w-3 h-3 ml-1" />
                    قيد المراجعة
                  </Badge>
                  <button
                    onClick={() => setDeleteConfirm(activity.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="حذف النشاط"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeFilter === cat.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.icon && <cat.icon className="w-4 h-4" />}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((activity) => {
          const Icon = getIcon(activity.category)
          
          return (
            <Card key={activity.id} className="group flex flex-col h-full">
              {/* Activity image */}
              <div className="mb-4">
                {activity.image_url ? (
                  <div className="relative mx-auto aspect-[16/10] w-full max-w-[280px] overflow-hidden rounded-[24px] border border-primary-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 shadow-[0_20px_50px_-30px_rgba(250,204,21,0.35)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_45%)]" />
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#151515]">
                      <img
                        src={ensureAbsoluteUrl(activity.image_url)}
                        alt={activity.title}
                        className="max-h-[88%] max-w-[78%] object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex aspect-[16/10] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-[24px] border border-primary-500/10 bg-[#151515]">
                    <Icon className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryBadge(activity.category)}
                  {activity.status === 'approved' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">معتمد</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{activity.description}</p>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  {activity.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {activity.link ? (
                  <a href={ensureAbsoluteUrl(activity.link)} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                      التسجيل
                    </Button>
                  </a>
                ) : (
                  <Button className="w-full" variant="outline" size="sm" disabled>
                    <ExternalLink className="w-4 h-4" />
                    {activity.category === 'internship' ? 'تقديم طلب' : 
                     activity.category === 'event' ? 'التسجيل' :
                     activity.category === 'course' ? 'الالتحاق' : 'فتح'}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filteredActivities.length === 0 && (
        <Card className="p-12 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا توجد نتائج</h3>
          <p className="text-gray-500 dark:text-gray-400">جرب تغيير الفلتر لرؤية المزيد من الأنشطة</p>
        </Card>
      )}

      {/* Submit Activity Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>اقتراح نشاط جديد</CardTitle>
                <button onClick={() => { resetNewActivity(); setShowSubmitModal(false) }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  سيتم مراجعة اقتراحك من قبل الإدارة. في حال الموافقة، سيظهر لجميع طلاب نفس الفصل الدراسي.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان النشاط</label>
                <Input
                  placeholder="مثال: ورشة تطوير تطبيقات الموبايل"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وصف النشاط</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                  placeholder="اكتب وصفاً تفصيلياً للنشاط المقترح..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">صورة النشاط</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">اختر صورة توضيحية للنشاط. يمكنك تعديلها أو حذفها قبل الإرسال.</p>
                <div className="space-y-3">
                  <label htmlFor="activityImage" className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 border border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span>اختر صورة للنشاط</span>
                    <input
                      id="activityImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {newActivity.imageFile && (
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>{newActivity.imageFile.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </div>
                  )}

                  {newActivity.imagePreview && (
                    <div className="relative w-full h-48 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img
                        src={newActivity.imagePreview}
                        alt="معاينة صورة النشاط"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 left-2 rounded-full bg-white/90 text-gray-700 p-1 shadow-sm hover:bg-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع النشاط</label>
                <Select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ المقترح</label>
                  <Input
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوقت</label>
                  <Input
                    type="time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المكان المقترح</label>
                <Input
                  placeholder="مثال: معمل الحاسب 3"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رابط التسجيل (اختياري)</label>
                <div className="relative">
                  <Input
                    placeholder="https://example.com/register"
                    value={newActivity.link}
                    onChange={(e) => setNewActivity({ ...newActivity, link: e.target.value })}
                    className="pl-9"
                  />
                  <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => { resetNewActivity(); setShowSubmitModal(false) }}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmitActivity}
                  disabled={!newActivity.title || !newActivity.description || !newActivity.date || submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'جاري الإرسال...' : 'إرسال الاقتراح'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>تأكيد الحذف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  هل أنت متأكد من رغبتك في حذف هذا النشاط؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => handleDeleteActivity(deleteConfirm)}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'جاري الحذف...' : 'حذف'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

