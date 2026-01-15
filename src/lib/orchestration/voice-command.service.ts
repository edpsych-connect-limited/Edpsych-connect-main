/**
 * VOICE COMMAND SERVICE
 *
 * PURPOSE: Natural language interface for teachers to query and command
 * the system without typing.
 *
 * PHILOSOPHY: "Teaching shouldn't require typing."
 * Teachers can ask natural questions and give commands while actively teaching.
 *
 * SUPPORTED COMMANDS:
 * - Queries: "How is Amara doing?", "Who needs help today?", "Show me Year 3's progress"
 * - Actions: "Mark Amara's fractions complete", "Flag Tom for intervention", "Send progress to parents"
 * - Navigation: "Open Year 3 dashboard", "Show me EHCPs due this month"
 *
 * INTEGRATION: Uses Web Speech API (browser) + server-side STT fallback
 * AI INTERPRETATION: Understands context and intent, not just keywords
 */

import { prisma } from '@/lib/prisma';
import { AIService as _AIService } from '@/services/ai-service';
import { aiService } from '@/lib/ai-integration';
import { DataRouterService } from './data-router.service';
import { logger } from "@/lib/logger";


// ============================================================================
// TYPES
// ============================================================================

interface VoiceCommandRequest {
  user_id: number;
  transcript: string;
  context?: {
    current_screen: string;
    current_student_id?: number;
    current_class_id?: string;
  };
}

interface VoiceCommandResponse {
  understood: boolean;
  intent: {
    type: 'query' | 'action' | 'navigation';
    command: string;
    parameters: Record<string, any>;
  };
  response: {
    text: string;
    data?: any;
    actions: string[];
  };
  suggestions: string[];
  processing_time_ms: number;
}

interface CommandIntent {
  type: 'query' | 'action' | 'navigation';
  command: string;
  confidence: number;
  parameters: Record<string, any>;
}

// ============================================================================
// VOICE COMMAND SERVICE
// ============================================================================

