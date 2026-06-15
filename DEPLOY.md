# Deployment Guide — Manual Steps

Follow these in order. Code changes for production CORS and env vars are already in the repo.

---

## Step 1: Push to GitHub (~10 min)

From the project root:

```bash
cd /Users/somaditya/Desktop/k12
git init
git add .
git commit -m "Initial commit: Lincoln K-12 staff performance platform"
```

On GitHub: **New repository** → name it (e.g. `k12-performance-platform`) → **Public** → do **not** add README (you already have one).

```bash
git remote add origin https://github.com/YOUR_USERNAME/k12-performance-platform.git
git branch -M main
git push -u origin main
```

`.gitignore` already excludes `.env`, `node_modules`, and `dist/`. **Never commit `backend/.env`.**

---

## Step 2: Neon — PostgreSQL (~5 min)

1. Go to [neon.tech](https://neon.tech) and sign up / log in.
2. **New Project** → name it `lincoln-k12` → region closest to you.
3. On the project dashboard, copy the **connection string** (PostgreSQL).
4. It looks like:  
   `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. Save this — you'll paste it as `DATABASE_URL` on Railway.

---

## Step 3: Railway — Backend (~20 min)

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → select your repo.
3. Railway may deploy the whole repo. Set the **Root Directory** to `backend`:
   - Project → your service → **Settings** → **Root Directory** → `backend`
4. **Settings → Networking → Generate Domain** — copy the public URL (e.g. `https://k12-backend-production.up.railway.app`). You'll need this for Vercel.
5. **Variables** tab — add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string from Step 2 |
| `JWT_SECRET` | Generate a long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `CORS_ORIGIN` | Leave blank for now; add after Vercel deploy (Step 4) |

6. Wait for the deploy to finish (build runs `prisma generate` via `postinstall`, then `npm start`).

7. **Run migrations + seed** (required — without this the live app is empty):
   - Service → **Shell** (or Deployments → three dots → Open Shell)
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```
   You should see `✅ Seed complete!`

8. Test backend:
   ```bash
   curl https://YOUR-RAILWAY-URL.up.railway.app/api/health
   ```
   Expect: `{"status":"ok"}`

---

## Step 4: Vercel — Frontend (~15 min)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New → Project** → import the same GitHub repo.
3. **Root Directory** → click Edit → set to `frontend`.
4. Framework Preset should auto-detect **Vite**.
5. **Environment Variables**:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` |

No trailing slash. No `/api` suffix — the frontend adds `/api` automatically.

6. **Deploy**. Copy your live URL (e.g. `https://k12-performance-platform.vercel.app`).

---

## Step 5: Fix CORS on Railway (~2 min)

Go back to Railway → your backend service → **Variables**:

Update `CORS_ORIGIN` to include your Vercel URL:

```
https://your-app.vercel.app
```

Or both local + production:

```
http://localhost:5173,https://your-app.vercel.app
```

Railway will redeploy automatically. Without this step, the live frontend gets CORS errors on every API call.

---

## Step 6: Verify live demo (~10 min)

1. Open your Vercel URL.
2. Log in: `admin@lincoln.edu` / `password123`
3. Dashboard should show KPIs (not zeros everywhere).
4. Open a **Completed** observation → AI summary should appear (seeded).
5. Open Emily Rodriguez's **Completed** review → AI recommendations cards should appear.
6. Log in as teacher `ljohnson@lincoln.edu` / `password123` → open her review in **Self Assessment Pending** → submit the self-assessment form.
7. On an observation with status **Submitted**, click **Generate AI Summary** to test live Gemini.

---

## Demo accounts (all use `password123`)

| Email | Role | Use for |
|---|---|---|
| `admin@lincoln.edu` | Admin | Full demo as principal |
| `dchen@lincoln.edu` | Observer | Observations |
| `ljohnson@lincoln.edu` | Teacher | Self-assessment form demo |
| `erodriguez@lincoln.edu` | Teacher | Completed review with AI recs |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Empty dashboard on live site | Run `npx prisma migrate deploy && npm run seed` in Railway shell |
| CORS error in browser console | Add Vercel URL to `CORS_ORIGIN` on Railway |
| AI buttons fail on live site | Set `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-2.5-flash` on Railway |
| 404 on page refresh (Vercel) | `frontend/vercel.json` SPA rewrite is already included |
| Frontend can't reach API | Check `VITE_API_URL` matches Railway domain exactly |

---

## Update README live URL

After deploy, edit `README.md` and add your Vercel URL at the top under a **Live Demo** section for submission.
