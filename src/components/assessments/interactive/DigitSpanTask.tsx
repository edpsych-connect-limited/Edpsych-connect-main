'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, RotateCcw, CheckCircle2, XCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitSpanProps {
  mode?: 'forward' | 'backward';
  onComplete?: (result: { span: number; maxSpan: number; rawData: any[] }) => void;
}

export default function DigitSpanTask({ mode = 'forward', onComplete }: DigitSpanProps) {
  const [gameState, setGameState] = useState<'idle' | 'presenting' | 'input' | 'feedback' | 'finished'>('idle');
  const [currentSpan, setCurrentSpan] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentDigitIndex, setCurrentDigitIndex] = useState(-1);
  const [_score, setScore] = useState(0);
  const [trials, setTrials] = useState(0);
  const [errorsInSpan, setErrorsInSpan] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  const generateSequence = useCallback((length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  }, []);

  const startTrial = useCallback(() => {
    const newSeq = generateSequence(currentSpan);
    setSequence(newSeq);
    setGameState('presenting');
    setCurrentDigitIndex(-1);
    setUserInput('');
  }, [currentSpan, generateSequence]);

  // Presentation logic
  useEffect(() => {
    if (gameState === 'presenting') {
      let index = -1;
      const interval = setInterval(() => {
        index++;
        if (index < sequence.length) {
          setCurrentDigitIndex(index);
        } else {
          clearInterval(interval);
          setGameState('input');
          setCurrentDigitIndex(-1);
        }
      }, 1000); // 1 second per digit
      return () => clearInterval(interval);
    }
  }, [gameState, sequence]);

  const handleSubmit = () => {
    const target = mode === 'backward' ? [...sequence].reverse().join('') : sequence.join('');
    const isCorrect = userInput === target;

    const trialResult = {
      span: currentSpan,
      sequence: sequence,
      input: userInput,
      correct: isCorrect,
      mode
    };

    setHistory(prev => [...prev, trialResult]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setErrorsInSpan(0);
      if (trials % 2 === 1) { // Increase span every 2 correct trials (simplified)
         setCurrentSpan(prev => prev + 1);
      }
      setGameState('feedback');
    } else {
      setErrorsInSpan(prev => prev + 1);
      if (errorsInSpan >= 1) { // 2 fails at same span = stop
        setGameState('finished');
        if (onComplete) onComplete({ span: currentSpan - 1, maxSpan: currentSpan - 1, rawData: history });
      } else {
        setGameState('feedback');
      }
    }
    setTrials(prev => prev + 1);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-slate-200 shadow-lg">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle>Digit Span ({mode === 'forward' ? 'Forward' : 'Backward'})</CardTitle>
              <CardDescription>Working Memory Assessment</CardDescription>
            </div>
          </div>
          <div className="text-sm font-mono bg-white px-3 py-1 rounded border border-slate-200">
            Current Span: {currentSpan}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 min-h-[400px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Ready to Start?</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  You will see a sequence of numbers appear one by one. 
                  {mode === 'forward' 
                    ? ' Remember them and type them in the SAME order.' 
                    : ' Remember them and type them in REVERSE order.'}
                </p>
              </div>
              <Button onClick={startTrial} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Play className="w-4 h-4 mr-2" /> Start Assessment
              </Button>
            </motion.div>
          )}

          {gameState === 'presenting' && (
            <motion.div 
              key="presenting"
              className="flex items-center justify-center"
            >
              <div className="text-9xl font-bold text-slate-900 font-mono">
                {currentDigitIndex >= 0 && currentDigitIndex < sequence.length ? sequence[currentDigitIndex] : ''}
              </div>
            </motion.div>
          )}

          {gameState === 'input' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs space-y-6 text-center"
            >
              <h3 className="text-lg font-medium text-slate-700">Enter the sequence</h3>
              <Input 
                type="text" 
                pattern="[0-9]*" 
                inputMode="numeric"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center text-3xl tracking-widest h-16 font-mono"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button onClick={handleSubmit} className="w-full" disabled={!userInput}>
                Submit Answer
              </Button>
            </motion.div>
          )}

          {gameState === 'feedback' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              {history[history.length - 1]?.correct ? (
                <div className="flex flex-col items-center text-green-600 gap-2">
                  <CheckCircle2 className="w-16 h-16" />
                  <span className="text-xl font-bold">Correct!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-red-600 gap-2">
                  <XCircle className="w-16 h-16" />
                  <span className="text-xl font-bold">Incorrect</span>
                  <p className="text-slate-600 text-sm">
                    Sequence was: {sequence.join(' ')}
                  </p>
                </div>
              )}
              <Button onClick={startTrial} variant="outline" className="mt-4">
                Next Trial <Play className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-medium text-slate-600 mb-2">Assessment Complete</h3>
                <div className="text-5xl font-bold text-indigo-600 mb-1">{currentSpan - 1}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Max Digit Span</div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => {
                  setGameState('idle');
                  setCurrentSpan(3);
                  setHistory([]);
                  setErrorsInSpan(0);
                }} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" /> Restart
                </Button>
                <Button className="bg-indigo-600">
                  Save Results
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