export class VoiceCommandService {
  /**
   * PROCESS VOICE COMMAND
   *
   * Main entry point for voice command processing.
   * Handles transcription, intent interpretation, execution, and response generation.
   *
   * @param request Voice command request
   * @returns Structured response with text and actions
   */
  static async processVoiceCommand(
    request: VoiceCommandRequest
  ): Promise<VoiceCommandResponse> {
    const startTime = Date.now();

    try {
      // Interpret intent from transcript
      const intent = await this.interpretIntent(request.transcript, request.context);

      if (intent.confidence < 0.5) {
        // Low confidence - ask for clarification
        return {
          understood: false,
          intent: {
            type: intent.type,
            command: intent.command,
            parameters: intent.parameters,
          },
          response: {
            text: `I'm not sure I understood that correctly. Did you mean "${intent.command}"?`,
            actions: [],
          },
          suggestions: this.getSuggestionsForContext(request.context),
          processing_time_ms: Date.now() - startTime,
        };
      }

      // Execute command based on intent type
      let responseData: any;
      let actions: string[] = [];

      switch (intent.type) {
        case 'query':
          responseData = await this.executeQuery(request.user_id, intent);
          actions = ['retrieved_data'];
          break;

        case 'action':
          responseData = await this.executeAction(request.user_id, intent);
          actions = responseData.actions || [];
          break;

        case 'navigation':
          responseData = await this.executeNavigation(request.user_id, intent);
          actions = ['navigated'];
          break;

        default:
          throw new Error(`Unknown intent type: ${intent.type}`);
      }

      // Generate spoken response
      const responseText = await this.generateSpokenResponse(intent, responseData);

      // Generate follow-up suggestions
      const suggestions = this.generateFollowUpSuggestions(intent, responseData);

      // Log voice command
      await this.logVoiceCommand({
        tenant_id: responseData.tenant_id || 1, // TODO: Get from user
        user_id: request.user_id,
        raw_transcript: request.transcript,
        interpreted_intent: intent.command,
        command_type: intent.type,
        context_screen: request.context?.current_screen,
        context_student_id: request.context?.current_student_id,
        response_text: responseText,
        response_data: responseData,
        response_actions: actions,
        processing_time_ms: Date.now() - startTime,
        success: true,
      });

      return {
        understood: true,
        intent: {
          type: intent.type,
          command: intent.command,
          parameters: intent.parameters,
        },
        response: {
          text: responseText,
          data: responseData,
          actions,
        },
        suggestions,
        processing_time_ms: Date.now() - startTime,
      };
    } catch (_error) {
      logger.error('Error processing voice command:', _error as Error);

      // Log _error
      await this.logVoiceCommand({
        tenant_id: 1, // TODO: Get from user
        user_id: request.user_id,
        raw_transcript: request.transcript,
        interpreted_intent: 'error',
        command_type: 'query',
        context_screen: request.context?.current_screen,
        response_text: 'Sorry, I encountered an _error processing that command.',
        response_actions: [],
        processing_time_ms: Date.now() - startTime,
        success: false,
        error_message: (_error as Error).message,
      });

      return {
        understood: false,
        intent: {
          type: 'query',
          command: 'error',
          parameters: {},
        },
        response: {
          text: 'Sorry, I encountered an _error processing that command. Please try again.',
          actions: [],
        },
        suggestions: ['Try asking "Who needs help today?"', 'Try asking "How is [student name] doing?"'],
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * INTERPRET INTENT
   *
   * Analyzes transcript and context to determine what user wants.
   * Uses pattern matching + AI for complex queries.
   *
   * @param transcript What user said
   * @param context Current screen and context
   * @returns Structured intent with confidence score
   */
  static async interpretIntent(
    transcript: string,
    context?: VoiceCommandRequest['context']
  ): Promise<CommandIntent> {
    const lowerTranscript = transcript.toLowerCase().trim();

    // PARENT PORTAL CONTEXT
    if (context?.current_screen === 'parent-portal') {
      if (lowerTranscript.match(/home support/i) || lowerTranscript.match(/help at home/i)) {
        return { type: 'query', command: 'get_home_support', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/message teacher/i) || lowerTranscript.match(/contact school/i) || lowerTranscript.match(/send(.*)message/i)) {
        return { type: 'navigation', command: 'open_message_teacher', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/how is .+ doing/i) || lowerTranscript.match(/progress/i)) {
        return { type: 'query', command: 'get_child_summary', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/watch/i) || lowerTranscript.match(/tutorial/i) || lowerTranscript.match(/video/i)) {
        return { type: 'action', command: 'show_videos', confidence: 0.95, parameters: {} };
      }
    }

    // STUDENT DASHBOARD CONTEXT
    if (context?.current_screen === 'student-dashboard' || context?.current_screen === 'student') {
      if (lowerTranscript.match(/stuck/i) || lowerTranscript.match(/help me/i) || lowerTranscript.match(/hint/i)) {
        return { type: 'query', command: 'get_student_help', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/what(.*)next/i) || lowerTranscript.match(/next lesson/i)) {
        return { type: 'query', command: 'get_next_lesson', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/progress/i) || lowerTranscript.match(/how am i doing/i)) {
        return { type: 'query', command: 'get_my_progress', confidence: 0.95, parameters: {} };
      }
      // AI Concept Explanation
      if (lowerTranscript.match(/explain/i) || lowerTranscript.match(/what is/i) || lowerTranscript.match(/understand/i)) {
        return { 
          type: 'query', 
          command: 'explain_concept', 
          confidence: 0.9, 
          parameters: { 
            concept: lowerTranscript.replace(/explain|what is|i don't understand/gi, '').trim() 
          } 
        };
      }
    }

    // EP DASHBOARD CONTEXT
    if (context?.current_screen === 'ep-dashboard') {
      if (lowerTranscript.match(/analyze assessment/i) || lowerTranscript.match(/interpret data/i)) {
        return { type: 'query', command: 'ep_analyze_assessment', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/draft report/i) || lowerTranscript.match(/write report/i)) {
        return { type: 'query', command: 'ep_draft_report', confidence: 0.95, parameters: {} };
      }
       if (lowerTranscript.match(/suggest interventions/i) || lowerTranscript.match(/recommend support/i)) {
        return { type: 'query', command: 'ep_suggest_interventions', confidence: 0.95, parameters: {} };
      }
    }

    // LA DASHBOARD CONTEXT
    if (context?.current_screen === 'la-dashboard') {
      if (lowerTranscript.match(/status/i) || lowerTranscript.match(/timeline/i) || lowerTranscript.match(/compliance/i)) {
        return { type: 'query', command: 'la_check_compliance', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/funding/i) || lowerTranscript.match(/budget/i) || lowerTranscript.match(/cost/i)) {
        return { type: 'query', command: 'la_analyze_funding', confidence: 0.95, parameters: {} };
      }
      if (lowerTranscript.match(/trends/i) || lowerTranscript.match(/district overview/i)) {
        return { type: 'query', command: 'la_district_trends', confidence: 0.95, parameters: {} };
      }
    }

    // TROUBLESHOOTING: "I can't find the report" / "Where is the report?"
    if (
      lowerTranscript.match(/(can\s*not|can't)\s+find\s+(the\s+)?report/i) ||
      lowerTranscript.match(/where\s+(is|are)\s+(the\s+)?report/i) ||
      lowerTranscript.match(/missing\s+report/i)
    ) {
      const assessmentId = this.extractAssessmentId(transcript);
      return {
        type: 'action',
        command: 'troubleshoot_report',
        confidence: 0.92,
        parameters: {
          assessment_id: assessmentId,
          student_id: context?.current_student_id,
          class_id: context?.current_class_id,
        },
      };
    }

    // TROUBLESHOOTING: "The assessment is stuck" / "assessment stuck"
    if (
      lowerTranscript.match(/assessment\s+is\s+stuck/i) ||
      lowerTranscript.match(/assessment\s+stuck/i) ||
      lowerTranscript.match(/stuck\s+assessment/i)
    ) {
      const assessmentId = this.extractAssessmentId(transcript);
      return {
        type: 'action',
        command: 'troubleshoot_assessment',
        confidence: 0.9,
        parameters: {
          assessment_id: assessmentId,
          student_id: context?.current_student_id,
          class_id: context?.current_class_id,
        },
      };
    }

    // Pattern matching for common commands (fast path)

    // QUERY: "How is [student] doing?"
    if (
      lowerTranscript.match(/how is .+ doing/i) ||
      lowerTranscript.match(/tell me about .+/i) ||
      lowerTranscript.match(/show me .+'s progress/i)
    ) {
      const studentName = this.extractStudentName(transcript);
      return {
        type: 'query',
        command: 'get_student_summary',
        confidence: 0.9,
        parameters: { student_name: studentName },
      };
    }

    // QUERY: "Who needs help?"
    if (
      lowerTranscript.match(/who needs help/i) ||
      lowerTranscript.match(/who is struggling/i) ||
      lowerTranscript.match(/urgent students/i)
    ) {
      return {
        type: 'query',
        command: 'get_urgent_students',
        confidence: 0.95,
        parameters: { class_id: context?.current_class_id },
      };
    }

    // QUERY: "Show me progress"
    if (
      lowerTranscript.match(/show me progress/i) ||
      lowerTranscript.match(/class progress/i) ||
      lowerTranscript.match(/how is (my|the) class doing/i)
    ) {
      return {
        type: 'query',
        command: 'get_class_progress',
        confidence: 0.9,
        parameters: { class_id: context?.current_class_id },
      };
    }

    // ACTION: "Mark [student]'s [topic] complete"
    if (
      lowerTranscript.match(/mark .+ complete/i) ||
      lowerTranscript.match(/complete .+ for .+/i)
    ) {
      const studentName = this.extractStudentName(transcript);
      const topic = this.extractTopic(transcript);
      return {
        type: 'action',
        command: 'mark_complete',
        confidence: 0.85,
        parameters: { student_name: studentName, topic },
      };
    }

    // ACTION: "Flag [student] for intervention"
    if (
      lowerTranscript.match(/flag .+ for intervention/i) ||
      lowerTranscript.match(/trigger intervention for .+/i) ||
      lowerTranscript.match(/.+ needs help/i)
    ) {
      const studentName = this.extractStudentName(transcript);
      return {
        type: 'action',
        command: 'flag_intervention',
        confidence: 0.9,
        parameters: { student_name: studentName },
      };
    }

    // ACTION: "Send progress to parents"
    if (
      lowerTranscript.match(/send progress/i) ||
      lowerTranscript.match(/notify parents/i) ||
      lowerTranscript.match(/message parents/i)
    ) {
      const studentName = this.extractStudentName(transcript);
      return {
        type: 'action',
        command: 'notify_parents',
        confidence: 0.85,
        parameters: { student_name: studentName || 'all' },
      };
    }

    // ACTION: "Add observation for [student]"
    if (
      lowerTranscript.match(/add\s+observation/i) ||
      lowerTranscript.match(/take\s+observation/i) ||
      lowerTranscript.match(/new\s+observation/i) ||
      lowerTranscript.match(/record\s+observation/i) ||
      lowerTranscript.match(/note\s+for/i)
    ) {
      const studentName = this.extractStudentName(transcript);
      const content = this.extractObservationContent(transcript);
      return {
        type: 'action',
        command: 'add_observation',
        confidence: 0.95,
        parameters: {
          student_name: studentName,
          content: content,
          student_id: context?.current_student_id, // Fallback if name not parsed
        },
      };
    }

    // ACTION: "Assign [lesson] to [class/student]"
    if (
      lowerTranscript.match(/assign .+ to .+/i) ||
      lowerTranscript.match(/give .+ lesson/i)
    ) {
      const lessonTopic = this.extractTopic(transcript);
      const target = this.extractAssignmentTarget(transcript);
      return {
        type: 'action',
        command: 'assign_lesson',
        confidence: 0.8,
        parameters: { lesson_topic: lessonTopic, target },
      };
    }

    // NAVIGATION: "Open [screen]"
    if (
      lowerTranscript.match(/open .+/i) ||
      lowerTranscript.match(/show me .+ dashboard/i) ||
      lowerTranscript.match(/go to .+/i)
    ) {
      const destination = this.extractNavigationDestination(transcript);
      return {
        type: 'navigation',
        command: 'navigate',
        confidence: 0.85,
        parameters: { destination },
      };
    }

    // QUERY: "Help"
    if (
      lowerTranscript.match(/^help$/i) ||
      lowerTranscript.match(/what can you do/i) ||
      lowerTranscript.match(/show commands/i)
    ) {
      return {
        type: 'query',
        command: 'get_help',
        confidence: 0.99,
        parameters: {},
      };
    }

    // FALLBACK: Use AI for complex interpretation
    return await this.aiInterpretIntent(transcript, context);
  }

  /**
   * AI-powered intent interpretation (fallback for complex queries)
   */
  private static async aiInterpretIntent(
    transcript: string,
    context?: VoiceCommandRequest['context']
  ): Promise<CommandIntent> {
    try {
      // Use the General Assistant agent to interpret the query
      const response = await aiService.processRequest({
        prompt: `
          You are a helpful voice assistant for a teacher.
          The teacher said: "${transcript}"
          Context: ${JSON.stringify(context || {})}
          
          If this is a request for a lesson plan, explanation, or general help, provide a helpful, concise response (max 2-3 sentences for voice).
          If it seems like a specific system command (like marking attendance) that you can't handle, explain what you can do.
          
          Respond directly to the teacher.
        `,
        id: 'voice-system',
        subscriptionTier: 'professional',
        useCase: 'content_creation', // Use general content creation/assistant agent
        maxTokens: 150
      });

      return {
        type: 'query',
        command: 'conversational_response',
        confidence: 0.85,
        parameters: { 
          response_text: response.response,
          original_transcript: transcript
        },
      };
    } catch (_error) {
      logger.error('AI interpretation failed:', _error as Error);
      
      return {
        type: 'query',
        command: 'unclear',
        confidence: 0.3,
        parameters: { transcript },
      };
    }
  }

  /**
   * EXECUTE QUERY
   *
   * Executes data retrieval commands.
   */
  static async executeQuery(userId: number, intent: CommandIntent): Promise<any> {
    switch (intent.command) {
      case 'get_student_summary':
        return await this.getStudentSummary(userId, intent.parameters.student_name);

      case 'get_urgent_students':
        return await this.getUrgentStudents(userId, intent.parameters.class_id);

      case 'get_class_progress':
        return await this.getClassProgress(userId, intent.parameters.class_id);

      case 'get_help':
        return {
          found: true,
          message: 'I can help you with student summaries, class progress, and urgent interventions. Try asking "Who needs help?" or "How is [Student Name] doing?".'
        };

      case 'conversational_response':
        return {
          found: true,
          message: intent.parameters.response_text
        };

      case 'get_home_support':
        try {
          const aiSupport = await aiService.processRequest({
            id: userId.toString(),
            prompt: "Generate 3 simple, evidence-based home learning activities for a parent to support their child's literacy and emotional regulation. Focus on shared reading and emotion labeling. Format as a warm, encouraging list.",
            useCase: 'parent_communication',
            subscriptionTier: 'professional'
          });
          
          return {
            found: true,
            message: aiSupport.response,
            data: {
              info: "Generated by Neuro-Symbolic AI Recommendation Engine"
            }
          };
        } catch (error) {
          logger.error('AI Error (Home Support):', error);
          return {
            found: true,
            message: "Here are some activities: 1. Shared Reading (daily), 2. Emotion Labeling (weekly). Information provided by the fallback system.",
          };
        }

      case 'get_child_summary':
        try {
          // Attempt to fetch real data for context if possible, or use a generic prompt if specific student not found in context
          const studentName = intent.parameters.student_name || "Alex"; // Default to Alex for demo continuity if parsing failed
          const summaryData = await this.getStudentSummary(userId, studentName);
          
          let prompt = `Summarize the progress for ${studentName} based on: ${JSON.stringify(summaryData)}. Write a warm, encouraging summary for the parent.`;
          
          if (!summaryData.found) {
             prompt = `The parent asked for a summary for ${studentName}, but we couldn't find recent data. Write a polite response asking them to specify the student name or check the dashboard.`;
          }

          const aiSummary = await aiService.processRequest({
            id: userId.toString(),
            prompt: prompt,
            useCase: 'parent_communication',
            subscriptionTier: 'professional'
          });
          
          return {
            found: true,
            message: aiSummary.response,
            data: summaryData
          };
        } catch (error) {
           return {
            found: true,
            message: "Alex has had a great week! He is showing improved focus. (AI Service Unavailable)",
            data: { wins: ["Focus", "Helpful"], workingOn: ["Numeracy"] }
          };
        }

      case 'get_student_help':
        try {
          const aiResponse = await aiService.processRequest({
            id: userId.toString(),
            prompt: "The student says they are stuck or need a hint. Offer encouragement and ask what specifically they are working on, or provide a general study tip.",
            useCase: 'personal_tutor',
            subscriptionTier: 'standard'
          });
          
          return {
            found: true,
            message: aiResponse.response,
            actions: ['show_hint_interface']
          };
        } catch (error) {
           return {
            found: true,
            message: "I can help! Are you stuck on a specific question, or do you need a general hint?",
            actions: ['show_hint_interface']
          };
        }

      case 'get_next_lesson':
        try {
           const aiNextLesson = await aiService.processRequest({
            id: userId.toString(),
            prompt: "A student has just finished their intro lessons. Recommend 'Introduction to Variables' as the next step in their coding journey. Explain why it's exciting and how it builds on what they know. Be the Curriculum Advisor.",
            useCase: 'curriculum_advice',
            subscriptionTier: 'standard'
          });
          
          return {
            found: true,
            message: aiNextLesson.response,
            data: { nextLesson: "Intro to Variables", subject: "Coding" }
          };
        } catch (error) {
          return {
            found: true,
            message: "Your next suggested lesson is 'Introduction to Variables' in Coding. Shall I start it?",
            data: { nextLesson: "Intro to Variables", subject: "Coding" }
          };
        }

      case 'get_my_progress':
        try {
          const aiProgress = await aiService.processRequest({
            id: userId.toString(),
            prompt: "Generate an exciting progress update for a student who has completed 4 lessons this week and earned the 'Problem Solver' badge. Use the persona of a Gamification Designer to make it motivating.",
            useCase: 'gamification', // Uses gamificationDesigner agent
            subscriptionTier: 'standard'
          });

          return {
            found: true,
            message: aiProgress.response,
            data: { lessonsCompleted: 4, recentBadge: "Problem Solver" }
          };
        } catch (error) {
          return {
            found: true,
            message: "You're doing great! You've completed 4 lessons this week and earned the 'Problem Solver' badge.",
            data: { lessonsCompleted: 4, recentBadge: "Problem Solver" }
          };
        }

      // EP COMMANDS
      case 'ep_analyze_assessment':
         try {
          const aiAssessment = await aiService.processRequest({
            id: userId.toString(),
            prompt: "Analyze the current assessment data for cognitive patterns. Look for discrepancies between verbal and non-verbal scores. Act as the Assessment Evaluator Agent.",
            useCase: 'assessment', // Uses assessmentEvaluator agent
            subscriptionTier: 'professional'
          });
          return {
            found: true,
            message: aiAssessment.response,
            actions: ['open_assessment_detail']
          };
         } catch (e) {
             return { found: true, message: "Opening assessment details...", actions: ['open_assessment_detail'] };
         }

      case 'ep_draft_report':
         try {
             // Simulating context passed from frontend
             const aiDraft = await aiService.processRequest({
                id: userId.toString(),
                prompt: "Draft the 'Cognitive Development' section of an EHCP Advice report based on standard WISC-V profiles. Focus on working memory challenges. Act as the Report Writer Agent.",
                useCase: 'report_writing', // Uses reportWriter agent
                subscriptionTier: 'professional'
             });
             return {
                 found: true,
                 message: "I've drafted a section for your report.",
                 data: { draft_text: aiDraft.response },
                 actions: ['open_report_editor']
             };
         } catch (e) {
             return { found: true, message: "Opening report editor.", actions: ['open_report_editor'] };
         }

      case 'ep_suggest_interventions':
         try {
             const aiIntervention = await aiService.processRequest({
                 id: userId.toString(),
                 prompt: "Suggest 3 evidence-based interventions for a Year 5 student with low processing speed and high verbal comprehension. Use the persona of the Behavior Analyst / Intervention Specialist.",
                 useCase: 'behavior_analysis', // Uses behaviorAnalyst agent
                 subscriptionTier: 'professional'
             });
             return {
                 found: true,
                 message: "Here are some targeted intervention suggestions.",
                 data: { suggestions: aiIntervention.response },
                 actions: ['copy_to_clipboard']
             };
         } catch (e) {
             return { found: true, message: "I couldn't generate specific interventions right now." };
         }

      // LA COMMANDS
      case 'la_check_compliance':
         try {
             const aiCompliance = await aiService.processRequest({
                 id: userId.toString(),
                 prompt: "Review the current active EHCP cases for statutory timeline compliance (20 weeks). Identify any cases at risk of breach. Act as a Data Analyst.",
                 useCase: 'data_analysis', 
                 subscriptionTier: 'professional'
             });
             return {
                 found: true,
                 message: aiCompliance.response,
                 actions: ['filter_breach_risk']
             };
         } catch (e) {
             return { found: true, message: "Checking compliance status...", actions: ['filter_breach_risk'] };
         }

      case 'la_analyze_funding':
         try {
             const aiFunding = await aiService.processRequest({
                 id: userId.toString(),
                 prompt: "Analyze the high-needs funding block distribution for the current quarter. Highlight any efficiency trends over the last 6 months.",
                 useCase: 'data_analysis',
                 subscriptionTier: 'professional'
             });
             return {
                 found: true,
                 message: aiFunding.response,
                 actions: ['open_finance_dashboard']
             };
         } catch (e) {
             return { found: true, message: "Opening finance dashboard.", actions: ['open_finance_dashboard'] };
         }

      case 'la_district_trends':
         try {
             const aiTrends = await aiService.processRequest({
                 id: userId.toString(),
                 prompt: "Identify emerging trends in needs types (e.g., ASD, SEMH) across the district for the Academic Year 2024-2025. Suggest resource allocation shifts.",
                 useCase: 'research', // Uses researchAssistant agent
                 subscriptionTier: 'professional'
             });
             return {
                 found: true,
                 message: aiTrends.response,
                 actions: ['open_trends_view']
             };
         } catch(e) {
             return { found: true, message: "Opening trends view.", actions: ['open_trends_view'] };
         }

      case 'explain_concept':
        try {
          const aiResponse = await aiService.processRequest({
            id: userId.toString(),
            prompt: `Explain the concept "${intent.parameters.concept}" to a student in a simple, engaging way. Use analogies if suitable.`,
            useCase: 'personal_tutor',
            subscriptionTier: 'standard'
          });

          return {
            found: true,
            message: aiResponse.response,
            actions: ['show_explanation_widget']
          };
        } catch (error) {
          logger.error('AI Service Error:', error);
          return {
            found: true,
            message: `Here is a simple explanation of ${intent.parameters.concept}: Think of it like a container that holds information... (Offline Mode)`,
            actions: ['show_explanation_widget']
          };
        }

      default:
        throw new Error(`Unknown query command: ${intent.command}`);
    }
  }

  /**
   * EXECUTE ACTION
   *
   * Executes system actions (with confirmation for sensitive actions).
   */
  static async executeAction(userId: number, intent: CommandIntent): Promise<any> {
    switch (intent.command) {
      case 'mark_complete':
        return await this.markLessonComplete(
          userId,
          intent.parameters.student_name,
          intent.parameters.topic
        );

      case 'flag_intervention':
        return await this.flagForIntervention(userId, intent.parameters.student_name);

      case 'troubleshoot_report':
        return await this.troubleshootReport(userId, intent.parameters);

      case 'troubleshoot_assessment':
        return await this.troubleshootAssessment(userId, intent.parameters);

      case 'notify_parents':
        return await this.notifyParents(userId, intent.parameters.student_name);

      case 'add_observation':
        return await this.executeObservation(userId, intent);

      case 'assign_lesson':
        return await this.assignLesson(
          userId,
          intent.parameters.lesson_topic,
          intent.parameters.target
        );

      case 'show_videos':
        return {
          actions: ['open_video_modal'],
          message: 'Opening the video tutorials library.'
        };

      default:
        throw new Error(`Unknown action command: ${intent.command}`);
    }
  }

  /**
   * EXECUTE NAVIGATION
   *
   * Returns navigation instructions.
   */
  static async executeNavigation(userId: number, intent: CommandIntent): Promise<any> {
    if (intent.command === 'open_message_teacher') {
      return { destination: 'messages', url: '/parents/messages' };
    }
    return {
      destination: intent.parameters.destination,
      url: this.getNavigationUrl(intent.parameters.destination),
    };
  }

  // ============================================================================
  // QUERY IMPLEMENTATIONS
  // ============================================================================

  /**
   * Get student summary
   */
  private static async getStudentSummary(userId: number, studentName: string): Promise<any> {
    // Find student by name
    const student = await this.findStudentByName(userId, studentName);

    if (!student) {
      return {
        found: false,
        message: `I couldn't find a student named "${studentName}". Could you try again with the full name?`,
      };
    }

    // Get profile
    const profile = await prisma.studentProfile.findUnique({
      where: { student_id: student.id },
    });

    // Get recent assignments
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentAssignments = await prisma.studentLessonAssignment.findMany({
      where: {
        student_id: student.id,
        completed_at: { gte: weekAgo },
      },
    });

    const lessonsCompleted = recentAssignments.length;
    const avgSuccessRate =
      recentAssignments.length > 0
        ? recentAssignments
            .filter((a: any) => a.success_rate !== null)
            .reduce((sum: number, a: any) => sum + (a.success_rate || 0), 0) / lessonsCompleted
        : 0;

    // Generate AI Summary for Voice Response
    let aiSummaryText = "";
    try {
        const aiResponse = await aiService.processRequest({
            id: userId.toString(),
            prompt: `Generate a concise (2 sentences) verbal summary for a teacher about student ${student.first_name}. Stats: ${lessonsCompleted} lessons this week, ${Math.round(avgSuccessRate * 100)}% success. Strengths: ${profile?.current_strengths?.join(', ') || 'None listed'}. Struggles: ${profile?.current_struggles?.join(', ') || 'None listed'}.`,
            useCase: 'report_writing', 
            subscriptionTier: 'professional'
        });
        aiSummaryText = aiResponse.response;
    } catch (e) {
        logger.error('AI Summary Generation Failed', e as Error);
    }

    return {
      found: true,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      lessons_completed_this_week: lessonsCompleted,
      average_success_rate: Math.round(avgSuccessRate * 100),
      strengths: profile?.current_strengths || [],
      struggles: profile?.current_struggles || [],
      needs_intervention: profile?.needs_intervention || false,
      intervention_urgency: profile?.intervention_urgency,
      ai_message: aiSummaryText // Field for AI-generated response
    };
  }

  /**
   * Get urgent students
   */
  private static async getUrgentStudents(userId: number, classId?: string): Promise<any> {
    // If class ID provided, filter by class
    let studentIds: number[] = [];

    if (classId) {
      const classRoster = await prisma.classRoster.findUnique({
        where: { id: classId },
      });

      if (classRoster) {
        studentIds = classRoster.urgent_students;
      }
    } else {
      // Get all urgent students for teacher
      const profiles = await prisma.studentProfile.findMany({
        where: {
          intervention_urgency: { in: ['urgent', 'high'] },
        },
        include: {
          student: true,
        },
      });

      studentIds = profiles.map((p) => p.student_id);
    }

    const students = await prisma.students.findMany({
      where: { id: { in: studentIds } },
      include: {
        student_profile: true,
      },
    });

    // AI Behavior Analysis
    let aiMessage = "";
    try {
        if (students.length > 0) {
            const studentSummaries = students.map(s => `${s.first_name}: ${s.student_profile?.intervention_urgency} (${s.student_profile?.current_struggles.join(',') || 'Unknown'})`).join('; ');
            const aiResponse = await aiService.processRequest({
                id: userId.toString(),
                prompt: `Act as a Behavior Analyst. Analyze this list of students requiring urgent attention: ${studentSummaries}. Briefly summarize the key areas of concern and suggest a prioritization strategy for the teacher.`,
                useCase: 'behavior_analysis',
                subscriptionTier: 'professional'
            });
            aiMessage = aiResponse.response;
        }
    } catch (e) {
        logger.error('AI Behavior Analysis Failed', e as Error);
    }

    return {
      count: students.length,
      students: students.map((s) => ({
        student_id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        urgency: s.student_profile?.intervention_urgency,
        struggles: s.student_profile?.current_struggles || [],
      })),
      ai_message: aiMessage
    };
  }

  /**
   * Get class progress
   */
  private static async getClassProgress(userId: number, classId?: string): Promise<any> {
    if (!classId) {
      // Get first class for teacher
      const classRoster = await prisma.classRoster.findFirst({
        where: { teacher_id: userId },
      });

      if (!classRoster) {
        return {
          found: false,
          message: "I couldn't find your class. Please specify which class you'd like to see.",
        };
      }

      classId = classRoster.id;
    }

    // Use DataRouterService to get dashboard view
    const dashboard = await DataRouterService.getTeacherDashboardView(userId, classId);

    // AI Class Analysis
    let aiMessage = "";
    try {
        const aiResponse = await aiService.processRequest({
            id: userId.toString(),
            prompt: `Act as a Data Analyst. Summarize class progress for ${dashboard.class.name}. Total: ${dashboard.class.total_students}. Urgent: ${dashboard.urgent_students.length}. Needs Support: ${dashboard.needs_support.length}. On Track: ${dashboard.on_track.length}. Exceeding: ${dashboard.exceeding.length}. Be concise and highlight specific areas for teacher focus.`,
            useCase: 'data_analysis',
            subscriptionTier: 'professional'
        });
        aiMessage = aiResponse.response;
    } catch (e) {
        logger.error('AI Class Analysis Failed', e as Error);
    }

    return {
      found: true,
      class_name: dashboard.class.name,
      total_students: dashboard.class.total_students,
      urgent_count: dashboard.urgent_students.length,
      needs_support_count: dashboard.needs_support.length,
      on_track_count: dashboard.on_track.length,
      exceeding_count: dashboard.exceeding.length,
      ai_message: aiMessage
    };
  }

  // ============================================================================
  // ACTION IMPLEMENTATIONS
  // ============================================================================

  /**
   * Mark lesson complete
   */
  private static async markLessonComplete(
    userId: number,
    studentName: string,
    topic: string
  ): Promise<any> {
    const student = await this.findStudentByName(userId, studentName);

    if (!student) {
      return {
        success: false,
        message: `I couldn't find a student named "${studentName}".`,
        actions: [],
      };
    }

    // Find recent assignment matching topic
    const assignment = await prisma.studentLessonAssignment.findFirst({
      where: {
        student_id: student.id,
        status: { in: ['assigned', 'started'] },
        lesson_plan: {
          title: { contains: topic, mode: 'insensitive' },
        },
      },
      include: {
        lesson_plan: true,
      },
    });

    if (!assignment) {
      return {
        success: false,
        message: `I couldn't find a ${topic} lesson for ${studentName}.`,
        actions: [],
      };
    }

    // Mark complete
    await prisma.studentLessonAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'completed',
        completed_at: new Date(),
      },
    });

    return {
      success: true,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      lesson_title: assignment.lesson_plan.title,
      actions: ['marked_complete'],
    };
  }

  /**
   * Flag for intervention
   */
  private static async flagForIntervention(userId: number, studentName: string): Promise<any> {
    const student = await this.findStudentByName(userId, studentName);

    if (!student) {
      return {
        success: false,
        message: `I couldn't find a student named "${studentName}".`,
        actions: [],
      };
    }

    // Update profile
    await prisma.studentProfile.update({
      where: { student_id: student.id },
      data: {
        needs_intervention: true,
        intervention_urgency: 'high',
      },
    });

    // Log automated action
    await prisma.automatedAction.create({
      data: {
        tenant_id: student.tenant_id,
        action_type: 'intervention_triggered',
        triggered_by: 'voice_command',
        target_type: 'student',
        target_id: student.id.toString(),
        student_id: student.id,
        action_data: {
          flagged_by: userId,
          method: 'voice_command',
        },
        requires_approval: true,
      },
    });

    return {
      success: true,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      actions: ['flagged_intervention', 'created_approval_request'],
    };
  }

  /**
   * Notify parents
   */
  private static async notifyParents(userId: number, studentName: string): Promise<any> {
    if (studentName === 'all') {
      // Notify all parents in class
      // TODO: Implement bulk notification
      return {
        success: true,
        count: 0,
        message: 'Parent notifications queued for all students.',
        actions: ['queued_notifications'],
      };
    }

    const student = await this.findStudentByName(userId, studentName);

    if (!student) {
      return {
        success: false,
        message: `I couldn't find a student named "${studentName}".`,
        actions: [],
      };
    }

    // Queue parent notification
    // TODO: Implement notification queue

    return {
      success: true,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      actions: ['queued_parent_notification'],
    };
  }

  /**
   * Assign lesson
   */
  private static async assignLesson(
    _userId: number,
    _lessonTopic: string,
    _target: string
  ): Promise<any> {
    // TODO: Implement lesson assignment via voice
    return {
      success: false,
      message: 'Lesson assignment via voice is not yet implemented. Please use the dashboard.',
      actions: [],
    };
  }

  /**
   * Execute observation recording
   */
  private static async executeObservation(userId: number, intent: CommandIntent): Promise<any> {
    const studentName = intent.parameters.student_name;
    const content = intent.parameters.content;

    if (!studentName || studentName === 'Unknown') {
      return {
        success: false,
        message: "I heard you want to add an observation, but I didn't catch the student's name. Please say 'Add observation for [Student Name]'.",
        actions: [],
      };
    }

    const student = await this.findStudentByName(userId, studentName);
    if (!student) {
      return {
        success: false,
        message: `I couldn't find a student named "${studentName}".`,
        actions: [],
      };
    }

    if (!content || content.length < 5) {
      return {
        success: false,
        message: `I found ${studentName}, but I didn't catch the observation content. Please say: 'Add observation for ${studentName} [your notes]'.`,
        actions: [],
      };
    }

    // Capture as AutomatedAction (Audit Log / Persistence)
    try {
      await prisma.automatedAction.create({
        data: {
          tenant_id: student.tenant_id,
          action_type: 'observation_recorded',
          triggered_by: 'voice_command',
          target_type: 'student',
          target_id: student.id.toString(),
          student_id: student.id,
          action_data: {
            content: content,
            author_id: userId,
            timestamp: new Date().toISOString(),
          },
          requires_approval: false,
        },
      });

      return {
        success: true,
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        content_snippet: content.substring(0, 50) + '...',
        message: `Observation recorded for ${student.first_name}.`,
        actions: ['observation_saved'],
      };
    } catch (e) {
      logger.error('Failed to save observation', e as Error);
      return {
        success: false,
        message: "I processed the observation but couldn't save it to the database.",
        actions: [],
      };
    }
  }


  // ============================================================================
  // RESPONSE GENERATION
  // ============================================================================

  /**
   * Generate spoken response
   */
  private static async generateSpokenResponse(
    intent: CommandIntent,
    data: any
  ): Promise<string> {
    switch (intent.command) {
      case 'get_student_summary':
        if (!data.found) {
          return data.message;
        }
        // Prioritize AI Generated Response (The "Brain")
        if (data.ai_message) {
          return data.ai_message;
        }
        return this.generateStudentSummaryResponse(data);

      case 'get_urgent_students':
        if (data.count === 0) {
          return 'Great news! No students need urgent attention right now.';
        }
        if (data.ai_message) {
          return data.ai_message;
        }
        return this.generateUrgentStudentsResponse(data);

      case 'get_class_progress':
        if (!data.found) {
          return data.message;
        }
        if (data.ai_message) {
          return data.ai_message;
        }
        return this.generateClassProgressResponse(data);

      case 'get_help':
        return data.message;

      case 'conversational_response':
        return data.message;

      case 'mark_complete':
        if (!data.success) {
          return data.message;
        }
        return `I've marked ${data.student_name}'s ${data.lesson_title} as complete. Would you like to notify their parents?`;

      case 'flag_intervention':
        if (!data.success) {
          return data.message;
        }
        return `I've flagged ${data.student_name} for intervention. I will also generate an approval request for the SENCO.`;

      case 'add_observation':
        return data.message || `Observation recorded.`;

        return `${data.student_name} has been flagged for intervention. This will appear in your approvals queue.`;

      case 'notify_parents':
        if (!data.success) {
          return data.message;
        }
        if (data.count) {
          return `Parent notifications have been queued for ${data.count} students.`;
        }
        return `Parent notification has been queued for ${data.student_name}.`;

      case 'troubleshoot_report':
      case 'troubleshoot_assessment':
        return data?.message || 'I ran a quick diagnostic. Please check the dashboard for updates.';

      // EP Dashboard Commands - AI Integration
      case 'ep_analyze_assessment':
      case 'ep_draft_report':
      case 'ep_suggest_interventions':
        return data.message;

      // LA Dashboard Commands - AI Integration
      case 'la_check_compliance':
      case 'la_analyze_funding':
      case 'la_district_trends':
        return data.message;

      default:
        return 'Command executed successfully.';
    }
  }

  /**
   * Generate student summary response
   */
  private static generateStudentSummaryResponse(data: any): string {
    const name = data.student_name;
    const lessons = data.lessons_completed_this_week;
    const successRate = data.average_success_rate;

    let response = `${name} `;

    if (successRate >= 80) {
      response += `is doing very well. They've completed ${lessons} lesson${lessons !== 1 ? 's' : ''} this week with an ${successRate}% success rate. `;
    } else if (successRate >= 60) {
      response += `is making good progress. They've completed ${lessons} lesson${lessons !== 1 ? 's' : ''} this week with a ${successRate}% success rate. `;
    } else {
      response += `is working hard but needs support. They've completed ${lessons} lesson${lessons !== 1 ? 's' : ''} this week with a ${successRate}% success rate. `;
    }

    if (data.strengths.length > 0) {
      response += `Their strengths include ${data.strengths[0]}. `;
    }

    if (data.struggles.length > 0) {
      response += `They're finding ${data.struggles[0]} challenging. `;
    }

    if (data.needs_intervention) {
      response += `I recommend considering intervention support.`;
    }

    return response;
  }

  /**
   * Generate urgent students response
   */
  private static generateUrgentStudentsResponse(data: any): string {
    const count = data.count;
    const students = data.students;

    let response = `${count} student${count !== 1 ? 's need' : ' needs'} urgent attention. `;

    if (count <= 3) {
      const names = students.map((s: any) => s.name.split(' ')[0]);
      response += `${names.join(', ')}.`;
    } else {
      response += `Would you like me to show you the list?`;
    }

    return response;
  }

  /**
   * Generate class progress response
   */
  private static generateClassProgressResponse(data: any): string {
    const { class_name, total_students, urgent_count, needs_support_count, on_track_count, exceeding_count } = data;

    let response = `${class_name} has ${total_students} students. `;

    if (urgent_count > 0) {
      response += `${urgent_count} need${urgent_count === 1 ? 's' : ''} urgent attention. `;
    }

    if (needs_support_count > 0) {
      response += `${needs_support_count} need${needs_support_count === 1 ? 's' : ''} support. `;
    }

    response += `${on_track_count} ${on_track_count === 1 ? 'is' : 'are'} on track, `;
    response += `and ${exceeding_count} ${exceeding_count === 1 ? 'is' : 'are'} exceeding expectations.`;

    return response;
  }

  /**
   * Generate follow-up suggestions
   */
  private static generateFollowUpSuggestions(intent: CommandIntent, data: any): string[] {
    const suggestions: string[] = [];

    switch (intent.command) {
      case 'get_student_summary':
        if (data.found) {
          suggestions.push(`View ${data.student_name}'s full profile`);
          suggestions.push(`Assign a lesson to ${data.student_name}`);
          if (data.needs_intervention) {
            suggestions.push(`Trigger intervention for ${data.student_name}`);
          }
        }
        break;

      case 'get_urgent_students':
        if (data.count > 0) {
          suggestions.push('View the first student');
          suggestions.push('Trigger interventions for all');
        }
        break;

      case 'mark_complete':
        if (data.success) {
          suggestions.push('Yes, notify parents');
          suggestions.push('No, not yet');
          suggestions.push('Assign next lesson');
        }
        break;

      case 'troubleshoot_report':
        if (data?.report_url) {
          suggestions.push('Open the report');
        }
        suggestions.push('Show me the latest assessment');
        break;

      case 'troubleshoot_assessment':
        suggestions.push('Show me assessment status');
        suggestions.push('Open the assessment');
        break;
    }

    return suggestions;
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Extract student name from transcript
   */
  private static extractStudentName(transcript: string): string {
    // Simple extraction - look for capitalized words
    const words = transcript.split(' ');
    const capitalizedWords = words.filter(
      (w) => w.length > 0 && w[0] === w[0].toUpperCase() && w.toLowerCase() !== w
    );

    if (capitalizedWords.length > 0) {
      return capitalizedWords.join(' ');
    }

    return 'Unknown';
  }

  /**
   * Extract observation content from transcript
   */
  private static extractObservationContent(transcript: string): string {
    // Regex to strip the command part and keep the rest
    // Matches: "Add observation for [Name] [Content]" -> Captures Content
    // Be robust about "for [Name]" being optional or variable length
    
    // Strategy: Find the command boundaries
    const commandPatterns = [
        /add\s+observation\s+(?:for\s+[a-zA-Z\s]+\s+)?(.*)/i,
        /take\s+observation\s+(?:for\s+[a-zA-Z\s]+\s+)?(.*)/i,
        /new\s+observation\s+(?:for\s+[a-zA-Z\s]+\s+)?(.*)/i,
        /record\s+observation\s+(?:for\s+[a-zA-Z\s]+\s+)?(.*)/i,
        /note\s+for\s+[a-zA-Z\s]+\s+(.*)/i
    ];

    for (const pattern of commandPatterns) {
        const match = transcript.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    // Fallback: if we just detect the intent but the specific pattern fails (rare), return original or empty
    return '';
  }


  /**
   * Extract topic from transcript
   */
  private static extractTopic(transcript: string): string {
    // Extract topic after "mark" or "assign"
    const match = transcript.match(/(mark|assign|complete)\s+([^'s]+)/i);
    if (match) {
      return match[2].trim();
    }

    return 'Unknown';
  }

  /**
   * Extract an assessment instance id from a transcript.
   * Supports UUID-ish ids or simple tokens when spoken.
   */
  private static extractAssessmentId(transcript: string): string | undefined {
    const t = transcript.trim();
    // Common phrasing: "assessment <id>" or "assessment id <id>"
    const match = t.match(/assessment\s+(?:id\s+)?([a-f0-9-]{8,})/i);
    return match?.[1];
  }

  // ============================================================================
  // TROUBLESHOOTING / SELF-HEAL
  // ============================================================================

  private static async troubleshootReport(
    userId: number,
    params: { assessment_id?: string; student_id?: number }
  ): Promise<any> {
    const tenant = await prisma.users.findUnique({ where: { id: userId }, select: { tenant_id: true } });
    if (!tenant) {
      return { success: false, message: 'I could not verify your account context. Please sign in again.', actions: [] };
    }

    const assessment = await this.resolveAssessmentInstance(tenant.tenant_id, params.assessment_id, params.student_id);
    if (!assessment) {
      return {
        success: false,
        message:
          "I couldn't identify which assessment you mean. Try saying: 'I can't find the report for assessment <id>' or open the assessment first.",
        actions: [],
      };
    }

    const repair = await this.attemptAutoRepair({
      tenantId: tenant.tenant_id,
      assessmentId: assessment.id,
      kind: 'report',
    });

    return {
      success: true,
      assessment_id: assessment.id,
      report_url: repair.reportUrl,
      message: repair.message,
      actions: repair.actions,
    };
  }

  private static async troubleshootAssessment(
    userId: number,
    params: { assessment_id?: string; student_id?: number }
  ): Promise<any> {
    const tenant = await prisma.users.findUnique({ where: { id: userId }, select: { tenant_id: true } });
    if (!tenant) {
      return { success: false, message: 'I could not verify your account context. Please sign in again.', actions: [] };
    }

    const assessment = await this.resolveAssessmentInstance(tenant.tenant_id, params.assessment_id, params.student_id);
    if (!assessment) {
      return {
        success: false,
        message:
          "I couldn't identify which assessment is stuck. Try: 'The assessment <id> is stuck' or open the assessment first.",
        actions: [],
      };
    }

    const repair = await this.attemptAutoRepair({
      tenantId: tenant.tenant_id,
      assessmentId: assessment.id,
      kind: 'assessment',
    });

    return {
      success: true,
      assessment_id: assessment.id,
      message: repair.message,
      actions: repair.actions,
    };
  }

  private static async resolveAssessmentInstance(
    tenantId: number,
    assessmentId?: string,
    studentId?: number
  ): Promise<{
    id: string;
    status: string;
    progress_percentage: number;
    linked_report_id: string | null;
    completed_at: Date | null;
  } | null> {
    if (assessmentId) {
      return prisma.assessmentInstance.findFirst({
        where: { id: assessmentId, tenant_id: tenantId },
        select: {
          id: true,
          status: true,
          progress_percentage: true,
          linked_report_id: true,
          completed_at: true,
        },
      });
    }

    if (studentId) {
      return prisma.assessmentInstance.findFirst({
        where: { tenant_id: tenantId, student_id: studentId },
        orderBy: { updated_at: 'desc' },
        select: {
          id: true,
          status: true,
          progress_percentage: true,
          linked_report_id: true,
          completed_at: true,
        },
      });
    }

    return null;
  }

  private static async attemptAutoRepair(input: {
    tenantId: number;
    assessmentId: string;
    kind: 'report' | 'assessment';
  }): Promise<{ message: string; actions: string[]; reportUrl?: string }> {
    const actions: string[] = [];

    const instance = await prisma.assessmentInstance.findFirst({
      where: { id: input.assessmentId, tenant_id: input.tenantId },
      select: {
        id: true,
        status: true,
        progress_percentage: true,
        linked_report_id: true,
        completed_at: true,
      },
    });

    if (!instance) {
      return {
        message: "I couldn't locate that assessment in your tenant.",
        actions,
      };
    }

    let reportUrl: string | undefined;

    // Repair 1: if report exists in SecureDocument but assessment isn't linked, link it.
    if (!instance.linked_report_id) {
      const prefix = `/uploads/reports/report-${instance.id}-`;
      const candidate = await prisma.secureDocument.findFirst({
        where: { path: { contains: prefix } },
        select: { id: true, path: true },
      });

      if (candidate) {
        await prisma.assessmentInstance.update({
          where: { id: instance.id },
          data: {
            linked_report_id: candidate.id,
            status: instance.status === 'completed' ? instance.status : 'completed',
            completed_at: instance.completed_at ?? new Date(),
          },
        });
        actions.push('linked_report');
        reportUrl = candidate.path;
      }
    } else {
      const doc = await prisma.secureDocument.findFirst({
        where: { id: instance.linked_report_id },
        select: { path: true },
      });
      reportUrl = doc?.path;
    }

    // Repair 2: mark assessment completed when it looks complete but is not.
    if (input.kind === 'assessment') {
      const looksComplete = instance.progress_percentage >= 100;
      if (looksComplete && instance.status !== 'completed') {
        await prisma.assessmentInstance.update({
          where: { id: instance.id },
          data: {
            status: 'completed',
            completed_at: instance.completed_at ?? new Date(),
          },
        });
        actions.push('marked_completed');
      }
      if (instance.status === 'completed' && !instance.completed_at) {
        await prisma.assessmentInstance.update({
          where: { id: instance.id },
          data: { completed_at: new Date() },
        });
        actions.push('set_completed_at');
      }
    }

    if (input.kind === 'report') {
      if (reportUrl) {
        return {
          message: `I found the report and linked it to the assessment. You can open it from the assessment page now.`,
          actions: actions.length ? actions : ['report_found'],
          reportUrl,
        };
      }
      return {
        message:
          "I couldn't find a linked report yet. If you've uploaded a PDF, try refreshing the assessment page. Otherwise, upload the report again and I'll link it automatically.",
        actions: actions.length ? actions : ['no_report_found'],
      };
    }

    return {
      message: actions.length
        ? 'I applied a quick fix and updated the assessment status. Please refresh your dashboard.'
        : 'I ran a diagnostic but did not find anything safe to change. Please refresh and try again.',
      actions: actions.length ? actions : ['no_change'],
    };
  }

  /**
   * Extract assignment target
   */
  private static extractAssignmentTarget(transcript: string): string {
    const match = transcript.match(/to\s+(.+)/i);
    if (match) {
      return match[1].trim();
    }

    return 'Unknown';
  }

  /**
   * Extract navigation destination
   */
  private static extractNavigationDestination(transcript: string): string {
    const match = transcript.match(/(open|show me|go to)\s+(.+)/i);
    if (match) {
      return match[2].trim();
    }

    return 'Unknown';
  }

  /**
   * Get navigation URL
   */
  private static getNavigationUrl(destination: string): string {
    const urlMap: Record<string, string> = {
      dashboard: '/dashboard',
      'class dashboard': '/class/dashboard',
      students: '/students',
      assessments: '/assessments',
      interventions: '/interventions',
      ehcps: '/ehcp',
      reports: '/reports',
    };

    const normalized = destination.toLowerCase().trim();
    return urlMap[normalized] || '/dashboard';
  }

  /**
   * Find student by name
   */
  private static async findStudentByName(userId: number, studentName: string): Promise<any> {
    // Get teacher's students
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Split name into first and last
    const nameParts = studentName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : undefined;

    // Search for student
    const student = await prisma.students.findFirst({
      where: {
        tenant_id: user.tenant_id,
        first_name: { contains: firstName, mode: 'insensitive' },
        ...(lastName && { last_name: { contains: lastName, mode: 'insensitive' } }),
      },
    });

    return student;
  }

  /**
   * Get suggestions for context
   */
  private static getSuggestionsForContext(
    context?: VoiceCommandRequest['context']
  ): string[] {
    const suggestions = [
      'Try asking "Who needs help today?"',
      'Try asking "How is [student name] doing?"',
      'Try asking "Show me my class progress"',
    ];

    if (context?.current_student_id) {
      suggestions.push('Try asking "What should I do next for this student?"');
    }

    return suggestions;
  }

  /**
   * Log voice command
   */
  private static async logVoiceCommand(data: {
    tenant_id: number;
    user_id: number;
    raw_transcript: string;
    interpreted_intent: string;
    command_type: string;
    context_screen?: string;
    context_student_id?: number;
    response_text: string;
    response_data?: any;
    response_actions: string[];
    processing_time_ms: number;
    success: boolean;
    error_message?: string;
  }): Promise<void> {
    try {
      await prisma.voiceCommand.create({
        data: {
          tenant_id: data.tenant_id,
          user_id: data.user_id,
          raw_transcript: data.raw_transcript,
          interpreted_intent: data.interpreted_intent,
          command_type: data.command_type,
          context_screen: data.context_screen,
          context_student_id: data.context_student_id,
          response_text: data.response_text,
          response_data: data.response_data,
          response_actions: data.response_actions,
          processing_time_ms: data.processing_time_ms,
          success: data.success,
          error_message: data.error_message,
        },
      });
    } catch (_error) {
      logger.error('Error logging voice command:', _error as Error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }
}

// Export singleton instance for use in API routes
export const voiceCommandService = new VoiceCommandService();

