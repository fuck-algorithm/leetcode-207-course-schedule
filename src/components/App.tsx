import { useMemo, useState, useCallback, useEffect } from 'react';
import Header from './Header';
import InputPanel from './InputPanel';
import CodePanel from './CodePanel';
import GraphView from './GraphView';
import ControlPanel from './ControlPanel';
import ProgressBar from './ProgressBar';
import WechatFloat from './WechatFloat';
import { usePlayback } from '../hooks/usePlayback';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { generateSteps } from '../algorithm/stepGenerator';
import { readPlaybackSpeed, writePlaybackSpeed } from '../algorithm/playbackPreferences';
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
  const [showCode, setShowCode] = useState(false);
  const [numCourses, setNumCourses] = useState(DEFAULT_NUM_COURSES);
  const [prerequisites, setPrerequisites] = useState(DEFAULT_PREREQUISITES);
  const [playbackSpeed, setPlaybackSpeed] = useState(() => readPlaybackSpeed(window.localStorage));

  useEffect(() => {
    writePlaybackSpeed(window.localStorage, playbackSpeed);
  }, [playbackSpeed]);

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
    playbackSpeed,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPrevious: goToPrevious,
    onNext: goToNext,
    onTogglePlay: toggle,
    onReset: () => goToStep(0),
  });

  // Current step data
  const currentStep = steps[currentStepIndex];

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

      <main className={`main-content${showCode ? ' code-open' : ''}`}>
        <section className="graph-section" data-testid="graph-canvas-card">
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
              stepOperation={currentStep.operation}
              narration={currentStep.narration}
              learnCount={currentStep.learnCount}
              numCourses={numCourses}
            />
          </div>
        </section>

        {showCode && (
          <aside className="code-drawer" aria-label="算法代码">
            <div className="section-title">算法代码</div>
            <button className="drawer-close" aria-label="关闭代码面板" onClick={() => setShowCode(false)}>×</button>
            <div className="section-content">
              <CodePanel
                highlightedLine={currentStep.highlightedLine}
                variables={currentStep.variables}
              />
            </div>
          </aside>
        )}
        <button
          className="code-toggle"
          aria-label={showCode ? '关闭代码面板' : '打开算法代码'}
          aria-expanded={showCode}
          onClick={() => setShowCode((visible) => !visible)}
        >
          <span aria-hidden="true">{showCode ? '‹' : '{ }'}</span>
          {showCode ? '收起代码' : '查看代码'}
        </button>
        <div className="canvas-measure" aria-label="画布主视图">主视图 · 课程依赖</div>
      </main>

      <ControlPanel
        isPlaying={isPlaying}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        stepDescription={currentStep.description}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        onPlay={play}
        onPause={pause}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onReset={() => goToStep(0)}
      />

      <ProgressBar
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        onSeek={goToStep}
      />

      <WechatFloat />
    </div>
  );
}

export default App;
