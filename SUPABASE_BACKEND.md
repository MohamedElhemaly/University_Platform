# Supabase Backend Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the backend using Supabase, including database schemas, Row Level Security (RLS) policies, storage buckets, and Edge Functions.

---

## 1. Database Schema

### Core Tables

#### `users` (Managed by Supabase Auth)
Uses Supabase's built-in `auth.users` table. Extended with profiles.

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'professor', 'admin')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_first_login BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `colleges`
```sql
CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `departments`
```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, name)
);
```

#### `semesters`
```sql
CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  year TEXT NOT NULL,
  term INTEGER NOT NULL CHECK (term IN (1, 2)),
  is_active BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, term)
);
```

#### `students`
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  college_id INTEGER REFERENCES colleges(id),
  department_id INTEGER REFERENCES departments(id),
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
  semester_id INTEGER REFERENCES semesters(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  points INTEGER DEFAULT 0,
  ai_credits INTEGER DEFAULT 50,
  max_ai_credits INTEGER DEFAULT 50
);
```

#### `professors`
```sql
CREATE TABLE professors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  professor_id TEXT UNIQUE NOT NULL,
  college_id INTEGER REFERENCES colleges(id),
  department_id INTEGER REFERENCES departments(id),
  title TEXT NOT NULL CHECK (title IN ('أستاذ', 'أستاذ مشارك', 'أستاذ مساعد')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);
```

#### `admins`
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin'))
);
```

#### `materials` (Courses/Subjects)
```sql
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  college_id INTEGER REFERENCES colleges(id),
  department_id INTEGER REFERENCES departments(id),
  year INTEGER NOT NULL,
  semester_id INTEGER REFERENCES semesters(id),
  credits INTEGER DEFAULT 3,
  professor_id UUID REFERENCES professors(id),
  color TEXT DEFAULT '#3b82f6',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `student_materials` (Many-to-Many)
```sql
CREATE TABLE student_materials (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, material_id)
);
```

#### `lectures`
```sql
CREATE TABLE lectures (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 90, -- minutes
  location TEXT,
  order_index INTEGER NOT NULL,
  ai_summary TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `lecture_materials` (Files)
```sql
CREATE TABLE lecture_materials (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'code', 'other')),
  file_url TEXT NOT NULL,
  file_size TEXT,
  duration TEXT, -- for videos
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `student_lecture_progress`
```sql
CREATE TABLE student_lecture_progress (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lecture_id)
);
```

