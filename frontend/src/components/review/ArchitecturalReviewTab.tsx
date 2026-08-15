import React, { useState, useEffect } from 'react';
import {
  Layers,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle2,
  Workflow,
  Cpu,
  CornerDownRight
} from 'lucide-react';
import { fetchArchitecturalReview } from '../../services/api';
import { ArchitecturalReviewReport } from '../../types';

interface ArchitecturalReviewTabProps {
  onTriggerCopilotPrompt: (prompt: string) => void;
  onRefreshReview?: () => void;
}

export const ArchitecturalReviewTab: React.FC<ArchitecturalReviewTabProps> = ({
  onTriggerCopilotPrompt,
}) => {
  const [report, setReport] = useState<ArchitecturalReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchArchitecturalReview();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate architectural review');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReview();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10';
    if (score >= 65) return 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10';
    return 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10';
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Architectural Flow & Health Review
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Structural analysis of layer dependencies, call graph execution flows, identified bottlenecks, and architecture governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {report && (
            <div className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm ${getScoreColor(report.healthScore)}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>Health Score: {report.healthScore}%</span>
            </div>
          )}

          <button
            onClick={loadReview}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 dark:text-slate-400 animate-pulse">
          <Cpu className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <p className="text-xs font-medium">Scanning call graph topology and synthesizing architectural review...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {report && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Summary & Pattern Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Executive Architectural Assessment</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {report.executiveSummary}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                  Classified Architecture Pattern
                </span>
                <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {report.architecturalPattern}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Total Nodes</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{report.metrics.totalNodes || report.layers.reduce((a, b) => a + b.nodeCount, 0)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Dependencies</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{report.metrics.totalEdges || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Architecture Layers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Tier Layer Topology</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.layers.map((layer, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{layer.layerName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                        {layer.nodeCount} components
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{layer.purpose}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Key Components:</span>
                    <div className="flex flex-wrap gap-1">
                      {layer.keyComponents.map((comp, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-800">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Data & Control Execution Flows */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Workflow className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Topological Request & Data Flow Traces</span>
            </div>

            <div className="space-y-3">
              {report.keyDataFlows.map((flow, fIdx) => (
                <div
                  key={fIdx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{flow.flowName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30">
                        {flow.triggerEndpoint}
                      </span>
                    </div>

                    <button
                      onClick={() => onTriggerCopilotPrompt(`Explain the full execution flow and risk profile for ${flow.flowName}`)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Ask Copilot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Flow Steps Sequence */}
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                    {flow.stepSequence.map((step, sIdx) => (
                      <React.Fragment key={sIdx}>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-800 dark:text-slate-200">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-400">
                            {sIdx + 1}
                          </span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{step}</span>
                        </div>
                        {sIdx < flow.stepSequence.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{flow.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Strengths vs Bottlenecks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Architectural Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {report.architecturalStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Bottlenecks */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Bottlenecks & Smells</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {report.criticalBottlenecks.map((bot, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">!</span>
                    <span>{bot}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Actionable Recommendations */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Actionable Architecture Governance Plan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.actionableRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                  <button
                    onClick={() => onTriggerCopilotPrompt(`Refactor codebase to implement this recommendation: ${rec}`)}
                    className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    <span>Generate Refactoring Diff</span>
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
