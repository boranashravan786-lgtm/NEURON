import React, { useState, useEffect } from 'react';
import { LevelData } from '../lib/levelGenerator';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

const COLORS = [
  'bg-brutal-white text-brutal-black brutal-border', 
  'bg-brutal-white text-brutal-black brutal-border', 
  'bg-brutal-white text-brutal-black brutal-border', 
  'bg-brutal-white text-brutal-black brutal-border',
  'bg-brutal-white text-brutal-black brutal-border', 
  'bg-brutal-white text-brutal-black brutal-border'
];

const LIGHT_COLORS = [
  'bg-neon-green text-brutal-black brutal-border border-brutal-black', 
  'bg-neon-pink text-brutal-black brutal-border border-brutal-black', 
  'bg-neon-cyan text-brutal-black brutal-border border-brutal-black', 
  'bg-[#FFFF00] text-brutal-black brutal-border border-brutal-black',
  'bg-[#FF5500] text-brutal-black brutal-border border-brutal-black', 
  'bg-[#AA00FF] text-brutal-black brutal-border border-brutal-black'
];

export function SequenceMemory({ levelData, onWin, onLose }: { levelData: LevelData, onWin: () => void, onLose: () => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'showing' | 'playing' | 'revealing'>('showing');
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  
  const numColors = Math.min(6, 3 + Math.floor(levelData.difficulty / 20));
  const sequenceLength = Math.min(10, 3 + Math.floor(levelData.difficulty / 5));

  useEffect(() => {
    const seq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      seq.push(levelData.prng.nextInt(0, numColors - 1));
    }
    setSequence(seq);
    
    // Play sequence
    let i = 0;
    const playSpeed = Math.max(300, 1000 - (levelData.difficulty * 8));
    
    const interval = setInterval(() => {
      if (i >= seq.length * 2) {
        clearInterval(interval);
        setGameState('playing');
        setActiveColorIndex(null);
        return;
      }
      
      if (i % 2 === 0) {
        setActiveColorIndex(seq[i / 2]);
      } else {
        setActiveColorIndex(null);
      }
      i++;
    }, playSpeed);
    
    return () => clearInterval(interval);
  }, [levelData]);

  const handleColorClick = (colorIdx: number) => {
    if (gameState !== 'playing') return;

    // Flash temporarily
    setActiveColorIndex(colorIdx);
    setTimeout(() => setActiveColorIndex(null), 150);

    const expected = sequence[playerSequence.length];
    if (colorIdx !== expected) {
      setErrorIndex(colorIdx);
      setGameState('revealing');
      setTimeout(() => onLose(), 1500);
      return;
    }

    const newSeq = [...playerSequence, colorIdx];
    setPlayerSequence(newSeq);

    if (newSeq.length === sequence.length) {
      setGameState('revealing');
      setTimeout(() => onWin(), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-brutal-white">
      <div className="mb-12 text-center w-full">
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-2">Sequence Matrix</h2>
        <div className="font-sans font-bold uppercase text-xs tracking-widest bg-brutal-black text-brutal-white px-2 py-1 inline-block">
          {gameState === 'showing' ? 'OBSERVE PATTERN' : 'REPEAT PATTERN'}
        </div>
      </div>

      <div className="flex justify-center mb-12 w-full max-w-[280px]">
        <div className="flex gap-1 w-full relative">
           {sequence.map((_, i) => (
             <div 
               key={i} 
               className={`h-4 flex-1 brutal-border ${i < playerSequence.length ? 'bg-brutal-black' : 'bg-brutal-white'}`}
             />
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-[300px] w-full mx-auto">
        {Array.from({ length: numColors }).map((_, i) => {
          const isLit = activeColorIndex === i;
          const isError = errorIndex === i;
          const baseColor = isLit ? LIGHT_COLORS[i] : COLORS[i];
          
          return (
            <motion.div
              key={i}
              whileTap={gameState === 'playing' ? { scale: 0.95 } : undefined}
              className={`aspect-square sm:aspect-auto sm:h-32 cursor-pointer transition-none flex items-center justify-center brutal-shadow brutal-shadow-active
                ${baseColor} ${isError ? 'bg-neon-pink' : ''}`}
              onClick={() => handleColorClick(i)}
            >
               {isError && (
                 <X className="text-brutal-black w-12 h-12" strokeWidth={3} />
               )}
               {gameState === 'revealing' && !isError && playerSequence.length === sequence.length && (
                  <Check className="text-brutal-black w-12 h-12" strokeWidth={3} />
               )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
