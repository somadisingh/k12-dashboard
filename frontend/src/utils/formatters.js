export function formatDate(date, opts) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// "12 days ago", "in 5 days", "today"
export function relativeTime(date) {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `in ${diffDays} days`;
}

export function daysRemaining(date) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}

export function formatScore(score) {
  if (score === null || score === undefined) return '—';
  return Number(score).toFixed(1);
}

// Human-readable enum: SELF_ASSESSMENT_PENDING -> "Self Assessment Pending"
export function humanize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Tailwind classes for status badges
export function getStatusColor(status) {
  const map = {
    // Observation
    SCHEDULED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-indigo-100 text-indigo-700',
    TEACHER_ACKNOWLEDGED: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    // Review
    SELF_ASSESSMENT_PENDING: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700',
    FEEDBACK_SHARED: 'bg-indigo-100 text-indigo-700',
    MEETING_SCHEDULED: 'bg-purple-100 text-purple-700',
    // Goal
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    AT_RISK: 'bg-red-100 text-red-700',
    ARCHIVED: 'bg-slate-100 text-slate-500',
    // Milestone
    PENDING: 'bg-slate-100 text-slate-700',
    MISSED: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

// Hex color by rubric/criteria score
export function getScoreColor(score) {
  if (score >= 4) return '#10b981'; // green
  if (score >= 3) return '#3b82f6'; // blue
  if (score >= 2) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function getCategoryColor(category) {
  const map = {
    INSTRUCTIONAL_PRACTICE: 'bg-indigo-100 text-indigo-700',
    PROFESSIONAL_DEVELOPMENT: 'bg-blue-100 text-blue-700',
    STUDENT_ACHIEVEMENT: 'bg-emerald-100 text-emerald-700',
    COLLABORATION: 'bg-amber-100 text-amber-700',
    LEADERSHIP: 'bg-purple-100 text-purple-700',
    PERSONAL_GROWTH: 'bg-pink-100 text-pink-700',
  };
  return map[category] || 'bg-slate-100 text-slate-700';
}
