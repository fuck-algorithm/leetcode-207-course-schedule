import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge, NodeState } from '../algorithm/types';
import { MOTION, motionDuration } from '../algorithm/motion';
import './GraphView.css';

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeStates: Map<number, NodeState>;
  activeEdge: GraphEdge | null;
  inDegree?: number[];
  queue?: number[];
  stepDescription?: string;
  stepOperation?: string;
  narration?: string;
  learnCount?: number;
  numCourses?: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | number;
  target: SimNode | number;
}

const STATE_LABELS: Record<NodeState, string> = {
  unvisited: '未访问',
  'in-queue': '队列中',
  current: '当前处理',
  completed: '已学完',
};

export default function GraphView({
  nodes,
  edges,
  nodeStates,
  activeEdge,
  inDegree = [],
  queue = [],
  stepDescription = '',
  stepOperation = 'read',
  narration = stepDescription,
  learnCount = 0,
  numCourses = 0,
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Create simulation nodes and links
  const simData = useMemo(() => {
    const simNodes: SimNode[] = nodes.map((n) => ({ id: n.id }));
    const simLinks: SimLink[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
    return { simNodes, simLinks };
  }, [nodes, edges]);

  // Initialize D3 force simulation
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // This effect runs only when the graph structure changes; step changes update keyed elements below.
    svg.select('defs').remove();
    svg.select('.canvas-group').remove();

    // Defs for markers
    const defs = svg.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('class', 'edge-arrow');

    defs.append('marker')
      .attr('id', 'arrowhead-active')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#61afef');

    // Removed edge arrow (faded)
    defs.append('marker')
      .attr('id', 'arrowhead-removed')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', 'rgba(108, 108, 108, 0.3)');

    const g = svg.append('g').attr('class', 'canvas-group');
    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    // Add zoom and pan behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3]) // Min 30%, Max 300% zoom
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    
    // Double-click to reset view
    svg.on('dblclick.zoom', () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      svg.transition().duration(reducedMotion ? 0 : 500).call(zoom.transform, d3.zoomIdentity);
    });

    const simulation = d3
      .forceSimulation<SimNode>(simData.simNodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(simData.simLinks)
          .id((d) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const linkElements = linkGroup
      .selectAll<SVGGElement, SimLink>('g.link-group')
      .data(simData.simLinks, (d) => {
        const source = typeof d.source === 'object' ? d.source.id : d.source;
        const target = typeof d.target === 'object' ? d.target.id : d.target;
        return `${source}->${target}`;
      })
      .join('g')
      .attr('class', 'link-group');

    linkElements.each(function(d) {
      const group = d3.select(this);
      if (group.select('.edge').empty()) {
        const source = typeof d.source === 'object' ? d.source.id : d.source;
        const target = typeof d.target === 'object' ? d.target.id : d.target;
        group.append('line')
          .attr('class', 'edge')
          .attr('marker-end', 'url(#arrowhead)');
        group.append('rect')
          .attr('class', 'edge-label-bg')
          .attr('rx', 3)
          .attr('ry', 3);
        group.append('text')
          .attr('class', 'edge-label')
          .text(`C${target}→C${source}`);
      }
    });

    const links = linkElements.select<SVGLineElement>('.edge');
    const linkLabels = linkElements.select<SVGTextElement>('.edge-label');

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, SimNode>('g.node')
      .data(simData.simNodes, (d) => d.id)
      .join('g')
      .attr('class', 'node unvisited')
      .attr('data-node-id', (d) => `course-${d.id}`);

    nodeElements.each(function(d) {
      const group = d3.select(this);
      if (group.select('.node-circle').empty()) {
        group.append('circle').attr('class', 'node-circle').attr('r', 32);
        group.append('text').attr('class', 'node-id').attr('dy', -8).text(`课程 ${d.id}`);
        group.append('text').attr('class', 'node-state').attr('dy', 10).text('未访问');
        group.append('circle').attr('class', 'badge in-degree-badge').attr('cx', 28).attr('cy', -28).attr('r', 12);
        group.append('text').attr('class', 'badge-value in-degree-value').attr('x', 28).attr('y', -24).text('0');
      }
    });

    const coordinates = new Map<number, { x: number; y: number }>();
    simulation.on('tick', () => {
      links
        .attr('x1', (d) => (d.source as SimNode).x || 0)
        .attr('y1', (d) => (d.source as SimNode).y || 0)
        .attr('x2', (d) => (d.target as SimNode).x || 0)
        .attr('y2', (d) => (d.target as SimNode).y || 0);

      linkLabels
        .attr('x', (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr('y', (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2 - 12);

      linkElements.selectAll<SVGRectElement, SimLink>('.edge-label-bg')
        .attr('x', (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2 - 28)
        .attr('y', (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2 - 24)
        .attr('width', 56)
        .attr('height', 18);

      nodeElements.attr('transform', (d) => {
        const point = { x: d.x || 0, y: d.y || 0 };
        coordinates.set(d.id, point);
        return `translate(${point.x},${point.y})`;
      });
      if (simulation.alpha() < 0.05) simulation.stop();
    });

    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    return () => {
      simulation.stop();
    };
  }, [simData]);


  // Update node states in place so each course keeps its identity and position.
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stateDuration = motionDuration(MOTION.stateMs, 1, reducedMotion);

    svg.selectAll<SVGGElement, SimNode>('.node').each(function(d) {
      const node = d3.select(this);
      const state = nodeStates.get(d.id) || 'unvisited';
      node
        .interrupt('state')
        .attr('class', `node ${state}`)
        .attr('data-status', state)
        .style('display', null)
        .style('opacity', 1)
        .select<SVGCircleElement>('.node-circle')
        .transition('state')
        .duration(stateDuration)
        .attr('r', state === 'current' ? 36 : 32);
    });

    svg.selectAll<SVGTextElement, SimNode>('.node-state').text((d) => {
      const state = nodeStates.get(d.id) || 'unvisited';
      return STATE_LABELS[state];
    });
  }, [nodeStates]);

  // Update edges based on node states and active edge
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Update edge classes based on source node state
    svg.selectAll<SVGLineElement, SimLink>('.edge')
      .attr('class', (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const isActive = activeEdge && sourceId === activeEdge.source && targetId === activeEdge.target;
        const sourceState = nodeStates.get(sourceId) || 'unvisited';
        
        let classes = 'edge';
        if (isActive) classes += ' active';
        classes += ` target-${nodeStates.get(targetId) || 'unvisited'}`;
        if (sourceState === 'completed') classes += ' released';
        return classes;
      })
      .attr('marker-end', (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const isActive = activeEdge && sourceId === activeEdge.source && targetId === activeEdge.target;
        const sourceState = nodeStates.get(sourceId) || 'unvisited';
        
        if (sourceState === 'completed') return 'url(#arrowhead)';
        return isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)';
      });

    svg.selectAll<SVGGElement, SimLink>('.link-group').each(function(d) {
      const link = d3.select(this);
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const isActive = activeEdge && sourceId === activeEdge.source && targetId === activeEdge.target;
      const sourceState = nodeStates.get(sourceId) || 'unvisited';
      const targetState = nodeStates.get(targetId) || 'unvisited';
      link
        .interrupt('state')
        .attr('class', `link-group${sourceState === 'completed' ? ' released' : ''}${isActive ? ' active' : ''} target-${targetState}`)
        .style('display', null)
        .style('opacity', 1);
    });
  }, [activeEdge, nodeStates]);

  // Update in-degree display
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.selectAll<SVGTextElement, SimNode>('.in-degree-value').text((d) => inDegree[d.id] ?? 0);

    svg.selectAll<SVGCircleElement, SimNode>('.in-degree-badge').attr('class', (d) => {
      const deg = inDegree[d.id] ?? 0;
      return deg === 0 ? 'badge in-degree-badge ready' : 'badge in-degree-badge';
    });
  }, [inDegree]);

  // Stats
  const stats = useMemo(() => {
    let unvisited = 0, inQueue = 0, current = 0, completed = 0;
    nodes.forEach((node) => {
      const state = nodeStates.get(node.id) || 'unvisited';
      if (state === 'unvisited') unvisited++;
      else if (state === 'in-queue') inQueue++;
      else if (state === 'current') current++;
      else if (state === 'completed') completed++;
    });
    return { unvisited, inQueue, current, completed, total: nodes.length };
  }, [nodes, nodeStates]);

  const isComplete = learnCount === numCourses;
  const hasCycle = stepOperation === 'done' && learnCount < numCourses;
  const queueCapacity = Math.max(4, numCourses);

  return (
    <div className="graph-view">
      {/* D3 managed SVG - no React children */}
      <svg ref={svgRef} className="graph-svg" />

      {/* React managed overlay panels */}
      <div className="graph-overlay">
        {/* Top left - Legend */}
        <div className="overlay-panel top-left">
          <div className="panel-title">拓扑排序可视化</div>
          <div className="panel-subtitle">BFS (Kahn算法)</div>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-dot unvisited"></span>
              <span>未访问 ({stats.unvisited})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot current"></span>
              <span>当前处理 ({stats.current})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot in-queue"></span>
              <span>队列中 ({stats.inQueue})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot completed"></span>
              <span>已完成 ({stats.completed})</span>
            </div>
          </div>
          <div className="legend-hint">
            <div>节点右上角数字 = 入度</div>
            <div>(剩余前置课程数)</div>
            <div className="highlight">入度=0 表示可以学习</div>
          </div>
        </div>

        {/* Top center - Step description */}
        {stepDescription && (
          <div className="overlay-panel top-center">
            <span className="operation-badge" data-operation={stepOperation}>
              {{ init: '初始化', read: '读取', compare: '比较', insert: '记录依赖', remove: '解除依赖', visit: '完成课程', match: '命中', enqueue: '入队', dequeue: '出队', done: '完成' }[stepOperation] ?? stepOperation}
            </span>
            <div className="step-copy">
              <span>{stepDescription}</span>
              <span className="step-narration" aria-live="polite">{narration}</span>
            </div>
          </div>
        )}

        {/* Top right - Stats */}
        <div className="overlay-panel top-right">
          <div className="panel-title">📊 算法状态</div>
          <div className="stat-row">
            <span>总课程数:</span>
            <span className="stat-value">{numCourses}</span>
          </div>
          <div className="stat-row">
            <span>已学习:</span>
            <span className="stat-value">{learnCount}</span>
          </div>
          <div className="stat-row">
            <span>依赖边数:</span>
            <span className="stat-value">{edges.length}</span>
          </div>
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(learnCount / numCourses) * 100}%` }}
              />
            </div>
            <div className="progress-text">{Math.round((learnCount / numCourses) * 100)}% 完成</div>
          </div>
          <div className={`result-badge ${isComplete ? 'success' : hasCycle ? 'error' : 'pending'}`}>
            {isComplete ? '✅ 可以完成所有课程' : hasCycle ? '❌ 存在循环依赖' : '⏳ 算法执行中...'}
          </div>
        </div>

        {/* Bottom right - Controls hint */}
        <div className="overlay-panel bottom-right controls-hint">
          <div>🖱️ 滚轮缩放 | 拖拽平移 | 双击重置</div>
        </div>

        {/* Bottom - Queue */}
        <div className="overlay-panel bottom-left">
          <div className="panel-title">BFS 队列 · 队首 → 队尾 · {queue.length}/{queueCapacity}</div>
          <div className="queue-direction" aria-hidden="true">← 出队 · 入队 →</div>
          <div className="queue-container" data-container-kind="queue">
            {Array.from({ length: queueCapacity }, (_, index) => {
              const nodeId = queue[index];
              return (
                <div key={nodeId ?? `empty-${index}`} className={`queue-slot${nodeId === undefined ? ' empty' : ''}`}>
                  {index === 0 && queue.length > 0 && <div className="queue-front">队首</div>}
                  {index === queue.length - 1 && queue.length > 0 && <div className="queue-tail">队尾</div>}
                  {nodeId === undefined ? <span className="queue-empty">{queue.length === 0 && index === 0 ? '队列为空' : '空槽'}</span> : (
                    <>
                      <div className="queue-item-id">课程 {nodeId}</div>
                      <div className="queue-item-hint">入度为零</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
