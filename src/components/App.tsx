import { useMemo, useState, useCallback } from 'react';
import Header from './Header';
import InputPanel from './InputPanel';
import CodePanel from './CodePanel';
import GraphView from './GraphView';
import DataStructuresPanel from './DataStructuresPanel';
import ControlPanel from './ControlPanel';
import ProgressBar from './ProgressBar';
import { usePlayback } from '../hooks/usePlayback';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { generateSteps } from '../algorithm/stepGenerator';
import { GraphNode, GraphEdge } from '../algorithm/types';
import './App.css';

// Default example input
const DEFAULT_NUM_COURSES = 4;
const DEFAULT_PREREQUISITES: number[][] = [
  [1, 0],
  [2, 0],
  [3, 1],
  [3, 2],
];

function App() {
  const [numCourses, setNumCourses] = useState(DEFAULT_NUM_COURSES);
  const [prerequisites, setPrerequisites] = useState(DEFAULT_PREREQUISITES);

  // Generate algorithm steps
  const steps = useMemo(
    () => generateSteps({ numCourses, prerequisites }),
    [numCourses, prerequisites]
  );

  // Build graph data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    for (let i = 0; i < numCourses; i++) {
      nodes.push({ id: i });
    }

    const edges: GraphEdge[] = prerequisites.map(([from, to]) => ({
      source: from,
      target: to,
    }));

    return { nodes, edges };
  }, [numCourses, prerequisites]);

  // Handle input change
  const handleInputSubmit = useCallback((newNumCourses: number, newPrerequisites: number[][]) => {
    setNumCourses(newNumCourses);
    setPrerequisites(newPrerequisites);
  }, []);

  // Playback state
  const {
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
  } = usePlayback({
    totalSteps: steps.length,
    playbackSpeed: 1000,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPrevious: goToPrevious,
    onNext: goToNext,
    onTogglePlay: toggle,
  });

  // Current step data
  const currentStep = steps[currentStepIndex];
  const isComplete = currentStepIndex === steps.length - 1;

  return (
    <div className="app">
      <Header
        title="207. 课程表"
        leetcodeUrl="https://leetcode.cn/problems/course-schedule/"
        githubUrl="https://github.com/fuck-algorithm/leetcode-207-course-schedule"
      />

      <InputPanel
        onSubmit={handleInputSubmit}
        defaultNumCourses={DEFAULT_NUM_COURSES}
        defaultPrerequisites={DEFAULT_PREREQUISITES}
      />

      <main className="main-content">
        <section className="code-section">
          <div className="section-title">算法代码</div>
          <div className="section-content">
            <CodePanel
              highlightedLine={currentStep.highlightedLine}
              variables={currentStep.variables}
            />
          </div>
        </section>

        <section className="graph-section">
          <div className="section-title">课程依赖图</div>
          <div className="section-content">
            <GraphView
              nodes={graphData.nodes}
              edges={graphData.edges}
              nodeStates={currentStep.nodeStates}
              activeEdge={currentStep.activeEdge}
              inDegree={currentStep.inDegree}
              queue={currentStep.queue}
              stepDescription={currentStep.description}
              learnCount={currentStep.learnCount}
              numCourses={numCourses}
            />
          </div>
        </section>

        <section className="data-section">
          <div className="section-title">数据结构</div>
          <div className="section-content">
            <DataStructuresPanel
              inDegree={currentStep.inDegree}
              queue={currentStep.queue}
              learnCount={currentStep.learnCount}
              numCourses={numCourses}
              highlightedIndex={null}
              isComplete={isComplete}
            />
          </div>
        </section>
      </main>

      <ControlPanel
        isPlaying={isPlaying}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        stepDescription={currentStep.description}
        onPlay={play}
        onPause={pause}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />

      <ProgressBar
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        onSeek={goToStep}
      />
    </div>
  );
}

export default App;
