'use client'

/**
 * Intervention Library Component
 * Browse 535+ evidence-based interventions
 *
 * Evidence Base:
 * - What Works Clearinghouse (IES, 2023)
 * - Evidence for SEND (DfE, 2022)
 * - Sutton Trust EEF Toolkit (2023)
 * - BPS Educational Psychology Practice (2017)
 * - Rose Report (2006)
 * - National Reading Panel
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  BookOpen,
  Hand,
  Heart,
  Layers,
  MessageCircle,
  Search,
  Smile,
} from 'lucide-react';
import type { InterventionTemplate } from '@/lib/interventions/intervention-library';
import { EmptyState } from '@/components/ui/EmptyState';

// Map library intervention to component format
interface Intervention {
  id: string;
  name: string;
  category: string;
  evidence_level: string;
  description: string;
  target_population: string[];
  expected_outcomes: string[];
  implementation_difficulty: string;
  time_commitment: string;
  resources_required: string[];
  evidence_source: string;
  effect_size?: number;
  subcategory?: string;
  targeted_needs?: string[];
}

interface InterventionLibraryProps {
  onSelect?: (intervention: Intervention) => void;
  mode?: 'browse' | 'select';
  caseId?: number;
}

const ALLOWED_CATEGORY_FILTERS = new Set([
  'all',
  'favorites',
  'academic',
  'behavioural',
  'social_emotional',
  'communication',
  'sensory',
]);

export default function InterventionLibrary({
  onSelect,
  mode = 'browse',
  caseId: _caseId,
}: InterventionLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [libraryStats, setLibraryStats] = useState({
    total: 0,
    by_category: {
      academic: 0,
      behavioural: 0,
      social_emotional: 0,
      communication: 0,
      sensory: 0,
    },
    by_evidence: {
      tier_1: 0,
      tier_2: 0,
      tier_3: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load interventions and favorites on mount
  useEffect(() => {
    let mounted = true;

    const loadLibrary = async () => {
      try {
        const { INTERVENTION_LIBRARY, INTERVENTION_STATS } = await import('@/lib/interventions/intervention-library');
        if (!mounted) return;

        setLibraryStats(INTERVENTION_STATS);
        const transformed = INTERVENTION_LIBRARY.map((i: InterventionTemplate): Intervention => ({
          id: i.id,
          name: i.name,
          category: i.category,
          subcategory: i.subcategory,
          evidence_level: i.evidence_level === 'tier_1' ? 'strong' : i.evidence_level === 'tier_2' ? 'moderate' : 'emerging',
          description: i.description,
          target_population: i.targeted_needs || [],
          targeted_needs: i.targeted_needs,
          expected_outcomes: i.expected_outcomes,
          implementation_difficulty: i.complexity,
          time_commitment: `${i.session_length}, ${i.frequency}`,
          resources_required: i.resources_needed,
          evidence_source: i.research_sources.join(', '),
          effect_size: i.effect_size,
        }));

        setInterventions(transformed);
        // interventions loaded;
      } catch (error) {
        console.error('Failed to load intervention library:', error);
        setInterventions([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLibrary();

    // Load favorites from localStorage
    const stored = localStorage.getItem('intervention_favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category && ALLOWED_CATEGORY_FILTERS.has(category)) {
      setCategoryFilter(category);
    }
  }, [searchParams]);

  const toggleFavorite = (interventionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(interventionId)) {
      newFavorites.delete(interventionId);
    } else {
      newFavorites.add(interventionId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('intervention_favorites', JSON.stringify([...newFavorites]));
  };

  const filteredInterventions = interventions.filter((intervention) => {
    const matchesSearch =
      searchQuery === '' ||
      intervention.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || intervention.category === categoryFilter;

    const matchesEvidence =
      evidenceFilter === 'all' || intervention.evidence_level === evidenceFilter;

    const matchesFavorites =
      categoryFilter !== 'favorites' || favorites.has(intervention.id);

    return matchesSearch && matchesCategory && matchesEvidence && matchesFavorites;
  });

  const handleSelect = (intervention: Intervention) => {
    if (mode === 'select' && onSelect) {
      onSelect(intervention);
    } else {
      router.push(`/interventions/new?template=${intervention.id}`);
    }
  };

  const categories = [
    { value: 'all', label: `All Categories (${libraryStats.total})`, icon: Layers },
    { value: 'favorites', label: 'Favorites', icon: Heart },
    { value: 'academic', label: `Academic (${libraryStats.by_category.academic})`, icon: BookOpen },
    { value: 'behavioural', label: `Behavioural (${libraryStats.by_category.behavioural})`, icon: Activity },
    { value: 'social_emotional', label: `Social-Emotional (${libraryStats.by_category.social_emotional})`, icon: Smile },
    { value: 'communication', label: `Communication (${libraryStats.by_category.communication})`, icon: MessageCircle },
    { value: 'sensory', label: `Sensory (${libraryStats.by_category.sensory})`, icon: Hand },
  ];

  const evidenceLevels = [
    { value: 'all', label: 'All Evidence Levels' },
    { value: 'strong', label: 'Strong Evidence (Meta-analyses)' },
    { value: 'moderate', label: 'Moderate Evidence (Multiple RCTs)' },
    { value: 'emerging', label: 'Emerging Evidence (Single studies)' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Evidence-Based Intervention Library</h2>
        <p className="text-blue-100">
          {libraryStats.total}+ interventions validated by research | Effect sizes from meta-analyses
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="bg-white/20 px-2 py-1 rounded">Tier 1: {libraryStats.by_evidence.tier_1}</span>
          <span className="bg-white/20 px-2 py-1 rounded">Tier 2: {libraryStats.by_evidence.tier_2}</span>
          <span className="bg-white/20 px-2 py-1 rounded">Tier 3: {libraryStats.by_evidence.tier_3}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interventions by name, description, or target..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setCategoryFilter(category.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                categoryFilter === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
            >
              <category.icon className="mr-2 h-4 w-4" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Evidence Level Filter */}
        <div>
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Filter by Evidence Level"
          >
            {evidenceLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredInterventions.length} of {interventions.length} interventions
        </div>
      </div>

      {/* Interventions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterventions.map((intervention) => (
          <InterventionCard
            key={intervention.id}
            intervention={intervention}
            isFavorite={favorites.has(intervention.id)}
            onToggleFavorite={() => toggleFavorite(intervention.id)}
            onSelect={() => handleSelect(intervention)}
            mode={mode}
          />
        ))}
      </div>

      {filteredInterventions.length === 0 && (
        <EmptyState
          title="No interventions found"
          description="Try adjusting your search or filters."
          icon={<Search className="w-8 h-8 text-blue-500" />}
        />
      )}
    </div>
  );
}

// ============================================================================
// INTERVENTION CARD COMPONENT
// ============================================================================

interface InterventionCardProps {
  intervention: Intervention;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
  mode: 'browse' | 'select';
}

function InterventionCard({
  intervention,
  isFavorite,
  onToggleFavorite,
  onSelect,
  mode,
}: InterventionCardProps) {
  const evidenceColors = {
    strong: 'bg-green-100 text-green-800 border-green-200',
    moderate: 'bg-blue-100 text-blue-800 border-blue-200',
    emerging: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const difficultyColors = {
    low: 'text-green-600',
    moderate: 'text-yellow-600',
    high: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{intervention.name}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="ml-2 text-2xl hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={isFavorite ? 'h-6 w-6 fill-rose-500 text-rose-500' : 'h-6 w-6 text-gray-300'} />
          </button>
        </div>

        {/* Evidence Badge */}
        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${
            evidenceColors[intervention.evidence_level as keyof typeof evidenceColors]
          }`}
        >
          {intervention.evidence_level.toUpperCase()} EVIDENCE
          {intervention.effect_size && ` ES: ${intervention.effect_size}`}
        </div>

        <p className="text-gray-600 text-sm mb-4 flex-1">{intervention.description}</p>

        {/* Target Population */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-1">TARGET POPULATION</div>
          <div className="flex flex-wrap gap-1">
            {intervention.target_population.map((target, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {target}
              </span>
            ))}
          </div>
        </div>

        {/* Implementation Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{intervention.time_commitment}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`font-semibold ${
                difficultyColors[
                  intervention.implementation_difficulty as keyof typeof difficultyColors
                ]
              }`}
            >
              {intervention.implementation_difficulty} difficulty
            </span>
          </div>
        </div>

        {/* Expected Outcomes */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">EXPECTED OUTCOMES</div>
          <ul className="space-y-1">
            {intervention.expected_outcomes.slice(0, 2).map((outcome, index) => (
              <li key={index} className="flex items-start text-xs text-gray-600">
                <svg
                  className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence Source */}
        <div className="mt-3 text-xs text-gray-500 italic">Source: {intervention.evidence_source}</div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <button
          onClick={onSelect}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {mode === 'select' ? 'Select Intervention' : 'Use This Intervention'}
        </button>
      </div>
    </div>
  );
}

// NOTE: This component now uses the comprehensive intervention library from
// src/lib/interventions/intervention-library.ts which contains 109+ evidence-based
// interventions across all categories. The old hardcoded array has been removed.

