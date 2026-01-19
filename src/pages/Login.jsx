import { useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">منصة التعلم الجامعية</h1>
          <p className="text-gray-600">نظام إدارة التعلم الذكي</p>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            اختر طريقة الدخول
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/student')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-gray-900">دخول كطالب</h3>
                  <p className="text-sm text-gray-500">الوصول إلى المحاضرات والاختبارات</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/professor')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-gray-900">دخول كأستاذ</h3>
                  <p className="text-sm text-gray-500">إدارة المقررات والطلاب</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              هذا عرض تجريبي للمنصة. البيانات المعروضة للتوضيح فقط.
            </p>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 منصة التعلم الجامعية. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  )
}
