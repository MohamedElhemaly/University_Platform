# Comprehensive Test Checklist for University Platform

## Pre-Testing Setup

### 1. Create Test Users in Supabase
Before testing, you need to create test users. Go to Supabase Dashboard > Authentication > Users.

#### Create Admin User
```sql
-- Run in Supabase SQL Editor

-- 1. First create auth user via Dashboard or API
-- Email: admin@university.edu
-- Password: Admin@123

-- 2. Then run this after getting the user UUID:
INSERT INTO profiles (id, user_type, name, email, is_first_login)
VALUES ('YOUR_ADMIN_UUID', 'admin', 'مدير النظام', 'admin@university.edu', false);

INSERT INTO admins (id, role)
VALUES ('YOUR_ADMIN_UUID', 'super_admin');
```

#### Create Test Professor
```sql
-- Create via Dashboard: prof@university.edu / Prof@123
INSERT INTO profiles (id, user_type, name, email, is_first_login)
VALUES ('PROF_UUID', 'professor', 'د. أحمد محمد', 'prof@university.edu', true);

INSERT INTO professors (id, professor_id, college_id, department_id, title, status)
VALUES ('PROF_UUID', 'PROF001', 1, 1, 'أستاذ مساعد', 'active');
```

#### Create Test Student
```sql
-- Create via Dashboard: student@university.edu / Student@123
INSERT INTO profiles (id, user_type, name, email, is_first_login)
VALUES ('STUDENT_UUID', 'student', 'محمد علي', 'student@university.edu', true);

INSERT INTO students (id, student_id, college_id, department_id, year, semester_id, status, points)
VALUES ('STUDENT_UUID', '30212191601582', 1, 1, 3, 1, 'active', 150);
```

---

## Test Checklist

### Authentication Tests

#### Student Login
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Login page loads | Navigate to `/student/login` | Login form displayed | ☐ |
| 2 | Empty fields validation | Click login with empty fields | Error: "يرجى إدخال جميع البيانات" | ☐ |
| 3 | Invalid student ID | Enter wrong student ID | Error: "رقم الطالب غير موجود" | ☐ |
| 4 | Wrong password | Enter correct ID, wrong password | Error: "كلمة المرور غير صحيحة" | ☐ |
| 5 | First login detection | Login with student_id as password | Password change form appears | ☐ |
| 6 | Password change - short | Enter 5 char password | Error: "6 أحرف على الأقل" | ☐ |
| 7 | Password change - mismatch | Enter different passwords | Error: "غير متطابقة" | ☐ |
| 8 | Password change - success | Enter valid matching passwords | Redirect to dashboard | ☐ |
| 9 | Regular login | Login with changed password | Redirect to dashboard | ☐ |
| 10 | Session persistence | Refresh page after login | Stay logged in | ☐ |

#### Professor Login
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 11 | Login page loads | Navigate to `/professor/login` | Login form displayed | ☐ |
| 12 | First login with email | Use email as password | Password change form | ☐ |
| 13 | Password change success | Set new password | Redirect to dashboard | ☐ |
| 14 | Regular login | Login with new password | Success | ☐ |

#### Admin Login
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 15 | Login page loads | Navigate to `/admin/login` | Login form displayed | ☐ |
| 16 | Valid credentials | Enter admin credentials | Redirect to dashboard | ☐ |
| 17 | Invalid credentials | Enter wrong password | Error message | ☐ |

#### Logout
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 18 | Logout from student | Click logout in sidebar | Redirect to student login | ☐ |
| 19 | Logout from professor | Click logout in sidebar | Redirect to professor login | ☐ |
| 20 | Logout from admin | Click logout in sidebar | Redirect to admin login | ☐ |
| 21 | Session cleared | Try to access dashboard after logout | Redirect to login | ☐ |

---

### Student Features Tests

