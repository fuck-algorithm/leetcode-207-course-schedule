import './DataStructuresPanel.css';

interface DataStructuresPanelProps {
  inDegree: number[];
  queue: number[];
  learnCount: number;
  numCourses: number;
  highlightedIndex: number | null;
  isComplete: boolean;
}

export default function DataStructuresPanel({
  inDegree,
  queue,
  learnCount,
  numCourses,
  highlightedIndex,
  isComplete,
}: DataStructuresPanelProps) {
  const canFinish = learnCount === numCourses;

  return (
    <div className="data-structures-panel">
      <div className="data-section">
        <div className="data-section-title">入度数组 (ingressCount)</div>
        <div className="in-degree-array">
          {inDegree.map((value, index) => (
            <div
              key={index}
              className={`in-degree-item ${highlightedIndex === index ? 'highlighted' : ''}`}
            >
              <span className="in-degree-index">[{index}]</span>
              <span className="in-degree-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="data-section">
        <div className="data-section-title">队列 (queue)</div>
        <div className="queue-container">
          <span className="queue-label">前端 →</span>
          <div className="queue-items">
            {queue.length > 0 ? (
              queue.map((course, index) => (
                <div key={index} className="queue-item">
                  {course}
                </div>
              ))
            ) : (
              <span className="queue-empty">空</span>
            )}
          </div>
          <span className="queue-label">← 后端</span>
        </div>
      </div>

      <div className="data-section">
        <div className="data-section-title">执行结果</div>
        <div className="result-section">
          <span className="learn-count">
            已学习课程: <span className="learn-count-value">{learnCount}</span> / {numCourses}
          </span>
          {isComplete && (
            <span className={`result-badge ${canFinish ? 'success' : 'failure'}`}>
              {canFinish ? 'TRUE - 可完成' : 'FALSE - 无法完成'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
