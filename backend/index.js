import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { authenticate } from './src/middleware/auth.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.js';
import staffRoutes from './src/routes/staff.js';
import observationRoutes from './src/routes/observations.js';
import reviewRoutes from './src/routes/reviews.js';
import goalRoutes from './src/routes/goals.js';
import noteRoutes from './src/routes/notes.js';
import dashboardRoutes from './src/routes/dashboard.js';
import aiRoutes from './src/routes/ai.js';

const app = express();

// Comma-separated allowed origins, e.g. http://localhost:5173,https://your-app.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, mobile) and configured frontend origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public auth routes (login is public; /me is protected inside the router)
app.use('/api/auth', authRoutes);

// All remaining routes require a valid JWT
app.use('/api/staff', authenticate, staffRoutes);
app.use('/api/observations', authenticate, observationRoutes);
app.use('/api/reviews', authenticate, reviewRoutes);
app.use('/api/goals', authenticate, goalRoutes);
app.use('/api/notes', authenticate, noteRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/ai', authenticate, aiRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;
