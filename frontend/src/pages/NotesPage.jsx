import { useEffect, useState } from 'react';
import { PlusIcon, MapPinIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolid } from '@heroicons/react/24/solid';
import * as notesApi from '../api/notes.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { NOTE_SUBJECTS } from '../utils/constants.js';
import { formatDate, humanize } from '../utils/formatters.js';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [subjectType, setSubjectType] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // note object or {} for new

  const load = () => {
    setLoading(true);
    const q = {};
    if (subjectType) q.subjectType = subjectType;
    if (activeTag) q.tag = activeTag;
    notesApi
      .listNotes(q)
      .then(setNotes)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load notes'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [subjectType, activeTag]);

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];

  const remove = async (id) => {
    await notesApi.deleteNote(id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Notes & Documentation"
        subtitle="Freeform notes tied to staff, observations, and meetings."
        action={
          <Button onClick={() => setEditing({})}>
            <PlusIcon className="h-4 w-4" /> New Note
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card title="Type">
            <div className="space-y-1">
              <FilterRow label="All" active={!subjectType} onClick={() => setSubjectType('')} />
              {NOTE_SUBJECTS.map((s) => (
                <FilterRow key={s} label={humanize(s)} active={subjectType === s} onClick={() => setSubjectType(s)} />
              ))}
            </div>
          </Card>
          {allTags.length > 0 && (
            <Card title="Tags">
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(activeTag === t ? '' : t)}
                    className={`text-xs px-2.5 py-1 rounded-full transition ${
                      activeTag === t ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          {error && <ErrorBanner message={error} />}
          {loading ? (
            <LoadingSpinner label="Loading notes..." />
          ) : notes.length === 0 ? (
            <Card>
              <EmptyState
                title="No notes"
                message="Create your first note to document meetings and staff."
                action={<Button onClick={() => setEditing({})}>New Note</Button>}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map((n) => (
                <Card key={n.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {n.isPinned && <MapPinSolid className="h-4 w-4 text-primary" />}
                      <h3 className="font-semibold text-slate-900">{n.title}</h3>
                    </div>
                    <Badge label={humanize(n.subjectType)} color="bg-slate-100 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-4 whitespace-pre-line">{n.content}</p>
                  {n.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {n.tags.map((t) => (
                        <span key={t} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {n.author?.firstName} {n.author?.lastName} · {formatDate(n.createdAt)}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(n)} className="text-slate-400 hover:text-primary p-1">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(n.id)} className="text-slate-400 hover:text-danger p-1">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <NoteEditor
        note={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </div>
  );
}

function FilterRow({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
        active ? 'bg-indigo-50 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function NoteEditor({ note, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', content: '', tags: '', subjectType: 'GENERAL', isPinned: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note && note.id) {
      setForm({
        title: note.title,
        content: note.content,
        tags: note.tags.join(', '),
        subjectType: note.subjectType,
        isPinned: note.isPinned,
      });
    } else if (note) {
      setForm({ title: '', content: '', tags: '', subjectType: 'GENERAL', isPinned: false });
    }
    setError('');
  }, [note]);

  if (!note) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      content: form.content,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      subjectType: form.subjectType,
      isPinned: form.isPinned,
    };
    try {
      if (note.id) await notesApi.updateNote(note.id, payload);
      else await notesApi.createNote(payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!note}
      onClose={onClose}
      title={note.id ? 'Edit Note' : 'New Note'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!form.title || !form.content}>
            Save Note
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea className="input" rows={6} value={form.content} onChange={(e) => set('content', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.subjectType} onChange={(e) => set('subjectType', e.target.value)}>
              {NOTE_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {humanize(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="meeting, coaching" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={form.isPinned} onChange={(e) => set('isPinned', e.target.checked)} />
          <MapPinIcon className="h-4 w-4" /> Pin this note
        </label>
      </div>
    </Modal>
  );
}
