import React, { useState, useEffect } from 'react';
import { LevelData } from '../lib/levelGenerator';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

export function IQSequence({ levelData, onWin, onLose }: { levelData: LevelData, onWin: () => void, onLose: () => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'revealing'>('playing');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  useEffect(() => {
    const { prng, difficulty } = levelData;
    
    // Pick sequence type based on difficulty
    // 0: Arithmetic (+N)
    // 1: Geometric (*N)
    // 2: Fibonacci style (A + B)
    // 3: Alternating (+N, -M)
    
    let typeMax = 0;
    if (difficulty > 10) typeMax = 1;
    if (difficulty > 25) typeMax = 2;
    if (difficulty > 45) typeMax = 3;
    
    const seqType = prng.nextInt(0, typeMax);
    
    let seq: number[] = [];
    let answer = 0;
    
    if (seqType === 0) {
      const start = prng.nextInt(1, 20);
      const step = prng.nextInt(2, 15);
      seq = [start, start + step, start + step*2, start + step*3, start + step*4];
      answer = start + step*5;
    } else if (seqType === 1) {
      const start = prng.nextInt(1, 5);
      const mult = prng.nextInt(2, 4);
      seq = [start, start*mult, start*Math.pow(mult,2), start*Math.pow(mult,3)];
      answer = start*Math.pow(mult,4);
    } else if (seqType === 2) {
      const start1 = prng.nextInt(1, 4);
      const start2 = prng.nextInt(1, 4);
      seq = [start1, start2, start1+start2, start1+start2*2, start1*2+start2*3];
      answer = (start1+start2*2) + (start1*2+start2*3);
    } else {
      const start = prng.nextInt(20, 50);
      const stepUp = prng.nextInt(5, 15);
      const stepDown = prng.nextInt(2, 8);
      seq = [start, start+stepUp, start+stepUp-stepDown, start+stepUp*2-stepDown, start+stepUp*2-stepDown*2];
      answer = start+stepUp*3-stepDown*2;
    }
    
    setSequence(seq);
    setCorrectAnswer(answer);
    
    // Generate options
    const opts = new Set<number>();
    opts.add(answer);
    while (opts.size < 4) {
      const variance = prng.nextInt(-10, 10);
      if (variance !== 0 && answer + variance > 0) {
        opts.add(answer + variance);
      }
    }
    
    // Shuffle options
    const optsArr = Array.from(opts);
    for (let i = optsArr.length - 1; i > 0; i--) {
        const j = prng.nextInt(0, i);
        [optsArr[i], optsArr[j]] = [optsArr[j], optsArr[i]];
    }
    setOptions(optsArr);
    setGameState('playing');
    setSelectedOpt(null);

  }, [levelData]);

  const handleOptionClick = (opt: number) => {
    if (gameState !== 'playing') return;

    setSelectedOpt(opt);
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
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-2">Cognitive Pattern</h2>
        <div className="font-sans font-bold uppercase text-xs tracking-widest bg-brutal-black text-brutal-white px-2 py-1 inline-block">
          IDENTIFY THE NEXT SEQUENCE VALUE -- DIFF {levelData.difficulty}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12 w-full max-w-md">
        {sequence.map((num, i) => (
           <div key={i} className="brutal-border brutal-shadow bg-brutal-white w-14 h-14 flex items-center justify-center font-display text-2xl">
             {num}
           </div>
        ))}
        <div className="brutal-border brutal-shadow bg-neon-pink w-14 h-14 flex items-center justify-center font-display text-2xl text-brutal-black animate-pulse">
           ?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((opt, i) => {
          let btnClass = "bg-brutal-white text-brutal-black brutal-border brutal-shadow brutal-shadow-active";
          let icon = null;

          if (gameState === 'revealing') {
              if (opt === correctAnswer) {
                  btnClass = "bg-neon-green text-brutal-black brutal-border brutal-shadow";
                  icon = <Check className="absolute right-4 w-6 h-6" strokeWidth={3} />;
              } else if (selectedOpt === opt) {
                  btnClass = "bg-neon-pink text-brutal-black brutal-border brutal-shadow";
                  icon = <X className="absolute right-4 w-6 h-6" strokeWidth={3} />;
              } else {
                  btnClass = "bg-brutal-white text-brutal-black opacity-50 brutal-border";
              }
          }

          return (
            <button
              key={i}
              disabled={gameState !== 'playing'}
              onClick={() => handleOptionClick(opt)}
              className={`relative py-6 flex items-center justify-center font-display text-3xl transition-none ${btnClass}`}
            >
              <span className="mt-1">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
