# 🚀 Quick Start Guide

## 1. Admin User Creation

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lgqofqzuvdybzcqzyboc`
3. Navigate to **Authentication > Users**
4. Click **"Add User"** (or "Invite User")
5. Fill in:
   - **Email:** `admin@university.edu`
   - **Password:** `Admin@2026!`
   - Check **"Auto Confirm User"** (important!)
6. Click **Create User**
7. Copy the **User UID** (UUID) that appears
8. Go to **SQL Editor** and run:

```sql
-- Replace YOUR_ADMIN_UUID with the UUID you copied
INSERT INTO profiles (id, user_type, name, email, is_first_login)
VALUES ('YOUR_ADMIN_UUID', 'admin', 'مدير النظام الرئيسي', 'admin@university.edu', false);

INSERT INTO admins (id, role)
VALUES ('YOUR_ADMIN_UUID', 'super_admin');
```

### Method 2: Quick Script (If you have service role key)

Run this in Supabase SQL Editor:

```sql
-- This creates everything at once
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        admin_uuid,
        'authenticated',
        'authenticated',
        'admin@university.edu',
        crypt('Admin@2026!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        ''
    );
    
    -- Create identity
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        admin_uuid,
        admin_uuid,
        format('{"sub":"%s","email":"admin@university.edu"}', admin_uuid)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    -- Create profile
    INSERT INTO profiles (id, user_type, name, email, is_first_login)
    VALUES (admin_uuid, 'admin', 'مدير النظام الرئيسي', 'admin@university.edu', false);
    
    -- Create admin record
    INSERT INTO admins (id, role)
    VALUES (admin_uuid, 'super_admin');
    
    RAISE NOTICE 'Admin user created successfully with UUID: %', admin_uuid;
    RAISE NOTICE 'Email: admin@university.edu';
    RAISE NOTICE 'Password: Admin@2026!';
