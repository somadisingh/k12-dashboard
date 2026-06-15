// ─────────────────────────────────────────
// Danielson Framework rubric categories (observations)
// ─────────────────────────────────────────
export const RUBRIC_CATEGORIES = [
  {
    key: 'PLANNING_AND_PREPARATION',
    domain: 'Domain 1',
    label: 'Planning & Preparation',
    description: 'Lesson goals, content knowledge, and differentiation.',
  },
  {
    key: 'CLASSROOM_ENVIRONMENT',
    domain: 'Domain 2',
    label: 'Classroom Environment',
    description: 'Respectful culture, procedures, and student behavior.',
  },
  {
    key: 'INSTRUCTION',
    domain: 'Domain 3',
    label: 'Instruction',
    description: 'Communication, questioning, and student engagement.',
  },
  {
    key: 'PROFESSIONAL_RESPONSIBILITIES',
    domain: 'Domain 4',
    label: 'Professional Responsibilities',
    description: 'Reflection, family communication, and collegial growth.',
  },
];

export const SCORE_LABELS = {
  1: 'Unsatisfactory',
  2: 'Basic',
  3: 'Proficient',
  4: 'Distinguished',
};

// ─────────────────────────────────────────
// Performance review criteria (1-5 scale)
// ─────────────────────────────────────────
export const REVIEW_CRITERIA = [
  {
    key: 'TEACHING_EFFECTIVENESS',
    label: 'Teaching Effectiveness',
    description: 'Lesson delivery, pacing, and clarity.',
  },
  {
    key: 'STUDENT_ENGAGEMENT_AND_OUTCOMES',
    label: 'Student Engagement & Outcomes',
    description: 'Active participation and measurable results.',
  },
  {
    key: 'CLASSROOM_MANAGEMENT',
    label: 'Classroom Management',
    description: 'Routines, behavior, and environment.',
  },
  {
    key: 'PROFESSIONALISM_AND_COLLABORATION',
    label: 'Professionalism & Collaboration',
    description: 'Punctuality, team meetings, and dress.',
  },
  {
    key: 'PROFESSIONAL_GROWTH',
    label: 'Professional Growth',
    description: 'PD hours and applying new strategies.',
  },
  {
    key: 'FAMILY_AND_COMMUNITY_ENGAGEMENT',
    label: 'Family & Community Engagement',
    description: 'Parent communication and outreach.',
  },
];

export const REVIEW_SCORE_LABELS = {
  1: 'Unsatisfactory',
  2: 'Developing',
  3: 'Proficient',
  4: 'Distinguished',
  5: 'Exemplary',
};

// ─────────────────────────────────────────
// Workflow statuses
// ─────────────────────────────────────────
export const OBSERVATION_STATUSES = [
  'SCHEDULED',
  'IN_PROGRESS',
  'DRAFT',
  'SUBMITTED',
  'TEACHER_ACKNOWLEDGED',
  'COMPLETED',
];

export const REVIEW_STATUSES = [
  'DRAFT',
  'SELF_ASSESSMENT_PENDING',
  'UNDER_REVIEW',
  'FEEDBACK_SHARED',
  'MEETING_SCHEDULED',
  'COMPLETED',
];

export const REVIEW_TYPES = ['ANNUAL', 'MID_YEAR', 'PROBATIONARY', 'INFORMAL'];

export const GOAL_STATUSES = ['ACTIVE', 'AT_RISK', 'COMPLETED', 'ARCHIVED'];

export const GOAL_CATEGORIES = [
  'INSTRUCTIONAL_PRACTICE',
  'PROFESSIONAL_DEVELOPMENT',
  'STUDENT_ACHIEVEMENT',
  'COLLABORATION',
  'LEADERSHIP',
  'PERSONAL_GROWTH',
];

export const MILESTONE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'];

export const NOTE_SUBJECTS = ['GENERAL', 'STAFF', 'OBSERVATION', 'REVIEW', 'GOAL', 'MEETING'];

export const GRADE_LEVELS = [
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
];
