import React, { useState } from 'react';
import OnboardingProgram from './OnboardingProgram';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.ReactNode;
  isNew?: boolean;
  isFeatured?: boolean;
}

const GenericTrainingModule: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Course Curriculum</h3>
      <p className="text-gray-600 text-sm">Complete the following modules to earn your certificate.</p>
    </div>
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              {i}
            </div>
            <div>
              <div className="font-medium text-gray-900">Module {i}: {title} Fundamentals Part {i}</div>
              <div className="text-xs text-gray-500">Video • 15 mins</div>
            </div>
          </div>
          <button className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
            Start
          </button>
        </div>
      ))}
    </div>
    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
      <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
        View Full Syllabus
      </button>
    </div>
  </div>
);

const TrainingDashboard: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Training modules available in the system
  const trainingModules: TrainingModule[] = [
    {
      id: 'onboarding',
      title: 'Institutional Onboarding',
      description: 'Get your institution set up on the platform with these essential tutorials',
      icon: '🏢',
      component: <OnboardingProgram />,
      isFeatured: true
    },
    {
      id: 'admin-training',
      title: 'Administrator Training',
      description: 'Learn how to manage users, permissions, and institutional settings',
      icon: '⚙️',
      component: <GenericTrainingModule title="Administrator Training" />,
      isNew: true
    },
    {
      id: 'teacher-training',
      title: 'Teacher Training',
      description: 'Resources for classroom teachers using the platform',
      icon: '👩‍🏫',
      component: <GenericTrainingModule title="Teacher Training" />
    },
    {
      id: 'ep-training',
      title: 'Educational Psychologist Training',
      description: 'Specialized training for EPs on assessment and intervention features',
      icon: '🧠',
      component: <GenericTrainingModule title="EP Training" />
    },
    {
      id: 'researcher-training',
      title: 'Researcher Training',
      description: 'Learn how to use data collection and analysis tools',
      icon: '📊',
      component: <GenericTrainingModule title="Researcher Training" />
    },
    {
      id: 'integration-training',
      title: 'System Integration',
      description: 'Technical training for IT staff on API integration and data management',
      icon: '🔌',
      component: <GenericTrainingModule title="System Integration" />
    },
  ];

  // Get the selected module or default to the first one
  const selectedModule = 
    selectedModuleId 
      ? trainingModules.find(module => module.id === selectedModuleId)
      : trainingModules.find(module => module.isFeatured) || trainingModules[0];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Training & Onboarding Center</h1>
        <p className="text-gray-600 max-w-3xl">
          Welcome to the EdPsych Connect training center. Select a training program from the options below to get started 
          with comprehensive, role-based training materials.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Training Programs</h2>
            <div className="space-y-2">
              {trainingModules.map(module => (
                <button
                  key={module.id}
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors text-left ${
                    selectedModule?.id === module.id 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-2xl mr-3">{module.icon}</span>
                  <div>
                    <div className="font-medium">
                      {module.title}
                      {module.isNew && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {module.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Our support team is available to assist you with any questions about training programs.
              </p>
              <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Contact Support
              </button>
            </div>
          </div>
          
          {/* Training Resources */}
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Additional Resources</h2>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Training Documentation
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Video Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  FAQ & Knowledge Base
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Training Guides
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                  </svg>
                  Live Webinars
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4">
          {selectedModule ? (
            <div>
              {/* Module Header */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 p-3 rounded-lg text-3xl mr-4">
                    {selectedModule.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedModule.title}</h2>
                    <p className="text-gray-600">{selectedModule.description}</p>
                  </div>
                </div>
              </div>

              {/* Module Content */}
              {selectedModule.component}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Training Module Selected</h3>
              <p className="text-gray-600 mb-4">
                Please select a training program from the sidebar to get started.
              </p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setSelectedModuleId(trainingModules[0].id)}
              >
                Start with {trainingModules[0].title}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;