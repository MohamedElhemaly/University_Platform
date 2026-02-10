import { useState, useEffect } from 'react'
import {
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Megaphone,
  MapPin,
  User,
  Filter,
  Loader2,
  Edit3,
  Link2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { adminService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

export function AdminActivities() {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [colleges, setColleges] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [editActivity, setEditActivity] = useState(null)
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    category: 'event',
    date: '',
    time: '',
    location: '',
    link: '',
    showAsBanner: false,
    targetCollege: '',
    targetYear: '',
    targetSemester: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pendingData, approvedData, collegesData, semestersData] = await Promise.all([
        adminService.getActivities('pending'),
        adminService.getActivities('approved'),
        adminService.getColleges(),
        adminService.getSemesters()
      ])
      setPending(pendingData)
      setApproved(approvedData)
      setColleges(collegesData)
      setSemesters(semestersData)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryLabels = {
    event: 'فعالية',
    workshop: 'ورشة عمل',
    course: 'دورة',
    competition: 'مسابقة',
    club: 'نادي',
    volunteering: 'تطوع',
  }

  const categoryColors = {
    event: 'info',
    workshop: 'warning',
    course: 'success',
    competition: 'danger',
    club: 'secondary',
    volunteering: 'info',
  }

  const handleApprove = async (activityId) => {
    try {
      setSaving(true)
      await adminService.approveActivity(activityId, user?.id)
      await loadData()
    } catch (error) {
      console.error('Error approving activity:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async (activityId) => {
    try {
      setSaving(true)
      await adminService.rejectActivity(activityId, 'مرفوض من قبل المدير')
      await loadData()
    } catch (error) {
      console.error('Error rejecting activity:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleViewDetail = (activity) => {
    setSelectedActivity(activity)
    setShowDetailModal(true)
  }

  const handleAddActivity = async () => {
    try {
      setSaving(true)
      await adminService.createActivity(user?.id, {
        title: newActivity.title,
        description: newActivity.description,
        category: newActivity.category,
        date: newActivity.date,
        time: newActivity.time,
        location: newActivity.location,
        link: newActivity.link || null,
        show_as_banner: newActivity.showAsBanner,
        target_college_id: newActivity.targetCollege ? parseInt(newActivity.targetCollege) : null,
        target_year: newActivity.targetYear ? parseInt(newActivity.targetYear) : null,
        target_semester_id: newActivity.targetSemester ? parseInt(newActivity.targetSemester) : null,
      })
      await loadData()
      setShowAddModal(false)
      setNewActivity({
        title: '',
        description: '',
        category: 'event',
        date: '',
        time: '',
        location: '',
        link: '',
        showAsBanner: false,
        targetCollege: '',
        targetYear: '',
        targetSemester: '',
      })
    } catch (error) {
      console.error('Error creating activity:', error)
      alert('حدث خطأ أثناء إنشاء النشاط: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenEditModal = (activity) => {
    setEditActivity({
      id: activity.id,
      title: activity.title || '',
      description: activity.description || '',
      category: activity.category || 'event',
      date: activity.date || '',
      time: activity.time || '',
      location: activity.location || '',
      link: activity.link || '',
      showAsBanner: activity.show_as_banner || false,
      targetCollege: activity.target_college_id || '',
      targetYear: activity.target_year || '',
      targetSemester: activity.target_semester_id || '',
    })
    setShowEditModal(true)
  }

  const handleUpdateActivity = async () => {
    if (!editActivity) return
    
    try {
      setSaving(true)
      await adminService.updateActivity(editActivity.id, {
        title: editActivity.title,
        description: editActivity.description,
        category: editActivity.category,
        date: editActivity.date,
        time: editActivity.time,
        location: editActivity.location,
        link: editActivity.link || null,
        show_as_banner: editActivity.showAsBanner,
        target_college_id: editActivity.targetCollege ? parseInt(editActivity.targetCollege) : null,
        target_year: editActivity.targetYear ? parseInt(editActivity.targetYear) : null,
        target_semester_id: editActivity.targetSemester ? parseInt(editActivity.targetSemester) : null,
      })
      await loadData()
      setShowEditModal(false)
      setEditActivity(null)
    } catch (error) {
      console.error('Error updating activity:', error)
      alert('حدث خطأ أثناء تحديث النشاط: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const tabs = [
    { id: 'pending', label: 'بانتظار الموافقة', count: pending.length },
    { id: 'approved', label: 'الأنشطة المعتمدة', count: approved.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الأنشطة</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">مراجعة طلبات الأنشطة وإنشاء أنشطة جديدة</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          إنشاء نشاط جديد
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
            <Badge variant={tab.id === 'pending' ? 'warning' : 'success'} className="mr-2">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Pending Activities */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">لا توجد أنشطة بانتظار الموافقة</p>
            </Card>
          ) : (
            pending.map((activity) => (
              <Card key={activity.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={categoryColors[activity.category]}>
                        {categoryLabels[activity.category]}
                      </Badge>
                      <Badge variant="warning">بانتظار الموافقة</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{activity.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{activity.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{activity.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{activity.location}</span>
                      </div>
                    </div>

                    {activity.students?.profiles?.name && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Avatar name={activity.students.profiles.name} size="xs" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        مقدم من: <strong>{activity.students.profiles.name}</strong>
                      </span>
                      <span className="text-xs text-gray-400">
                        ({activity.students.student_id})
                      </span>
                    </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(activity.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      موافقة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(activity)}
                    >
                      <Eye className="w-4 h-4" />
                      تفاصيل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(activity.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      رفض
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Approved Activities */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approved.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={categoryColors[activity.category]}>
                      {categoryLabels[activity.category]}
                    </Badge>
                    {activity.showAsBanner && (
                      <Badge variant="info">
                        <Megaphone className="w-3 h-3 ml-1" />
                        يظهر كإعلان
                      </Badge>
                    )}
                    {activity.isAdminCreated && (
                      <Badge variant="secondary">من الإدارة</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{activity.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{activity.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                  </div>

                  {activity.targetCollege && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {activity.targetCollege} - السنة {activity.targetYear}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(activity)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetail(activity)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Activity Modal */}
      {showEditModal && editActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعديل النشاط</CardTitle>
                <button onClick={() => { setShowEditModal(false); setEditActivity(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان النشاط</label>
                <Input
                  placeholder="عنوان النشاط"
                  value={editActivity.title}
                  onChange={(e) => setEditActivity({ ...editActivity, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="وصف تفصيلي للنشاط"
                  value={editActivity.description}
                  onChange={(e) => setEditActivity({ ...editActivity, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع النشاط</label>
                <Select
                  value={editActivity.category}
                  onChange={(e) => setEditActivity({ ...editActivity, category: e.target.value })}
                >
                  <option value="event">فعالية</option>
                  <option value="workshop">ورشة عمل</option>
                  <option value="course">دورة</option>
                  <option value="competition">مسابقة</option>
                  <option value="club">نادي</option>
                  <option value="volunteering">تطوع</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ</label>
                  <Input
                    type="date"
                    value={editActivity.date}
                    onChange={(e) => setEditActivity({ ...editActivity, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوقت</label>
                  <Input
                    type="time"
                    value={editActivity.time}
                    onChange={(e) => setEditActivity({ ...editActivity, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المكان</label>
                <Input
                  placeholder="مكان النشاط"
                  value={editActivity.location}
                  onChange={(e) => setEditActivity({ ...editActivity, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رابط التسجيل (اختياري)</label>
                <div className="relative">
                  <Input
                    placeholder="https://example.com/register"
                    value={editActivity.link}
                    onChange={(e) => setEditActivity({ ...editActivity, link: e.target.value })}
                    className="pl-9"
                  />
                  <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">استهداف الجمهور (اختياري)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">الكلية</label>
                    <Select
                      value={editActivity.targetCollege}
                      onChange={(e) => setEditActivity({ ...editActivity, targetCollege: e.target.value })}
                    >
                      <option value="">جميع الكليات</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>{college.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">السنة</label>
                    <Select
                      value={editActivity.targetYear}
                      onChange={(e) => setEditActivity({ ...editActivity, targetYear: e.target.value })}
                    >
                      <option value="">جميع السنوات</option>
                      <option value="1">السنة الأولى</option>
                      <option value="2">السنة الثانية</option>
                      <option value="3">السنة الثالثة</option>
                      <option value="4">السنة الرابعة</option>
                      <option value="5">السنة الخامسة</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <input
                  type="checkbox"
                  id="editShowAsBanner"
                  checked={editActivity.showAsBanner}
                  onChange={(e) => setEditActivity({ ...editActivity, showAsBanner: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label htmlFor="editShowAsBanner" className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>إظهار كإعلان رئيسي</strong>
                  <p className="text-xs text-gray-500 dark:text-gray-400">سيظهر هذا النشاط كبانر في لوحة تحكم الطلاب</p>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditActivity(null); }}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdateActivity}
                  disabled={!editActivity.title || !editActivity.date || saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إنشاء نشاط جديد</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان النشاط</label>
                <Input
                  placeholder="عنوان النشاط"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="وصف تفصيلي للنشاط"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع النشاط</label>
                <Select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                >
                  <option value="event">فعالية</option>
                  <option value="workshop">ورشة عمل</option>
                  <option value="course">دورة</option>
                  <option value="competition">مسابقة</option>
                  <option value="club">نادي</option>
                  <option value="volunteering">تطوع</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المكان</label>
                <Input
                  placeholder="مكان النشاط"
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

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">استهداف الجمهور (اختياري)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">الكلية</label>
                    <Select
                      value={newActivity.targetCollege}
                      onChange={(e) => setNewActivity({ ...newActivity, targetCollege: e.target.value })}
                    >
                      <option value="">جميع الكليات</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.name}>{college.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">السنة</label>
                    <Select
                      value={newActivity.targetYear}
                      onChange={(e) => setNewActivity({ ...newActivity, targetYear: e.target.value })}
                    >
                      <option value="">جميع السنوات</option>
                      <option value="1">السنة الأولى</option>
                      <option value="2">السنة الثانية</option>
                      <option value="3">السنة الثالثة</option>
                      <option value="4">السنة الرابعة</option>
                      <option value="5">السنة الخامسة</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showAsBanner"
                  checked={newActivity.showAsBanner}
                  onChange={(e) => setNewActivity({ ...newActivity, showAsBanner: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label htmlFor="showAsBanner" className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>إظهار كإعلان رئيسي</strong>
                  <p className="text-xs text-gray-500 dark:text-gray-400">سيظهر هذا النشاط كبانر في لوحة تحكم الطلاب</p>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddActivity}
                  disabled={!newActivity.title || !newActivity.date}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء النشاط
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تفاصيل النشاط</CardTitle>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={categoryColors[selectedActivity.category]}>
                  {categoryLabels[selectedActivity.category]}
                </Badge>
                {selectedActivity.status === 'pending' && (
                  <Badge variant="warning">بانتظار الموافقة</Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{selectedActivity.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedActivity.description}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedActivity.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{selectedActivity.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedActivity.location}</span>
                </div>
                {selectedActivity.link && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Link2 className="w-4 h-4" />
                    <a href={selectedActivity.link} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline truncate">
                      {selectedActivity.link}
                    </a>
                  </div>
                )}
              </div>

              {selectedActivity.students?.profiles?.name && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مقدم الطلب</p>
                  <div className="flex items-center gap-2">
                    <Avatar name={selectedActivity.students.profiles.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedActivity.students.profiles.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedActivity.students.student_id}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedActivity.targetCollege && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الجمهور المستهدف</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedActivity.targetCollege} - السنة {selectedActivity.targetYear}
                  </p>
                </div>
              )}

              {selectedActivity.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleReject(selectedActivity.id)
                      setShowDetailModal(false)
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    رفض
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedActivity.id)
                      setShowDetailModal(false)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    موافقة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
