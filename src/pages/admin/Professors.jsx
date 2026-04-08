import { useState, useEffect } from 'react'
import {
  GraduationCap,
  Search,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { adminService } from '../../services/supabaseService'

export function AdminProfessors() {
  const [professors, setProfessors] = useState([])
  const [colleges, setColleges] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCollege, setFilterCollege] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [newProfessor, setNewProfessor] = useState({
    professorId: '',
    name: '',
    email: '',
    collegeId: '',
    departmentId: '',
    title: 'أستاذ مساعد',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const collegesData = await adminService.getColleges()
      setColleges(collegesData)
    } catch (err) {
      console.error('Error loading colleges:', err)
    }
    try {
      const professorsData = await adminService.getProfessors()
      setProfessors(professorsData)
    } catch (err) {
      console.error('Error loading professors:', err)
    }
    try {
      const materialsData = await adminService.getMaterials()
      setMaterials(materialsData)
    } catch (err) {
      console.error('Error loading materials:', err)
    }
    setLoading(false)
  }

  const filteredProfessors = professors.filter((professor) => {
    const name = professor.profiles?.name || ''
    const profId = professor.professor_id || ''
    const email = professor.profiles?.email || ''
    const matchesSearch =
      name.includes(searchQuery) ||
      profId.includes(searchQuery) ||
      email.includes(searchQuery)
    const matchesCollege = filterCollege === 'all' || professor.college_id === parseInt(filterCollege)
    return matchesSearch && matchesCollege
  })

  const handleAddProfessor = async () => {
    try {
      setSaving(true)
      await adminService.createProfessor({
        professor_id: newProfessor.professorId,
        name: newProfessor.name,
        email: newProfessor.email,
        college_id: parseInt(newProfessor.collegeId),
        department_id: parseInt(newProfessor.departmentId),
        title: newProfessor.title
      })
      await loadData()
      setShowAddModal(false)
      setNewProfessor({
        professorId: '',
        name: '',
        email: '',
        collegeId: '',
        departmentId: '',
        title: 'أستاذ مساعد',
      })
    } catch (error) {
      console.error('Error creating professor:', error)
      alert('حدث خطأ أثناء إنشاء الأستاذ: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (professorId) => {
    try {
      const professor = professors.find(p => p.id === professorId)
      const newStatus = professor.status === 'active' ? 'inactive' : 'active'
      await adminService.updateProfessor(professorId, { status: newStatus })
      setProfessors(professors.map(p => 
        p.id === professorId 
          ? { ...p, status: newStatus }
          : p
      ))
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const handleEditProfessor = (professor) => {
    setSelectedProfessor({
      id: professor.id,
      professorId: professor.professor_id || '',
      name: professor.profiles?.name || '',
      email: professor.profiles?.email || '',
      collegeId: professor.college_id || '',
      departmentId: professor.department_id || '',
      title: professor.title || 'أستاذ مساعد',
      status: professor.status || 'active',
      assignedMaterials: materials.filter((material) => material.professor_id === professor.id).map((material) => material.id),
    })
    setShowEditModal(true)
  }

  const handleUpdateProfessor = async () => {
    if (!selectedProfessor) return

    try {
      setSaving(true)
      await Promise.all([
        adminService.updateProfessor(selectedProfessor.id, {
          professor_id: selectedProfessor.professorId,
          college_id: parseInt(selectedProfessor.collegeId),
          department_id: parseInt(selectedProfessor.departmentId),
          title: selectedProfessor.title,
          status: selectedProfessor.status
        }),
        adminService.updateProfessorProfile(selectedProfessor.id, {
          name: selectedProfessor.name,
          email: selectedProfessor.email
        })
      ])

      const assignedMaterials = selectedProfessor.assignedMaterials || []
      const currentlyAssigned = materials.filter((material) => material.professor_id === selectedProfessor.id).map((material) => material.id)

      for (const materialId of currentlyAssigned.filter((id) => !assignedMaterials.includes(id))) {
        await adminService.assignProfessor(materialId, null)
      }

      for (const materialId of assignedMaterials.filter((id) => !currentlyAssigned.includes(id))) {
        await adminService.assignProfessor(materialId, selectedProfessor.id)
      }

      await loadData()
      setShowEditModal(false)
      setSelectedProfessor(null)
    } catch (error) {
      console.error('Error updating professor:', error)
      alert('حدث خطأ أثناء تحديث الأستاذ: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignMaterials = (professorId) => {
    const professor = professors.find(p => p.id === professorId)
    setSelectedProfessor({
      ...professor,
      name: professor?.profiles?.name || '',
      assignedMaterials: materials.filter((material) => material.professor_id === professorId).map((material) => material.id)
    })
    setShowAssignModal(true)
  }

  const handleToggleMaterial = (materialId) => {
    if (!selectedProfessor) return
    const currentMaterials = selectedProfessor.assignedMaterials || []
    const newMaterials = currentMaterials.includes(materialId)
      ? currentMaterials.filter(id => id !== materialId)
      : [...currentMaterials, materialId]
    
    setSelectedProfessor({ ...selectedProfessor, assignedMaterials: newMaterials })
  }

  const handleSaveAssignments = async () => {
    if (!selectedProfessor) return

    try {
      setSaving(true)
      const assignedMaterials = selectedProfessor.assignedMaterials || []
      const currentlyAssigned = materials.filter((material) => material.professor_id === selectedProfessor.id).map((material) => material.id)

      for (const materialId of currentlyAssigned.filter((id) => !assignedMaterials.includes(id))) {
        await adminService.assignProfessor(materialId, null)
      }

      for (const materialId of assignedMaterials.filter((id) => !currentlyAssigned.includes(id))) {
        await adminService.assignProfessor(materialId, selectedProfessor.id)
      }

      await loadData()
      setShowAssignModal(false)
      setSelectedProfessor(null)
    } catch (error) {
      console.error('Error saving assignments:', error)
      alert('حدث خطأ أثناء حفظ تعيين المقررات: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedCollege = colleges.find(c => c.id === parseInt(newProfessor.collegeId))

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الأساتذة</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إنشاء وإدارة حسابات الأساتذة وتعيينهم للمقررات</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          إضافة أستاذ جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو الرقم الوظيفي..."
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
        </div>
      </Card>

      {/* Professors Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الأستاذ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الرقم الوظيفي</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الكلية / القسم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الدرجة العلمية</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">المقررات</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProfessors.length > 0 ? filteredProfessors.map((professor) => (
                  <tr key={professor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={professor.profiles?.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{professor.profiles?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{professor.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{professor.professor_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900 dark:text-white">{professor.colleges?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{professor.departments?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{professor.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">0 مقرر</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={professor.status === 'active' ? 'success' : 'secondary'}>
                        {professor.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProfessor(professor)}
                          title="تعديل الأستاذ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignMaterials(professor.id)}
                          title="تعيين المقررات"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(professor.id)}
                          title={professor.status === 'active' ? 'تعطيل' : 'تفعيل'}
                        >
                          {professor.status === 'active' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                      لا يوجد أساتذة مسجلين بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Professor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة أستاذ جديد</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الرقم الوظيفي</label>
                <Input
                  placeholder="مثال: PROF006"
                  value={newProfessor.professorId}
                  onChange={(e) => setNewProfessor({ ...newProfessor, professorId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الأستاذ</label>
                <Input
                  placeholder="الاسم الكامل مع اللقب"
                  value={newProfessor.name}
                  onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                <Input
                  type="email"
                  placeholder="example@university.edu"
                  value={newProfessor.email}
                  onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الكلية</label>
                <Select
                  value={newProfessor.collegeId}
                  onChange={(e) => setNewProfessor({ ...newProfessor, collegeId: e.target.value, department: '' })}
                >
                  <option value="">اختر الكلية</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </Select>
              </div>
              {newProfessor.collegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">القسم</label>
                  <Select
                    value={newProfessor.departmentId}
                    onChange={(e) => setNewProfessor({ ...newProfessor, departmentId: e.target.value })}
                  >
                    <option value="">اختر القسم</option>
                    {colleges.find(c => c.id === parseInt(newProfessor.collegeId))?.departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الدرجة العلمية</label>
                <Select
                  value={newProfessor.title}
                  onChange={(e) => setNewProfessor({ ...newProfessor, title: e.target.value })}
                >
                  <option value="أستاذ مساعد">أستاذ مساعد</option>
                  <option value="أستاذ مشارك">أستاذ مشارك</option>
                  <option value="أستاذ">أستاذ</option>
                </Select>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ملاحظة:</strong> سيتمكن الأستاذ من تسجيل الدخول باستخدام البريد الإلكتروني كاسم مستخدم وكلمة مرور.
                  سيُطلب منه تغيير كلمة المرور عند أول دخول.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddProfessor}
                  disabled={!newProfessor.professorId || !newProfessor.name || !newProfessor.email || !newProfessor.collegeId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الأستاذ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditModal && selectedProfessor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعديل الأستاذ</CardTitle>
                <button onClick={() => { setShowEditModal(false); setSelectedProfessor(null) }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الرقم الوظيفي</label>
                <Input value={selectedProfessor.professorId} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, professorId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الأستاذ</label>
                <Input value={selectedProfessor.name} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                <Input type="email" value={selectedProfessor.email} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الكلية</label>
                <Select value={selectedProfessor.collegeId} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, collegeId: e.target.value, departmentId: '' })}>
                  <option value="">اختر الكلية</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </Select>
              </div>
              {selectedProfessor.collegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">القسم</label>
                  <Select value={selectedProfessor.departmentId} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, departmentId: e.target.value })}>
                    <option value="">اختر القسم</option>
                    {colleges.find(c => c.id === parseInt(selectedProfessor.collegeId))?.departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الدرجة العلمية</label>
                  <Select value={selectedProfessor.title} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, title: e.target.value })}>
                    <option value="أستاذ مساعد">أستاذ مساعد</option>
                    <option value="أستاذ مشارك">أستاذ مشارك</option>
                    <option value="أستاذ">أستاذ</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الحالة</label>
                  <Select value={selectedProfessor.status} onChange={(e) => setSelectedProfessor({ ...selectedProfessor, status: e.target.value })}>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => { setShowEditModal(false); setSelectedProfessor(null) }}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateProfessor} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  حفظ التعديلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Materials Modal */}
      {showAssignModal && selectedProfessor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعيين المقررات - {selectedProfessor.name}</CardTitle>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {materials.map((material) => (
                  <label
                    key={material.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProfessor.assignedMaterials?.includes(material.id)}
                      onChange={() => handleToggleMaterial(material.id)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{material.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{material.code} - السنة {material.year} - {material.colleges?.name || ''}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveAssignments} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  حفظ التعيينات
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
