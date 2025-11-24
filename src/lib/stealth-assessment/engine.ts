import { GameEvent, AssessmentSession } from './types';
import { eccaFramework } from '@/lib/assessments/frameworks/ecca-framework';

export class StealthAssessmentEngine {
  private session: AssessmentSession;

  constructor(sessionId: string) {
    this.session = {
      sessionId,
      startTime: Date.now(),
      events: [],
      metrics: {}
    };
    
    // Initialize metrics for all ECCA domains
    eccaFramework.domains.forEach(domain => {
      this.session.metrics[domain.id] = {
        domainId: domain.id,
        score: 50, // Start neutral
        confidence: 0,
        observations: []
      };
    });
  }

  public processEvent(event: GameEvent): AssessmentSession {
    this.session.events.push(event);
    
    // Analyze based on event type
    if (event.type === 'RESPONSE') {
      this.analyzeResponse(event);
    } else if (event.type === 'INTERACTION') {
      this.analyzeInteraction(event);
    }

    return this.session;
  }

  private analyzeResponse(event: GameEvent) {
    const { correct, timeTaken, difficulty } = event.data;
    
    // 1. Processing Speed Analysis
    // Fast correct answers boost processing speed
    if (correct && timeTaken < 2000) {
      this.updateMetric('ecca-domain-processing-speed', 5, 'Rapid accurate response detected');
    } else if (timeTaken > 5000) {
      this.updateMetric('ecca-domain-processing-speed', -2, 'Extended processing time observed');
    }

    // 2. Working Memory Analysis
    // Complex questions (high difficulty) require holding more in mind
    if (difficulty > 3 && correct) {
      this.updateMetric('ecca-domain-working-memory', 10, 'Successfully handled high-load task');
    }

    // 3. Attention Analysis
    // Consistent performance implies sustained attention
    // (This is a simple heuristic; real engine would look at variance)
    if (correct) {
      this.updateMetric('ecca-domain-attention-executive-function', 2, 'Maintained focus on task');
    }
  }

  private analyzeInteraction(event: GameEvent) {
    // e.g., Mouse jitter, rapid clicking (impulsivity)
    if (event.data.action === 'rapid_clicks') {
      this.updateMetric('ecca-domain-attention-executive-function', -5, 'Signs of impulsive responding');
    }
  }

  private updateMetric(domainId: string, scoreDelta: number, observation: string) {
    const metric = this.session.metrics[domainId];
    if (!metric) return;

    // Update score (clamped 0-100)
    metric.score = Math.max(0, Math.min(100, metric.score + scoreDelta));
    
    // Increase confidence
    metric.confidence = Math.min(1, metric.confidence + 0.05);

    // Add observation if unique
    if (!metric.observations.includes(observation)) {
      metric.observations.push(observation);
      // Keep only last 5 observations
      if (metric.observations.length > 5) metric.observations.shift();
    }
  }

  public getSession(): AssessmentSession {
    return this.session;
  }
}
