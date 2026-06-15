-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OBSERVER', 'TEACHER');

-- CreateEnum
CREATE TYPE "ObservationStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'DRAFT', 'SUBMITTED', 'TEACHER_ACKNOWLEDGED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RubricCategory" AS ENUM ('PLANNING_AND_PREPARATION', 'CLASSROOM_ENVIRONMENT', 'INSTRUCTION', 'PROFESSIONAL_RESPONSIBILITIES');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('ANNUAL', 'MID_YEAR', 'PROBATIONARY', 'INFORMAL');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SELF_ASSESSMENT_PENDING', 'UNDER_REVIEW', 'FEEDBACK_SHARED', 'MEETING_SCHEDULED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewCriterion" AS ENUM ('TEACHING_EFFECTIVENESS', 'STUDENT_ENGAGEMENT_AND_OUTCOMES', 'CLASSROOM_MANAGEMENT', 'PROFESSIONALISM_AND_COLLABORATION', 'PROFESSIONAL_GROWTH', 'FAMILY_AND_COMMUNITY_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('INSTRUCTIONAL_PRACTICE', 'PROFESSIONAL_DEVELOPMENT', 'STUDENT_ACHIEVEMENT', 'COLLABORATION', 'LEADERSHIP', 'PERSONAL_GROWTH');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'AT_RISK', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "NoteSubject" AS ENUM ('GENERAL', 'STAFF', 'OBSERVATION', 'REVIEW', 'GOAL', 'MEETING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "departmentId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "subjects" TEXT[],
    "hireDate" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observations" (
    "id" TEXT NOT NULL,
    "observerId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "observedDate" TIMESTAMP(3),
    "duration" INTEGER,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "classPeriod" TEXT,
    "studentCount" INTEGER,
    "unit" TEXT,
    "status" "ObservationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "preObsNotes" TEXT,
    "narrativeNotes" TEXT,
    "strengths" TEXT,
    "areasForGrowth" TEXT,
    "actionItems" TEXT,
    "postObsNotes" TEXT,
    "aiSummary" TEXT,
    "aiGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observation_rubric_scores" (
    "id" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "category" "RubricCategory" NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "observation_rubric_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "reviewType" "ReviewType" NOT NULL DEFAULT 'ANNUAL',
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "overallRating" DOUBLE PRECISION,
    "summaryComments" TEXT,
    "strengthsNarrative" TEXT,
    "growthNarrative" TEXT,
    "adminPrivateNotes" TEXT,
    "selfAssessmentText" TEXT,
    "selfSubmittedAt" TIMESTAMP(3),
    "meetingDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "aiRecommendations" TEXT,
    "aiGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_criteria_scores" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "criterion" "ReviewCriterion" NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" TEXT,

    CONSTRAINT "review_criteria_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_staff" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "goal_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_milestones" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_progress_updates" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_progress_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "subjectType" "NoteSubject" NOT NULL DEFAULT 'GENERAL',
    "subjectId" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_userId_key" ON "staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "observation_rubric_scores_observationId_category_key" ON "observation_rubric_scores"("observationId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "review_criteria_scores_reviewId_criterion_key" ON "review_criteria_scores"("reviewId", "criterion");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_observerId_fkey" FOREIGN KEY ("observerId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observation_rubric_scores" ADD CONSTRAINT "observation_rubric_scores_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "observations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_criteria_scores" ADD CONSTRAINT "review_criteria_scores_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_staff" ADD CONSTRAINT "goal_staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_staff" ADD CONSTRAINT "goal_staff_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_progress_updates" ADD CONSTRAINT "goal_progress_updates_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
