import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { ArchitectureSummary, ArchitectureViolation } from '../../types';

interface ViolationPanelProps {
  summary: ArchitectureSummary | null;
  violations: ArchitectureViolation[];
  onTriggerFix: (violation: ArchitectureViolation) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const ViolationPanel: React.FC<ViolationPanelProps> = ({
  summary,
  violations,
  onTriggerFix,
  onRefresh,
  isLoading
}) => {
  const healthScore = summary?.healthScore ?? 75;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/40';
      default:
        return 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/40';
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 md:p-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Banner & Health Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Architectural Health & Rule Audit
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            CodeGraph evaluates Clean Architecture, layer boundaries, cyclic dependency graphs, and transactional guarantees across your entire AST.
          </p>
        </div>

        {/* Health Score Metric Card */}
        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Health Score
            </span>
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {Math.round(healthScore)}%
            </span>
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{violations.filter(v => v.severity === 'CRITICAL').length} Critical Issues</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{violations.filter(v => v.severity === 'HIGH').length} High Violations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Detected Violations ({violations.length})</span>
          </h3>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Audit</span>
          </button>
        </div>

        {violations.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Clean Architecture Verified</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Zero cyclic dependencies or layer bypasses detected across all scanned components.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(violation.severity)}`}>
                      {violation.severity}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{violation.ruleName}</h4>
                  </div>

                  <button
                    onClick={() => onTriggerFix(violation)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fix with AI Copilot</span>
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {violation.description}
                </p>

                {/* Cycle Path */}
                {violation.cyclePath && violation.cyclePath.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                      Circular Dependency Loop:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      {violation.cyclePath.map((nodeId, idx) => (
                        <React.Fragment key={idx}>
                          <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                            {nodeId.includes('.') ? nodeId.split('.').pop() : nodeId}
                          </span>
                          {idx < violation.cyclePath!.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remediation Advice */}
                {violation.remediationAdvice && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">💡 Advice:</span>
                    <span>{violation.remediationAdvice}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
