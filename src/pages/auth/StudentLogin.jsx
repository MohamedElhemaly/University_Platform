import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'

export function StudentLogin() {
  const navigate = useNavigate()
  const { loginStudent, changePassword } = useAuth()
  const [credentials, setCredentials] = useState({ studentId: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' })
  const [studentData, setStudentData] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!credentials.studentId || !credentials.password) {
        throw new Error('يرجى إدخال جميع البيانات')
      }

      const response = await loginStudent(credentials.studentId, credentials.password)

      if (response.requirePasswordChange) {
        setStudentData(response)
        setShowChangePassword(true)
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ في تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (newPassword.password !== newPassword.confirm) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    setIsLoading(true)
    try {
      await changePassword(studentData.email, newPassword.password, 'student')
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.message || 'حدث خطأ في تغيير كلمة المرور')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">بوابة الطالب</h1>
          <p className="text-gray-600 dark:text-gray-400">منصة التعلم الجامعية</p>
        </div>

        <Card className="p-6">
          {!showChangePassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3 mb-6 p-3 bg-primary-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">تسجيل دخول الطالب</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الوصول إلى المحاضرات والاختبارات</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رقم الطالب
                </label>
                <Input
                  type="text"
                  placeholder="مثال: 30212191601582"
                  value={credentials.studentId}
                  onChange={(e) => setCredentials({ ...credentials, studentId: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="رقم الطالب (أول مرة)"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 p-3 rounded-lg">
                <strong>ملاحظة:</strong> إذا كانت هذه أول مرة تسجل دخولك، استخدم رقم الطالب كاسم مستخدم وكلمة مرور.
              </p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isLoading || !credentials.studentId || !credentials.password}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                تغيير كلمة المرور
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                مرحباً {studentData?.user?.name || 'طالب'}، يرجى تعيين كلمة مرور جديدة
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور الجديدة</label>
                <Input
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تأكيد كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={newPassword.confirm}
                  onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || !newPassword.password || !newPassword.confirm}
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ وتسجيل الدخول'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © 2026 منصة التعلم الجامعية. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  )
}
