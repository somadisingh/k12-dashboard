import client from './client.js';

export const listObservations = (params) =>
  client.get('/observations', { params }).then((r) => r.data);
export const getObservation = (id) =>
  client.get(`/observations/${id}`).then((r) => r.data);
export const createObservation = (data) =>
  client.post('/observations', data).then((r) => r.data);
export const updateObservation = (id, data) =>
  client.put(`/observations/${id}`, data).then((r) => r.data);
export const setObservationStatus = (id, status) =>
  client.patch(`/observations/${id}/status`, { status }).then((r) => r.data);
export const setObservationScores = (id, scores) =>
  client.post(`/observations/${id}/scores`, { scores }).then((r) => r.data);
