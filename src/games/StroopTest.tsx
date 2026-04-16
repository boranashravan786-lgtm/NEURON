import React, { useState, useEffect } from 'react';
import { LevelData } from '../lib/levelGenerator';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

const STROOP_COLORS = [
  { name: 'RED', value: '#FF0000' },
  { name: 'BLUE', value: '#0000FF' },
  { name: 'GREEN', value: '#00FF00' },
  { name: 'YELLOW', value: '#FFFF00' },
];

export function StroopTest({ levelData, onWin, onLose }: { levelData: LevelData, onWin: () => void, onLose: () => void }) {
  const [gameState, setGameState] = useState<'playing' | 'revealing'>('playing');
  
  // Game logic state
  const [word, setWord] = useState(STROOP_COLORS[0]);
  const [color, setColor] = useState(STROOP_COLORS[0]);
  const [options, setOptions] = useState<typeof STROOP_COLORS>([]);
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  useEffect(() => {
    // Generate the stroop test
    // Pick a word name
    const wordObj = levelData.prng.pick(STROOP_COLORS);
    // Pick a color value (often different)
    const colorObj = levelData.prng.pick(STROOP_COLORS);
    
    setWord(wordObj);
    setColor(colorObj);
    
    // Options are all colors
    // Shuffle options
    const shuffled = [...STROOP_COLORS];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = levelData.prng.nextInt(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOptions(shuffled);

  }, [levelData]);

  const handleOptionClick = (opt: typeof STROOP_COLORS[0]) => {
    if (gameState !== 'playing') return;
    
    setSelectedOpt(opt.name);
    setGameState('revealing');
    
    // The correct answer is the color of the text, not the word itself
    if (opt.value === color.value) {
      setIsCorrect(true);
      setTimeout(() => onWin(), 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => onLose(), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-brutal-white">
      <div className="mb-12 text-center w-full">
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-2">Stroop Test</h2>
        <div className="font-sans font-bold uppercase text-xs tracking-widest bg-brutal-black text-brutal-white px-2 py-1 inline-block">
          Select the COLOR not the word
        </div>
      </div>

      <div className="brutal-border brutal-shadow bg-brutal-white px-12 py-16 mb-12 w-full max-w-sm flex items-center justify-center">
        <div 
          className="font-display text-6xl tracking-tighter uppercase"
          style={{ color: color.value, textShadow: '2px 2px 0px #000' }}
        >
          {word.name}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((opt) => {
          let btnClass = "bg-brutal-white text-brutal-black brutal-border brutal-shadow brutal-shadow-active";
          
          if (gameState === 'revealing') {
            if (opt.value === color.value) {
              btnClass = "bg-neon-green text-brutal-black brutal-border brutal-shadow"; // Correct answer
            } else if (selectedOpt === opt.name) {
              btnClass = "bg-neon-pink text-brutal-black brutal-border brutal-shadow"; // Wrong selection
            } else {
              btnClass = "bg-brutal-white opacity-50 brutal-border";
            }
          }

          return (
            <button
              key={opt.name}
              disabled={gameState !== 'playing'}
              onClick={() => handleOptionClick(opt)}
              className={`py-4 font-display text-2xl uppercase tracking-tighter ${btnClass} transition-colors`}
            >
              {opt.name}
            </button>
          )
        })}
      </div>
    </div>
  );
}
