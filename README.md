# Lincoln K-12 Academy — Staff Performance Evaluation Platform

A professional HR / performance-management web application purpose-built for K-12 schools. Principals and department heads use it to run classroom observations, conduct formal performance reviews, track SMART goals, keep documentation, and view school-wide analytics — with AI-generated observation summaries and professional-development recommendations.

> Built as a full-stack prototype: **React + Vite + Tailwind** frontend, **Node.js + Express + Prisma + PostgreSQL** backend, and **Google Gemini** for the AI features.

---

## Demo Credentials

| Field | Value |
|---|---|
| Email | `admin@lincoln.edu` |
| Password | `password123` |

All seeded accounts use the password `password123` (e.g. `dchen@lincoln.edu` as an Observer, `erodriguez@lincoln.edu` as a Teacher). Accounts are admin-created — there is no public registration by design.

---

## The 5 Core Workflows

| Workflow | What it does |
|---|---|
| **Classroom Observation** | Multi-step rubric scoring using the **Danielson Framework** (4 domains, 4-point scale), narrative notes, and a defined status pipeline (Scheduled → In Progress → Draft → Submitted → Acknowledged → Completed). |
| **Performance Review** | Formal annual / mid-year evaluation across 6 weighted criteria (5-point scale) with a self-assessment section and its own status workflow. |
| **Goal Tracking** | SMART goals with milestones (check-off), progress-update feed, categories, and automatic at-risk detection. |
| **Notes & Documentation** | Freeform notes tied to staff, observations, or meetings, with tagging and pinning. |
| **Dashboard & Reports** | KPI cards, observation-trend line chart, review-status pie, recent-activity feed, upcoming items, and 4 pre-built reports. |

### AI Features (the showstopper)
- **AI Observation Summary** — generates a 2–3 paragraph professional narrative from rubric scores + notes.
- **AI Review Recommendations** — generates 4 specific, SMART professional-development recommendations as structured cards (JSON).

Seed data ships with **pre-written AI content** for the completed observation and review, so the AI sections always look populated in a demo even without a live API call.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + Vite | Fast dev server, modern DX |
| Styling | Tailwind CSS v3 | Rapid, consistent professional UI |
| Charts | Recharts | Radar, line, pie, and bar charts with no config hell |
| Icons | Heroicons | Clean, consistent |
| Routing | React Router v6 | Standard |
| State | React Context + hooks | No Redux overkill for a prototype |
| HTTP | Axios | Interceptors for the JWT auth token |
| Backend | Node.js + Express (ESM) | Matches the brief |
| ORM | **Prisma 6** | Schema-first; `schema.prisma` *is* the database design |
| Database | PostgreSQL 16 | Relational data with array columns + enums |
| Auth | JWT + bcryptjs | Stateless, standard |
| AI | **Google Gemini** (`gemini-2.5-flash`) | Fast, cheap, supports JSON-mode responses |

---

## Architecture Decisions

- **Prisma** — the single `backend/prisma/schema.prisma` file is the readable source of truth for the entire data model (users, staff, observations + rubric scores, reviews + criteria scores, goals + milestones + updates, notes). It also gives type-safe queries and clean migrations.
- **JWT auth** — stateless tokens stored client-side; every `/api/*` route except `/api/auth/login` is protected by an `authenticate` middleware that verifies the token and attaches `req.user`.
- **Status workflows with server-side validation** — observations and reviews can only move through *legal* transitions; illegal transitions return a clear `400` error rather than corrupting state.
- **Recharts** — React-native charting so the radar/line/pie/bar visualizations stay declarative.
- **Gemini over OpenAI** — the AI service (`backend/src/services/aiService.js`) wraps the Gemini SDK, builds the prompts, and (for reviews) uses Gemini JSON mode (`responseMimeType: application/json`) so recommendations parse reliably. Swapping providers only touches this one file.

### Database design overview
See [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma). Highlights:
- `User` 1–1 `Staff`; `Staff` belongs to a `School` and optional `Department`.
- `Observation` references a teacher and observer (both `Staff`) and has 4 `ObservationRubricScore` rows (Danielson domains, unique per category).
- `PerformanceReview` references reviewee + reviewer and has up to 6 `ReviewCriteriaScore` rows; `overallRating` is recomputed on every score upsert.
- `Goal` ↔ `Staff` via the `GoalStaff` junction, with `GoalMilestone` and `GoalProgressUpdate` children.
- `Note` uses a flexible `subjectType` + `subjectId` to attach to any record, plus `String[]` tags.

---

## Running Locally

### Prerequisites
- Node.js 18+ and npm
- A PostgreSQL 16 database (the steps below use Docker)
- A Google Gemini API key (optional — the app runs on seeded AI content without one)

