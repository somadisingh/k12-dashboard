// Global error handler — returns clean JSON, never raw stack traces to clients
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  // Prisma "record not found" on update/delete
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }

  const status = err.status || 500;
  const message =
    err.publicMessage ||
    (err.message?.includes('GoogleGenerativeAI')
      ? 'The AI service is temporarily unavailable. Please try again in a moment.'
      : status === 500
      ? 'Internal server error'
      : err.message);
  res.status(status).json({ error: message });
}

// Wraps async controllers so thrown errors reach the error handler
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Helper to throw HTTP errors from controllers
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.publicMessage = message;
  }
}
