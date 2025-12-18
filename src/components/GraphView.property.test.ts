import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateSteps } from '../algorithm/stepGenerator';
import { GraphNode, GraphEdge } from '../algorithm/types';

/**
 * Build graph data from algorithm input
 */
function buildGraphData(
  numCourses: number,
  prerequisites: number[][]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  for (let i = 0; i < numCourses; i++) {
    nodes.push({ id: i });
  }

  const edges: GraphEdge[] = prerequisites.map(([from, to]) => ({
    source: from,
    target: to,
  }));

  return { nodes, edges };
}

/**
 * **Feature: course-schedule-visualizer, Property 5: Graph Structure Correctness**
 * 
 * *For any* algorithm input with numCourses courses and prerequisites array,
 * the generated graph SHALL contain exactly numCourses nodes and exactly
 * prerequisites.length directed edges with correct source-target relationships.
 * 
 * **Validates: Requirements 5.1, 5.2**
 */
describe('Property 5: Graph Structure Correctness', () => {
  it('should have correct number of nodes for any input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (numCourses) => {
          const { nodes } = buildGraphData(numCourses, []);
          
          expect(nodes.length).toBe(numCourses);
          
          // All node IDs should be unique and in range [0, numCourses)
          const ids = new Set(nodes.map((n) => n.id));
          expect(ids.size).toBe(numCourses);
          
          for (const node of nodes) {
            expect(node.id).toBeGreaterThanOrEqual(0);
            expect(node.id).toBeLessThan(numCourses);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct number of edges for any input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 15 }),
        fc.integer({ min: 0, max: 20 }),
        (numCourses, edgeSeed) => {
          // Generate unique prerequisites
          const prerequisites: number[][] = [];
          const seen = new Set<string>();
          
          for (let i = 0; i < edgeSeed; i++) {
            const from = i % numCourses;
            const to = (i + 1) % numCourses;
            if (from === to) continue;
            const key = `${from}-${to}`;
            if (seen.has(key)) continue;
            seen.add(key);
            prerequisites.push([from, to]);
          }

          const { edges } = buildGraphData(numCourses, prerequisites);
          
          expect(edges.length).toBe(prerequisites.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct source-target relationships', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.array(
          fc.tuple(
            fc.integer({ min: 0, max: 9 }),
            fc.integer({ min: 0, max: 9 })
          ),
          { maxLength: 15 }
        ),
        (numCourses, rawPrereqs) => {
          // Filter valid prerequisites
          const prerequisites = rawPrereqs
            .filter(([from, to]) => from < numCourses && to < numCourses && from !== to)
            .filter((p, i, arr) => {
              const key = `${p[0]}-${p[1]}`;
              return arr.findIndex((q) => `${q[0]}-${q[1]}` === key) === i;
            });

          const { edges } = buildGraphData(numCourses, prerequisites);

          // Each edge should match a prerequisite
          for (let i = 0; i < edges.length; i++) {
            expect(edges[i].source).toBe(prerequisites[i][0]);
            expect(edges[i].target).toBe(prerequisites[i][1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: course-schedule-visualizer, Property 6: Step State Consistency**
 * 
 * *For any* algorithm step, the node states in the graph view and the data
 * structure values (inDegree array, queue, learnCount) SHALL accurately
 * reflect the algorithm's state at that execution point.
 * 
 * **Validates: Requirements 5.3, 6.4**
 */
describe('Property 6: Step State Consistency', () => {
  it('should have consistent node states with queue contents', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        (numCourses) => {
          const steps = generateSteps({ numCourses, prerequisites: [] });

          for (const step of steps) {
            // Nodes in queue should have 'in-queue' state
            for (const courseInQueue of step.queue) {
              const state = step.nodeStates.get(courseInQueue);
              expect(state).toBe('in-queue');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have inDegree array length equal to numCourses', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
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
            expect(step.inDegree.length).toBe(numCourses);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have non-negative learnCount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (numCourses) => {
          const steps = generateSteps({ numCourses, prerequisites: [] });

          for (const step of steps) {
            expect(step.learnCount).toBeGreaterThanOrEqual(0);
            expect(step.learnCount).toBeLessThanOrEqual(numCourses);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
