import { useState, useEffect } from 'react'
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { studentService } from '../../services/supabaseService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import { formatDate } from '../../lib/utils'

export function StudentSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' })
  const [loginHistory, setLoginHistory] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [notifications, setNotifications] = useState({
    quizReminders: true,
    gradeAlerts: true,
    announcements: true,
    activities: false,
  })

  useEffect(() => {
    if (user?.id) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const [settings, history] = await Promise.all([
        studentService.getSettings(user.id),
        studentService.getLoginHistory(user.id)
      ])
      if (settings) {
        setNotifications({
          quizReminders: settings.quiz_reminders ?? true,
          gradeAlerts: settings.grade_alerts ?? true,
          announcements: settings.announcement_notifications ?? true,
          activities: settings.activity_notifications ?? false,
        })
        if (settings.theme) {
          setTheme(settings.theme)
        }
      }
      setLoginHistory(history || [])
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (passwordForm.new.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    try {
      setChangingPassword(true)
      await studentService.changePassword(passwordForm.new)
      setPasswordForm({ new: '', confirm: '' })
      alert('تم تغيير كلمة المرور بنجاح')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      await studentService.updateSettings(user.id, {
        quiz_reminders: notifications.quizReminders,
        grade_alerts: notifications.gradeAlerts,
        announcement_notifications: notifications.announcements,
        activity_notifications: notifications.activities,
      })
    } catch (error) {
      console.error('Error saving notifications:', error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      await studentService.updateSettings(user.id, {
        theme: theme,
        language: 'ar',
        timezone: 'africa_cairo',
      })
      alert('تم حفظ التفضيلات بنجاح')
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('حدث خطأ أثناء حفظ التفضيلات')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'preferences', label: 'التفضيلات', icon: Palette },
  ]

  const handleNotificationChange = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إدارة حسابك وتفضيلاتك</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>الصورة الشخصية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar name={user?.name || ''} size="lg" className="w-24 h-24 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user?.name || ''}</h3>
                      <p className="text-sm text-gray-500">{user?.email || ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                      <Input value={user?.name || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                      <Input value={user?.email || ''} type="email" disabled />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الجامعي</label>
                    <Input value={user?.student_id || ''} disabled />
                  </div>
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الأكاديمية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الكلية</label>
                      <Input value={user?.colleges?.name || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                      <Input value={user?.departments?.name || ''} disabled />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المستوى</label>
                      <Input value={user?.year || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الفصل الدراسي</label>
                      <Input value={user?.semesters?.name || ''} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">أنواع الإشعارات</h3>
                  
                  {[
                    { key: 'quizReminders', label: 'تذكيرات الاختبارات', desc: 'تذكير قبل موعد الاختبار' },
                    { key: 'gradeAlerts', label: 'تنبيهات الدرجات', desc: 'عند رصد درجة جديدة' },
                    { key: 'announcements', label: 'الإعلانات', desc: 'إعلانات المواد والجامعة' },
                    { key: 'activities', label: 'الأنشطة والفرص', desc: 'فعاليات وفرص تدريبية جديدة' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(item.key)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative',
                          notifications[item.key] ? 'bg-primary-600' : 'bg-gray-300'
                        )}
                      >
                        <span className={cn(
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                          notifications[item.key] ? 'right-1' : 'left-1'
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ الإشعارات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>الأمان وكلمة المرور</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="أدخل كلمة المرور الجديدة"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                    <Input type="password" placeholder="أعد إدخال كلمة المرور الجديدة" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    <Lock className="w-4 h-4" />
                    {changingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                  </Button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">سجل تسجيل الدخول</h3>
                  <div className="space-y-3">
                    {loginHistory.length > 0 ? loginHistory.map((session, index) => (
                      <div key={session.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{session.device || session.user_agent || 'جهاز غير معروف'}</p>
                          <p className="text-sm text-gray-500">{session.ip_address || ''} • {formatDate(session.created_at)}</p>
                        </div>
                        {index === 0 ? (
                          <span className="text-sm text-green-600 font-medium">الجلسة الحالية</span>
                        ) : null}
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm text-center py-4">لا يوجد سجل تسجيل دخول</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>التفضيلات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
                  <Select value="ar" disabled>
                    <option value="ar">العربية</option>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ التفضيلات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
