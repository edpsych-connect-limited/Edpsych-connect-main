'use client'

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Trail, Sparkles, MeshDistortMaterial, Grid } from '@react-three/drei';
import * as THREE from 'three';

// --- Types (Mirrored from main file for prop safety) ---
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

// --- Components ---

export const EnhancedArena = ({ size }: { size: number }) => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Main Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Digital Grid Effect */}
      <Grid 
        args={[size, size]} 
        cellSize={2} 
        cellThickness={1} 
        cellColor="#1e293b" 
        sectionSize={10} 
        sectionThickness={1.5} 
        sectionColor="#3b82f6" 
        fadeDistance={50} 
        infiniteGrid 
      />
      
      {/* Ambient Particles */}
      <Sparkles count={200} scale={[size, 10, size]} size={2} speed={0.2} opacity={0.3} color="#64748b" />
    </group>
  );
};

export const EnhancedStorm = ({ radius }: { radius: number }) => {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  useFrame((state) => {
    if (materialRef.current) {
      // Pulse opacity
      materialRef.current.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group>
      {/* Inner Wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[radius, radius + 0.5, 64]} />
        <meshBasicMaterial color="#a855f7" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Outer Danger Zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[radius, radius + 200, 64]} />
        <meshBasicMaterial 
          ref={materialRef}
          color="#581c87" 
          transparent 
          opacity={0.2} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Vertical Wall Effect (Visual only) */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[radius, radius, 10, 64, 1, true]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export const EnhancedPlayerMesh = ({ player }: { player: Player }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Dynamic rotation based on movement or idle
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    if (textRef.current) {
      textRef.current.lookAt(state.camera.position);
    }
  });

  const isLowHealth = player.health < 30;

  return (
    <group position={player.position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Trail width={1} length={4} color={player.color} attenuation={(t) => t * t}>
          <mesh ref={meshRef} castShadow>
            <octahedronGeometry args={[0.6, 0]} />
            {isLowHealth ? (
              <MeshDistortMaterial 
                color={player.color} 
                emissive="#ff0000"
                emissiveIntensity={0.5}
                speed={5} 
                distort={0.6} 
              />
            ) : (
              <meshStandardMaterial 
                color={player.color} 
                emissive={player.color} 
                emissiveIntensity={0.5} 
                roughness={0.2}
                metalness={0.8}
              />
            )}
          </mesh>
        </Trail>
      </Float>

      {/* Shield Effect */}
      {player.shield > 0 && (
        <mesh>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} wireframe />
        </mesh>
      )}

      {/* Name Tag & Health Bar (3D Text) */}
      <group position={[0, 1.8, 0]} ref={textRef}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {player.name}
        </Text>
        
        {/* Health Bar Background */}
        <mesh position={[0, -0.25, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
        
        {/* Health Bar Foreground */}
        <mesh position={[-(1 - player.health / 100) / 2, -0.25, 0.01]}>
          <planeGeometry args={[player.health / 100, 0.08]} />
          <meshBasicMaterial color={player.health > 50 ? "#22c55e" : "#ef4444"} />
        </mesh>
      </group>
    </group>
  );
};

export const EnhancedLootMesh = ({ loot }: { loot: Loot }) => {
  const color = loot.type === 'shield' ? '#3b82f6' : loot.type === 'health' ? '#ef4444' : '#eab308';
  const icon = loot.type === 'shield' ? '🛡️' : loot.type === 'health' ? '❤️' : '⭐';

  return (
    <group position={loot.position}>
      <Float speed={4} rotationIntensity={1} floatIntensity={1}>
        <mesh castShadow>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        
        {/* Floating Icon */}
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.5}
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {icon}
        </Text>
      </Float>
      
      <Sparkles count={10} scale={1.5} size={4} speed={0.4} opacity={0.5} color={color} />
      
      {/* Ground Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[0.3, 0.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
