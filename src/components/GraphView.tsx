import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge, NodeState } from '../algorithm/types';
import './GraphView.css';

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeStates: Map<number, NodeState>;
  activeEdge: GraphEdge | null;
  inDegree?: number[];
  queue?: number[];
  stepDescription?: string;
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

    svg.selectAll('*').remove();

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

    const g = svg.append('g');
    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

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
      .selectAll('g')
      .data(simData.simLinks)
      .enter()
      .append('g')
      .attr('class', 'link-group');

    const links = linkElements
      .append('line')
      .attr('class', 'edge')
      .attr('marker-end', 'url(#arrowhead)');

    linkElements
      .append('rect')
      .attr('class', 'edge-label-bg')
      .attr('rx', 3)
      .attr('ry', 3);

    const linkLabels = linkElements
      .append('text')
      .attr('class', 'edge-label')
      .text((d) => {
        const src = typeof d.source === 'object' ? d.source.id : d.source;
        const tgt = typeof d.target === 'object' ? d.target.id : d.target;
        return `C${tgt}→C${src}`;
      });

    const nodeElements = nodeGroup
      .selectAll('g')
      .data(simData.simNodes)
      .enter()
      .append('g')
      .attr('class', 'node unvisited');

    nodeElements.append('circle')
      .attr('class', 'node-circle')
      .attr('r', 32);

    nodeElements.append('text')
      .attr('class', 'node-id')
      .attr('dy', -8)
      .text((d) => `课程 ${d.id}`);

    nodeElements.append('text')
      .attr('class', 'node-state')
      .attr('dy', 10)
      .text('未访问');

    nodeElements.append('circle')
      .attr('class', 'badge in-degree-badge')
      .attr('cx', 28)
      .attr('cy', -28)
      .attr('r', 12);

    nodeElements.append('text')
      .attr('class', 'badge-value in-degree-value')
      .attr('x', 28)
      .attr('y', -24)
      .text('0');

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

      nodeElements.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
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


  // Update node states and labels - animate completed nodes disappearing
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.selectAll<SVGGElement, SimNode>('.node').each(function(d) {
      const node = d3.select(this);
      const state = nodeStates.get(d.id) || 'unvisited';
      const currentClass = node.attr('class');
      const wasCompleted = currentClass.includes('completed');
      
      node.attr('class', `node ${state}`);
      
      // Animate fade out when becoming completed
      if (state === 'completed' && !wasCompleted) {
        node
          .style('opacity', 1)
          .transition()
          .duration(600)
          .style('opacity', 0)
          .on('end', function() {
            d3.select(this).style('display', 'none');
          });
      } else if (state === 'completed') {
        node.style('display', 'none').style('opacity', 0);
      } else {
        node.style('display', null).style('opacity', 1);
      }
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
        if (sourceState === 'completed') classes += ' removed';
        return classes;
      })
      .attr('marker-end', (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const isActive = activeEdge && sourceId === activeEdge.source && targetId === activeEdge.target;
        const sourceState = nodeStates.get(sourceId) || 'unvisited';
        
        if (sourceState === 'completed') return 'url(#arrowhead-removed)';
        return isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)';
      });

    // Animate edges from completed nodes disappearing
    svg.selectAll<SVGGElement, SimLink>('.link-group').each(function(d) {
      const link = d3.select(this);
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const sourceState = nodeStates.get(sourceId) || 'unvisited';
      const currentClass = link.attr('class');
      const wasRemoved = currentClass.includes('removed');
      
      if (sourceState === 'completed' && !wasRemoved) {
        link
          .attr('class', 'link-group removed')
          .style('opacity', 1)
          .transition()
          .duration(600)
          .style('opacity', 0)
          .on('end', function() {
            d3.select(this).style('display', 'none');
          });
      } else if (sourceState === 'completed') {
        link.attr('class', 'link-group removed').style('display', 'none').style('opacity', 0);
      } else {
        link.attr('class', 'link-group').style('display', null).style('opacity', 1);
      }
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
    let unvisited = 0, inQueue = 0, completed = 0;
    nodes.forEach((node) => {
      const state = nodeStates.get(node.id) || 'unvisited';
      if (state === 'unvisited') unvisited++;
      else if (state === 'in-queue') inQueue++;
      else if (state === 'completed') completed++;
    });
    return { unvisited, inQueue, completed, total: nodes.length };
  }, [nodes, nodeStates]);

  const isComplete = stats.completed === numCourses;
  const hasCycle = learnCount < numCourses && queue.length === 0 && stats.completed === learnCount && learnCount > 0;

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
            <span className="step-icon">📍</span>
            <span>{stepDescription}</span>
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
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
            <div className="progress-text">{Math.round((stats.completed / stats.total) * 100)}% 完成</div>
          </div>
          <div className={`result-badge ${isComplete ? 'success' : hasCycle ? 'error' : 'pending'}`}>
            {isComplete ? '✅ 可以完成所有课程' : hasCycle ? '❌ 存在循环依赖' : '⏳ 算法执行中...'}
          </div>
        </div>

        {/* Bottom - Queue */}
        <div className="overlay-panel bottom-left">
          <div className="panel-title">📥 BFS队列 (先进先出)</div>
          <div className="queue-container">
            {queue.length === 0 ? (
              <span className="queue-empty">队列为空</span>
            ) : (
              queue.map((nodeId, idx) => (
                <div key={idx} className="queue-item">
                  {idx === 0 && <div className="queue-front">队首 ▼</div>}
                  <div className="queue-item-id">课程 {nodeId}</div>
                  <div className="queue-item-hint">入度=0</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
