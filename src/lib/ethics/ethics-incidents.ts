import { prisma } from '@/lib/prisma';

export type EthicsIncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export async function createEthicsIncident(params: {
  title: string;
  description: string;
  severity?: EthicsIncidentSeverity;
  metricId?: string;
  metricValue?: number;
  thresholdValue?: number;
  tags?: string[];
}) {
  const {
    title,
    description,
    severity = 'high',
    metricId,
    metricValue,
    thresholdValue,
    tags = []
  } = params;

  return prisma.ethicsIncident.create({
    data: {
      title,
      description,
      severity,
      metricId,
      metricValue,
      thresholdValue,
      status: 'open',
      resolutionSteps: [],
      tags
    }
  });
}
