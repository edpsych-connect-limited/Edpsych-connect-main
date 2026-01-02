import { useRef, useEffect, useCallback } from 'react';

/**
 * Procedural Sound Engine using Web Audio API
 * Generates game sounds on the fly without external assets.
 */
export const useGameSounds = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize Audio Context on first user interaction (usually handled by browser policy)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.3; // Master volume
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
    if (!enabled || !audioContextRef.current || !masterGainRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    
    osc.start(audioContextRef.current.currentTime + startTime);
    osc.stop(audioContextRef.current.currentTime + startTime + duration);
  }, [enabled]);

  // --- SFX Presets ---

  const playCollect = useCallback(() => {
    initAudio();
    // Coin/Pickup sound: High pitch arpeggio
    playTone(1200, 'sine', 0.1, 0);
    playTone(1800, 'sine', 0.2, 0.1);
  }, [initAudio, playTone]);

  const playShoot = useCallback(() => {
    initAudio();
    // Laser/Shoot: Fast descending slide
    if (!audioContextRef.current || !masterGainRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioContextRef.current.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.15);
  }, [initAudio]);

  const playHit = useCallback(() => {
    initAudio();
    // Damage: Low noise/thud
    if (!audioContextRef.current || !masterGainRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContextRef.current.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.1);
  }, [initAudio]);

  const playWin = useCallback(() => {
    initAudio();
    // Victory Fanfare: Major Chord
    const now = 0;
    playTone(523.25, 'triangle', 0.4, now);       // C5
    playTone(659.25, 'triangle', 0.4, now + 0.2); // E5
    playTone(783.99, 'triangle', 0.4, now + 0.4); // G5
    playTone(1046.50, 'triangle', 0.8, now + 0.6); // C6
  }, [initAudio, playTone]);

  const playEliminated = useCallback(() => {
    initAudio();
    // Defeat: Sad descending tritone
    const now = 0;
    playTone(440, 'sawtooth', 0.5, now);
    playTone(311.13, 'sawtooth', 0.8, now + 0.4); // Eb4 (Tritone)
  }, [initAudio, playTone]);

  const playStormWarning = useCallback(() => {
    initAudio();
    // Storm Siren: Slow oscillating sine
    if (!audioContextRef.current || !masterGainRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioContextRef.current.currentTime + 1);
    osc.frequency.linearRampToValueAtTime(400, audioContextRef.current.currentTime + 2);
    
    gain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);
    
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 2);
  }, [initAudio]);

  return {
    initAudio,
    playCollect,
    playShoot,
    playHit,
    playWin,
    playEliminated,
    playStormWarning
  };
};
