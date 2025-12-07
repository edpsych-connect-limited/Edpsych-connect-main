'use client'

/**
 * Assessment Results Analysis Component
 * Task 3.2.3: Visual Analytics & Interpretation
 *
 * Features:
 * - Standard score profiles
 * - Percentile visualizations
 * - Domain comparison charts
 * - Strength/weakness analysis
 * - Discrepancy analysis
 * - Age-equivalent visualizations
 * - Confidence intervals
 * - Historical progress tracking
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreResult, DomainScore, CompositeScore } from '@/lib/assessments/scoring-engine';
import { AssessmentTemplate } from '@/lib/assessments/assessment-library';
import { ProgressBar } from '@/components/common/ProgressBar.component';

// ============================================================================
// TYPES
// ============================================================================

interface ResultsAnalysisProps {
  assessmentId: number;
  studentName: string;
  studentAge: number;
  template: AssessmentTemplate;
  scores: ScoreResult;
  assessmentDate: string;
  historicalAssessments?: Array<{
    date: string;
    scores: ScoreResult;
  }>;
}

// ============================================================================
// RESULTS ANALYSIS COMPONENT
// ============================================================================

export default function ResultsAnalysis({
  assessmentId,
  studentName,
  studentAge,
  template,
  scores,
  assessmentDate,
  historicalAssessments,
}: ResultsAnalysisProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'visual' | 'interpretation'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Student:</strong> {studentName} (Age {studentAge})</div>
                <div><strong>Assessment Date:</strong> {new Date(assessmentDate).toLocaleDateString('en-GB')}</div>
                <div><strong>Assessor:</strong> Educational Psychologist</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/assessments/${assessmentId}/report`)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Generate Report
              </button>
              <button
                onClick={() => router.push(`/assessments/${assessmentId}/edit`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Edit Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Score Overview' },
                { id: 'detailed', label: 'Detailed Analysis' },
                { id: 'visual', label: 'Visual Profile' },
                { id: 'interpretation', label: 'Clinical Interpretation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <OverviewTab
                scores={scores}
                template={template}
                studentAge={studentAge}
              />
            )}

            {/* Detailed Analysis Tab */}
            {activeTab === 'detailed' && (
              <DetailedAnalysisTab
                scores={scores}
                template={template}
              />
            )}

            {/* Visual Profile Tab */}
            {activeTab === 'visual' && (
              <VisualProfileTab
                scores={scores}
                template={template}
                historicalAssessments={historicalAssessments}
              />
            )}

            {/* Interpretation Tab */}
            {activeTab === 'interpretation' && (
              <InterpretationTab
                scores={scores}
                template={template}
                studentName={studentName}
                studentAge={studentAge}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({
  scores,
  template,
  studentAge: _studentAge,
}: {
  scores: ScoreResult;
  template: AssessmentTemplate;
  studentAge: number;
}) {
  return (
    <div className="space-y-6">
      {/* Composite Scores */}
      {scores.composite_scores.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Composite Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.composite_scores.map((composite) => (
              <CompositeScoreCard key={composite.composite_name} composite={composite} />
            ))}
          </div>
        </div>
      )}

      {/* Domain Scores */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {template.norm_referenced ? 'Standard Scores by Domain' : 'Raw Scores by Domain'}
        </h2>
        <div className="space-y-3">
          {(template.norm_referenced ? scores.standard_scores : scores.raw_scores).map((domainScore) => (
            <DomainScoreBar
              key={domainScore.domain}
              domainScore={domainScore}
              isStandardScore={template.norm_referenced}
            />
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scores.strengths.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Relative Strengths
            </h3>
            <ul className="space-y-2">
              {scores.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {scores.weaknesses.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Areas of Difficulty
            </h3>
            <ul className="space-y-2">
              {scores.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-amber-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DETAILED ANALYSIS TAB
// ============================================================================

function DetailedAnalysisTab({
  scores,
  template,
}: {
  scores: ScoreResult;
  template: AssessmentTemplate;
}) {
  return (
    <div className="space-y-6">
      {/* Score Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Score Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raw Score
                </th>
                {template.norm_referenced && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Standard Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classification
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scores.raw_scores.map((rawScore, index) => {
                const standardScore = scores.standard_scores[index];
                const percentile = scores.percentiles[index];

                return (
                  <tr key={rawScore.domain}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rawScore.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rawScore.score} / {rawScore.max_possible}
                    </td>
                    {template.norm_referenced && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {standardScore?.score || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {percentile?.score || 'N/A'}th
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getClassificationColor(standardScore?.score || 100)}`}>
                            {classifyScore(standardScore?.score || 100)}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(rawScore.percentage)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Distribution Reference */}
      {template.norm_referenced && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Score Interpretation Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-900">130+</div>
              <div className="text-blue-700">Very Superior</div>
              <div className="text-blue-600 text-xs">98th percentile+</div>
            </div>
            <div>
              <div className="font-semibold text-blue-900">120-129</div>
              <div className="text-blue-700">Superior</div>
              <div className="text-blue-600 text-xs">91st-97th percentile</div>
            </div>
            <div>
              <div className="font-semibold text-blue-900">110-119</div>
              <div className="text-blue-700">High Average</div>
              <div className="text-blue-600 text-xs">75th-90th percentile</div>
            </div>
            <div>
              <div className="font-semibold text-green-900">90-109</div>
              <div className="text-green-700">Average</div>
              <div className="text-green-600 text-xs">25th-74th percentile</div>
            </div>
            <div>
              <div className="font-semibold text-amber-900">80-89</div>
              <div className="text-amber-700">Low Average</div>
              <div className="text-amber-600 text-xs">9th-24th percentile</div>
            </div>
            <div>
              <div className="font-semibold text-red-900">70-79</div>
              <div className="text-red-700">Borderline</div>
              <div className="text-red-600 text-xs">2nd-8th percentile</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISUAL PROFILE TAB
// ============================================================================

function VisualProfileTab({
  scores,
  template,
  historicalAssessments,
}: {
  scores: ScoreResult;
  template: AssessmentTemplate;
  historicalAssessments?: Array<{ date: string; scores: ScoreResult }>;
}) {
  return (
    <div className="space-y-6">
      {/* Score Profile Chart */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {template.norm_referenced ? 'Standard Score Profile' : 'Performance Profile'}
        </h2>
        <ScoreProfileChart
          scores={template.norm_referenced ? scores.standard_scores : scores.raw_scores}
          isStandardScore={template.norm_referenced}
        />
      </div>

      {/* Percentile Rank Chart */}
      {template.norm_referenced && scores.percentiles.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Percentile Ranks</h2>
          <PercentileChart percentiles={scores.percentiles} />
        </div>
      )}

      {/* Historical Comparison */}
      {historicalAssessments && historicalAssessments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Over Time</h2>
          <ProgressChart
            current={scores}
            historical={historicalAssessments}
            isStandardScore={template.norm_referenced}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTERPRETATION TAB
// ============================================================================

function InterpretationTab({
  scores,
  template,
  studentName: _studentName,
  studentAge: _studentAge,
}: {
  scores: ScoreResult;
  template: AssessmentTemplate;
  studentName: string;
  studentAge: number;
}) {
  return (
    <div className="space-y-6">
      {/* Automated Interpretation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Interpretation</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{scores.interpretation}</p>
        </div>
      </div>

      {/* Recommendations Placeholder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h3>
        <p className="text-sm text-blue-800 mb-4">
          Based on this assessment profile, consider the following evidence-based interventions and support strategies:
        </p>
        <div className="space-y-2 text-sm text-blue-900">
          {scores.weaknesses.length > 0 && (
            <div>
              <strong>Targeted Support Areas:</strong>
              <ul className="ml-6 mt-1 space-y-1 list-disc">
                {scores.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness.replace(': Area of difficulty', '')}</li>
                ))}
              </ul>
            </div>
          )}
          {scores.strengths.length > 0 && (
            <div className="mt-3">
              <strong>Leverage Strengths:</strong>
              <ul className="ml-6 mt-1 space-y-1 list-disc">
                {scores.strengths.map((strength, index) => (
                  <li key={index}>{strength.replace(': Relative strength', '')} - Use as foundation for learning</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      {template.interpretation_guidelines.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interpretation Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {template.interpretation_guidelines.map((guideline, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function CompositeScoreCard({ composite }: { composite: CompositeScore }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{composite.composite_name}</h3>
      <div className="flex items-baseline gap-3 mb-3">
        <div className="text-4xl font-bold text-blue-600">{composite.standard_score}</div>
        <div className="text-sm text-gray-600">
          {composite.percentile}th percentile
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700 mb-2">{composite.classification}</div>
      {composite.confidence_interval_95 && (
        <div className="text-xs text-gray-600">
          95% CI: {composite.confidence_interval_95[0]}-{composite.confidence_interval_95[1]}
        </div>
      )}
    </div>
  );
}

function DomainScoreBar({ domainScore, isStandardScore }: { domainScore: DomainScore; isStandardScore: boolean }) {
  const percentage = isStandardScore
    ? ((domainScore.score - 40) / 120) * 100 // Standard scores 40-160
    : domainScore.percentage;

  const color = isStandardScore
    ? domainScore.score >= 90 && domainScore.score <= 110
      ? 'bg-green-500'
      : domainScore.score < 90
      ? 'bg-amber-500'
      : 'bg-blue-500'
    : percentage >= 70
    ? 'bg-green-500'
    : percentage >= 50
    ? 'bg-amber-500'
    : 'bg-red-500';

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">{domainScore.domain}</span>
        <span className="text-sm text-gray-600">
          {isStandardScore ? domainScore.score : `${domainScore.score}/${domainScore.max_possible}`}
        </span>
      </div>
      <ProgressBar 
        value={percentage}
        max={100}
        variant={color.includes('green') ? 'emerald' : color.includes('amber') ? 'orange' : color.includes('red') ? 'red' : 'blue'}
        className="h-3"
      />
    </div>
  );
}

function ScoreProfileChart({ scores, isStandardScore }: { scores: DomainScore[]; isStandardScore: boolean }) {
  const maxScore = isStandardScore ? 160 : 100;
  const minScore = isStandardScore ? 40 : 0;
  const range = maxScore - minScore;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="relative h-[400px]">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
          <span>{maxScore}</span>
          {isStandardScore && <span>100</span>}
          <span>{minScore}</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-0">
          {/* Average line */}
          {isStandardScore && (
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-gray-400 top-1/2">
              <span className="absolute -top-2 right-0 text-xs text-gray-600">Average (100)</span>
            </div>
          )}

          {/* Score bars */}
          <div className="flex items-end justify-around h-full pb-6">
            {scores.map((score) => {
              const height = ((score.score - minScore) / range) * 100;
              return (
                <div key={score.domain} className="flex flex-col items-center w-[12%]">
                  <div className="relative flex-1 w-full flex items-end justify-center">
                    {/* eslint-disable-next-line */}
                    <div
                      className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors flex items-start justify-center pt-2"
                      style={{ height: `${height}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{score.score}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">{score.domain.substring(0, 10)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PercentileChart({ percentiles }: { percentiles: DomainScore[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {percentiles.map((percentile) => (
        <div key={percentile.domain} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{percentile.score}</div>
          <div className="text-xs text-gray-600 mb-2">percentile</div>
          <div className="text-sm font-medium text-gray-900">{percentile.domain}</div>
        </div>
      ))}
    </div>
  );
}

function ProgressChart({
  current: _current,
  historical: _historical,
  isStandardScore,
}: {
  current: ScoreResult;
  historical: Array<{ date: string; scores: ScoreResult }>;
  isStandardScore: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <p className="text-sm text-gray-600 mb-4">
        Progress tracking shows change over time. {isStandardScore ? 'Standard scores' : 'Raw scores'} are compared.
      </p>
      <div className="text-center text-gray-500 py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="mt-2 text-sm">Progress chart visualization - requires charting library integration</p>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function classifyScore(standardScore: number): string {
  if (standardScore >= 130) return 'Very Superior';
  if (standardScore >= 120) return 'Superior';
  if (standardScore >= 110) return 'High Average';
  if (standardScore >= 90) return 'Average';
  if (standardScore >= 80) return 'Low Average';
  if (standardScore >= 70) return 'Borderline';
  return 'Extremely Low';
}

function getClassificationColor(standardScore: number): string {
  if (standardScore >= 120) return 'bg-blue-100 text-blue-800';
  if (standardScore >= 110) return 'bg-green-100 text-green-800';
  if (standardScore >= 90) return 'bg-gray-100 text-gray-800';
  if (standardScore >= 80) return 'bg-yellow-100 text-yellow-800';
  if (standardScore >= 70) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}
