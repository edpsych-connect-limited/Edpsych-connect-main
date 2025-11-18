-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('LA_TIER1', 'LA_TIER2', 'LA_TIER3', 'SCHOOL_SMALL', 'SCHOOL_MEDIUM', 'SCHOOL_LARGE', 'MAT_SMALL', 'MAT_MEDIUM', 'MAT_LARGE', 'RESEARCH_INDIVIDUAL', 'RESEARCH_INSTITUTIONAL', 'RESEARCH_PARTNERSHIP', 'TRIAL', 'DEMO', 'LEGACY');

-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('PROBLEM_SOLVER', 'LESSON_DIFFERENTIATION', 'EHCNA_SUPPORT', 'BATTLE_ROYALE', 'PROGRESS_MONITORING', 'INTERVENTION_TRACKING', 'BASIC_ANALYTICS', 'ADVANCED_ANALYTICS', 'CUSTOM_REPORTS', 'DATA_EXPORT', 'TEAM_COLLABORATION', 'PARENT_PORTAL', 'MULTI_SCHOOL_SHARING', 'EMAIL_SUPPORT', 'PHONE_SUPPORT', 'PRIORITY_SUPPORT', 'TRAINING_SESSIONS', 'DEDICATED_ACCOUNT_MANAGER', 'RESEARCH_API', 'RESEARCH_DATA_ACCESS', 'RESEARCH_DOCUMENTATION', 'CUSTOM_FEATURE_DEVELOPMENT', 'API_ACCESS', 'MIS_INTEGRATION', 'SINGLE_SIGN_ON');

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "tenant_type" TEXT NOT NULL DEFAULT 'SCHOOL',
    "parent_tenant_id" INTEGER,
    "urn" TEXT,
    "la_code" TEXT,
    "postcode" TEXT,
    "settings" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "onboarding_started_at" TIMESTAMP(3),
    "onboarding_completed_at" TIMESTAMP(3),
    "onboarding_skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "unique_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "year_group" TEXT NOT NULL,
    "sen_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "assigned_to" INTEGER,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referral_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "case_id" INTEGER NOT NULL,
    "assessment_type" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "case_id" INTEGER NOT NULL,
    "intervention_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "created_by" INTEGER,
    "implemented_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "professional_type" TEXT NOT NULL,
    "specialisation" TEXT,
    "qualifications" TEXT[],
    "student_ids" INTEGER[],
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_portal_metrics" (
    "id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "metric_type" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "professional_portal_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "child_ids" INTEGER[],
    "notification_preferences" JSONB,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_portal_activities" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "child_id" INTEGER NOT NULL,
    "activity_type" TEXT NOT NULL,
    "activity_data" JSONB NOT NULL,
    "status" TEXT DEFAULT 'unread',
    "viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_portal_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_permissions" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "canViewData" BOOLEAN NOT NULL DEFAULT true,
    "canMessage" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "year_label" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_enrollments" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "class_id" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_enrollments" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subjects" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamification_achievements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "achievement_type" TEXT NOT NULL,
    "achievement_name" TEXT NOT NULL,
    "description" TEXT,
    "points_awarded" INTEGER NOT NULL,
    "metadata" JSONB,
    "achieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gamification_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamification_badges" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "badge_type" TEXT NOT NULL,
    "badge_name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "level" INTEGER DEFAULT 1,
    "metadata" JSONB,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gamification_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamification_scores" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score_type" TEXT NOT NULL,
    "score_value" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gamification_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_stats" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merits" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_items" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipped_items" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" TEXT NOT NULL,
    "equipped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipped_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "houses" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "motto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_competitions" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_members" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "squad_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forums" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_threads" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "forum_id" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_replies" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_a_id" INTEGER NOT NULL,
    "user_b_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehcps" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,
    "plan_details" JSONB NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ehcps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ehcp_versions" (
    "id" TEXT NOT NULL,
    "ehcp_id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "status" TEXT NOT NULL,
    "plan_details" JSONB NOT NULL,
    "change_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ehcp_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sen_details" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "support_plan" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sen_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_studies" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "methodology" TEXT NOT NULL,
    "ethics_approval" BOOLEAN NOT NULL DEFAULT false,
    "ethics_reference" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "creator_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_collaborators" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'researcher',
    "permissions" TEXT[],
    "invitation_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_datasets" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "is_anonymized" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_analyses" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "researcher_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "methodology" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_participants" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "user_id" INTEGER,
    "consent_provided" BOOLEAN NOT NULL DEFAULT false,
    "consent_date" TIMESTAMP(3),
    "participant_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completion_date" TIMESTAMP(3),
    "withdrawal_date" TIMESTAMP(3),
    "withdrawal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_surveys" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "estimated_duration" INTEGER,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_responses" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "completion_time" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_publications" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "abstract" TEXT NOT NULL,
    "publication_date" TIMESTAMP(3),
    "journal" TEXT,
    "doi" TEXT,
    "url" TEXT,
    "citation" TEXT,
    "publication_type" TEXT NOT NULL DEFAULT 'article',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_ethics_approvals" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approval_body" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "approval_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "document_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_ethics_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_settings" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "high_contrast" BOOLEAN NOT NULL DEFAULT false,
    "large_text" BOOLEAN NOT NULL DEFAULT false,
    "screen_reader" BOOLEAN NOT NULL DEFAULT false,
    "reduced_motion" BOOLEAN NOT NULL DEFAULT false,
    "text_to_speech" BOOLEAN NOT NULL DEFAULT false,
    "speech_to_text" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accessibility_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_style" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "visual" INTEGER NOT NULL DEFAULT 0,
    "auditory" INTEGER NOT NULL DEFAULT 0,
    "kinesthetic" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speech_recognition_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "text" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "language" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speech_recognition_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speech_synthesis_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "voice_name" TEXT NOT NULL,
    "voice_gender" TEXT NOT NULL,
    "character_count" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speech_synthesis_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "original_text" TEXT NOT NULL,
    "translated_text" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "character_count" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_preferences" (
    "user_id" INTEGER NOT NULL,
    "show_contextual_help" BOOLEAN NOT NULL DEFAULT true,
    "enable_tours" BOOLEAN NOT NULL DEFAULT true,
    "show_help_button" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "help_viewed_items" (
    "user_id" INTEGER NOT NULL,
    "item_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_viewed_items_pkey" PRIMARY KEY ("user_id","item_id")
);

-- CreateTable
CREATE TABLE "HelpCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpArticle" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "search_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful_yes" INTEGER NOT NULL DEFAULT 0,
    "helpful_no" INTEGER NOT NULL DEFAULT 0,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "page_context" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "HelpArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpArticleRelated" (
    "article_id" TEXT NOT NULL,
    "related_id" TEXT NOT NULL,

    CONSTRAINT "HelpArticleRelated_pkey" PRIMARY KEY ("article_id","related_id")
);

