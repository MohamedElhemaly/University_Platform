import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Users, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'

export function ProfessorLogin() {
  const navigate = useNavigate()
  const { loginProfessor, changePassword } = useAuth()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' })
  const [professorData, setProfessorData] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('يرجى إدخال جميع البيانات')
      }

      const response = await loginProfessor(credentials.email, credentials.password)

      if (response.requirePasswordChange) {
        setProfessorData(response)
        setShowChangePassword(true)
      } else {
        navigate('/professor/dashboard')
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
      await changePassword(professorData.email, newPassword.password, 'professor')
      navigate('/professor/dashboard')
    } catch (err) {
      setError(err.message || 'حدث خطأ في تغيير كلمة المرور')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">بوابة الأستاذ</h1>
          <p className="text-gray-600 dark:text-gray-400">منصة التعلم الجامعية</p>
        </div>

        <Card className="p-6">
          {!showChangePassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3 mb-6 p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">تسجيل دخول الأستاذ</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">إدارة المقررات والطلاب</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  placeholder="example@university.edu"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="البريد الإلكتروني (أول مرة)"
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

              <p className="text-xs text-gray-500 dark:text-gray-400 bg-green-50 p-3 rounded-lg">
                <strong>ملاحظة:</strong> إذا كانت هذه أول مرة تسجل دخولك، استخدم البريد الإلكتروني كاسم مستخدم وكلمة مرور.
              </p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || !credentials.email || !credentials.password}
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
                مرحباً {professorData?.user?.name || 'أستاذ'}، يرجى تعيين كلمة مرور جديدة
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
