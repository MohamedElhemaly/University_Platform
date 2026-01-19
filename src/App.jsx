import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard'
import { StudentSubjects } from './pages/student/Subjects'
import { SubjectDetail } from './pages/student/SubjectDetail'
import { LectureDetail } from './pages/student/LectureDetail'
import { StudentCalendar } from './pages/student/Calendar'
import { StudentActivities } from './pages/student/Activities'
import { StudentPoints } from './pages/student/Points'

// Professor Pages
import { ProfessorDashboard } from './pages/professor/Dashboard'
import { ProfessorCourses } from './pages/professor/Courses'
import { CourseManagement } from './pages/professor/CourseManagement'
import { LectureManagement } from './pages/professor/LectureManagement'
import { StudentPerformance } from './pages/professor/Performance'
import { ProfessorAnnouncements } from './pages/professor/Announcements'

// Auth Pages
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<Layout userType="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
          <Route path="subjects/:subjectId/lectures/:lectureId" element={<LectureDetail />} />
          <Route path="calendar" element={<StudentCalendar />} />
          <Route path="activities" element={<StudentActivities />} />
          <Route path="points" element={<StudentPoints />} />
        </Route>

        {/* Professor Routes */}
        <Route path="/professor" element={<Layout userType="professor" />}>
          <Route index element={<ProfessorDashboard />} />
          <Route path="courses" element={<ProfessorCourses />} />
          <Route path="courses/:id" element={<CourseManagement />} />
          <Route path="courses/:courseId/lectures/:lectureId" element={<LectureManagement />} />
          <Route path="performance" element={<StudentPerformance />} />
          <Route path="announcements" element={<ProfessorAnnouncements />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
