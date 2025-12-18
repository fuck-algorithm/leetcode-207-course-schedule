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
      // 校验课程数量
      const trimmedNum = numCourses.trim();
      if (!trimmedNum) {
        setError('请输入课程数量');
        return;
      }
      const num = parseInt(trimmedNum, 10);
      if (isNaN(num) || !Number.isInteger(num)) {
        setError('课程数量必须是整数');
        return;
      }
      if (num < 1 || num > 20) {
        setError('课程数量必须是 1-20 之间的整数');
        return;
      }

      // 校验先修课程格式
      const trimmedPrereqs = prerequisites.trim();
      if (!trimmedPrereqs) {
        setError('请输入先修课程数组');
        return;
      }

      let prereqs: unknown;
      try {
        prereqs = JSON.parse(trimmedPrereqs);
      } catch {
        setError('先修课程格式错误，请使用 JSON 数组格式，如 [[1,0],[2,1]]');
        return;
      }

      if (!Array.isArray(prereqs)) {
        setError('先修课程必须是数组格式，如 [[1,0],[2,1]]');
        return;
      }

      // 校验每个先修关系
      const edgeSet = new Set<string>();
      for (let i = 0; i < prereqs.length; i++) {
        const pair = prereqs[i];
        if (!Array.isArray(pair) || pair.length !== 2) {
          setError(`第 ${i + 1} 个先修关系格式错误，必须是 [a, b] 格式`);
          return;
        }
        const [a, b] = pair;
        if (typeof a !== 'number' || typeof b !== 'number' || !Number.isInteger(a) || !Number.isInteger(b)) {
          setError(`第 ${i + 1} 个先修关系中的课程编号必须是整数`);
          return;
        }
        if (a < 0 || a >= num) {
          setError(`第 ${i + 1} 个先修关系中的课程 ${a} 超出范围 (0-${num - 1})`);
          return;
        }
        if (b < 0 || b >= num) {
          setError(`第 ${i + 1} 个先修关系中的课程 ${b} 超出范围 (0-${num - 1})`);
          return;
        }
        if (a === b) {
          setError(`第 ${i + 1} 个先修关系中课程不能依赖自己`);
          return;
        }
        // 检查重复边
        const edgeKey = `${a}-${b}`;
        if (edgeSet.has(edgeKey)) {
          setError(`存在重复的先修关系 [${a}, ${b}]`);
          return;
        }
        edgeSet.add(edgeKey);
      }

      setError(null);
      onSubmit(num, prereqs as number[][]);
    } catch {
      setError('输入数据格式错误，请检查后重试');
    }
  };

  const generateRandom = () => {
    // 使用用户输入的课程数量
    const num = parseInt(numCourses, 10);
    if (isNaN(num) || num < 2 || num > 20) {
      setError('请先输入有效的课程数量 (2-20)');
      return;
    }

    // 生成连通的随机 DAG（有向无环图）
    // 策略：先生成一条主链保证基本连通，再随机添加额外边
    const edges: number[][] = [];
    const existingEdges = new Set<string>();

    // 随机打乱节点顺序，作为拓扑序
    const topoOrder = Array.from({ length: num }, (_, i) => i);
    for (let i = topoOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topoOrder[i], topoOrder[j]] = [topoOrder[j], topoOrder[i]];
    }

    // 第一步：生成主链，确保图基本连通
    // 每个节点（除了第一个）至少有一条来自前面节点的边
    for (let i = 1; i < num; i++) {
      // 从前面的节点中随机选一个作为前置
      const prevIdx = Math.floor(Math.random() * i);
      const from = topoOrder[i]; // 后面的节点
      const to = topoOrder[prevIdx]; // 前面的节点作为前置
      const key = `${from}-${to}`;
      existingEdges.add(key);
      edges.push([from, to]);
    }

    // 第二步：随机添加额外边增加复杂度
    // 额外边数量：节点数的 50%-100%
    const extraEdgeCount = Math.floor(Math.random() * (num / 2)) + Math.floor(num / 2);
    let attempts = 0;
    const maxAttempts = extraEdgeCount * 3;

    while (edges.length < num - 1 + extraEdgeCount && attempts < maxAttempts) {
      attempts++;
      // 随机选两个不同位置的节点，确保拓扑序正确（后面指向前面）
      const idx1 = Math.floor(Math.random() * (num - 1)) + 1;
      const idx2 = Math.floor(Math.random() * idx1);
      const from = topoOrder[idx1];
      const to = topoOrder[idx2];
      const key = `${from}-${to}`;

      if (!existingEdges.has(key)) {
        existingEdges.add(key);
        edges.push([from, to]);
      }
    }

    setPrerequisites(JSON.stringify(edges));
    setError(null);
    onSubmit(num, edges);
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
      <button className="random-button" onClick={generateRandom}>
        🎲 随机生成指定节点个数的有向无环图
      </button>
      <button className="run-button" onClick={handleSubmit}>
        运行
      </button>
    </div>
  );
}
