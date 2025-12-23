import { useState, useEffect } from 'react';

const MAX_ROUNDS = 5;
const STORAGE_KEY = 'mapix_rounds_played';
const STORAGE_DATE_KEY = 'mapix_last_play_date';

export function useRoundLimit() {
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    // Check if we need to reset the counter (new day)
    const lastPlayDate = localStorage.getItem(STORAGE_DATE_KEY);
    const today = new Date().toDateString();

    if (lastPlayDate !== today) {
      // New day, reset counter
      localStorage.setItem(STORAGE_KEY, '0');
      localStorage.setItem(STORAGE_DATE_KEY, today);
      setRoundsPlayed(0);
      setHasReachedLimit(false);
    } else {
      // Same day, load existing counter
      const stored = localStorage.getItem(STORAGE_KEY);
      const rounds = stored ? parseInt(stored, 10) : 0;
      setRoundsPlayed(rounds);
      setHasReachedLimit(rounds >= MAX_ROUNDS);
    }
  }, []);

  const incrementRounds = () => {
    const newCount = roundsPlayed + 1;
    setRoundsPlayed(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    localStorage.setItem(STORAGE_DATE_KEY, new Date().toDateString());
    
    if (newCount >= MAX_ROUNDS) {
      setHasReachedLimit(true);
    }
  };

  const canPlayNewRound = () => {
    return roundsPlayed < MAX_ROUNDS;
  };

  const getRemainingRounds = () => {
    return Math.max(0, MAX_ROUNDS - roundsPlayed);
  };

  return {
    roundsPlayed,
    hasReachedLimit,
    canPlayNewRound,
    incrementRounds,
    getRemainingRounds,
    maxRounds: MAX_ROUNDS,
  };
}