-- CreateTable
CREATE TABLE "HelpFAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful_yes" INTEGER NOT NULL DEFAULT 0,
    "helpful_no" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpSearchLog" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER,
    "query" TEXT NOT NULL,
    "results" INTEGER NOT NULL DEFAULT 0,
    "clicked_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpSearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featured_image" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author_name" TEXT NOT NULL,
    "author_email" TEXT,
    "author_bio" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "reading_time" INTEGER,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "post_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_email" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'TRIAL',
    "max_schools" INTEGER,
    "max_users" INTEGER,
    "max_students" INTEGER,
    "plan_type" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "amount_paid" DECIMAL(65,30) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_usage" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "feature" "Feature" NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "duration" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "cpdHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseInstructor" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainingPurchaseId" TEXT,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "grade" TEXT,
    "skills" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'issued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPDEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CPDEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "assessedBy" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentile" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecureDocument" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecureDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetaAccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "remainingUses" INTEGER NOT NULL DEFAULT 1,
    "role" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetaAccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetaAccessCodeUsage" (
    "id" TEXT NOT NULL,
    "accessCodeId" TEXT NOT NULL,
    "userId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaAccessCodeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalSignature" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "agreementType" TEXT NOT NULL,
    "agreementVersion" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "performedById" TEXT,
    "institutionId" TEXT,
    "subscriptionId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "description" TEXT,
    "details" JSONB,
    "entityType" TEXT,
    "entityId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT,
    "type" TEXT,
    "value" JSONB,
    "theme" TEXT DEFAULT 'light',
    "language" TEXT DEFAULT 'en',
    "notifications" JSONB,
    "accessibility" JSONB,
    "privacy" JSONB,
    "displaySettings" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolumeDiscountTier" (
    "id" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolumeDiscountTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customFields" JSONB,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionContact" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "jobTitle" TEXT,
    "notes" TEXT,
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "parentDepartmentId" TEXT,
    "headOfDepartmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentMember" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentManager" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionSubscription" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "licenseCount" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "billingCycle" TEXT NOT NULL DEFAULT 'ANNUALLY',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "discountPercentage" DOUBLE PRECISION,
    "discountCode" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionAdmin" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuiz" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "orderIndex" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "orderIndex" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastPosition" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerUp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "meritCost" INTEGER NOT NULL,
    "duration" INTEGER,
    "effect" JSONB NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stockLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PowerUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerUpPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "powerUpId" TEXT NOT NULL,
    "meritSpent" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PowerUpPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "objective" JSONB NOT NULL,
    "meritReward" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeProgress" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "meritEarned" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "scopeId" TEXT,
    "period" TEXT NOT NULL DEFAULT 'all_time',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "meritsEarned" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "quizzesPassed" INTEGER NOT NULL DEFAULT 0,
    "badgesUnlocked" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bannerUrl" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "memberLimit" INTEGER NOT NULL DEFAULT 5,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "region" TEXT NOT NULL DEFAULT 'UK',
    "division" TEXT NOT NULL DEFAULT 'bronze',
    "totalMeritsEarned" INTEGER NOT NULL DEFAULT 0,
    "competitionWins" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadMember" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "contributionScore" INTEGER NOT NULL DEFAULT 0,
    "meritContribution" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadCompetition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "division" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "maxParticipants" INTEGER NOT NULL,
    "entryMeritCost" INTEGER NOT NULL DEFAULT 0,
    "prizePool" JSONB NOT NULL,
    "objectives" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SquadCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadCompetitionEntry" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "rank" INTEGER,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "objectivesCompleted" INTEGER NOT NULL DEFAULT 0,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "prizeClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SquadCompetitionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityFeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentFramework" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "age_range_min" INTEGER,
    "age_range_max" INTEGER,
    "evidence_base" JSONB NOT NULL,
    "theoretical_frameworks" TEXT[],
    "administration_guide" JSONB NOT NULL,
    "time_estimate_minutes" INTEGER,
    "interpretation_guide" JSONB NOT NULL,
    "qualitative_descriptors" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_proprietary" BOOLEAN NOT NULL DEFAULT true,
    "copyright_holder" TEXT NOT NULL DEFAULT 'EdPsych Connect Limited',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentDomain" (
    "id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "observation_prompts" JSONB NOT NULL,
    "task_suggestions" JSONB NOT NULL,
    "key_indicators" JSONB NOT NULL,
    "parent_questions" JSONB NOT NULL,
    "teacher_questions" JSONB NOT NULL,
    "child_prompts" JSONB,
    "interpretation_guidance" JSONB NOT NULL,
    "strength_descriptors" JSONB NOT NULL,
    "need_descriptors" JSONB NOT NULL,
    "suggested_interventions" JSONB NOT NULL,

    CONSTRAINT "AssessmentDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentInstance" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "framework_id" TEXT NOT NULL,
    "case_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "title" TEXT,
    "conducted_by" INTEGER NOT NULL,
    "assessment_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "parent_input_requested" BOOLEAN NOT NULL DEFAULT false,
    "parent_input_received" BOOLEAN NOT NULL DEFAULT false,
    "teacher_input_requested" BOOLEAN NOT NULL DEFAULT false,
    "teacher_input_received" BOOLEAN NOT NULL DEFAULT false,
    "child_input_requested" BOOLEAN NOT NULL DEFAULT false,
    "child_input_received" BOOLEAN NOT NULL DEFAULT false,
    "ep_summary" TEXT,
    "ep_interpretation" TEXT,
    "ep_recommendations" JSONB,
    "linked_ehcp_id" TEXT,
    "linked_report_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "AssessmentInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainObservation" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "observed_strengths" JSONB NOT NULL,
    "observed_needs" JSONB NOT NULL,
    "observation_context" TEXT,
    "tasks_used" JSONB,
    "strength_descriptors" TEXT[],
    "need_descriptors" TEXT[],
    "interpretation" TEXT,
    "significance" TEXT,
    "suggested_provisions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentCollaboration" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "contributor_type" TEXT NOT NULL,
    "contributor_name" TEXT,
    "contributor_email" TEXT,
    "contributor_role" TEXT,
    "responses" JSONB NOT NULL,
    "narrative_input" TEXT,
    "relationship_to_child" TEXT,
    "observation_context" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitation_sent_at" TIMESTAMP(3),
    "invitation_method" TEXT,
    "invitation_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "integrated_at" TIMESTAMP(3),
    "integrated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentCollaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentGuidance" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_content" TEXT NOT NULL,
    "research_citations" JSONB NOT NULL,
    "evidence_strength" TEXT,
    "practical_tips" JSONB,
    "example_scenarios" JSONB,
    "common_pitfalls" JSONB,
    "relevant_frameworks" TEXT[],
    "relevant_domains" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'published',
    "author" TEXT,
    "reviewed_by" TEXT,
    "review_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentGuidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentTemplate" (
    "id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "use_case" TEXT NOT NULL,
    "age_range_min" INTEGER,
    "age_range_max" INTEGER,
    "year_group" TEXT,
    "suggested_domains" TEXT[],
    "observation_prompts" JSONB NOT NULL,
    "task_suggestions" JSONB NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentOutcome" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "instance_id" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "outcome_type" TEXT NOT NULL,
    "outcome_description" TEXT NOT NULL,
    "evidence_data" JSONB,
    "impact_rating" TEXT,
    "baseline_date" TIMESTAMP(3),
    "outcome_date" TIMESTAMP(3) NOT NULL,
    "followup_date" TIMESTAMP(3),
    "contributed_to_research" BOOLEAN NOT NULL DEFAULT false,
    "anonymized_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProduct" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price_gbp" INTEGER NOT NULL,
    "original_price_gbp" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "cpd_hours" DOUBLE PRECISION,
    "course_id" TEXT,
    "included_course_ids" TEXT[],
    "access_duration_days" INTEGER,
    "stripe_product_id" TEXT,
    "stripe_price_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "promotional_text" TEXT,
    "benefits" TEXT[],
    "target_audience" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPurchase" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "amount_paid_pence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "discount_code" TEXT,
    "discount_amount_pence" INTEGER,
    "course_ids" TEXT[],
    "access_duration_days" INTEGER,
    "access_granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "access_expires_at" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "stripe_invoice_id" TEXT,
    "payment_method" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "receipt_url" TEXT,
    "invoice_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "refunded_at" TIMESTAMP(3),
    "refund_amount_pence" INTEGER,
    "refund_reason" TEXT,
    "purchase_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "applies_to" TEXT NOT NULL,
    "applicable_product_ids" TEXT[],
    "min_purchase_pence" INTEGER,
    "max_uses" INTEGER,
    "max_uses_per_user" INTEGER NOT NULL DEFAULT 1,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractiveElement" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "passing_score" INTEGER,
    "max_attempts" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InteractiveElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractiveResponse" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "element_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "response_data" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "is_correct" BOOLEAN,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "time_spent_seconds" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback_shown" TEXT,

    CONSTRAINT "InteractiveResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "course_ids" TEXT[],
    "total_cpd_hours" DOUBLE PRECISION NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "price_gbp" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathEnrollment" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "path_id" TEXT NOT NULL,
    "current_course_index" INTEGER NOT NULL DEFAULT 0,
    "completed_course_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "LearningPathEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "background_image_url" TEXT,
    "logo_url" TEXT,
    "layout_config" JSONB NOT NULL,
    "title_template" TEXT NOT NULL,
    "body_template" TEXT NOT NULL,
    "footer_text" TEXT,
    "includes_qr_code" BOOLEAN NOT NULL DEFAULT true,
    "includes_verification_url" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPDLog" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity_type" TEXT NOT NULL,
    "activity_title" TEXT NOT NULL,
    "activity_description" TEXT,
    "cpd_hours" DOUBLE PRECISION NOT NULL,
    "cpd_category" TEXT NOT NULL,
    "certificate_id" TEXT,
    "evidence_urls" TEXT[],
    "activity_date" TIMESTAMP(3) NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CPDLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "step_1_welcome_completed" BOOLEAN NOT NULL DEFAULT false,
    "step_1_completed_at" TIMESTAMP(3),
    "step_2_role_selected" TEXT,
    "step_2_completed_at" TIMESTAMP(3),
    "step_3_profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "step_3_photo_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "step_3_hcpc_provided" BOOLEAN NOT NULL DEFAULT false,
    "step_3_organization_provided" BOOLEAN NOT NULL DEFAULT false,
    "step_3_completed_at" TIMESTAMP(3),
    "step_4_features_viewed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "step_4_demos_tried" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "step_4_completed_at" TIMESTAMP(3),
    "step_5_first_case_created" BOOLEAN NOT NULL DEFAULT false,
    "step_5_first_assessment_done" BOOLEAN NOT NULL DEFAULT false,
    "step_5_first_goal_set" BOOLEAN NOT NULL DEFAULT false,
    "step_5_completed_at" TIMESTAMP(3),
    "step_6_certificate_viewed" BOOLEAN NOT NULL DEFAULT false,
    "step_6_tour_completed" BOOLEAN NOT NULL DEFAULT false,
    "step_6_call_booked" BOOLEAN NOT NULL DEFAULT false,
    "step_6_completed_at" TIMESTAMP(3),
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "steps_skipped" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "times_restarted" INTEGER NOT NULL DEFAULT 0,
    "total_time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "time_per_step" JSONB,
    "video_watched" BOOLEAN NOT NULL DEFAULT false,
    "video_watch_percentage" INTEGER NOT NULL DEFAULT 0,
    "help_articles_opened" INTEGER NOT NULL DEFAULT 0,
    "back_button_uses" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "organization" TEXT,
    "role" TEXT,
    "organization_type" TEXT,
    "phone" TEXT,
    "interested_features" TEXT[],
    "use_case" TEXT,
    "referral_source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "beta_access" BOOLEAN NOT NULL DEFAULT false,
    "invited_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "last_contacted_at" TIMESTAMP(3),
    "contact_attempts" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_solver_queries" (
    "id" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "user_id" INTEGER,
    "email" TEXT,
    "ai_response" TEXT NOT NULL,
    "model_used" TEXT,
    "response_time_ms" INTEGER,
    "tokens_used" INTEGER,
    "confidence_score" DOUBLE PRECISION,
    "problem_category" TEXT,
    "student_age" TEXT,
    "urgency_level" TEXT,
    "helpful_rating" INTEGER,
    "feedback_text" TEXT,
    "was_used" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_requested" BOOLEAN NOT NULL DEFAULT false,
    "converted_to_signup" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_solver_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyBuddyRecommendation" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "expected_value" TEXT,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "resource_url" TEXT,
    "strategy" TEXT NOT NULL,
    "strategy_details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "clicked_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "feedback" TEXT,
    "generated_by_agent" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyBuddyRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningProfile" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "learning_style" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_formats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_duration" INTEGER,
    "preferred_time" TEXT,
    "interest_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expertise_level" JSONB,
    "career_goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "current_projects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avg_session_duration" INTEGER NOT NULL DEFAULT 0,
    "most_active_day" TEXT,
    "most_active_hour" INTEGER,
    "engagement_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "total_logins" INTEGER NOT NULL DEFAULT 0,
    "consecutive_days" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "courses_started" INTEGER NOT NULL DEFAULT 0,
    "courses_completed" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_quiz_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cpd_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interventions_used" INTEGER NOT NULL DEFAULT 0,
    "assessments_created" INTEGER NOT NULL DEFAULT 0,
    "recommendations_received" INTEGER NOT NULL DEFAULT 0,
    "recommendations_clicked" INTEGER NOT NULL DEFAULT 0,
    "recommendations_completed" INTEGER NOT NULL DEFAULT 0,
    "recommendations_dismissed" INTEGER NOT NULL DEFAULT 0,
    "total_buddy_interactions" INTEGER NOT NULL DEFAULT 0,
    "favorite_buddy_agent" TEXT,
    "churn_risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "intervention_success_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpd_completion_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagement_trend" TEXT NOT NULL DEFAULT 'stable',
    "predicted_next_interest" TEXT,
    "profile_completeness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated_by_ai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLearningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyBuddyInteraction" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "agent_used" TEXT NOT NULL,
    "user_input" TEXT,
    "agent_response" TEXT,
    "conversation_id" TEXT,
    "response_time_ms" INTEGER,
    "tokens_used" INTEGER,
    "model_used" TEXT,
    "cost_usd" DOUBLE PRECISION,
    "satisfaction_rating" INTEGER,
    "was_helpful" BOOLEAN NOT NULL DEFAULT true,
    "feedback_text" TEXT,
    "reported_issue" BOOLEAN NOT NULL DEFAULT false,
    "issue_description" TEXT,
    "page_context" TEXT,
    "feature_used" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "led_to_action" BOOLEAN NOT NULL DEFAULT false,
    "action_taken" TEXT,
    "action_timestamp" TIMESTAMP(3),
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyBuddyInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictiveInsight" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "insight_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "prediction_model" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "predicted_outcome" TEXT,
    "recommended_action" TEXT NOT NULL,
    "expected_impact" TEXT,
    "evidence_data" JSONB,
    "trend_direction" TEXT,
    "comparison_data" JSONB,
    "is_actionable" BOOLEAN NOT NULL DEFAULT true,
    "action_button_text" TEXT,
    "action_url" TEXT,
    "estimated_time" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "viewed_at" TIMESTAMP(3),
    "acted_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "feedback" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictiveInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationalAISession" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "session_title" TEXT,
    "primary_agent" TEXT NOT NULL,
    "session_goal" TEXT,
    "session_status" TEXT NOT NULL DEFAULT 'active',
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_cost_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_response_time" INTEGER NOT NULL DEFAULT 0,
    "context_summary" TEXT,
    "user_preferences" JSONB,
    "referenced_docs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completed_task" BOOLEAN NOT NULL DEFAULT false,
    "generated_content" TEXT,
    "exported" BOOLEAN NOT NULL DEFAULT false,
    "export_format" TEXT,
    "user_satisfaction" INTEGER,
    "was_successful" BOOLEAN NOT NULL DEFAULT true,
    "had_errors" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationalAISession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationalAIMessage" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "agent" TEXT,
    "format" TEXT NOT NULL DEFAULT 'text',
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "has_code" BOOLEAN NOT NULL DEFAULT false,
    "has_tables" BOOLEAN NOT NULL DEFAULT false,
    "contains_pii" BOOLEAN NOT NULL DEFAULT false,
    "tokens" INTEGER,
    "cost_usd" DOUBLE PRECISION,
    "response_time_ms" INTEGER,
    "model_used" TEXT,
    "in_reply_to" TEXT,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edit_history" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationalAIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyBuddyAgentAnalytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" INTEGER NOT NULL,
    "agent_name" TEXT NOT NULL,
    "total_interactions" INTEGER NOT NULL DEFAULT 0,
    "unique_users" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_cost_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_response_time" INTEGER NOT NULL DEFAULT 0,
    "avg_satisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "error_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "helpful_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "most_used_feature" TEXT,
    "feature_usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyBuddyAgentAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "learning_style" JSONB,
    "pace_level" TEXT,
    "difficulty_preference" TEXT,
    "current_strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "current_struggles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "engagement_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "persistence_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "collaboration_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "ready_to_level_up" BOOLEAN NOT NULL DEFAULT false,
    "needs_intervention" BOOLEAN NOT NULL DEFAULT false,
    "intervention_urgency" TEXT,
    "historical_sen_needs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effective_strategies" JSONB[],
    "profile_confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassRoster" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "class_name" TEXT NOT NULL,
    "subject" TEXT,
    "year_group" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "urgent_students" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "needs_support" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "on_track" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "exceeding" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "auto_assign" BOOLEAN NOT NULL DEFAULT true,
    "voice_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "class_roster_id" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "year_group" TEXT NOT NULL,
    "curriculum_reference" TEXT,
    "learning_objectives" TEXT[],
    "description" TEXT,
    "base_content" JSONB NOT NULL,
    "has_differentiation" BOOLEAN NOT NULL DEFAULT false,
    "difficulty_levels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduled_for" TIMESTAMP(3),
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonActivity" (
    "id" TEXT NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "base_content" JSONB NOT NULL,
    "base_difficulty" TEXT NOT NULL DEFAULT 'at',
    "differentiated_content" JSONB,
    "estimated_duration" INTEGER NOT NULL,
    "success_criteria" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentLessonAssignment" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,
    "student_profile_id" TEXT NOT NULL,
    "assigned_difficulty" TEXT NOT NULL DEFAULT 'at',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT NOT NULL DEFAULT 'system',
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION,
    "struggled_activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excelled_activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "intervention_triggered" BOOLEAN NOT NULL DEFAULT false,
    "parent_notified" BOOLEAN NOT NULL DEFAULT false,
    "teacher_flagged" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLessonAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentActivityResponse" (
    "id" TEXT NOT NULL,
    "student_assignment_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "response_data" JSONB NOT NULL,
    "correct" BOOLEAN,
    "score" DOUBLE PRECISION,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "attempts_count" INTEGER NOT NULL DEFAULT 1,
    "help_requested" BOOLEAN NOT NULL DEFAULT false,
    "gave_up" BOOLEAN NOT NULL DEFAULT false,
    "difficulty_mismatch" BOOLEAN NOT NULL DEFAULT false,
    "suggested_level_change" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentActivityResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgressSnapshot" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "student_profile_id" TEXT NOT NULL,
    "snapshot_type" TEXT NOT NULL DEFAULT 'weekly',
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjects_progress" JSONB NOT NULL,
    "overall_pace" TEXT,
    "engagement_trend" TEXT,
    "persistence_trend" TEXT,
    "milestones_achieved" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "upcoming_milestones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active_interventions" INTEGER NOT NULL,
    "intervention_effectiveness" JSONB,
    "ehcp_relevant_data" JSONB,
    "sen_support_summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProgressSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiAgencyAccess" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_type" TEXT NOT NULL,
    "accessible_student_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "owned_student_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "can_view_academic" BOOLEAN NOT NULL DEFAULT true,
    "can_view_behavioral" BOOLEAN NOT NULL DEFAULT true,
    "can_view_ehcp" BOOLEAN NOT NULL DEFAULT false,
    "can_view_assessments" BOOLEAN NOT NULL DEFAULT false,
    "can_view_medical" BOOLEAN NOT NULL DEFAULT false,
    "can_assign_lessons" BOOLEAN NOT NULL DEFAULT false,
    "can_trigger_interventions" BOOLEAN NOT NULL DEFAULT false,
    "can_message_parents" BOOLEAN NOT NULL DEFAULT false,
    "can_request_ep" BOOLEAN NOT NULL DEFAULT false,
    "is_form_tutor" BOOLEAN NOT NULL DEFAULT false,
    "subject_specialization" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" INTEGER,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "MultiAgencyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildLink" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "child_id" INTEGER NOT NULL,
    "relationship_type" TEXT NOT NULL DEFAULT 'parent',
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "can_view_progress" BOOLEAN NOT NULL DEFAULT true,
    "can_view_behavior" BOOLEAN NOT NULL DEFAULT true,
    "can_message_teacher" BOOLEAN NOT NULL DEFAULT true,
    "can_view_attendance" BOOLEAN NOT NULL DEFAULT true,
    "notification_email" BOOLEAN NOT NULL DEFAULT true,
    "notification_sms" BOOLEAN NOT NULL DEFAULT false,
    "notification_app" BOOLEAN NOT NULL DEFAULT true,
    "digest_frequency" TEXT NOT NULL DEFAULT 'weekly',
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "ParentChildLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceCommand" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "raw_transcript" TEXT NOT NULL,
    "interpreted_intent" TEXT NOT NULL,
    "command_type" TEXT NOT NULL,
    "context_screen" TEXT,
    "context_student_id" INTEGER,
    "response_text" TEXT NOT NULL,
    "response_data" JSONB,
    "response_actions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "processing_time_ms" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomatedAction" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "action_type" TEXT NOT NULL,
    "triggered_by" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "student_id" TEXT,
    "action_data" JSONB NOT NULL,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "outcome_success" BOOLEAN NOT NULL DEFAULT true,
    "outcome_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomatedAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentTeacherMessage" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "student_id" INTEGER,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "replied_at" TIMESTAMP(3),
    "parent_message_id" TEXT,

    CONSTRAINT "ParentTeacherMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_urn_key" ON "tenants"("urn");

-- CreateIndex
CREATE INDEX "tenants_subdomain_idx" ON "tenants"("subdomain");

-- CreateIndex
CREATE INDEX "tenants_tenant_type_idx" ON "tenants"("tenant_type");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_parent_tenant_id_idx" ON "tenants"("parent_tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "students_tenant_id_idx" ON "students"("tenant_id");

-- CreateIndex
CREATE INDEX "students_sen_status_idx" ON "students"("sen_status");

-- CreateIndex
CREATE INDEX "students_year_group_idx" ON "students"("year_group");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenant_id_unique_id_key" ON "students"("tenant_id", "unique_id");

-- CreateIndex
CREATE INDEX "cases_tenant_id_idx" ON "cases"("tenant_id");

-- CreateIndex
CREATE INDEX "cases_student_id_idx" ON "cases"("student_id");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "assessments_tenant_id_idx" ON "assessments"("tenant_id");

-- CreateIndex
CREATE INDEX "assessments_case_id_idx" ON "assessments"("case_id");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "assessments"("status");

-- CreateIndex
CREATE INDEX "interventions_tenant_id_idx" ON "interventions"("tenant_id");

-- CreateIndex
CREATE INDEX "interventions_case_id_idx" ON "interventions"("case_id");

-- CreateIndex
CREATE INDEX "interventions_status_idx" ON "interventions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

-- CreateIndex
CREATE INDEX "professionals_tenant_id_idx" ON "professionals"("tenant_id");

-- CreateIndex
CREATE INDEX "professionals_professional_type_idx" ON "professionals"("professional_type");

-- CreateIndex
CREATE INDEX "professional_portal_metrics_professional_id_idx" ON "professional_portal_metrics"("professional_id");

-- CreateIndex
CREATE INDEX "professional_portal_metrics_measured_at_idx" ON "professional_portal_metrics"("measured_at");

-- CreateIndex
CREATE UNIQUE INDEX "parents_user_id_key" ON "parents"("user_id");

-- CreateIndex
CREATE INDEX "parent_portal_activities_parent_id_idx" ON "parent_portal_activities"("parent_id");

-- CreateIndex
CREATE INDEX "parent_portal_activities_child_id_idx" ON "parent_portal_activities"("child_id");

-- CreateIndex
CREATE INDEX "parent_portal_activities_status_idx" ON "parent_portal_activities"("status");

-- CreateIndex
CREATE INDEX "parent_permissions_parent_id_idx" ON "parent_permissions"("parent_id");

-- CreateIndex
CREATE INDEX "courses_tenant_id_idx" ON "courses"("tenant_id");

-- CreateIndex
CREATE INDEX "enrollments_tenant_id_idx" ON "enrollments"("tenant_id");

-- CreateIndex
CREATE INDEX "enrollments_user_id_idx" ON "enrollments"("user_id");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "academic_years_tenant_id_idx" ON "academic_years"("tenant_id");

-- CreateIndex
CREATE INDEX "terms_tenant_id_idx" ON "terms"("tenant_id");

-- CreateIndex
CREATE INDEX "class_enrollments_tenant_id_idx" ON "class_enrollments"("tenant_id");

-- CreateIndex
CREATE INDEX "class_enrollments_class_id_idx" ON "class_enrollments"("class_id");

-- CreateIndex
CREATE INDEX "class_enrollments_student_id_idx" ON "class_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "subject_enrollments_tenant_id_idx" ON "subject_enrollments"("tenant_id");

-- CreateIndex
CREATE INDEX "subject_enrollments_user_id_idx" ON "subject_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "teacher_subjects_tenant_id_idx" ON "teacher_subjects"("tenant_id");

-- CreateIndex
CREATE INDEX "teacher_subjects_teacher_id_idx" ON "teacher_subjects"("teacher_id");

-- CreateIndex
CREATE INDEX "timetable_slots_tenant_id_idx" ON "timetable_slots"("tenant_id");

-- CreateIndex
CREATE INDEX "timetable_slots_class_id_idx" ON "timetable_slots"("class_id");

-- CreateIndex
CREATE INDEX "gamification_achievements_user_id_idx" ON "gamification_achievements"("user_id");

-- CreateIndex
CREATE INDEX "gamification_achievements_achievement_type_idx" ON "gamification_achievements"("achievement_type");

-- CreateIndex
CREATE INDEX "gamification_badges_user_id_idx" ON "gamification_badges"("user_id");

-- CreateIndex
CREATE INDEX "gamification_badges_badge_type_idx" ON "gamification_badges"("badge_type");

-- CreateIndex
CREATE INDEX "gamification_scores_user_id_idx" ON "gamification_scores"("user_id");

-- CreateIndex
CREATE INDEX "gamification_scores_score_type_idx" ON "gamification_scores"("score_type");

-- CreateIndex
CREATE INDEX "battle_stats_tenant_id_idx" ON "battle_stats"("tenant_id");

-- CreateIndex
CREATE INDEX "battle_stats_user_id_idx" ON "battle_stats"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_stats_tenant_id_user_id_key" ON "battle_stats"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "merits_tenant_id_idx" ON "merits"("tenant_id");

-- CreateIndex
CREATE INDEX "merits_user_id_idx" ON "merits"("user_id");

-- CreateIndex
CREATE INDEX "game_items_tenant_id_idx" ON "game_items"("tenant_id");

-- CreateIndex
CREATE INDEX "equipped_items_tenant_id_idx" ON "equipped_items"("tenant_id");

-- CreateIndex
CREATE INDEX "equipped_items_user_id_idx" ON "equipped_items"("user_id");

-- CreateIndex
CREATE INDEX "houses_tenant_id_idx" ON "houses"("tenant_id");

-- CreateIndex
CREATE INDEX "squad_competitions_tenant_id_idx" ON "squad_competitions"("tenant_id");

-- CreateIndex
CREATE INDEX "squad_members_tenant_id_idx" ON "squad_members"("tenant_id");

-- CreateIndex
CREATE INDEX "squad_members_squad_id_idx" ON "squad_members"("squad_id");

-- CreateIndex
CREATE INDEX "squad_members_user_id_idx" ON "squad_members"("user_id");

-- CreateIndex
CREATE INDEX "forums_tenant_id_idx" ON "forums"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "forums_tenant_id_slug_key" ON "forums"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "forum_threads_tenant_id_idx" ON "forum_threads"("tenant_id");

-- CreateIndex
CREATE INDEX "forum_threads_forum_id_idx" ON "forum_threads"("forum_id");

-- CreateIndex
CREATE INDEX "forum_threads_author_id_idx" ON "forum_threads"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_threads_tenant_id_slug_key" ON "forum_threads"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "forum_replies_tenant_id_idx" ON "forum_replies"("tenant_id");

-- CreateIndex
CREATE INDEX "forum_replies_thread_id_idx" ON "forum_replies"("thread_id");

-- CreateIndex
CREATE INDEX "forum_replies_author_id_idx" ON "forum_replies"("author_id");

-- CreateIndex
CREATE INDEX "friendships_tenant_id_idx" ON "friendships"("tenant_id");

-- CreateIndex
CREATE INDEX "friendships_user_a_id_idx" ON "friendships"("user_a_id");

-- CreateIndex
CREATE INDEX "friendships_user_b_id_idx" ON "friendships"("user_b_id");

-- CreateIndex
CREATE INDEX "ehcps_tenant_id_idx" ON "ehcps"("tenant_id");

-- CreateIndex
CREATE INDEX "ehcps_student_id_idx" ON "ehcps"("student_id");

-- CreateIndex
CREATE INDEX "ehcp_versions_ehcp_id_idx" ON "ehcp_versions"("ehcp_id");

-- CreateIndex
CREATE INDEX "ehcp_versions_tenant_id_idx" ON "ehcp_versions"("tenant_id");

-- CreateIndex
CREATE INDEX "sen_details_tenant_id_idx" ON "sen_details"("tenant_id");

-- CreateIndex
CREATE INDEX "attachments_tenant_id_idx" ON "attachments"("tenant_id");

-- CreateIndex
CREATE INDEX "research_studies_tenant_id_idx" ON "research_studies"("tenant_id");

-- CreateIndex
CREATE INDEX "research_studies_creator_id_idx" ON "research_studies"("creator_id");

-- CreateIndex
CREATE INDEX "research_studies_status_idx" ON "research_studies"("status");

-- CreateIndex
CREATE INDEX "research_collaborators_study_id_idx" ON "research_collaborators"("study_id");

-- CreateIndex
CREATE INDEX "research_collaborators_user_id_idx" ON "research_collaborators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_collaborators_study_id_user_id_key" ON "research_collaborators"("study_id", "user_id");

-- CreateIndex
CREATE INDEX "research_datasets_study_id_idx" ON "research_datasets"("study_id");

-- CreateIndex
CREATE INDEX "research_analyses_dataset_id_idx" ON "research_analyses"("dataset_id");

-- CreateIndex
CREATE INDEX "research_analyses_researcher_id_idx" ON "research_analyses"("researcher_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_participants_participant_code_key" ON "research_participants"("participant_code");

-- CreateIndex
CREATE INDEX "research_participants_study_id_idx" ON "research_participants"("study_id");

-- CreateIndex
CREATE INDEX "research_participants_user_id_idx" ON "research_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_participants_study_id_user_id_key" ON "research_participants"("study_id", "user_id");

-- CreateIndex
CREATE INDEX "research_surveys_study_id_idx" ON "research_surveys"("study_id");

-- CreateIndex
CREATE INDEX "research_responses_survey_id_idx" ON "research_responses"("survey_id");

-- CreateIndex
CREATE INDEX "research_responses_participant_id_idx" ON "research_responses"("participant_id");

-- CreateIndex
CREATE INDEX "research_publications_study_id_idx" ON "research_publications"("study_id");

-- CreateIndex
CREATE INDEX "research_ethics_approvals_user_id_idx" ON "research_ethics_approvals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accessibility_settings_user_id_key" ON "accessibility_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_style_user_id_key" ON "learning_style"("user_id");

-- CreateIndex
CREATE INDEX "speech_recognition_logs_user_id_idx" ON "speech_recognition_logs"("user_id");

-- CreateIndex
CREATE INDEX "speech_synthesis_logs_user_id_idx" ON "speech_synthesis_logs"("user_id");

-- CreateIndex
CREATE INDEX "translation_logs_user_id_idx" ON "translation_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "HelpCategory_slug_key" ON "HelpCategory"("slug");

-- CreateIndex
CREATE INDEX "HelpCategory_slug_idx" ON "HelpCategory"("slug");

-- CreateIndex
CREATE INDEX "HelpCategory_is_active_idx" ON "HelpCategory"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "HelpArticle_slug_key" ON "HelpArticle"("slug");

-- CreateIndex
CREATE INDEX "HelpArticle_category_id_idx" ON "HelpArticle"("category_id");

-- CreateIndex
CREATE INDEX "HelpArticle_slug_idx" ON "HelpArticle"("slug");

-- CreateIndex
CREATE INDEX "HelpArticle_is_published_idx" ON "HelpArticle"("is_published");

-- CreateIndex
CREATE INDEX "HelpArticle_page_context_idx" ON "HelpArticle"("page_context");

-- CreateIndex
CREATE INDEX "HelpFAQ_category_idx" ON "HelpFAQ"("category");

-- CreateIndex
CREATE INDEX "HelpFAQ_is_active_idx" ON "HelpFAQ"("is_active");

-- CreateIndex
CREATE INDEX "HelpSearchLog_query_idx" ON "HelpSearchLog"("query");

-- CreateIndex
CREATE INDEX "HelpSearchLog_created_at_idx" ON "HelpSearchLog"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_is_active_idx" ON "BlogCategory"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_category_id_idx" ON "BlogPost"("category_id");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_is_published_idx" ON "BlogPost"("is_published");

-- CreateIndex
CREATE INDEX "BlogPost_published_at_idx" ON "BlogPost"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE INDEX "BlogTag_slug_idx" ON "BlogTag"("slug");

-- CreateIndex
CREATE INDEX "BlogComment_post_id_idx" ON "BlogComment"("post_id");

-- CreateIndex
CREATE INDEX "BlogComment_is_approved_idx" ON "BlogComment"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "subscriptions_tier_idx" ON "subscriptions"("tier");

-- CreateIndex
CREATE INDEX "subscriptions_is_active_idx" ON "subscriptions"("is_active");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "feature_usage_subscription_id_idx" ON "feature_usage"("subscription_id");

-- CreateIndex
CREATE INDEX "feature_usage_tenant_id_idx" ON "feature_usage"("tenant_id");

-- CreateIndex
CREATE INDEX "feature_usage_feature_idx" ON "feature_usage"("feature");

-- CreateIndex
CREATE INDEX "feature_usage_timestamp_idx" ON "feature_usage"("timestamp");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "Course"("category");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_level_idx" ON "Course"("level");

-- CreateIndex
CREATE UNIQUE INDEX "CourseInstructor_courseId_key" ON "CourseInstructor"("courseId");

-- CreateIndex
CREATE INDEX "CourseInstructor_courseId_idx" ON "CourseInstructor"("courseId");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_idx" ON "CourseModule"("courseId");

-- CreateIndex
CREATE INDEX "CourseModule_orderIndex_idx" ON "CourseModule"("orderIndex");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_idx" ON "CourseLesson"("moduleId");

-- CreateIndex
CREATE INDEX "CourseLesson_orderIndex_idx" ON "CourseLesson"("orderIndex");

-- CreateIndex
CREATE INDEX "CourseEnrollment_userId_idx" ON "CourseEnrollment"("userId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_status_idx" ON "CourseEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_userId_courseId_key" ON "CourseEnrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_idx" ON "CourseReview"("courseId");

-- CreateIndex
CREATE INDEX "CourseReview_userId_idx" ON "CourseReview"("userId");

-- CreateIndex
CREATE INDEX "CourseReview_status_idx" ON "CourseReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

-- CreateIndex
CREATE INDEX "Certificate_verificationCode_idx" ON "Certificate"("verificationCode");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- CreateIndex
CREATE INDEX "CPDEntry_userId_idx" ON "CPDEntry"("userId");

-- CreateIndex
CREATE INDEX "CPDEntry_date_idx" ON "CPDEntry"("date");

-- CreateIndex
CREATE INDEX "CPDEntry_category_idx" ON "CPDEntry"("category");

-- CreateIndex
CREATE INDEX "Assessment_studentId_idx" ON "Assessment"("studentId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");

-- CreateIndex
CREATE INDEX "Assessment_assessmentDate_idx" ON "Assessment"("assessmentDate");

-- CreateIndex
CREATE INDEX "AssessmentResult_assessmentId_idx" ON "AssessmentResult"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentResult_domain_idx" ON "AssessmentResult"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "SecureDocument_path_key" ON "SecureDocument"("path");

-- CreateIndex
CREATE INDEX "SecureDocument_path_idx" ON "SecureDocument"("path");

-- CreateIndex
CREATE INDEX "SecureDocument_encrypted_idx" ON "SecureDocument"("encrypted");

-- CreateIndex
CREATE UNIQUE INDEX "BetaAccessCode_code_key" ON "BetaAccessCode"("code");

-- CreateIndex
CREATE INDEX "BetaAccessCode_code_idx" ON "BetaAccessCode"("code");

-- CreateIndex
CREATE INDEX "BetaAccessCode_email_idx" ON "BetaAccessCode"("email");

-- CreateIndex
CREATE INDEX "BetaAccessCode_usedBy_idx" ON "BetaAccessCode"("usedBy");

-- CreateIndex
CREATE INDEX "BetaAccessCodeUsage_accessCodeId_idx" ON "BetaAccessCodeUsage"("accessCodeId");

-- CreateIndex
CREATE INDEX "BetaAccessCodeUsage_userId_idx" ON "BetaAccessCodeUsage"("userId");

-- CreateIndex
CREATE INDEX "BetaAccessCodeUsage_usedAt_idx" ON "BetaAccessCodeUsage"("usedAt");

-- CreateIndex
CREATE INDEX "LegalSignature_userId_idx" ON "LegalSignature"("userId");

-- CreateIndex
CREATE INDEX "LegalSignature_documentId_idx" ON "LegalSignature"("documentId");

-- CreateIndex
CREATE INDEX "LegalSignature_timestamp_idx" ON "LegalSignature"("timestamp");

-- CreateIndex
CREATE INDEX "LegalSignature_signedAt_idx" ON "LegalSignature"("signedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_performedById_idx" ON "audit_logs"("performedById");

-- CreateIndex
CREATE INDEX "audit_logs_institutionId_idx" ON "audit_logs"("institutionId");

-- CreateIndex
CREATE INDEX "audit_logs_subscriptionId_idx" ON "audit_logs"("subscriptionId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "LegalDocument_type_idx" ON "LegalDocument"("type");

-- CreateIndex
CREATE INDEX "LegalDocument_version_idx" ON "LegalDocument"("version");

-- CreateIndex
CREATE INDEX "LegalDocument_status_idx" ON "LegalDocument"("status");

-- CreateIndex
CREATE INDEX "LegalDocument_effectiveDate_idx" ON "LegalDocument"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPreference_userId_idx" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPreference_category_idx" ON "UserPreference"("category");

-- CreateIndex
CREATE INDEX "UserPreference_type_idx" ON "UserPreference"("type");

-- CreateIndex
CREATE INDEX "VolumeDiscountTier_tier_idx" ON "VolumeDiscountTier"("tier");

-- CreateIndex
CREATE INDEX "VolumeDiscountTier_minQuantity_idx" ON "VolumeDiscountTier"("minQuantity");

-- CreateIndex
CREATE INDEX "VolumeDiscountTier_isActive_idx" ON "VolumeDiscountTier"("isActive");

-- CreateIndex
CREATE INDEX "Institution_name_idx" ON "Institution"("name");

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");

-- CreateIndex
CREATE INDEX "Institution_verificationStatus_idx" ON "Institution"("verificationStatus");

-- CreateIndex
CREATE INDEX "Institution_isActive_idx" ON "Institution"("isActive");

-- CreateIndex
CREATE INDEX "Institution_email_idx" ON "Institution"("email");

-- CreateIndex
CREATE INDEX "InstitutionContact_institutionId_idx" ON "InstitutionContact"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionContact_email_idx" ON "InstitutionContact"("email");

-- CreateIndex
CREATE INDEX "InstitutionContact_isPrimaryContact_idx" ON "InstitutionContact"("isPrimaryContact");

-- CreateIndex
CREATE INDEX "InstitutionContact_departmentId_idx" ON "InstitutionContact"("departmentId");

-- CreateIndex
CREATE INDEX "Department_institutionId_idx" ON "Department"("institutionId");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_type_idx" ON "Department"("type");

-- CreateIndex
CREATE INDEX "Department_status_idx" ON "Department"("status");

-- CreateIndex
CREATE INDEX "Department_parentDepartmentId_idx" ON "Department"("parentDepartmentId");

-- CreateIndex
CREATE INDEX "Department_headOfDepartmentId_idx" ON "Department"("headOfDepartmentId");

-- CreateIndex
CREATE INDEX "DepartmentMember_departmentId_idx" ON "DepartmentMember"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentMember_userId_idx" ON "DepartmentMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentMember_departmentId_userId_key" ON "DepartmentMember"("departmentId", "userId");

-- CreateIndex
CREATE INDEX "DepartmentManager_departmentId_idx" ON "DepartmentManager"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentManager_userId_idx" ON "DepartmentManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentManager_departmentId_userId_key" ON "DepartmentManager"("departmentId", "userId");

-- CreateIndex
CREATE INDEX "InstitutionSubscription_institutionId_idx" ON "InstitutionSubscription"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionSubscription_status_idx" ON "InstitutionSubscription"("status");

-- CreateIndex
CREATE INDEX "InstitutionSubscription_startDate_idx" ON "InstitutionSubscription"("startDate");

-- CreateIndex
CREATE INDEX "InstitutionSubscription_endDate_idx" ON "InstitutionSubscription"("endDate");

-- CreateIndex
CREATE INDEX "InstitutionAdmin_institutionId_idx" ON "InstitutionAdmin"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionAdmin_userId_idx" ON "InstitutionAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionAdmin_institutionId_userId_key" ON "InstitutionAdmin"("institutionId", "userId");

-- CreateIndex
CREATE INDEX "CourseQuiz_courseId_idx" ON "CourseQuiz"("courseId");

-- CreateIndex
CREATE INDEX "CourseQuiz_moduleId_idx" ON "CourseQuiz"("moduleId");

-- CreateIndex
CREATE INDEX "CourseQuiz_lessonId_idx" ON "CourseQuiz"("lessonId");

-- CreateIndex
CREATE INDEX "CourseQuiz_orderIndex_idx" ON "CourseQuiz"("orderIndex");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "QuizQuestion_orderIndex_idx" ON "QuizQuestion"("orderIndex");

-- CreateIndex
CREATE INDEX "QuizQuestion_difficulty_idx" ON "QuizQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_completedAt_idx" ON "QuizAttempt"("completedAt");

-- CreateIndex
CREATE INDEX "QuizAttempt_isPassed_idx" ON "QuizAttempt"("isPassed");

-- CreateIndex
CREATE INDEX "QuizAnswer_attemptId_idx" ON "QuizAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE INDEX "LessonProgress_courseId_idx" ON "LessonProgress"("courseId");

-- CreateIndex
CREATE INDEX "LessonProgress_moduleId_idx" ON "LessonProgress"("moduleId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "LessonProgress_status_idx" ON "LessonProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "PowerUp_category_idx" ON "PowerUp"("category");

-- CreateIndex
CREATE INDEX "PowerUp_rarity_idx" ON "PowerUp"("rarity");

-- CreateIndex
CREATE INDEX "PowerUp_isActive_idx" ON "PowerUp"("isActive");

-- CreateIndex
CREATE INDEX "PowerUpPurchase_userId_idx" ON "PowerUpPurchase"("userId");

-- CreateIndex
CREATE INDEX "PowerUpPurchase_powerUpId_idx" ON "PowerUpPurchase"("powerUpId");

-- CreateIndex
CREATE INDEX "PowerUpPurchase_isActive_idx" ON "PowerUpPurchase"("isActive");

-- CreateIndex
CREATE INDEX "PowerUpPurchase_expiresAt_idx" ON "PowerUpPurchase"("expiresAt");

-- CreateIndex
CREATE INDEX "Challenge_type_idx" ON "Challenge"("type");

-- CreateIndex
CREATE INDEX "Challenge_difficulty_idx" ON "Challenge"("difficulty");

-- CreateIndex
CREATE INDEX "Challenge_isActive_idx" ON "Challenge"("isActive");

-- CreateIndex
CREATE INDEX "Challenge_startDate_idx" ON "Challenge"("startDate");

-- CreateIndex
CREATE INDEX "Challenge_endDate_idx" ON "Challenge"("endDate");

-- CreateIndex
CREATE INDEX "ChallengeProgress_challengeId_idx" ON "ChallengeProgress"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeProgress_userId_idx" ON "ChallengeProgress"("userId");

-- CreateIndex
CREATE INDEX "ChallengeProgress_isCompleted_idx" ON "ChallengeProgress"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeProgress_challengeId_userId_key" ON "ChallengeProgress"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "Leaderboard_type_idx" ON "Leaderboard"("type");

-- CreateIndex
CREATE INDEX "Leaderboard_scope_idx" ON "Leaderboard"("scope");

-- CreateIndex
CREATE INDEX "Leaderboard_scopeId_idx" ON "Leaderboard"("scopeId");

-- CreateIndex
CREATE INDEX "Leaderboard_period_idx" ON "Leaderboard"("period");

-- CreateIndex
CREATE INDEX "Leaderboard_isActive_idx" ON "Leaderboard"("isActive");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_leaderboardId_idx" ON "LeaderboardEntry"("leaderboardId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_userId_idx" ON "LeaderboardEntry"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_rank_idx" ON "LeaderboardEntry"("rank");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_score_idx" ON "LeaderboardEntry"("score");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_leaderboardId_userId_key" ON "LeaderboardEntry"("leaderboardId", "userId");

-- CreateIndex
CREATE INDEX "Squad_createdByUserId_idx" ON "Squad"("createdByUserId");

-- CreateIndex
CREATE INDEX "Squad_division_idx" ON "Squad"("division");

-- CreateIndex
CREATE INDEX "Squad_isPublic_idx" ON "Squad"("isPublic");

-- CreateIndex
CREATE INDEX "Squad_isActive_idx" ON "Squad"("isActive");

-- CreateIndex
CREATE INDEX "SquadMember_squadId_idx" ON "SquadMember"("squadId");

-- CreateIndex
CREATE INDEX "SquadMember_userId_idx" ON "SquadMember"("userId");

-- CreateIndex
CREATE INDEX "SquadMember_role_idx" ON "SquadMember"("role");

-- CreateIndex
CREATE INDEX "SquadMember_isActive_idx" ON "SquadMember"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMember_squadId_userId_key" ON "SquadMember"("squadId", "userId");

-- CreateIndex
CREATE INDEX "SquadCompetition_type_idx" ON "SquadCompetition"("type");

-- CreateIndex
CREATE INDEX "SquadCompetition_status_idx" ON "SquadCompetition"("status");

-- CreateIndex
CREATE INDEX "SquadCompetition_division_idx" ON "SquadCompetition"("division");

-- CreateIndex
CREATE INDEX "SquadCompetition_startDate_idx" ON "SquadCompetition"("startDate");

-- CreateIndex
CREATE INDEX "SquadCompetition_endDate_idx" ON "SquadCompetition"("endDate");

-- CreateIndex
CREATE INDEX "SquadCompetitionEntry_competitionId_idx" ON "SquadCompetitionEntry"("competitionId");

-- CreateIndex
CREATE INDEX "SquadCompetitionEntry_squadId_idx" ON "SquadCompetitionEntry"("squadId");

-- CreateIndex
CREATE INDEX "SquadCompetitionEntry_rank_idx" ON "SquadCompetitionEntry"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "SquadCompetitionEntry_competitionId_squadId_key" ON "SquadCompetitionEntry"("competitionId", "squadId");

-- CreateIndex
CREATE INDEX "Forum_slug_idx" ON "Forum"("slug");

-- CreateIndex
CREATE INDEX "Forum_category_idx" ON "Forum"("category");

-- CreateIndex
CREATE INDEX "Forum_isActive_idx" ON "Forum"("isActive");

-- CreateIndex
CREATE INDEX "Forum_createdById_idx" ON "Forum"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Forum_slug_key" ON "Forum"("slug");

-- CreateIndex
CREATE INDEX "ForumThread_forumId_idx" ON "ForumThread"("forumId");

-- CreateIndex
CREATE INDEX "ForumThread_authorId_idx" ON "ForumThread"("authorId");

-- CreateIndex
CREATE INDEX "ForumThread_slug_idx" ON "ForumThread"("slug");

-- CreateIndex
CREATE INDEX "ForumThread_isPinned_idx" ON "ForumThread"("isPinned");

-- CreateIndex
CREATE INDEX "ForumThread_createdAt_idx" ON "ForumThread"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ForumThread_slug_key" ON "ForumThread"("slug");

-- CreateIndex
CREATE INDEX "ForumReply_threadId_idx" ON "ForumReply"("threadId");

-- CreateIndex
CREATE INDEX "ForumReply_authorId_idx" ON "ForumReply"("authorId");

-- CreateIndex
CREATE INDEX "ForumReply_createdAt_idx" ON "ForumReply"("createdAt");

-- CreateIndex
CREATE INDEX "Friendship_userAId_idx" ON "Friendship"("userAId");

-- CreateIndex
CREATE INDEX "Friendship_userBId_idx" ON "Friendship"("userBId");

-- CreateIndex
CREATE INDEX "Friendship_status_idx" ON "Friendship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userAId_userBId_key" ON "Friendship"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "ActivityFeed_userId_idx" ON "ActivityFeed"("userId");

-- CreateIndex
CREATE INDEX "ActivityFeed_activityType_idx" ON "ActivityFeed"("activityType");

-- CreateIndex
CREATE INDEX "ActivityFeed_createdAt_idx" ON "ActivityFeed"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentFramework_abbreviation_key" ON "AssessmentFramework"("abbreviation");

-- CreateIndex
CREATE INDEX "AssessmentFramework_abbreviation_idx" ON "AssessmentFramework"("abbreviation");

-- CreateIndex
CREATE INDEX "AssessmentFramework_domain_idx" ON "AssessmentFramework"("domain");

-- CreateIndex
CREATE INDEX "AssessmentFramework_status_idx" ON "AssessmentFramework"("status");

-- CreateIndex
CREATE INDEX "AssessmentDomain_framework_id_idx" ON "AssessmentDomain"("framework_id");

-- CreateIndex
CREATE INDEX "AssessmentDomain_order_index_idx" ON "AssessmentDomain"("order_index");

-- CreateIndex
CREATE INDEX "AssessmentInstance_tenant_id_idx" ON "AssessmentInstance"("tenant_id");

-- CreateIndex
CREATE INDEX "AssessmentInstance_framework_id_idx" ON "AssessmentInstance"("framework_id");

-- CreateIndex
CREATE INDEX "AssessmentInstance_case_id_idx" ON "AssessmentInstance"("case_id");

-- CreateIndex
CREATE INDEX "AssessmentInstance_student_id_idx" ON "AssessmentInstance"("student_id");

-- CreateIndex
CREATE INDEX "AssessmentInstance_conducted_by_idx" ON "AssessmentInstance"("conducted_by");

-- CreateIndex
CREATE INDEX "AssessmentInstance_status_idx" ON "AssessmentInstance"("status");

-- CreateIndex
CREATE INDEX "DomainObservation_instance_id_idx" ON "DomainObservation"("instance_id");

-- CreateIndex
CREATE INDEX "DomainObservation_domain_id_idx" ON "DomainObservation"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentCollaboration_invitation_token_key" ON "AssessmentCollaboration"("invitation_token");

-- CreateIndex
CREATE INDEX "AssessmentCollaboration_instance_id_idx" ON "AssessmentCollaboration"("instance_id");

-- CreateIndex
CREATE INDEX "AssessmentCollaboration_contributor_type_idx" ON "AssessmentCollaboration"("contributor_type");

-- CreateIndex
CREATE INDEX "AssessmentCollaboration_status_idx" ON "AssessmentCollaboration"("status");

-- CreateIndex
CREATE INDEX "AssessmentGuidance_category_idx" ON "AssessmentGuidance"("category");

-- CreateIndex
CREATE INDEX "AssessmentGuidance_topic_idx" ON "AssessmentGuidance"("topic");

-- CreateIndex
CREATE INDEX "AssessmentGuidance_status_idx" ON "AssessmentGuidance"("status");

-- CreateIndex
CREATE INDEX "AssessmentTemplate_framework_id_idx" ON "AssessmentTemplate"("framework_id");

-- CreateIndex
CREATE INDEX "AssessmentTemplate_age_range_min_age_range_max_idx" ON "AssessmentTemplate"("age_range_min", "age_range_max");

-- CreateIndex
CREATE INDEX "AssessmentOutcome_tenant_id_idx" ON "AssessmentOutcome"("tenant_id");

-- CreateIndex
CREATE INDEX "AssessmentOutcome_instance_id_idx" ON "AssessmentOutcome"("instance_id");

-- CreateIndex
CREATE INDEX "AssessmentOutcome_student_id_idx" ON "AssessmentOutcome"("student_id");

-- CreateIndex
CREATE INDEX "AssessmentOutcome_outcome_type_idx" ON "AssessmentOutcome"("outcome_type");

-- CreateIndex
CREATE INDEX "AssessmentOutcome_contributed_to_research_idx" ON "AssessmentOutcome"("contributed_to_research");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProduct_slug_key" ON "TrainingProduct"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProduct_stripe_product_id_key" ON "TrainingProduct"("stripe_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProduct_stripe_price_id_key" ON "TrainingProduct"("stripe_price_id");

-- CreateIndex
CREATE INDEX "TrainingProduct_type_idx" ON "TrainingProduct"("type");

-- CreateIndex
CREATE INDEX "TrainingProduct_status_idx" ON "TrainingProduct"("status");

-- CreateIndex
CREATE INDEX "TrainingProduct_is_featured_idx" ON "TrainingProduct"("is_featured");

-- CreateIndex
CREATE INDEX "TrainingProduct_slug_idx" ON "TrainingProduct"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPurchase_stripe_payment_intent_id_key" ON "TrainingPurchase"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPurchase_invoice_number_key" ON "TrainingPurchase"("invoice_number");

-- CreateIndex
CREATE INDEX "TrainingPurchase_user_id_idx" ON "TrainingPurchase"("user_id");

-- CreateIndex
CREATE INDEX "TrainingPurchase_product_id_idx" ON "TrainingPurchase"("product_id");

-- CreateIndex
CREATE INDEX "TrainingPurchase_payment_status_idx" ON "TrainingPurchase"("payment_status");

-- CreateIndex
CREATE INDEX "TrainingPurchase_status_idx" ON "TrainingPurchase"("status");

-- CreateIndex
CREATE INDEX "TrainingPurchase_stripe_payment_intent_id_idx" ON "TrainingPurchase"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE INDEX "DiscountCode_code_idx" ON "DiscountCode"("code");

-- CreateIndex
CREATE INDEX "DiscountCode_is_active_idx" ON "DiscountCode"("is_active");

-- CreateIndex
CREATE INDEX "DiscountCode_valid_from_valid_until_idx" ON "DiscountCode"("valid_from", "valid_until");

-- CreateIndex
CREATE INDEX "InteractiveElement_lesson_id_idx" ON "InteractiveElement"("lesson_id");

-- CreateIndex
CREATE INDEX "InteractiveElement_order_index_idx" ON "InteractiveElement"("order_index");

-- CreateIndex
CREATE INDEX "InteractiveElement_type_idx" ON "InteractiveElement"("type");

-- CreateIndex
CREATE INDEX "InteractiveResponse_user_id_idx" ON "InteractiveResponse"("user_id");

-- CreateIndex
CREATE INDEX "InteractiveResponse_element_id_idx" ON "InteractiveResponse"("element_id");

-- CreateIndex
CREATE INDEX "InteractiveResponse_enrollment_id_idx" ON "InteractiveResponse"("enrollment_id");

-- CreateIndex
CREATE INDEX "InteractiveResponse_submitted_at_idx" ON "InteractiveResponse"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_slug_key" ON "LearningPath"("slug");

-- CreateIndex
CREATE INDEX "LearningPath_slug_idx" ON "LearningPath"("slug");

-- CreateIndex
CREATE INDEX "LearningPath_status_idx" ON "LearningPath"("status");

-- CreateIndex
CREATE INDEX "LearningPathEnrollment_user_id_idx" ON "LearningPathEnrollment"("user_id");

-- CreateIndex
CREATE INDEX "LearningPathEnrollment_path_id_idx" ON "LearningPathEnrollment"("path_id");

-- CreateIndex
CREATE INDEX "LearningPathEnrollment_status_idx" ON "LearningPathEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathEnrollment_user_id_path_id_key" ON "LearningPathEnrollment"("user_id", "path_id");

-- CreateIndex
CREATE INDEX "CertificateTemplate_template_type_idx" ON "CertificateTemplate"("template_type");

-- CreateIndex
CREATE INDEX "CertificateTemplate_is_active_idx" ON "CertificateTemplate"("is_active");

-- CreateIndex
CREATE INDEX "CPDLog_user_id_idx" ON "CPDLog"("user_id");

-- CreateIndex
CREATE INDEX "CPDLog_activity_date_idx" ON "CPDLog"("activity_date");

-- CreateIndex
CREATE INDEX "CPDLog_cpd_category_idx" ON "CPDLog"("cpd_category");

-- CreateIndex
CREATE INDEX "CPDLog_status_idx" ON "CPDLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_user_id_key" ON "onboarding_progress"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_progress_user_id_idx" ON "onboarding_progress"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_progress_current_step_idx" ON "onboarding_progress"("current_step");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- CreateIndex
CREATE INDEX "waitlist_email_idx" ON "waitlist"("email");

-- CreateIndex
CREATE INDEX "waitlist_status_idx" ON "waitlist"("status");

-- CreateIndex
CREATE INDEX "waitlist_priority_idx" ON "waitlist"("priority");

-- CreateIndex
CREATE INDEX "waitlist_created_at_idx" ON "waitlist"("created_at");

-- CreateIndex
CREATE INDEX "waitlist_organization_type_idx" ON "waitlist"("organization_type");

-- CreateIndex
CREATE INDEX "problem_solver_queries_created_at_idx" ON "problem_solver_queries"("created_at");

-- CreateIndex
CREATE INDEX "problem_solver_queries_problem_category_idx" ON "problem_solver_queries"("problem_category");

-- CreateIndex
CREATE INDEX "problem_solver_queries_helpful_rating_idx" ON "problem_solver_queries"("helpful_rating");

-- CreateIndex
CREATE INDEX "problem_solver_queries_user_id_idx" ON "problem_solver_queries"("user_id");

-- CreateIndex
CREATE INDEX "StudyBuddyRecommendation_user_id_idx" ON "StudyBuddyRecommendation"("user_id");

-- CreateIndex
CREATE INDEX "StudyBuddyRecommendation_tenant_id_idx" ON "StudyBuddyRecommendation"("tenant_id");

-- CreateIndex
CREATE INDEX "StudyBuddyRecommendation_status_idx" ON "StudyBuddyRecommendation"("status");

-- CreateIndex
CREATE INDEX "StudyBuddyRecommendation_type_idx" ON "StudyBuddyRecommendation"("type");

-- CreateIndex
CREATE INDEX "StudyBuddyRecommendation_priority_idx" ON "StudyBuddyRecommendation"("priority");

-- CreateIndex
CREATE INDEX "StudyBuddyRecommendation_generated_at_idx" ON "StudyBuddyRecommendation"("generated_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningProfile_user_id_key" ON "UserLearningProfile"("user_id");

-- CreateIndex
CREATE INDEX "UserLearningProfile_user_id_idx" ON "UserLearningProfile"("user_id");

-- CreateIndex
CREATE INDEX "UserLearningProfile_tenant_id_idx" ON "UserLearningProfile"("tenant_id");

-- CreateIndex
CREATE INDEX "UserLearningProfile_role_idx" ON "UserLearningProfile"("role");

-- CreateIndex
CREATE INDEX "UserLearningProfile_engagement_score_idx" ON "UserLearningProfile"("engagement_score");

-- CreateIndex
CREATE INDEX "UserLearningProfile_churn_risk_score_idx" ON "UserLearningProfile"("churn_risk_score");

-- CreateIndex
CREATE INDEX "StudyBuddyInteraction_user_id_idx" ON "StudyBuddyInteraction"("user_id");

-- CreateIndex
CREATE INDEX "StudyBuddyInteraction_tenant_id_idx" ON "StudyBuddyInteraction"("tenant_id");

-- CreateIndex
CREATE INDEX "StudyBuddyInteraction_interaction_type_idx" ON "StudyBuddyInteraction"("interaction_type");

-- CreateIndex
CREATE INDEX "StudyBuddyInteraction_agent_used_idx" ON "StudyBuddyInteraction"("agent_used");

-- CreateIndex
CREATE INDEX "StudyBuddyInteraction_created_at_idx" ON "StudyBuddyInteraction"("created_at");

-- CreateIndex
CREATE INDEX "StudyBuddyInteraction_satisfaction_rating_idx" ON "StudyBuddyInteraction"("satisfaction_rating");

-- CreateIndex
CREATE INDEX "PredictiveInsight_user_id_idx" ON "PredictiveInsight"("user_id");

-- CreateIndex
CREATE INDEX "PredictiveInsight_tenant_id_idx" ON "PredictiveInsight"("tenant_id");

-- CreateIndex
CREATE INDEX "PredictiveInsight_insight_type_idx" ON "PredictiveInsight"("insight_type");

-- CreateIndex
CREATE INDEX "PredictiveInsight_severity_idx" ON "PredictiveInsight"("severity");

-- CreateIndex
CREATE INDEX "PredictiveInsight_status_idx" ON "PredictiveInsight"("status");

-- CreateIndex
CREATE INDEX "PredictiveInsight_generated_at_idx" ON "PredictiveInsight"("generated_at");

-- CreateIndex
CREATE INDEX "ConversationalAISession_user_id_idx" ON "ConversationalAISession"("user_id");

-- CreateIndex
CREATE INDEX "ConversationalAISession_tenant_id_idx" ON "ConversationalAISession"("tenant_id");

-- CreateIndex
CREATE INDEX "ConversationalAISession_session_status_idx" ON "ConversationalAISession"("session_status");

-- CreateIndex
CREATE INDEX "ConversationalAISession_started_at_idx" ON "ConversationalAISession"("started_at");

-- CreateIndex
CREATE INDEX "ConversationalAIMessage_session_id_idx" ON "ConversationalAIMessage"("session_id");

-- CreateIndex
CREATE INDEX "ConversationalAIMessage_role_idx" ON "ConversationalAIMessage"("role");

-- CreateIndex
CREATE INDEX "ConversationalAIMessage_created_at_idx" ON "ConversationalAIMessage"("created_at");

-- CreateIndex
CREATE INDEX "StudyBuddyAgentAnalytics_tenant_id_idx" ON "StudyBuddyAgentAnalytics"("tenant_id");

-- CreateIndex
CREATE INDEX "StudyBuddyAgentAnalytics_agent_name_idx" ON "StudyBuddyAgentAnalytics"("agent_name");

-- CreateIndex
CREATE INDEX "StudyBuddyAgentAnalytics_date_idx" ON "StudyBuddyAgentAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StudyBuddyAgentAnalytics_date_tenant_id_agent_name_key" ON "StudyBuddyAgentAnalytics"("date", "tenant_id", "agent_name");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_student_id_key" ON "StudentProfile"("student_id");

-- CreateIndex
CREATE INDEX "StudentProfile_tenant_id_idx" ON "StudentProfile"("tenant_id");

-- CreateIndex
CREATE INDEX "StudentProfile_student_id_idx" ON "StudentProfile"("student_id");

-- CreateIndex
CREATE INDEX "StudentProfile_needs_intervention_idx" ON "StudentProfile"("needs_intervention");

-- CreateIndex
CREATE INDEX "StudentProfile_ready_to_level_up_idx" ON "StudentProfile"("ready_to_level_up");

-- CreateIndex
CREATE INDEX "ClassRoster_tenant_id_idx" ON "ClassRoster"("tenant_id");

-- CreateIndex
CREATE INDEX "ClassRoster_teacher_id_idx" ON "ClassRoster"("teacher_id");

-- CreateIndex
CREATE INDEX "ClassRoster_academic_year_idx" ON "ClassRoster"("academic_year");

-- CreateIndex
CREATE INDEX "LessonPlan_tenant_id_idx" ON "LessonPlan"("tenant_id");

-- CreateIndex
CREATE INDEX "LessonPlan_class_roster_id_idx" ON "LessonPlan"("class_roster_id");

-- CreateIndex
CREATE INDEX "LessonPlan_teacher_id_idx" ON "LessonPlan"("teacher_id");

-- CreateIndex
CREATE INDEX "LessonPlan_status_idx" ON "LessonPlan"("status");

-- CreateIndex
CREATE INDEX "LessonPlan_scheduled_for_idx" ON "LessonPlan"("scheduled_for");

-- CreateIndex
CREATE INDEX "LessonActivity_lesson_plan_id_idx" ON "LessonActivity"("lesson_plan_id");

-- CreateIndex
CREATE INDEX "LessonActivity_sequence_order_idx" ON "LessonActivity"("sequence_order");

-- CreateIndex
CREATE INDEX "StudentLessonAssignment_tenant_id_idx" ON "StudentLessonAssignment"("tenant_id");

-- CreateIndex
CREATE INDEX "StudentLessonAssignment_student_id_idx" ON "StudentLessonAssignment"("student_id");

-- CreateIndex
CREATE INDEX "StudentLessonAssignment_lesson_plan_id_idx" ON "StudentLessonAssignment"("lesson_plan_id");

-- CreateIndex
CREATE INDEX "StudentLessonAssignment_status_idx" ON "StudentLessonAssignment"("status");

-- CreateIndex
CREATE INDEX "StudentLessonAssignment_intervention_triggered_idx" ON "StudentLessonAssignment"("intervention_triggered");

-- CreateIndex
CREATE INDEX "StudentActivityResponse_student_assignment_id_idx" ON "StudentActivityResponse"("student_assignment_id");

-- CreateIndex
CREATE INDEX "StudentActivityResponse_activity_id_idx" ON "StudentActivityResponse"("activity_id");

-- CreateIndex
CREATE INDEX "StudentActivityResponse_student_id_idx" ON "StudentActivityResponse"("student_id");

-- CreateIndex
CREATE INDEX "StudentActivityResponse_difficulty_mismatch_idx" ON "StudentActivityResponse"("difficulty_mismatch");

-- CreateIndex
CREATE INDEX "StudentProgressSnapshot_tenant_id_idx" ON "StudentProgressSnapshot"("tenant_id");

-- CreateIndex
CREATE INDEX "StudentProgressSnapshot_student_id_idx" ON "StudentProgressSnapshot"("student_id");

-- CreateIndex
CREATE INDEX "StudentProgressSnapshot_snapshot_type_idx" ON "StudentProgressSnapshot"("snapshot_type");

-- CreateIndex
CREATE INDEX "StudentProgressSnapshot_snapshot_date_idx" ON "StudentProgressSnapshot"("snapshot_date");

-- CreateIndex
CREATE INDEX "MultiAgencyAccess_tenant_id_idx" ON "MultiAgencyAccess"("tenant_id");

-- CreateIndex
CREATE INDEX "MultiAgencyAccess_user_id_idx" ON "MultiAgencyAccess"("user_id");

-- CreateIndex
CREATE INDEX "MultiAgencyAccess_role_type_idx" ON "MultiAgencyAccess"("role_type");

-- CreateIndex
CREATE UNIQUE INDEX "MultiAgencyAccess_tenant_id_user_id_key" ON "MultiAgencyAccess"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ParentChildLink_tenant_id_idx" ON "ParentChildLink"("tenant_id");

-- CreateIndex
CREATE INDEX "ParentChildLink_parent_id_idx" ON "ParentChildLink"("parent_id");

-- CreateIndex
CREATE INDEX "ParentChildLink_child_id_idx" ON "ParentChildLink"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildLink_parent_id_child_id_key" ON "ParentChildLink"("parent_id", "child_id");

-- CreateIndex
CREATE INDEX "VoiceCommand_tenant_id_idx" ON "VoiceCommand"("tenant_id");

-- CreateIndex
CREATE INDEX "VoiceCommand_user_id_idx" ON "VoiceCommand"("user_id");

-- CreateIndex
CREATE INDEX "VoiceCommand_created_at_idx" ON "VoiceCommand"("created_at");

-- CreateIndex
CREATE INDEX "VoiceCommand_command_type_idx" ON "VoiceCommand"("command_type");

-- CreateIndex
CREATE INDEX "AutomatedAction_tenant_id_idx" ON "AutomatedAction"("tenant_id");

-- CreateIndex
CREATE INDEX "AutomatedAction_action_type_idx" ON "AutomatedAction"("action_type");

-- CreateIndex
CREATE INDEX "AutomatedAction_student_id_idx" ON "AutomatedAction"("student_id");

-- CreateIndex
CREATE INDEX "AutomatedAction_created_at_idx" ON "AutomatedAction"("created_at");

-- CreateIndex
CREATE INDEX "AutomatedAction_requires_approval_idx" ON "AutomatedAction"("requires_approval");

-- CreateIndex
CREATE INDEX "ParentTeacherMessage_tenant_id_idx" ON "ParentTeacherMessage"("tenant_id");

-- CreateIndex
CREATE INDEX "ParentTeacherMessage_sender_id_idx" ON "ParentTeacherMessage"("sender_id");

-- CreateIndex
CREATE INDEX "ParentTeacherMessage_recipient_id_idx" ON "ParentTeacherMessage"("recipient_id");

-- CreateIndex
CREATE INDEX "ParentTeacherMessage_student_id_idx" ON "ParentTeacherMessage"("student_id");

-- CreateIndex
CREATE INDEX "ParentTeacherMessage_sent_at_idx" ON "ParentTeacherMessage"("sent_at");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_parent_tenant_id_fkey" FOREIGN KEY ("parent_tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_implemented_by_fkey" FOREIGN KEY ("implemented_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_portal_metrics" ADD CONSTRAINT "professional_portal_metrics_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_portal_activities" ADD CONSTRAINT "parent_portal_activities_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_permissions" ADD CONSTRAINT "parent_permissions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_enrollments" ADD CONSTRAINT "subject_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_enrollments" ADD CONSTRAINT "subject_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamification_achievements" ADD CONSTRAINT "gamification_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamification_badges" ADD CONSTRAINT "gamification_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamification_scores" ADD CONSTRAINT "gamification_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_stats" ADD CONSTRAINT "battle_stats_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_stats" ADD CONSTRAINT "battle_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merits" ADD CONSTRAINT "merits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merits" ADD CONSTRAINT "merits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_items" ADD CONSTRAINT "game_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipped_items" ADD CONSTRAINT "equipped_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipped_items" ADD CONSTRAINT "equipped_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "houses" ADD CONSTRAINT "houses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_competitions" ADD CONSTRAINT "squad_competitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "forum_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehcps" ADD CONSTRAINT "ehcps_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehcp_versions" ADD CONSTRAINT "ehcp_versions_ehcp_id_fkey" FOREIGN KEY ("ehcp_id") REFERENCES "ehcps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehcp_versions" ADD CONSTRAINT "ehcp_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ehcp_versions" ADD CONSTRAINT "ehcp_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sen_details" ADD CONSTRAINT "sen_details_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_studies" ADD CONSTRAINT "research_studies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_studies" ADD CONSTRAINT "research_studies_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_collaborators" ADD CONSTRAINT "research_collaborators_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "research_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_collaborators" ADD CONSTRAINT "research_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_datasets" ADD CONSTRAINT "research_datasets_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "research_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_analyses" ADD CONSTRAINT "research_analyses_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "research_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_analyses" ADD CONSTRAINT "research_analyses_researcher_id_fkey" FOREIGN KEY ("researcher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_participants" ADD CONSTRAINT "research_participants_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "research_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_participants" ADD CONSTRAINT "research_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_surveys" ADD CONSTRAINT "research_surveys_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "research_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_responses" ADD CONSTRAINT "research_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "research_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_responses" ADD CONSTRAINT "research_responses_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "research_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_publications" ADD CONSTRAINT "research_publications_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "research_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_ethics_approvals" ADD CONSTRAINT "research_ethics_approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessibility_settings" ADD CONSTRAINT "accessibility_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_style" ADD CONSTRAINT "learning_style_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speech_recognition_logs" ADD CONSTRAINT "speech_recognition_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speech_synthesis_logs" ADD CONSTRAINT "speech_synthesis_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_logs" ADD CONSTRAINT "translation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_preferences" ADD CONSTRAINT "help_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_viewed_items" ADD CONSTRAINT "help_viewed_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpArticle" ADD CONSTRAINT "HelpArticle_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "HelpCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpArticleRelated" ADD CONSTRAINT "HelpArticleRelated_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "HelpArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "BlogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_usage" ADD CONSTRAINT "feature_usage_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructor" ADD CONSTRAINT "CourseInstructor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_trainingPurchaseId_fkey" FOREIGN KEY ("trainingPurchaseId") REFERENCES "TrainingPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionContact" ADD CONSTRAINT "InstitutionContact_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionContact" ADD CONSTRAINT "InstitutionContact_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMember" ADD CONSTRAINT "DepartmentMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionSubscription" ADD CONSTRAINT "InstitutionSubscription_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionAdmin" ADD CONSTRAINT "InstitutionAdmin_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionAdmin" ADD CONSTRAINT "InstitutionAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuiz" ADD CONSTRAINT "CourseQuiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "CourseQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "CourseQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerUpPurchase" ADD CONSTRAINT "PowerUpPurchase_powerUpId_fkey" FOREIGN KEY ("powerUpId") REFERENCES "PowerUp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgress" ADD CONSTRAINT "ChallengeProgress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMember" ADD CONSTRAINT "SquadMember_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadCompetitionEntry" ADD CONSTRAINT "SquadCompetitionEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "SquadCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadCompetitionEntry" ADD CONSTRAINT "SquadCompetitionEntry_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentDomain" ADD CONSTRAINT "AssessmentDomain_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "AssessmentFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentInstance" ADD CONSTRAINT "AssessmentInstance_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "AssessmentFramework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainObservation" ADD CONSTRAINT "DomainObservation_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "AssessmentInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainObservation" ADD CONSTRAINT "DomainObservation_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "AssessmentDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCollaboration" ADD CONSTRAINT "AssessmentCollaboration_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "AssessmentInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPurchase" ADD CONSTRAINT "TrainingPurchase_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "TrainingProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractiveResponse" ADD CONSTRAINT "InteractiveResponse_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "InteractiveElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathEnrollment" ADD CONSTRAINT "LearningPathEnrollment_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_solver_queries" ADD CONSTRAINT "problem_solver_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyBuddyRecommendation" ADD CONSTRAINT "StudyBuddyRecommendation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyBuddyRecommendation" ADD CONSTRAINT "StudyBuddyRecommendation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProfile" ADD CONSTRAINT "UserLearningProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProfile" ADD CONSTRAINT "UserLearningProfile_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyBuddyInteraction" ADD CONSTRAINT "StudyBuddyInteraction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyBuddyInteraction" ADD CONSTRAINT "StudyBuddyInteraction_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictiveInsight" ADD CONSTRAINT "PredictiveInsight_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictiveInsight" ADD CONSTRAINT "PredictiveInsight_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalAISession" ADD CONSTRAINT "ConversationalAISession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalAISession" ADD CONSTRAINT "ConversationalAISession_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalAIMessage" ADD CONSTRAINT "ConversationalAIMessage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ConversationalAISession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyBuddyAgentAnalytics" ADD CONSTRAINT "StudyBuddyAgentAnalytics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRoster" ADD CONSTRAINT "ClassRoster_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRoster" ADD CONSTRAINT "ClassRoster_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_class_roster_id_fkey" FOREIGN KEY ("class_roster_id") REFERENCES "ClassRoster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonActivity" ADD CONSTRAINT "LessonActivity_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonAssignment" ADD CONSTRAINT "StudentLessonAssignment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonAssignment" ADD CONSTRAINT "StudentLessonAssignment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonAssignment" ADD CONSTRAINT "StudentLessonAssignment_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonAssignment" ADD CONSTRAINT "StudentLessonAssignment_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivityResponse" ADD CONSTRAINT "StudentActivityResponse_student_assignment_id_fkey" FOREIGN KEY ("student_assignment_id") REFERENCES "StudentLessonAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivityResponse" ADD CONSTRAINT "StudentActivityResponse_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "LessonActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgressSnapshot" ADD CONSTRAINT "StudentProgressSnapshot_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgressSnapshot" ADD CONSTRAINT "StudentProgressSnapshot_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgressSnapshot" ADD CONSTRAINT "StudentProgressSnapshot_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiAgencyAccess" ADD CONSTRAINT "MultiAgencyAccess_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiAgencyAccess" ADD CONSTRAINT "MultiAgencyAccess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCommand" ADD CONSTRAINT "VoiceCommand_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceCommand" ADD CONSTRAINT "VoiceCommand_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomatedAction" ADD CONSTRAINT "AutomatedAction_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomatedAction" ADD CONSTRAINT "AutomatedAction_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentTeacherMessage" ADD CONSTRAINT "ParentTeacherMessage_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentTeacherMessage" ADD CONSTRAINT "ParentTeacherMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentTeacherMessage" ADD CONSTRAINT "ParentTeacherMessage_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentTeacherMessage" ADD CONSTRAINT "ParentTeacherMessage_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
