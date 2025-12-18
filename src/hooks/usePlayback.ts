import { useState, useCallback, useEffect, useRef } from 'react';

interface UsePlaybackOptions {
  totalSteps: number;
  playbackSpeed?: number;
}

interface UsePlaybackReturn {
  currentStepIndex: number;
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
}

export function usePlayback({
  totalSteps,
  playbackSpeed = 1000,
}: UsePlaybackOptions): UsePlaybackReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const canGoPrevious = currentStepIndex > 0;
  const canGoNext = currentStepIndex < totalSteps - 1;

  const clearPlaybackInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (currentStepIndex >= totalSteps - 1) {
      // Reset to beginning if at end
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, totalSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearPlaybackInterval();
  }, [clearPlaybackInterval]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const goToPrevious = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps]);

  const goToStep = useCallback(
    (index: number) => {
      setCurrentStepIndex(Math.max(0, Math.min(totalSteps - 1, index)));
    },
    [totalSteps]
  );

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  // Auto-advance when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }

    return clearPlaybackInterval;
  }, [isPlaying, playbackSpeed, totalSteps, clearPlaybackInterval]);

  // Stop playing when reaching the end
  useEffect(() => {
    if (currentStepIndex >= totalSteps - 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, totalSteps, isPlaying]);

  return {
    currentStepIndex,
    isPlaying,
    canGoPrevious,
    canGoNext,
    play,
    pause,
    toggle,
    goToPrevious,
    goToNext,
    goToStep,
    reset,
  };
}
