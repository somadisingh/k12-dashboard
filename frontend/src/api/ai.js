import client from './client.js';

export const generateObservationSummary = (observationId) =>
  client.post('/ai/observation-summary', { observationId }).then((r) => r.data);

export const generateReviewRecommendations = (reviewId) =>
  client.post('/ai/review-recommendations', { reviewId }).then((r) => r.data);
