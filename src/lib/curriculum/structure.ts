import { Blocks, FileCode, Code } from 'lucide-react';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface LearningTrack {
  id: string;
  title: string;
  description: string;
  icon: any; // LucideIcon
  color: string;
  difficulty: Difficulty;
  modules: LearningModule[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  project?: Project;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'quiz' | 'challenge';
  duration: number; // minutes
  xp: number;
  content: {
    videoUrl?: string;
    markdown?: string;
    starterCode?: string;
    solutionCode?: string;
    hints?: string[];
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  requirements: string[];
  starterTemplate: string;
}

export const CURRICULUM_TRACKS: LearningTrack[] = [
  {
    id: 'creative-coding',
    title: 'Creative Coding with Blocks',
    description: 'Start your journey by creating art, music, and games using visual blocks.',
    icon: Blocks,
    color: 'amber',
    difficulty: 'Beginner',
    modules: [
      {
        id: 'module-1',
        title: 'Digital Storytelling',
        description: 'Create your first animated story.',
        lessons: [
          {
            id: 'l1-1',
            title: 'Meet the Stage',
            type: 'video',
            duration: 5,
            xp: 50,
            content: { videoUrl: 'intro-stage' }
          },
          {
            id: 'l1-2',
            title: 'Making Characters Move',
            type: 'interactive',
            duration: 10,
            xp: 100,
            content: { starterCode: 'move(10)' }
          }
        ]
      }
    ]
  },
  {
    id: 'python-mastery',
    title: 'Python Game Development',
    description: 'Build real games while learning the language used by NASA and Google.',
    icon: FileCode,
    color: 'blue',
    difficulty: 'Intermediate',
    modules: []
  },
  {
    id: 'web-wizardry',
    title: 'Web App Builder',
    description: 'Create professional websites and apps using React and TypeScript.',
    icon: Code,
    color: 'purple',
    difficulty: 'Advanced',
    modules: []
  }
];