#### Dashboard
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 22 | Dashboard loads | Login and navigate to dashboard | Dashboard with stats | ☐ |
| 23 | User info displays | Check welcome section | Name, points, rank shown | ☐ |
| 24 | Subjects list | Check subjects section | Enrolled subjects displayed | ☐ |
| 25 | Today's lectures | Check schedule | Today's lectures shown | ☐ |
| 26 | Upcoming quizzes | Check quizzes section | Upcoming quizzes listed | ☐ |

#### Subjects
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 27 | Subjects page loads | Navigate to `/student/subjects` | Grid of subjects | ☐ |
| 28 | Subject cards display | Check card content | Name, professor, progress | ☐ |
| 29 | Click subject | Click on a subject card | Navigate to subject detail | ☐ |

#### Subject Detail
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 30 | Subject detail loads | Click on a subject | Subject info, tabs shown | ☐ |
| 31 | Lectures tab | View lectures tab | List of lectures | ☐ |
| 32 | Quizzes tab | View quizzes tab | List of quizzes | ☐ |
| 33 | Announcements tab | View announcements | List of announcements | ☐ |
| 34 | Click lecture | Click on a lecture | Navigate to lecture detail | ☐ |

#### Lecture Detail
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 35 | Lecture detail loads | Navigate to lecture | Lecture info shown | ☐ |
| 36 | Materials list | Check materials section | PDFs, videos listed | ☐ |
| 37 | Download material | Click download button | File downloads | ☐ |
| 38 | AI summary | Check AI summary section | Summary displayed (if exists) | ☐ |
| 39 | Q&A section | Check questions section | Questions listed | ☐ |
| 40 | Ask question | Submit a question | Question added to list | ☐ |
| 41 | Vote on question | Click vote button | Vote count updates | ☐ |

#### Quiz Taking
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 42 | Start quiz | Click start quiz button | Quiz page loads | ☐ |
| 43 | Timer works | Watch timer | Countdown active | ☐ |
| 44 | Answer question | Select an answer | Answer highlighted | ☐ |
| 45 | Navigate questions | Use next/prev buttons | Move between questions | ☐ |
| 46 | Flag question | Click flag button | Question marked | ☐ |
| 47 | Submit quiz | Click submit | Confirmation modal | ☐ |
| 48 | View results | Confirm submit | Results page shown | ☐ |
| 49 | Auto-submit | Wait for timer to end | Quiz auto-submits | ☐ |

#### Calendar
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 50 | Calendar loads | Navigate to `/student/calendar` | Calendar view | ☐ |
| 51 | Events display | Check calendar | Events color-coded | ☐ |
| 52 | Weekly view | Toggle to weekly | Week view shown | ☐ |
| 53 | List view | Toggle to list | List of events | ☐ |

#### Activities
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 54 | Activities page loads | Navigate to activities | Activities grid | ☐ |
| 55 | Filter by category | Click category filter | Filtered results | ☐ |
| 56 | Activity details | Click activity card | Details expand/modal | ☐ |
| 57 | Submit activity | Click submit button | Submission form | ☐ |
| 58 | Submit success | Fill and submit | Success message | ☐ |

#### Points & Leaderboard
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 59 | Points page loads | Navigate to `/student/points` | Points info | ☐ |
| 60 | Points history | Check history section | List of transactions | ☐ |
| 61 | Leaderboard | Check leaderboard | Top students ranked | ☐ |
| 62 | Achievements | Check achievements | Earned badges shown | ☐ |

#### Settings
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 63 | Settings page loads | Navigate to settings | Settings tabs | ☐ |
| 64 | Profile tab | View profile | User info displayed | ☐ |
| 65 | Update profile | Change name | Success message | ☐ |
| 66 | Upload avatar | Upload image | Avatar updated | ☐ |
| 67 | Notification settings | Toggle settings | Settings saved | ☐ |
| 68 | Change password | Enter new password | Password updated | ☐ |

#### Notifications
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 69 | Notifications load | Navigate to notifications | List of notifications | ☐ |
| 70 | Mark as read | Click notification | Marked as read | ☐ |
| 71 | Mark all read | Click mark all | All marked read | ☐ |

---

