import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export type ForensicEventType = 'ehcp_export' | 'tokenisation' | 'training_release';

export interface ForensicEventPayload {
  type: ForensicEventType;
  action: string;
  tenantId?: number;
  ehcpId?: number | string;
  userId?: number | string;
  sections?: string[];
  format?: string;
  recipients?: number;
  comments?: string;
  metadata?: Record<string, any>;
  traceId?: string;
}

export interface ForensicEventRecord extends ForensicEventPayload {
  traceId: string;
  timestamp: string;
}

const FORENSIC_LOG_FILE = path.join(process.cwd(), 'logs', 'forensic-events.log');

export async function logForensicEvent(event: ForensicEventPayload): Promise<string> {
  const traceId = event.traceId ?? crypto.randomUUID();
  const record: ForensicEventRecord = {
    ...event,
    traceId,
    timestamp: new Date().toISOString(),
  };

  try {
    await fs.mkdir(path.dirname(FORENSIC_LOG_FILE), { recursive: true });
    await fs.appendFile(FORENSIC_LOG_FILE, JSON.stringify(record) + os.EOL, { encoding: 'utf-8' });
    console.debug(`[Forensic] ${record.type}:${record.action} tenant=${record.tenantId ?? 'unknown'} trace=${traceId}`);
  } catch (error) {
    console.warn('[Forensic] Failed to persist event', (error as Error).message);
  }

  return traceId;
}
