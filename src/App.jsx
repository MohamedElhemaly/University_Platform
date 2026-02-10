import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './contexts/AuthContext'

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard'
import { StudentSubjects } from './pages/student/Subjects'
import { SubjectDetail } from './pages/student/SubjectDetail'
import { LectureDetail } from './pages/student/LectureDetail'
import { StudentCalendar } from './pages/student/Calendar'
import { StudentActivities } from './pages/student/Activities'
import { StudentPoints } from './pages/student/Points'
import { StudentNotifications } from './pages/student/Notifications'
import { StudentSettings } from './pages/student/Settings'
import { StudentResources } from './pages/student/Resources'
import { StudentQuiz } from './pages/student/Quiz'

// Professor Pages
import { ProfessorDashboard } from './pages/professor/Dashboard'
import { ProfessorCourses } from './pages/professor/Courses'
import { CourseManagement } from './pages/professor/CourseManagement'
import { LectureManagement } from './pages/professor/LectureManagement'
import { StudentPerformance } from './pages/professor/Performance'
import { ProfessorAnnouncements } from './pages/professor/Announcements'
import { ProfessorGrading } from './pages/professor/Grading'
import { ProfessorNotifications } from './pages/professor/Notifications'
import { ProfessorSettings } from './pages/professor/Settings'
import { ProfessorCalendar } from './pages/professor/Calendar'
import { ProfessorQuestions } from './pages/professor/Questions'

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminStudents } from './pages/admin/Students'
import { AdminProfessors } from './pages/admin/Professors'
import { AdminColleges } from './pages/admin/Colleges'
import { AdminMaterials } from './pages/admin/Materials'
import { AdminActivities } from './pages/admin/Activities'

// Auth Pages
import { StudentLogin } from './pages/auth/StudentLogin'
import { ProfessorLogin } from './pages/auth/ProfessorLogin'
import { AdminLogin } from './pages/auth/AdminLogin'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        {/* Default redirect to student login */}
        <Route path="/" element={<Navigate to="/student/login" replace />} />
        
        {/* Student Routes */}
        <Route path="/student">
          <Route path="login" element={<StudentLogin />} />
          <Route element={<Layout userType="student" />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="subjects/:subjectId/lectures/:lectureId" element={<LectureDetail />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="activities" element={<StudentActivities />} />
            <Route path="points" element={<StudentPoints />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="resources" element={<StudentResources />} />
            <Route path="quizzes/:quizId" element={<StudentQuiz />} />
          </Route>
          <Route index element={<Navigate to="/student/login" replace />} />
        </Route>

        {/* Professor Routes */}
        <Route path="/professor">
          <Route path="login" element={<ProfessorLogin />} />
          <Route element={<Layout userType="professor" />}>
            <Route path="dashboard" element={<ProfessorDashboard />} />
            <Route path="courses" element={<ProfessorCourses />} />
            <Route path="courses/:id" element={<CourseManagement />} />
            <Route path="courses/:courseId/lectures/:lectureId" element={<LectureManagement />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="announcements" element={<ProfessorAnnouncements />} />
            <Route path="grading" element={<ProfessorGrading />} />
            <Route path="questions" element={<ProfessorQuestions />} />
            <Route path="notifications" element={<ProfessorNotifications />} />
            <Route path="settings" element={<ProfessorSettings />} />
            <Route path="calendar" element={<ProfessorCalendar />} />
          </Route>
          <Route index element={<Navigate to="/professor/login" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          <Route element={<Layout userType="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="professors" element={<AdminProfessors />} />
            <Route path="colleges" element={<AdminColleges />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="activities" element={<AdminActivities />} />
          </Route>
          <Route index element={<Navigate to="/admin/login" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/student/login" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
