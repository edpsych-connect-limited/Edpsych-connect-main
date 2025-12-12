'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShieldAlt, FaBrain, FaClock, FaTrophy, FaGamepad, FaQuestionCircle, FaVolumeUp, FaVolumeMute, FaStar, FaFire, FaMedal } from 'react-icons/fa';
import { getStudentQuestions } from '../../app/actions/gamification';

// --- Types ---
interface Player {
  id: string;
  name: string;
  health: number;
  shield: number;
  position: THREE.Vector3;
  isSelf: boolean;
  color: string;
  score: number;
  streak: number;
}

interface Loot {
  id: string;
  position: THREE.Vector3;
  type: 'shield' | 'health' | 'xp';
}

interface GameState {
  status: 'tutorial' | 'waiting' | 'countdown' | 'active' | 'victory' | 'eliminated';
  timeLeft: number;
  stormRadius: number;
  players: Player[];
  loot: Loot[];
  currentQuestion?: Question;
  duelOpponentId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  roundNumber: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  curriculumLink?: string;
}

// Achievement system
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'wins' | 'score' | 'perfect';
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', name: 'First Blood', description: 'Win your first duel', icon: '⚔️', requirement: 1, type: 'wins' },
  { id: 'streak-3', name: 'On Fire!', description: 'Get a 3x streak', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak-5', name: 'Unstoppable!', description: 'Get a 5x streak', icon: '💥', requirement: 5, type: 'streak' },
  { id: 'streak-10', name: 'LEGENDARY!', description: 'Get a 10x streak', icon: '👑', requirement: 10, type: 'streak' },
  { id: 'score-500', name: 'Rising Star', description: 'Score 500 points', icon: '⭐', requirement: 500, type: 'score' },
  { id: 'score-1000', name: 'Champion', description: 'Score 1000 points', icon: '🏆', requirement: 1000, type: 'score' },
  { id: 'score-2000', name: 'Master', description: 'Score 2000 points', icon: '🎖️', requirement: 2000, type: 'score' },
  { id: 'perfect-round', name: 'Perfect Round', description: 'Answer 10 questions without mistakes', icon: '💎', requirement: 10, type: 'perfect' },
];

