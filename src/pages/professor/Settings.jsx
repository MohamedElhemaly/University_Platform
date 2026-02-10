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
import { professorService } from '../../services/supabaseService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

export function ProfessorSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [notifications, setNotifications] = useState({
    studentQuestions: true,
    submissions: true,
    reminders: true,
    system: false,
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (user?.id) {
      loadSettings()
    }
  }, [user])

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

  const loadSettings = async () => {
    try {
      const settings = await professorService.getSettings(user.id)
      if (settings) {
        setNotifications({
          studentQuestions: settings.student_questions ?? true,
          submissions: settings.submissions ?? true,
          reminders: settings.reminders ?? true,
          system: settings.system_notifications ?? false,
        })
        if (settings.theme) {
          setTheme(settings.theme)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      // Update name in profiles table
      await professorService.updateProfile(user.id, { name: profileData.name })
      // Update email via Supabase Auth
      const { error } = await supabase.auth.updateUser({ email: profileData.email })
      if (error) throw error
      alert('تم حفظ التغييرات بنجاح')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('حدث خطأ أثناء حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      await professorService.updateSettings(user.id, {
        student_questions: notifications.studentQuestions,
        submissions: notifications.submissions,
        reminders: notifications.reminders,
        system_notifications: notifications.system,
      })
      alert('تم حفظ إعدادات الإشعارات بنجاح')
    } catch (error) {
      console.error('Error saving notifications:', error)
      alert('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      await professorService.updateSettings(user.id, {
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

  const handleChangePassword = async () => {
    if (!passwordData.newPassword) {
      alert('يرجى إدخال كلمة المرور الجديدة')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    try {
      setSaving(true)
      await professorService.changePassword(passwordData.newPassword)
      setPasswordData({ newPassword: '', confirmPassword: '' })
      alert('تم تغيير كلمة المرور بنجاح')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setSaving(false)
    }
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
                      ? 'bg-green-50 text-green-700'
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
                      <Avatar name={profileData.name} size="lg" className="w-24 h-24 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{profileData.name}</h3>
                      <p className="text-sm text-gray-500">{profileData.email}</p>
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
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                      <Input
                        value={profileData.email}
                        type="email"
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                    <Input
                      value={profileData.phone}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نبذة شخصية</label>
                    <Textarea
                      rows={3}
                      value={profileData.bio}
                      disabled
                    />
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
                      <Input defaultValue={user?.colleges?.name || ''} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                      <Input defaultValue={user?.departments?.name || ''} disabled />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة العلمية</label>
                    <Input defaultValue={user?.title || ''} disabled />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ التغييرات
                </Button>
              </div>
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
                    { key: 'studentQuestions', label: 'أسئلة الطلاب', desc: 'عند طرح سؤال جديد' },
                    { key: 'submissions', label: 'تسليمات الطلاب', desc: 'عند تسليم اختبار أو مشروع' },
                    { key: 'reminders', label: 'تذكيرات المحاضرات', desc: 'تذكير بمواعيد المحاضرات' },
                    { key: 'system', label: 'تحديثات النظام', desc: 'ميزات وتحديثات جديدة' },
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
                          notifications[item.key] ? 'bg-green-600' : 'bg-gray-300'
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
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveNotifications} disabled={saving}>
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
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                    <Input
                      type="password"
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleChangePassword} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    تغيير كلمة المرور
                  </Button>
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
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSavePreferences} disabled={saving}>
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
