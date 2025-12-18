import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Pure functions extracted from usePlayback for testing
 */
function computeCanGoPrevious(currentIndex: number): boolean {
  return currentIndex > 0;
}

function computeCanGoNext(currentIndex: number, totalSteps: number): boolean {
  return currentIndex < totalSteps - 1;
}

function computeNextIndex(currentIndex: number, totalSteps: number): number {
  return Math.min(totalSteps - 1, currentIndex + 1);
}

function computePreviousIndex(currentIndex: number): number {
  return Math.max(0, currentIndex - 1);
}

function togglePlayState(isPlaying: boolean): boolean {
  return !isPlaying;
}

/**
 * **Feature: course-schedule-visualizer, Property 3: Step Navigation Correctness**
 * 
 * *For any* current step index N where 0 < N < totalSteps, invoking the previous
 * action SHALL result in step index N-1, and for any step index N where
 * 0 <= N < totalSteps-1, invoking the next action SHALL result in step index N+1.
 * 
 * **Validates: Requirements 3.3, 3.4, 4.1, 4.2**
 */
describe('Property 3: Step Navigation Correctness', () => {
  it('should decrement step index when going previous (if not at start)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        fc.integer({ min: 1, max: 99 }),
        (totalSteps, currentIndex) => {
          // Ensure currentIndex is valid
          const validIndex = Math.min(currentIndex, totalSteps - 1);
          
          if (validIndex > 0) {
            const newIndex = computePreviousIndex(validIndex);
            expect(newIndex).toBe(validIndex - 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should increment step index when going next (if not at end)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        fc.integer({ min: 0, max: 98 }),
        (totalSteps, currentIndex) => {
          // Ensure currentIndex is valid
          const validIndex = Math.min(currentIndex, totalSteps - 2);
          
          if (validIndex < totalSteps - 1) {
            const newIndex = computeNextIndex(validIndex, totalSteps);
            expect(newIndex).toBe(validIndex + 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should stay at 0 when going previous from first step', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        () => {
          const newIndex = computePreviousIndex(0);
          expect(newIndex).toBe(0);
          expect(computeCanGoPrevious(0)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should stay at last step when going next from last step', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (totalSteps) => {
          const lastIndex = totalSteps - 1;
          const newIndex = computeNextIndex(lastIndex, totalSteps);
          expect(newIndex).toBe(lastIndex);
          expect(computeCanGoNext(lastIndex, totalSteps)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly compute canGoPrevious for any valid index', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 99 }),
        (totalSteps, currentIndex) => {
          const validIndex = Math.min(currentIndex, totalSteps - 1);
          const canGoPrev = computeCanGoPrevious(validIndex);
          
          expect(canGoPrev).toBe(validIndex > 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly compute canGoNext for any valid index', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 99 }),
        (totalSteps, currentIndex) => {
          const validIndex = Math.min(currentIndex, totalSteps - 1);
          const canGoNext = computeCanGoNext(validIndex, totalSteps);
          
          expect(canGoNext).toBe(validIndex < totalSteps - 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: course-schedule-visualizer, Property 4: Play/Pause Toggle**
 * 
 * *For any* playback state (playing or paused), invoking the toggle action
 * SHALL result in the opposite state.
 * 
 * **Validates: Requirements 4.3**
 */
describe('Property 4: Play/Pause Toggle', () => {
  it('should toggle play state correctly', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (isPlaying) => {
          const newState = togglePlayState(isPlaying);
          expect(newState).toBe(!isPlaying);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return to original state after double toggle', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (isPlaying) => {
          const afterFirstToggle = togglePlayState(isPlaying);
          const afterSecondToggle = togglePlayState(afterFirstToggle);
          expect(afterSecondToggle).toBe(isPlaying);
        }
      ),
      { numRuns: 100 }
    );
  });
});