// Expanded Curriculum-aligned questions (UK Key Stage focused)
const FALLBACK_QUESTIONS: Question[] = [
  // ========== KEY STAGE 1 - EASY (Ages 5-7) ==========
  // Maths KS1
  { id: 'ks1-m1', text: 'What does 2 + 3 equal?', options: ['4', '5', '6', '7'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Addition within 10' },
  { id: 'ks1-m2', text: 'What does 5 + 2 equal?', options: ['6', '7', '8', '9'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Addition within 10' },
  { id: 'ks1-m3', text: 'What does 8 - 3 equal?', options: ['4', '5', '6', '7'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Subtraction within 10' },
  { id: 'ks1-m4', text: 'What shape has 4 equal sides?', options: ['Triangle', 'Circle', 'Square', 'Rectangle'], correctIndex: 2, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Shape recognition' },
  { id: 'ks1-m5', text: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Shape properties' },
  { id: 'ks1-m6', text: 'What comes after 9?', options: ['8', '10', '11', '7'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Number sequence' },
  
  // English KS1
  { id: 'ks1-e1', text: 'Which word rhymes with "cat"?', options: ['Dog', 'Hat', 'Cup', 'Sun'], correctIndex: 1, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Phonics and rhyming' },
  { id: 'ks1-e2', text: 'Which word rhymes with "bed"?', options: ['Red', 'Big', 'Sat', 'Cup'], correctIndex: 0, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Phonics and rhyming' },
  { id: 'ks1-e3', text: 'What letter does "apple" start with?', options: ['B', 'A', 'C', 'D'], correctIndex: 1, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Initial sounds' },
  { id: 'ks1-e4', text: 'Which is a naming word (noun)?', options: ['Run', 'Dog', 'Happy', 'Fast'], correctIndex: 1, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Word types' },
  
  // Science KS1
  { id: 'ks1-s1', text: 'What do plants need to grow?', options: ['Toys', 'Water', 'Books', 'Cars'], correctIndex: 1, points: 50, category: 'Science KS1', difficulty: 'easy', curriculumLink: 'Plant needs' },
  { id: 'ks1-s2', text: 'Which animal has feathers?', options: ['Fish', 'Dog', 'Bird', 'Cat'], correctIndex: 2, points: 50, category: 'Science KS1', difficulty: 'easy', curriculumLink: 'Animal classification' },
  { id: 'ks1-s3', text: 'What season comes after winter?', options: ['Summer', 'Autumn', 'Spring', 'Winter'], correctIndex: 2, points: 50, category: 'Science KS1', difficulty: 'easy', curriculumLink: 'Seasons' },
  
  // Art KS1
  { id: 'ks1-a1', text: 'What colour do you get mixing red and yellow?', options: ['Green', 'Purple', 'Orange', 'Blue'], correctIndex: 2, points: 50, category: 'Art KS1', difficulty: 'easy', curriculumLink: 'Primary colours' },
  { id: 'ks1-a2', text: 'What colour do you get mixing blue and yellow?', options: ['Orange', 'Green', 'Purple', 'Red'], correctIndex: 1, points: 50, category: 'Art KS1', difficulty: 'easy', curriculumLink: 'Primary colours' },
  
  // ========== KEY STAGE 2 - MEDIUM (Ages 7-11) ==========
  // Maths KS2
  { id: 'ks2-m1', text: 'What is 7 × 8?', options: ['54', '56', '48', '63'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Times tables' },
  { id: 'ks2-m2', text: 'What is 9 × 6?', options: ['45', '54', '56', '63'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Times tables' },
  { id: 'ks2-m3', text: 'What is 12 × 12?', options: ['124', '134', '144', '154'], correctIndex: 2, points: 100, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Times tables' },
  { id: 'ks2-m4', text: 'What is 1/2 + 1/4?', options: ['2/6', '3/4', '1/6', '2/4'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Fractions' },
  { id: 'ks2-m5', text: 'What is 25% of 100?', options: ['20', '25', '30', '50'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Percentages' },
  { id: 'ks2-m6', text: 'How many degrees in a right angle?', options: ['45°', '90°', '180°', '360°'], correctIndex: 1, points: 100, category: 'Maths KS2', difficulty: 'medium', curriculumLink: 'Angles' },
  
  // English KS2
  { id: 'ks2-e1', text: 'What type of word is "quickly"?', options: ['Noun', 'Verb', 'Adverb', 'Adjective'], correctIndex: 2, points: 100, category: 'English KS2', difficulty: 'medium', curriculumLink: 'Word classes' },
  { id: 'ks2-e2', text: 'What is the past tense of "run"?', options: ['Runned', 'Ran', 'Running', 'Runs'], correctIndex: 1, points: 100, category: 'English KS2', difficulty: 'medium', curriculumLink: 'Verb tenses' },
  { id: 'ks2-e3', text: 'Which punctuation ends a question?', options: ['.', '!', '?', ','], correctIndex: 2, points: 100, category: 'English KS2', difficulty: 'medium', curriculumLink: 'Punctuation' },
  { id: 'ks2-e4', text: 'What is a synonym for "happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correctIndex: 2, points: 100, category: 'English KS2', difficulty: 'medium', curriculumLink: 'Vocabulary' },
  
  // Geography KS2
  { id: 'ks2-g1', text: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctIndex: 2, points: 100, category: 'Geography KS2', difficulty: 'medium', curriculumLink: 'European capitals' },
  { id: 'ks2-g2', text: 'What is the longest river in the UK?', options: ['Thames', 'Severn', 'Mersey', 'Trent'], correctIndex: 1, points: 100, category: 'Geography KS2', difficulty: 'medium', curriculumLink: 'UK rivers' },
  { id: 'ks2-g3', text: 'Which continent is Egypt in?', options: ['Asia', 'Europe', 'Africa', 'America'], correctIndex: 2, points: 100, category: 'Geography KS2', difficulty: 'medium', curriculumLink: 'World geography' },
  
  // Science KS2
  { id: 'ks2-s1', text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctIndex: 2, points: 100, category: 'Science KS2', difficulty: 'medium', curriculumLink: 'Solar system' },
  { id: 'ks2-s2', text: 'What force pulls objects to Earth?', options: ['Magnetism', 'Friction', 'Gravity', 'Electricity'], correctIndex: 2, points: 100, category: 'Science KS2', difficulty: 'medium', curriculumLink: 'Forces' },
  { id: 'ks2-s3', text: 'What organ pumps blood around the body?', options: ['Brain', 'Lungs', 'Heart', 'Stomach'], correctIndex: 2, points: 100, category: 'Science KS2', difficulty: 'medium', curriculumLink: 'Human body' },
  { id: 'ks2-s4', text: 'What do herbivores eat?', options: ['Meat', 'Plants', 'Both', 'Neither'], correctIndex: 1, points: 100, category: 'Science KS2', difficulty: 'medium', curriculumLink: 'Food chains' },
  
  // History KS2
  { id: 'ks2-h1', text: 'Who was the first Queen Elizabeth?', options: ['Tudor', 'Stuart', 'Victorian', 'Georgian'], correctIndex: 0, points: 100, category: 'History KS2', difficulty: 'medium', curriculumLink: 'Tudor history' },
  { id: 'ks2-h2', text: 'When did World War II end?', options: ['1918', '1939', '1945', '1950'], correctIndex: 2, points: 100, category: 'History KS2', difficulty: 'medium', curriculumLink: 'World War II' },
  
  // ========== KEY STAGE 3 - HARD (Ages 11-14) ==========
  // Maths KS3
  { id: 'ks3-m1', text: 'Solve for x: 2x + 5 = 15', options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'], correctIndex: 1, points: 150, category: 'Maths KS3', difficulty: 'hard', curriculumLink: 'Linear equations' },
  { id: 'ks3-m2', text: 'What is the value of π (pi) to 2 decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctIndex: 1, points: 150, category: 'Maths KS3', difficulty: 'hard', curriculumLink: 'Pi and circles' },
  { id: 'ks3-m3', text: 'What is √144?', options: ['10', '11', '12', '13'], correctIndex: 2, points: 150, category: 'Maths KS3', difficulty: 'hard', curriculumLink: 'Square roots' },
  { id: 'ks3-m4', text: 'What is 3² + 4²?', options: ['20', '25', '49', '12'], correctIndex: 1, points: 150, category: 'Maths KS3', difficulty: 'hard', curriculumLink: 'Pythagorean theorem' },
  
  // Science KS3
  { id: 'ks3-s1', text: 'What is the chemical symbol for water?', options: ['CO2', 'H2O', 'O2', 'NaCl'], correctIndex: 1, points: 150, category: 'Science KS3', difficulty: 'hard', curriculumLink: 'Chemical formulae' },
  { id: 'ks3-s2', text: 'What is the chemical symbol for table salt?', options: ['H2O', 'CO2', 'NaCl', 'Fe'], correctIndex: 2, points: 150, category: 'Science KS3', difficulty: 'hard', curriculumLink: 'Chemical formulae' },
  { id: 'ks3-s3', text: 'What is the unit of electrical current?', options: ['Volt', 'Watt', 'Ohm', 'Ampere'], correctIndex: 3, points: 150, category: 'Science KS3', difficulty: 'hard', curriculumLink: 'Electricity' },
  { id: 'ks3-s4', text: 'What type of cell contains a nucleus?', options: ['Prokaryotic', 'Eukaryotic', 'Bacterial', 'Viral'], correctIndex: 1, points: 150, category: 'Science KS3', difficulty: 'hard', curriculumLink: 'Cell biology' },
  
  // English KS3
  { id: 'ks3-e1', text: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correctIndex: 1, points: 150, category: 'English KS3', difficulty: 'hard', curriculumLink: 'Shakespeare studies' },
  { id: 'ks3-e2', text: 'What literary device compares using "like" or "as"?', options: ['Metaphor', 'Simile', 'Alliteration', 'Personification'], correctIndex: 1, points: 150, category: 'English KS3', difficulty: 'hard', curriculumLink: 'Literary devices' },
  { id: 'ks3-e3', text: 'What is the main clause of a sentence?', options: ['The subject', 'The verb', 'The independent part', 'The conjunction'], correctIndex: 2, points: 150, category: 'English KS3', difficulty: 'hard', curriculumLink: 'Grammar' },
  
  // ========== EDUCATIONAL PSYCHOLOGY - EXPERT ==========
  { id: 'ep-1', text: 'What is the primary function of the prefrontal cortex?', options: ['Motor control', 'Executive function', 'Visual processing', 'Auditory processing'], correctIndex: 1, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Brain development' },
  { id: 'ep-2', text: 'Which neurotransmitter is primarily associated with reward?', options: ['Serotonin', 'Dopamine', 'GABA', 'Acetylcholine'], correctIndex: 1, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Neuroscience' },
  { id: 'ep-3', text: 'In Piaget\'s theory, when does the concrete operational stage occur?', options: ['0-2 years', '2-7 years', '7-11 years', '11+ years'], correctIndex: 2, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Developmental psychology' },
  { id: 'ep-4', text: 'What does "ZPD" stand for in Vygotsky\'s theory?', options: ['Zero Point Development', 'Zone of Proximal Development', 'Zone of Primary Development', 'Zero Proximal Distance'], correctIndex: 1, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Learning theories' },
  { id: 'ep-5', text: 'What is "working memory" primarily used for?', options: ['Long-term storage', 'Temporary information processing', 'Emotional regulation', 'Motor coordination'], correctIndex: 1, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Cognitive psychology' },
  { id: 'ep-6', text: 'What does ADHD stand for?', options: ['Attention Deficit Hyperactivity Disorder', 'Advanced Development Hyperactive Dysfunction', 'Attention Development Hypersensitivity Disorder', 'Active Deficit Hyper Dysfunction'], correctIndex: 0, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Neurodevelopmental conditions' },
  { id: 'ep-7', text: 'What is "scaffolding" in educational terms?', options: ['Building furniture', 'Temporary support for learning', 'Permanent assistance', 'Testing methods'], correctIndex: 1, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'Teaching strategies' },
  { id: 'ep-8', text: 'What does SEND stand for?', options: ['Special Education Needs Division', 'Special Educational Needs and Disabilities', 'Student Education Needs Department', 'Supported Education Network Development'], correctIndex: 1, points: 200, category: 'Psychology', difficulty: 'hard', curriculumLink: 'UK SEND framework' },
];

const ProgressBar = ({ width, color, className }: { width: number, color: string, className?: string }) => {
  const id = useId().replace(/:/g, ''); // Remove colons for CSS selector
  return (
    <>
      <style>{`
        #pb-${id} {
          width: ${width}%;
        }
      `}</style>
      <div id={`pb-${id}`} className={`h-full ${color} ${className || ''}`} />
    </>
  );
};

// --- 3D Components ---

const Arena = ({ size }: { size: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color="#1a1a2e" />
    <gridHelper args={[size, 20, 0x444444, 0x222222]} rotation={[-Math.PI / 2, 0, 0]} />
  </mesh>
);

const Storm = ({ radius }: { radius: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
    <ringGeometry args={[radius, radius + 100, 64]} />
    <meshBasicMaterial color="#8b5cf6" opacity={0.3} transparent side={THREE.DoubleSide} />
  </mesh>
);

const PlayerMesh = ({ player }: { player: Player }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Bobbing animation
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={player.position}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={player.color} emissive={player.color} emissiveIntensity={0.5} />
      </mesh>
      {/* Health Bar */}
      <Html position={[0, 1.5, 0]} center>
        <div className="flex flex-col items-center">
          <div className="bg-black/50 text-white text-xs px-1 rounded mb-1 whitespace-nowrap">{player.name}</div>
          <div className="w-12 h-1 bg-red-900 rounded overflow-hidden">
            <ProgressBar width={player.health} color="bg-green-500" />
          </div>
        </div>
      </Html>
    </group>
  );
};

const LootMesh = ({ loot }: { loot: Loot }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const color = loot.type === 'shield' ? '#3b82f6' : loot.type === 'health' ? '#ef4444' : '#eab308';

  return (
    <mesh ref={ref} position={loot.position} castShadow>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
};

const GameCamera = ({ playerPos }: { playerPos: THREE.Vector3 }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    // Smooth follow
    const targetPos = new THREE.Vector3(playerPos.x, playerPos.y + 15, playerPos.z + 15);
    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(playerPos);
  });

  return null;
};

// --- Main Component ---

export const BattleRoyaleGame: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    status: 'tutorial',
    timeLeft: 300,
    stormRadius: 50,
    players: [
      { id: 'self', name: 'You', health: 100, shield: 50, position: new THREE.Vector3(0, 0, 0), isSelf: true, color: '#00ff88', score: 0, streak: 0 },
      { id: 'p2', name: 'Bot Alpha', health: 100, shield: 0, position: new THREE.Vector3(10, 0, 10), isSelf: false, color: '#ff0055', score: 0, streak: 0 },
      { id: 'p3', name: 'Bot Beta', health: 100, shield: 20, position: new THREE.Vector3(-10, 0, -10), isSelf: false, color: '#00ccff', score: 0, streak: 0 },
    ],
    loot: [
      { id: 'l1', position: new THREE.Vector3(5, 0, 5), type: 'shield' },
      { id: 'l2', position: new THREE.Vector3(-5, 0, 5), type: 'xp' },
      { id: 'l3', position: new THREE.Vector3(8, 0, -8), type: 'health' },
    ],
    difficulty: 'easy',
    roundNumber: 1,
  });

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'streak'; points?: number } | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [textModeQuestion, setTextModeQuestion] = useState(0);
  const [textModeScore, setTextModeScore] = useState(0);
  const [textModeStreak, setTextModeStreak] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        // Use a default student ID for beta/demo purposes
        const studentId = 1009; 
        const fetchedQuestions = await getStudentQuestions(studentId);
        
        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions as unknown as Question[]);
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const keysPressed = useRef<Set<string>>(new Set());
  const _audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Sound effects (using Web Audio API simulation) - defined first as it's used by checkAchievements
  const playSound = useCallback((type: 'correct' | 'wrong' | 'pickup' | 'victory' | 'streak') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'correct':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
          break;
        case 'wrong':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
          break;
        case 'pickup':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05);
          break;
        case 'victory':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
          oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.45);
          break;
        case 'streak':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (_e) {
      // Audio not available
    }
  }, [soundEnabled]);
  
  // Check and unlock achievements
  const checkAchievements = useCallback((score: number, streak: number, isWin: boolean) => {
    const newUnlocks: Achievement[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      // Skip if already unlocked
      if (unlockedAchievements.find(a => a.id === achievement.id)) return;
      
      let unlocked = false;
      switch (achievement.id) {
        case 'first_win':
          unlocked = isWin && totalWins === 0;
          break;
        case 'streak_3':
          unlocked = streak >= 3;
          break;
        case 'streak_5':
          unlocked = streak >= 5;
          break;
        case 'streak_10':
          unlocked = streak >= 10;
          break;
        case 'perfect_game':
          unlocked = isWin && score >= 100;
          break;
        case 'score_500':
          unlocked = score >= 500;
          break;
        case 'wins_10':
          unlocked = totalWins >= 9 && isWin; // Will be 10 after this win
          break;
        case 'games_50':
          unlocked = totalGamesPlayed >= 49; // Will be 50 after this game
          break;
      }
      
      if (unlocked) {
        newUnlocks.push(achievement);
      }
    });
    
    if (newUnlocks.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      // Show the first new achievement
      setNewAchievement(newUnlocks[0]);
      playSound('victory');
      setTimeout(() => setNewAchievement(null), 4000);
    }
  }, [unlockedAchievements, totalWins, totalGamesPlayed, playSound]);
  
  // Update stats when game ends
  const updateStats = useCallback((score: number, streak: number, isWin: boolean) => {
    setTotalGamesPlayed(prev => prev + 1);
    if (isWin) setTotalWins(prev => prev + 1);
    if (score > highScore) setHighScore(score);
    if (streak > bestStreak) setBestStreak(streak);
    checkAchievements(score, streak, isWin);
  }, [highScore, bestStreak, checkAchievements]);

  // Get questions based on difficulty
  const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
    // If we have dynamic questions, they might be tailored to a specific difficulty.
    // If the user selects a difficulty that matches, great.
    // If the questions are dynamic (not fallback), we might want to be more flexible or strict.
    // For now, we'll assume the bridge returns questions with the correct difficulty tag.
    // However, if the bridge returns 'medium' questions and the user picks 'easy', we might want to show them anyway?
    // Let's stick to strict filtering for now, but we'll auto-select the difficulty in the UI.
    const filtered = questions.filter(q => q.difficulty === difficulty);
    
    // Fallback: If no questions match the selected difficulty, but we have questions, return them all.
    // This handles the case where a student is assigned 'at' level (medium) but clicks 'easy'.
    if (filtered.length === 0 && questions.length > 0) {
      return questions;
    }
    return filtered;
  };

  // Start game from tutorial
  const startGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    setShowTutorial(false);
    if (accessibleMode) {
      // Text-only mode
      setTextModeQuestion(0);
      setTextModeScore(0);
      setTextModeStreak(0);
      setGameState(prev => ({ ...prev, status: 'active', difficulty }));
    } else {
      // 3D mode
      setGameState(prev => ({ ...prev, status: 'countdown', difficulty }));
      setTimeout(() => setGameState(prev => ({ ...prev, status: 'active' })), 3000);
    }
  };

  // Handle accessible mode answer
  const handleAccessibleAnswer = (index: number) => {
    const questions = getQuestionsByDifficulty(gameState.difficulty);
    const currentQuestion = questions[textModeQuestion % questions.length];
    const isCorrect = index === currentQuestion.correctIndex;
    
    if (isCorrect) {
      playSound('correct');
      const newStreak = textModeStreak + 1;
      const streakBonus = newStreak >= 3 ? 50 : 0;
      const totalPoints = currentQuestion.points + streakBonus;
      setTextModeScore(prev => prev + totalPoints);
      setTextModeStreak(newStreak);
      
      if (newStreak >= 3) {
        playSound('streak');
        setFeedback({ message: `🔥 ${newStreak}x STREAK! +${totalPoints} PTS`, type: 'streak' });
      } else {
        setFeedback({ message: `CORRECT! +${totalPoints} PTS 💥`, type: 'success' });
      }
    } else {
      playSound('wrong');
      setTextModeStreak(0);
      setFeedback({ message: 'Incorrect. Keep trying! 💪', type: 'error' });
    }
    
    // Move to next question after delay
    setTimeout(() => {
      setFeedback(null);
      const nextQuestion = textModeQuestion + 1;
      if (nextQuestion >= 10) {
        // Game complete after 10 questions
        playSound('victory');
        setGameState(prev => ({ ...prev, status: 'victory' }));
      } else {
        setTextModeQuestion(nextQuestion);
      }
    }, 1500);
  };

  // Track game end and update stats
  useEffect(() => {
    if (gameState.status === 'victory') {
      const score = accessibleMode ? textModeScore : (selfPlayer?.score || 0);
      const streak = accessibleMode ? textModeStreak : (selfPlayer?.streak || 0);
      updateStats(score, streak, true);
    } else if (gameState.status === 'eliminated') {
      const score = accessibleMode ? textModeScore : (selfPlayer?.score || 0);
      const streak = accessibleMode ? textModeStreak : (selfPlayer?.streak || 0);
      updateStats(score, streak, false);
    }
  // Only run once when status changes to victory or eliminated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop (Logic only, visuals handled by R3F)
  useEffect(() => {
    if (gameState.status !== 'active') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // 1. Move Self
        const self = prev.players.find(p => p.isSelf)!;
        const newPos = self.position.clone();
        const speed = 0.5;

        if (!activeQuestion) {
          if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) newPos.z -= speed;
          if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) newPos.z += speed;
          if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) newPos.x -= speed;
          if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) newPos.x += speed;
        }

        // 2. Move Bots (Simple AI)
        const newPlayers = prev.players.map(p => {
          if (p.isSelf) return { ...p, position: newPos };
          
          // Move towards center if far, else random
          const dist = p.position.length();
          const move = new THREE.Vector3((Math.random() - 0.5), 0, (Math.random() - 0.5)).multiplyScalar(0.3);
          if (dist > prev.stormRadius * 0.8) {
            move.add(p.position.clone().negate().normalize().multiplyScalar(0.5));
          }
          return { ...p, position: p.position.clone().add(move) };
        });

        // 3. Collisions
        let currentQ = activeQuestion;
        let duelId = prev.duelOpponentId;
        const newLoot = [...prev.loot];

        // Loot pickup
        const lootIdx = newLoot.findIndex(l => l.position.distanceTo(newPos) < 1.5);
        if (lootIdx !== -1) {
          playSound('pickup');
          newLoot.splice(lootIdx, 1);
        }

        // Combat - trigger question duel
        if (!currentQ) {
          const enemy = newPlayers.find(p => !p.isSelf && p.position.distanceTo(newPos) < 2);
          if (enemy) {
            const questions = getQuestionsByDifficulty(prev.difficulty);
            currentQ = questions[Math.floor(Math.random() * questions.length)];
            duelId = enemy.id;
            setActiveQuestion(currentQ);
          }
        }

        // Check victory condition
        const aliveEnemies = newPlayers.filter(p => !p.isSelf && p.health > 0);
        if (aliveEnemies.length === 0 && prev.status === 'active') {
          playSound('victory');
          return { ...prev, status: 'victory', players: newPlayers };
        }

        // Check elimination
        const selfPlayer = newPlayers.find(p => p.isSelf);
        if (selfPlayer && selfPlayer.health <= 0) {
          return { ...prev, status: 'eliminated', players: newPlayers };
        }

        return {
          ...prev,
          players: newPlayers,
          loot: newLoot,
          duelOpponentId: duelId,
          stormRadius: Math.max(10, prev.stormRadius - 0.02),
          timeLeft: Math.max(0, prev.timeLeft - 0.05)
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState.status, activeQuestion, playSound]);

  const handleAnswer = (index: number) => {
    if (!activeQuestion) return;
    const isCorrect = index === activeQuestion.correctIndex;
    
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setGameState(prev => {
      const self = prev.players.find(p => p.isSelf)!;
      const newStreak = isCorrect ? self.streak + 1 : 0;
      const streakBonus = newStreak >= 3 ? 50 : 0;
      const totalPoints = isCorrect ? activeQuestion.points + streakBonus : 0;

      if (isCorrect && newStreak >= 3) {
        playSound('streak');
        setFeedback({ 
          message: `🔥 ${newStreak}x STREAK! +${totalPoints} PTS`, 
          type: 'streak',
          points: totalPoints
        });
      } else {
        setFeedback({ 
          message: isCorrect ? `CORRECT! +${totalPoints} PTS 💥` : 'WRONG! TOOK DAMAGE 🛡️', 
          type: isCorrect ? 'success' : 'error',
          points: isCorrect ? totalPoints : undefined
        });
      }

      const newPlayers = prev.players.map(p => {
        if (p.isSelf) {
          return {
            ...p,
            health: isCorrect ? p.health : Math.max(0, p.health - 20),
            score: p.score + totalPoints,
            streak: newStreak
          };
        }
        // Eliminate enemy on correct answer
        if (isCorrect && p.id === prev.duelOpponentId) {
          return { ...p, health: 0 };
        }
        return p;
      });

      return { ...prev, players: newPlayers, duelOpponentId: undefined };
    });

    setTimeout(() => {
      setActiveQuestion(null);
      setFeedback(null);
    }, 1500);
  };

  const selfPlayer = gameState.players.find(p => p.isSelf);

  return (
    <div className="relative w-full h-[600px] bg-black rounded-xl overflow-hidden">
      {/* Tutorial/Start Screen */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8"
          >
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <FaGamepad className="text-purple-400" />
                  Knowledge Battle Royale
                </h1>
                <p className="text-slate-300 text-lg">Test your knowledge and defeat opponents in epic brain battles!</p>
              </motion.div>

              {/* How to Play */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaQuestionCircle className="text-blue-400" />
                  How to Play
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-slate-300">
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <p><strong>Move</strong> - Use WASD or Arrow keys to navigate the arena</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <p><strong>Engage</strong> - Approach enemies to trigger a knowledge duel</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <p><strong>Answer</strong> - Answer correctly to eliminate opponents!</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <p><strong>Survive</strong> - Avoid the shrinking storm and be the last one standing!</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-yellow-300 text-sm flex items-center gap-2">
                    <FaFire className="text-orange-400" />
                    <strong>Pro Tip:</strong> Get 3+ answers in a row for streak bonuses!
                  </p>
                </div>
              </motion.div>

              {/* Accessibility Mode Toggle */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <button
                  onClick={() => setAccessibleMode(!accessibleMode)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                    accessibleMode 
                      ? 'bg-blue-600 border-blue-400 text-white' 
                      : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-blue-400'
                  }`}
                  {...{'aria-pressed': accessibleMode ? "true" : "false"}}
                  aria-label="Toggle accessible text-only mode"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold">
                    {accessibleMode ? '✓ Accessible Mode (Text-Only Quiz)' : 'Enable Accessible Mode'}
                  </span>
                </button>
                <p className="text-slate-400 text-sm text-center mt-2">
                  {accessibleMode 
                    ? 'Text-based quiz without 3D graphics. Screen reader friendly.' 
                    : 'Need a screen reader? Click to switch to text-only quiz mode.'}
                </p>
              </motion.div>

              {/* Difficulty Selection */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Choose Your Difficulty</h3>
                {isLoadingQuestions ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-300">Loading curriculum content...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {/* If we have dynamic questions, we might want to highlight the recommended difficulty */}
                    <button
                      onClick={() => startGame('easy')}
                      className={`bg-green-600 hover:bg-green-500 text-white py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 ${questions.some(q => q.difficulty === 'easy') ? 'ring-4 ring-white' : 'opacity-70'}`}
                    >
                      <FaStar className="mx-auto mb-2 text-2xl" />
                      Easy
                      <p className="text-xs font-normal mt-1 opacity-80">Key Stage 1</p>
                    </button>
                    <button
                      onClick={() => startGame('medium')}
                      className={`bg-yellow-600 hover:bg-yellow-500 text-white py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 ${questions.some(q => q.difficulty === 'medium') ? 'ring-4 ring-white' : 'opacity-70'}`}
                    >
                      <FaStar className="mx-auto mb-2 text-2xl" />
                      <FaStar className="mx-auto mb-2 text-2xl -mt-4" />
                      Medium
                      <p className="text-xs font-normal mt-1 opacity-80">Key Stage 2</p>
                    </button>
                    <button
                      onClick={() => startGame('hard')}
                      className={`bg-red-600 hover:bg-red-500 text-white py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 ${questions.some(q => q.difficulty === 'hard') ? 'ring-4 ring-white' : 'opacity-70'}`}
                    >
                      <FaMedal className="mx-auto mb-2 text-2xl text-yellow-300" />
                      Hard
                      <p className="text-xs font-normal mt-1 opacity-80">Key Stage 3+</p>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {gameState.status === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-8xl font-bold text-white"
            >
              GET READY!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessible Text-Only Quiz Mode */}
      {accessibleMode && gameState.status === 'active' && (
        <div 
          className="absolute inset-0 z-40 bg-slate-900 flex flex-col"
          role="main"
          aria-label="Accessible quiz mode"
        >
          {/* Header with score and progress */}
          <div className="bg-slate-800 p-4 border-b border-slate-700">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-white">
                  <span className="text-slate-400 text-sm">Question</span>
                  <p className="text-2xl font-bold" aria-live="polite">{textModeQuestion + 1} / 10</p>
                </div>
                <div className="text-white">
                  <span className="text-slate-400 text-sm">Score</span>
                  <p className="text-2xl font-bold text-green-400" aria-live="polite">{textModeScore} pts</p>
                </div>
                {textModeStreak >= 2 && (
                  <div className="text-orange-400 flex items-center gap-1" aria-live="polite">
                    <FaFire />
                    <span className="font-bold">{textModeStreak}x Streak!</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                  aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
                >
                  {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>
                <button
                  onClick={() => {
                    setShowTutorial(true);
                    setGameState(prev => ({ ...prev, status: 'tutorial' }));
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
                >
                  Exit Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              {(() => {
                const questions = getQuestionsByDifficulty(gameState.difficulty);
                const currentQuestion = questions[textModeQuestion % questions.length];
                return (
                  <div role="region" aria-label="Current question">
                    <div className="mb-2 flex items-center gap-2 text-slate-400">
                      <span className="bg-slate-700 px-2 py-1 rounded text-sm">{currentQuestion.category}</span>
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm">+{currentQuestion.points} pts</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6" id="question-text">
                      {currentQuestion.text}
                    </h2>
                    <div 
                      className="space-y-3"
                      role="radiogroup"
                      aria-labelledby="question-text"
                    >
                      {currentQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAccessibleAnswer(idx)}
                          disabled={feedback !== null}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center gap-4 ${
                            feedback !== null
                              ? idx === currentQuestion.correctIndex
                                ? 'bg-green-600 border-green-400 text-white'
                                : 'bg-slate-800 border-slate-600 text-slate-400'
                              : 'bg-slate-800 border-slate-600 text-white hover:border-blue-400 hover:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                          }`}
                          role="radio"
                          aria-checked="false"
                          aria-label={`Option ${String.fromCharCode(65 + idx)}: ${option}`}
                        >
                          <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-sm">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </button>
                      ))}
                    </div>
                    {currentQuestion.curriculumLink && (
                      <p className="text-sm text-slate-500 mt-4">
                        📚 Related to: {currentQuestion.curriculumLink}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Feedback Toast */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 ${
                  feedback.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : feedback.type === 'streak'
                      ? 'bg-orange-500 text-white'
                      : 'bg-red-500 text-white'
                }`}
                role="alert"
                aria-live="assertive"
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Victory Screen */}
      <AnimatePresence>
        {gameState.status === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-red-900/90 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <FaTrophy className="text-yellow-400 text-8xl mx-auto mb-4" />
              </motion.div>
              <h2 className="text-5xl font-bold text-white mb-4">VICTORY ROYALE!</h2>
              <p className="text-2xl text-yellow-300 mb-2">Final Score: {accessibleMode ? textModeScore : selfPlayer?.score || 0} pts</p>
              <p className="text-lg text-white/80 mb-8">
                {accessibleMode ? 'You completed the quiz!' : 'You eliminated all opponents!'}
              </p>
              <button
                onClick={() => {
                  setShowTutorial(true);
                  setTextModeQuestion(0);
                  setTextModeScore(0);
                  setTextModeStreak(0);
                  setGameState(prev => ({ ...prev, status: 'tutorial' }));
                }}
                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eliminated Screen */}
      <AnimatePresence>
        {gameState.status === 'eliminated' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-slate-900/90 via-red-900/90 to-slate-900/90 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <FaHeart className="text-red-500 text-8xl mx-auto mb-4 opacity-50" />
              </motion.div>
              <h2 className="text-5xl font-bold text-white mb-4">ELIMINATED</h2>
              <p className="text-2xl text-red-300 mb-2">Final Score: {accessibleMode ? textModeScore : selfPlayer?.score || 0} pts</p>
              <p className="text-lg text-white/80 mb-8">Better luck next time!</p>
              <button
                onClick={() => {
                  setShowTutorial(true);
                  setTextModeQuestion(0);
                  setTextModeScore(0);
                  setTextModeStreak(0);
                  setGameState(prev => ({ ...prev, status: 'tutorial' }));
                }}
                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-red-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 20, 20]} fov={60} />
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        <Arena size={200} />
        <Storm radius={gameState.stormRadius} />
        
        {gameState.players.filter(p => p.health > 0).map(p => (
          <PlayerMesh key={p.id} player={p} />
        ))}
        
        {gameState.loot.map(l => (
          <LootMesh key={l.id} loot={l} />
        ))}

        {selfPlayer && <GameCamera playerPos={selfPlayer.position} />}
      </Canvas>

      {/* HUD Overlay */}
      {gameState.status === 'active' && (
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none">
          <div className="flex gap-4">
            {/* Health & Shield */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-white">
              <div className="flex items-center gap-2 mb-2">
                <FaHeart className="text-red-500" />
                <div className="w-32 h-2 bg-slate-700 rounded overflow-hidden">
                  <ProgressBar width={selfPlayer?.health || 0} color="bg-gradient-to-r from-red-600 to-red-400" className="transition-all" />
                </div>
                <span className="text-xs w-8">{selfPlayer?.health || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-blue-500" />
                <div className="w-32 h-2 bg-slate-700 rounded overflow-hidden">
                  <ProgressBar width={selfPlayer?.shield || 0} color="bg-gradient-to-r from-blue-600 to-blue-400" className="transition-all" />
                </div>
                <span className="text-xs w-8">{selfPlayer?.shield || 0}</span>
              </div>
            </div>

            {/* Score & Streak */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-white">
              <div className="flex items-center gap-2 text-yellow-400">
                <FaTrophy />
                <span className="font-bold">{selfPlayer?.score || 0} pts</span>
              </div>
              {(selfPlayer?.streak || 0) >= 2 && (
                <div className="flex items-center gap-1 text-orange-400 text-sm mt-1">
                  <FaFire className="animate-pulse" />
                  <span>{selfPlayer?.streak}x streak!</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Timer & Sound Toggle */}
          <div className="flex items-start gap-2">
            <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-white flex items-center gap-3">
              <FaClock className="text-yellow-400" />
              <span className="font-mono text-xl font-bold">
                {Math.floor(gameState.timeLeft / 60)}:{(Math.floor(gameState.timeLeft) % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-slate-900/80 p-2 rounded-lg border border-slate-700 text-white hover:bg-slate-800 pointer-events-auto transition-colors"
            >
              {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
          </div>
        </div>
      )}

      {/* Players Alive Counter */}
      {gameState.status === 'active' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 text-white flex items-center gap-2">
          <span className="text-sm">Players Remaining:</span>
          <span className="font-bold text-lg">{gameState.players.filter(p => p.health > 0).length}</span>
        </div>
      )}

      {/* Question Modal */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4"
          >
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-lg w-full shadow-2xl pointer-events-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaBrain className="text-purple-400" />
                  Knowledge Duel
                </h3>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                    {activeQuestion.category}
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                    +{activeQuestion.points} PTS
                  </span>
                </div>
              </div>
              <p className="text-lg text-slate-200 mb-6">{activeQuestion.text}</p>
              <div className="grid grid-cols-1 gap-3">
                {activeQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="bg-slate-700 hover:bg-indigo-600 text-left px-4 py-3 rounded-xl transition-all font-medium border border-slate-600 hover:border-indigo-400 text-white hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="inline-block w-6 h-6 rounded-full bg-slate-600 text-center mr-3 text-sm">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
              {activeQuestion.curriculumLink && (
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  📚 Curriculum: {activeQuestion.curriculumLink}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 ${
              feedback.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : feedback.type === 'streak'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            }`}
          >
            {feedback.type === 'streak' && <FaFire className="text-yellow-300 text-2xl" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint */}
      {gameState.status === 'active' && !activeQuestion && (
        <div className="absolute bottom-4 left-4 text-white/50 text-sm font-mono pointer-events-none bg-slate-900/50 px-3 py-2 rounded-lg">
          <span className="text-white/70">Controls:</span> WASD / Arrow Keys to Move • Approach Enemies to Duel
        </div>
      )}

      {/* Achievement Popup */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-1 rounded-2xl shadow-2xl shadow-yellow-500/50">
              <div className="bg-slate-900 rounded-xl px-8 py-4 flex items-center gap-4">
                <div className="text-4xl">{newAchievement.icon}</div>
                <div>
                  <p className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Achievement Unlocked!</p>
                  <h3 className="text-white text-xl font-bold">{newAchievement.name}</h3>
                  <p className="text-slate-400 text-sm">{newAchievement.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Button */}
      {gameState.status === 'active' && (
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all pointer-events-auto"
        >
          <FaTrophy className="text-yellow-400" />
          Leaderboard
        </button>
      )}

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />
                  Leaderboard
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Current Game Rankings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">Current Match</h3>
                <div className="space-y-2">
                  {gameState.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, idx) => (
                      <div 
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.isSelf 
                            ? 'bg-indigo-600/30 border border-indigo-500' 
                            : 'bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-500 text-yellow-900' :
                            idx === 1 ? 'bg-slate-400 text-slate-900' :
                            idx === 2 ? 'bg-amber-700 text-amber-100' :
                            'bg-slate-600 text-slate-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-medium text-white">
                            {player.name} {player.isSelf && '(You)'}
                          </span>
                          {player.health <= 0 && (
                            <span className="text-red-400 text-xs">💀 Eliminated</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {player.streak >= 2 && (
                            <span className="text-orange-400 text-sm flex items-center gap-1">
                              <FaFire /> {player.streak}x
                            </span>
                          )}
                          <span className="text-yellow-400 font-bold">{player.score} pts</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Your Stats */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">Your Career Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Games Played</p>
                    <p className="text-2xl font-bold text-white">{totalGamesPlayed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Total Wins</p>
                    <p className="text-2xl font-bold text-green-400">{totalWins}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">High Score</p>
                    <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Best Streak</p>
                    <p className="text-2xl font-bold text-orange-400">{bestStreak}</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {unlockedAchievements.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <FaMedal className="text-yellow-400" />
                    Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {unlockedAchievements.map(achievement => (
                      <div 
                        key={achievement.id}
                        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg px-3 py-2 flex items-center gap-2"
                        title={achievement.description}
                      >
                        <span className="text-xl">{achievement.icon}</span>
                        <span className="text-white text-sm font-medium">{achievement.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
