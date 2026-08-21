import React, { useState } from 'react';
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
  BookOpen,
  Share2,
  Menu,
  X,
  ChevronDown
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
  onOpenExportModal?: () => void;
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
  onOpenExportModal,
}) => {
  const isKeySet = hasGeminiKey();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect primary language from project name
  const getLanguagePill = () => {
    const p = (projectName || '').toLowerCase();
    if (p.includes('next') || p.includes('express') || p.includes('react') || p.includes('typescript') || p.includes('ts')) {
      return { label: 'TypeScript', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
    if (p.includes('python') || p.includes('fastapi') || p.includes('ai') || p.includes('flask')) {
      return { label: 'Python', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
    }
    return { label: 'Java 21', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
  };

  const langPill = getLanguagePill();

  const navTabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'graph', label: 'Code Map', icon: Cpu },
    { id: 'review', label: 'Request Flows', icon: Activity },
    { id: 'skill', label: 'Rules (SKILL.md)', icon: Sparkles },
    { id: 'audit', label: 'Health & Issues', icon: ShieldAlert, badge: summary?.totalViolations },
    { id: 'diff', label: 'Code Diff', icon: Code2 }
  ];

  return (
    <>
      <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 transition-colors duration-200">
        {/* Left: Brand & Active Project Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-500/20 text-white shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">CodeGraph</span>
              <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold hidden md:inline-block">
                AST Graph
              </span>
              <a
                href="https://github.com/manishmks24"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-mono transition-colors hidden lg:inline-block"
                title="Developed by Manish Kumar Sahu"
              >
                by Manish
              </a>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-0.5" />

          {/* Ingest / Active Project Selector Button */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-all group shadow-sm max-w-[170px] sm:max-w-[240px]"
            title="Upload project ZIP or import GitHub repo"
          >
            <FolderArchive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0" />
            <span className="font-mono truncate font-semibold text-[11px]">
              {projectName || 'E-Commerce Microservice'}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold hidden sm:inline-block shrink-0 ${langPill.color}`}>
              {langPill.label}
            </span>
          </button>
        </div>

        {/* Center: Desktop Segmented Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.1 rounded-full text-[9px] bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile Tab Switcher Button (visible on < xl screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden flex items-center gap-1 h-8 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-sm"
            title="Navigation Views"
          >
            <span className="text-[11px] capitalize">{activeTab}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Export Diagram / Rules Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
              title="Export Mermaid Diagram, C4 Architecture, and AI Rules"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Export</span>
            </button>
          )}

          {/* Quick Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all shadow-sm"
            title="Interactive User Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline text-[11px]">Guide</span>
          </button>

          {/* Google Gemini Key Status */}
          <button
            onClick={onOpenGeminiKeyModal}
            className={`flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
              isKeySet
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20'
            }`}
            title="Connect your Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">{isKeySet ? 'Gemini Active' : 'Connect Token'}</span>
            {isKeySet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm shrink-0"
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
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 shadow-sm shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>

          {/* Copilot Drawer Toggle */}
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isCopilotOpen
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">AI Copilot</span>
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Dropdown Menu Bar */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 p-2 grid grid-cols-2 sm:grid-cols-5 gap-1.5 z-20 backdrop-blur-xl animate-in slide-in-from-top-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
