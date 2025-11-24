
export type GameEventType = 'RESPONSE' | 'NAVIGATION' | 'INTERACTION' | 'IDLE';

export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  data: any;
  context: {
    gameId: string;
    sessionId: string;
    difficultyLevel: number;
  };
}

export interface AssessmentMetric {
  domainId: string; // e.g., 'ecca-domain-processing-speed'
  score: number; // 0-100 normalized score
  confidence: number; // 0-1 (how much data do we have?)
  observations: string[]; // "Consistently fast reaction times"
}

export interface AssessmentSession {
  sessionId: string;
  startTime: number;
  events: GameEvent[];
  metrics: Record<string, AssessmentMetric>;
}
