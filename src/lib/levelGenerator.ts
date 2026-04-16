import { PRNG } from './random';

export type GameType = 'grid_memory' | 'sequence_memory' | 'equation_logic' | 'stroop_test' | 'iq_sequence';
export type ArcadeType = 'memory' | 'logic' | 'speed' | 'iq';

export interface LevelData {
  level: number;
  type: GameType;
  difficulty: number;
  prng: PRNG;
  arcade: ArcadeType;
}

export function generateLevel(level: number, arcade: ArcadeType): LevelData {
  const prng = new PRNG(level * 12345);
  
  // Decide type based on arcade
  let types: GameType[] = [];
  if (arcade === 'memory') {
    types = ['grid_memory', 'sequence_memory'];
  } else if (arcade === 'logic') {
    types = ['equation_logic'];
  } else if (arcade === 'speed') {
    types = ['stroop_test'];
  } else if (arcade === 'iq') {
    types = ['iq_sequence'];
  }
  
  const typeIndex = prng.nextInt(0, types.length - 1);
  const type = types[typeIndex];
  
  // Difficulty scales from 1 to 100 roughly
  const difficulty = Math.min(100, Math.floor(level / 5) + 1);
  
  return {
    level,
    type,
    difficulty,
    prng,
    arcade
  };
}
