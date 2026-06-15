import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────
const now = new Date();
function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
}

// ─────────────────────────────────────────
// Pre-written AI content (so the demo always looks complete)
// ─────────────────────────────────────────
const RODRIGUEZ_AI_SUMMARY = `Ms. Rodriguez delivered an engaging fifth-grade mathematics lesson on fraction operations, demonstrating exceptional mastery of both content and pedagogy. The lesson opened with a well-crafted number talk that activated prior knowledge and immediately captured student attention, with nearly all students participating within the first five minutes.

Standout strengths included her use of multiple representations — moving seamlessly between manipulatives, visual models, and symbolic notation — and her highly effective use of strategic questioning to drive conceptual understanding rather than rote procedures. The classroom environment was notably structured yet warm, with routines so well-established that transitions added minimal time.

One area for continued growth is expanding opportunities for student-to-student discourse during problem-solving. Introducing a structured partner protocol during the work period would allow Ms. Rodriguez to conduct more targeted small-group instruction. Recommended next step: pilot a "think-pair-share" structure in the upcoming unit on decimals and measure its impact on student explanation quality.`;

const THOMPSON_AI_SUMMARY = `Mr. Thompson's seventh-grade English Language Arts lesson on argumentative writing reflected solid planning and a clear instructional purpose. He opened with a relevant real-world prompt that gave students an authentic reason to take a position, and his learning targets were posted and referenced throughout the period.

The lesson's clearest strengths were Mr. Thompson's respectful rapport with students and his consistent classroom routines, both of which created a safe space for sharing developing ideas. Content delivery was accurate and well-organized, and his modeling of a thesis statement gave students a concrete starting point.

The primary growth opportunity lies in the instructional delivery itself: questioning skewed toward lower-cognitive recall, and a significant portion of class time was spent in whole-group lecture rather than active student practice. As a next step, Mr. Thompson is encouraged to build in more frequent checks for understanding and to shift toward a gradual-release model so students spend more of the period writing. A targeted focus on higher-order questioning would meaningfully raise the rigor of student discourse.`;

const RODRIGUEZ_REVIEW_RECS = [
  {
    area: 'Student Discourse',
    recommendation:
      'Implement a structured academic discourse routine (e.g., Talk Moves) in at least three lessons per week to increase student-to-student reasoning.',
    rationale:
      'Observation data and review scores show strong instruction but limited peer-to-peer mathematical conversation; structured protocols will deepen conceptual understanding.',
    suggestedTimeline: 'By the end of the fall semester',
  },
  {
    area: 'Leadership',
    recommendation:
      'Lead a grade-level PLC session modeling her number-talk routine for colleagues.',
    rationale:
      'Her exemplary classroom environment and instruction make her an ideal peer model, supporting the school goal of distributed instructional leadership.',
    suggestedTimeline: 'By November 2025',
  },
  {
    area: 'Family Engagement',
    recommendation:
      'Pilot a monthly "math at home" family newsletter with one strategy parents can practice.',
    rationale:
      'Family & community engagement was her lowest-scoring criterion; a lightweight, sustainable routine will strengthen the home-school connection.',
    suggestedTimeline: 'Beginning next grading period',
  },
  {
    area: 'Professional Growth',
    recommendation:
      'Attend a workshop on differentiation for advanced learners and apply one strategy in her highest-performing math group.',
    rationale:
      'To continue growing from proficient to distinguished, stretching her highest achievers is the clearest next frontier.',
    suggestedTimeline: 'By spring 2026',
  },
];

