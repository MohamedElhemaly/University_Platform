import { supabase, auth, db, storage } from '../lib/supabase'

const ACTIVITY_IMAGES_PREFIX = 'activities/'
const ACTIVITY_IMAGE_BUCKETS = ['lecture-materials', 'activity-images']

const sanitizeFileName = (fileName = 'image') => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
}

const normalizeDigits = (value = '') => {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩'
  const easternArabicIndic = '۰۱۲۳۴۵۶۷۸۹'

  return String(value).replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicIndic.indexOf(digit)
    if (arabicIndex !== -1) return String(arabicIndex)

    const easternIndex = easternArabicIndic.indexOf(digit)
    if (easternIndex !== -1) return String(easternIndex)

    return digit
  })
}

const normalizeTimeValue = (value) => {
  if (value === null || value === undefined || value === '') return null

  const sanitized = normalizeDigits(value)
    .replace(/[\u200e\u200f\u061c]/g, '')
    .trim()

  const match = sanitized.match(/(\d{1,2})\s*:\s*(\d{2})(?:\s*:\s*(\d{2}))?/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3] || '0')

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const normalizeTimeFields = (payload, keys = ['time', 'end_time']) => {
  if (!payload || typeof payload !== 'object') return payload

  const normalizedPayload = { ...payload }

  for (const key of keys) {
    if (key in normalizedPayload) {
      normalizedPayload[key] = normalizeTimeValue(normalizedPayload[key])
    }
  }

  return normalizedPayload
}

const extractActivityImagePath = (value) => {
  if (!value || typeof value !== 'string') return null
  if (value.startsWith('blob:')) return value
  if (value.startsWith(ACTIVITY_IMAGES_PREFIX)) return value

  try {
    const url = new URL(value)
    for (const bucket of ACTIVITY_IMAGE_BUCKETS) {
      const marker = `/${bucket}/`
      const bucketIndex = url.pathname.indexOf(marker)

      if (bucketIndex !== -1) {
        return decodeURIComponent(url.pathname.slice(bucketIndex + marker.length))
      }
    }

    return value
  } catch {
    return value
  }
}

const extractActivityImageBucket = (value) => {
  if (!value || typeof value !== 'string') return ACTIVITY_IMAGE_BUCKETS[0]
  if (value.startsWith('blob:')) return null

  if (value.includes(':') && !value.startsWith('http://') && !value.startsWith('https://')) {
    const [bucket] = value.split(':', 1)
    if (ACTIVITY_IMAGE_BUCKETS.includes(bucket)) return bucket
  }

  try {
    const url = new URL(value)
    for (const bucket of ACTIVITY_IMAGE_BUCKETS) {
      if (url.pathname.includes(`/${bucket}/`)) {
        return bucket
      }
    }
  } catch {
    return ACTIVITY_IMAGE_BUCKETS[0]
  }

  return ACTIVITY_IMAGE_BUCKETS[0]
}

const normalizeStoredActivityImageValue = (value) => {
  if (!value || typeof value !== 'string') return value
  if (value.startsWith('blob:')) return value
  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    if (
      value.includes('/storage/v1/object/public/') ||
      value.includes('/storage/v1/object/sign/')
    ) {
      return value
    }
  }

  if (value.includes(':')) {
    const [bucket, path] = value.split(/:(.+)/)
    if (ACTIVITY_IMAGE_BUCKETS.includes(bucket) && path) {
      return { bucket, path }
    }
  }

  return {
    bucket: extractActivityImageBucket(value),
    path: extractActivityImagePath(value)
  }
}

const downloadActivityImageAsBlobUrl = async (bucket, imagePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(imagePath)

    if (error || !data) {
      if (error) {
        console.error('Error downloading activity image:', error)
      }
      return null
    }

    return URL.createObjectURL(data)
  } catch (error) {
    console.error('Unexpected error downloading activity image:', error)
    return null
  }
}

