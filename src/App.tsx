import React, { useState, useEffect } from 'react';
import { generateLevel, LevelData, ArcadeType } from './lib/levelGenerator';
import { GridMemory } from './games/GridMemory';
import { SequenceMemory } from './games/SequenceMemory';
import { EquationLogic } from './games/EquationLogic';
import { StroopTest } from './games/StroopTest';
import { IQSequence } from './games/IQSequence';
import { getProfile, levelUp, recordLoss, getPersonality } from './lib/profile';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ArrowRight, Check, X, User as UserIcon, Zap, Brain, Activity, Hexagon } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState(getProfile());
  const [gameState, setGameState] = useState<'profile' | 'arcades' | 'playing' | 'win' | 'lose'>('arcades');
  const [levelData, setLevelData] = useState<LevelData | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, [gameState]);

  const startArcade = (arcade: ArcadeType) => {
    setLevelData(generateLevel(profile.globalLevel, arcade));
    setGameState('playing');
  };

  const handleWin = () => {
    setGameState('win');
    if (levelData) {
      levelUp(levelData.arcade, levelData.difficulty);
    }
  };

  const handleLose = () => {
    setGameState('lose');
    if (levelData) {
        recordLoss(levelData.arcade);
    }
  };

  const renderGame = () => {
    if (!levelData) return null;
    switch (levelData.type) {
      case 'grid_memory':
        return <GridMemory levelData={levelData} onWin={handleWin} onLose={handleLose} />;
      case 'sequence_memory':
        return <SequenceMemory levelData={levelData} onWin={handleWin} onLose={handleLose} />;
      case 'equation_logic':
        return <EquationLogic levelData={levelData} onWin={handleWin} onLose={handleLose} />;
      case 'stroop_test':
        return <StroopTest levelData={levelData} onWin={handleWin} onLose={handleLose} />;
      case 'iq_sequence':
        return <IQSequence levelData={levelData} onWin={handleWin} onLose={handleLose} />;
      default:
        return <div>Unknown game type</div>;
    }
  };

  return (
    <div className="flex justify-center bg-gray-200 min-h-dvh h-[100dvh]">
      <div className="w-full max-w-md bg-brutal-white relative overflow-hidden flex flex-col h-full brutal-border m-0 sm:m-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <header className="flex-none p-4 flex items-center justify-between z-10 bg-brutal-white border-b-4 border-brutal-black">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGameState('arcades')}>
            <h1 className="font-display text-3xl uppercase tracking-tighter text-brutal-black leading-none mt-1">NEURON</h1>
          </div>
          <div 
            className="flex items-center gap-2 brutal-border px-3 py-1 bg-neon-cyan shadow-[2px_2px_0px_#000] cursor-pointer active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            onClick={() => setGameState('profile')}
          >
            <UserIcon size={16} strokeWidth={3} />
            <span className="font-sans font-bold uppercase text-xs tracking-widest">{profile.username}  | Lvl {profile.globalLevel}</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* Profile State */}
            {gameState === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 p-6 bg-brutal-white overflow-y-auto"
              >
                <h2 className="font-display text-5xl uppercase tracking-tighter mb-8">Agent Profile</h2>
                
                <div className="brutal-border brutal-shadow p-6 mb-8 bg-[#FFFF00] text-brutal-black">
                  <div className="text-sm font-bold uppercase tracking-widest border-b-2 border-brutal-black pb-2 mb-4">Cognitive Identity</div>
                  
                  <div className="flex items-end justify-between mb-2">
                    <div>
                        <div className="text-sm uppercase font-bold text-brutal-black/70">Estimated IQ</div>
                        <div className="text-6xl font-display leading-none">{profile.iqRating}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm uppercase font-bold text-brutal-black/70">Personality</div>
                        <div className="text-xl font-display leading-tight max-w-[150px]">{getPersonality(profile)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t-2 border-brutal-black grid grid-cols-2 gap-4">
                    <div>
                        <div className="font-bold uppercase text-xs">Global Level</div>
                        <div className="text-2xl font-display">{profile.globalLevel}</div>
                    </div>
                    <div>
                        <div className="font-bold uppercase text-xs">Total Missions</div>
                        <div className="text-2xl font-display">{profile.totalGamesPlayed}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="text-sm font-bold uppercase tracking-widest">High Scores by Arcade</div>
                  
                  <div className="flex justify-between items-center brutal-border p-4 bg-brutal-white brutal-shadow">
                    <span className="font-bold flex items-center gap-2"><Hexagon size={18} /> THE ORACLE (IQ)</span>
                    <span className="font-display text-2xl">{profile.highScores.iq}</span>
                  </div>

                  <div className="flex justify-between items-center brutal-border p-4 bg-brutal-white brutal-shadow">
                    <span className="font-bold flex items-center gap-2"><Brain size={18} /> THE VAULT (Memory)</span>
                    <span className="font-display text-2xl">{profile.highScores.memory}</span>
                  </div>
                  
                  <div className="flex justify-between items-center brutal-border p-4 bg-brutal-white brutal-shadow">
                    <span className="font-bold flex items-center gap-2"><Activity size={18} /> THE LAB (Logic)</span>
                    <span className="font-display text-2xl">{profile.highScores.logic}</span>
                  </div>
                  
                  <div className="flex justify-between items-center brutal-border p-4 bg-brutal-white brutal-shadow">
                    <span className="font-bold flex items-center gap-2"><Zap size={18} /> THE REACTOR (Speed)</span>
                    <span className="font-display text-2xl">{profile.highScores.speed}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setGameState('arcades')}
                  className="w-full bg-brutal-black text-brutal-white font-display text-xl uppercase py-4 brutal-shadow brutal-shadow-active tracking-wider"
                >
                  Return to Matrix
                </button>
              </motion.div>
            )}

            {/* Arcades Menu */}
            {gameState === 'arcades' && (
              <motion.div 
                key="arcades"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 p-6 flex flex-col gap-6 overflow-y-auto bg-brutal-white"
              >
                <div className="text-center mb-0 mt-2">
                  <h2 className="font-display text-4xl uppercase tracking-tighter mix-blend-difference mb-1">Select Arcade</h2>
                  <p className="font-bold text-xs uppercase tracking-widest bg-brutal-black text-white inline-block px-2 py-1">Choose your objective</p>
                </div>

                <button 
                  onClick={() => startArcade('iq')}
                  className="brutal-border p-6 bg-[#FFFF00] brutal-shadow brutal-shadow-active text-left flex flex-col gap-2 group"
                >
                  <div className="flex items-center gap-3">
                    <Hexagon size={32} className="group-active:scale-110 transition-transform" />
                    <h3 className="font-display text-4xl uppercase tracking-tighter">The Oracle</h3>
                  </div>
                  <p className="font-bold text-sm">Pattern recognition & IQ evaluation.</p>
                  <div className="mt-4 font-bold uppercase text-xs tracking-widest border-t-2 border-brutal-black pt-2 w-full flex justify-between">
                    <span>Games: Sequences</span>
                    <span>Score: {profile.highScores.iq}</span>
                  </div>
                </button>

                <button 
                  onClick={() => startArcade('memory')}
                  className="brutal-border p-6 bg-neon-cyan brutal-shadow brutal-shadow-active text-left flex flex-col gap-2 group"
                >
                  <div className="flex items-center gap-3">
                    <Brain size={32} className="group-active:scale-110 transition-transform" />
                    <h3 className="font-display text-4xl uppercase tracking-tighter">The Vault</h3>
                  </div>
                  <p className="font-bold text-sm">Spatial & sequential memory tests.</p>
                  <div className="mt-4 font-bold uppercase text-xs tracking-widest border-t-2 border-brutal-black pt-2 w-full flex justify-between">
                    <span>Games: Grid, sequence</span>
                    <span>Score: {profile.highScores.memory}</span>
                  </div>
                </button>

                <button 
                  onClick={() => startArcade('logic')}
                  className="brutal-border p-6 bg-neon-pink brutal-shadow brutal-shadow-active text-left flex flex-col gap-2 group"
                >
                  <div className="flex items-center gap-3">
                    <Activity size={32} className="group-active:scale-110 transition-transform" />
                    <h3 className="font-display text-4xl uppercase tracking-tighter">The Lab</h3>
                  </div>
                  <p className="font-bold text-sm">Mental arithmetic and logic puzzles.</p>
                  <div className="mt-4 font-bold uppercase text-xs tracking-widest border-t-2 border-brutal-black pt-2 w-full flex justify-between">
                    <span>Games: Equations</span>
                    <span>Score: {profile.highScores.logic}</span>
                  </div>
                </button>

                <button 
                  onClick={() => startArcade('speed')}
                  className="brutal-border p-6 bg-neon-green brutal-shadow brutal-shadow-active text-left flex flex-col gap-2 group"
                >
                  <div className="flex items-center gap-3">
                    <Zap size={32} className="group-active:scale-110 transition-transform" />
                    <h3 className="font-display text-4xl uppercase tracking-tighter">The Reactor</h3>
                  </div>
                  <p className="font-bold text-sm">Reflexes and cognitive interference.</p>
                  <div className="mt-4 font-bold uppercase text-xs tracking-widest border-t-2 border-brutal-black pt-2 w-full flex justify-between">
                    <span>Games: Stroop Test</span>
                    <span>Score: {profile.highScores.speed}</span>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Playing State */}
            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brutal-white"
              >
                {renderGame()}
              </motion.div>
            )}

            {/* Win State */}
            {gameState === 'win' && (
              <motion.div
                key="win"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-neon-green text-brutal-black"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mb-8"
                >
                  <Check size={96} strokeWidth={3} />
                </motion.div>
                <div className="font-bold text-sm uppercase tracking-widest mb-2 border-b-4 border-brutal-black pb-1">Milestone Completed</div>
                <h2 className="font-display text-6xl uppercase tracking-tighter mb-12">SUCCESS</h2>
                
                <button 
                  onClick={() => levelData ? startArcade(levelData.arcade) : setGameState('arcades')}
                  className="bg-brutal-black text-brutal-white w-full py-5 font-display text-2xl uppercase tracking-widest flex items-center justify-center gap-4 brutal-shadow brutal-shadow-active hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"
                >
                  NEXT ROUTINE
                  <ArrowRight size={24} />
                </button>
                 <button 
                  onClick={() => setGameState('arcades')}
                  className="mt-6 font-bold uppercase text-xs tracking-widest border-b-2 border-transparent hover:border-brutal-black transition-colors"
                >
                  Change Arcade
                </button>
              </motion.div>
            )}

            {/* Lose State */}
            {gameState === 'lose' && (
              <motion.div
                key="lose"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-neon-pink text-brutal-black"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mb-8"
                >
                  <X size={96} strokeWidth={3} />
                </motion.div>
                <div className="font-bold text-sm uppercase tracking-widest mb-2 border-b-4 border-brutal-black pb-1">Protocol Failure</div>
                <h2 className="font-display text-6xl uppercase tracking-tighter mb-12 text-center leading-none">SYSTEM<br/>OVERLOAD</h2>
                
                <button 
                  onClick={() => levelData ? startArcade(levelData.arcade) : setGameState('arcades')}
                  className="bg-brutal-white text-brutal-black brutal-border w-full py-5 font-display text-2xl uppercase tracking-widest flex items-center justify-center gap-4 brutal-shadow brutal-shadow-active hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"
                >
                  <RotateCcw size={24} strokeWidth={3} />
                  RETRY PROTOCOL
                </button>
                <button 
                  onClick={() => setGameState('arcades')}
                  className="mt-6 font-bold uppercase text-xs tracking-widest border-b-2 border-transparent hover:border-brutal-black transition-colors"
                >
                  Retreat to Arcades
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
