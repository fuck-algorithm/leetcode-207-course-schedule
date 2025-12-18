import { useState } from 'react';
import './InputPanel.css';

interface InputPanelProps {
  onSubmit: (numCourses: number, prerequisites: number[][]) => void;
  defaultNumCourses: number;
  defaultPrerequisites: number[][];
}

export default function InputPanel({
  onSubmit,
  defaultNumCourses,
  defaultPrerequisites,
}: InputPanelProps) {
  const [numCourses, setNumCourses] = useState(defaultNumCourses.toString());
  const [prerequisites, setPrerequisites] = useState(
    JSON.stringify(defaultPrerequisites)
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const num = parseInt(numCourses, 10);
      if (isNaN(num) || num < 1 || num > 20) {
        setError('课程数量必须是 1-20 之间的整数');
        return;
      }

      const prereqs = JSON.parse(prerequisites);
      if (!Array.isArray(prereqs)) {
        setError('先修课程必须是数组格式');
        return;
      }

      for (const pair of prereqs) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          setError('每个先修关系必须是 [a, b] 格式');
          return;
        }
        if (pair[0] < 0 || pair[0] >= num || pair[1] < 0 || pair[1] >= num) {
          setError(`课程编号必须在 0 到 ${num - 1} 之间`);
          return;
        }
      }

      setError(null);
      onSubmit(num, prereqs);
    } catch {
      setError('先修课程格式错误，请使用 JSON 数组格式');
    }
  };

  const generateRandom = () => {
    // 随机课程数量 3-8
    const num = Math.floor(Math.random() * 6) + 3;
    
    // 生成随机 DAG（有向无环图）
    const prereqs: number[][] = [];
    const edgeCount = Math.floor(Math.random() * (num * 2)) + 1;
    const existingEdges = new Set<string>();
    
    for (let i = 0; i < edgeCount; i++) {
      // 确保 from > to 来避免环
      const to = Math.floor(Math.random() * (num - 1));
      const from = Math.floor(Math.random() * (num - to - 1)) + to + 1;
      const key = `${from}-${to}`;
      
      if (!existingEdges.has(key)) {
        existingEdges.add(key);
        prereqs.push([from, to]);
      }
    }
    
    setNumCourses(num.toString());
    setPrerequisites(JSON.stringify(prereqs));
    setError(null);
    onSubmit(num, prereqs);
  };

  return (
    <div className="input-panel">
      <div className="input-group">
        <label>课程数量 (numCourses):</label>
        <input
          type="number"
          value={numCourses}
          onChange={(e) => setNumCourses(e.target.value)}
          min="1"
          max="20"
        />
      </div>
      <div className="input-group">
        <label>先修课程 (prerequisites):</label>
        <input
          type="text"
          value={prerequisites}
          onChange={(e) => setPrerequisites(e.target.value)}
          placeholder="[[1,0],[2,1]]"
        />
      </div>
      {error && <div className="input-error">{error}</div>}
      <button className="run-button" onClick={handleSubmit}>
        运行
      </button>
      <button className="random-button" onClick={generateRandom}>
        🎲 随机生成
      </button>
    </div>
  );
}