const resolveActivityImageUrl = async (value) => {
  const normalizedValue = normalizeStoredActivityImageValue(value)
  if (!normalizedValue || typeof normalizedValue === 'string') return normalizedValue

  const { bucket, path: imagePath } = normalizedValue
  if (!bucket || !imagePath || !imagePath.startsWith(ACTIVITY_IMAGES_PREFIX)) {
    return value
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(imagePath, 60 * 60 * 24 * 30)

  if (!error && data?.signedUrl) {
    return data.signedUrl
  }

  if (error) {
    console.error('Error creating signed URL for activity image:', error)
  }

  const blobUrl = await downloadActivityImageAsBlobUrl(bucket, imagePath)
  if (blobUrl) {
    return blobUrl
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(imagePath)

  return publicUrlData?.publicUrl || value
}

const withResolvedActivityImage = async (activity) => {
  if (!activity) return activity

  return {
    ...activity,
    image_url: await resolveActivityImageUrl(activity.image_url)
  }
}

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  // Student login with student_id
  async studentLogin(studentId, password) {
    // First find student by student_id to get their email
    const { data: student, error: findError } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        college_id,
        department_id,
        year,
        points,
        ai_credits,
        max_ai_credits,
        status,
        profiles!inner(id, name, email, avatar_url, is_first_login, user_type)
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .single()

    if (findError || !student) {
      throw new Error('رقم الطالب غير موجود أو الحساب غير مفعل')
    }

    // Check if first login (password should be student_id)
    if (student.profiles.is_first_login) {
      if (password !== studentId) {
        throw new Error('كلمة المرور غير صحيحة')
      }
      return { 
        requirePasswordChange: true, 
        user: { ...student, ...student.profiles },
        email: student.profiles.email
      }
    }

    // Regular login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: student.profiles.email,
      password: password
    })

    if (authError) throw new Error('كلمة المرور غير صحيحة')

    return {
      user: { ...student, ...student.profiles },
      session: authData.session
    }
  },

  // Professor login with email
  async professorLogin(email, password) {
    // Find professor by email
    const { data: professor, error: findError } = await supabase
      .from('professors')
      .select(`
        id,
        professor_id,
        college_id,
        department_id,
        title,
        status,
        profiles!inner(id, name, email, avatar_url, is_first_login, user_type)
      `)
      .eq('profiles.email', email)
      .eq('status', 'active')
      .single()

    if (findError || !professor) {
      throw new Error('البريد الإلكتروني غير موجود أو الحساب غير مفعل')
    }

    // Check if first login (password should be email)
    if (professor.profiles.is_first_login) {
      if (password !== email) {
        throw new Error('كلمة المرور غير صحيحة')
      }
      return { 
        requirePasswordChange: true, 
        user: { ...professor, ...professor.profiles },
        email: professor.profiles.email
      }
    }

    // Regular login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (authError) throw new Error('كلمة المرور غير صحيحة')

    return {
      user: { ...professor, ...professor.profiles },
      session: authData.session
    }
  },

  // Admin login
  async adminLogin(username, password) {
    // Find admin by email/username
    const { data: admin, error: findError } = await supabase
      .from('admins')
      .select(`
        id,
        role,
        profiles!inner(id, name, email, avatar_url, is_first_login, user_type)
      `)
      .eq('profiles.email', username)
      .single()

    if (findError || !admin) {
      throw new Error('اسم المستخدم غير موجود')
    }

    // Login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: admin.profiles.email,
      password: password
    })

    if (authError) throw new Error('كلمة المرور غير صحيحة')

    return {
      user: { ...admin, ...admin.profiles },
      session: authData.session
    }
  },

  // Change password (first login)
  async changePassword(email, newPassword, userType) {
    // Sign in with temporary password (student_id or email)
    const tempPassword = userType === 'student' ? email.split('@')[0] : email
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: tempPassword
    })

    // If sign in fails, the user might already have changed their password
    // Try updating directly
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    // Update is_first_login flag
    await supabase
      .from('profiles')
      .update({ is_first_login: false })
      .eq('email', email)

    return data
  },

  // Logout
  async logout() {
    await supabase.auth.signOut()
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Get current user with profile
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { ...user, profile }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ============================================
// STUDENT SERVICE
// ============================================
export const studentService = {
  // Get student dashboard data
  async getDashboard(studentId) {
    const [profile, materials, upcomingQuizzes, notifications, completedQuizzes, bannerActivity] = await Promise.all([
      this.getProfile(studentId),
      this.getMaterials(studentId),
      this.getUpcomingQuizzes(studentId),
      this.getNotifications(studentId, 5),
      this.getCompletedQuizzesCount(studentId),
      this.getBannerActivity()
    ])

    return { profile, materials, upcomingQuizzes, notifications, completedQuizzes, bannerActivity }
  },

  // Get the single banner activity (show_as_banner = true, approved)
  async getBannerActivity() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('status', 'approved')
      .eq('show_as_banner', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  // Get count of completed (submitted) quizzes
  async getCompletedQuizzesCount(studentId) {
    const { count, error } = await supabase
      .from('quiz_submissions')
      .select('quiz_id', { count: 'exact', head: true })
      .eq('student_id', studentId)

    if (error) throw error
    return count || 0
  },

  // Get all submissions for a specific quiz by a student
  async getQuizSubmissions(quizId, studentId) {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get student's best submission for each quiz in a material
  async getMaterialQuizSubmissions(materialId, studentId) {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        quizzes!inner(id, material_id)
      `)
      .eq('quizzes.material_id', materialId)
      .eq('student_id', studentId)
      .order('score', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get student profile with full details
  async getProfile(studentId) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profiles(*),
        colleges(id, name, code),
        departments(id, name),
        semesters(id, name, year, term)
      `)
      .eq('id', studentId)
      .single()

    if (error) throw error
    return { ...data, ...data.profiles }
  },

  // Get enrolled materials/subjects
  async getMaterials(studentId) {
    const { data, error } = await supabase
      .from('student_materials')
      .select(`
        id,
        enrolled_at,
        materials(
          id,
          code,
          name,
          color,
          credits,
          professors(
            id,
            profiles(name)
          ),
          lectures(count),
          quizzes(count)
        )
      `)
      .eq('student_id', studentId)

    if (error) throw error
    return data?.map(sm => ({
      ...sm.materials,
      professorName: sm.materials.professors?.profiles?.name
    })) || []
  },

  // Get material/subject details
  async getMaterialDetail(materialId, studentId) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        professors(id, profiles(name, avatar_url)),
        lectures(*, lecture_materials(*)),
        quizzes(*),
        announcements(*)
      `)
      .eq('id', materialId)
      .single()

    if (error) throw error

    // Get student progress
    const { data: progress } = await supabase
      .from('student_lecture_progress')
      .select('lecture_id, completed')
      .eq('student_id', studentId)
      .in('lecture_id', data.lectures?.map(l => l.id) || [])

    return {
      ...data,
      progress: progress || []
    }
  },

  // Get lecture details
  async getLectureDetail(lectureId, studentId) {
    const { data, error } = await supabase
      .from('lectures')
      .select(`
        *,
        materials(id, name, code, color),
        lecture_materials(*),
        lecture_questions(
          *,
          students(profiles(name, avatar_url)),
          professors:answered_by(profiles(name))
        ),
        quizzes(*)
      `)
      .eq('id', lectureId)
      .single()

    if (error) throw error

    // Get AI chat history
    let chatHistory = null;
    try {
      const { data } = await supabase
        .from('ai_chat_history')
        .select('messages')
        .eq('student_id', studentId)
        .eq('lecture_id', lectureId)
        .single()
      chatHistory = data;
    } catch (error) {
      console.warn('AI chat history not available:', error.message);
    }

    return {
      ...data,
      chatHistory: chatHistory?.messages || []
    }
  },

  // Mark lecture as completed
  async markLectureComplete(studentId, lectureId) {
    const { data, error } = await supabase
      .from('student_lecture_progress')
      .upsert({
        student_id: studentId,
        lecture_id: lectureId,
        completed: true,
        completed_at: new Date().toISOString()
      })
      .select()

    if (error) throw error
    return data
  },

  // Get upcoming quizzes (excludes quizzes where student used all attempts)
  async getUpcomingQuizzes(studentId) {
    // Get submission counts per quiz for this student
    const { data: submissions } = await supabase
      .from('quiz_submissions')
      .select('quiz_id')
      .eq('student_id', studentId)

    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        materials!inner(
          id,
          name,
          student_materials!inner(student_id)
        )
      `)
      .eq('materials.student_materials.student_id', studentId)
      .eq('is_published', true)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })

    if (error) throw error

    // Count submissions per quiz and filter out quizzes with no attempts left
    const submissionCounts = {}
    for (const s of (submissions || [])) {
      submissionCounts[s.quiz_id] = (submissionCounts[s.quiz_id] || 0) + 1
    }

    return (data || []).filter(quiz => {
      const used = submissionCounts[quiz.id] || 0
      const max = quiz.max_attempts || 1
      return used < max
    })
  },

  // Get quiz details
  async getQuiz(quizId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        materials(id, name, code),
        quiz_questions(*)
      `)
      .eq('id', quizId)
      .single()

    if (error) throw error
    return data
  },

  // Submit quiz
  async submitQuiz(quizId, studentId, answers, timeSpent, score = null, totalPoints = null) {
    const submission = {
      quiz_id: quizId,
      student_id: studentId,
      answers,
      time_spent: timeSpent,
      submitted_at: new Date().toISOString()
    }
    if (score !== null) submission.score = score
    if (totalPoints !== null) submission.total_points = totalPoints
    if (score !== null) submission.graded_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('quiz_submissions')
      .insert(submission)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get notifications
  async getNotifications(studentId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  // Mark notification as read
  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  },

  // Get calendar events (combines lectures, quizzes, and manual calendar_events)
  async getCalendarEvents(studentId) {
    const [lecturesRes, quizzesRes, manualRes] = await Promise.all([
      // Get lectures from enrolled courses
      supabase
        .from('lectures')
        .select(`
          id,
          title,
          date,
          time,
          duration,
          location,
          materials!inner(
            id,
            name,
            color,
            student_materials!inner(student_id)
          )
        `)
        .eq('materials.student_materials.student_id', studentId),
      // Get published quizzes from enrolled courses
      supabase
        .from('quizzes')
        .select(`
          id,
          title,
          type,
          due_date,
          duration,
          materials!inner(
            id,
            name,
            color,
            student_materials!inner(student_id)
          )
        `)
        .eq('materials.student_materials.student_id', studentId)
        .eq('is_published', true),
      // Get manual calendar events
      supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', studentId)
        .order('date', { ascending: true })
    ])

    const events = []

    // Map lectures to calendar events
    if (lecturesRes.data) {
      for (const l of lecturesRes.data) {
        events.push({
          id: `lecture-${l.id}`,
          title: `${l.title} - ${l.materials?.name || ''}`,
          type: 'lecture',
          date: l.date,
          time: l.time,
          end_time: l.duration ? (() => {
            const [h, m] = l.time.split(':').map(Number)
            const endMin = h * 60 + m + l.duration
            return `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
          })() : null,
          location: l.location,
          color: l.materials?.color || '#3b82f6',
        })
      }
    }

    // Map quizzes to calendar events
    if (quizzesRes.data) {
      for (const q of quizzesRes.data) {
        const dueDate = new Date(q.due_date)
        events.push({
          id: `quiz-${q.id}`,
          title: `${q.title} - ${q.materials?.name || ''}`,
          type: q.type === 'online' ? 'quiz_online' : 'quiz_offline',
          date: dueDate.toISOString().split('T')[0],
          time: dueDate.toTimeString().slice(0, 5),
          end_time: null,
          location: null,
          color: q.type === 'online' ? '#ef4444' : '#f97316',
        })
      }
    }

    // Add manual calendar events
    if (manualRes.data) {
      for (const e of manualRes.data) {
        events.push({
          id: `event-${e.id}`,
          title: e.title,
          type: e.type,
          date: e.date,
          time: e.time,
          end_time: e.end_time,
          location: e.location,
          color: e.color || '#3b82f6',
        })
      }
    }

    // Sort by date then time
    events.sort((a, b) => {
      const dateComp = (a.date || '').localeCompare(b.date || '')
      if (dateComp !== 0) return dateComp
      return (a.time || '').localeCompare(b.time || '')
    })

    return events
  },

  // Get activities
  async getActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, description, category, date, time, location, duration, company, instructor, host, link, image_url, submitted_by, approved_by, status, rejection_reason, show_as_banner, target_college_id, target_year, target_semester_id, is_admin_created, created_at, updated_at')
      .eq('status', 'approved')
      .order('date', { ascending: true })

    if (error) throw error
    return Promise.all((data || []).map(withResolvedActivityImage))
  },

  // Submit activity
  async submitActivity(studentId, activityData) {
    const normalizedActivityData = normalizeTimeFields(activityData)

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...normalizedActivityData,
        submitted_by: studentId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async uploadActivityImage(file) {
    if (!file) return null
    
    try {
      const fileName = `${ACTIVITY_IMAGES_PREFIX}${Date.now()}_${sanitizeFileName(file.name)}`
      const { error: uploadError } = await supabase.storage
        .from(ACTIVITY_IMAGE_BUCKETS[0])
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return null
      }

      return `${ACTIVITY_IMAGE_BUCKETS[0]}:${fileName}`
    } catch (error) {
      console.error('Error uploading activity image:', error)
      return null
    }
  },

  async deleteActivity(activityId) {
    const { data, error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .select('id, image_url')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw new Error('لم يتم حذف النشاط من قاعدة البيانات')
    }

    const imagePath = extractActivityImagePath(data.image_url)
    const imageBucket = extractActivityImageBucket(data.image_url)
    if (imagePath?.startsWith(ACTIVITY_IMAGES_PREFIX)) {
      const { error: storageError } = await supabase.storage
        .from(imageBucket)
        .remove([imagePath])

      if (storageError) {
        console.error('Error removing activity image from storage:', storageError)
      }
    }

    return true
  },

  // Get points and leaderboard
  async getPointsData(studentId) {
    const [history, leaderboard, achievements] = await Promise.all([
      supabase
        .from('points_history')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),
      supabase
        .from('students')
        .select(`
          id,
          points,
          profiles(name, avatar_url),
          colleges(name)
        `)
        .eq('status', 'active')
        .order('points', { ascending: false })
        .limit(10),
      supabase
        .from('student_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('student_id', studentId)
    ])

    return {
      history: history.data || [],
      leaderboard: leaderboard.data || [],
      achievements: achievements.data || []
    }
  },

  // Award points to student via DB function
  async awardPoints(studentId, points, reason, sourceType, sourceId = null) {
    const { error } = await supabase.rpc('award_points', {
      p_student_id: studentId,
      p_points: points,
      p_reason: reason,
      p_source_type: sourceType,
      p_source_id: sourceId,
    })
    if (error) throw error
  },

  // Ask question in lecture
  async askQuestion(studentId, lectureId, questionText) {
    const { data, error } = await supabase
      .from('lecture_questions')
      .insert({
        lecture_id: lectureId,
        student_id: studentId,
        question_text: questionText
      })
      .select()
      .single()

    if (error) throw error

    // Award points for asking a question
    try {
      await this.awardPoints(studentId, 5, 'طرح سؤال في المحاضرة', 'question', data.id)
    } catch (e) {
      console.error('Failed to award question points:', e)
    }

    return data
  },

  // Vote on question
  async voteQuestion(studentId, questionId, voteType) {
    const { data, error } = await supabase
      .from('question_votes')
      .upsert({
        question_id: questionId,
        student_id: studentId,
        vote_type: voteType
      })
      .select()

    if (error) throw error
    return data
  },

  // Update profile
  async updateProfile(studentId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update settings
  async updateSettings(studentId, settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: studentId,
        ...settings
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get settings
  async getSettings(studentId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', studentId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Mark all notifications as read
  async markAllNotificationsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },

  // Get student's own submitted activities
  async getMyActivities(studentId) {
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, description, category, date, time, location, duration, company, instructor, host, link, image_url, submitted_by, approved_by, status, rejection_reason, show_as_banner, target_college_id, target_year, target_semester_id, is_admin_created, created_at, updated_at')
      .eq('submitted_by', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return Promise.all((data || []).map(withResolvedActivityImage))
  },

  // Get study resources (lecture materials from enrolled courses)
  async getResources(studentId) {
    const { data, error } = await supabase
      .from('lecture_materials')
      .select(`
        *,
        lectures!inner(
          id,
          title,
          material_id,
          materials!inner(
            id,
            name,
            code,
            color,
            student_materials!inner(student_id)
          )
        )
      `)
      .eq('lectures.materials.student_materials.student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(r => ({
      ...r,
      materialName: r.lectures?.materials?.name,
      materialCode: r.lectures?.materials?.code,
      materialColor: r.lectures?.materials?.color,
      materialId: r.lectures?.materials?.id,
    })) || []
  },

  // Get login history
  async getLoginHistory(userId) {
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  },

  // Change password
  async changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }
}

