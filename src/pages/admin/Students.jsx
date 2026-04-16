import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  BookOpen,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { adminService } from '../../services/supabaseService'

export function AdminStudents() {
  const [students, setStudents] = useState([])
  const [colleges, setColleges] = useState([])
  const [semesters, setSemesters] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCollege, setFilterCollege] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    email: '',
    collegeId: '',
    departmentId: '',
    year: 1,
    semesterId: 1,
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
      const semestersData = await adminService.getSemesters()
      setSemesters(semestersData)
    } catch (err) {
      console.error('Error loading semesters:', err)
    }
    try {
      const studentsData = await adminService.getStudents()
      setStudents(studentsData)
    } catch (err) {
      console.error('Error loading students:', err)
    }
    try {
      const materialsData = await adminService.getMaterials()
      setMaterials(materialsData)
    } catch (err) {
      console.error('Error loading materials:', err)
    }
    setLoading(false)
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredStudents = students.filter((student) => {
    const name = (student.profiles?.name || '').toLowerCase()
    const studentId = (student.student_id || '').toLowerCase()
    const email = (student.profiles?.email || '').toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      name.includes(normalizedSearch) ||
      studentId.includes(normalizedSearch) ||
      email.includes(normalizedSearch)
    const matchesCollege = filterCollege === 'all' || student.college_id === parseInt(filterCollege)
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesCollege && matchesStatus
  })

  const handleAddStudent = async () => {
    try {
      setSaving(true)
      const email = newStudent.email || `${newStudent.studentId}@university.edu`
      await adminService.createStudent({
        student_id: newStudent.studentId,
        name: newStudent.name,
        email: email,
        college_id: parseInt(newStudent.collegeId),
        department_id: parseInt(newStudent.departmentId),
        year: parseInt(newStudent.year),
        semester_id: parseInt(newStudent.semesterId)
      })
      await loadData()
      setShowAddModal(false)
      setNewStudent({
        studentId: '',
        name: '',
        email: '',
        collegeId: '',
        departmentId: '',
        year: 1,
        semesterId: 1,
      })
    } catch (error) {
      console.error('Error creating student:', error)
      alert('حدث خطأ أثناء إنشاء الطالب: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId)
      if (!student) return

      const newStatus = student.status === 'active' ? 'inactive' : 'active'
      await adminService.toggleStudentStatus(studentId, newStatus)
      setStudents((prevStudents) => prevStudents.map((s) => 
        s.id === studentId 
          ? { ...s, status: newStatus }
          : s
      ))
      await loadData()
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('حدث خطأ أثناء تحديث حالة الطالب: ' + error.message)
    }
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    try {
      setSaving(true)
      await adminService.deleteStudent(studentToDelete.id)
      setStudents((currentStudents) => currentStudents.filter((student) => student.id !== studentToDelete.id))
      setShowDeleteModal(false)
      setStudentToDelete(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('حدث خطأ أثناء حذف الطالب: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditStudent = (student) => {
    setSelectedStudent({
      id: student.id,
      studentId: student.student_id || '',
      name: student.profiles?.name || '',
      email: student.profiles?.email || '',
      collegeId: student.college_id || '',
      departmentId: student.department_id || '',
      year: student.year || 1,
      semesterId: student.semester_id || '',
      status: student.status || 'active',
    })
    setShowEditModal(true)
  }

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return

    try {
      setSaving(true)
      await Promise.all([
        adminService.updateStudent(selectedStudent.id, {
          student_id: selectedStudent.studentId,
          college_id: parseInt(selectedStudent.collegeId),
          department_id: parseInt(selectedStudent.departmentId),
          year: parseInt(selectedStudent.year),
          semester_id: parseInt(selectedStudent.semesterId),
          status: selectedStudent.status
        }),
        adminService.updateStudentProfile(selectedStudent.id, {
          name: selectedStudent.name,
          email: selectedStudent.email || `${selectedStudent.studentId}@university.edu`
        })
      ])
      await loadData()
      setShowEditModal(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error updating student:', error)
      alert('حدث خطأ أثناء تحديث الطالب: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignMaterials = (studentId) => {
    const student = students.find(s => s.id === studentId)
    setSelectedStudent({ 
      ...student, 
      assignedMaterials: student.student_materials?.map(sm => sm.material_id) || []
    })
    setShowAssignModal(true)
  }

  const handleToggleMaterial = (materialId) => {
    if (!selectedStudent) return
    const currentMaterials = selectedStudent.assignedMaterials || []
    const newMaterials = currentMaterials.includes(materialId)
      ? currentMaterials.filter(id => id !== materialId)
      : [...currentMaterials, materialId]
    
    setSelectedStudent({ ...selectedStudent, assignedMaterials: newMaterials })
  }

  const handleSaveAssignments = async () => {
    try {
      setSaving(true)
      const currentMaterials = selectedStudent.student_materials?.map(sm => sm.material_id) || []
      const newMaterials = selectedStudent.assignedMaterials

      // Materials to add
      const materialsToAdd = newMaterials.filter(id => !currentMaterials.includes(id))
      // Materials to remove
      const materialsToRemove = currentMaterials.filter(id => !newMaterials.includes(id))

      // Add new enrollments
      for (const materialId of materialsToAdd) {
        await adminService.enrollStudents(materialId, [selectedStudent.id])
      }

      // Remove old enrollments
      for (const materialId of materialsToRemove) {
        await adminService.unenrollStudent(materialId, selectedStudent.id)
      }

      await loadData()
      setShowAssignModal(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error saving assignments:', error)
      alert('حدث خطأ أثناء حفظ التعيينات: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedCollege = colleges.find(c => c.id === parseInt(newStudent.collegeId))

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الطلاب</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إنشاء وإدارة حسابات الطلاب وتعيينهم للمقررات</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          إضافة طالب جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو رقم الطالب..."
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
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </Select>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الطالب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">رقم الطالب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الكلية</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">السنة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">المقررات</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.profiles?.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{student.profiles?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{student.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{student.student_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900 dark:text-white">{student.colleges?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.departments?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">السنة {student.year}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{student.student_materials?.length || 0} مقرر</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                        {student.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                      {student.profiles?.is_first_login && (
                        <Badge variant="warning" className="mr-1">أول دخول</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          title="تعديل الطالب"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignMaterials(student.id)}
                          title="تعيين المقررات"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(student.id)}
                          title={student.status === 'active' ? 'تعطيل' : 'تفعيل'}
                        >
                          {student.status === 'active' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(student)}
                          title="حذف الطالب"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                      لا يوجد طلاب مسجلين بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة طالب جديد</CardTitle>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الطالب (ID)</label>
                <Input
                  placeholder="مثال: 30212191601582"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">سيستخدم الطالب هذا الرقم لتسجيل الدخول</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الطالب</label>
                <Input
                  placeholder="الاسم الكامل"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الكلية</label>
                <Select
                  value={newStudent.collegeId}
                  onChange={(e) => setNewStudent({ ...newStudent, collegeId: e.target.value, department: '' })}
                >
                  <option value="">اختر الكلية</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </Select>
              </div>
              {newStudent.collegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">القسم</label>
                  <Select
                    value={newStudent.departmentId}
                    onChange={(e) => setNewStudent({ ...newStudent, departmentId: e.target.value })}
                  >
                    <option value="">اختر القسم</option>
                    {colleges.find(c => c.id === parseInt(newStudent.collegeId))?.departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">السنة الدراسية</label>
                  <Select
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
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
                    value={newStudent.semesterId}
                    onChange={(e) => setNewStudent({ ...newStudent, semesterId: e.target.value })}
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ملاحظة:</strong> سيتمكن الطالب من تسجيل الدخول باستخدام رقم الطالب كاسم مستخدم وكلمة مرور. 
                  عند أول تسجيل دخول، سيُطلب منه تغيير كلمة المرور.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddStudent}
                  disabled={!newStudent.studentId || !newStudent.name || !newStudent.collegeId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الطالب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعديل الطالب</CardTitle>
                <button onClick={() => { setShowEditModal(false); setSelectedStudent(null) }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الطالب</label>
                <Input
                  value={selectedStudent.studentId}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, studentId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الطالب</label>
                <Input
                  value={selectedStudent.name}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={selectedStudent.email}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الكلية</label>
                <Select
                  value={selectedStudent.collegeId}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, collegeId: e.target.value, departmentId: '' })}
                >
                  <option value="">اختر الكلية</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </Select>
              </div>
              {selectedStudent.collegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">القسم</label>
                  <Select
                    value={selectedStudent.departmentId}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, departmentId: e.target.value })}
                  >
                    <option value="">اختر القسم</option>
                    {colleges.find(c => c.id === parseInt(selectedStudent.collegeId))?.departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">السنة الدراسية</label>
                  <Select
                    value={selectedStudent.year}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, year: e.target.value })}
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
                    value={selectedStudent.semesterId}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, semesterId: e.target.value })}
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الحالة</label>
                <Select
                  value={selectedStudent.status}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, status: e.target.value })}
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => { setShowEditModal(false); setSelectedStudent(null) }}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateStudent} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  حفظ التعديلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Materials Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعيين المقررات - {selectedStudent.name}</CardTitle>
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
                      checked={selectedStudent.assignedMaterials?.includes(material.id)}
                      onChange={() => handleToggleMaterial(material.id)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{material.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{material.code} - {material.professors?.profiles?.name || 'غير معين'}</p>
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
                <Button onClick={handleSaveAssignments} className="bg-green-600 hover:bg-green-700">
                  حفظ التعيينات
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <CardTitle className="text-red-600">تأكيد حذف الطالب</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                هل أنت متأكد أنك تريد حذف الطالب <span className="font-bold">{studentToDelete.profiles?.name}</span> نهائياً؟
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                سيتم حذف كافة البيانات المرتبطة بالطالب بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setStudentToDelete(null) }}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  تأكيد الحذف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
