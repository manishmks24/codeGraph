import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Workflow,
  Layers,
  RefreshCw,
  FileCode2,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { generateProjectSkill } from '../../services/api';
import { ProjectSkill } from '../../types';

interface ProjectSkillTabProps {
  onTriggerCopilotPrompt: (prompt: string) => void;
}

export const ProjectSkillTab: React.FC<ProjectSkillTabProps> = ({ onTriggerCopilotPrompt }) => {
  const [skill, setSkill] = useState<ProjectSkill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'markdown'>('rules');

  const loadSkill = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateProjectSkill();
      setSkill(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate project skill');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkill();
  }, []);

  const handleCopyMarkdown = () => {
    if (!skill?.fullMarkdown) return;
    navigator.clipboard.writeText(skill.fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSkill = () => {
    if (!skill?.fullMarkdown) return;
    const blob = new Blob([skill.fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SKILL.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Autonomous Project Architectural Skill (<span className="font-mono text-emerald-600 dark:text-emerald-400">SKILL.md</span>)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Custom-synthesized architectural blueprint and operational workflows that ArchLens AI Copilot strictly enforces across all development tasks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyMarkdown}
            disabled={!skill}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadSkill}
            disabled={!skill}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download SKILL.md</span>
          </button>

          <button
            onClick={loadSkill}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 shadow-sm"
            title="Regenerate Skill"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 dark:text-slate-400 animate-pulse">
          <Cpu className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <p className="text-xs font-medium">Extracting architectural invariants and generating custom SKILL.md...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {skill && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveSubTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'rules'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              Structured Invariants & Workflows
            </button>
            <button
              onClick={() => setActiveSubTab('markdown')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'markdown'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              Raw SKILL.md Markdown
            </button>
          </div>

          {activeSubTab === 'rules' && (
            <div className="space-y-6">
              {/* Active Skill Summary Banner */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{skill.skillName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                      v{skill.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{skill.description}</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Enforced by Live Copilot</span>
                </div>
              </div>

              {/* Invariants & Layer Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Architectural Invariants */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Non-Negotiable Architectural Invariants</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                    {skill.architecturalInvariants.map((inv, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{inv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Layer Rules */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Layer Encapsulation Contracts</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                    {skill.layerRules.map((rule, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Standard Workflows */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Workflow className="w-4 h-4" />
                  <span>Standard Operational Workflows</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {skill.workflows.map((wf, idx) => (
                    <div
                      key={idx}
                      onClick={() => onTriggerCopilotPrompt(`Guide me through the ${wf} for this project`)}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                        <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{wf}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        Execute with Copilot ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'markdown' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <FileCode2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>SKILL.md (Markdown Source)</span>
                </div>
                <button
                  onClick={handleCopyMarkdown}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <pre className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
                {skill.fullMarkdown}
              </pre>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