#### `quizzes`
```sql
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
  lecture_id INTEGER REFERENCES lectures(id), -- optional, can be null
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('online', 'offline')),
  questions_count INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  points INTEGER NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN DEFAULT false,
  allow_review BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `quiz_questions`
```sql
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB, -- for multiple choice: ["option1", "option2", ...]
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL
);
```

#### `quiz_submissions`
```sql
CREATE TABLE quiz_submissions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- {question_id: answer}
  score INTEGER,
  total_points INTEGER,
  time_spent INTEGER, -- seconds
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(quiz_id, student_id)
);
```

#### `lecture_questions` (Q&A)
```sql
CREATE TABLE lecture_questions (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  answered_by UUID REFERENCES professors(id),
  answered_at TIMESTAMPTZ,
  votes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `question_votes`
```sql
CREATE TABLE question_votes (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES lecture_questions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, student_id)
);
```

#### `announcements`
```sql
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professors(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `activities`
```sql
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('event', 'workshop', 'course', 'competition', 'club', 'volunteering', 'internship', 'podcast', 'tool')),
  date DATE,
  time TIME,
  location TEXT,
  duration TEXT,
  company TEXT,
  instructor TEXT,
  host TEXT,
  link TEXT,
  image_url TEXT,
  submitted_by UUID REFERENCES students(id),
  approved_by UUID REFERENCES admins(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  show_as_banner BOOLEAN DEFAULT false,
  target_college_id INTEGER REFERENCES colleges(id),
  target_year INTEGER,
  target_semester_id INTEGER REFERENCES semesters(id),
  is_admin_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `calendar_events`
```sql
CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lecture', 'quiz_online', 'quiz_offline', 'office_hours', 'meeting', 'exam', 'other')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  color TEXT DEFAULT '#3b82f6',
  material_id INTEGER REFERENCES materials(id),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'announcement', 'grade', 'activity', 'points', 'question', 'submission', 'reminder', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `points_history`
```sql
CREATE TABLE points_history (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('quiz', 'attendance', 'activity', 'bonus', 'penalty')),
  source_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `achievements`
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_required INTEGER,
  condition_type TEXT NOT NULL,
  condition_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `student_achievements`
```sql
CREATE TABLE student_achievements (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);
```

#### `user_settings`
```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  quiz_reminders BOOLEAN DEFAULT true,
  announcement_alerts BOOLEAN DEFAULT true,
  grade_alerts BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'ar',
  theme TEXT DEFAULT 'light',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `login_history`
```sql
CREATE TABLE login_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ai_chat_history`
```sql
CREATE TABLE ai_chat_history (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  messages JSONB NOT NULL, -- [{role: 'user'|'assistant', content: '...'}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
```

### Sample RLS Policies

#### Profiles
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );
```

#### Students
```sql
-- Students can view their own data
CREATE POLICY "Students view own data" ON students
  FOR SELECT USING (id = auth.uid());

-- Professors can view students in their materials
CREATE POLICY "Professors view enrolled students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_materials sm
      JOIN materials m ON sm.material_id = m.id
      WHERE sm.student_id = students.id
      AND m.professor_id = auth.uid()
    )
  );

-- Admins can manage all students
CREATE POLICY "Admins manage students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );
```

#### Materials
```sql
-- Students can view their enrolled materials
CREATE POLICY "Students view enrolled materials" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_materials
      WHERE student_id = auth.uid()
      AND material_id = materials.id
    )
  );

-- Professors can view their assigned materials
CREATE POLICY "Professors view assigned materials" ON materials
  FOR SELECT USING (professor_id = auth.uid());

-- Professors can update their materials
CREATE POLICY "Professors update materials" ON materials
  FOR UPDATE USING (professor_id = auth.uid());

-- Admins can manage all materials
CREATE POLICY "Admins manage materials" ON materials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );
```

#### Notifications
```sql
-- Users can only view their own notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

#### Quiz Submissions
```sql
-- Students can view their own submissions
CREATE POLICY "Students view own submissions" ON quiz_submissions
  FOR SELECT USING (student_id = auth.uid());

-- Students can create submissions
CREATE POLICY "Students create submissions" ON quiz_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Professors can view submissions for their quizzes
CREATE POLICY "Professors view quiz submissions" ON quiz_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN materials m ON q.material_id = m.id
      WHERE q.id = quiz_submissions.quiz_id
      AND m.professor_id = auth.uid()
    )
  );
```

---

## 3. Storage Buckets

### Required Buckets
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('lecture-materials', 'lecture-materials', false),
  ('activity-images', 'activity-images', true);
```

### Storage Policies

#### Avatars Bucket
```sql
-- Anyone can view avatars
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Lecture Materials Bucket
```sql
-- Students can view materials for enrolled courses
CREATE POLICY "Students view lecture materials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lecture-materials' AND
    EXISTS (
      SELECT 1 FROM lecture_materials lm
      JOIN lectures l ON lm.lecture_id = l.id
      JOIN materials m ON l.material_id = m.id
      JOIN student_materials sm ON sm.material_id = m.id
      WHERE sm.student_id = auth.uid()
      AND lm.file_url LIKE '%' || name
    )
  );

-- Professors can upload materials for their courses
CREATE POLICY "Professors upload materials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lecture-materials' AND
    EXISTS (
      SELECT 1 FROM materials
      WHERE professor_id = auth.uid()
    )
  );
```

---

## 4. Database Functions

### Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ... repeat for other tables
```

