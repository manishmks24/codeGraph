import React from 'react';
import { X, Flame, Sparkles, FileCode } from 'lucide-react';
import { CodeNode } from '../../types';

interface NodeInspectorModalProps {
  node: CodeNode | null;
  onClose: () => void;
  onRunBlastRadius: (nodeId: string) => void;
  onAskCopilotRefactor: (className: string) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  onClose,
  onRunBlastRadius,
  onAskCopilotRefactor
}) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{node.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase font-semibold">
                  {node.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{node.packageName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Metadata Grid */}
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">File Location</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 truncate block mt-0.5">{node.filePath || `${node.name}.java`}</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Cyclomatic Complexity</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">{node.complexity || 1}</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Lines of Code</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 block mt-0.5">{node.linesOfCode || 24}</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Spring Annotations</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-300 block mt-0.5">
              {node.annotations && node.annotations.length > 0 ? node.annotations.map(a => `@${a}`).join(', ') : 'None'}
            </span>
          </div>
        </div>

        {/* Source Code View */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-300">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-sans font-semibold">
            AST Parsed Source Code
          </div>
          <pre className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 overflow-x-auto text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
            <code>{node.sourceCode || `public class ${node.name} {\n    // AST representation\n}`}</code>
          </pre>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Node ID: <span className="font-mono text-slate-700 dark:text-slate-300">{node.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onRunBlastRadius(node.id);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold transition-all shadow-sm"
              title="See which other files and API routes will be affected if you edit this component"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>See Change Impact (Blast Radius)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onAskCopilotRefactor(node.name);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Refactor with AI Copilot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
