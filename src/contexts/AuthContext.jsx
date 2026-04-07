import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, auth } from '../lib/supabase'
import { authService, studentService, professorService } from '../services/supabaseService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session using the safe auth wrapper
        const session = await auth.getSession()
        
        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            // Get full user data based on type
            let fullUser = profile
            if (profile.user_type === 'student') {
              fullUser = await studentService.getProfile(session.user.id)
            } else if (profile.user_type === 'professor') {
              fullUser = await professorService.getProfile(session.user.id)
            }

            setUser(fullUser)
            setUserType(profile.user_type)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen to auth changes using the safe auth wrapper
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserType(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Student login
  const loginStudent = useCallback(async (studentId, password) => {
    const response = await authService.studentLogin(studentId, password)
    
    if (response.requirePasswordChange) {
      return { requirePasswordChange: true, user: response.user, email: response.email }
    }

    setUser(response.user)
    setUserType('student')
    setIsAuthenticated(true)
    return response
  }, [])

  // Professor login
  const loginProfessor = useCallback(async (email, password) => {
    const response = await authService.professorLogin(email, password)
    
    if (response.requirePasswordChange) {
      return { requirePasswordChange: true, user: response.user, email: response.email }
    }

    setUser(response.user)
    setUserType('professor')
    setIsAuthenticated(true)
    return response
  }, [])

  // Admin login
  const loginAdmin = useCallback(async (username, password) => {
    const response = await authService.adminLogin(username, password)
    
    setUser(response.user)
    setUserType('admin')
    setIsAuthenticated(true)
    return response
  }, [])

  // Change password (first login)
  const changePassword = useCallback(async (email, newPassword, type) => {
    await authService.changePassword(email, newPassword, type)
    
    // First get the profile by email to get the user ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    if (!profile) {
      throw new Error('لم يتم العثور على المستخدم')
    }
    
    // Now get full user data using the ID
    if (type === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('*, profiles(*)')
        .eq('id', profile.id)
        .single()
      
      if (student) {
        setUser({ ...student, ...student.profiles })
        setUserType('student')
      }
    } else if (type === 'professor') {
      const { data: professor } = await supabase
        .from('professors')
        .select('*, profiles(*)')
        .eq('id', profile.id)
        .single()
      
      if (professor) {
        setUser({ ...professor, ...professor.profiles })
        setUserType('professor')
      }
    }
    
    setIsAuthenticated(true)
  }, [])

  // Logout
  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setUserType(null)
    setIsAuthenticated(false)
  }, [])

  // Update user data
  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      if (userType === 'student') {
        const profile = await studentService.getProfile(user.id)
        setUser(profile)
      } else if (userType === 'professor') {
        const profile = await professorService.getProfile(user.id)
        setUser(profile)
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }, [user?.id, userType])

  const value = {
    user,
    userType,
    isLoading,
    isAuthenticated,
    loginStudent,
    loginProfessor,
    loginAdmin,
    changePassword,
    logout,
    updateUser,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected route component
export function RequireAuth({ children, allowedUserTypes = [] }) {
  const { isAuthenticated, isLoading, userType } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to appropriate login page
      if (allowedUserTypes.includes('student')) {
        navigate('/student/login', { replace: true })
      } else if (allowedUserTypes.includes('professor')) {
        navigate('/professor/login', { replace: true })
      } else if (allowedUserTypes.includes('admin')) {
        navigate('/admin/login', { replace: true })
      } else {
        navigate('/student/login', { replace: true })
      }
    }

    if (!isLoading && isAuthenticated && allowedUserTypes.length > 0) {
      if (!allowedUserTypes.includes(userType)) {
        // Redirect to user's dashboard
        navigate(`/${userType}/dashboard`, { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, userType, allowedUserTypes, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return null
  }

  return children
}
