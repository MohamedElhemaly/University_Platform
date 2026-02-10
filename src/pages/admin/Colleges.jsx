import { useState, useEffect } from 'react'
import {
  Building2,
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
import { Input } from '../../components/ui/Input'
import { adminService } from '../../services/supabaseService'

export function AdminColleges() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddDeptModal, setShowAddDeptModal] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [newCollege, setNewCollege] = useState({
    name: '',
    code: '',
    departments: [''],
  })
  const [newDepartment, setNewDepartment] = useState('')

  const handleAddDepartmentToNew = () => {
    setNewCollege({ ...newCollege, departments: [...newCollege.departments, ''] })
  }

  const handleDepartmentChange = (index, value) => {
    const updated = [...newCollege.departments]
    updated[index] = value
    setNewCollege({ ...newCollege, departments: updated })
  }

  const handleRemoveDepartment = (index) => {
    const updated = newCollege.departments.filter((_, i) => i !== index)
    setNewCollege({ ...newCollege, departments: updated })
  }

  const handleAddEditDepartment = () => {
    if (!selectedCollege) return
    const currentDepts = selectedCollege.departments || []
    setSelectedCollege({ ...selectedCollege, departments: [...currentDepts, ''] })
  }

  const handleEditDepartmentChange = (index, value) => {
    if (!selectedCollege) return
    const updated = [...(selectedCollege.departments || [])]
    updated[index] = value
    setSelectedCollege({ ...selectedCollege, departments: updated })
  }

  const handleRemoveEditDepartment = (index) => {
    if (!selectedCollege) return
    const updated = (selectedCollege.departments || []).filter((_, i) => i !== index)
    setSelectedCollege({ ...selectedCollege, departments: updated })
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const collegesData = await adminService.getColleges()
      setColleges(collegesData)
    } catch (error) {
      console.error('Error loading colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredColleges = colleges.filter((college) =>
    college.name.includes(searchQuery) || college.code.includes(searchQuery)
  )

  const handleAddCollege = async () => {
    try {
      setSaving(true)
      await adminService.createCollege({
        name: newCollege.name,
        code: newCollege.code
      })
      await loadData()
      setShowAddModal(false)
      setNewCollege({ name: '', code: '', departments: [''] })
    } catch (error) {
      console.error('Error creating college:', error)
      alert('حدث خطأ أثناء إنشاء الكلية: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditCollege = (college) => {
    setSelectedCollege({ ...college })
    setShowEditModal(true)
  }

  const handleUpdateCollege = async () => {
    try {
      setSaving(true)
      await adminService.updateCollege(selectedCollege.id, {
        name: selectedCollege.name,
        code: selectedCollege.code
      })
      await loadData()
      setShowEditModal(false)
      setSelectedCollege(null)
    } catch (error) {
      console.error('Error updating college:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddDepartment = async (collegeId) => {
    if (!newDepartment.trim()) return
    try {
      setSaving(true)
      await adminService.createDepartment({
        college_id: collegeId,
        name: newDepartment
      })
      await loadData()
      setNewDepartment('')
      setShowAddDeptModal(false)
    } catch (error) {
      console.error('Error adding department:', error)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الكليات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إنشاء وإدارة الكليات والأقسام</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          إضافة كلية جديدة
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="البحث عن كلية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      {/* Colleges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredColleges.map((college) => (
          <Card key={college.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{college.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{college.code}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleEditCollege(college)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>الأقسام</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{college.departments?.length || 0}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الأقسام</p>
              <div className="flex flex-wrap gap-1">
                {college.departments?.length > 0 ? college.departments.map((dept) => (
                  <Badge key={dept.id} variant="secondary" className="text-xs">
                    {dept.name}
                  </Badge>
                )) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">لا توجد أقسام</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add College Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة كلية جديدة</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الكلية</label>
                <Input
                  placeholder="مثال: كلية الطب"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رمز الكلية</label>
                <Input
                  placeholder="مثال: MED"
                  value={newCollege.code}
                  onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الأقسام</label>
                  <Button variant="ghost" size="sm" onClick={handleAddDepartmentToNew}>
                    <Plus className="w-4 h-4" />
                    إضافة قسم
                  </Button>
                </div>
                <div className="space-y-2">
                  {newCollege.departments.map((dept, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="اسم القسم"
                        value={dept}
                        onChange={(e) => handleDepartmentChange(index, e.target.value)}
                      />
                      {newCollege.departments.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDepartment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddCollege}
                  disabled={!newCollege.name || !newCollege.code}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الكلية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit College Modal */}
      {showEditModal && selectedCollege && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعديل الكلية</CardTitle>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الكلية</label>
                <Input
                  value={selectedCollege.name}
                  onChange={(e) => setSelectedCollege({ ...selectedCollege, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رمز الكلية</label>
                <Input
                  value={selectedCollege.code}
                  onChange={(e) => setSelectedCollege({ ...selectedCollege, code: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الأقسام</label>
                  <Button variant="ghost" size="sm" onClick={handleAddEditDepartment}>
                    <Plus className="w-4 h-4" />
                    إضافة قسم
                  </Button>
                </div>
                <div className="space-y-2">
                  {(selectedCollege.departments || []).map((dept, index) => (
                    <div key={dept.id || index} className="flex items-center gap-2">
                      <Input
                        value={typeof dept === 'string' ? dept : dept.name}
                        onChange={(e) => handleEditDepartmentChange(index, e.target.value)}
                        disabled={typeof dept !== 'string'}
                      />
                      {(selectedCollege.departments || []).length > 1 && typeof dept === 'string' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEditDepartment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateCollege} className="bg-green-600 hover:bg-green-700">
                  حفظ التعديلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
