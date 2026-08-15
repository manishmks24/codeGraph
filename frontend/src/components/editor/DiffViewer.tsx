import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { RefactorSuggestion } from '../../types';
import {
  Code2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface DiffViewerProps {
  suggestion: RefactorSuggestion | null;
  theme?: 'dark' | 'light';
  onApplyRefactor?: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ suggestion, theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (suggestion?.refactoredCode) {
      navigator.clipboard.writeText(suggestion.refactoredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!suggestion) {
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
          <Code2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400/80" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No Active Refactoring Diff</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
          Ask the AI Copilot to refactor any class or resolve an architectural violation to generate a side-by-side AST diff.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden transition-colors duration-200">
      {/* Top Banner with Rationale and Applied Patterns */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Refactor Diff: <span className="font-mono text-emerald-700 dark:text-emerald-300">{suggestion.targetClass}.java</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{suggestion.rationale}</p>
        </div>

        {/* Applied Patterns & Copy Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {suggestion.appliedPatterns?.map((pattern, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-slate-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30"
            >
              <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>{pattern}</span>
            </span>
          ))}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Side-by-Side Diff Editor */}
      <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <DiffEditor
          height="100%"
          language="java"
          original={suggestion.originalCode}
          modified={suggestion.refactoredCode}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