// ============================================
// PROFESSOR SERVICE
// ============================================
export const professorService = {
  // Get professor dashboard data
  async getDashboard(professorId) {
    const [profile, courses, recentQuestions] = await Promise.all([
      this.getProfile(professorId),
      this.getCourses(professorId),
      this.getRecentQuestions(professorId)
    ])

    return { profile, courses, recentQuestions }
  },

  // Get professor profile
  async getProfile(professorId) {
    const { data, error } = await supabase
      .from('professors')
      .select(`
        *,
        profiles(*),
        colleges(id, name),
        departments(id, name)
      `)
      .eq('id', professorId)
      .single()

    if (error) throw error
    return { ...data, ...data.profiles }
  },

  // Get courses/materials
  async getCourses(professorId) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        colleges(name),
        semesters(name),
        student_materials(count),
        lectures(count),
        quizzes(count)
      `)
      .eq('professor_id', professorId)
      .eq('status', 'active')

    if (error) throw error
    return data || []
  },

  // Get course detail
  async getCourseDetail(courseId) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        lectures(*),
        quizzes(*),
        announcements(*),
        student_materials(
          students(
            id,
            student_id,
            profiles(name, avatar_url)
          )
        )
      `)
      .eq('id', courseId)
      .single()

    if (error) throw error
    return data
  },

  // Create lecture
  async createLecture(lectureData) {
    const normalizedLectureData = normalizeTimeFields(lectureData)

    const { data, error } = await supabase
      .from('lectures')
      .insert(normalizedLectureData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update lecture
  async updateLecture(lectureId, updates) {
    const normalizedUpdates = normalizeTimeFields(updates)

    const { data, error } = await supabase
      .from('lectures')
      .update(normalizedUpdates)
      .eq('id', lectureId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete lecture
  async deleteLecture(lectureId) {
    const { error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', lectureId)

    if (error) throw error
  },

  // Upload lecture material
  async uploadMaterial(lectureId, file, metadata) {
    const fileName = `${lectureId}/${Date.now()}_${file.name}`
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lecture-materials')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lecture-materials')
      .getPublicUrl(fileName)

    // Create record
    const { data, error } = await supabase
      .from('lecture_materials')
      .insert({
        lecture_id: lectureId,
        name: metadata.name || file.name,
        type: metadata.type || 'other',
        file_url: publicUrl,
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create quiz
  async createQuiz(quizData, questions) {
    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single()

    if (quizError) throw quizError

    // Create questions
    if (questions && questions.length > 0) {
      const questionsWithQuizId = questions.map((q, index) => ({
        ...q,
        quiz_id: quiz.id,
        order_index: index + 1
      }))

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId)

      if (questionsError) throw questionsError
    }

    return quiz
  },

  // Get quiz submissions
  async getQuizSubmissions(quizId) {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        students(
          id,
          student_id,
          profiles(name, avatar_url)
        )
      `)
      .eq('quiz_id', quizId)

    if (error) throw error
    return data || []
  },

  // Create announcement
  async createAnnouncement(professorId, materialId, announcement) {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        professor_id: professorId,
        material_id: materialId,
        ...announcement
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get recent unanswered questions
  async getRecentQuestions(professorId) {
    const { data, error } = await supabase
      .from('lecture_questions')
      .select(`
        *,
        lectures!inner(
          materials!inner(professor_id)
        ),
        students(profiles(name))
      `)
      .eq('lectures.materials.professor_id', professorId)
      .is('answer_text', null)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  },

  // Answer question
  async answerQuestion(professorId, questionId, answerText) {
    const { data, error } = await supabase
      .from('lecture_questions')
      .update({
        answer_text: answerText,
        answered_by: professorId,
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get student performance
  async getStudentPerformance(professorId) {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        students(
          id,
          student_id,
          points,
          profiles(name)
        ),
        quizzes!inner(
          id,
          material_id,
          materials!inner(professor_id)
        )
      `)
      .eq('quizzes.materials.professor_id', professorId)

    if (error) throw error
    return data || []
  },

  // Get calendar events
  async getCalendarEvents(professorId) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', professorId)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create calendar event
  async createCalendarEvent(professorId, eventData) {
    const normalizedEventData = normalizeTimeFields(eventData)

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: professorId,
        user_type: 'professor',
        ...normalizedEventData
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get notifications
  async getNotifications(professorId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', professorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Mark notification as read
  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  },

  // Mark all notifications as read
  async markAllNotificationsRead(professorId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', professorId)
      .eq('is_read', false)

    if (error) throw error
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },

  // Get announcements for professor
  async getAnnouncements(professorId) {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        materials(id, name, code)
      `)
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Delete announcement
  async deleteAnnouncement(announcementId) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)

    if (error) throw error
  },

  // Update announcement
  async updateAnnouncement(announcementId, updates) {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', announcementId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get lecture detail for professor
  async getLectureDetail(lectureId) {
    const { data, error } = await supabase
      .from('lectures')
      .select(`
        *,
        materials(id, name, code, color),
        lecture_materials(*),
        lecture_questions(
          *,
          students(profiles(name, avatar_url)),
          professors:answered_by(profiles(name))
        )
      `)
      .eq('id', lectureId)
      .single()

    if (error) throw error
    return data
  },

  // Delete lecture material
  async deleteLectureMaterial(materialId) {
    const { error } = await supabase
      .from('lecture_materials')
      .delete()
      .eq('id', materialId)

    if (error) throw error
  },

  // Get grading data - all quizzes with submissions for professor
  async getGradingData(professorId) {
    // Get all quizzes from professor's materials
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select(`
        *,
        materials!inner(id, name, code, professor_id, student_materials(count)),
        quiz_submissions(
          *,
          students(id, student_id, profiles(name, avatar_url))
        )
      `)
      .eq('materials.professor_id', professorId)
      .order('created_at', { ascending: false })

    if (quizzesError) throw quizzesError
    return quizzes || []
  },

  // Delete calendar event
  async deleteCalendarEvent(eventId) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
  },

  // Update calendar event
  async updateCalendarEvent(eventId, updates) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update profile
  async updateProfile(professorId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', professorId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get settings
  async getSettings(professorId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', professorId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update settings
  async updateSettings(professorId, settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: professorId,
        ...settings
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Change password
  async changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  },

  // Update course (material) details
  async updateCourse(courseId, updates) {
    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Publish/unpublish quiz
  async publishQuiz(quizId, isPublished) {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ is_published: isPublished })
      .eq('id', quizId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete quiz and its questions
  async deleteQuiz(quizId) {
    // Delete questions first
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    if (error) throw error
  },

  // Get quiz with questions (for editing)
  async getQuizWithQuestions(quizId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions(*)
      `)
      .eq('id', quizId)
      .single()

    if (error) throw error
    return data
  },

  // Update quiz questions
  async updateQuizQuestions(quizId, questions) {
    // Delete existing questions
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    // Insert new questions
    if (questions && questions.length > 0) {
      const questionsWithQuizId = questions.map((q, index) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points || 1,
        order_index: index + 1
      }))

      const { error } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId)

      if (error) throw error
    }
  },

  // Create notifications for all students enrolled in a course
  async notifyCourseStudents(materialId, notification) {
    // Get all enrolled students
    const { data: enrollments, error: enrollError } = await supabase
      .from('student_materials')
      .select('student_id')
      .eq('material_id', materialId)

    if (enrollError) throw enrollError
    if (!enrollments || enrollments.length === 0) return

    // Create a notification for each student
    const notifications = enrollments.map(e => ({
      user_id: e.student_id,
      type: notification.type || 'quiz',
      title: notification.title,
      message: notification.message,
      link: notification.link || null,
      is_read: false,
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) throw error
  },

  // Get all unanswered questions across professor's courses (for Questions page)
  async getAllUnansweredQuestions(professorId) {
    const { data, error } = await supabase
      .from('lecture_questions')
      .select(`
        *,
        lectures!inner(
          id,
          title,
          materials!inner(id, name, code, professor_id)
        ),
        students(id, profiles(name, avatar_url))
      `)
      .eq('lectures.materials.professor_id', professorId)
      .is('answer_text', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get upcoming quiz deadlines (within next 48 hours) for professor's courses
  async getUpcomingQuizDeadlines(professorId) {
    const now = new Date()
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        materials!inner(id, name, code, professor_id)
      `)
      .eq('materials.professor_id', professorId)
      .eq('is_published', true)
      .gte('due_date', now.toISOString())
      .lte('due_date', in48h.toISOString())
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get upcoming lectures (today and tomorrow) for professor's courses
  async getUpcomingLectures(professorId) {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const in2days = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('lectures')
      .select(`
        *,
        materials!inner(id, name, code, professor_id)
      `)
      .eq('materials.professor_id', professorId)
      .gte('date', today)
      .lte('date', in2days)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get login history
  async getLoginHistory(userId) {
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  }
}

// ============================================
// ADMIN SERVICE
// ============================================
export const adminService = {
  // Get dashboard stats
  async getDashboardStats() {
    const [students, professors, colleges, materials, pendingActivities] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('professors').select('id', { count: 'exact', head: true }),
      supabase.from('colleges').select('id', { count: 'exact', head: true }),
      supabase.from('materials').select('id', { count: 'exact', head: true }),
      supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    ])

    return {
      studentsCount: students.count || 0,
      professorsCount: professors.count || 0,
      collegesCount: colleges.count || 0,
      materialsCount: materials.count || 0,
      pendingActivitiesCount: pendingActivities.count || 0
    }
  },

  // ---- STUDENTS ----
  async getStudents(filters = {}) {
    let query = supabase
      .from('students')
      .select(`
        *,
        profiles(*),
        colleges(id, name),
        departments(id, name),
        student_materials(id)
      `)

    if (filters.collegeId) query = query.eq('college_id', filters.collegeId)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.ilike('profiles.name', `%${filters.search}%`)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createStudent(studentData) {
    // 1. Create auth user using signUp (works with anon key)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.student_id, // Initial password is student_id
      options: {
        emailRedirectTo: undefined,
        data: {
          name: studentData.name,
          user_type: 'student'
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // 2. Create profile using RPC function (bypasses RLS with SECURITY DEFINER)
    const { error: profileError } = await supabase.rpc('create_user_profile', {
      user_id: authData.user.id,
      user_type: 'student',
      user_name: studentData.name,
      user_email: studentData.email
    })

    if (profileError) throw profileError

    // 3. Create student record using RPC function (bypasses RLS with SECURITY DEFINER)
    const { error: studentError } = await supabase.rpc('create_student_record', {
      user_id: authData.user.id,
      student_id_param: studentData.student_id,
      college_id_param: studentData.college_id,
      department_id_param: studentData.department_id,
      year_param: studentData.year,
      semester_id_param: studentData.semester_id
    })

    if (studentError) throw studentError

    // 4. Fetch and return the created student record
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (error) throw error
    return data
  },

  async updateStudent(studentId, updates) {
    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)

    if (error) throw error

    const { data: refreshedStudent, error: refreshError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle()

    if (refreshError) throw refreshError
    if (!refreshedStudent) {
      throw new Error('تعذر التحقق من تحديث بيانات الطالب. تأكد من صلاحيات الأدمن في Supabase.')
    }

    return refreshedStudent
  },

  async updateStudentProfile(studentId, updates) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', studentId)

    if (error) throw error

    const { data: refreshedProfile, error: refreshError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .maybeSingle()

    if (refreshError) throw refreshError
    if (!refreshedProfile) {
      throw new Error('تعذر التحقق من تحديث ملف الطالب. غالبًا سياسة profiles لا تسمح للأدمن بالتعديل في بيئة الإنتاج.')
    }

    return refreshedProfile
  },

  async toggleStudentStatus(studentId, status) {
    return this.updateStudent(studentId, { status })
  },

  async deleteStudent(studentId) {
    // Remove records that may block profile/student deletion because
    // not every relation in the schema cascades automatically.
    const cleanupSteps = [
      () => supabase.from('activities').delete().eq('submitted_by', studentId),
      () => supabase.from('profiles').delete().eq('id', studentId),
    ]

    for (const runCleanup of cleanupSteps) {
      const { error } = await runCleanup()
      if (error) throw error
    }

    // Fallback: if the profile deletion did not remove the student row
    // because of environment-specific policies, try deleting it directly.
    const { data: remainingStudent, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .maybeSingle()

    if (checkError) throw checkError

    if (remainingStudent) {
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (studentError) throw studentError
    }

    return true
  },

  // ---- PROFESSORS ----
  async getProfessors(filters = {}) {
    let query = supabase
      .from('professors')
      .select(`
        *,
        profiles(*),
        colleges(id, name),
        departments(id, name)
      `)

    if (filters.collegeId) query = query.eq('college_id', filters.collegeId)
    if (filters.status) query = query.eq('status', filters.status)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createProfessor(professorData) {
    // 1. Create auth user using signUp (works with anon key)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: professorData.email,
      password: professorData.email, // Initial password is the email for first login
      options: {
        emailRedirectTo: undefined,
        data: {
          name: professorData.name,
          user_type: 'professor'
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // 2. Create profile using RPC function (bypasses RLS with SECURITY DEFINER)
    const { error: profileError } = await supabase.rpc('create_user_profile', {
      user_id: authData.user.id,
      user_type: 'professor',
      user_name: professorData.name,
      user_email: professorData.email
    })

    if (profileError) throw profileError

    // 3. Create professor record using RPC function (bypasses RLS with SECURITY DEFINER)
    const { error: professorError } = await supabase.rpc('create_professor_record', {
      user_id: authData.user.id,
      professor_id_param: professorData.professor_id,
      college_id_param: professorData.college_id,
      department_id_param: professorData.department_id,
      title_param: professorData.title
    })

    if (professorError) throw professorError

    // 4. Fetch and return the created professor record
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (error) throw error
    return data
  },

  async updateProfessor(professorId, updates) {
    const { data, error } = await supabase
      .from('professors')
      .update(updates)
      .eq('id', professorId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProfessorProfile(professorId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', professorId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteProfessor(professorId) {
    const ensureProfessorRemoved = async () => {
      const { data, error } = await supabase
        .from('professors')
        .select('id')
        .eq('id', professorId)
        .maybeSingle()

      if (error) throw error
      return !data
    }

    const { error: unassignMaterialsError } = await supabase
      .from('materials')
      .update({ professor_id: null })
      .eq('professor_id', professorId)

    if (unassignMaterialsError) throw unassignMaterialsError

    const attemptProfileDelete = async () => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', professorId)

      return error
    }

    let deleteError = await attemptProfileDelete()
    if (await ensureProfessorRemoved()) {
      return true
    }

    const cleanupSteps = [
      () => supabase.from('lecture_questions').update({ answered_by: null, answered_at: null }).eq('answered_by', professorId),
      () => supabase.from('announcements').delete().eq('professor_id', professorId),
    ]

    for (const runCleanup of cleanupSteps) {
      const { error } = await runCleanup()
      if (error) {
        deleteError = error
      }
    }

    deleteError = await attemptProfileDelete()
    if (await ensureProfessorRemoved()) {
      return true
    }

    const { error: professorError } = await supabase
      .from('professors')
      .delete()
      .eq('id', professorId)

    if (professorError) {
      throw professorError
    }

    if (!(await ensureProfessorRemoved())) {
      throw deleteError || new Error('تعذر حذف الأستاذ من قاعدة البيانات. غالبًا يحتاج الأدمن سياسات حذف إضافية على profiles و professors في Supabase.')
    }

    return true
  },

  // ---- COLLEGES ----
  async getColleges() {
    if (!supabase) {
      console.error('Supabase client is not initialized')
      return []
    }
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        departments(*)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching colleges:', error)
      throw error
    }
    return data || []
  },

  async createCollege(collegeData) {
    const { data, error } = await supabase
      .from('colleges')
      .insert(collegeData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCollege(collegeId, updates) {
    const { data, error } = await supabase
      .from('colleges')
      .update(updates)
      .eq('id', collegeId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createDepartment(departmentData) {
    const { data, error } = await supabase
      .from('departments')
      .insert(departmentData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateDepartment(departmentId, updates) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', departmentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteDepartment(departmentId) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId)

    if (error) throw error
    return true
  },

  async deleteCollege(collegeId) {
    const { error } = await supabase
      .from('colleges')
      .delete()
      .eq('id', collegeId)

    if (error) throw error
    return true
  },

  // ---- MATERIALS ----
  async getMaterials(filters = {}) {
    let query = supabase
      .from('materials')
      .select(`
        *,
        colleges(id, name),
        departments(id, name),
        semesters(id, name),
        professors(
          id,
          profiles(name)
        )
      `)

    if (filters.collegeId) query = query.eq('college_id', filters.collegeId)
    if (filters.year) query = query.eq('year', filters.year)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createMaterial(materialData) {
    const { data, error } = await supabase
      .from('materials')
      .insert(materialData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateMaterial(materialId, updates) {
    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', materialId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteMaterial(materialId) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId)

    if (error) throw error
    return true
  },

  async assignProfessor(materialId, professorId) {
    return this.updateMaterial(materialId, { professor_id: professorId })
  },

  async enrollStudents(materialId, studentIds) {
    const enrollments = studentIds.map(studentId => ({
      material_id: materialId,
      student_id: studentId
    }))

    const { data, error } = await supabase
      .from('student_materials')
      .upsert(enrollments, { onConflict: 'material_id,student_id' })
      .select()

    if (error) throw error
    return data
  },

  async unenrollStudent(materialId, studentId) {
    const { error } = await supabase
      .from('student_materials')
      .delete()
      .eq('material_id', materialId)
      .eq('student_id', studentId)

    if (error) throw error
  },

  // ---- ACTIVITIES ----
  async getActivities(status = null) {
    let query = supabase
      .from('activities')
      .select(`
        id,
        title,
        description,
        category,
        date,
        time,
        location,
        duration,
        company,
        instructor,
        host,
        link,
        image_url,
        submitted_by,
        approved_by,
        status,
        rejection_reason,
        show_as_banner,
        target_college_id,
        target_year,
        target_semester_id,
        is_admin_created,
        created_at,
        updated_at,
        students:submitted_by(student_id, profiles(name))
      `)

    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return Promise.all((data || []).map(withResolvedActivityImage))
  },

  async approveActivity(activityId, adminId) {
    const { data, error } = await supabase
      .from('activities')
      .update({
        status: 'approved',
        approved_by: adminId
      })
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async rejectActivity(activityId, reason) {
    const { data, error } = await supabase
      .from('activities')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createActivity(adminId, activityData) {
    const normalizedActivityData = normalizeTimeFields(activityData)

    // If marking as banner, clear any existing banner first
    if (normalizedActivityData.show_as_banner) {
      await supabase
        .from('activities')
        .update({ show_as_banner: false })
        .eq('show_as_banner', true)
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...normalizedActivityData,
        approved_by: adminId,
        status: 'approved',
        is_admin_created: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async uploadActivityImage(file) {
    if (!file) return null
    
    try {
      const fileName = `${ACTIVITY_IMAGES_PREFIX}${Date.now()}_${sanitizeFileName(file.name)}`
      const { error: uploadError } = await supabase.storage
        .from(ACTIVITY_IMAGE_BUCKETS[0])
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return null
      }

      return `${ACTIVITY_IMAGE_BUCKETS[0]}:${fileName}`
    } catch (error) {
      console.error('Error uploading activity image:', error)
      return null
    }
  },

  async updateActivity(activityId, updates) {
    const normalizedUpdates = normalizeTimeFields(updates)

    // If marking as banner, clear any existing banner first
    if (normalizedUpdates.show_as_banner) {
      await supabase
        .from('activities')
        .update({ show_as_banner: false })
        .eq('show_as_banner', true)
        .neq('id', activityId)
    }

    const { data, error } = await supabase
      .from('activities')
      .update(normalizedUpdates)
      .eq('id', activityId)
      .select()

    if (error) throw error
    return data?.[0] || data
  },

  async deleteActivity(activityId) {
    const { data, error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .select('id, image_url')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw new Error('لم يتم حذف النشاط من قاعدة البيانات')
    }

    const imagePath = extractActivityImagePath(data.image_url)
    const imageBucket = extractActivityImageBucket(data.image_url)
    if (imagePath?.startsWith(ACTIVITY_IMAGES_PREFIX)) {
      const { error: storageError } = await supabase.storage
        .from(imageBucket)
        .remove([imagePath])

      if (storageError) {
        console.error('Error removing activity image from storage:', storageError)
      }
    }

    return true
  },

  // ---- SEMESTERS ----
  async getSemesters() {
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .order('year', { ascending: false })

    if (error) throw error
    return data || []
  },

  async setActiveSemester(semesterId) {
    // First, deactivate all semesters
    await supabase
      .from('semesters')
      .update({ is_active: false })
      .neq('id', 0)

    // Then activate the selected one
    const { data, error } = await supabase
      .from('semesters')
      .update({ is_active: true })
      .eq('id', semesterId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export default {
  auth: authService,
  student: studentService,
  professor: professorService,
  admin: adminService
}
