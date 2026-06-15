import client from './client.js';

export const listNotes = (params) => client.get('/notes', { params }).then((r) => r.data);
export const getNote = (id) => client.get(`/notes/${id}`).then((r) => r.data);
export const createNote = (data) => client.post('/notes', data).then((r) => r.data);
export const updateNote = (id, data) => client.put(`/notes/${id}`, data).then((r) => r.data);
export const deleteNote = (id) => client.delete(`/notes/${id}`).then((r) => r.data);
