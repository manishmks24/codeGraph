import React, { useState, useEffect } from 'react';
import { X, Flame, Sparkles, FileCode, Copy, Check, Terminal, ExternalLink, Code2 } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const handleCopyCode = () => {
    const code = node.sourceCode || `public class ${node.name} {\n    // AST representation\n}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 text-slate-900 dark:text-slate-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-colors duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{node.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase font-semibold">
                  {node.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">{node.packageName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Metadata Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">File Location</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 truncate block mt-0.5 font-semibold">
              {node.filePath || `${node.name}.java`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Complexity</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              {node.complexity || 1}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Lines of Code</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 block mt-0.5 font-semibold">
              {node.linesOfCode || 24}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Annotations / Modifiers</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-300 block mt-0.5 truncate font-semibold">
              {node.annotations && node.annotations.length > 0 ? node.annotations.map(a => `@${a}`).join(', ') : 'None'}
            </span>
          </div>
        </div>

        {/* Source Code View Header & Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-300 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans font-bold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AST Parsed Source Code</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-sans font-semibold transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="flex-1 p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 overflow-x-auto text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
            <code>{node.sourceCode || `public class ${node.name} {\n    // AST representation\n}`}</code>
          </pre>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Symbol ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{node.id}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onClose();
                onRunBlastRadius(node.id);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              title="See which other files and API routes will be affected if you edit this component"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Simulate Blast Radius</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onAskCopilotRefactor(node.name);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Refactor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
