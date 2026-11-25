/**
 * Node state in the graph visualization
 */
export type NodeState = 'unvisited' | 'in-queue' | 'current' | 'completed';

/**
 * Graph node representing a course
 */
export interface GraphNode {
  id: number;
  x?: number;
  y?: number;
}

/**
 * Graph edge representing a prerequisite relationship
 */
export interface GraphEdge {
  source: number;
  target: number;
}

/**
 * Variable state for code debugging display
 */
export interface VariableState {
  name: string;
  value: string;
  line: number;
}

/**
 * A single step in the algorithm visualization
 */
export type StepOperation =
  | 'init' | 'read' | 'compare' | 'insert' | 'remove'
  | 'visit' | 'match' | 'enqueue' | 'dequeue' | 'done';

export interface AlgorithmStep {
  id: number;
  description: string;
  operation: StepOperation;
  narration: string;
  anchorIds: string[];
  highlightedLine: number;
  variables: VariableState[];
  nodeStates: Map<number, NodeState>;
  activeEdge: GraphEdge | null;
  inDegree: number[];
  queue: number[];
  learnCount: number;
}

/**
 * Input for the step generator
 */
export interface StepGeneratorInput {
  numCourses: number;
  prerequisites: number[][];
}

/**
 * Algorithm input data
 */
export interface AlgorithmInput {
  numCourses: number;
  prerequisites: [number, number][];
}

/**
 * Graph data structure
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<number, number[]>;
}

/**
 * Playback state for the visualization
 */
export interface PlaybackState {
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
}