END $$;
```

---

## 2. Login Page Links

### 🔗 Local Development (after running `npm run dev`)

| Role | URL | Default Port |
|------|-----|--------------|
| **Student** | http://localhost:5173/student/login | 5173 |
| **Professor** | http://localhost:5173/professor/login | 5173 |
| **Admin** | http://localhost:5173/admin/login | 5173 |

### Admin Credentials
- **Email:** `admin@university.edu`
- **Password:** `Admin@2026!`

---

## 3. Essential Tests Checklist

### ✅ Phase 1: Admin Setup (5 minutes)

1. **Login as Admin**
   - [ ] Navigate to http://localhost:5173/admin/login
   - [ ] Enter: `admin@university.edu` / `Admin@2026!`
   - [ ] Verify: Redirect to admin dashboard
   - [ ] Check: Stats display (students, professors, colleges counts)

2. **Create Test Professor**
   - [ ] Go to **Admin > Professors**
   - [ ] Click **"Add Professor"**
   - [ ] Fill form:
     - Name: `د. أحمد محمد`
     - Email: `prof@university.edu`
     - Professor ID: `PROF001`
     - College: Select any
     - Department: Select any
     - Title: `أستاذ مساعد`
   - [ ] Click **Save**
   - [ ] Verify: Professor appears in list

3. **Create Test Student**
   - [ ] Go to **Admin > Students**
   - [ ] Click **"Add Student"**
   - [ ] Fill form:
     - Name: `محمد علي`
     - Email: `student@university.edu`
     - Student ID: `30212191601582`
     - College: Select any
     - Department: Select any
     - Year: `3`
     - Semester: Select any
   - [ ] Click **Save**
   - [ ] Verify: Student appears in list

4. **Create Test Material/Course**
   - [ ] Go to **Admin > Materials**
   - [ ] Click **"Add Material"**
   - [ ] Fill form:
     - Code: `CS101`
     - Name: `مقدمة في البرمجة`
     - College: Select same as professor
     - Department: Select same
     - Year: `3`
     - Semester: Select any
     - Credits: `3`
   - [ ] Click **Save**
   - [ ] Assign professor to material
   - [ ] Enroll student in material

### ✅ Phase 2: Professor Login (5 minutes)

5. **First Login (Password Change)**
   - [ ] Logout from admin
   - [ ] Navigate to http://localhost:5173/professor/login
   - [ ] Enter: `prof@university.edu` / `prof@university.edu` (email as password)
   - [ ] Verify: Password change form appears
   - [ ] Set new password: `Prof@123`
   - [ ] Verify: Redirect to professor dashboard

6. **Professor Dashboard**
   - [ ] Check: Courses list displays
   - [ ] Verify: Course you assigned appears
   - [ ] Check: Stats show correct numbers

7. **Create Lecture**
   - [ ] Go to **Courses** > Click on course
   - [ ] Click **"Add Lecture"**
   - [ ] Fill form:
     - Title: `المحاضرة الأولى`
     - Description: `مقدمة في البرمجة`
     - Date: Today
     - Time: Any time
     - Order: `1`
   - [ ] Click **Save**
   - [ ] Verify: Lecture appears in list

8. **Create Quiz**
   - [ ] In course page, go to **Quizzes** tab
   - [ ] Click **"Add Quiz"**
   - [ ] Fill form:
     - Title: `اختبار الوحدة الأولى`
     - Duration: `30` minutes
     - Due Date: Tomorrow
     - Add 3-5 questions
   - [ ] Toggle **"Published"** to ON
   - [ ] Click **Save**
   - [ ] Verify: Quiz appears and is published

### ✅ Phase 3: Student Login (5 minutes)

9. **First Login (Password Change)**
   - [ ] Logout from professor
   - [ ] Navigate to http://localhost:5173/student/login
   - [ ] Enter: `30212191601582` / `30212191601582` (student ID as password)
   - [ ] Verify: Password change form appears
   - [ ] Set new password: `Student@123`
   - [ ] Verify: Redirect to student dashboard

10. **Student Dashboard**
    - [ ] Check: Welcome message with student name
    - [ ] Verify: Points display (should be 0 initially)
    - [ ] Check: Enrolled subjects list
    - [ ] Verify: Course you enrolled appears
    - [ ] Check: Today's lectures section
    - [ ] Check: Upcoming quizzes section

11. **View Subject**
    - [ ] Click on the enrolled subject
    - [ ] Verify: Subject detail page loads
    - [ ] Check: Lectures tab shows the lecture
    - [ ] Check: Quizzes tab shows the quiz
    - [ ] Check: Professor info displays

12. **Take Quiz**
    - [ ] Go to **Quizzes** tab
    - [ ] Click **"Start Quiz"** on the published quiz
    - [ ] Verify: Quiz page loads with timer
    - [ ] Answer questions
    - [ ] Click **"Submit Quiz"**
    - [ ] Verify: Results page shows score
    - [ ] Check: Points awarded (if configured)

### ✅ Phase 4: Cross-Role Verification (3 minutes)

13. **Professor Sees Submission**
    - [ ] Login as professor
    - [ ] Go to **Grading** page
    - [ ] Verify: Student's quiz submission appears
    - [ ] Check: Score is calculated correctly

14. **Admin Sees Activity**
    - [ ] Login as admin
    - [ ] Go to **Dashboard**
    - [ ] Verify: Stats updated (1 student, 1 professor, 1 material)
    - [ ] Go to **Students** page
    - [ ] Check: Student's points updated (if quiz awarded points)

### ✅ Phase 5: Critical Features (5 minutes)

15. **Announcements**
    - [ ] Login as professor
    - [ ] Go to **Announcements**
    - [ ] Create announcement for the course
    - [ ] Logout and login as student
    - [ ] Go to subject detail
    - [ ] Verify: Announcement appears in Announcements tab

16. **Calendar**
    - [ ] As student, go to **Calendar**
    - [ ] Verify: Lecture appears on calendar
    - [ ] Verify: Quiz appears on calendar

17. **Notifications**
    - [ ] As student, click notifications icon
    - [ ] Verify: Notifications load (if any)
    - [ ] Mark one as read
    - [ ] Verify: Status changes

18. **Settings**
    - [ ] Go to **Settings**
    - [ ] Update profile name
    - [ ] Toggle notification settings
    - [ ] Click **Save**
    - [ ] Verify: Changes saved

19. **Logout & Session**
    - [ ] Click logout
    - [ ] Verify: Redirect to login page
    - [ ] Try to access dashboard directly
    - [ ] Verify: Redirect back to login

20. **Responsive Design**
    - [ ] Resize browser to mobile size
    - [ ] Verify: Layout adapts properly
    - [ ] Check: Sidebar becomes hamburger menu
    - [ ] Verify: All pages are usable on mobile

---

## 🐛 Common Issues & Solutions

### Issue: "Supabase not configured"
**Solution:** Check `.env` file has correct values:
```
VITE_SUPABASE_URL=https://lgqofqzuvdybzcqzyboc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Issue: "User not found" on login
**Solution:** 
1. Verify user exists in Supabase Auth
2. Check profile and role tables have matching records
3. Run this query:
```sql
SELECT p.*, s.student_id, pr.professor_id, a.role
FROM profiles p
LEFT JOIN students s ON s.id = p.id
LEFT JOIN professors pr ON pr.id = p.id
LEFT JOIN admins a ON a.id = p.id
WHERE p.email = 'your@email.com';
```

### Issue: RLS policy blocks access
**Solution:** Check RLS policies are enabled:
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check specific policies
SELECT * FROM pg_policies WHERE tablename = 'students';
```

### Issue: First login not working
**Solution:** Ensure `is_first_login` is set to `true` in profiles table

---

## 📊 Test Results Template

Copy this to track your testing:

```
✅ PASSED | ❌ FAILED | ⏭️ SKIPPED

Phase 1: Admin Setup
[ ] 1. Admin login
[ ] 2. Create professor
[ ] 3. Create student
[ ] 4. Create material

Phase 2: Professor
[ ] 5. First login & password change
[ ] 6. Dashboard loads
[ ] 7. Create lecture
[ ] 8. Create quiz

Phase 3: Student
[ ] 9. First login & password change
[ ] 10. Dashboard loads
[ ] 11. View subject
[ ] 12. Take quiz

Phase 4: Cross-Role
[ ] 13. Professor sees submission
[ ] 14. Admin sees activity

Phase 5: Critical Features
[ ] 15. Announcements
[ ] 16. Calendar
[ ] 17. Notifications
[ ] 18. Settings
[ ] 19. Logout
[ ] 20. Responsive

TOTAL: ___/20 passed
```

---

## 🎯 Success Criteria

Your platform is working correctly if:
- ✅ All 3 roles can login
- ✅ Admin can create users
- ✅ Professor can create content
- ✅ Student can access and interact with content
- ✅ Data persists in Supabase
- ✅ RLS policies protect data correctly

---

## 📞 Need Help?

If tests fail, check:
1. Browser console for errors (F12)
2. Network tab for failed API calls
3. Supabase logs in dashboard
4. `TEST_CHECKLIST.md` for detailed test cases (143 total tests)
