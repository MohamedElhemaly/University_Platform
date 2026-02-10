# Platform Feature Checklist for Backend Integration

## Overview
This document lists ALL features, buttons, and forms in the platform that need backend integration.

---

## Authentication System ✅

### Login Pages
| Page | Feature | Status | Notes |
|------|---------|--------|-------|
| `/student/login` | Student ID login | ✅ Ready | Uses student_id as username |
| `/student/login` | First login password change | ✅ Ready | Forces password change |
| `/professor/login` | Email login | ✅ Ready | Uses email as username |
| `/professor/login` | First login password change | ✅ Ready | Forces password change |
| `/admin/login` | Admin login | ✅ Ready | Username/password |

### Auth Flow
- [x] Login form submission
- [x] Password validation
- [x] First login detection
- [x] Password change on first login
- [x] Redirect to dashboard after login
- [x] Logout functionality
- [x] Session management (localStorage for now)

---

## Student Pages

### Dashboard (`/student/dashboard`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Welcome banner | Static | User profile data |
| Points display | Static | `students.points` |
| Rank display | Static | Calculated from points |
| Quick stats (subjects, quizzes) | Cards | Aggregated data |
| University news banner | Banner | `activities` with `show_as_banner=true` |
| Subjects list | Cards | `student_materials` joined with `materials` |
| Today's lectures | List | `calendar_events` for today |
| Upcoming quizzes | List | `quizzes` with `due_date > now` |
| Progress snapshot | Chart | Quiz completion stats |

### Subjects (`/student/subjects`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Subject cards | Grid | `student_materials` with `materials` |
| Progress bars | Progress | `student_lecture_progress` count |
| Upcoming quiz alerts | Badge | `quizzes` for each material |

### Subject Detail (`/student/subjects/:id`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Subject header | Header | `materials` by ID |
| Lectures tab | List | `lectures` for material |
| Quizzes tab | List | `quizzes` for material |
| Announcements tab | List | `announcements` for material |
| Lecture click | Navigation | N/A (client-side) |

### Lecture Detail (`/student/subjects/:subjectId/lectures/:lectureId`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Lecture info | Header | `lectures` by ID |
| Materials list | List | `lecture_materials` |
| Download material | Button | Storage download URL |
| AI Summary | Card | `lectures.ai_summary` |
| Q&A section | List | `lecture_questions` |
| Post question | Form | INSERT `lecture_questions` |
| Vote on question | Buttons | INSERT/UPDATE `question_votes` |
| AI Chat | Chat | Edge Function + `ai_chat_history` |
| Quiz section | Card | `quizzes` for lecture |
| Start quiz | Button | Navigate to quiz page |

### Calendar (`/student/calendar`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Weekly view | Grid | `calendar_events` for student |
| List view | List | Same as above |
| Event details | Modal | Event data |
| Filter by type | Buttons | Client-side filter |

### Activities (`/student/activities`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Activities grid | Grid | `activities` where `status='approved'` |
| Filter by category | Buttons | Client-side filter |
| Submit activity | Modal/Form | INSERT `activities` with `status='pending'` |
| My submissions | List | `activities` where `submitted_by=user_id` |

### Points (`/student/points`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Points summary | Card | `students.points` |
| Points history | List | `points_history` |
| Leaderboard | Table | `leaderboard` view |
| Achievements | Grid | `student_achievements` joined with `achievements` |

### Resources (`/student/resources`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Resources grid | Grid | `lecture_materials` for enrolled courses |
| Search | Input | Client-side or query |
| Filter by subject | Select | Client-side filter |
| Filter by type | Select | Client-side filter |
| Download | Button | Storage download URL |
| Favorite | Button | Need `resource_favorites` table |

### Settings (`/student/settings`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Profile tab - Avatar | Image | Storage upload/download |
| Profile tab - Info | Form | UPDATE `profiles` |
| Notifications tab | Toggles | UPDATE `user_settings` |
| Security tab - Password | Form | Supabase Auth update |
| Security tab - Login history | List | `login_history` |
| Preferences tab | Selects | UPDATE `user_settings` |

### Notifications (`/student/notifications`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Notifications list | List | `notifications` for user |
| Mark as read | Button | UPDATE `notifications.is_read` |
| Mark all read | Button | UPDATE all `notifications.is_read` |
| Click notification | Link | Navigate to `link` |

---

## Professor Pages

### Dashboard (`/professor/dashboard`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Welcome banner | Header | User profile |
| Quick stats | Cards | Aggregated course data |
| Courses overview | Cards | `materials` for professor |
| Recent questions | List | `lecture_questions` unanswered |
| Top students | List | Students by performance |

### Courses (`/professor/courses`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Course cards | Grid | `materials` for professor |
| Course stats | Stats | Aggregated data |

### Course Management (`/professor/courses/:id`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Course header | Header | `materials` by ID |
| Lectures tab | List | `lectures` for course |
| Add lecture | Modal | INSERT `lectures` |
| Quizzes tab | List | `quizzes` for course |
| Add quiz | Modal | INSERT `quizzes` + `quiz_questions` |
| AI Generate quiz | Button | Edge Function |
| Settings tab | Form | UPDATE `materials` |

### Lecture Management (`/professor/courses/:courseId/lectures/:lectureId`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Lecture info | Header | `lectures` by ID |
| Edit lecture | Form | UPDATE `lectures` |
| Materials list | List | `lecture_materials` |
| Upload material | Button | Storage upload + INSERT `lecture_materials` |
| Delete material | Button | DELETE `lecture_materials` + Storage |
| Student progress | List | `student_lecture_progress` |

### Performance (`/professor/performance`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Students table | Table | Students with grades |
| Filter by course | Select | Query filter |
| Search students | Input | Query filter |
| Student details | Modal | Student full data |
| Performance charts | Charts | Aggregated data |

