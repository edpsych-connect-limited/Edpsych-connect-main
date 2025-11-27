/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '../../lib/prisma';

/**
 * Types for student outcome analytics
 */
interface StudentOutcomePrediction {
  studentId: string;
  targetOutcome: string;
  probabilityScore: number;
  contributingFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  recommendedInterventions: {
    id: string;
    name: string;
    description: string;
    expectedImpact: number;
  }[];
  confidenceLevel: number;
  predictionDate: Date;
}

interface PerformanceTrend {
  metric: string;
  dataPoints: {
    date: Date;
    value: number;
  }[];
  trend: 'improving' | 'declining' | 'stable';
  percentageChange: number;
  comparisonPeriod: string;
}

interface InstitutionBenchmark {
  metric: string;
  institutionValue: number;
  benchmarkValue: number;
  percentageDifference: number;
  rank?: number;
  totalInstitutions?: number;
}

/**
 * Service for predictive analytics related to student outcomes
 */
class PredictiveAnalyticsService {
  /**
   * Generate predictions for student outcomes based on historical data and various factors
   * 
   * @param id - The institution to generate predictions for
   * @param outcomeType - The type of outcome to predict (e.g., 'academic_performance', 'attendance')
   * @param timeframe - Timeframe for the prediction in days
   * @returns Array of student outcome predictions
   */
  async generateStudentOutcomePredictions(
    id: string,
    outcomeType: string = 'academic_performance',
    _timeframe: number = 90
  ): Promise<StudentOutcomePrediction[]> {
    try {
      // Fetch real students from the institution
      // We assume 'id' is the tenant_id for now, as students are scoped by tenant
      const tenantId = parseInt(id);
      
      if (isNaN(tenantId)) {
        // If id is not a number, it might be an Institution ID (UUID)
        // We would need to find the tenant associated with this institution
        // For now, we'll return empty if not a valid tenant ID
        console.warn('Invalid tenant ID for predictions:', id);
        return [];
      }

      const students = await prisma.students.findMany({
        where: {
          tenant_id: tenantId
        },
        include: {
          student_profile: true,
          cases: {
            include: {
              assessments: true,
              interventions: true,
              assessment_instances: true
            }
          }
        }
      });

      // Prepare predictions for each student
      const predictions: StudentOutcomePrediction[] = [];

      for (const student of students) {
        // Calculate baseline metrics from assessments
        // Flatten all assessments from all cases
        const allAssessments = student.cases.flatMap(c => c.assessment_instances);
        
        // Calculate completion rate of assessments
        const completedAssessments = allAssessments.filter(a => a.status === 'completed').length;
        const totalAssessments = allAssessments.length;
        const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
        
        // Calculate intervention progress
        const allInterventions = student.cases.flatMap(c => c.interventions);
        const completedInterventions = allInterventions.filter(i => i.status === 'completed').length;
        const interventionProgress = allInterventions.length > 0 
          ? (completedInterventions / allInterventions.length) * 100 
          : 0;
        
        // Analyze engagement (using profile data as proxy since we don't have direct user link yet)
        const engagementScore = student.student_profile?.engagement_score 
          ? student.student_profile.engagement_score * 10 
          : 5; // Default to mid-range
        
        // Generate prediction based on analyzed factors
        const predictionFactors = [
          {
            factor: 'Assessment Completion',
            weight: 0.35,
            value: completionRate,
            description: `Assessment completion rate: ${completionRate.toFixed(1)}%`
          },
          {
            factor: 'Intervention Progress',
            weight: 0.25,
            value: interventionProgress,
            description: `Intervention completion rate: ${interventionProgress.toFixed(1)}%`
          },
          {
            factor: 'Engagement Level',
            weight: 0.20,
            value: engagementScore,
            description: `Engagement score: ${engagementScore.toFixed(1)}/10`
          },
          {
            factor: 'SEN Status',
            weight: 0.15,
            value: student.sen_status ? 1 : 0, // Binary factor for now
            description: `SEN Status: ${student.sen_status || 'None'}`
          }
        ];
        
        // Calculate weighted prediction score
        const predictionScore = predictionFactors.reduce(
          (score: number, factor: any) => score + (factor.value * factor.weight),
          0
        );
        
        // Convert to probability (0-1)
        const probabilityScore = Math.min(Math.max(predictionScore / 100, 0), 1);
        
        // Determine recommended interventions
        const recommendedInterventions = await this.getRecommendedInterventions(
          student.id.toString(), 
          predictionFactors, 
          outcomeType
        );
        
        // Create prediction object
        const prediction: StudentOutcomePrediction = {
          studentId: student.id.toString(),
          targetOutcome: outcomeType,
          probabilityScore,
          contributingFactors: predictionFactors.map(f => ({
            factor: f.factor,
            weight: f.weight,
            description: f.description
          })),
          recommendedInterventions,
          confidenceLevel: this.calculateConfidenceLevel(predictionFactors),
          predictionDate: new Date()
        };
        
        // Save prediction to DB
        await prisma.studentOutcomePrediction.create({
          data: {
            studentId: student.id,
            targetOutcome: outcomeType,
            probabilityScore,
            contributingFactors: predictionFactors,
            recommendedInterventions: recommendedInterventions,
            confidenceLevel: prediction.confidenceLevel,
            predictionDate: prediction.predictionDate
          }
        });

        predictions.push(prediction);
      }
      
      return predictions;
      
    } catch (error) {
      console.error('Error generating student outcome predictions:', error);
      throw new Error('Failed to generate student outcome predictions');
    }
  }
  
