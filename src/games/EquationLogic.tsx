import React, { useState, useEffect } from 'react';
import { LevelData } from '../lib/levelGenerator';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

export function EquationLogic({ levelData, onWin, onLose }: { levelData: LevelData, onWin: () => void, onLose: () => void }) {
  const [equation, setEquation] = useState<string>('');
  const [options, setOptions] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'revealing'>('playing');

  useEffect(() => {
    let a, b, answer;
    const maxNumber = Math.min(20 + levelData.difficulty * 2, 100);
    const ops = ['+', '-'];
    if (levelData.difficulty > 20) ops.push('*');
    if (levelData.difficulty > 40) ops.push('//'); 
    
    const op = levelData.prng.pick(ops);
    
    if (op === '+') {
      a = levelData.prng.nextInt(1, maxNumber);
      b = levelData.prng.nextInt(1, maxNumber);
      answer = a + b;
    } else if (op === '-') {
      answer = levelData.prng.nextInt(1, maxNumber);
      b = levelData.prng.nextInt(1, maxNumber);
      a = answer + b; 
    } else if (op === '*') {
      a = levelData.prng.nextInt(2, Math.floor(maxNumber / 4));
      b = levelData.prng.nextInt(2, 12);
      answer = a * b;
    } else { // div
      b = levelData.prng.nextInt(2, 12);
      answer = levelData.prng.nextInt(2, Math.floor(maxNumber / 4));
      a = answer * b;
    }

    const missingPos = levelData.prng.nextInt(0, 2); 
    let eqStr = '';
    let missingVal = 0;
    
    const displayOp = op === '//' ? '/' : op;

    if (missingPos === 0) {
      eqStr = `? ${displayOp} ${b} = ${answer}`;
      missingVal = a;
    } else if (missingPos === 1) {
      eqStr = `${a} ${displayOp} ? = ${answer}`;
      missingVal = b;
    } else {
      eqStr = `${a} ${displayOp} ${b} = ?`;
      missingVal = answer;
    }

    setEquation(eqStr);
    setCorrectAnswer(missingVal);

    // Generate options
    const opts = new Set<number>();
    opts.add(missingVal);
    while(opts.size < 4) {
      const offset = levelData.prng.nextInt(-5, 5);
      const fake = missingVal + offset;
      if (fake >= 0 && !opts.has(fake) && fake !== missingVal) {
        opts.add(fake);
      } else {
         opts.add(levelData.prng.nextInt(1, missingVal + 10));
      }
    }
    
    // Shuffle options
    const optsArr = Array.from(opts);
    for (let i = optsArr.length - 1; i > 0; i--) {
        const j = levelData.prng.nextInt(0, i);
        [optsArr[i], optsArr[j]] = [optsArr[j], optsArr[i]];
    }
    setOptions(optsArr);

  }, [levelData]);

  const handleOptionClick = (idx: number, opt: number) => {
    if (gameState !== 'playing') return;
    
    setSelectedIdx(idx);
    setGameState('revealing');
    
    if (opt === correctAnswer) {
      setTimeout(() => onWin(), 1000);
    } else {
      setTimeout(() => onLose(), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-brutal-white">
      <div className="mb-12 text-center w-full">
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-2">Equation Matrix</h2>
        <div className="font-sans font-bold uppercase text-xs tracking-widest bg-brutal-black text-brutal-white px-2 py-1 inline-block">
          FIND THE MISSING VARIABLE
        </div>
      </div>

      <div className="brutal-border brutal-shadow bg-neon-cyan px-8 py-10 rounded-none mb-12 w-full max-w-sm text-center">
        <div className="text-5xl font-display tracking-tighter text-brutal-black">
          {equation}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((opt, i) => {
          const isSelected = selectedIdx === i;
          const isCorrect = opt === correctAnswer;
          
          let btnClass = 'bg-brutal-white text-brutal-black brutal-border brutal-shadow brutal-shadow-active';
          let icon = null;

          if (gameState === 'revealing') {
            if (isCorrect) {
              btnClass = 'bg-neon-green text-brutal-black brutal-border brutal-shadow';
              if (isSelected) icon = <Check className="absolute right-4 w-6 h-6" strokeWidth={3} />;
            } else if (isSelected) {
              btnClass = 'bg-neon-pink text-brutal-black brutal-border brutal-shadow';
              icon = <X className="absolute right-4 w-6 h-6" strokeWidth={3} />;
            } else {
              btnClass = 'bg-brutal-white text-brutal-black opacity-50 brutal-border';
            }
          }

          return (
             <motion.button
              key={i}
              whileTap={gameState === 'playing' ? { scale: 0.95 } : undefined}
              onClick={() => handleOptionClick(i, opt)}
              className={`relative flex items-center justify-center py-6 text-3xl font-display uppercase tracking-widest transition-none ${btnClass}`}
            >
              {icon}
              <span className="mt-1">{opt}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
}
