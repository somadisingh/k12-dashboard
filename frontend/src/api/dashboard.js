import client from './client.js';

export const getKpis = () => client.get('/dashboard/kpis').then((r) => r.data);
export const getTrend = () => client.get('/dashboard/trend').then((r) => r.data);
export const getPerformance = () => client.get('/dashboard/performance').then((r) => r.data);
export const getActivity = () => client.get('/dashboard/activity').then((r) => r.data);
export const getUpcoming = () => client.get('/dashboard/upcoming').then((r) => r.data);
