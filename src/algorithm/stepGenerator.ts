import {
  AlgorithmStep,
  NodeState,
  StepGeneratorInput,
} from './types';

/**
 * Deep clone a Map<number, NodeState>
 */
function cloneNodeStates(map: Map<number, NodeState>): Map<number, NodeState> {
  return new Map(map);
}

/**
 * Generate visualization steps for the topological sort algorithm
 */
export function generateSteps(input: StepGeneratorInput): AlgorithmStep[] {
  const { numCourses, prerequisites } = input;
  const steps: AlgorithmStep[] = [];
  let stepId = 0;

  // Initialize node states
  const nodeStates = new Map<number, NodeState>();
  for (let i = 0; i < numCourses; i++) {
    nodeStates.set(i, 'unvisited');
  }

  // Build adjacency list and in-degree array
  const nextMap = new Map<number, number[]>();
  const inDegree: number[] = new Array(numCourses).fill(0);

  // Step: Initialize data structures
  steps.push({
    id: stepId++,
    description: '初始化邻接表和入度数组',
    highlightedLine: 4,
    variables: [
      { name: 'numCourses', value: String(numCourses), line: 2 },
    ],
    nodeStates: cloneNodeStates(nodeStates),
    activeEdge: null,
    inDegree: [...inDegree],
    queue: [],
    learnCount: 0,
  });

  // Process prerequisites
  for (const p of prerequisites) {
    const from = p[0];
    const to = p[1];
    inDegree[to]++;
    
    if (!nextMap.has(from)) {
      nextMap.set(from, []);
    }
    nextMap.get(from)!.push(to);

    steps.push({
      id: stepId++,
      description: `处理先修关系: 课程 ${from} -> 课程 ${to}`,
      highlightedLine: 9,
      variables: [
        { name: 'from', value: String(from), line: 8 },
        { name: 'to', value: String(to), line: 9 },
        { name: 'ingressCount[to]', value: String(inDegree[to]), line: 10 },
      ],
      nodeStates: cloneNodeStates(nodeStates),
      activeEdge: { source: from, target: to },
      inDegree: [...inDegree],
      queue: [],
      learnCount: 0,
    });
  }

  // Initialize queue with courses having 0 in-degree
  const queue: number[] = [];
  
  steps.push({
    id: stepId++,
    description: '开始拓扑排序，查找入度为0的课程',
    highlightedLine: 17,
    variables: [],
    nodeStates: cloneNodeStates(nodeStates),
    activeEdge: null,
    inDegree: [...inDegree],
    queue: [...queue],
    learnCount: 0,
  });

  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
      nodeStates.set(i, 'in-queue');
      
      steps.push({
        id: stepId++,
        description: `课程 ${i} 入度为0，加入队列`,
        highlightedLine: 20,
        variables: [
          { name: 'i', value: String(i), line: 18 },
          { name: 'ingressCount[i]', value: '0', line: 19 },
        ],
        nodeStates: cloneNodeStates(nodeStates),
        activeEdge: null,
        inDegree: [...inDegree],
        queue: [...queue],
        learnCount: 0,
      });
    }
  }

  // Process queue
  let learnCount = 0;

  while (queue.length > 0) {
    const course = queue.shift()!;
    nodeStates.set(course, 'completed');
    
    steps.push({
      id: stepId++,
      description: `从队列取出课程 ${course}`,
      highlightedLine: 25,
      variables: [
        { name: 'course', value: String(course), line: 25 },
      ],
      nodeStates: cloneNodeStates(nodeStates),
      activeEdge: null,
      inDegree: [...inDegree],
      queue: [...queue],
      learnCount,
    });

    const nextList = nextMap.get(course);
    if (nextList) {
      for (const toCourse of nextList) {
        inDegree[toCourse]--;
        
        steps.push({
          id: stepId++,
          description: `处理依赖: 课程 ${toCourse} 入度减1`,
          highlightedLine: 29,
          variables: [
            { name: 'toCourse', value: String(toCourse), line: 28 },
            { name: 'ingressCount[toCourse]', value: String(inDegree[toCourse]), line: 29 },
          ],
          nodeStates: cloneNodeStates(nodeStates),
          activeEdge: { source: course, target: toCourse },
          inDegree: [...inDegree],
          queue: [...queue],
          learnCount,
        });

        if (inDegree[toCourse] === 0) {
          queue.push(toCourse);
          nodeStates.set(toCourse, 'in-queue');
          
          steps.push({
            id: stepId++,
            description: `课程 ${toCourse} 入度变为0，加入队列`,
            highlightedLine: 31,
            variables: [
              { name: 'toCourse', value: String(toCourse), line: 28 },
              { name: 'ingressCount[toCourse]', value: '0', line: 30 },
            ],
            nodeStates: cloneNodeStates(nodeStates),
            activeEdge: null,
            inDegree: [...inDegree],
            queue: [...queue],
            learnCount,
          });
        }
      }
    }

    learnCount++;
    
    steps.push({
      id: stepId++,
      description: `完成课程 ${course}，已学习 ${learnCount} 门`,
      highlightedLine: 35,
      variables: [
        { name: 'learnCount', value: String(learnCount), line: 35 },
      ],
      nodeStates: cloneNodeStates(nodeStates),
      activeEdge: null,
      inDegree: [...inDegree],
      queue: [...queue],
      learnCount,
    });
  }

  // Final result
  const canFinish = learnCount === numCourses;
  steps.push({
    id: stepId++,
    description: `算法结束: ${canFinish ? '可以完成所有课程' : '无法完成所有课程（存在循环依赖）'}`,
    highlightedLine: 37,
    variables: [
      { name: 'learnCount', value: String(learnCount), line: 37 },
      { name: 'numCourses', value: String(numCourses), line: 37 },
      { name: 'return', value: String(canFinish), line: 37 },
    ],
    nodeStates: cloneNodeStates(nodeStates),
    activeEdge: null,
    inDegree: [...inDegree],
    queue: [],
    learnCount,
  });

  return steps;
}

/**
 * Compute initial in-degree array for given prerequisites
 */
export function computeInitialInDegree(
  numCourses: number,
  prerequisites: number[][]
): number[] {
  const inDegree = new Array(numCourses).fill(0);
  for (const [, to] of prerequisites) {
    inDegree[to]++;
  }
  return inDegree;
}

/**
 * Check if course schedule can be completed (no cycles)
 */
export function canFinishCourses(
  numCourses: number,
  prerequisites: number[][]
): boolean {
  const inDegree = new Array(numCourses).fill(0);
  const nextMap = new Map<number, number[]>();

  for (const [from, to] of prerequisites) {
    inDegree[to]++;
    if (!nextMap.has(from)) {
      nextMap.set(from, []);
    }
    nextMap.get(from)!.push(to);
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  let count = 0;
  while (queue.length > 0) {
    const course = queue.shift()!;
    count++;
    const next = nextMap.get(course);
    if (next) {
      for (const to of next) {
        inDegree[to]--;
        if (inDegree[to] === 0) {
          queue.push(to);
        }
      }
    }
  }

  return count === numCourses;
}
