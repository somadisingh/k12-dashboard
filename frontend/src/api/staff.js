import client from './client.js';

export const listStaff = (params) => client.get('/staff', { params }).then((r) => r.data);
export const getStaff = (id) => client.get(`/staff/${id}`).then((r) => r.data);
export const getStaffSummary = (id) =>
  client.get(`/staff/${id}/summary`).then((r) => r.data);
export const getStaffTimeline = (id) =>
  client.get(`/staff/${id}/timeline`).then((r) => r.data);
export const createStaff = (data) => client.post('/staff', data).then((r) => r.data);
export const updateStaff = (id, data) => client.put(`/staff/${id}`, data).then((r) => r.data);
export const deleteStaff = (id) => client.delete(`/staff/${id}`).then((r) => r.data);
