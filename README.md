# منصة التعلم الجامعية | University Learning Platform

A modern, mobile-first university learning platform frontend built with React, TailwindCSS, and Vite.

## 🎯 Overview

This is a **demo frontend** designed for presentation to university leadership. It showcases a complete learning management system with two user roles: **Students** and **Professors**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 Features

### Student Experience
- **Dashboard** - Overview of subjects, upcoming quizzes, today's lectures, progress snapshot
- **Subject Pages** - Lectures list, quizzes tab, announcements
- **Lecture Pages** - Materials, AI-generated summaries, Q&A section, AI chat assistant
- **Activities Feed** - Events, internships, courses, podcasts, tools
- **Points & Leaderboard** - Gamification with points and rankings
- **Calendar** - Week/month views with lectures and quiz deadlines

### Professor Experience
- **Dashboard** - Courses overview, student questions, top performers
- **Course Management** - Upload lectures, create quizzes (manual + AI-generated UI)
- **Lecture Management** - Edit summaries, answer student questions
- **Student Performance** - Analytics charts, completion rates, scores

## 🎨 Design

- **Mobile-first** responsive design
- **Arabic typography** using IBM Plex Sans Arabic
- **RTL support** throughout
- **Clean academic UI** with professional color palette
- **Modern components** with subtle shadows and rounded corners

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Styling | TailwindCSS 3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Charts | Recharts |
| Date Utilities | date-fns |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, Badge, etc.)
│   └── layout/      # Layout components (Sidebar, Header)
├── pages/
│   ├── student/     # Student screens
│   └── professor/   # Professor screens
├── data/
│   └── mockData.js  # Realistic Arabic mock data
├── lib/
│   └── utils.js     # Utility functions
└── App.jsx          # Main app with routing
```

## 🔐 Demo Access

The login page provides two demo entry points:
- **Student View** - Full student experience
- **Professor View** - Full professor experience

## 📝 Notes

- This is a **UI/UX demo** with mock data
- No backend integration required
- All data is static and for demonstration purposes
- The AI features show UI placeholders only

## 📄 License

For demonstration purposes only.
