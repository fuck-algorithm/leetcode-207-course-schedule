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
    operation: 'init',
    narration: `建立 ${numCourses} 门课程的依赖状态，后续用入度判断每门课是否已具备学习条件。`,
    anchorIds: ['initialize'],
    highlightedLine: 9,
    variables: [
      { name: 'numCourses', value: String(numCourses), line: 6 },
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
      operation: 'insert',
      narration: `登记课程 ${from} 对课程 ${to} 的依赖，并增加课程 ${to} 的剩余先修数。`,
      anchorIds: ['add-prerequisite'],
      highlightedLine: 15,
      variables: [
        { name: 'from', value: String(from), line: 13 },
        { name: 'to', value: String(to), line: 14 },
        { name: 'ingressCount[to]', value: String(inDegree[to]), line: 15 },
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
    description: '扫描每门课程的入度，寻找队列初始项',
    operation: 'read',
    narration: '扫描每门课程的入度；入度为零表示没有未完成的先修课，可以进入学习队列。',
    anchorIds: ['find-zero-indegree'],
    highlightedLine: 21,
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
        operation: 'enqueue',
        narration: `课程 ${i} 已无未完成的先修要求，因此加入队尾等待处理。`,
        anchorIds: ['enqueue-course'],
        highlightedLine: 25,
        variables: [
          { name: 'i', value: String(i), line: 22 },
          { name: 'ingressCount[i]', value: '0', line: 23 },
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
    nodeStates.set(course, 'current');

    steps.push({
      id: stepId++,
      description: `从队列取出课程 ${course}`,
      operation: 'dequeue',
      narration: `队首课程 ${course} 已满足所有先修条件，取出后释放它指向的后续课程。`,
      anchorIds: ['dequeue-course'],
      highlightedLine: 29,
      variables: [
        { name: 'course', value: String(course), line: 29 },
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
          operation: 'compare',
          narration: `处理课程 ${course} 的依赖边，移除它对课程 ${toCourse} 的一项限制，剩余先修数减一。`,
          anchorIds: ['release-prerequisite'],
          highlightedLine: 33,
          variables: [
            { name: 'toCourse', value: String(toCourse), line: 32 },
            { name: 'ingressCount[toCourse]', value: String(inDegree[toCourse]), line: 33 },
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
            operation: 'enqueue',
            narration: `课程 ${toCourse} 的限制已全部解除，因此将其加入队列，等待后续学习。`,
            anchorIds: ['enqueue-course'],
            highlightedLine: 35,
            variables: [
              { name: 'toCourse', value: String(toCourse), line: 32 },
              { name: 'ingressCount[toCourse]', value: '0', line: 35 },
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
    nodeStates.set(course, 'completed');

    steps.push({
      id: stepId++,
      description: `完成课程 ${course}，已学习 ${learnCount} 门`,
      operation: 'visit',
      narration: `课程 ${course} 的出边已检查完毕，将它计入完成数 ${learnCount}，让轨迹保留已学课程。`,
      anchorIds: ['complete-course'],
      highlightedLine: 39,
      variables: [
        { name: 'learnCount', value: String(learnCount), line: 39 },
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
    operation: 'done',
    narration: canFinish
      ? `已处理全部 ${numCourses} 门课程，拓扑序完整，因此课程安排可行。`
      : `仅处理 ${learnCount}/${numCourses} 门课程，仍有依赖无法解除，因此图中存在环。`,
    anchorIds: ['return-result'],
    highlightedLine: 39,
    variables: [
      { name: 'learnCount', value: String(learnCount), line: 27 },
      { name: 'numCourses', value: String(numCourses), line: 6 },
      { name: 'return', value: String(canFinish), line: 39 },
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
