import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Globe,
  Cpu,
  Database,
  Table,
  Radio,
  FileCode,
  Terminal,
  Settings,
  Flame,
  RadioTower
} from 'lucide-react';
import { NodeType } from '../../types';

export interface CustomNodeData {
  id: string;
  name: string;
  className?: string;
  type: NodeType;
  annotations?: string[];
  signature?: string;
  isBlastTarget?: boolean;
  isBlastImpacted?: boolean;
  hopDistance?: number;
  complexity?: number;
  [key: string]: any;
}

const nodeTypeStyles: Record<NodeType, {
  bg: string;
  border: string;
  badge: string;
  icon: React.ReactNode;
  accent: string;
}> = {
  CONTROLLER: {
    bg: 'bg-white/95 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-500/40',
    badge: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    icon: <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
    accent: '#3b82f6'
  },
  SERVICE: {
    bg: 'bg-white/95 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-500/40',
    badge: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    icon: <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
    accent: '#a855f7'
  },
  REPOSITORY: {
    bg: 'bg-white/95 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-500/40',
    badge: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    icon: <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
    accent: '#f59e0b'
  },
  ENTITY: {
    bg: 'bg-white/95 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-500/40',
    badge: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    icon: <Table className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    accent: '#10b981'
  },
  ENDPOINT: {
    bg: 'bg-white/95 dark:bg-cyan-950/40',
    border: 'border-cyan-300 dark:border-cyan-500/40',
    badge: 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    icon: <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
    accent: '#06b6d4'
  },
  EVENT_LISTENER: {
    bg: 'bg-white/95 dark:bg-pink-950/40',
    border: 'border-pink-300 dark:border-pink-500/40',
    badge: 'bg-pink-50 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/30',
    icon: <Radio className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />,
    accent: '#ec4899'
  },
  KAFKA_TOPIC: {
    bg: 'bg-white/95 dark:bg-indigo-950/40',
    border: 'border-indigo-300 dark:border-indigo-500/40',
    badge: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
    icon: <RadioTower className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
    accent: '#6366f1'
  },
  CONFIGURATION: {
    bg: 'bg-white/95 dark:bg-slate-900/60',
    border: 'border-slate-300 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />,
    accent: '#64748b'
  },
  INTERFACE: {
    bg: 'bg-white/95 dark:bg-teal-950/40',
    border: 'border-teal-300 dark:border-teal-500/40',
    badge: 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
    icon: <FileCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
    accent: '#14b8a6'
  },
  METHOD: {
    bg: 'bg-white/95 dark:bg-slate-900/60',
    border: 'border-slate-300 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: <FileCode className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />,
    accent: '#64748b'
  },
  COMPONENT: {
    bg: 'bg-white/95 dark:bg-slate-900/60',
    border: 'border-slate-300 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />,
    accent: '#64748b'
  }
};

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CustomNodeData;
  const style = nodeTypeStyles[nodeData.type] || nodeTypeStyles.COMPONENT;

  let borderClasses = style.border;
  let pulseClass = '';

  if (nodeData.isBlastTarget) {
    borderClasses = 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20';
    pulseClass = 'node-blast-target';
  } else if (nodeData.isBlastImpacted) {
    borderClasses = 'border-rose-500 ring-2 ring-rose-500/50 shadow-lg shadow-rose-500/20';
    pulseClass = 'node-blast-impacted';
  } else if (selected) {
    borderClasses = 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20';
  }

  return (
    <div
      className={`min-w-[210px] max-w-[260px] rounded-xl border backdrop-blur-md transition-all duration-200 ${style.bg} ${borderClasses} ${pulseClass} shadow-sm hover:shadow-md group`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-700 !border-2 !border-white dark:!border-slate-900 hover:!bg-emerald-500 transition-colors"
      />

      {/* Node Header */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
            {style.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {nodeData.name}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
              {nodeData.className || nodeData.type}
            </p>
          </div>
        </div>

        {/* Type Badge */}
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 font-medium ${style.badge}`}>
          {nodeData.type.slice(0, 4)}
        </span>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2 space-y-1.5 text-[11px]">
        {/* Blast Radius Status */}
        {nodeData.isBlastTarget && (
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 text-[10px] font-mono">
            <Flame className="w-3 h-3 text-amber-500 shrink-0" />
            <span>File You Are Changing</span>
          </div>
        )}

        {nodeData.isBlastImpacted && (
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500 shrink-0" />
              <span>Affected (May Break)</span>
            </div>
            {nodeData.hopDistance !== undefined && (
              <span className="text-slate-500 dark:text-slate-400 text-[9px]">{nodeData.hopDistance} step(s) away</span>
            )}
          </div>
        )}

        {/* Annotations Pills */}
        {nodeData.annotations && nodeData.annotations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {nodeData.annotations.slice(0, 2).map((ann, idx) => (
              <span
                key={idx}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 truncate max-w-[180px]"
              >
                @{ann}
              </span>
            ))}
            {nodeData.annotations.length > 2 && (
              <span className="text-[9px] text-slate-400 self-center font-mono">
                +{nodeData.annotations.length - 2}
              </span>
            )}
          </div>
        )}

        {/* HTTP Signature if Endpoint */}
        {nodeData.signature && (
          <div className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300/90 truncate bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/20">
            {nodeData.signature}
          </div>
        )}
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-700 !border-2 !border-white dark:!border-slate-900 hover:!bg-emerald-500 transition-colors"
      />
    </div>
  );
};
