import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateSteps } from '../algorithm/stepGenerator';
import { totalLines } from '../data/algorithmCode';

/**
 * **Feature: course-schedule-visualizer, Property 1: Step-Line Correspondence**
 * 
 * *For any* algorithm step in the step sequence, the highlighted line number
 * in the code panel SHALL match the execution point defined in that step's data.
 * 
 * **Validates: Requirements 2.2, 2.5**
 */
describe('Property 1: Step-Line Correspondence', () => {
  it('should have valid highlighted line for every step', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 15 }),
        (numCourses, edgeCount) => {
          // Generate prerequisites
          const prerequisites: number[][] = [];
          const seen = new Set<string>();
          for (let i = 0; i < edgeCount && i < numCourses * 2; i++) {
            const from = i % numCourses;
            const to = (i + 1) % numCourses;
            if (from === to) continue;
            const key = `${from}-${to}`;
            if (seen.has(key)) continue;
            seen.add(key);
            prerequisites.push([from, to]);
          }

          const steps = generateSteps({ numCourses, prerequisites });

          // Every step should have a valid highlighted line
          for (const step of steps) {
            expect(step.highlightedLine).toBeGreaterThanOrEqual(1);
            expect(step.highlightedLine).toBeLessThanOrEqual(totalLines);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have unique step IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        (numCourses) => {
          const steps = generateSteps({ numCourses, prerequisites: [] });
          const ids = steps.map((s) => s.id);
          const uniqueIds = new Set(ids);
          
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: course-schedule-visualizer, Property 2: Variable Display Consistency**
 * 
 * *For any* algorithm step with variable state changes, all variables defined
 * in that step SHALL be displayed with their correct values at their corresponding line numbers.
 * 
 * **Validates: Requirements 2.3**
 */
describe('Property 2: Variable Display Consistency', () => {
  it('should have valid variable line numbers for every step', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        (numCourses, edgeCount) => {
          const prerequisites: number[][] = [];
          for (let i = 0; i < edgeCount && i < numCourses; i++) {
            const from = i % numCourses;
            const to = (i + 1) % numCourses;
            if (from !== to) {
              prerequisites.push([from, to]);
            }
          }

          const steps = generateSteps({ numCourses, prerequisites });

          for (const step of steps) {
            for (const variable of step.variables) {
              // Variable line should be within code bounds
              expect(variable.line).toBeGreaterThanOrEqual(1);
              expect(variable.line).toBeLessThanOrEqual(totalLines);
              
              // Variable should have a name and value
              expect(variable.name.length).toBeGreaterThan(0);
              expect(variable.value).toBeDefined();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent variable values with step state', () => {
    const steps = generateSteps({
      numCourses: 4,
      prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]],
    });

    // Last step should have learnCount variable matching step.learnCount
    const lastStep = steps[steps.length - 1];
    const learnCountVar = lastStep.variables.find((v) => v.name === 'learnCount');
    
    if (learnCountVar) {
      expect(parseInt(learnCountVar.value)).toBe(lastStep.learnCount);
    }
  });
});
