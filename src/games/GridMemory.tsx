import React, { useState, useEffect } from 'react';
import { LevelData } from '../lib/levelGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';

export function GridMemory({ levelData, onWin, onLose }: { levelData: LevelData, onWin: () => void, onLose: () => void }) {
  const [gameState, setGameState] = useState<'showing' | 'playing' | 'revealing'>('showing');
  const [gridSize, setGridSize] = useState(3);
  const [activeTiles, setActiveTiles] = useState<Set<number>>(new Set());
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  const [errorTile, setErrorTile] = useState<number | null>(null);

  useEffect(() => {
    // Generate grid based on difficulty
    const size = Math.min(6, 3 + Math.floor(levelData.difficulty / 15));
    setGridSize(size);
    
    // Number of active tiles ranges from 3 to mostly half the grid
    const numTiles = Math.min(Math.floor((size * size) / 2), 3 + Math.floor(levelData.difficulty / 5));
    
    const newActiveTiles = new Set<number>();
    while (newActiveTiles.size < numTiles) {
      newActiveTiles.add(levelData.prng.nextInt(0, size * size - 1));
    }
    setActiveTiles(newActiveTiles);
    
    // Show tiles for a specific time based on difficulty (harder = less time)
    const showTime = Math.max(800, 2500 - (levelData.difficulty * 20));
    
    const timer = setTimeout(() => {
      setGameState('playing');
    }, showTime);
    
    return () => clearTimeout(timer);
  }, [levelData]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (selectedTiles.has(index)) return;

    if (!activeTiles.has(index)) {
      // Wrong tile -> reveal and lose
      setErrorTile(index);
      setGameState('revealing');
      setTimeout(() => onLose(), 1500);
      return;
    }

    const newSelected = new Set(selectedTiles);
    newSelected.add(index);
    setSelectedTiles(newSelected);

    if (newSelected.size === activeTiles.size) {
      // Won
      setGameState('revealing');
      setTimeout(() => onWin(), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-brutal-white">
      <div className="mb-10 text-center w-full">
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-2">Pattern Matrix</h2>
        <div className="font-sans font-bold uppercase text-xs tracking-widest bg-brutal-black text-brutal-white px-2 py-1 inline-block">
          {gameState === 'showing' ? 'MEMORIZE THE ACTIVE NODES' : 'RECREATE THE PATTERN'}
        </div>
      </div>

      <div 
        className="grid gap-2 mb-8 bg-brutal-black p-4 brutal-border brutal-shadow w-full max-w-[320px]"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          let bgClass = 'bg-brutal-white hover:bg-slate-200 cursor-pointer';
          let content = null;
          
          if (gameState === 'showing') {
            if (activeTiles.has(i)) {
              bgClass = 'bg-neon-cyan';
            }
          } else if (gameState === 'playing' || gameState === 'revealing') {
            if (selectedTiles.has(i)) {
              bgClass = 'bg-neon-green';
              content = <Check className="text-brutal-black w-8 h-8" strokeWidth={3} />;
            }
            if (errorTile === i) {
              bgClass = 'bg-neon-pink';
              content = <X className="text-brutal-black w-10 h-10" strokeWidth={3} />;
            } else if (gameState === 'revealing' && activeTiles.has(i) && !selectedTiles.has(i)) {
              bgClass = 'bg-neon-cyan opacity-50'; // Missed ones
            }
          }

          return (
            <motion.div
              key={i}
              whileTap={gameState === 'playing' ? { scale: 0.85 } : undefined}
              className={`aspect-square flex items-center justify-center transition-colors duration-100 ${bgClass}`}
              onClick={() => handleTileClick(i)}
            >
              {content}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
