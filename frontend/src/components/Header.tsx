import React from 'react';
import {
  Layers,
  ShieldAlert,
  Cpu,
  Sparkles,
  RefreshCw,
  Code2,
  Key,
  FolderArchive,
  Activity,
  CheckCircle2,
  Sun,
  Moon,
  BookOpen
} from 'lucide-react';
import { ArchitectureSummary } from '../types';
import { hasGeminiKey } from '../services/geminiStorage';

export type NavigationTab = 'graph' | 'review' | 'skill' | 'audit' | 'diff';

interface HeaderProps {
  projectName: string;
  summary: ArchitectureSummary | null;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onRefresh: () => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isLoading: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenImportModal: () => void;
  onOpenGeminiKeyModal: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  summary,
  activeTab,
  setActiveTab,
  onRefresh,
  isCopilotOpen,
  setIsCopilotOpen,
  isLoading,
  theme,
  onToggleTheme,
  onOpenImportModal,
  onOpenGeminiKeyModal,
  onOpenGuide,
}) => {
  const isKeySet = hasGeminiKey();

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 shrink-0 transition-colors duration-200">
      {/* Left: Brand & Active Project Switcher */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-500/20 text-white shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">CodeGraph</span>
            <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold hidden sm:inline-block">
              AI Copilot
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block mx-1" />

        {/* Ingest / Active Project Selector Button */}
        <button
          onClick={onOpenImportModal}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-950/70 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-all group shadow-sm"
          title="Upload project ZIP or import GitHub repo"
        >
          <FolderArchive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform" />
          <span className="font-mono truncate max-w-[120px] font-medium text-[11px]">
            {projectName || 'E-Commerce'}
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">
            Change
          </span>
        </button>
      </div>

      {/* Center: Clean Segmented Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-inner">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'graph'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Code Map</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'review'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Request Flows</span>
        </button>

        <button
          onClick={() => setActiveTab('skill')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'skill'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Rules (SKILL.md)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Health & Issues</span>
          {summary && summary.totalViolations > 0 && (
            <span className="px-1.5 py-0.1 rounded-full text-[9px] bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30 font-mono">
              {summary.totalViolations}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'diff'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Code Diff</span>
        </button>
      </nav>

      {/* Right: Action Buttons with Unified Heights */}
      <div className="flex items-center gap-1.5">
        {/* Quick Guide Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all shadow-sm"
          title="Interactive User Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline text-[11px]">Guide</span>
        </button>

        {/* Google Gemini Key Status */}
        <button
          onClick={onOpenGeminiKeyModal}
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
            isKeySet
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
              : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20'
          }`}
          title="Connect your Google Gemini API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">{isKeySet ? 'Gemini Active' : 'Connect Token'}</span>
          {isKeySet ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Rescan Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Re-scan codebase"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
        </button>

        {/* Copilot Drawer Toggle */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isCopilotOpen
              ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-1 ring-emerald-500/50'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px]">AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
