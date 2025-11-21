import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShieldAlt, FaBrain, FaClock } from 'react-icons/fa';

// --- Types ---
interface Player {
  id: string;
  name: string;
  health: number;
  shield: number;
  position: THREE.Vector3;
  isSelf: boolean;
  color: string;
}

interface Loot {
  id: string;
  position: THREE.Vector3;
  type: 'shield' | 'health' | 'xp';
}

interface GameState {
  status: 'waiting' | 'countdown' | 'active' | 'victory' | 'eliminated';
  timeLeft: number;
  stormRadius: number;
  players: Player[];
  loot: Loot[];
  currentQuestion?: Question;
  duelOpponentId?: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
}

const MOCK_QUESTIONS: Question[] = [
  { id: '1', text: 'What is the primary function of the prefrontal cortex?', options: ['Motor control', 'Executive function', 'Visual processing', 'Auditory processing'], correctIndex: 1, points: 100 },
  { id: '2', text: 'Which neurotransmitter is primarily associated with reward?', options: ['Serotonin', 'Dopamine', 'GABA', 'Acetylcholine'], correctIndex: 1, points: 150 },
  { id: '3', text: 'When does the concrete operational stage occur?', options: ['0-2 years', '2-7 years', '7-11 years', '11+ years'], correctIndex: 2, points: 200 }
];

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
            <div className="h-full bg-green-500" style={{ width: `${player.health}%` }} />
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
    status: 'waiting',
    timeLeft: 300,
    stormRadius: 50,
    players: [
      { id: 'self', name: 'You', health: 100, shield: 50, position: new THREE.Vector3(0, 0, 0), isSelf: true, color: '#00ff88' },
      { id: 'p2', name: 'Bot 1', health: 100, shield: 0, position: new THREE.Vector3(10, 0, 10), isSelf: false, color: '#ff0055' },
      { id: 'p3', name: 'Bot 2', health: 100, shield: 20, position: new THREE.Vector3(-10, 0, -10), isSelf: false, color: '#00ccff' },
    ],
    loot: [
      { id: 'l1', position: new THREE.Vector3(5, 0, 5), type: 'shield' },
      { id: 'l2', position: new THREE.Vector3(-5, 0, 5), type: 'xp' },
    ]
  });

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());

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
    if (gameState.status === 'waiting') setTimeout(() => setGameState(p => ({ ...p, status: 'active' })), 2000);
    if (gameState.status !== 'active') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // 1. Move Self
        const self = prev.players.find(p => p.isSelf)!;
        const newPos = self.position.clone();
        const speed = 0.5;

        if (!activeQuestion) {
          if (keysPressed.current.has('w')) newPos.z -= speed;
          if (keysPressed.current.has('s')) newPos.z += speed;
          if (keysPressed.current.has('a')) newPos.x -= speed;
          if (keysPressed.current.has('d')) newPos.x += speed;
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
        let newLoot = [...prev.loot];

        // Loot
        const lootIdx = newLoot.findIndex(l => l.position.distanceTo(newPos) < 1.5);
        if (lootIdx !== -1) newLoot.splice(lootIdx, 1);

        // Combat
        if (!currentQ) {
          const enemy = newPlayers.find(p => !p.isSelf && p.position.distanceTo(newPos) < 2);
          if (enemy) {
            currentQ = MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)];
            duelId = enemy.id;
            setActiveQuestion(currentQ);
          }
        }

        return {
          ...prev,
          players: newPlayers,
          loot: newLoot,
          duelOpponentId: duelId,
          stormRadius: Math.max(10, prev.stormRadius - 0.05),
          timeLeft: Math.max(0, prev.timeLeft - 0.05)
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState.status, activeQuestion]);

  const handleAnswer = (index: number) => {
    if (!activeQuestion) return;
    const isCorrect = index === activeQuestion.correctIndex;
    
    setFeedback({ 
      message: isCorrect ? 'CRITICAL HIT! 💥' : 'MISS! TOOK DAMAGE 🛡️', 
      type: isCorrect ? 'success' : 'error' 
    });

    setGameState(prev => {
      const newPlayers = isCorrect && prev.duelOpponentId 
        ? prev.players.filter(p => p.id !== prev.duelOpponentId) // Eliminate enemy
        : prev.players.map(p => p.isSelf && !isCorrect ? { ...p, health: p.health - 20 } : p); // Take damage

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
      {/* 3D Scene */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 20, 20]} fov={60} />
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        <Arena size={200} />
        <Storm radius={gameState.stormRadius} />
        
        {gameState.players.map(p => (
          <PlayerMesh key={p.id} player={p} />
        ))}
        
        {gameState.loot.map(l => (
          <LootMesh key={l.id} loot={l} />
        ))}

        {selfPlayer && <GameCamera playerPos={selfPlayer.position} />}
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none">
        <div className="flex gap-4">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700 text-white">
            <div className="flex items-center gap-2 mb-1">
              <FaHeart className="text-red-500" />
              <div className="w-32 h-2 bg-slate-700 rounded">
                <div className="h-full bg-red-500 transition-all" style={{ width: `${selfPlayer?.health}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-blue-500" />
              <div className="w-32 h-2 bg-slate-700 rounded">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${selfPlayer?.shield}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-white flex items-center gap-3">
          <FaClock className="text-yellow-400" />
          <span className="font-mono text-xl font-bold">
            {Math.floor(gameState.timeLeft / 60)}:{(Math.floor(gameState.timeLeft) % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

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
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                  +{activeQuestion.points} PTS
                </span>
              </div>
              <p className="text-lg text-slate-200 mb-6">{activeQuestion.text}</p>
              <div className="grid grid-cols-1 gap-3">
                {activeQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="bg-slate-700 hover:bg-blue-600 text-left px-4 py-3 rounded-xl transition-colors font-medium border border-slate-600 hover:border-blue-400 text-white"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-bold text-lg shadow-lg ${
              feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint */}
      {!activeQuestion && (
        <div className="absolute bottom-4 left-4 text-white/50 text-sm font-mono pointer-events-none">
          WASD to Move • Approach Enemies to Duel
        </div>
      )}
    </div>
  );
};
