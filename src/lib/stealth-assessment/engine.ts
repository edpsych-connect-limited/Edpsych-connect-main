/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

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
    } else if (timeTaken > 8000) {
      this.updateMetric('ecca-domain-processing-speed', -2, 'Extended processing time observed');
    }

    // 2. Working Memory Analysis
    // Complex questions (high difficulty) require holding more in mind
    if (difficulty >= 4 && correct) {
      this.updateMetric('ecca-domain-working-memory', 8, 'Successfully handled high-load task');
    } else if (difficulty >= 4 && !correct && timeTaken > 5000) {
       // Struggled with complex task despite time taken
       this.updateMetric('ecca-domain-working-memory', -3, 'Difficulty with high cognitive load');
    }

    // 3. Attention & Executive Function Analysis
    if (correct) {
      this.updateMetric('ecca-domain-attention-executive-function', 2, 'Maintained focus on task');
    }

    // Heuristic: Impulsivity (Fast + Incorrect)
    if (!correct && timeTaken < 1500) {
      this.updateMetric('ecca-domain-attention-executive-function', -6, 'Impulsive response detected (<1.5s)');
    }

    // Heuristic: Persistence vs. Giving Up (Long time + Incorrect)
    if (!correct && timeTaken > 10000) {
       // This might indicate they tried hard but failed (Persistence) OR they zoned out (Attention)
       // We'll flag it as a need for scaffolding rather than just a penalty
       this.updateMetric('ecca-domain-learning-memory', -2, 'Struggled to retrieve/process despite time');
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