async function main() {
  console.log('Clearing existing data...');
  // Order matters because of FKs
  await prisma.goalProgressUpdate.deleteMany();
  await prisma.goalMilestone.deleteMany();
  await prisma.goalStaff.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.note.deleteMany();
  await prisma.reviewCriteriaScore.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.observationRubricScore.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.department.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating school & departments...');
  const school = await prisma.school.create({
    data: {
      name: 'Lincoln K-12 Academy',
      address: '450 Lincoln Blvd, Springfield',
      phone: '(555) 014-2200',
    },
  });

  const mathDept = await prisma.department.create({
    data: { name: 'Mathematics', schoolId: school.id },
  });
  const elaDept = await prisma.department.create({
    data: { name: 'English Language Arts', schoolId: school.id },
  });
  const sciDept = await prisma.department.create({
    data: { name: 'Science', schoolId: school.id },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Creating staff & users...');
  async function makeStaff(data) {
    return prisma.staff.create({
      data: {
        user: {
          create: { email: data.email, passwordHash, role: data.role },
        },
        school: { connect: { id: school.id } },
        ...(data.departmentId ? { department: { connect: { id: data.departmentId } } } : {}),
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        gradeLevel: data.gradeLevel,
        subjects: data.subjects || [],
        hireDate: data.hireDate,
        phone: data.phone,
        bio: data.bio,
      },
    });
  }

  const sarah = await makeStaff({
    email: 'admin@lincoln.edu',
    role: 'ADMIN',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    position: 'Principal',
    hireDate: daysAgo(365 * 8),
    phone: '(555) 014-2201',
    bio: 'Principal of Lincoln K-12 Academy with over 18 years in education leadership.',
  });

  const david = await makeStaff({
    email: 'dchen@lincoln.edu',
    role: 'OBSERVER',
    firstName: 'David',
    lastName: 'Chen',
    position: 'Assistant Principal',
    hireDate: daysAgo(365 * 5),
    phone: '(555) 014-2202',
    bio: 'Assistant Principal overseeing instructional coaching and classroom observations.',
  });

  const emily = await makeStaff({
    email: 'erodriguez@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    position: '5th Grade Math',
    gradeLevel: 'Elementary',
    departmentId: mathDept.id,
    subjects: ['Math', 'Fractions'],
    hireDate: daysAgo(365 * 6),
    phone: '(555) 014-2210',
    bio: 'Fifth-grade mathematics teacher passionate about conceptual, hands-on learning.',
  });

  const james = await makeStaff({
    email: 'jthompson@lincoln.edu',
    role: 'TEACHER',
    firstName: 'James',
    lastName: 'Thompson',
    position: '7th Grade ELA',
    gradeLevel: 'Middle School',
    departmentId: elaDept.id,
    subjects: ['English', 'Writing'],
    hireDate: daysAgo(365 * 3),
    phone: '(555) 014-2211',
    bio: 'Seventh-grade ELA teacher focused on argumentative and analytical writing.',
  });

  const maria = await makeStaff({
    email: 'msantos@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Maria',
    lastName: 'Santos',
    position: 'Biology',
    gradeLevel: 'High School',
    departmentId: sciDept.id,
    subjects: ['Biology', 'Life Science'],
    hireDate: daysAgo(365 * 4),
    phone: '(555) 014-2212',
    bio: 'High school biology teacher and science fair coordinator.',
  });

  const kevin = await makeStaff({
    email: 'kpark@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Kevin',
    lastName: 'Park',
    position: 'Algebra II',
    gradeLevel: 'High School',
    departmentId: mathDept.id,
    subjects: ['Algebra II', 'Pre-Calculus'],
    hireDate: daysAgo(365 * 2),
    phone: '(555) 014-2213',
    bio: 'High school mathematics teacher specializing in Algebra II and Pre-Calculus.',
  });

  const lisa = await makeStaff({
    email: 'ljohnson@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Lisa',
    lastName: 'Johnson',
    position: '3rd Grade ELA',
    gradeLevel: 'Elementary',
    departmentId: elaDept.id,
    subjects: ['Reading', 'Phonics'],
    hireDate: daysAgo(365 * 7),
    phone: '(555) 014-2214',
    bio: 'Third-grade reading teacher focused on early literacy.',
  });

  const tom = await makeStaff({
    email: 'twilliams@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Tom',
    lastName: 'Williams',
    position: 'Chemistry',
    gradeLevel: 'High School',
    departmentId: sciDept.id,
    subjects: ['Chemistry', 'AP Chemistry'],
    hireDate: daysAgo(365 * 1),
    phone: '(555) 014-2215',
    bio: 'High school chemistry teacher and robotics club advisor.',
  });

  const aisha = await makeStaff({
    email: 'apatel@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Aisha',
    lastName: 'Patel',
    position: '6th Grade Math',
    gradeLevel: 'Middle School',
    departmentId: mathDept.id,
    subjects: ['Math', 'Pre-Algebra'],
    hireDate: daysAgo(365 * 2 + 120),
    phone: '(555) 014-2216',
    bio: 'Sixth-grade mathematics teacher and Math Olympiad coach.',
  });

  const robert = await makeStaff({
    email: 'rbrown@lincoln.edu',
    role: 'TEACHER',
    firstName: 'Robert',
    lastName: 'Brown',
    position: '8th Grade ELA',
    gradeLevel: 'Middle School',
    departmentId: elaDept.id,
    subjects: ['English', 'Literature'],
    hireDate: daysAgo(365 * 9),
    phone: '(555) 014-2217',
    bio: 'Eighth-grade literature teacher and yearbook advisor.',
  });

  // ─────────────────────────────────────────
  // OBSERVATIONS (6)
  // ─────────────────────────────────────────
  console.log('Creating observations...');

  const RC = {
    P: 'PLANNING_AND_PREPARATION',
    C: 'CLASSROOM_ENVIRONMENT',
    I: 'INSTRUCTION',
    R: 'PROFESSIONAL_RESPONSIBILITIES',
  };

  // 1. Emily — COMPLETED — 4/3/4/3 — with AI summary
  await prisma.observation.create({
    data: {
      teacherId: emily.id,
      observerId: david.id,
      scheduledDate: daysAgo(40),
      observedDate: daysAgo(40),
      duration: 50,
      subject: 'Mathematics',
      gradeLevel: '5th Grade',
      classPeriod: 'Period 2',
      studentCount: 24,
      unit: 'Fraction Operations',
      status: 'COMPLETED',
      preObsNotes: 'Pre-conference held. Lesson focus: adding and subtracting fractions with unlike denominators.',
      narrativeNotes:
        'Lesson opened with a number talk. Students used fraction tiles and area models before moving to symbolic notation. Strong pacing throughout.',
      strengths:
        'Excellent use of multiple representations; strategic questioning that surfaced student thinking; warm, well-managed classroom.',
      areasForGrowth:
        'Could add more structured student-to-student discourse during the work period.',
      actionItems: 'Pilot a think-pair-share structure in the decimals unit.',
      postObsNotes: 'Post-conference completed. Emily is reflective and receptive to feedback.',
      aiSummary: RODRIGUEZ_AI_SUMMARY,
      aiGeneratedAt: daysAgo(39),
      rubricScores: {
        create: [
          { category: RC.P, score: 4, notes: 'Clear, standards-aligned objectives with differentiation built in.' },
          { category: RC.C, score: 3, notes: 'Respectful, well-managed environment; routines are established.' },
          { category: RC.I, score: 4, notes: 'Outstanding questioning and use of representations.' },
          { category: RC.R, score: 3, notes: 'Reflective practitioner; communicates regularly with families.' },
        ],
      },
    },
  });

  // 2. James — COMPLETED — 3/3/2/3 — with AI summary
  await prisma.observation.create({
    data: {
      teacherId: james.id,
      observerId: david.id,
      scheduledDate: daysAgo(28),
      observedDate: daysAgo(28),
      duration: 55,
      subject: 'English Language Arts',
      gradeLevel: '7th Grade',
      classPeriod: 'Period 4',
      studentCount: 27,
      unit: 'Argumentative Writing',
      status: 'COMPLETED',
      preObsNotes: 'Lesson goal: students draft a thesis statement for a persuasive essay.',
      narrativeNotes:
        'Opened with a real-world prompt. Teacher modeled a thesis. Much of the period was whole-group lecture; limited active writing time.',
      strengths: 'Respectful rapport with students; clear routines; accurate, organized content.',
      areasForGrowth:
        'Questioning leaned on recall; students need more time for active practice and writing.',
      actionItems: 'Shift to a gradual-release model; build in more checks for understanding.',
      postObsNotes: 'Post-conference held. James is open to trying gradual release next unit.',
      aiSummary: THOMPSON_AI_SUMMARY,
      aiGeneratedAt: daysAgo(27),
      rubricScores: {
        create: [
          { category: RC.P, score: 3, notes: 'Solid planning with posted learning targets.' },
          { category: RC.C, score: 3, notes: 'Positive rapport and consistent routines.' },
          { category: RC.I, score: 2, notes: 'Lecture-heavy; recall-level questioning limits rigor.' },
          { category: RC.R, score: 3, notes: 'Engaged team member; communicates with families.' },
        ],
      },
    },
  });

  // 3. Maria — SUBMITTED — 3/4/3/4
  await prisma.observation.create({
    data: {
      teacherId: maria.id,
      observerId: david.id,
      scheduledDate: daysAgo(10),
      observedDate: daysAgo(10),
      duration: 50,
      subject: 'Biology',
      gradeLevel: '10th Grade',
      classPeriod: 'Period 1',
      studentCount: 22,
      unit: 'Cellular Respiration',
      status: 'SUBMITTED',
      narrativeNotes:
        'Lab-based lesson with strong student engagement. Clear safety routines. Students worked collaboratively.',
      strengths: 'Exceptional classroom environment; strong professional collaboration with the science team.',
      areasForGrowth: 'Tighten the lesson opening to reduce setup time.',
      actionItems: 'Prepare lab stations before class to maximize instructional minutes.',
      rubricScores: {
        create: [
          { category: RC.P, score: 3, notes: 'Well-planned lab with clear procedures.' },
          { category: RC.C, score: 4, notes: 'Outstanding, safe, collaborative environment.' },
          { category: RC.I, score: 3, notes: 'Good facilitation of inquiry.' },
          { category: RC.R, score: 4, notes: 'Strong collaborator and science fair lead.' },
        ],
      },
    },
  });

  // 4. Kevin — DRAFT — 2/3/2/2
  await prisma.observation.create({
    data: {
      teacherId: kevin.id,
      observerId: david.id,
      scheduledDate: daysAgo(5),
      observedDate: daysAgo(5),
      duration: 50,
      subject: 'Algebra II',
      gradeLevel: '11th Grade',
      classPeriod: 'Period 3',
      studentCount: 26,
      unit: 'Quadratic Functions',
      status: 'DRAFT',
      narrativeNotes:
        'Procedural lesson on the quadratic formula. Several students disengaged in the back. Pacing was rushed.',
      strengths: 'Strong content knowledge; positive relationships with students.',
      areasForGrowth: 'Planning needs more differentiation; classroom management during independent work.',
      actionItems: 'Co-plan a differentiated lesson with the math coach.',
      rubricScores: {
        create: [
          { category: RC.P, score: 2, notes: 'Plan lacked differentiation for varied levels.' },
          { category: RC.C, score: 3, notes: 'Generally positive; some off-task behavior in back rows.' },
          { category: RC.I, score: 2, notes: 'Procedural focus; few opportunities for sense-making.' },
          { category: RC.R, score: 2, notes: 'Developing reflective practice.' },
        ],
      },
    },
  });

  // 5. Aisha — IN_PROGRESS — no scores
  await prisma.observation.create({
    data: {
      teacherId: aisha.id,
      observerId: david.id,
      scheduledDate: daysAgo(0),
      observedDate: daysAgo(0),
      duration: 50,
      subject: 'Mathematics',
      gradeLevel: '6th Grade',
      classPeriod: 'Period 5',
      studentCount: 25,
      unit: 'Ratios & Proportions',
      status: 'IN_PROGRESS',
      preObsNotes: 'Observation in progress — observer currently in the classroom.',
    },
  });

  // 6. Tom — SCHEDULED — next week
  await prisma.observation.create({
    data: {
      teacherId: tom.id,
      observerId: david.id,
      scheduledDate: daysFromNow(7),
      duration: 50,
      subject: 'Chemistry',
      gradeLevel: '12th Grade',
      classPeriod: 'Period 6',
      studentCount: 20,
      unit: 'Stoichiometry',
      status: 'SCHEDULED',
      preObsNotes: 'Pre-conference scheduled for the day before the observation.',
    },
  });

  // ─────────────────────────────────────────
  // PERFORMANCE REVIEWS (4)
  // ─────────────────────────────────────────
  console.log('Creating performance reviews...');

  const CRIT = {
    TE: 'TEACHING_EFFECTIVENESS',
    SE: 'STUDENT_ENGAGEMENT_AND_OUTCOMES',
    CM: 'CLASSROOM_MANAGEMENT',
    PC: 'PROFESSIONALISM_AND_COLLABORATION',
    PG: 'PROFESSIONAL_GROWTH',
    FC: 'FAMILY_AND_COMMUNITY_ENGAGEMENT',
  };

  // 1. Emily — COMPLETED — 4.2 — with AI recommendations
  await prisma.performanceReview.create({
    data: {
      revieweeId: emily.id,
      reviewerId: sarah.id,
      reviewPeriod: '2024-2025 Annual',
      reviewType: 'ANNUAL',
      status: 'COMPLETED',
      overallRating: 4.2,
      summaryComments:
        'Emily had an outstanding year, consistently demonstrating distinguished instruction and a warm, structured classroom.',
      strengthsNarrative:
        'Exceptional use of multiple representations, strategic questioning, and strong classroom culture.',
      growthNarrative:
        'Continue expanding student discourse and strengthen the home-school connection.',
      adminPrivateNotes: 'Strong candidate for grade-level lead next year.',
      selfAssessmentText:
        'I am proud of my students\' growth in conceptual understanding this year and want to focus next on increasing student-led discourse.',
      selfSubmittedAt: daysAgo(35),
      meetingDate: daysAgo(30),
      completedAt: daysAgo(29),
      aiRecommendations: JSON.stringify(RODRIGUEZ_REVIEW_RECS),
      aiGeneratedAt: daysAgo(29),
      criteriaScores: {
        create: [
          { criterion: CRIT.TE, score: 5, comments: 'Distinguished instruction with strong conceptual focus.' },
          { criterion: CRIT.SE, score: 4, comments: 'High engagement; could add more peer discourse.' },
          { criterion: CRIT.CM, score: 5, comments: 'Exemplary routines and culture.' },
          { criterion: CRIT.PC, score: 4, comments: 'Reliable, collaborative team member.' },
          { criterion: CRIT.PG, score: 4, comments: 'Actively applies new strategies.' },
          { criterion: CRIT.FC, score: 3, comments: 'Room to grow on proactive family outreach.' },
        ],
      },
    },
  });

  // 2. James — FEEDBACK_SHARED — 3.1
  await prisma.performanceReview.create({
    data: {
      revieweeId: james.id,
      reviewerId: sarah.id,
      reviewPeriod: '2024-2025 Annual',
      reviewType: 'ANNUAL',
      status: 'FEEDBACK_SHARED',
      overallRating: 3.1,
      summaryComments:
        'James is a dependable teacher with strong relationships. The focus area this year is increasing instructional rigor and active student practice.',
      strengthsNarrative: 'Excellent rapport, consistent routines, and accurate content.',
      growthNarrative:
        'Move from lecture-heavy delivery toward gradual release and higher-order questioning.',
      criteriaScores: {
        create: [
          { criterion: CRIT.TE, score: 3, comments: 'Solid but lecture-heavy.' },
          { criterion: CRIT.SE, score: 2, comments: 'Engagement dips during long lectures.' },
          { criterion: CRIT.CM, score: 4, comments: 'Well-managed classroom.' },
          { criterion: CRIT.PC, score: 4, comments: 'Strong collaborator.' },
          { criterion: CRIT.PG, score: 3, comments: 'Open to coaching.' },
          { criterion: CRIT.FC, score: 3, comments: 'Adequate family communication.' },
        ],
      },
    },
  });

  // 3. Maria — MID_YEAR — UNDER_REVIEW — scores entered
  await prisma.performanceReview.create({
    data: {
      revieweeId: maria.id,
      reviewerId: sarah.id,
      reviewPeriod: '2024-2025 Mid-Year',
      reviewType: 'MID_YEAR',
      status: 'UNDER_REVIEW',
      overallRating: 3.8,
      summaryComments: 'Mid-year check-in: Maria is performing strongly, especially in collaboration.',
      criteriaScores: {
        create: [
          { criterion: CRIT.TE, score: 4, comments: 'Effective inquiry-based instruction.' },
          { criterion: CRIT.SE, score: 4, comments: 'Strong lab engagement.' },
          { criterion: CRIT.CM, score: 4, comments: 'Excellent lab safety and management.' },
          { criterion: CRIT.PC, score: 4, comments: 'Outstanding science team collaboration.' },
          { criterion: CRIT.PG, score: 3, comments: 'Pursuing NGSS certification.' },
          { criterion: CRIT.FC, score: 4, comments: 'Active in science fair outreach.' },
        ],
      },
    },
  });

  // 4. Kevin — ANNUAL — DRAFT — just created
  await prisma.performanceReview.create({
    data: {
      revieweeId: kevin.id,
      reviewerId: sarah.id,
      reviewPeriod: '2024-2025 Annual',
      reviewType: 'ANNUAL',
      status: 'DRAFT',
    },
  });

  // 5. Lisa — ANNUAL — SELF_ASSESSMENT_PENDING — for self-assessment demo
  await prisma.performanceReview.create({
    data: {
      revieweeId: lisa.id,
      reviewerId: sarah.id,
      reviewPeriod: '2024-2025 Annual',
      reviewType: 'ANNUAL',
      status: 'SELF_ASSESSMENT_PENDING',
      summaryComments: 'Annual review opened; awaiting teacher self-assessment before scoring.',
    },
  });

  // ─────────────────────────────────────────
  // GOALS (10) — 4 ACTIVE, 2 AT_RISK, 3 COMPLETED, 1 ARCHIVED
  // ─────────────────────────────────────────
  console.log('Creating goals...');

  async function makeGoal(g) {
    const goal = await prisma.goal.create({
      data: {
        title: g.title,
        description: g.description,
        category: g.category,
        targetDate: g.targetDate,
        status: g.status,
        completedAt: g.completedAt || null,
        assignments: { create: { staffId: g.staffId, createdById: sarah.id } },
        milestones: g.milestones ? { create: g.milestones } : undefined,
      },
    });
    if (g.updates) {
      for (const u of g.updates) {
        await prisma.goalProgressUpdate.create({
          data: { goalId: goal.id, authorId: u.authorId, content: u.content, createdAt: u.createdAt },
        });
      }
    }
    return goal;
  }

  // COMPLETED 1
  await makeGoal({
    staffId: james.id,
    title: 'Implement Socratic Seminar techniques in weekly ELA discussions',
    description: 'Establish a weekly student-led Socratic seminar to deepen textual analysis.',
    category: 'INSTRUCTIONAL_PRACTICE',
    status: 'COMPLETED',
    targetDate: daysAgo(20),
    completedAt: daysAgo(22),
    milestones: [
      { title: 'Attend Socratic seminar PD', dueDate: daysAgo(80), status: 'COMPLETED', completedAt: daysAgo(82) },
      { title: 'Pilot first seminar', dueDate: daysAgo(50), status: 'COMPLETED', completedAt: daysAgo(51) },
      { title: 'Run weekly for one unit', dueDate: daysAgo(22), status: 'COMPLETED', completedAt: daysAgo(22) },
    ],
    updates: [
      { authorId: james.id, content: 'Completed the PD and drafted my first seminar plan.', createdAt: daysAgo(80) },
      { authorId: sarah.id, content: 'Observed the pilot — students were highly engaged. Great work!', createdAt: daysAgo(50) },
    ],
  });

  // AT_RISK 1
  await makeGoal({
    staffId: kevin.id,
    title: 'Achieve 85% student proficiency on state math assessment',
    description: 'Raise Algebra II proficiency rates through targeted intervention.',
    category: 'STUDENT_ACHIEVEMENT',
    status: 'AT_RISK',
    targetDate: daysFromNow(18),
    milestones: [
      { title: 'Administer diagnostic', dueDate: daysAgo(60), status: 'COMPLETED', completedAt: daysAgo(60) },
      { title: 'Run weekly intervention groups', dueDate: daysFromNow(5), status: 'IN_PROGRESS' },
      { title: 'Reach 85% on benchmark', dueDate: daysFromNow(18), status: 'PENDING' },
    ],
    updates: [
      { authorId: kevin.id, content: 'Diagnostic shows 64% proficiency. Starting intervention groups.', createdAt: daysAgo(55) },
      { authorId: kevin.id, content: 'Up to 71% on the last benchmark — behind pace but improving.', createdAt: daysAgo(12) },
    ],
  });

  // ACTIVE 1
  await makeGoal({
    staffId: maria.id,
    title: 'Complete 40 hours of STEM professional development',
    description: 'Pursue NGSS-aligned STEM PD to enhance inquiry-based instruction.',
    category: 'PROFESSIONAL_DEVELOPMENT',
    status: 'ACTIVE',
    targetDate: daysFromNow(60),
    milestones: [
      { title: 'Enroll in NGSS course', dueDate: daysAgo(30), status: 'COMPLETED', completedAt: daysAgo(31) },
      { title: 'Complete 20 hours', dueDate: daysFromNow(20), status: 'IN_PROGRESS' },
      { title: 'Complete 40 hours', dueDate: daysFromNow(60), status: 'PENDING' },
    ],
    updates: [
      { authorId: maria.id, content: 'Enrolled and logged my first 12 hours.', createdAt: daysAgo(25) },
    ],
  });

  // ACTIVE 2
  await makeGoal({
    staffId: lisa.id,
    title: 'Develop differentiated materials for IEP students',
    description: 'Create a library of leveled reading materials for students with IEPs.',
    category: 'INSTRUCTIONAL_PRACTICE',
    status: 'ACTIVE',
    targetDate: daysFromNow(45),
    milestones: [
      { title: 'Audit current materials', dueDate: daysAgo(10), status: 'COMPLETED', completedAt: daysAgo(11) },
      { title: 'Create 3 leveled sets', dueDate: daysFromNow(25), status: 'IN_PROGRESS' },
    ],
    updates: [
      { authorId: lisa.id, content: 'Finished the audit; identified gaps in lower-Lexile texts.', createdAt: daysAgo(9) },
    ],
  });

  // ACTIVE 3
  await makeGoal({
    staffId: emily.id,
    title: 'Increase student-to-student math discourse',
    description: 'Implement structured talk routines in daily math instruction.',
    category: 'INSTRUCTIONAL_PRACTICE',
    status: 'ACTIVE',
    targetDate: daysFromNow(75),
    milestones: [
      { title: 'Introduce Talk Moves', dueDate: daysFromNow(15), status: 'IN_PROGRESS' },
      { title: 'Use in 3 lessons/week', dueDate: daysFromNow(45), status: 'PENDING' },
    ],
    updates: [
      { authorId: emily.id, content: 'Started using sentence stems for partner talk.', createdAt: daysAgo(3) },
    ],
  });

  // ACTIVE 4
  await makeGoal({
    staffId: aisha.id,
    title: 'Launch a Math Olympiad club for middle schoolers',
    description: 'Establish a competitive math club to extend learning for advanced students.',
    category: 'LEADERSHIP',
    status: 'ACTIVE',
    targetDate: daysFromNow(40),
    milestones: [
      { title: 'Recruit 15 students', dueDate: daysFromNow(10), status: 'IN_PROGRESS' },
      { title: 'Host first competition', dueDate: daysFromNow(38), status: 'PENDING' },
    ],
    updates: [
      { authorId: aisha.id, content: 'Sign-up form is live; 9 students interested so far.', createdAt: daysAgo(2) },
    ],
  });

  // AT_RISK 2
  await makeGoal({
    staffId: tom.id,
    title: 'Integrate weekly inquiry labs into Chemistry',
    description: 'Add a hands-on inquiry lab each week to boost engagement.',
    category: 'INSTRUCTIONAL_PRACTICE',
    status: 'AT_RISK',
    targetDate: daysFromNow(6),
    milestones: [
      { title: 'Design 4 inquiry labs', dueDate: daysAgo(5), status: 'MISSED' },
      { title: 'Run labs for one month', dueDate: daysFromNow(6), status: 'PENDING' },
    ],
    updates: [
      { authorId: tom.id, content: 'Behind on lab design due to scheduling — need support.', createdAt: daysAgo(4) },
    ],
  });

  // COMPLETED 2
  await makeGoal({
    staffId: emily.id,
    title: 'Earn Google Certified Educator Level 1',
    description: 'Complete certification to integrate Google tools in the classroom.',
    category: 'PROFESSIONAL_DEVELOPMENT',
    status: 'COMPLETED',
    targetDate: daysAgo(60),
    completedAt: daysAgo(65),
    milestones: [
      { title: 'Complete training modules', dueDate: daysAgo(75), status: 'COMPLETED', completedAt: daysAgo(76) },
      { title: 'Pass certification exam', dueDate: daysAgo(60), status: 'COMPLETED', completedAt: daysAgo(65) },
    ],
  });

  // COMPLETED 3
  await makeGoal({
    staffId: robert.id,
    title: 'Lead the 8th grade interdisciplinary unit',
    description: 'Coordinate a cross-curricular unit with the science and history teams.',
    category: 'COLLABORATION',
    status: 'COMPLETED',
    targetDate: daysAgo(15),
    completedAt: daysAgo(16),
    milestones: [
      { title: 'Plan unit with teams', dueDate: daysAgo(45), status: 'COMPLETED', completedAt: daysAgo(46) },
      { title: 'Deliver unit', dueDate: daysAgo(15), status: 'COMPLETED', completedAt: daysAgo(16) },
    ],
  });

  // ARCHIVED 1
  await makeGoal({
    staffId: james.id,
    title: 'Pilot a classroom blog (deprioritized)',
    description: 'Originally planned classroom blog; replaced by the LMS rollout.',
    category: 'PERSONAL_GROWTH',
    status: 'ARCHIVED',
    targetDate: daysAgo(90),
  });

  // ─────────────────────────────────────────
  // NOTES (8)
  // ─────────────────────────────────────────
  console.log('Creating notes...');

  const firstObs = await prisma.observation.findFirst({ where: { teacherId: emily.id } });
  const secondObs = await prisma.observation.findFirst({ where: { teacherId: james.id } });

  await prisma.note.createMany({
    data: [
      {
        authorId: sarah.id,
        title: 'Leadership Team Weekly Recap',
        content:
          'Discussed observation cycle progress, upcoming PD on differentiation, and budget for STEM materials. Action: David to finalize the observation schedule.',
        tags: ['leadership', 'weekly'],
        subjectType: 'GENERAL',
        isPinned: true,
      },
      {
        authorId: sarah.id,
        title: 'Reminder: Submit Mid-Year Reviews',
        content: 'All mid-year reviews must reach UNDER_REVIEW status by the end of the month.',
        tags: ['reviews', 'deadline'],
        subjectType: 'GENERAL',
      },
      {
        authorId: david.id,
        title: 'Coaching note — Kevin Park',
        content:
          'Kevin would benefit from co-planning a differentiated Algebra II lesson. Strong content knowledge; needs support with management during independent work.',
        tags: ['coaching', 'math'],
        subjectType: 'STAFF',
        subjectId: kevin.id,
      },
      {
        authorId: sarah.id,
        title: 'Recognition — Emily Rodriguez',
        content: 'Emily volunteered to mentor a first-year teacher. Consider for grade-level lead.',
        tags: ['recognition'],
        subjectType: 'STAFF',
        subjectId: emily.id,
        isPinned: true,
      },
      {
        authorId: david.id,
        title: 'Observation follow-up — Rodriguez fractions lesson',
        content: 'Follow up on the think-pair-share pilot in the decimals unit. Check student explanation samples.',
        tags: ['observation', 'follow-up'],
        subjectType: 'OBSERVATION',
        subjectId: firstObs?.id || null,
      },
      {
        authorId: david.id,
        title: 'Observation follow-up — Thompson writing lesson',
        content: 'Share gradual-release resources with James and schedule a coaching cycle.',
        tags: ['observation', 'ela'],
        subjectType: 'OBSERVATION',
        subjectId: secondObs?.id || null,
      },
      {
        authorId: sarah.id,
        title: 'Faculty Meeting — September',
        content:
          'Agenda: new attendance policy, observation timeline, and the wellness initiative. 92% staff attendance.',
        tags: ['faculty', 'meeting'],
        subjectType: 'MEETING',
      },
      {
        authorId: david.id,
        title: 'Mathematics Department Meeting',
        content:
          'Reviewed benchmark data, agreed on a common pacing guide, and discussed intervention groups for Algebra II.',
        tags: ['math', 'department', 'meeting'],
        subjectType: 'MEETING',
      },
    ],
  });

  console.log('\n✅ Seed complete!');
  console.log('   School: Lincoln K-12 Academy');
  console.log('   Login:  admin@lincoln.edu / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