### Professor Features Tests

#### Dashboard
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 72 | Dashboard loads | Login as professor | Dashboard displayed | ☐ |
| 73 | Courses overview | Check courses section | List of courses | ☐ |
| 74 | Unanswered questions | Check questions | Recent questions shown | ☐ |

#### Courses
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 75 | Courses page loads | Navigate to courses | Grid of courses | ☐ |
| 76 | Course card info | Check card content | Students count, lectures | ☐ |
| 77 | Click course | Click on course | Course management page | ☐ |

#### Course Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 78 | Course detail loads | Navigate to course | Course info, tabs | ☐ |
| 79 | Add lecture | Click add lecture | Lecture form modal | ☐ |
| 80 | Save lecture | Fill and save | Lecture added | ☐ |
| 81 | Add quiz | Click add quiz | Quiz form modal | ☐ |
| 82 | Create quiz questions | Add questions | Questions saved | ☐ |
| 83 | Publish quiz | Toggle publish | Quiz published | ☐ |

#### Lecture Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 84 | Lecture page loads | Click on lecture | Lecture management | ☐ |
| 85 | Upload material | Click upload | File upload dialog | ☐ |
| 86 | Material uploaded | Select file | Material added to list | ☐ |
| 87 | Delete material | Click delete | Material removed | ☐ |
| 88 | View student progress | Check progress section | Students listed | ☐ |

#### Announcements
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 89 | Announcements load | Navigate to announcements | List displayed | ☐ |
| 90 | Create announcement | Click create | Form modal | ☐ |
| 91 | Post announcement | Fill and post | Announcement added | ☐ |
| 92 | Edit announcement | Click edit | Edit form | ☐ |
| 93 | Delete announcement | Click delete | Announcement removed | ☐ |

#### Grading
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 94 | Grading page loads | Navigate to grading | Quiz results | ☐ |
| 95 | Filter by course | Select course | Filtered results | ☐ |
| 96 | View submissions | Expand quiz | Student submissions | ☐ |
| 97 | Export results | Click export | CSV/Excel downloaded | ☐ |

#### Performance
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 98 | Performance page | Navigate to performance | Students table | ☐ |
| 99 | Search student | Enter student name | Filtered results | ☐ |
| 100 | View student detail | Click student | Detail modal/page | ☐ |

---

### Admin Features Tests

#### Dashboard
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 101 | Dashboard loads | Login as admin | Stats displayed | ☐ |
| 102 | Stats accurate | Check counts | Correct numbers | ☐ |
| 103 | Pending activities | Check alert | Count shown if pending | ☐ |

#### Students Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 104 | Students page loads | Navigate to students | Students table | ☐ |
| 105 | Search student | Enter search term | Filtered results | ☐ |
| 106 | Filter by college | Select college | Filtered results | ☐ |
| 107 | Add student | Click add | Student form modal | ☐ |
| 108 | Create student | Fill form and save | Student added | ☐ |
| 109 | Toggle status | Click activate/deactivate | Status changed | ☐ |
| 110 | Assign materials | Click assign | Materials modal | ☐ |

#### Professors Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 111 | Professors page loads | Navigate to professors | Professors table | ☐ |
| 112 | Add professor | Click add | Professor form | ☐ |
| 113 | Create professor | Fill and save | Professor added | ☐ |
| 114 | Toggle status | Click status button | Status changed | ☐ |
| 115 | Assign courses | Click assign | Courses modal | ☐ |

#### Colleges Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 116 | Colleges page loads | Navigate to colleges | Colleges list | ☐ |
| 117 | Add college | Click add | College form | ☐ |
| 118 | Create college | Fill and save | College added | ☐ |
| 119 | Add department | Click add dept | Department form | ☐ |
| 120 | Create department | Fill and save | Department added | ☐ |

#### Materials Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 121 | Materials page loads | Navigate to materials | Materials table | ☐ |
| 122 | Filter materials | Use filters | Filtered results | ☐ |
| 123 | Add material | Click add | Material form | ☐ |
| 124 | Create material | Fill and save | Material added | ☐ |
| 125 | Assign professor | Click assign | Professor dropdown | ☐ |

