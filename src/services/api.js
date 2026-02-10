/**
 * API Service - Central API configuration and request handling
 * This file provides a consistent interface for all backend API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token')
  }

  // Get current user type
  getUserType() {
    return localStorage.getItem('userType')
  }

  // Set auth data after login
  setAuthData(token, userType, userData) {
    localStorage.setItem('token', token)
    localStorage.setItem('userType', userType)
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  // Clear auth data on logout
  clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('userData')
  }

  // Get stored user data
  getUserData() {
    const data = localStorage.getItem('userData')
    return data ? JSON.parse(data) : null
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken()
  }

  // Build headers for requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }
    if (includeAuth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`
    }
    return headers
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (response.status === 401) {
        // Token expired or invalid
        this.clearAuthData()
        window.location.href = '/student/login'
        throw new Error('غير مصرح - يرجى تسجيل الدخول مرة أخرى')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الطلب')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }

  // File upload
  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {}
    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في رفع الملف')
      }

      return data
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }
}

// Create singleton instance
const api = new ApiService()

export default api

// ===========================================
// AUTH API ENDPOINTS
// ===========================================
export const authApi = {
  // Student login
  studentLogin: (credentials) => 
    api.post('/auth/student/login', credentials, { auth: false }),
  
  // Professor login
  professorLogin: (credentials) => 
    api.post('/auth/professor/login', credentials, { auth: false }),
  
  // Admin login
  adminLogin: (credentials) => 
    api.post('/auth/admin/login', credentials, { auth: false }),
  
  // Change password (first login)
  changePassword: (data) => 
    api.post('/auth/change-password', data),
  
  // Logout
  logout: () => {
    api.clearAuthData()
  },
  
  // Get current user profile
  getProfile: () => 
    api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (data) => 
    api.put('/auth/profile', data),
}

// ===========================================
// STUDENT API ENDPOINTS
// ===========================================
export const studentApi = {
  // Dashboard
  getDashboard: () => 
    api.get('/student/dashboard'),
  
  // Subjects
  getSubjects: () => 
    api.get('/student/subjects'),
  
  getSubjectById: (id) => 
    api.get(`/student/subjects/${id}`),
  
  // Lectures
  getLecture: (subjectId, lectureId) => 
    api.get(`/student/subjects/${subjectId}/lectures/${lectureId}`),
  
  markLectureComplete: (subjectId, lectureId) => 
    api.post(`/student/subjects/${subjectId}/lectures/${lectureId}/complete`),
  
  // Calendar
  getCalendar: (params) => 
    api.get('/student/calendar', { params }),
  
  // Activities
  getActivities: (filters) => 
    api.get('/student/activities', { params: filters }),
  
  submitActivity: (data) => 
    api.post('/student/activities', data),
  
  getMySubmittedActivities: () => 
    api.get('/student/activities/my-submissions'),
  
  // Points & Leaderboard
  getPoints: () => 
    api.get('/student/points'),
  
  getLeaderboard: () => 
    api.get('/student/leaderboard'),
  
  // Resources
  getResources: (filters) => 
    api.get('/student/resources', { params: filters }),
  
  toggleFavoriteResource: (resourceId) => 
    api.post(`/student/resources/${resourceId}/favorite`),
  
  downloadResource: (resourceId) => 
    api.get(`/student/resources/${resourceId}/download`),
  
  // Notifications
  getNotifications: () => 
    api.get('/student/notifications'),
  
  markNotificationRead: (id) => 
    api.patch(`/student/notifications/${id}/read`),
  
  markAllNotificationsRead: () => 
    api.patch('/student/notifications/read-all'),
  
  // Settings
  getSettings: () => 
    api.get('/student/settings'),
  
  updateSettings: (data) => 
    api.put('/student/settings', data),
  
  updatePassword: (data) => 
    api.put('/student/settings/password', data),
  
  // Quizzes
  getQuiz: (quizId) => 
    api.get(`/student/quizzes/${quizId}`),
  
  submitQuiz: (quizId, answers) => 
    api.post(`/student/quizzes/${quizId}/submit`, { answers }),
  
  getQuizResult: (quizId) => 
    api.get(`/student/quizzes/${quizId}/result`),
}

// ===========================================
// PROFESSOR API ENDPOINTS
// ===========================================
export const professorApi = {
  // Dashboard
  getDashboard: () => 
    api.get('/professor/dashboard'),
  
  // Courses
  getCourses: () => 
    api.get('/professor/courses'),
  
  getCourseById: (id) => 
    api.get(`/professor/courses/${id}`),
  
  updateCourse: (id, data) => 
    api.put(`/professor/courses/${id}`, data),
  
  // Lectures
  getLectures: (courseId) => 
    api.get(`/professor/courses/${courseId}/lectures`),
  
  getLecture: (courseId, lectureId) => 
    api.get(`/professor/courses/${courseId}/lectures/${lectureId}`),
  
  createLecture: (courseId, data) => 
    api.post(`/professor/courses/${courseId}/lectures`, data),
  
  updateLecture: (courseId, lectureId, data) => 
    api.put(`/professor/courses/${courseId}/lectures/${lectureId}`, data),
  
  deleteLecture: (courseId, lectureId) => 
    api.delete(`/professor/courses/${courseId}/lectures/${lectureId}`),
  
  uploadLectureMaterial: (courseId, lectureId, formData) => 
    api.upload(`/professor/courses/${courseId}/lectures/${lectureId}/materials`, formData),
  
  // Quizzes
  getQuizzes: (courseId) => 
    api.get(`/professor/courses/${courseId}/quizzes`),
  
  createQuiz: (courseId, data) => 
    api.post(`/professor/courses/${courseId}/quizzes`, data),
  
  updateQuiz: (courseId, quizId, data) => 
    api.put(`/professor/courses/${courseId}/quizzes/${quizId}`, data),
  
  deleteQuiz: (courseId, quizId) => 
    api.delete(`/professor/courses/${courseId}/quizzes/${quizId}`),
  
  generateQuizWithAI: (courseId, data) => 
    api.post(`/professor/courses/${courseId}/quizzes/generate`, data),
  
  // Grading
  getGradingOverview: () => 
    api.get('/professor/grading'),
  
  getQuizSubmissions: (quizId) => 
    api.get(`/professor/grading/quizzes/${quizId}/submissions`),
  
  gradeSubmission: (submissionId, data) => 
    api.put(`/professor/grading/submissions/${submissionId}`, data),
  
  // Performance
  getStudentsPerformance: (filters) => 
    api.get('/professor/performance', { params: filters }),
  
  getStudentDetails: (studentId) => 
    api.get(`/professor/performance/students/${studentId}`),
  
  // Announcements
  getAnnouncements: () => 
    api.get('/professor/announcements'),
  
  createAnnouncement: (data) => 
    api.post('/professor/announcements', data),
  
  updateAnnouncement: (id, data) => 
    api.put(`/professor/announcements/${id}`, data),
  
  deleteAnnouncement: (id) => 
    api.delete(`/professor/announcements/${id}`),
  
  // Calendar
  getCalendar: (params) => 
    api.get('/professor/calendar', { params }),
  
  createEvent: (data) => 
    api.post('/professor/calendar/events', data),
  
  updateEvent: (id, data) => 
    api.put(`/professor/calendar/events/${id}`, data),
  
  deleteEvent: (id) => 
    api.delete(`/professor/calendar/events/${id}`),
  
  // Notifications
  getNotifications: () => 
    api.get('/professor/notifications'),
  
  markNotificationRead: (id) => 
    api.patch(`/professor/notifications/${id}/read`),
  
  // Settings
  getSettings: () => 
    api.get('/professor/settings'),
  
  updateSettings: (data) => 
    api.put('/professor/settings', data),
  
  updatePassword: (data) => 
    api.put('/professor/settings/password', data),
}

// ===========================================
// ADMIN API ENDPOINTS
// ===========================================
export const adminApi = {
  // Dashboard
  getDashboard: () => 
    api.get('/admin/dashboard'),
  
  // Students
  getStudents: (filters) => 
    api.get('/admin/students', { params: filters }),
  
  getStudentById: (id) => 
    api.get(`/admin/students/${id}`),
  
  createStudent: (data) => 
    api.post('/admin/students', data),
  
  updateStudent: (id, data) => 
    api.put(`/admin/students/${id}`, data),
  
  deleteStudent: (id) => 
    api.delete(`/admin/students/${id}`),
  
  toggleStudentStatus: (id) => 
    api.patch(`/admin/students/${id}/toggle-status`),
  
  assignMaterialsToStudent: (studentId, materialIds) => 
    api.post(`/admin/students/${studentId}/materials`, { materialIds }),
  
  // Professors
  getProfessors: (filters) => 
    api.get('/admin/professors', { params: filters }),
  
  getProfessorById: (id) => 
    api.get(`/admin/professors/${id}`),
  
  createProfessor: (data) => 
    api.post('/admin/professors', data),
  
  updateProfessor: (id, data) => 
    api.put(`/admin/professors/${id}`, data),
  
  deleteProfessor: (id) => 
    api.delete(`/admin/professors/${id}`),
  
  toggleProfessorStatus: (id) => 
    api.patch(`/admin/professors/${id}/toggle-status`),
  
  assignMaterialsToProfessor: (professorId, materialIds) => 
    api.post(`/admin/professors/${professorId}/materials`, { materialIds }),
  
  // Colleges
  getColleges: () => 
    api.get('/admin/colleges'),
  
  getCollegeById: (id) => 
    api.get(`/admin/colleges/${id}`),
  
  createCollege: (data) => 
    api.post('/admin/colleges', data),
  
  updateCollege: (id, data) => 
    api.put(`/admin/colleges/${id}`, data),
  
  deleteCollege: (id) => 
    api.delete(`/admin/colleges/${id}`),
  
  // Departments
  getDepartments: (collegeId) => 
    api.get(`/admin/colleges/${collegeId}/departments`),
  
  createDepartment: (collegeId, data) => 
    api.post(`/admin/colleges/${collegeId}/departments`, data),
  
  updateDepartment: (collegeId, deptId, data) => 
    api.put(`/admin/colleges/${collegeId}/departments/${deptId}`, data),
  
  deleteDepartment: (collegeId, deptId) => 
    api.delete(`/admin/colleges/${collegeId}/departments/${deptId}`),
  
  // Materials (Courses)
  getMaterials: (filters) => 
    api.get('/admin/materials', { params: filters }),
  
  getMaterialById: (id) => 
    api.get(`/admin/materials/${id}`),
  
  createMaterial: (data) => 
    api.post('/admin/materials', data),
  
  updateMaterial: (id, data) => 
    api.put(`/admin/materials/${id}`, data),
  
  deleteMaterial: (id) => 
    api.delete(`/admin/materials/${id}`),
  
  assignProfessorToMaterial: (materialId, professorId) => 
    api.post(`/admin/materials/${materialId}/professor`, { professorId }),
  
  // Activities
  getActivities: (filters) => 
    api.get('/admin/activities', { params: filters }),
  
  getPendingActivities: () => 
    api.get('/admin/activities/pending'),
  
  getApprovedActivities: () => 
    api.get('/admin/activities/approved'),
  
  createActivity: (data) => 
    api.post('/admin/activities', data),
  
  approveActivity: (id, data) => 
    api.patch(`/admin/activities/${id}/approve`, data),
  
  rejectActivity: (id, reason) => 
    api.patch(`/admin/activities/${id}/reject`, { reason }),
  
  deleteActivity: (id) => 
    api.delete(`/admin/activities/${id}`),
  
  // Semesters
  getSemesters: () => 
    api.get('/admin/semesters'),
  
  createSemester: (data) => 
    api.post('/admin/semesters', data),
  
  setActiveSemester: (id) => 
    api.patch(`/admin/semesters/${id}/activate`),
  
  // Statistics
  getStatistics: () => 
    api.get('/admin/statistics'),
  
  getReports: (type, params) => 
    api.get(`/admin/reports/${type}`, { params }),
}
