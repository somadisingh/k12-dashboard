# School Administration & Staff Performance Evaluation Platform
## Complete 5-Day Build Plan

> **Deadline:** June 15 | **Stack:** React + Tailwind, Node.js/Express, PostgreSQL (Prisma), OpenAI API

---

## Table of Contents
1. [What You're Building & What Will Impress](#1-what-youre-building--what-will-impress)
2. [Tech Stack Decisions](#2-tech-stack-decisions)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema (Complete Prisma)](#4-database-schema-complete-prisma)
5. [API Endpoints (Complete)](#5-api-endpoints-complete)
6. [Pages & UI Design Plan](#6-pages--ui-design-plan)
7. [Day-by-Day Execution Plan](#7-day-by-day-execution-plan)
8. [AI Integration Detail](#8-ai-integration-detail)
9. [Seed Data Plan](#9-seed-data-plan)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Final Submission Checklist](#11-final-submission-checklist)

---

## 1. What You're Building & What Will Impress

You're building the backend admin tool that **principals and department heads** use to evaluate teachers. Think of it as a professional HR/performance management system specifically designed for K-12 schools.

### The 5 core workflows in plain English:
| Workflow | What it means |
|---|---|
| Classroom Observation | An observer visits a teacher's class, scores them on a rubric, writes notes, submits a report |
| Performance Review | Admin conducts a formal annual/semester review of a staff member across multiple criteria |
| Notes & Documentation | Freeform notes tied to staff, observations, or meetings |
| Dashboard & Reports | KPI cards, charts, activity feeds that give admins a bird's-eye view |
| Goal Tracking | SMART goals set for teachers, with milestones, progress updates, and status tracking |

### What will specifically impress the CEO (ed-tech founder):
1. **Using the Danielson Framework** for observation rubrics — this is the industry-standard K-12 observation rubric. Naming it in your README signals real domain knowledge.
2. **AI summaries that actually work** — "Generate AI Summary" button on an observation that produces a real, professional paragraph. This is their core product focus.
3. **Status workflows** — observations and reviews move through defined stages (Draft → Submitted → Acknowledged → Completed). This shows product thinking.
4. **Realistic seed data** — a demo that looks like a real school, not "Test Teacher 1".
5. **Clean, professional UI** — not an app that looks like a CS homework project.

### The two AI features to actually implement:
- **AI Observation Summary** — After completing an observation, generate a 2-3 paragraph professional summary from the rubric scores + narrative notes
- **AI Review Recommendations** — After completing a performance review, generate 4 specific, SMART professional development recommendations

These are both single API calls, take ~1 hour to implement each, and will be the most impressive thing in your demo.

---

## 2. Tech Stack Decisions

| Layer | Technology | Decision Rationale |
|---|---|---|
| Frontend | React + Vite | Fast dev server, matches JD |
| Styling | Tailwind CSS | Matches JD, fast professional UI |
| UI Components | shadcn/ui (optional) | Pre-built accessible components |
| Icons | Heroicons (`@heroicons/react`) | Clean, consistent, free |
| Charts | Recharts | React-native, no config hell |
| Routing | React Router v6 | Standard |
| State Management | React Context + useState | No Redux overkill for a prototype |
| HTTP Client | Axios | Standard, interceptors for auth token |
| Backend | Node.js + Express | Matches JD |
| ORM | **Prisma** | Schema-first, makes DB design visible and impressive |
| Database | PostgreSQL | Matches JD |
| Auth | JWT + bcryptjs | Standard, stateless |
| AI | OpenAI GPT-4o-mini | Fast, cheap, sufficient for summaries |
| Deployment | Neon DB + Railway + Vercel | Free tiers, get you live in 30 min |

### Why Prisma specifically:
Your `schema.prisma` file IS your database design. The evaluators will see it and immediately understand your schema. It also handles migrations cleanly and gives you type-safe queries.

### Why not AWS directly:
Don't spend your 5 days on AWS config. Use Render/Railway for the prototype, then document in your README how you'd move to AWS (EC2 + RDS + CloudFront + S3). That shows you know AWS without wasting build time.

---

## 3. Folder Structure

```
edu-platform/
│
├── frontend/
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── api/                    # All API call functions, organized by domain
│   │   │   ├── client.js           # Axios instance with base URL + auth interceptor
│   │   │   ├── auth.js
│   │   │   ├── staff.js
│   │   │   ├── observations.js
│   │   │   ├── reviews.js
│   │   │   ├── goals.js
│   │   │   ├── notes.js
│   │   │   ├── dashboard.js
│   │   │   └── ai.js
│   │   │
│   │   ├── components/
│   │   │   ├── common/             # Reusable across the whole app
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx       # Status/category color badges
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── StatCard.jsx    # KPI cards on dashboard
│   │   │   │   ├── StatusStepper.jsx  # Visual workflow progress bar
│   │   │   │   ├── ScoreRing.jsx   # Colored score visualization (1=red, 4=green)
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx  # Wraps sidebar + header + content
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Header.jsx      # Search bar + user menu
│   │   │   │
│   │   │   ├── observations/
│   │   │   │   ├── ObservationCard.jsx
│   │   │   │   ├── ObservationForm/
│   │   │   │   │   ├── index.jsx         # Multi-step form controller
│   │   │   │   │   ├── Step1_BasicInfo.jsx
│   │   │   │   │   ├── Step2_RubricScoring.jsx
│   │   │   │   │   ├── Step3_Narrative.jsx
│   │   │   │   │   └── Step4_Review.jsx
│   │   │   │   └── AISummaryPanel.jsx    # The AI summary display card
│   │   │   │
│   │   │   ├── reviews/
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── ReviewForm/
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   ├── Step1_StaffPeriod.jsx
│   │   │   │   │   ├── Step2_CriteriaScoring.jsx
│   │   │   │   │   ├── Step3_Narrative.jsx
│   │   │   │   │   └── Step4_Review.jsx
│   │   │   │   └── AIRecommendationsPanel.jsx
│   │   │   │
│   │   │   ├── goals/
│   │   │   │   ├── GoalCard.jsx
│   │   │   │   ├── GoalForm.jsx
│   │   │   │   ├── MilestoneList.jsx
│   │   │   │   └── ProgressUpdateFeed.jsx
│   │   │   │
│   │   │   ├── notes/
│   │   │   │   ├── NoteCard.jsx
│   │   │   │   └── NoteEditor.jsx
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── KPICard.jsx
│   │   │       ├── ObservationTrendChart.jsx
│   │   │       ├── PerformanceRadarChart.jsx
│   │   │       ├── DepartmentComparisonChart.jsx
│   │   │       └── RecentActivityFeed.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # User state, login/logout functions
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useDebounce.js
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StaffPage.jsx           # Staff directory
│   │   │   ├── StaffDetailPage.jsx     # Individual staff profile
│   │   │   ├── ObservationsPage.jsx    # List + filters
│   │   │   ├── NewObservationPage.jsx  # Multi-step form
│   │   │   ├── ObservationDetailPage.jsx
│   │   │   ├── ReviewsPage.jsx
│   │   │   ├── NewReviewPage.jsx
│   │   │   ├── ReviewDetailPage.jsx
│   │   │   ├── GoalsPage.jsx
│   │   │   ├── GoalDetailPage.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js       # formatDate, formatScore, getStatusColor
│   │   │   └── constants.js        # RUBRIC_CATEGORIES, STATUS_OPTIONS, SCORE_LABELS
│   │   │
│   │   ├── App.jsx                 # Route definitions
│   │   └── main.jsx
│   │
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Your entire DB design lives here
│   │   └── seed.js                 # Demo data seeder
│   │
│   ├── src/
│   │   ├── controllers/            # Business logic, one file per domain
│   │   │   ├── authController.js
│   │   │   ├── staffController.js
│   │   │   ├── observationController.js
│   │   │   ├── reviewController.js
│   │   │   ├── goalController.js
│   │   │   ├── noteController.js
│   │   │   ├── dashboardController.js
│   │   │   └── aiController.js
│   │   │
│   │   ├── routes/                 # Express routers, one per domain
│   │   │   ├── auth.js
│   │   │   ├── staff.js
│   │   │   ├── observations.js
│   │   │   ├── reviews.js
│   │   │   ├── goals.js
│   │   │   ├── notes.js
│   │   │   ├── dashboard.js
│   │   │   └── ai.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification middleware
│   │   │   └── errorHandler.js     # Global error handler
│   │   │
│   │   ├── services/
│   │   │   └── aiService.js        # Wraps OpenAI API, builds prompts, parses responses
│   │   │
│   │   └── utils/
│   │       └── prismaClient.js     # Singleton Prisma client
│   │
│   ├── index.js                    # Express app entry point
│   └── .env
│
└── README.md
```

---

## 4. Database Schema (Complete Prisma)

This is the single most important file for impressing the engineering evaluators. Study it, understand every relation before you write it.

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// AUTH & USERS
// ─────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(TEACHER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  staff Staff?

  @@map("users")
}

enum Role {
  SUPER_ADMIN
  ADMIN      // Principal, can do everything
  OBSERVER   // Can create/submit observations
  TEACHER    // Can view their own reviews/goals
}

// ─────────────────────────────────────────
// ORGANIZATIONAL STRUCTURE
// ─────────────────────────────────────────

model School {
  id          String       @id @default(uuid())
  name        String
  address     String?
  phone       String?
  logoUrl     String?
  createdAt   DateTime     @default(now())

  departments Department[]
  staff       Staff[]

  @@map("schools")
}

model Department {
  id       String @id @default(uuid())
  name     String
  schoolId String
  school   School @relation(fields: [schoolId], references: [id])

  staff Staff[]

  @@map("departments")
}

// ─────────────────────────────────────────
// STAFF PROFILES
// ─────────────────────────────────────────

model Staff {
  id           String      @id @default(uuid())
  userId       String      @unique
  user         User        @relation(fields: [userId], references: [id])
  schoolId     String
  school       School      @relation(fields: [schoolId], references: [id])
  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id])

  firstName  String
  lastName   String
  position   String    // "5th Grade Teacher", "Biology Teacher", "Principal"
  gradeLevel String?   // "Elementary", "Middle School", "High School"
  subjects   String[]  // ["Math", "Algebra II"] — PostgreSQL array
  hireDate   DateTime?
  avatarUrl  String?
  phone      String?
  bio        String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Observation relations
  observationsAsTeacher  Observation[] @relation("TeacherObservations")
  observationsAsObserver Observation[] @relation("ObserverObservations")

  // Review relations
  reviewsAsReviewee PerformanceReview[] @relation("RevieweeReviews")
  reviewsAsReviewer PerformanceReview[] @relation("ReviewerReviews")

  // Other relations
  goals GoalStaff[]
  notes Note[]

  @@map("staff")
}

// ─────────────────────────────────────────
// CLASSROOM OBSERVATIONS
// Uses the Danielson Framework (4 domains, 4-point scale)
// ─────────────────────────────────────────

model Observation {
  id         String @id @default(uuid())
  observerId String
  observer   Staff  @relation("ObserverObservations", fields: [observerId], references: [id])
  teacherId  String
  teacher    Staff  @relation("TeacherObservations", fields: [teacherId], references: [id])

  // Scheduling
  scheduledDate DateTime
  observedDate  DateTime?
  duration      Int?         // minutes

  // Class context
  subject      String
  gradeLevel   String
  classPeriod  String?
  studentCount Int?
  unit         String?       // Unit/chapter being taught

  // Workflow status
  status ObservationStatus @default(SCHEDULED)

  // Narrative content (all freeform)
  preObsNotes    String?   // Pre-observation conference notes
  narrativeNotes String?   // Real-time observation notes
  strengths      String?   // What went well
  areasForGrowth String?   // Growth opportunities
  actionItems    String?   // Specific next steps
  postObsNotes   String?   // Post-conference notes

  // AI
  aiSummary     String?
  aiGeneratedAt DateTime?

  rubricScores ObservationRubricScore[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("observations")
}

enum ObservationStatus {
  SCHEDULED           // Observation planned, not yet happened
  IN_PROGRESS         // Observer is currently in the classroom
  DRAFT               // Observer taking notes, not submitted
  SUBMITTED           // Submitted for teacher review
  TEACHER_ACKNOWLEDGED // Teacher has read and acknowledged
  COMPLETED           // Post-conference done, cycle complete
}

// Danielson Framework — 4 domains, 4-point scale
model ObservationRubricScore {
  id            String      @id @default(uuid())
  observationId String
  observation   Observation @relation(fields: [observationId], references: [id], onDelete: Cascade)

  category RubricCategory
  score    Int             // 1=Unsatisfactory, 2=Basic, 3=Proficient, 4=Distinguished
  notes    String?

  @@unique([observationId, category])
  @@map("observation_rubric_scores")
}

enum RubricCategory {
  PLANNING_AND_PREPARATION       // Domain 1: Lesson goals, content knowledge, differentiation
  CLASSROOM_ENVIRONMENT          // Domain 2: Respectful culture, procedures, student behavior
  INSTRUCTION                    // Domain 3: Communication, questioning, student engagement
  PROFESSIONAL_RESPONSIBILITIES  // Domain 4: Reflection, family communication, collegial growth
}

// ─────────────────────────────────────────
// PERFORMANCE REVIEWS
// ─────────────────────────────────────────

model PerformanceReview {
  id         String @id @default(uuid())
  reviewerId String
  reviewer   Staff  @relation("ReviewerReviews", fields: [reviewerId], references: [id])
  revieweeId String
  reviewee   Staff  @relation("RevieweeReviews", fields: [revieweeId], references: [id])

  // Metadata
  reviewPeriod String     // e.g. "2024-2025 Annual", "Fall 2024"
  reviewType   ReviewType @default(ANNUAL)
  status       ReviewStatus @default(DRAFT)

  // Overall computed rating (weighted avg of criteria)
  overallRating Float?

  // Narrative sections
  summaryComments    String?
  strengthsNarrative String?
  growthNarrative    String?
  adminPrivateNotes  String? // Not shared with teacher

  // Teacher self-assessment
  selfAssessmentText String?
  selfSubmittedAt    DateTime?

  // Meeting info
  meetingDate DateTime?
  completedAt DateTime?

  // AI
  aiSummary         String?
  aiRecommendations String?   // Stored as JSON string: array of recommendation objects
  aiGeneratedAt     DateTime?

  criteriaScores ReviewCriteriaScore[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("performance_reviews")
}

enum ReviewType {
  ANNUAL
  MID_YEAR
  PROBATIONARY
  INFORMAL
}

enum ReviewStatus {
  DRAFT                  // Admin drafting
  SELF_ASSESSMENT_PENDING // Sent to teacher for self-assessment
  UNDER_REVIEW           // Admin reviewing with self-assessment
  FEEDBACK_SHARED        // Review shared with teacher
  MEETING_SCHEDULED      // Review meeting set
  COMPLETED              // Fully finalized
}

model ReviewCriteriaScore {
  id       String            @id @default(uuid())
  reviewId String
  review   PerformanceReview @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  criterion ReviewCriterion
  score     Int              // 1=Unsatisfactory, 2=Developing, 3=Proficient, 4=Distinguished, 5=Exemplary
  comments  String?

  @@unique([reviewId, criterion])
  @@map("review_criteria_scores")
}

enum ReviewCriterion {
  TEACHING_EFFECTIVENESS          // Lesson delivery, pacing, clarity
  STUDENT_ENGAGEMENT_AND_OUTCOMES // Active participation, measurable results
  CLASSROOM_MANAGEMENT            // Routines, behavior, environment
  PROFESSIONALISM_AND_COLLABORATION // Punctuality, team meetings, dress
  PROFESSIONAL_GROWTH             // PD hours, applying new strategies
  FAMILY_AND_COMMUNITY_ENGAGEMENT // Parent communication, outreach
}

// ─────────────────────────────────────────
// GOAL TRACKING
// ─────────────────────────────────────────

// Junction: goals can be assigned to one staff member by another
model GoalStaff {
  id          String @id @default(uuid())
  staffId     String
  staff       Staff  @relation(fields: [staffId], references: [id])
  createdById String // Who set the goal (admin ID)

  goal   Goal   @relation(fields: [goalId], references: [id], onDelete: Cascade)
  goalId String

  @@map("goal_staff")
}

model Goal {
  id          String       @id @default(uuid())
  title       String
  description String?
  category    GoalCategory
  targetDate  DateTime
  status      GoalStatus   @default(ACTIVE)
  completedAt DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  assignments GoalStaff[]
  milestones  GoalMilestone[]
  updates     GoalProgressUpdate[]

  @@map("goals")
}

enum GoalCategory {
  INSTRUCTIONAL_PRACTICE   // Improving specific teaching strategies
  PROFESSIONAL_DEVELOPMENT // Certifications, courses, workshops
  STUDENT_ACHIEVEMENT      // Raise specific student metric
  COLLABORATION            // Team/PLC participation
  LEADERSHIP               // Department or committee leadership
  PERSONAL_GROWTH          // Communication, time management, etc.
}

enum GoalStatus {
  ACTIVE    // On track
  AT_RISK   // Target date approaching, incomplete
  COMPLETED // All milestones done
  ARCHIVED  // No longer relevant
}

model GoalMilestone {
  id          String          @id @default(uuid())
  goalId      String
  goal        Goal            @relation(fields: [goalId], references: [id], onDelete: Cascade)
  title       String
  description String?
  dueDate     DateTime
  status      MilestoneStatus @default(PENDING)
  completedAt DateTime?
  createdAt   DateTime        @default(now())

  @@map("goal_milestones")
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  MISSED
}

model GoalProgressUpdate {
  id        String   @id @default(uuid())
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  authorId  String   // Staff ID of who wrote the update
  content   String
  createdAt DateTime @default(now())

  @@map("goal_progress_updates")
}

// ─────────────────────────────────────────
// NOTES & DOCUMENTATION
// ─────────────────────────────────────────

model Note {
  id          String      @id @default(uuid())
  authorId    String
  author      Staff       @relation(fields: [authorId], references: [id])
  title       String
  content     String      // Rich text or markdown
  tags        String[]    // Flexible tagging system
  subjectType NoteSubject @default(GENERAL)
  subjectId   String?     // ID of related record (staffId, observationId, etc.)
  isPinned    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("notes")
}

enum NoteSubject {
  GENERAL
  STAFF
  OBSERVATION
  REVIEW
  GOAL
  MEETING
}
```

---

## 5. API Endpoints (Complete)

All routes are prefixed with `/api`. All routes except `/api/auth/login` require the `Authorization: Bearer <token>` header.

### Auth
```
POST  /api/auth/login       Body: { email, password }
                            Returns: { token, user: { id, email, role, staff } }

GET   /api/auth/me          Returns current authenticated user with staff profile
```

### Staff
```
GET   /api/staff                    Query: ?search=&departmentId=&isActive=
GET   /api/staff/:id                Full profile + recent observations, reviews, goals
POST  /api/staff                    Body: { firstName, lastName, position, email, ... }
PUT   /api/staff/:id                Body: any updatable fields
DELETE /api/staff/:id               Soft delete (sets isActive=false)
GET   /api/staff/:id/timeline       Chronological activity: obs, reviews, goals, notes
GET   /api/staff/:id/summary        Aggregated stats: avg scores, goals completed, obs count
```

### Observations
```
GET   /api/observations             Query: ?teacherId=&status=&from=&to=&observerId=
GET   /api/observations/:id         Full observation + rubric scores + teacher/observer info
POST  /api/observations             Body: { teacherId, scheduledDate, subject, gradeLevel, ... }
PUT   /api/observations/:id         Body: any narrative/detail fields
PATCH /api/observations/:id/status  Body: { status }  — validates legal status transitions
POST  /api/observations/:id/scores  Body: { scores: [{ category, score, notes }] }
                                    Creates or upserts rubric scores (all 4 categories at once)
```

### Performance Reviews
```
GET   /api/reviews                  Query: ?revieweeId=&status=&reviewType=&period=
GET   /api/reviews/:id              Full review + criteria scores + linked staff info
POST  /api/reviews                  Body: { revieweeId, reviewPeriod, reviewType }
PUT   /api/reviews/:id              Body: any narrative fields
PATCH /api/reviews/:id/status       Body: { status }
POST  /api/reviews/:id/criteria     Body: { scores: [{ criterion, score, comments }] }
PUT   /api/reviews/:id/self-assess  Body: { selfAssessmentText } — teacher-only route
```

### Goals
```
GET   /api/goals              Query: ?staffId=&status=&category=
GET   /api/goals/:id          Goal + milestones + progress updates
POST  /api/goals              Body: { staffId, title, description, category, targetDate }
PUT   /api/goals/:id          Body: any goal fields
PATCH /api/goals/:id/status   Body: { status }

POST  /api/goals/:id/milestones              Body: { title, description, dueDate }
PUT   /api/goals/:id/milestones/:mid         Body: { title, dueDate, description }
PATCH /api/goals/:id/milestones/:mid/status  Body: { status }

POST  /api/goals/:id/updates  Body: { content }  — adds a progress update
```

### Notes
```
GET    /api/notes         Query: ?subjectType=&subjectId=&tag=&isPinned=
GET    /api/notes/:id
POST   /api/notes         Body: { title, content, tags, subjectType, subjectId }
PUT    /api/notes/:id
DELETE /api/notes/:id
```

### Dashboard
```
GET  /api/dashboard/kpis           Returns: { totalStaff, observationsThisMonth,
                                              pendingReviews, goalsAtRisk,
                                              avgObservationScore }

GET  /api/dashboard/trend          Returns: monthly observation counts for last 6 months
                                   [ { month: "Jan", count: 12, avgScore: 2.9 } ]

GET  /api/dashboard/performance    Returns: avg score per rubric category + per department

GET  /api/dashboard/activity       Returns: 15 most recent events across all modules

GET  /api/dashboard/upcoming       Returns: observations scheduled next 14 days
                                   + reviews with approaching deadlines
```

### AI (The Showstopper)
```
POST /api/ai/observation-summary
     Body: { observationId }
     Action: Fetches observation data, calls OpenAI, saves aiSummary to DB
     Returns: { summary: "..." }

POST /api/ai/review-recommendations
     Body: { reviewId }
     Action: Fetches review data + linked observation summaries, calls OpenAI
     Saves aiRecommendations (JSON string) to DB
     Returns: { recommendations: [ { area, recommendation, rationale, timeline } ] }

POST /api/ai/goal-suggestions
     Body: { reviewId }
     Action: Based on review scores, suggest 3 SMART goals
     Returns: { goals: [ { title, description, category, suggestedTargetDate } ] }
     (Stretch — implement only if time allows)
```

---

## 6. Pages & UI Design Plan

### Design System
```
Colors:
  Sidebar bg:     #111827  (slate-900)
  Primary:        #4f46e5  (indigo-600)
  Primary dark:   #4338ca  (indigo-700)
  Success:        #10b981  (emerald-500)
  Warning:        #f59e0b  (amber-500)
  Danger:         #ef4444  (red-500)
  Page bg:        #f8fafc  (slate-50)
  Card bg:        #ffffff
  Text primary:   #0f172a  (slate-900)
  Text muted:     #64748b  (slate-500)

Score color mapping:
  1 (Unsatisfactory): Red  #ef4444
  2 (Basic):          Amber #f59e0b
  3 (Proficient):     Blue  #3b82f6
  4 (Distinguished):  Green #10b981

Typography: Inter (import from Google Fonts)
Border radius: rounded-lg on all cards
Shadow: shadow-sm on all cards
```

### Page-by-Page Breakdown

---

#### Page 1: Login
- Centered card on a light gradient background
- Logo + "Lincoln K-12 Academy" header
- Email + password fields
- "Sign In" button
- A "Demo Login" button below that fills in the admin credentials automatically
- No registration (admin-created accounts only, just explain in README)

---

#### Page 2: Dashboard
**Layout:** 2-column, main content area

**Row 1 — KPI Cards (4 across)**
- Total Active Staff (with icon)
- Observations This Month (+ change vs last month)
- Pending Reviews (clickable, goes to filtered reviews)
- Goals At Risk (red badge if > 0)

**Row 2 — Charts**
- Left (60%): "Observation Activity" — LineChart showing observation count + avg score per month (last 6 months)
- Right (40%): "Review Status" — PieChart showing count by status

**Row 3 — Bottom two columns**
- Left: "Recent Activity" — scrollable feed of last 15 events (observation submitted, review completed, goal updated, etc.)
- Right: "Upcoming" — next 7 days of scheduled observations + review deadlines

---

#### Page 3: Staff Directory
**Filters bar:** Search by name, filter by Department dropdown, filter by isActive

**Table columns:**
| Avatar | Name | Department | Position | Last Observed | Active Goals | Review Status | Actions |

- Last Observed: "12 days ago" or "Never" in red
- Review Status: badge showing their most recent review's status
- Click row → Staff Profile

---

#### Page 4: Staff Profile
**Header:** Large avatar, name, title, department, hire date, contact info, quick stats

**Quick Stats row:** Total Observations | Avg Observation Score | Goals Completed | Current Review Status

**Tabs:**
- **Overview** — Radar chart of their avg rubric scores across all observations + bio
- **Observations** — List of this teacher's observations (most recent first)
- **Reviews** — List of their performance reviews
- **Goals** — Their goals with progress bars
- **Notes** — Notes tagged to this staff member

---

#### Page 5: Observations List
**Filters:** Status (multi-select chips), Teacher (dropdown), Date range, Observer

**Visual pipeline at top:** Scheduled → In Progress → Draft → Submitted → Acknowledged → Completed
(Each with count badge — very impressive product thinking)

**Table/Cards below:** Each observation card shows teacher name, subject, date, status badge, rubric avg score

**"+ New Observation" button** — top right

---

#### Page 6: New Observation (Multi-step Form)
This is your most complex UI. Use a step indicator at the top.

**Step 1 — Basic Info**
- Teacher (searchable dropdown from staff list)
- Scheduled Date (date picker)
- Subject (text or dropdown)
- Grade Level (dropdown)
- Class Period (text)
- Student Count (number)
- Duration (number, minutes)
- Pre-Observation Notes (textarea)

**Step 2 — Rubric Scoring**
For each of the 4 Danielson domains, show:
- Domain name + description
- Score selector: 4 buttons (1/2/3/4) with labels (Unsatisfactory / Basic / Proficient / Distinguished)
- Score notes textarea (what did you observe?)
- Color highlight the selected button

**Step 3 — Narrative**
- Strengths observed (textarea)
- Areas for growth (textarea)
- Action items (textarea)
- General narrative notes (large textarea)

**Step 4 — Review & Submit**
- Summary of all entered data
- "Submit Observation" button
- After submission, redirect to Observation Detail page

---

#### Page 7: Observation Detail
**Header:** Teacher name + photo, subject, date, status badge, observer name

**Status Stepper** (visual horizontal bar): 
`Scheduled → In Progress → Draft → Submitted → Acknowledged → Completed`
Colored up to current status. "Advance to Next Stage" button.

**Section: Rubric Scores**
- Radar chart (Recharts RadarChart) of 4 domain scores
- Below radar: 4 cards, one per domain, showing score ring + notes

**Section: Narrative Notes**
- Strengths | Areas for Growth | Action Items | General Notes
- Displayed in styled cards

**Section: AI Summary** ← The star of the show
- If no summary yet: pulsing indigo card with "✨ Generate AI Summary" button
- On click: loading animation ("Generating professional summary...")
- Once generated: styled card with purple gradient header "AI-Generated Summary" + 2-3 paragraphs of professional text
- "Regenerate" link in corner

**Section: Activity Log**
- Timestamped list: "Submitted by David Chen on June 5", "Acknowledged by Emily Rodriguez on June 6"

---

#### Page 8: Reviews List
Same pattern as Observations list. Pipeline shows all 6 review statuses.

---

#### Page 9: New Review Form (Multi-step)
**Step 1 — Setup**
- Staff member (dropdown)
- Review period (text: "2024-2025 Annual")
- Review type (Annual / Mid-Year / Probationary / Informal)

**Step 2 — Criteria Scoring**
For each of 6 criteria:
- Criterion name + description
- Score: 5 styled buttons (1-5) with labels
- Comments textarea

**Step 3 — Narrative**
- Summary comments
- Strengths narrative
- Growth areas narrative
- Private admin notes (labeled "Private — not shared with teacher")

**Step 4 — Review & Submit**

---

#### Page 10: Review Detail
Same structure as Observation Detail. Key differences:
- Bar chart instead of radar (6 criteria vs 4 domains)
- Self-Assessment section: shows teacher's self-assessment text (or "Pending" if not submitted)
- **AI Recommendations panel** (same pattern as AI Summary but shows a list of 4 cards)

Each recommendation card:
```
┌─────────────────────────────────────┐
│ 🎯 Professional Development          │
│ Enroll in a structured questioning   │
│ techniques workshop by semester end. │
│                                      │
│ Rationale: Observation data shows... │
│ Timeline: By December 2025           │
└─────────────────────────────────────┘
```

---

#### Page 11: Goals
**Filters:** Staff, Status (chip select), Category

**Cards view** (2-column grid):
Each card:
- Goal title + category badge
- Staff member name
- Target date + "X days remaining" (red if < 7)
- Progress bar: % milestones completed
- Status badge (Active/At Risk/Completed)

---

#### Page 12: Goal Detail
**Header:** Title, staff member, category, target date, status badge

**Milestone Section:**
- Progress bar (X of Y complete)
- List of milestones with checkboxes, due dates, status badges
- "Add Milestone" button → inline form

**Progress Updates Feed:**
- Thread-style list of updates (author avatar, name, timestamp, content)
- "Add Update" → textarea + submit button at bottom

---

#### Page 13: Notes
**Left sidebar:** Filter by type (General/Staff/Observation/Meeting), filter by tags (tag cloud)

**Main area:** Masonry or grid of note cards
Each card: Title, first 100 chars of content, tag chips, author, date, pin icon

**Top right:** "New Note" → opens full-page editor

**Note editor:**
- Title field
- Large textarea (you can add a simple markdown preview later as bonus)
- Tag input
- Subject type dropdown + subject ID (if tagging to a person/observation)
- Pin toggle
- Save button

---

#### Page 14: Reports
**Pre-built report cards (click to view):**

1. **Staff Performance Summary** — Table of all staff with avg observation score, review rating, goals completed
2. **Observation Activity Report** — Observation counts by month + by status + by observer
3. **Goal Progress Report** — Goals by category, % completion rate, at-risk list
4. **Department Comparison** — Side-by-side avg rubric scores across departments (BarChart)

Each report:
- Date range filter
- Chart + summary table below
- "Export" button (can be a visual-only button labeled "PDF Export — Coming Soon" for prototype)

---

## 7. Day-by-Day Execution Plan

### DAY 1 — June 10: Foundation & Database

**Morning (3 hours): Project Setup**
```bash
# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom axios recharts @heroicons/react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Backend
mkdir backend && cd backend
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install -D nodemon
npx prisma init
```

1. Configure Tailwind in `tailwind.config.js` (add custom colors from design system)
2. Set up Vite proxy in `vite.config.js` to forward `/api` to `localhost:3001`
3. Create basic Express app with CORS, JSON parsing, route mounting skeleton
4. Set up `.env` with DATABASE_URL, JWT_SECRET

**Afternoon (4 hours): Schema + Seed Data**
1. Write the full `schema.prisma` (every model from Section 4)
2. Run `npx prisma migrate dev --name init`
3. Write `prisma/seed.js` — see Section 9 for exact data to create
4. Run `npx prisma db seed`
5. Open Prisma Studio (`npx prisma studio`) to verify your data looks right

**Late afternoon (2 hours): Auth**
1. `authController.js` — login endpoint (bcrypt compare, JWT sign)
2. `auth.js` middleware — JWT verify, attach `req.user`
3. `GET /api/auth/me` endpoint
4. Test login in Postman/Thunder Client — get a token, use it

**End of Day 1 Checkpoint:**
- [ ] `npx prisma studio` shows realistic seed data
- [ ] `POST /api/auth/login` returns a JWT token
- [ ] `GET /api/auth/me` with that token returns user data

---

### DAY 2 — June 11: Backend APIs + Frontend Login & Shell

**Morning (3 hours): Backend APIs**
Build in this order (test each with Postman before moving on):

1. `GET /api/staff` + `GET /api/staff/:id` (include department and recent obs count)
2. `GET /api/observations` + `GET /api/observations/:id`
3. `POST /api/observations` + `PUT /api/observations/:id`
4. `PATCH /api/observations/:id/status` (with validation: only allow legal transitions)
5. `POST /api/observations/:id/scores` (upsert all 4 rubric scores)
6. `GET /api/dashboard/kpis` — count queries for all 5 KPI numbers

**Afternoon (4 hours): Frontend Shell**
1. Set up React Router in `App.jsx` — define all routes (even if pages are blank)
2. Build `AuthContext.jsx` — stores user + token in localStorage, provides login/logout
3. Build `ProtectedRoute` component — redirects to `/login` if no token
4. Build `LoginPage.jsx` — functional form hitting `POST /api/auth/login`
   - Add a "Demo Login" button that fills in `admin@lincoln.edu` / `password123`
5. Build `MainLayout.jsx` with:
   - Dark sidebar (links to all pages, active state highlighting)
   - Header with school name + user avatar dropdown
6. Build `DashboardPage.jsx` skeleton — 4 placeholder KPI cards

**End of Day 2 Checkpoint:**
- [ ] Login works and stores token
- [ ] Sidebar navigation renders
- [ ] Dashboard shows real KPI numbers from API

---

### DAY 3 — June 12: Observation & Review Workflows (The Core)

**Morning (3 hours): Observation Pages**
1. `ObservationsPage.jsx` — fetch and display observation list
   - Status badge for each (color-coded)
   - Filter controls (status chips, teacher dropdown)
   - Pipeline counters at top (count per status)
   
2. `NewObservationPage.jsx` — multi-step form
   - Step state with `useState`
   - Teacher dropdown populated from `/api/staff`
   - Step 2: RubricScorer component (4 domains, 1-4 score buttons, notes textarea)
   - Submit → POST to `/api/observations` then POST to `/api/observations/:id/scores`
   - Redirect to detail page on success

3. `ObservationDetailPage.jsx`
   - Fetch observation data
   - `StatusStepper` component showing current stage
   - "Advance Status" button → PATCH request
   - Radar chart from Recharts for 4 domain scores
   - All narrative sections in styled cards
   - Empty AI Summary section with "Generate" button (wire up Day 4)

**Afternoon (3 hours): Review Pages**
1. `ReviewsPage.jsx` — same pattern as observations
2. `NewReviewPage.jsx` — multi-step form (5 steps)
   - Step 2: CriteriaScorer — 6 criteria, 1-5 score buttons with labels
   - Submit → POST + POST criteria scores
3. `ReviewDetailPage.jsx`
   - Bar chart for 6 criteria scores
   - All narrative sections
   - Empty AI Recommendations section (wire up Day 4)

**Late afternoon (1-2 hours): Backend — Reviews + Goals + Notes**
Build remaining backend routes:
1. All review CRUD + criteria scores
2. All goal CRUD + milestones + updates
3. All note CRUD
4. `GET /api/dashboard/activity` (union query across obs/reviews/goals ordered by date)

**End of Day 3 Checkpoint:**
- [ ] Can complete a full observation: create → score rubric → write narrative → submit → advance status
- [ ] Can complete a full review: create → score criteria → write narrative → submit
- [ ] All backend routes returning 200 in Postman

---

### DAY 4 — June 13: Goals, Notes, Dashboard, AI

**Morning (2 hours): Goals & Notes Pages**
1. `GoalsPage.jsx` — card grid, progress bars, filters
2. `GoalDetailPage.jsx` — milestones with check-off, progress updates feed
3. `NotesPage.jsx` — note cards grid + full editor
4. Wire up all to backend APIs

**Mid-day (2 hours): Dashboard & Reports**
1. Complete `DashboardPage.jsx`:
   - KPI cards with real data
   - LineChart: observation trend (use data from `/api/dashboard/trend`)
   - PieChart: review status distribution
   - Recent Activity feed
   - Upcoming observations table
2. `ReportsPage.jsx`:
   - 4 report cards with charts
   - Use aggregated data from existing API endpoints
   - Staff Performance Summary table (all staff, avg scores)

**Afternoon (3 hours): AI Integration ⭐ — Don't skip this**

**Backend — `aiService.js`:**
```javascript
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateObservationSummary(observationData) {
  const prompt = buildObservationPrompt(observationData);
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: OBSERVATION_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  });
  return response.choices[0].message.content;
}

async function generateReviewRecommendations(reviewData) {
  const prompt = buildReviewPrompt(reviewData);
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: REVIEW_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800,
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content);
}
```

**Backend — `aiController.js`:**
1. `POST /api/ai/observation-summary`:
   - Fetch full observation from DB
   - Call `generateObservationSummary(data)`
   - `prisma.observation.update({ aiSummary: result, aiGeneratedAt: new Date() })`
   - Return summary
2. `POST /api/ai/review-recommendations`:
   - Fetch full review from DB
   - Call `generateReviewRecommendations(data)`
   - Store as JSON string in `aiRecommendations`
   - Return parsed array

**Frontend — Wire Up AI:**
1. `AISummaryPanel.jsx`:
   ```jsx
   // If aiSummary exists: show styled card with purple header
   // If not: show pulsing "Generate" button card
   // On click: setLoading(true), call /api/ai/observation-summary, setLoading(false), refresh data
   ```
2. `AIRecommendationsPanel.jsx`: same pattern, renders recommendation cards from JSON
3. Add both panels to their respective detail pages

**End of Day 4 Checkpoint:**
- [ ] Dashboard charts showing real data
- [ ] Goals and notes fully functional
- [ ] AI summary generates real text on observation detail page
- [ ] AI recommendations generate real cards on review detail page

---

### DAY 5 — June 14: Polish + Deploy + README

**Morning (3 hours): UI Polish**
Priority order:
1. **Loading states** — every data fetch needs a spinner. Add to all pages.
2. **Empty states** — when no observations/goals/notes exist, show an illustration + "Create your first X" button (not a blank page)
3. **Error states** — catch API errors, show a red banner with message
4. **Consistent spacing** — audit all pages for inconsistent padding/margins
5. **Status badges** — make sure every status has a color: use `Badge.jsx` everywhere
6. **Score rings** — `ScoreRing.jsx`: small circular indicator colored by score (1=red, 4=green) — add to observation cards in lists

**Bonus polish (if time):**
- Add page transition (simple fade)
- Hover states on table rows
- Tooltip on score rings explaining the scale
- "Last observed 12 days ago" text on Staff Directory

**Afternoon (2 hours): Deployment**
1. Push code to GitHub (public or private, share link in submission)
2. **Database:** Create free Neon account → new project → copy DATABASE_URL
3. **Backend:** 
   - Create Railway account → New Project → Deploy from GitHub
   - Add env vars: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, NODE_ENV=production
   - Run `npx prisma migrate deploy` via Railway shell
   - Run seed: `node prisma/seed.js` via Railway shell
4. **Frontend:**
   - Create Vercel account → Import from GitHub → select `frontend/` as root
   - Add env var: `VITE_API_URL=https://your-backend.railway.app`
   - Deploy
5. Test every core workflow on the live URL

**Evening (1.5 hours): README**

Write a professional README covering:
- Project overview (1 paragraph)
- Live URL link
- Demo credentials (admin@lincoln.edu / password123)
- Tech stack table
- Architecture decisions (why Prisma, why JWT, why Recharts)
- Database design overview (reference schema.prisma)
- AI integration explanation (which model, how prompts are structured)
- How to run locally (step-by-step)
- AWS deployment path (document: Frontend → S3 + CloudFront, Backend → EC2/Beanstalk, DB → RDS, AI → Lambda)
- What you'd build next with more time

**End of Day 5 Checkpoint:**
- [ ] App live on public URL
- [ ] All 5 core workflows demonstrable
- [ ] AI features working in production
- [ ] README complete with demo link + credentials

---

## 8. AI Integration Detail

### System Prompts

**Observation Summary System Prompt:**
```
You are an expert K-12 education administrator with 20 years of experience in 
teacher evaluation. You write professional, balanced, and constructive classroom 
observation summaries using the Danielson Framework for Teaching. Your summaries 
are specific, evidence-based, and maintain a supportive yet honest tone.
```

**User Prompt Structure (build this in `aiService.js`):**
```
Generate a professional classroom observation summary for the following data:

TEACHER: {firstName} {lastName} — {position}
SUBJECT: {subject} | GRADE: {gradeLevel} | DATE: {observedDate}
DURATION: {duration} minutes | STUDENTS: {studentCount}

DANIELSON FRAMEWORK SCORES (1=Unsatisfactory, 2=Basic, 3=Proficient, 4=Distinguished):
Domain 1 - Planning & Preparation: {score}/4
  Notes: {notes}
Domain 2 - Classroom Environment: {score}/4
  Notes: {notes}
Domain 3 - Instruction: {score}/4
  Notes: {notes}
Domain 4 - Professional Responsibilities: {score}/4
  Notes: {notes}

OBSERVER NARRATIVE:
Strengths: {strengths}
Areas for Growth: {areasForGrowth}
Action Items: {actionItems}
General Notes: {narrativeNotes}

Write a 2-3 paragraph professional observation summary that:
1. Opens by naming the lesson context and overall impression
2. Highlights 2-3 specific strengths with evidence from the notes
3. Identifies 1-2 growth areas constructively, framing them as opportunities
4. Closes with specific recommended next steps

Keep it professional, specific, and under 300 words.
```

**Review Recommendations System Prompt:**
```
You are a K-12 principal specializing in teacher professional development. 
You create specific, SMART professional development recommendations based on 
performance review data. Your recommendations are actionable, measurable, 
and directly tied to the evaluation evidence.
```

**Review Recommendations User Prompt:**
```
Based on the following annual performance review, generate exactly 4 professional 
development recommendations. Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "area": "Category name",
      "recommendation": "Specific action the teacher should take",
      "rationale": "Why this is important based on their review data",
      "suggestedTimeline": "By [specific timeframe]"
    }
  ]
}

TEACHER: {firstName} {lastName} | PERIOD: {reviewPeriod}

PERFORMANCE CRITERIA SCORES (1-5):
Teaching Effectiveness: {score}/5 — "{comments}"
Student Engagement & Outcomes: {score}/5 — "{comments}"
Classroom Management: {score}/5 — "{comments}"
Professionalism & Collaboration: {score}/5 — "{comments}"
Professional Growth: {score}/5 — "{comments}"
Family & Community Engagement: {score}/5 — "{comments}"

Overall Rating: {overallRating}/5

RECENT OBSERVATION SUMMARY:
{aiSummary from most recent observation, or "No recent observation data"}

Generate 4 recommendations targeting the lowest-scoring areas. 
Be specific, not generic.
```

### Cost estimate:
- GPT-4o-mini: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output
- One observation summary call: ~800 tokens total → ~$0.0005
- One review recommendations call: ~1000 tokens total → ~$0.0007
- Running the whole demo 20 times: < $0.02

---

## 9. Seed Data Plan

Build this as `backend/prisma/seed.js`. Run with `npx prisma db seed`.

### People to Create

**School:** Lincoln K-12 Academy, 450 Lincoln Blvd, Springfield

**Departments:** Mathematics, English Language Arts, Science

| Name | Email | Password | Role | Position | Department |
|---|---|---|---|---|---|
| Sarah Mitchell | admin@lincoln.edu | password123 | ADMIN | Principal | — |
| David Chen | dchen@lincoln.edu | password123 | OBSERVER | Assistant Principal | — |
| Emily Rodriguez | erodriguez@lincoln.edu | password123 | TEACHER | 5th Grade Math | Mathematics |
| James Thompson | jthompson@lincoln.edu | password123 | TEACHER | 7th Grade ELA | English |
| Maria Santos | msantos@lincoln.edu | password123 | TEACHER | Biology | Science |
| Kevin Park | kpark@lincoln.edu | password123 | TEACHER | Algebra II | Mathematics |
| Lisa Johnson | ljohnson@lincoln.edu | password123 | TEACHER | 3rd Grade ELA | English |
| Tom Williams | twilliams@lincoln.edu | password123 | TEACHER | Chemistry | Science |
| Aisha Patel | apatel@lincoln.edu | password123 | TEACHER | 6th Grade Math | Mathematics |
| Robert Brown | rbrown@lincoln.edu | password123 | TEACHER | 8th Grade ELA | English |

### Observations to Seed (6 total)
Create these so that every status is represented and the data looks like a real school year:

1. **Emily Rodriguez** — Math — 5th Grade — **COMPLETED** — Scores: 4/3/4/3 — Include a pre-written `aiSummary` in seed (so AI feature is always demonstrable)
2. **James Thompson** — ELA — 7th Grade — **COMPLETED** — Scores: 3/3/2/3 — Include a pre-written `aiSummary`
3. **Maria Santos** — Biology — 10th Grade — **SUBMITTED** — Scores: 3/4/3/4
4. **Kevin Park** — Algebra II — 11th Grade — **DRAFT** — Scores: 2/3/2/2
5. **Aisha Patel** — Math — 6th Grade — **IN_PROGRESS** — No scores yet
6. **Tom Williams** — Chemistry — 12th Grade — **SCHEDULED** — Scheduled for next week

### Performance Reviews (4 total)
1. **Emily Rodriguez** — 2024-2025 Annual — **COMPLETED** — Overall: 4.2 — Include pre-written `aiRecommendations` JSON
2. **James Thompson** — 2024-2025 Annual — **FEEDBACK_SHARED** — Overall: 3.1
3. **Maria Santos** — 2024-2025 Mid-Year — **UNDER_REVIEW** — Scores entered
4. **Kevin Park** — 2024-2025 Annual — **DRAFT** — Just created

### Goals (10 total, mix of statuses and categories)
Create a spread: 4 ACTIVE, 2 AT_RISK, 3 COMPLETED, 1 ARCHIVED
Assign to different teachers. Make target dates realistic (some past, some future).

Example goals:
- "Implement Socratic Seminar techniques in weekly ELA discussions" (COMPLETED)
- "Achieve 85% student proficiency on state math assessment" (AT_RISK, due in 3 weeks)
- "Complete 40 hours of STEM professional development" (ACTIVE)
- "Develop differentiated materials for IEP students" (ACTIVE)

Each active/at-risk goal should have 2-3 milestones and 2-3 progress updates.

### Notes (8 total)
- 2 GENERAL notes (meeting recaps)
- 2 STAFF notes (tagged to specific teachers)
- 2 OBSERVATION notes (tagged to specific observations)
- 2 MEETING notes (faculty meeting, department meeting)

### Pre-written AI Content for Seed
For the COMPLETED observation and COMPLETED review, write realistic AI content directly in seed.js. This ensures the demo always looks complete without requiring an API call. Example:

```javascript
aiSummary: `Ms. Rodriguez delivered an engaging fifth-grade mathematics lesson on 
fraction operations, demonstrating exceptional mastery of both content and 
pedagogy. The lesson opened with a well-crafted number talk that activated prior 
knowledge and immediately captured student attention, with 100% of students 
participating within the first five minutes.

Standout strengths included her use of multiple representations — moving 
seamlessly between manipulatives, visual models, and symbolic notation — and her 
highly effective use of strategic questioning to drive conceptual understanding 
rather than rote procedures. The classroom environment was notably structured yet 
warm, with routines so well-established that transitions added minimal time.

One area for continued growth is expanding opportunities for student-to-student 
discourse during problem-solving. Introducing a structured partner protocol 
during the work period would allow Ms. Rodriguez to conduct more targeted 
small-group instruction. Recommended next step: Pilot a "think-pair-share" 
structure in the upcoming unit on decimals and measure its impact on student 
explanation quality.`
```

---

## 10. Deployment Strategy

### For the Prototype (Use This)
| Service | What It Does | Cost | Setup Time |
|---|---|---|---|
| Neon (neon.tech) | Hosted PostgreSQL | Free | 5 min |
| Railway (railway.app) | Node.js backend host | Free tier | 15 min |
| Vercel (vercel.com) | React frontend host | Free | 10 min |

**Steps:**
1. Push code to GitHub
2. Create Neon project → copy `DATABASE_URL`
3. Railway: New Project → GitHub repo → add env vars → deploy
4. Run migrations in Railway shell: `npx prisma migrate deploy && node prisma/seed.js`
5. Vercel: Import frontend repo → set `VITE_API_URL` env var → deploy

### For Your README — AWS Production Path
Document this even though you didn't implement it. It shows AWS awareness:

```
Production Architecture on AWS:
├── Frontend: S3 bucket (static hosting) + CloudFront CDN
├── Backend: Elastic Beanstalk (Node.js env) or EC2 t3.micro behind ALB
├── Database: RDS (PostgreSQL, db.t3.micro in private subnet)
├── AI Calls: Could be extracted to Lambda functions for cost efficiency
├── Secrets: AWS Secrets Manager for DB credentials and API keys
├── Monitoring: CloudWatch for logs and alarms
└── CI/CD: GitHub Actions → deploy to EB/Lambda on merge to main
```

---

## 11. Final Submission Checklist

### Core Workflows (Must all pass)
- [ ] Admin can log in and see the dashboard with real data
- [ ] Dashboard shows KPI cards, charts, and activity feed
- [ ] Can create a new observation, score all 4 Danielson rubric domains, write narrative, and submit it
- [ ] Observation status can advance through all stages
- [ ] AI Summary generates real text on a completed observation
- [ ] Can create a new performance review, score all 6 criteria, write narrative, and submit it
- [ ] AI Recommendations generate as a list of 4 cards on a completed review
- [ ] Can create a goal, add milestones, mark milestones complete, and add progress updates
- [ ] Can create, edit, and delete a note
- [ ] Reports page shows charts with meaningful data

### Technical Quality
- [ ] All pages have loading states (no blank screens while fetching)
- [ ] All pages have empty states (no confusing blank sections)
- [ ] No console errors on any page
- [ ] API returns proper error messages (not stack traces) for invalid requests
- [ ] JWT is verified on every protected route
- [ ] Prisma schema is clean and well-commented

### Presentation Quality
- [ ] App is deployed at a public URL
- [ ] Seed data makes the demo look like a real school (not "Test User 1")
- [ ] README has demo URL, demo credentials, architecture overview, local setup instructions
- [ ] Rubric uses proper Danielson Framework naming (mention this in README)
- [ ] Pre-written AI content in seed ensures AI section always looks populated

### Nice to Have (If Time Permits)
- [ ] Staff profile page with all tabs functional
- [ ] Search bar in header that searches staff by name
- [ ] "Goal at risk" computed automatically when target date < 7 days away
- [ ] Mobile-responsive layout (at least not broken on mobile)
- [ ] PDF export placeholder button on reports (clearly labeled "Coming Soon")

---

*End of Build Plan — Good luck. The most important thing is that every core workflow is demonstrable end-to-end on Day 5. Build depth first, then polish.*