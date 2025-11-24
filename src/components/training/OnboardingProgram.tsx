import React, { useState, useEffect } from 'react';
import TutorialCard from './TutorialCard';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  format: 'video' | 'interactive' | 'guide';
  thumbnailUrl?: string;
  completed?: boolean;
  progress?: number; // 0-100
  tags: string[];
  url: string;
  featured?: boolean;
}

interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tutorials: Tutorial[];
}

const OnboardingProgram: React.FC = () => {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  // In a real implementation, we would fetch this data from an API
  useEffect(() => {
    // Mock data for demonstration
    const mockCategories: TrainingCategory[] = [
      {
        id: 'institutional-management',
        name: 'Institutional Management',
        description: 'Learn how to manage your institution, departments, and staff',
        icon: 'building',
        tutorials: [
          {
            id: 'inst-101',
            title: 'Getting Started with Institutional Management',
            description: 'Learn the basics of managing your institution on the platform',
            category: 'beginner',
            duration: 15,
            format: 'video',
            thumbnailUrl: '/assets/training/inst-101.jpg',
            tags: ['basics', 'setup', 'dashboard'],
            url: '/training/institutional-management/getting-started',
            featured: true,
          },
          {
            id: 'dept-management',
            title: 'Department Management',
            description: 'Create, edit, and organize departments within your institution',
            category: 'beginner',
            duration: 12,
            format: 'interactive',
            thumbnailUrl: '/assets/training/dept-mgmt.jpg',
            tags: ['departments', 'organization', 'structure'],
            url: '/training/institutional-management/department-management',
          },
          {
            id: 'advanced-reporting',
            title: 'Advanced Institutional Reporting',
            description: 'Generate and analyze in-depth reports about your institution',
            category: 'advanced',
            duration: 25,
            format: 'guide',
            thumbnailUrl: '/assets/training/adv-reporting.jpg',
            tags: ['reports', 'analytics', 'performance'],
            url: '/training/institutional-management/advanced-reporting',
          },
        ]
      },
      {
        id: 'assessment-engine',
        name: 'Assessment Engine',
        description: 'Create and administer assessments for your students',
        icon: 'clipboard-check',
        tutorials: [
          {
            id: 'assess-101',
            title: 'Assessment Creation Basics',
            description: 'Learn how to create different types of assessments',
            category: 'beginner',
            duration: 20,
            format: 'interactive',
            thumbnailUrl: '/assets/training/assess-101.jpg',
            tags: ['assessment', 'creation', 'types'],
            url: '/training/assessment-engine/creation-basics',
            featured: true,
          },
          {
            id: 'question-types',
            title: 'Working with Question Types',
            description: 'Explore all available question types and their best uses',
            category: 'intermediate',
            duration: 18,
            format: 'guide',
            thumbnailUrl: '/assets/training/question-types.jpg',
            tags: ['questions', 'formats', 'options'],
            url: '/training/assessment-engine/question-types',
          },
          {
            id: 'results-analysis',
            title: 'Assessment Results Analysis',
            description: 'Interpret and utilize assessment results effectively',
            category: 'advanced',
            duration: 30,
            format: 'video',
            thumbnailUrl: '/assets/training/results-analysis.jpg',
            tags: ['results', 'data', 'interpretation'],
            url: '/training/assessment-engine/results-analysis',
          },
        ]
      },
      {
        id: 'intervention-framework',
        name: 'Intervention Framework',
        description: 'Design and implement interventions based on assessment results',
        icon: 'chart-line',
        tutorials: [
          {
            id: 'interv-101',
            title: 'Intervention Framework Introduction',
            description: 'Understand the basics of the intervention framework',
            category: 'beginner',
            duration: 15,
            format: 'video',
            thumbnailUrl: '/assets/training/interv-101.jpg',
            tags: ['introduction', 'basics', 'overview'],
            url: '/training/intervention-framework/introduction',
          },
          {
            id: 'planning-interventions',
            title: 'Planning Effective Interventions',
            description: 'Learn how to plan targeted interventions based on needs',
            category: 'intermediate',
            duration: 22,
            format: 'interactive',
            thumbnailUrl: '/assets/training/planning-interventions.jpg',
            tags: ['planning', 'strategy', 'customization'],
            url: '/training/intervention-framework/planning',
            featured: true,
          },
        ]
      },
      {
        id: 'content-management',
        name: 'Content Management',
        description: 'Organize and share educational resources within your institution',
        icon: 'folder-open',
        tutorials: [
          {
            id: 'content-basics',
            title: 'Content Management Basics',
            description: 'Learn how to upload, organize, and share content',
            category: 'beginner',
            duration: 10,
            format: 'guide',
            thumbnailUrl: '/assets/training/content-basics.jpg',
            tags: ['upload', 'organize', 'share'],
            url: '/training/content-management/basics',
          },
          {
            id: 'tagging-categorization',
            title: 'Tagging and Categorization',
            description: 'Effectively categorize content for easy discovery',
            category: 'intermediate',
            duration: 15,
            format: 'interactive',
            thumbnailUrl: '/assets/training/tagging-categorization.jpg',
            tags: ['tags', 'categories', 'organization'],
            url: '/training/content-management/tagging',
          },
        ]
      },
      {
        id: 'professional-networking',
        name: 'Professional Networking',
        description: 'Connect with other education professionals and join communities',
        icon: 'users',
        tutorials: [
          {
            id: 'networking-101',
            title: 'Professional Networking Introduction',
            description: 'Learn how to connect with other professionals on the platform',
            category: 'beginner',
            duration: 12,
            format: 'video',
            thumbnailUrl: '/assets/training/networking-101.jpg',
            tags: ['networking', 'connections', 'profile'],
            url: '/training/professional-networking/introduction',
            featured: true,
          },
          {
            id: 'groups-communities',
            title: 'Joining and Creating Groups',
            description: 'Discover how to participate in and create professional communities',
            category: 'intermediate',
            duration: 18,
            format: 'guide',
            thumbnailUrl: '/assets/training/groups-communities.jpg',
            tags: ['groups', 'communities', 'collaboration'],
            url: '/training/professional-networking/groups',
          },
        ]
      }
    ];

    setCategories(mockCategories);
    
    // Default to showing all tutorials initially
    const allTutorials = mockCategories.flatMap(cat => cat.tutorials);
    setFilteredTutorials(allTutorials);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  // Filter tutorials based on search, category, level, and format
  useEffect(() => {
    let results: Tutorial[] = [];
    
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      results = category?.tutorials || [];
    } else {
      results = categories.flatMap(cat => cat.tutorials);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(tutorial => 
        tutorial.title.toLowerCase().includes(query) ||
        tutorial.description.toLowerCase().includes(query) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply level filter
    if (levelFilter.length > 0) {
      results = results.filter(tutorial => 
        levelFilter.includes(tutorial.category)
      );
    }
    
    // Apply format filter
    if (formatFilter.length > 0) {
      results = results.filter(tutorial => 
        formatFilter.includes(tutorial.format)
      );
    }
    
    setFilteredTutorials(results);
  }, [selectedCategory, searchQuery, levelFilter, formatFilter, categories]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleLevelFilterChange = (level: string) => {
    setLevelFilter(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const handleFormatFilterChange = (format: string) => {
    setFormatFilter(prev => {
      if (prev.includes(format)) {
        return prev.filter(f => f !== format);
      } else {
        return [...prev, format];
      }
    });
  };

  const handleTutorialComplete = (tutorialId: string) => {
    if (!completedTutorials.includes(tutorialId)) {
      setCompletedTutorials(prev => [...prev, tutorialId]);
    }
  };

  const calculateProgress = () => {
    if (categories.length === 0) return 0;
    
    const allTutorials = categories.flatMap(cat => cat.tutorials);
    if (allTutorials.length === 0) return 0;
    
    return Math.round((completedTutorials.length / allTutorials.length) * 100);
  };

  // Find featured tutorials
  const featuredTutorials = categories.flatMap(cat => 
    cat.tutorials.filter(tutorial => tutorial.featured)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Onboarding & Training Programs</h1>
        <p className="text-gray-600">Welcome to your personalized training dashboard. Complete these programs to master the platform.</p>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-blue-800">Your Onboarding Progress</h2>
          <span className="text-sm font-medium text-blue-700">{calculateProgress()}% Complete</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${calculateProgress()}%` }} // eslint-disable-line
          ></div>
        </div>
        <div className="mt-2 text-sm text-blue-700">
          {completedTutorials.length} of {categories.flatMap(cat => cat.tutorials).length} tutorials completed
        </div>
      </div>

      {/* Featured Tutorials Section */}
      {featuredTutorials.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTutorials.map(tutorial => (
              <TutorialCard 
                key={tutorial.id}
                tutorial={{
                  ...tutorial,
                  completed: completedTutorials.includes(tutorial.id)
                }}
                onComplete={() => handleTutorialComplete(tutorial.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-2/3">
            <input
              type="text"
              placeholder="Search for tutorials..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/3 flex gap-2">
            <button 
              className={`flex-1 px-4 py-2 rounded-md border ${
                levelFilter.length === 0 
                  ? 'bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-700'
              }`}
              onClick={() => setLevelFilter([])}
            >
              All Levels
            </button>
            <button 
              className={`flex-1 px-4 py-2 rounded-md border ${
                selectedCategory === null 
                  ? 'bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-700'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center mr-2">Level:</span>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              levelFilter.includes('beginner')
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800'
            }`}
            onClick={() => handleLevelFilterChange('beginner')}
          >
            Beginner
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              levelFilter.includes('intermediate')
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800'
            }`}
            onClick={() => handleLevelFilterChange('intermediate')}
          >
            Intermediate
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              levelFilter.includes('advanced')
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800'
            }`}
            onClick={() => handleLevelFilterChange('advanced')}
          >
            Advanced
          </button>
          
          <span className="text-sm font-medium text-gray-700 self-center ml-4 mr-2">Format:</span>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              formatFilter.includes('video')
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-800'
            }`}
            onClick={() => handleFormatFilterChange('video')}
          >
            Video
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              formatFilter.includes('interactive')
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}
            onClick={() => handleFormatFilterChange('interactive')}
          >
            Interactive
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              formatFilter.includes('guide')
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-800'
            }`}
            onClick={() => handleFormatFilterChange('guide')}
          >
            Guide
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex flex-col items-center p-4 rounded-lg border ${
              selectedCategory === category.id 
                ? 'bg-blue-50 border-blue-300' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              selectedCategory === category.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {/* This would normally be an actual icon */}
              <span className="text-lg">{category.icon === 'building' && '🏢'}
              {category.icon === 'clipboard-check' && '📋'}
              {category.icon === 'chart-line' && '📈'}
              {category.icon === 'folder-open' && '📁'}
              {category.icon === 'users' && '👥'}</span>
            </div>
            <span className="text-sm font-medium text-center">{category.name}</span>
            <span className="text-xs text-gray-500 text-center mt-1">
              {category.tutorials.length} tutorials
            </span>
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map(tutorial => (
            <TutorialCard 
              key={tutorial.id}
              tutorial={{
                ...tutorial,
                completed: completedTutorials.includes(tutorial.id)
              }}
              onComplete={() => handleTutorialComplete(tutorial.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No tutorials match your search criteria.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setSearchQuery('');
              setLevelFilter([]);
              setFormatFilter([]);
              setSelectedCategory(null);
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgram;