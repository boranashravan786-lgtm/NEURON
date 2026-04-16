interface UserProfile {
  username: string;
  globalLevel: number;
  totalGamesPlayed: number;
  iqRating: number;
  highScores: {
    memory: number;
    logic: number;
    speed: number;
    iq: number;
  }
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'USER_01',
  globalLevel: 1,
  totalGamesPlayed: 0,
  iqRating: 100,
  highScores: {
    memory: 0,
    logic: 0,
    speed: 0,
    iq: 0
  }
};

export function getProfile(): UserProfile {
  try {
    const saved = localStorage.getItem('neuron_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new properties are backward compatible
      return { 
        ...DEFAULT_PROFILE, 
        ...parsed,
        highScores: { ...DEFAULT_PROFILE.highScores, ...parsed.highScores }
      };
    }
  } catch (e) {
    console.error("Failed to load profile", e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem('neuron_profile', JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

export function levelUp(arcadeCategory: 'memory' | 'logic' | 'speed' | 'iq', difficulty: number) {
  const profile = getProfile();
  profile.globalLevel += 1;
  profile.totalGamesPlayed += 1;
  profile.highScores[arcadeCategory] += 1;
  
  if (arcadeCategory === 'iq') {
    // Increase IQ slightly based on difficulty
    const boost = Math.max(1, Math.floor(difficulty / 10));
    profile.iqRating += boost;
  } else {
    // Small passive boost for general brain training
    if (profile.totalGamesPlayed % 5 === 0) profile.iqRating += 1;
  }
  
  saveProfile(profile);
  return profile;
}

export function recordLoss(arcadeCategory: 'memory' | 'logic' | 'speed' | 'iq') {
  const profile = getProfile();
  profile.totalGamesPlayed += 1;
  
  // Penalize IQ slightly on IQ losses to keep it balanced
  if (arcadeCategory === 'iq') {
    profile.iqRating = Math.max(80, profile.iqRating - 1);
  }
  
  saveProfile(profile);
  return profile;
}

export function getPersonality(profile: UserProfile): string {
  const { memory, logic, speed, iq } = profile.highScores;
  const max = Math.max(memory, logic, speed, iq);
  
  if (profile.totalGamesPlayed < 3) return "UNKNOWN (Testing Required)";
  if (max === iq) return "THE ORACLE (Pattern Recognition Focus)";
  if (max === memory) return "THE ARCHIVIST (Hyper-Memory Focus)";
  if (max === logic) return "THE ARCHITECT (Analytical Focus)";
  if (max === speed) return "THE REACTOR (Reflex-Dominant)";
  
  return "NEURAL GENERALIST";
}
