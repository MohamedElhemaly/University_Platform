import { useState, useEffect } from 'react'
import {
  BookOpen,
  Search,
  Plus,
  Edit3,
  Users,
  GraduationCap,
  X,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { adminService } from '../../services/supabaseService'

export function AdminMaterials() {
  const [materials, setMaterials] = useState([])
  const [colleges, setColleges] = useState([])
  const [semesters, setSemesters] = useState([])
  const [professors, setProfessors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCollege, setFilterCollege] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    code: '',
    name: '',
    collegeId: '',
    departmentId: '',
    year: 1,
    semesterId: 1,
    credits: 3,
    professorId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [materialsData, collegesData, semestersData, professorsData] = await Promise.all([
        adminService.getMaterials(),
        adminService.getColleges(),
        adminService.getSemesters(),
        adminService.getProfessors()
      ])
      setMaterials(materialsData)
      setColleges(collegesData)
      setSemesters(semestersData)
      setProfessors(professorsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name?.includes(searchQuery) ||
      material.code?.includes(searchQuery)
    const matchesCollege = filterCollege === 'all' || material.college_id === parseInt(filterCollege)
    const matchesYear = filterYear === 'all' || material.year === parseInt(filterYear)
    return matchesSearch && matchesCollege && matchesYear
  })

  const handleAddMaterial = async () => {
    try {
      setSaving(true)
      await adminService.createMaterial({
        code: newMaterial.code,
        name: newMaterial.name,
        college_id: parseInt(newMaterial.collegeId),
        department_id: parseInt(newMaterial.departmentId),
        year: parseInt(newMaterial.year),
        semester_id: parseInt(newMaterial.semesterId),
        credits: parseInt(newMaterial.credits),
        professor_id: newMaterial.professorId ? newMaterial.professorId : null,
        status: 'active'
      })
      await loadData()
      setShowAddModal(false)
      setNewMaterial({
        code: '',
        name: '',
        collegeId: '',
        departmentId: '',
        year: 1,
        semesterId: 1,
        credits: 3,
        professorId: '',
      })
    } catch (error) {
      console.error('Error creating material:', error)
      alert('حدث خطأ أثناء إنشاء المقرر: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedCollege = colleges.find(c => c.id === parseInt(newMaterial.collegeId))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المقررات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إنشاء وإدارة المقررات الدراسية</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          إضافة مقرر جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو الرمز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Select value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)}>
            <option value="all">جميع الكليات</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>{college.name}</option>
            ))}
          </Select>
          <Select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="all">جميع السنوات</option>
            <option value="1">السنة الأولى</option>
            <option value="2">السنة الثانية</option>
            <option value="3">السنة الثالثة</option>
            <option value="4">السنة الرابعة</option>
            <option value="5">السنة الخامسة</option>
          </Select>
        </div>
      </Card>

      {/* Materials Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">المقرر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الرمز</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الكلية / القسم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">السنة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الأستاذ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الطلاب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الساعات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.length > 0 ? filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{material.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{material.code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900 dark:text-white">{material.colleges?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{material.departments?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">السنة {material.year}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{material.professors?.profiles?.name || 'غير معين'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>0</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{material.credits} ساعات</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                      لا توجد مقررات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة مقرر جديد</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رمز المقرر</label>
                  <Input
                    placeholder="مثال: CS306"
                    value={newMaterial.code}
                    onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عدد الساعات</label>
                  <Select
                    value={newMaterial.credits}
                    onChange={(e) => setNewMaterial({ ...newMaterial, credits: e.target.value })}
                  >
                    <option value={1}>1 ساعة</option>
                    <option value={2}>2 ساعة</option>
                    <option value={3}>3 ساعات</option>
                    <option value={4}>4 ساعات</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المقرر</label>
                <Input
                  placeholder="اسم المقرر"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الكلية</label>
                <Select
                  value={newMaterial.collegeId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, collegeId: e.target.value, department: '' })}
                >
                  <option value="">اختر الكلية</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </Select>
              </div>
              {newMaterial.collegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">القسم</label>
                  <Select
                    value={newMaterial.departmentId}
                    onChange={(e) => setNewMaterial({ ...newMaterial, departmentId: e.target.value })}
                  >
                    <option value="">اختر القسم</option>
                    {colleges.find(c => c.id === parseInt(newMaterial.collegeId))?.departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">السنة الدراسية</label>
                  <Select
                    value={newMaterial.year}
                    onChange={(e) => setNewMaterial({ ...newMaterial, year: e.target.value })}
                  >
                    <option value={1}>السنة الأولى</option>
                    <option value={2}>السنة الثانية</option>
                    <option value={3}>السنة الثالثة</option>
                    <option value={4}>السنة الرابعة</option>
                    <option value={5}>السنة الخامسة</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الفصل الدراسي</label>
                  <Select
                    value={newMaterial.semesterId}
                    onChange={(e) => setNewMaterial({ ...newMaterial, semesterId: e.target.value })}
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الأستاذ المسؤول</label>
                <Select
                  value={newMaterial.professorId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, professorId: e.target.value })}
                >
                  <option value="">غير معين</option>
                  {professors.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.profiles?.name || prof.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddMaterial}
                  disabled={!newMaterial.code || !newMaterial.name || !newMaterial.collegeId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  إضافة المقرر
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
