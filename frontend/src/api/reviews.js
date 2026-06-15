import client from './client.js';

export const listReviews = (params) => client.get('/reviews', { params }).then((r) => r.data);
export const getReview = (id) => client.get(`/reviews/${id}`).then((r) => r.data);
export const createReview = (data) => client.post('/reviews', data).then((r) => r.data);
export const updateReview = (id, data) =>
  client.put(`/reviews/${id}`, data).then((r) => r.data);
export const setReviewStatus = (id, status) =>
  client.patch(`/reviews/${id}/status`, { status }).then((r) => r.data);
export const setReviewCriteria = (id, scores) =>
  client.post(`/reviews/${id}/criteria`, { scores }).then((r) => r.data);
export const selfAssess = (id, selfAssessmentText) =>
  client.put(`/reviews/${id}/self-assess`, { selfAssessmentText }).then((r) => r.data);
