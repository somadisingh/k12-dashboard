import client from './client.js';

export const listGoals = (params) => client.get('/goals', { params }).then((r) => r.data);
export const getGoal = (id) => client.get(`/goals/${id}`).then((r) => r.data);
export const createGoal = (data) => client.post('/goals', data).then((r) => r.data);
export const updateGoal = (id, data) => client.put(`/goals/${id}`, data).then((r) => r.data);
export const setGoalStatus = (id, status) =>
  client.patch(`/goals/${id}/status`, { status }).then((r) => r.data);
export const addMilestone = (id, data) =>
  client.post(`/goals/${id}/milestones`, data).then((r) => r.data);
export const updateMilestone = (id, mid, data) =>
  client.put(`/goals/${id}/milestones/${mid}`, data).then((r) => r.data);
export const setMilestoneStatus = (id, mid, status) =>
  client.patch(`/goals/${id}/milestones/${mid}/status`, { status }).then((r) => r.data);
export const addGoalUpdate = (id, content) =>
  client.post(`/goals/${id}/updates`, { content }).then((r) => r.data);