  /**
   * Get performance trends for an institution
   * 
   * @param id - The institution to analyze
   * @param metrics - Array of metrics to analyze
   * @param timeframe - Timeframe for trend analysis in days
   */
  async getPerformanceTrends(
    id: string,
    metrics: string[] = ['assessment_completion', 'average_score', 'intervention_progress'],
    timeframe: number = 90
  ): Promise<PerformanceTrend[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);
      
      const trends: PerformanceTrend[] = [];
      
      for (const metric of metrics) {
        let dataPoints: {date: Date, value: number}[] = [];
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        let percentageChange = 0;
        
        // Get historical data based on metric
        switch (metric) {
          case 'assessment_completion':
            dataPoints = await this.getAssessmentCompletionTrend(id, cutoffDate);
            break;
          case 'average_score':
            dataPoints = await this.getAverageScoreTrend(id, cutoffDate);
            break;
          case 'intervention_progress':
            dataPoints = await this.getInterventionProgressTrend(id, cutoffDate);
            break;
          // Add more metrics as needed
        }
        
        // Calculate trend direction and percentage change
        if (dataPoints.length >= 2) {
          const oldestValue = dataPoints[0].value;
          const newestValue = dataPoints[dataPoints.length - 1].value;
          
          percentageChange = oldestValue > 0 
            ? ((newestValue - oldestValue) / oldestValue) * 100
            : 0;
          
          if (percentageChange > 5) {
            trend = 'improving';
          } else if (percentageChange < -5) {
            trend = 'declining';
          } else {
            trend = 'stable';
          }
        }
        
        trends.push({
          metric,
          dataPoints,
          trend,
          percentageChange,
          comparisonPeriod: `Last ${timeframe} days`
        });
      }
      
