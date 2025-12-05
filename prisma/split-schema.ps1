#!/usr/bin/env pwsh
<#
.SYNOPSIS
Splits monolithic Prisma schema into domain-specific files (schema composition)
.DESCRIPTION
Reads schema.prisma and splits into logical domain files in prisma/schemas/
#>

param(
    [string]$SchemaPath = "e:\EdpsychConnect\prisma\schema.prisma",
    [string]$OutputDir = "e:\EdpsychConnect\prisma\schemas"
)

# Define model to domain mapping
$modelDomains = @{
    # Core/Auth
    'tenants' = 'core'
    'users' = 'core'
    'Institution' = 'core'
    'InstitutionAdmin' = 'core'
    'InstitutionContact' = 'core'
    'InstitutionSubscription' = 'core'
    'TenantDatabaseConfig' = 'core'
    'SystemConfig' = 'core'
    'IntegrationSettings' = 'core'
    'user_preferences' = 'core'
    'UserPreference' = 'core'
    'UserActivity' = 'core'
    'accessibility_settings' = 'core'
    'MultiAgencyAccess' = 'core'
    'onboarding_progress' = 'core'
    'TierConfiguration' = 'core'
    'DiscountCode' = 'core'
    'BetaAccessCode' = 'core'
    'BetaAccessCodeUsage' = 'core'
    'waitlist' = 'core'

    # Education & Curriculum
    'courses' = 'education'
    'enrollments' = 'education'
    'academic_years' = 'education'
    'terms' = 'education'
    'class_enrollments' = 'education'
    'subject_enrollments' = 'education'
    'teacher_subjects' = 'education'
    'timetable_slots' = 'education'
    'CourseModule' = 'education'
    'CourseLesson' = 'education'
    'CourseQuiz' = 'education'
    'CourseInstructor' = 'education'
    'CourseReview' = 'education'
    'NCCurriculum' = 'education'
    'NCLesson' = 'education'
    'NCExercise' = 'education'
    'NCProgress' = 'education'
    'NCSubmission' = 'education'
    'LessonPlan' = 'education'
    'LessonActivity' = 'education'
    'LessonProgress' = 'education'
    'LessonPersonalization' = 'education'
    'StudentLessonAssignment' = 'education'
    'ClassRoster' = 'education'

    # EHCP System
    'ehcps' = 'ehcp'
    'ehcp_versions' = 'ehcp'
    'EHCPApplication' = 'ehcp'
    'EHCPDocument' = 'ehcp'
    'EHCPNeed' = 'ehcp'
    'EHCPProvision' = 'ehcp'
    'EHCPOutcome' = 'ehcp'
    'EHCPPanelDecision' = 'ehcp'
    'EHCPTimelineEvent' = 'ehcp'
    'EHCPContribution' = 'ehcp'
    'EHCPCommunication' = 'ehcp'
    'EHCPCostCalculation' = 'ehcp'
    'EHCPCoherenceAnalysis' = 'ehcp'
    'AnnualReview' = 'ehcp'
    'AnnualReviewContribution' = 'ehcp'
    'EHCPNotificationTemplate' = 'ehcp'
    'NeedProvisionLink' = 'ehcp'

    # SEN & SEND Data
    'sen_details' = 'sen'
    'SEN2Return' = 'sen'
    'SEN2ReturnData' = 'sen'
    'SEN2ChildRecord' = 'sen'
    'SEN2AgeBreakdown' = 'sen'
    'SEN2NeedBreakdown' = 'sen'
    'SEN2PlacementBreakdown' = 'sen'
    'SEN2AuditEntry' = 'sen'
    'SEN2ValidationResult' = 'sen'
    'SEN2TimelineDetail' = 'sen'

    # Assessment
    'assessments' = 'assessment'
    'AssessmentTemplate' = 'assessment'
    'AssessmentFramework' = 'assessment'
    'AssessmentInstance' = 'assessment'
    'AssessmentResult' = 'assessment'
    'AssessmentOutcome' = 'assessment'
    'AssessmentDomain' = 'assessment'
    'AssessmentGuidance' = 'assessment'
    'AssessmentCollaboration' = 'assessment'
    'AssessmentContentLink' = 'assessment'
    'Recommendation' = 'assessment'
    'EthicsAssessment' = 'assessment'

    # Students & Profiles
    'students' = 'student'
    'StudentProfile' = 'student'
    'StudentAdaptiveProfile' = 'student'
    'StudentLearningProfile' = 'student'
    'StudentLearningAdaptation' = 'student'
    'StudentOutcomePrediction' = 'student'
    'StudentActivityResponse' = 'student'
    'StudentProgressSnapshot' = 'student'
    'EdPsychProfile' = 'student'
    'ParentChildLink' = 'student'
    'DifferentiatedLessonVersion' = 'student'

    # Parents & Family
    'parents' = 'parent'
    'parent_portal_activities' = 'parent'
    'parent_permissions' = 'parent'
    'ParentalTip' = 'parent'
    'ParentTeacherMessage' = 'parent'
    'ParentEngagementActivity' = 'parent'

    # Gamification
    'gamification_achievements' = 'gamification'
    'gamification_badges' = 'gamification'
    'gamification_scores' = 'gamification'
    'battle_stats' = 'gamification'
    'merits' = 'gamification'
    'game_items' = 'gamification'
    'equipped_items' = 'gamification'
    'houses' = 'gamification'
    'squad_competitions' = 'gamification'
    'squad_members' = 'gamification'
    'BattleRoyaleGame' = 'gamification'
    'GamePlayer' = 'gamification'
    'GameEvent' = 'gamification'
    'Challenge' = 'gamification'
    'ChallengeProgress' = 'gamification'
    'PowerUp' = 'gamification'
    'PowerUpPurchase' = 'gamification'
    'SquadCompetition' = 'gamification'
    'SquadCompetitionEntry' = 'gamification'
    'SquadMember' = 'gamification'
    'Leaderboard' = 'gamification'
    'LeaderboardEntry' = 'gamification'

    # Research
    'research_analyses' = 'research'
    'research_collaborators' = 'research'
    'research_datasets' = 'research'
    'research_ethics_approvals' = 'research'
    'research_participants' = 'research'
    'research_publications' = 'research'
    'research_responses' = 'research'
    'research_studies' = 'research'
    'research_surveys' = 'research'
    'ResearcherProfile' = 'research'
    'AlgorithmLicense' = 'research'
    'AlgorithmUsage' = 'research'
    'AlgorithmVersion' = 'research'
    'Algorithm' = 'research'

    # Professional Network
    'professionals' = 'professional'
    'professional_portal_metrics' = 'professional'
    'MarketplaceProfessional' = 'professional'
    'MarketplaceReview' = 'professional'
    'ServiceListing' = 'professional'
    'ServiceContract' = 'professional'
    'EPBooking' = 'professional'
    'EPVerification' = 'professional'

    # AI & Learning
    'ConversationalAIMessage' = 'ai'
    'ConversationalAISession' = 'ai'
    'StudyBuddyInteraction' = 'ai'
    'StudyBuddyRecommendation' = 'ai'
    'StudyBuddyAgentAnalytics' = 'ai'
    'PredictiveInsight' = 'ai'
    'UserLearningProfile' = 'ai'
    'VoiceCommand' = 'ai'
    'speech_recognition_logs' = 'ai'
    'speech_synthesis_logs' = 'ai'
    'translation_logs' = 'ai'

    # Community & Forums
    'forums' = 'community'
    'forum_threads' = 'community'
    'forum_replies' = 'community'
    'friendships' = 'community'
    'BlogPost' = 'community'
    'BlogTag' = 'community'
    'BlogCategory' = 'community'
    'BlogComment' = 'community'
    'BlogPostTag' = 'community'

    # LA/Compliance
    'LAComplianceMetrics' = 'compliance'
    'ComplianceRiskPrediction' = 'compliance'
    'ComplianceAlert' = 'compliance'
    'GoldenThreadAnalysis' = 'compliance'
    'MediationCase' = 'compliance'
    'TribunalCase' = 'compliance'
    'PhaseTransfer' = 'compliance'
    'PhaseTransferEvent' = 'compliance'
    'ProvisionCost' = 'compliance'
    'ProvisionOutcomeLink' = 'compliance'
    'FundingBand' = 'compliance'

    # Analytics & Monitoring
    'AnalyticsEvent' = 'analytics'
    'feature_usage' = 'analytics'
    'PerformanceMetric' = 'analytics'
    'TimeSavingsMetric' = 'analytics'
    'TimeSavingsReport' = 'analytics'
    'AuditLog' = 'analytics'
    'ContentInteraction' = 'analytics'
    'KnowledgeInteraction' = 'analytics'
    'UserInterest' = 'analytics'
    'CPDLog' = 'analytics'
    'DailyCPDDigest' = 'analytics'
    'HelpSearchLog' = 'analytics'

    # Help & Support
    'HelpArticle' = 'help'
    'HelpCategory' = 'help'
    'HelpFAQ' = 'help'
    'HelpArticleRelated' = 'help'
    'KnowledgeArticle' = 'help'
    'LegalDocument' = 'help'
    'LegalSignature' = 'help'
    'help_preferences' = 'help'
    'help_viewed_items' = 'help'

    # Content & Learning Materials
    'Content' = 'content'
    'ContentSimilarity' = 'content'
    'LearningPath' = 'content'
    'LearningPathEnrollment' = 'content'
    'InteractiveElement' = 'content'
    'InteractiveResponse' = 'content'
    'Feedback' = 'content'
    'attachments' = 'content'
    'CodingCourse' = 'content'
    'CodingLesson' = 'content'
    'CodingLearning' = 'content'
    'CodingEnrollment' = 'content'
    'CodingLessonCompletion' = 'content'

    # Admin & Config
    'Department' = 'admin'
    'DepartmentManager' = 'admin'
    'DepartmentMember' = 'admin'
    'AutomatedAction' = 'admin'
    'SyncLog' = 'admin'
    'CommunicationSentimentAnalysis' = 'admin'

    # Certificates & Training
    'Certificate' = 'training'
    'CertificateTemplate' = 'training'
    'TrainingProduct' = 'training'
    'TrainingPurchase' = 'training'

    # Subscriptions
    'subscriptions' = 'subscriptions'
    'VolumeDiscountTier' = 'subscriptions'

    # Other Features
    'problem_solver_queries' = 'features'
    'learning_style' = 'features'
    'LearningPathEnrollment' = 'features'
    'OutcomeProgressReview' = 'features'
    'Feedback' = 'features'
    'EthicsIncident' = 'features'
    'EthicsMonitor' = 'features'
    'ProfessionalCompliance' = 'features'
    'SurveyResponse' = 'features'
    'UserInterview' = 'features'
    'SecureDocument' = 'features'
    'Quiz' = 'features'
    'QuizAnswer' = 'features'
    'QuizAttempt' = 'features'
    'QuizQuestion' = 'features'
}

Write-Host "Schema Composition Split Strategy"
Write-Host "=================================="
Write-Host ""

# List unique domains
$domains = $modelDomains.Values | Sort-Object -Unique
Write-Host "Target domains: $($domains -join ', ')"
Write-Host ""
Write-Host "Note: This script maps models to domains."
Write-Host "Actual split will be performed using intelligent parsing."
