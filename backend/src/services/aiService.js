import { GoogleGenerativeAI } from '@google/generative-ai';

// Primary model from env, then fallbacks when Google returns 503/429 (high demand)
const MODEL_CHAIN = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
].filter(Boolean);

const UNIQUE_MODELS = [...new Set(MODEL_CHAIN)];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured');
    err.status = 503;
    err.publicMessage =
      'AI is not configured on the server. Add GEMINI_API_KEY to enable AI generation.';
    throw err;
  }
  return new GoogleGenerativeAI(apiKey);
}

function isRetryable(err) {
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('resource exhausted')
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithFallback({ systemInstruction, generationConfig, prompt }) {
  const genAI = getGenAI();
  let lastError;

  for (const modelName of UNIQUE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          ...(generationConfig ? { generationConfig } : {}),
        });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (err) {
        lastError = err;
        if (isRetryable(err)) {
          await sleep(800 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
  }

  const err = new Error(lastError?.message || 'AI generation failed');
  err.status = 503;
  err.publicMessage =
    'The AI service is temporarily busy. Please wait a moment and try again.';
  throw err;
}

// ─────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────

const OBSERVATION_SYSTEM_PROMPT = `You are an expert K-12 education administrator with 20 years of experience in
teacher evaluation. You write professional, balanced, and constructive classroom
observation summaries using the Danielson Framework for Teaching. Your summaries
are specific, evidence-based, and maintain a supportive yet honest tone.`;

const REVIEW_SYSTEM_PROMPT = `You are a K-12 principal specializing in teacher professional development.
You create specific, SMART professional development recommendations based on
performance review data. Your recommendations are actionable, measurable,
and directly tied to the evaluation evidence.`;

const DOMAIN_LABELS = {
  PLANNING_AND_PREPARATION: 'Domain 1 - Planning & Preparation',
  CLASSROOM_ENVIRONMENT: 'Domain 2 - Classroom Environment',
  INSTRUCTION: 'Domain 3 - Instruction',
  PROFESSIONAL_RESPONSIBILITIES: 'Domain 4 - Professional Responsibilities',
};

const CRITERION_LABELS = {
  TEACHING_EFFECTIVENESS: 'Teaching Effectiveness',
  STUDENT_ENGAGEMENT_AND_OUTCOMES: 'Student Engagement & Outcomes',
  CLASSROOM_MANAGEMENT: 'Classroom Management',
  PROFESSIONALISM_AND_COLLABORATION: 'Professionalism & Collaboration',
  PROFESSIONAL_GROWTH: 'Professional Growth',
  FAMILY_AND_COMMUNITY_ENGAGEMENT: 'Family & Community Engagement',
};

function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildObservationPrompt(obs) {
  const scoreByCat = {};
  for (const s of obs.rubricScores || []) scoreByCat[s.category] = s;

  const domainLines = Object.entries(DOMAIN_LABELS)
    .map(([cat, label]) => {
      const s = scoreByCat[cat];
      return `${label}: ${s ? `${s.score}/4` : 'Not scored'}\n  Notes: ${
        (s && s.notes) || 'None'
      }`;
    })
    .join('\n');

  const t = obs.teacher || {};

  return `Generate a professional classroom observation summary for the following data:

TEACHER: ${t.firstName} ${t.lastName} — ${t.position}
SUBJECT: ${obs.subject} | GRADE: ${obs.gradeLevel} | DATE: ${fmtDate(obs.observedDate || obs.scheduledDate)}
DURATION: ${obs.duration || 'N/A'} minutes | STUDENTS: ${obs.studentCount ?? 'N/A'}

DANIELSON FRAMEWORK SCORES (1=Unsatisfactory, 2=Basic, 3=Proficient, 4=Distinguished):
${domainLines}

OBSERVER NARRATIVE:
Strengths: ${obs.strengths || 'None provided'}
Areas for Growth: ${obs.areasForGrowth || 'None provided'}
Action Items: ${obs.actionItems || 'None provided'}
General Notes: ${obs.narrativeNotes || 'None provided'}

Write a 2-3 paragraph professional observation summary that:
1. Opens by naming the lesson context and overall impression
2. Highlights 2-3 specific strengths with evidence from the notes
3. Identifies 1-2 growth areas constructively, framing them as opportunities
4. Closes with specific recommended next steps

Keep it professional, specific, and under 300 words. Return plain text only (no markdown headers).`;
}

function buildReviewPrompt(review) {
  const scoreByCriterion = {};
  for (const s of review.criteriaScores || []) scoreByCriterion[s.criterion] = s;

  const criteriaLines = Object.entries(CRITERION_LABELS)
    .map(([key, label]) => {
      const s = scoreByCriterion[key];
      return `${label}: ${s ? `${s.score}/5` : 'Not scored'} — "${(s && s.comments) || ''}"`;
    })
    .join('\n');

  const r = review.reviewee || {};

  return `Based on the following annual performance review, generate exactly 4 professional
development recommendations. Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "area": "Category name",
      "recommendation": "Specific action the teacher should take",
      "rationale": "Why this is important based on their review data",
      "suggestedTimeline": "By [specific timeframe]"
    }
  ]
}

TEACHER: ${r.firstName} ${r.lastName} | PERIOD: ${review.reviewPeriod}

PERFORMANCE CRITERIA SCORES (1-5):
${criteriaLines}

Overall Rating: ${review.overallRating ?? 'N/A'}/5

RECENT OBSERVATION SUMMARY:
${review.recentObservationSummary || 'No recent observation data'}

Generate 4 recommendations targeting the lowest-scoring areas.
Be specific, not generic.`;
}

function parseRecommendations(text) {
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.recommendations || [];
}

// ─────────────────────────────────────────
// Public API
// ─────────────────────────────────────────

export async function generateObservationSummary(observationData) {
  const prompt = buildObservationPrompt(observationData);
  return generateWithFallback({
    systemInstruction: OBSERVATION_SYSTEM_PROMPT,
    prompt,
  });
}

export async function generateReviewRecommendations(reviewData) {
  const prompt = buildReviewPrompt(reviewData);
  const text = await generateWithFallback({
    systemInstruction: REVIEW_SYSTEM_PROMPT,
    generationConfig: { responseMimeType: 'application/json' },
    prompt,
  });
  return parseRecommendations(text);
}