      return trends;
      
    } catch (error) {
      console.error('Error getting performance trends:', error);
      throw new Error('Failed to get performance trends');
    }
  }
  
  /**
   * Get institutional benchmarks comparing to similar institutions
   * 
   * @param id - The institution to benchmark
   * @param metrics - Array of metrics for benchmarking
   */
  async getInstitutionalBenchmarks(
    id: string,
    metrics: string[] = ['assessment_completion', 'average_score', 'intervention_effectiveness']
  ): Promise<InstitutionBenchmark[]> {
    try {
      // Fetch institution data and similar institutions using raw SQL query
      // This approach works regardless of the actual model structure
      const institutionQuery = `
        SELECT
          id, name, type,
          COALESCE(student_count, 0) as student_count,
          COALESCE(teacher_count, 0) as teacher_count,
          local_authority
        FROM
          "${id.includes('school') ? 'School' : 'Institution'}"
        WHERE
          id = $1
      `;
      
      const institutionResult = await prisma.$queryRaw`${institutionQuery}::text, ${id}`;
      const institution = Array.isArray(institutionResult) && institutionResult.length > 0
        ? institutionResult[0]
        : null;
      
      if (!institution) {
        throw new Error('Institution not found');
      }
      
      // Get similar institutions based on type
      const similarInstitutionsQuery = `
        SELECT
          id, name, type,
          COALESCE(student_count, 0) as student_count,
          COALESCE(teacher_count, 0) as teacher_count
        FROM
          "${id.includes('school') ? 'School' : 'Institution'}"
        WHERE
          id != $1
          AND type = $2
          AND local_authority = $3
        LIMIT 10
      `;
      
      const similarInstitutions = await prisma.$queryRaw`
        ${similarInstitutionsQuery}::text,
        ${id},
        ${institution.type},
        ${institution.local_authority}
      `;
      
      const benchmarks: InstitutionBenchmark[] = [];
      
      for (const metric of metrics) {
        // Calculate institution's value for this metric
        const institutionValue = await this.calculateInstitutionMetric(institution, metric);
        
        // Calculate benchmark (average of similar institutions)
        // Cast the SQL result to the proper type
        const typedSimilarInstitutions = similarInstitutions as any[];
        
        const similarValues = await Promise.all(
          typedSimilarInstitutions.map(inst => this.calculateInstitutionMetric(inst, metric))
        );
        
        const benchmarkValue = similarValues.length > 0
          ? similarValues.reduce((a: number, b: number) => a + b, 0) / similarValues.length
          : 0;
        
        // Calculate percentage difference
        const percentageDifference = benchmarkValue > 0
          ? ((institutionValue - benchmarkValue) / benchmarkValue) * 100
          : 0;
        
        // Calculate rank
        const allValues = [institutionValue, ...similarValues].sort((a: number, b: number) => b - a);
        const rank = allValues.indexOf(institutionValue) + 1;
        
        benchmarks.push({
          metric,
          institutionValue,
          benchmarkValue,
          percentageDifference,
          rank,
          totalInstitutions: typedSimilarInstitutions.length + 1
        });
      }
      
      return benchmarks;
      
    } catch (error) {
      console.error('Error getting institutional benchmarks:', error);
      throw new Error('Failed to get institutional benchmarks');
    }
  }
  
  /**
   * Private helper methods
   */
  
  private calculateEngagementScore(activities: any[]): number {
    if (!activities || activities.length === 0) {
      return 0;
    }
    
    // Simple engagement scoring based on activity count and recency
    const activityCount = Math.min(activities.length, 50);
    const activityScore = activityCount / 50 * 7.5;
    
    // Recency score (higher if recent activity)
    const mostRecentActivity = activities[0]?.createdAt || new Date(0);
    const daysSinceLastActivity = Math.max(
      0, 
      (Date.now() - mostRecentActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const recencyScore = Math.max(0, 2.5 - (daysSinceLastActivity / 7) * 2.5);
    
    return Math.min(activityScore + recencyScore, 10);
  }
  
  private calculatePerformanceTrend(assessmentResults: any[]): number {
    if (!assessmentResults || assessmentResults.length < 2) {
      return 0;
    }
    
    // Calculate slope of assessment scores over time
    const scores = assessmentResults.map(result => ({
      date: result.completedAt.getTime(),
      score: result.score || 0
    }));
    
    // Sort by date
    scores.sort((a: any, b: any) => a.date - b.date);
    
    // Simple linear regression to calculate trend
    const n = scores.length;
    const sumX = scores.reduce((sum: number, point: any) => sum + point.date, 0);
    const sumY = scores.reduce((sum: number, point: any) => sum + point.score, 0);
    const sumXY = scores.reduce((sum: number, point: any) => sum + point.date * point.score, 0);
    const sumXX = scores.reduce((sum: number, point: any) => sum + point.date * point.date, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Normalize and return trend direction
    return slope * 1e9; // Scale up since timestamps are large numbers
  }
  
  private calculateConfidenceLevel(factors: any[]): number {
    // More factors with high weights = higher confidence
    const weightedFactorCount = factors.reduce(
      (sum: number, factor: any) => sum + (factor.weight * (factor.value > 0 ? 1 : 0)),
      0
    );
    
    // Scale to 0-1
    return Math.min(Math.max(weightedFactorCount * 2, 0), 1);
  }
  
  private async getRecommendedInterventions(
    studentId: string, 
    factors: any[], 
    _outcomeType: string
  ): Promise<any[]> {
    // Find interventions that address the lowest performing factors
    const weakestFactors = factors
      .filter((f: any) => f.value < 60) // Threshold 60%
      .sort((a: any, b: any) => a.value - b.value)
      .slice(0, 2);
    
    // If no weak factors, return general enrichment
    
    // Fetch intervention types from DB (using distinct on intervention_type)
    const interventionTypes = await prisma.interventions.findMany({
      distinct: ['intervention_type'],
      select: {
        intervention_type: true
      },
      take: 10
    });

    // Map types to recommendations
    let recommendations = interventionTypes.map((i, index) => ({
      id: `rec-${index}`,
      name: i.intervention_type,
      description: `Recommended intervention for ${i.intervention_type}`,
      expectedImpact: 0.7 + (Math.random() * 0.2) // Simulated impact
    }));

    // Filter based on weak factors (simple keyword matching)
    if (weakestFactors.length > 0) {
       // In a real system, we would have a mapping of factors to intervention types
       // For now, we return all available types as recommendations
    }
    
    return recommendations.slice(0, 3);
  }
  
  private async getAssessmentCompletionTrend(
    id: string,
    cutoffDate: Date
  ): Promise<{date: Date, value: number}[]> {
    // Use Prisma aggregation
    // Note: Grouping by date in Prisma is tricky without raw SQL for specific DBs
    // We'll use the existing raw SQL but update table names if needed
    // The table names in Prisma are usually PascalCase or mapped.
    // schema.prisma: model AssessmentResult { ... } -> table "AssessmentResult"
    
    // The existing raw SQL seems correct for Postgres if table names match
    
    return await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('week', "updatedAt") as week,
        COUNT(*) as count
      FROM "AssessmentInstance"
      WHERE "tenant_id" = ${parseInt(id)}
      AND "updatedAt" >= ${cutoffDate}
      GROUP BY week
      ORDER BY week ASC
    ` as any[];
  }
  
  private async getAverageScoreTrend(
    id: string,
    cutoffDate: Date
  ): Promise<{date: Date, value: number}[]> {
    // Using AssessmentOutcome for scores if available, or AssessmentResult
    // schema.prisma has AssessmentResult linked to Assessment
    
    return await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('week', "createdAt") as week,
        AVG(score) as avg_score
      FROM "AssessmentResult"
      WHERE "createdAt" >= ${cutoffDate}
      GROUP BY week
      ORDER BY week ASC
    ` as any[];
  }
  
  private async getInterventionProgressTrend(
    id: string,
    cutoffDate: Date
  ): Promise<{date: Date, value: number}[]> {
    // We don't have ProgressRecord model in schema anymore?
    // We have interventions table.
    
    return await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('week', "updated_at") as week,
        COUNT(*) as value
      FROM "interventions"
      WHERE "tenant_id" = ${parseInt(id)}
      AND "updated_at" >= ${cutoffDate}
      AND "status" = 'completed'
      GROUP BY week
      ORDER BY week ASC
    ` as any[];
  }
  
  private async calculateInstitutionMetric(institution: any, metric: string): Promise<number> {
    // Calculate various metrics for an institution
    // This would be a complex calculation based on the specific metric
    // Simplified implementation for demonstration
    
    switch (metric) {
      case 'assessment_completion':
        // e.g. average number of assessments per student
        return 8.5;
        
      case 'average_score':
        // e.g. average assessment score
        return 76.3;
        
      case 'intervention_effectiveness':
        // e.g. percentage of interventions with positive outcomes
        return 68.7;
        
      default:
        return 0;
    }
  }
}

const predictiveAnalyticsService = new PredictiveAnalyticsService();
export default predictiveAnalyticsService;