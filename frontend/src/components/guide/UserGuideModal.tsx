import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FolderArchive,
  Cpu,
  Workflow,
  Sparkles,
  ShieldAlert,
  Key,
  Flame,
  Code2,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportModal: () => void;
  onOpenGeminiModal: () => void;
  onOpenCopilot: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenImportModal,
  onOpenGeminiModal,
  onOpenCopilot,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'import',
      title: '1. Load Any Project',
      icon: <FolderArchive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Step 1',
      headline: 'Import via GitHub or Upload a ZIP file',
      description:
        'CodeGraph can understand any codebase in seconds. You do not need to configure complex tools or build setups.',
      highlights: [
        'Paste any public GitHub link (e.g. Java Spring, React, Next.js, Python, Flask, FastAPI).',
        'Or drag & drop your project ZIP archive directly from your laptop.',
        'CodeGraph parses the source files in memory and maps out all components and connections.'
      ],
      actionLabel: 'Open Project Importer',
      actionFn: () => {
        onClose();
        onOpenImportModal();
      }
    },
    {
      id: 'graph',
      title: '2. Explore the Graph',
      icon: <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: 'Step 2',
      headline: 'Interactive Code Architecture Map',
      description:
        'See how every file, service, database model, and API route connects to each other in a clean interactive diagram.',
      highlights: [
        'Click on any component box to view its AST source code and complexity.',
        'Filter by Controllers (APIs), Services (Logic), Repositories (Data), or Models.',
        'Simulate changes: Click "Calculate Blast Radius" to see what other files will be affected before you edit code!'
      ]
    },
    {
      id: 'flow',
      title: '3. Understand Flow',
      icon: <Workflow className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      badge: 'Step 3',
      headline: 'Trace How Data & Requests Travel',
      description:
        'The Flow Review tab breaks down your system into understandable tiers and walks you through end-to-end request journeys.',
      highlights: [
        'See your app’s architecture pattern (e.g., Layered Microservice, Clean Architecture).',
        'Follow step-by-step request paths: from incoming HTTP call ➔ Service logic ➔ Database persistence.',
        'Discover system bottlenecks, architectural strengths, and areas for improvement.'
      ]
    },
    {
      id: 'skill',
      title: '4. AI Project Skill',
      icon: <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Step 4',
      headline: 'Exportable Engineering Rules (SKILL.md)',
      description:
        'CodeGraph generates a tailored `SKILL.md` file that summarizes the exact coding rules and invariants of your project.',
      highlights: [
        'Clear rules on which layers can talk to each other and how database transactions should be handled.',
        'One-click download of `SKILL.md` to add to your repository.',
        'When you use AI tools (like Cursor, Gemini, or Antigravity), the AI uses this file to write bug-free code matching your architecture!'
      ]
    },
    {
      id: 'audit',
      title: '5. Health & Auto-Fix',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      badge: 'Step 5',
      headline: 'Catch Hidden Design Bugs & Circular Dependencies',
      description:
        'CodeGraph automatically checks your codebase for architecture violations, cyclic dependencies, and skipped layer boundaries.',
      highlights: [
        'Get a clear Architecture Health Score (0% to 100%).',
        'See visual circular dependency loops where files depend on each other improperly.',
        'Click "Fix with AI Copilot" on any violation to generate a production-ready refactoring patch!'
      ]
    },
    {
      id: 'copilot',
      title: '6. AI Copilot (Gemini)',
      icon: <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: 'Step 6',
      headline: 'Ask Questions & Refactor with Google Gemini',
      description:
        'Connect your free Google Gemini API key to unlock full conversational reasoning powered by your project’s custom knowledge graph.',
      highlights: [
        'Ask questions in plain English: "Explain how payments work" or "How do I add a new API route?".',
        'AI Copilot uses your specific project topology and `SKILL.md` for 100% accurate context.',
        'Inspect side-by-side refactoring diffs in the Monaco code editor.'
      ],
      actionLabel: 'Connect Gemini Token',
      actionFn: () => {
        onClose();
        onOpenGeminiModal();
      }
    }
  ];

  const current = steps[activeStep];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 text-slate-900 dark:text-slate-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">How CodeGraph Works</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Quick, friendly guide to mastering your codebase</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 px-4 pt-2 overflow-x-auto no-scrollbar gap-1 text-xs font-semibold">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeStep === idx
                  ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              {current.icon}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                {current.badge}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pt-1">
                {current.headline}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Key Things You Can Do:</span>
            </span>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
              {current.highlights.map((h, hIdx) => (
                <li key={hIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Step {activeStep + 1} of {steps.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {current.actionLabel && current.actionFn && (
              <button
                onClick={current.actionFn}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
            )}

            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
              >
                Got It, Let's Build!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