### Calculate student rank
```sql
CREATE OR REPLACE FUNCTION get_student_rank(student_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  rank INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO rank
  FROM students
  WHERE points > (SELECT points FROM students WHERE id = student_uuid);
  RETURN rank;
END;
$$ LANGUAGE plpgsql;
```

### Award points
```sql
CREATE OR REPLACE FUNCTION award_points(
  p_student_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_source_type TEXT,
  p_source_id INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Add to history
  INSERT INTO points_history (student_id, points, reason, source_type, source_id)
  VALUES (p_student_id, p_points, p_reason, p_source_type, p_source_id);
  
  -- Update total points
  UPDATE students
  SET points = points + p_points
  WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql;
```

### Auto-grade quiz
```sql
CREATE OR REPLACE FUNCTION grade_quiz_submission()
RETURNS TRIGGER AS $$
DECLARE
  total_score INTEGER := 0;
  total_points INTEGER := 0;
  question RECORD;
BEGIN
  FOR question IN
    SELECT id, correct_answer, points
    FROM quiz_questions
    WHERE quiz_id = NEW.quiz_id
  LOOP
    total_points := total_points + question.points;
    IF NEW.answers->question.id::text = question.correct_answer THEN
      total_score := total_score + question.points;
    END IF;
  END LOOP;
  
  NEW.score := total_score;
  NEW.total_points := total_points;
  NEW.graded_at := NOW();
  
  -- Award points
  PERFORM award_points(NEW.student_id, total_score, 'نتيجة اختبار', 'quiz', NEW.quiz_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_grade_quiz
  BEFORE INSERT ON quiz_submissions
  FOR EACH ROW EXECUTE FUNCTION grade_quiz_submission();
```

### Create notification
```sql
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link);
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Edge Functions

### AI Chat Function
Location: `supabase/functions/ai-chat/index.ts`
```typescript
// Edge function to handle AI chat with lecture context
// Connects to OpenAI or other AI provider
```

### AI Summary Generator
Location: `supabase/functions/generate-summary/index.ts`
```typescript
// Edge function to generate lecture summaries
```

### AI Quiz Generator
Location: `supabase/functions/generate-quiz/index.ts`
```typescript
// Edge function to generate quiz questions from lecture content
```

---

## 6. Views for Common Queries

### Student Dashboard View
```sql
CREATE VIEW student_dashboard AS
SELECT 
  s.id,
  p.name,
  p.avatar_url,
  s.student_id,
  s.points,
  c.name as college_name,
  d.name as department_name,
  s.year,
  sem.name as semester_name,
  s.ai_credits,
  s.max_ai_credits,
  get_student_rank(s.id) as rank,
  (SELECT COUNT(*) FROM student_materials WHERE student_id = s.id) as subjects_count,
  (SELECT COUNT(*) FROM quiz_submissions WHERE student_id = s.id) as completed_quizzes,
  (SELECT COUNT(*) FROM quizzes q 
   JOIN materials m ON q.material_id = m.id
   JOIN student_materials sm ON sm.material_id = m.id
   WHERE sm.student_id = s.id AND q.due_date > NOW()) as upcoming_quizzes
FROM students s
JOIN profiles p ON s.id = p.id
LEFT JOIN colleges c ON s.college_id = c.id
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN semesters sem ON s.semester_id = sem.id;
```

### Leaderboard View
```sql
CREATE VIEW leaderboard AS
SELECT 
  s.id,
  p.name,
  p.avatar_url,
  s.points,
  c.name as college_name,
  RANK() OVER (ORDER BY s.points DESC) as rank
FROM students s
JOIN profiles p ON s.id = p.id
JOIN colleges c ON s.college_id = c.id
WHERE s.status = 'active'
ORDER BY s.points DESC;
```

---

## 7. Indexes for Performance

```sql
-- Students
CREATE INDEX idx_students_college ON students(college_id);
CREATE INDEX idx_students_points ON students(points DESC);
CREATE INDEX idx_students_status ON students(status);