### Announcements (`/professor/announcements`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Announcements list | List | `announcements` for professor |
| Create announcement | Modal | INSERT `announcements` |
| Edit announcement | Modal | UPDATE `announcements` |
| Delete announcement | Button | DELETE `announcements` |

### Grading (`/professor/grading`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Quiz results list | List | `quizzes` with submission stats |
| Filter by course | Select | Query filter |
| Expand quiz | Accordion | `quiz_submissions` |
| View student details | Button | Submission details |
| Export results | Button | Generate CSV/Excel |

### Calendar (`/professor/calendar`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Weekly view | Grid | `calendar_events` |
| Add event | Modal | INSERT `calendar_events` |
| Edit event | Modal | UPDATE `calendar_events` |
| Delete event | Button | DELETE `calendar_events` |
| Weekly summary | Stats | Event counts |

### Settings (`/professor/settings`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Profile info | Form | UPDATE `profiles` |
| Change password | Form | Supabase Auth update |
| Notification settings | Toggles | UPDATE `user_settings` |

### Notifications (`/professor/notifications`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Notifications list | List | `notifications` |
| Mark as read | Button | UPDATE `notifications` |

---

## Admin Pages

### Dashboard (`/admin/dashboard`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Stats cards | Cards | Aggregated counts |
| Pending activities alert | Alert | `activities` count |
| Recent students | List | `students` recent |
| Recent professors | List | `professors` recent |
| Quick actions | Buttons | Navigation |

### Students (`/admin/students`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Students table | Table | `students` with profiles |
| Search | Input | Query filter |
| Filter by college | Select | Query filter |
| Filter by status | Select | Query filter |
| Add student | Modal | INSERT `profiles` + `students` + Auth user |
| Toggle status | Button | UPDATE `students.status` |
| Assign materials | Modal | INSERT `student_materials` |

### Professors (`/admin/professors`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Professors table | Table | `professors` with profiles |
| Search | Input | Query filter |
| Filter by college | Select | Query filter |
| Add professor | Modal | INSERT `profiles` + `professors` + Auth user |
| Toggle status | Button | UPDATE `professors.status` |
| Assign materials | Modal | UPDATE `materials.professor_id` |

### Colleges (`/admin/colleges`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Colleges list | Cards | `colleges` with departments |
| Search | Input | Query filter |
| Add college | Modal | INSERT `colleges` |
| Edit college | Modal | UPDATE `colleges` |
| Manage departments | Inline | INSERT/UPDATE/DELETE `departments` |

### Materials (`/admin/materials`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Materials table | Table | `materials` |
| Search | Input | Query filter |
| Filter by college | Select | Query filter |
| Filter by year | Select | Query filter |
| Add material | Modal | INSERT `materials` |
| Assign professor | Modal | UPDATE `materials.professor_id` |

### Activities (`/admin/activities`)
| Feature | Component | Backend Needed |
|---------|-----------|----------------|
| Pending tab | List | `activities` where `status='pending'` |
| Approved tab | List | `activities` where `status='approved'` |
| View details | Expandable | Activity data |
| Approve | Button | UPDATE `activities.status` |
| Reject | Button | UPDATE `activities.status` + reason |
| Create activity | Modal | INSERT `activities` with `is_admin_created=true` |

---

## Missing Features to Add

### Student Features
1. **Quiz Taking Page** - Need to create `/student/quizzes/:id`
   - Display questions
   - Timer
   - Answer submission
   - Result display

2. **Resource Favorites** - Need `resource_favorites` table
   - Toggle favorite on resources

### Professor Features
1. **Quiz Editor** - Full quiz question management
   - Add/edit/delete questions
   - Reorder questions
   - Preview quiz

2. **AI Quiz Generation** - Edge Function
   - Generate questions from lecture content

### General Features
1. **Real-time Notifications** - Supabase Realtime
   - Subscribe to notifications table

2. **File Preview** - For PDFs and videos
   - In-browser preview before download

---

## Tables Summary

| Table | Records Needed | Priority |
|-------|---------------|----------|
| profiles | All users | Critical |
| students | All students | Critical |
| professors | All professors | Critical |
| admins | Admin users | Critical |
| colleges | 3+ | Critical |
| departments | 12+ | Critical |
| semesters | 2 | Critical |
| materials | Courses | Critical |
| student_materials | Enrollments | Critical |
| lectures | Per course | High |
| lecture_materials | Per lecture | High |
| quizzes | Per course | High |
| quiz_questions | Per quiz | High |
| quiz_submissions | Per attempt | High |
| announcements | Per course | Medium |
| activities | Various | Medium |
| notifications | Per user | Medium |
| calendar_events | Per user | Medium |
| points_history | Per student | Medium |
| achievements | System-wide | Low |
| student_achievements | Per student | Low |
| lecture_questions | Per lecture | Low |
| question_votes | Per question | Low |
| user_settings | Per user | Low |
| login_history | Per login | Low |
| ai_chat_history | Per chat | Low |

---

## API Endpoints Needed (Supabase RPC/Edge Functions)

1. `get_student_dashboard()` - Aggregated dashboard data
2. `get_leaderboard()` - Ranked students
3. `submit_quiz(quiz_id, answers)` - Auto-grade and save
4. `award_points(student_id, points, reason)` - Add points
5. `create_user(type, data)` - Admin creates users
6. `generate_quiz_ai(lecture_id, count)` - AI quiz generation
7. `chat_with_ai(lecture_id, message)` - AI chat

---

## Ready for Supabase Integration ✅

All pages have been reviewed and are ready for backend integration:
- Forms have proper field names
- Buttons have click handlers ready
- State management is in place
- Loading states can be added
- Error handling structure exists
