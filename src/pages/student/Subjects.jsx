import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, FileText, ChevronLeft, Loader2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { getRelativeTime } from '../../lib/utils'

export function StudentSubjects() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadMaterials()
    }
  }, [user])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const data = await studentService.getMaterials(user.id)
      setMaterials(data || [])
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">المواد الدراسية</h1>
        <p className="text-gray-500 mt-1">الفصل الدراسي الحالي</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.length > 0 ? materials.map((material) => (
          <Link key={material.id} to={`/student/subjects/${material.id}`}>
            <Card className="h-full group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: material.color || '#3B82F6' }}
                  >
                    {material.code?.slice(0, 2) || 'MA'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {material.name}
                    </h3>
                    <p className="text-sm text-gray-500">{material.code}</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">{material.professorName || 'غير معين'}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{material.lectures?.[0]?.count || 0} محاضرة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{material.credits || 0} ساعات</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">التقدم</span>
                    <span className="font-medium text-gray-900">{material.lectures?.[0]?.count > 0 ? '0%' : '-'}</span>
                  </div>
                  <Progress value={0} max={material.lectures?.[0]?.count || 1} />
                </div>
              </div>
            </Card>
          </Link>
        )) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد مواد مسجلة بعد</p>
          </div>
        )}
      </div>
    </div>
  )
}
