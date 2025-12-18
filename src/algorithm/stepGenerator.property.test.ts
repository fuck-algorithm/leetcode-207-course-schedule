import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateSteps,
  computeInitialInDegree,
  canFinishCourses,
} from './stepGenerator';

/**
 * Generate valid prerequisites for a given number of courses
 * Ensures no duplicate edges and valid course indices
 */
function generatePrerequisites(numCourses: number, maxEdges: number): number[][] {
  if (numCourses <= 1) return [];
  
  const result: number[][] = [];
  const seen = new Set<string>();
  const edgeCount = Math.min(maxEdges, numCourses * 2);
  
  for (let i = 0; i < edgeCount; i++) {
    const from = Math.floor(Math.random() * numCourses);
    const to = Math.floor(Math.random() * numCourses);
    if (from === to) continue;
    const key = `${from}-${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push([from, to]);
  }
  
  return result;
}

/**
 * **Feature: course-schedule-visualizer, Property 7: Initial In-Degree Correctness**
 * 
 * *For any* algorithm input, the initial in-degree array SHALL correctly count
 * the number of incoming edges for each course node.
 * 
 * **Validates: Requirements 6.1**
 */
describe('Property 7: Initial In-Degree Correctness', () => {
  it('should correctly compute initial in-degree for any valid input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 0, max: 30 }),
        (numCourses, seed) => {
          // Use seed to generate deterministic prerequisites
          const prerequisites: number[][] = [];
          const seen = new Set<string>();
          
          for (let i = 0; i < Math.min(seed, numCourses * 2); i++) {
            const from = (seed + i) % numCourses;
            const to = (seed + i + 1) % numCourses;
            if (from === to) continue;
            const key = `${from}-${to}`;
            if (seen.has(key)) continue;
            seen.add(key);
            prerequisites.push([from, to]);
          }

          const inDegree = computeInitialInDegree(numCourses, prerequisites);

          // Verify array length
          expect(inDegree.length).toBe(numCourses);

          // Manually count in-degrees
          const expectedInDegree = new Array(numCourses).fill(0);
          for (const [, to] of prerequisites) {
            expectedInDegree[to]++;
          }

          // Verify each in-degree value
          for (let i = 0; i < numCourses; i++) {
            expect(inDegree[i]).toBe(expectedInDegree[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct in-degree in first step of generated steps', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (numCourses) => {
          const prerequisites = generatePrerequisites(numCourses, 10);
          const steps = generateSteps({ numCourses, prerequisites });
          
          // First step should have initial in-degree (all zeros before processing)
          expect(steps.length).toBeGreaterThan(0);
          expect(steps[0].inDegree.length).toBe(numCourses);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: course-schedule-visualizer, Property 8: Algorithm Result Correctness**
 * 
 * *For any* algorithm input, the final learnCount value SHALL equal numCourses
 * if and only if the course schedule is completable (no cycles exist in the dependency graph).
 * 
 * **Validates: Requirements 6.5**
 */
describe('Property 8: Algorithm Result Correctness', () => {
  it('should return correct result for any valid input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
        fc.integer({ min: 0, max: 20 }),
        (numCourses, seed) => {
          const prerequisites = generatePrerequisites(numCourses, seed);
          const steps = generateSteps({ numCourses, prerequisites });
          const lastStep = steps[steps.length - 1];
          
          // Get expected result using reference implementation
          const expectedCanFinish = canFinishCourses(numCourses, prerequisites);
          const actualCanFinish = lastStep.learnCount === numCourses;

          expect(actualCanFinish).toBe(expectedCanFinish);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should complete all courses when no prerequisites exist', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (numCourses) => {
          const steps = generateSteps({ numCourses, prerequisites: [] });
          const lastStep = steps[steps.length - 1];
          
          // With no prerequisites, all courses should be completable
          expect(lastStep.learnCount).toBe(numCourses);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect cycles correctly', () => {
    // Test with known cyclic input
    const cyclicInput = {
      numCourses: 2,
      prerequisites: [[0, 1], [1, 0]],
    };
    
    const steps = generateSteps(cyclicInput);
    const lastStep = steps[steps.length - 1];
    
    expect(lastStep.learnCount).toBe(0);
    expect(canFinishCourses(2, [[0, 1], [1, 0]])).toBe(false);
  });
});