-- Materials
CREATE INDEX idx_materials_college ON materials(college_id);
CREATE INDEX idx_materials_professor ON materials(professor_id);
CREATE INDEX idx_materials_semester ON materials(semester_id);

-- Lectures
CREATE INDEX idx_lectures_material ON lectures(material_id);
CREATE INDEX idx_lectures_date ON lectures(date);

-- Quizzes
CREATE INDEX idx_quizzes_material ON quizzes(material_id);
CREATE INDEX idx_quizzes_due_date ON quizzes(due_date);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- Activities
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_date ON activities(date);
```

---

## 8. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# For Edge Functions (server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

---

## 9. Migration Order

1. Create colleges table
2. Create departments table
3. Create semesters table
4. Create profiles table
5. Create students table
6. Create professors table
7. Create admins table
8. Create materials table
9. Create student_materials table
10. Create lectures table
11. Create lecture_materials table
12. Create student_lecture_progress table
13. Create quizzes table
14. Create quiz_questions table
15. Create quiz_submissions table
16. Create lecture_questions table
17. Create question_votes table
18. Create announcements table
19. Create activities table
20. Create calendar_events table
21. Create notifications table
22. Create points_history table
23. Create achievements table
24. Create student_achievements table
25. Create user_settings table
26. Create login_history table
27. Create ai_chat_history table
28. Enable RLS on all tables
29. Create RLS policies
30. Create storage buckets
31. Create database functions
32. Create views
33. Create indexes
34. Seed initial data

---

## 10. Initial Seed Data

```sql
-- Insert active semester
INSERT INTO semesters (name, year, term, is_active) VALUES
  ('الفصل الأول', '2025-2026', 1, true),
  ('الفصل الثاني', '2025-2026', 2, false);

-- Insert colleges
INSERT INTO colleges (name, code) VALUES
  ('كلية الهندسة', 'ENG'),
  ('كلية العلوم', 'SCI'),
  ('كلية إدارة الأعمال', 'BUS');

-- Insert departments
INSERT INTO departments (college_id, name) VALUES
  (1, 'هندسة البرمجيات'),
  (1, 'هندسة الحاسب'),
  (1, 'هندسة الشبكات'),
  (1, 'هندسة النظم'),
  (2, 'الرياضيات'),
  (2, 'الفيزياء'),
  (2, 'الكيمياء'),
  (2, 'الأحياء'),
  (3, 'المحاسبة'),
  (3, 'التسويق'),
  (3, 'إدارة الموارد البشرية'),
  (3, 'المالية');

-- Insert default admin (after creating auth user)
-- INSERT INTO profiles (id, user_type, name, email, is_first_login) VALUES
--   ('admin-uuid', 'admin', 'مدير النظام', 'admin@university.edu', false);
-- INSERT INTO admins (id) VALUES ('admin-uuid');

-- Insert achievements
INSERT INTO achievements (name, description, icon, condition_type, condition_value) VALUES
  ('المتفوق', 'أكمل 10 اختبارات بنجاح', '🏆', 'quiz_count', '{"count": 10}'),
  ('النجم الأول', 'احتل المركز الأول في الترتيب', '⭐', 'rank', '{"rank": 1}'),
  ('المثابر', 'حضر 50 محاضرة متتالية', '📚', 'attendance', '{"count": 50}'),
  ('المتميز', 'حصل على 100% في اختبار', '💯', 'perfect_score', '{}'),
  ('المتعاون', 'أجاب على 20 سؤال من الزملاء', '🤝', 'answers', '{"count": 20}');
```

---

## 11. Checklist Before Starting

- [ ] Create Supabase project
- [ ] Set up authentication (Email/Password)
- [ ] Run all migrations in order
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Set up storage buckets
- [ ] Create Edge Functions for AI
- [ ] Test all policies
- [ ] Set environment variables in frontend
- [ ] Update API service to use Supabase client