#### Activities Management
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 126 | Activities page loads | Navigate to activities | Pending/Approved tabs | ☐ |
| 127 | View pending | Check pending tab | Pending activities | ☐ |
| 128 | Approve activity | Click approve | Status changed | ☐ |
| 129 | Reject activity | Click reject | Reason prompt, rejected | ☐ |
| 130 | Create activity | Click create | Activity form | ☐ |
| 131 | Admin activity | Fill and save | Activity created (approved) | ☐ |

---

### Integration Tests

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 132 | Admin creates student | Create student in admin | Student can login | ☐ |
| 133 | Admin creates professor | Create professor in admin | Professor can login | ☐ |
| 134 | Admin assigns material | Assign material to student | Student sees material | ☐ |
| 135 | Professor creates quiz | Create and publish quiz | Student sees quiz | ☐ |
| 136 | Student takes quiz | Complete quiz | Points awarded | ☐ |
| 137 | Professor sees results | Check grading | Submission visible | ☐ |
| 138 | Professor posts announcement | Create announcement | Student sees it | ☐ |
| 139 | Student submits activity | Submit activity | Admin sees pending | ☐ |
| 140 | Admin approves activity | Approve activity | Student sees approved | ☐ |

---

### Performance & Edge Cases

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 141 | Large data load | 100+ students in table | Table loads < 3s | ☐ |
| 142 | Concurrent users | Multiple logins | All work correctly | ☐ |
| 143 | Network offline | Disconnect network | Graceful error | ☐ |
| 144 | Invalid URL | Navigate to `/student/xyz` | Redirect to login | ☐ |
| 145 | Direct URL access | Access dashboard without login | Redirect to login | ☐ |
| 146 | RTL layout | Check all pages | Proper RTL display | ☐ |
| 147 | Mobile responsive | Resize to mobile | Layout adapts | ☐ |

---

## Database Verification

Run these queries in Supabase SQL Editor to verify data:

```sql
-- Check users
SELECT p.*, s.student_id, pr.professor_id, a.role
FROM profiles p
LEFT JOIN students s ON s.id = p.id
LEFT JOIN professors pr ON pr.id = p.id
LEFT JOIN admins a ON a.id = p.id;

-- Check enrollments
SELECT sm.*, p.name as student_name, m.name as material_name
FROM student_materials sm
JOIN students s ON s.id = sm.student_id
JOIN profiles p ON p.id = s.id
JOIN materials m ON m.id = sm.material_id;

-- Check quiz submissions
SELECT qs.*, p.name as student_name, q.title as quiz_title
FROM quiz_submissions qs
JOIN students s ON s.id = qs.student_id
JOIN profiles p ON p.id = s.id
JOIN quizzes q ON q.id = qs.quiz_id;

-- Check points
SELECT ph.*, p.name as student_name
FROM points_history ph
JOIN students s ON s.id = ph.student_id
JOIN profiles p ON p.id = s.id
ORDER BY ph.created_at DESC;
```

---

## Quick Smoke Test (5 minutes)

Run this minimal test to verify basic functionality:

1. ☐ Navigate to `/admin/login` → Login with admin credentials
2. ☐ Create a test student → Verify in students list
3. ☐ Logout → Navigate to `/student/login`
4. ☐ Login as test student (first login) → Change password
5. ☐ View dashboard → Verify data loads
6. ☐ Logout → Session cleared

If all 6 pass, basic integration is working.

---

## Test Results Summary

| Category | Total | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Authentication | 21 | | | |
| Student Features | 48 | | | |
| Professor Features | 27 | | | |
| Admin Features | 31 | | | |
| Integration | 9 | | | |
| Performance | 7 | | | |
| **TOTAL** | **143** | | | |

**Tester:** ___________________
**Date:** ___________________
**Environment:** Development / Staging / Production
**Browser:** ___________________
**Notes:** ___________________