### 1. Database (Docker)
```bash
docker run --name k12-postgres \
  -e POSTGRES_USER=eduuser -e POSTGRES_PASSWORD=edupass -e POSTGRES_DB=edu_platform \
  -p 5433:5432 -d postgres:16
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit values (see below)
npx prisma migrate dev      # creates the schema
npm run seed                # loads realistic demo data
npm run dev                 # http://localhost:3001
```

`backend/.env`:
```env
DATABASE_URL="postgresql://eduuser:edupass@localhost:5433/edu_platform?schema=public"
JWT_SECRET="a_long_random_string"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
GEMINI_API_KEY="your_gemini_api_key"   # optional for live AI generation
GEMINI_MODEL="gemini-2.5-flash"
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
In development, Vite proxies `/api` → `http://localhost:3001`, so no frontend env var is needed. For production set `VITE_API_URL` to your deployed backend origin.

Open **http://localhost:5173** and log in with the demo credentials.

---

## AI Integration Detail

`backend/src/services/aiService.js` defines two functions:

- `generateObservationSummary(observation)` — system prompt frames the model as an experienced K-12 administrator using the Danielson Framework; the user prompt injects teacher info, the 4 domain scores + notes, and the observer narrative, and asks for a <300-word, 2–3 paragraph summary. The result is saved to `observation.aiSummary`.
- `generateReviewRecommendations(review)` — system prompt frames the model as a principal focused on professional development; the prompt injects the 6 criteria scores/comments, overall rating, and the teacher's most recent observation summary, and requests **exactly 4** recommendations as JSON (`area`, `recommendation`, `rationale`, `suggestedTimeline`). Stored as a JSON string in `review.aiRecommendations`.

Endpoints: `POST /api/ai/observation-summary` and `POST /api/ai/review-recommendations`.

---

## API Overview

All routes are prefixed `/api`. All except `POST /api/auth/login` require `Authorization: Bearer <token>`.

```
Auth         POST /auth/login · GET /auth/me
Staff        GET/POST /staff · GET/PUT/DELETE /staff/:id · GET /staff/:id/{summary,timeline}
Observations GET/POST /observations · GET/PUT /observations/:id
             PATCH /observations/:id/status · POST /observations/:id/scores
Reviews      GET/POST /reviews · GET/PUT /reviews/:id
             PATCH /reviews/:id/status · POST /reviews/:id/criteria · PUT /reviews/:id/self-assess
Goals        GET/POST /goals · GET/PUT /goals/:id · PATCH /goals/:id/status
             POST/PUT/PATCH /goals/:id/milestones... · POST /goals/:id/updates
Notes        GET/POST /notes · GET/PUT/DELETE /notes/:id
Dashboard    GET /dashboard/{kpis,trend,performance,activity,upcoming}
AI           POST /ai/observation-summary · POST /ai/review-recommendations
```

---

## Deployment (Neon → Railway → Vercel)

### Railway backend env vars (required)
| Variable | Example |
|---|---|
| `DATABASE_URL` | From Neon (see step 1) |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (add localhost too while testing: `http://localhost:5173,https://your-app.vercel.app`) |
| `GEMINI_API_KEY` | Your Google AI key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

After first deploy, open the **Railway shell** and run:
```bash
npx prisma migrate deploy
npm run seed
```

### Vercel frontend env vars
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-backend>.up.railway.app` (no trailing slash) |

Set **Root Directory** to `frontend` when importing the repo.

See **[DEPLOY.md](DEPLOY.md)** for step-by-step manual instructions (GitHub, Neon, Railway, Vercel).

### Production path on AWS (documented, not implemented)
```
├── Frontend: S3 bucket (static hosting) + CloudFront CDN
├── Backend:  Elastic Beanstalk (Node.js) or EC2 t3.micro behind an ALB
├── Database: RDS PostgreSQL (db.t3.micro in a private subnet)
├── AI Calls: optionally extracted to Lambda for cost efficiency
├── Secrets:  AWS Secrets Manager for DB creds + API keys
├── Logging:  CloudWatch logs + alarms
└── CI/CD:    GitHub Actions → deploy on merge to main
```

---

## Project Structure
```
k12/
├── backend/
│   ├── prisma/         # schema.prisma + seed.js
│   ├── src/
│   │   ├── controllers/  routes/  middleware/  services/  utils/
│   └── index.js
├── frontend/
│   └── src/
│       ├── api/  components/  context/  hooks/  pages/  utils/
└── README.md
```

---

## What I'd Build Next
- Role-scoped UI (teachers see only their own reviews/goals; observers limited to observations).
- The stretch `POST /ai/goal-suggestions` endpoint to turn review results into draft goals.
- Real PDF export on the Reports page (currently a labeled placeholder).
- Notifications/email for upcoming observations and approaching goal deadlines.
- Automated tests (API integration + component tests) and code-splitting for the frontend bundle.
