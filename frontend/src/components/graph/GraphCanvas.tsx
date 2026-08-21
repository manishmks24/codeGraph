import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode, CustomNodeData } from './CustomNode';
import { CodeGraph, BlastRadiusReport, NodeType, CodeNode } from '../../types';
import { Filter, Flame, X, Info, Share2, Layers, ZoomIn, ZoomOut, Maximize2, ChevronUp, ChevronDown } from 'lucide-react';

interface GraphCanvasProps {
  graph: CodeGraph | null;
  blastRadius: BlastRadiusReport | null;
  theme?: 'dark' | 'light';
  onClearBlastRadius: () => void;
  onSelectNode: (node: CodeNode) => void;
  onTriggerBlastRadius: (nodeId: string) => void;
  onOpenExportModal?: () => void;
}

const nodeTypes = {
  custom: CustomNode,
};

const GraphCanvasInner: React.FC<GraphCanvasProps> = ({
  graph,
  blastRadius,
  theme = 'dark',
  onClearBlastRadius,
  onSelectNode,
  onTriggerBlastRadius,
  onOpenExportModal
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);
  const isDark = theme === 'dark';
  const { fitView } = useReactFlow();

  // Layer node count summary
  const nodeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ENDPOINT: 0,
      CONTROLLER: 0,
      SERVICE: 0,
      REPOSITORY: 0,
      ENTITY: 0,
      EVENT_LISTENER: 0
    };
    (graph?.nodes || []).forEach(n => {
      if (counts[n.type] !== undefined) counts[n.type]++;
    });
    return counts;
  }, [graph]);

  // Convert CodeGraph to React Flow Nodes & Edges with hierarchical positioning
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!graph || !graph.nodes) {
      return { initialNodes: [], initialEdges: [] };
    }

    const typeOrder: Record<NodeType, number> = {
      ENDPOINT: 0,
      CONTROLLER: 1,
      SERVICE: 2,
      REPOSITORY: 3,
      ENTITY: 4,
      EVENT_LISTENER: 2,
      KAFKA_TOPIC: 3,
      INTERFACE: 2,
      CONFIGURATION: 4,
      METHOD: 2,
      COMPONENT: 2
    };

    // Group nodes by layer/level
    const layerMap: Map<number, CodeNode[]> = new Map();
    graph.nodes.forEach(node => {
      if (filterType !== 'ALL' && node.type !== filterType) return;
      const layer = typeOrder[node.type] ?? 2;
      if (!layerMap.has(layer)) layerMap.set(layer, []);
      layerMap.get(layer)!.push(node);
    });

    const nodes: Node[] = [];
    const layerHeight = 175;
    const nodeWidth = 280;

    layerMap.forEach((layerNodes, layerIndex) => {
      const totalWidth = layerNodes.length * nodeWidth;
      const startX = -(totalWidth / 2) + 140;

      layerNodes.forEach((node, idx) => {
        const isBlastTarget = blastRadius?.targetNodeId === node.id || blastRadius?.targetNodeName === node.name;
        const impactedDetail = blastRadius?.impactedNodes?.find(
          n => n.id === node.id || n.name === node.name
        );
        const isBlastImpacted = Boolean(impactedDetail);

        nodes.push({
          id: node.id,
          type: 'custom',
          position: {
            x: startX + idx * nodeWidth,
            y: layerIndex * layerHeight + 40
          },
          data: {
            ...node,
            isBlastTarget,
            isBlastImpacted,
            hopDistance: impactedDetail?.hopDistance,
          } as unknown as Record<string, unknown>
        });
      });
    });

    // Convert Edges
    const edges: Edge[] = [];
    const validNodeIds = new Set(nodes.map(n => n.id));

    graph.edges.forEach(edge => {
      if (validNodeIds.has(edge.sourceId) && validNodeIds.has(edge.targetId)) {
        const isImpactedEdge = blastRadius && (
          nodes.find(n => n.id === edge.sourceId)?.data.isBlastImpacted ||
          nodes.find(n => n.id === edge.targetId)?.data.isBlastImpacted
        );

        edges.push({
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          animated: Boolean(isImpactedEdge),
          label: edge.label || edge.type,
          labelStyle: { fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: isDark ? '#0f172a' : '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 },
          style: {
            stroke: isImpactedEdge ? '#ef4444' : (isDark ? '#475569' : '#94a3b8'),
            strokeWidth: isImpactedEdge ? 2.5 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isImpactedEdge ? '#ef4444' : (isDark ? '#64748b' : '#94a3b8'),
          }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [graph, blastRadius, filterType, isDark]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const rawNode = graph?.nodes.find(n => n.id === node.id);
    if (rawNode) {
      onSelectNode(rawNode);
    }
  }, [graph, onSelectNode]);

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col transition-colors duration-200">
      {/* Top Filter & Toolbar */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1 sm:p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
          <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Filter:</span>
        </div>

        {[
          { key: 'ALL', label: 'All', count: graph?.nodes.length || 0 },
          { key: 'CONTROLLER', label: 'APIs', count: nodeCounts.CONTROLLER },
          { key: 'SERVICE', label: 'Services', count: nodeCounts.SERVICE },
          { key: 'REPOSITORY', label: 'Database', count: nodeCounts.REPOSITORY },
          { key: 'ENTITY', label: 'Models', count: nodeCounts.ENTITY }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-2.5 py-1 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1 ${
              filterType === tab.key
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1 rounded-full font-mono ${
              filterType === tab.key ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200/60 dark:bg-slate-800'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

        <button
          onClick={() => fitView({ duration: 400, padding: 0.2 })}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors shrink-0"
          title="Reset Zoom & Fit View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {onOpenExportModal && (
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 transition-all shadow-sm shrink-0"
            title="Export to Mermaid, C4 Model, or Cursor Rules"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export Diagram</span>
          </button>
        )}
      </div>

      {/* Blast Radius Active Banner */}
      {blastRadius && (
        <div className="absolute top-16 sm:top-4 right-3 sm:right-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl max-w-sm sm:max-w-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                  <span>Change Impact Zone:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-500/20">
                    {blastRadius.targetNodeName}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {blastRadius.totalImpactedNodes} component(s) might be affected • Break Risk:{' '}
                  <span className={`font-bold uppercase ${
                    blastRadius.riskLevel === 'CRITICAL' || blastRadius.riskLevel === 'HIGH' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {blastRadius.riskLevel}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClearBlastRadius}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
              title="Clear Blast Radius Highlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color={isDark ? '#334155' : '#cbd5e1'}
          />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const d = n.data as unknown as CustomNodeData;
              if (d?.isBlastTarget) return '#eab308';
              if (d?.isBlastImpacted) return '#ef4444';
              if (d?.type === 'CONTROLLER') return '#3b82f6';
              if (d?.type === 'SERVICE') return '#a855f7';
              if (d?.type === 'REPOSITORY') return '#f59e0b';
              if (d?.type === 'ENTITY') return '#10b981';
              return '#64748b';
            }}
            maskColor={isDark ? 'rgba(8, 13, 26, 0.7)' : 'rgba(241, 245, 249, 0.7)'}
          />
        </ReactFlow>
      </div>

      {/* Floating Layer Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden text-xs transition-all">
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="w-full px-3 py-2 flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Layer Legend</span>
            </div>
            {isLegendOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
          </button>

          {isLegendOpen && (
            <div className="p-3 pt-1 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span>API Controller</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span>Service Layer</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>Repository (DB)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Entity Model</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                <span>Event / Kafka</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>Blast Impact</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GraphCanvas: React.FC<GraphCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

