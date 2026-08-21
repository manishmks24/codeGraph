import React, { useState, useEffect } from 'react';
import { Header, NavigationTab } from './components/Header';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { ViolationPanel } from './components/audit/ViolationPanel';
import { DiffViewer } from './components/editor/DiffViewer';
import { ChatDrawer } from './components/copilot/ChatDrawer';
import { NodeInspectorModal } from './components/node-inspector/NodeInspectorModal';
import { ArchitecturalReviewTab } from './components/review/ArchitecturalReviewTab';
import { ProjectSkillTab } from './components/skill/ProjectSkillTab';
import { ProjectImportModal } from './components/ingestion/ProjectImportModal';
import { GeminiKeyModal } from './components/settings/GeminiKeyModal';
import { UserGuideModal } from './components/guide/UserGuideModal';
import { ExportDiagramModal } from './components/export/ExportDiagramModal';
import {
  fetchGraph,
  fetchViolations,
  fetchSummary,
  scanSample,
  fetchBlastRadius
} from './services/api';
import {
  CodeGraph,
  ArchitectureSummary,
  ArchitectureViolation,
  BlastRadiusReport,
  RefactorSuggestion,
  CodeNode
} from './types';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('archlens_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('archlens_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [graph, setGraph] = useState<CodeGraph | null>(null);
  const [summary, setSummary] = useState<ArchitectureSummary | null>(null);
  const [violations, setViolations] = useState<ArchitectureViolation[]>([]);
  const [blastRadius, setBlastRadius] = useState<BlastRadiusReport | null>(null);
  const [refactorSuggestion, setRefactorSuggestion] = useState<RefactorSuggestion | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('graph');
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CodeNode | null>(null);
  const [externalTriggerPrompt, setExternalTriggerPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Initial load
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gData, vData, sData] = await Promise.all([
        fetchGraph(),
        fetchViolations(),
        fetchSummary(),
      ]);
      setGraph(gData);
      setViolations(vData);
      setSummary(sData);
    } catch (err) {
      console.warn('Backend not yet ready or empty, attempting to load sample project...', err);
      try {
        const gData = await scanSample();
        setGraph(gData);
        const [vData, sData] = await Promise.all([fetchViolations(), fetchSummary()]);
        setViolations(vData);
        setSummary(sData);
      } catch (fallbackErr) {
        console.error('Failed to load sample project:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerBlastRadius = async (nodeIdOrName: string) => {
    try {
      setIsLoading(true);
      const report = await fetchBlastRadius(nodeIdOrName);
      setBlastRadius(report);
      setActiveTab('graph');
    } catch (err) {
      console.error('Blast radius calculation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerFixFromViolation = (violation: ArchitectureViolation) => {
    setIsCopilotOpen(true);
    setExternalTriggerPrompt(
      `Refactor and fix this architectural issue: [${violation.ruleName}] between ${violation.sourceComponent} and ${violation.targetComponent}. Description: ${violation.description}`
    );
  };

  const handleAskCopilotRefactor = (className: string) => {
    setIsCopilotOpen(true);
    setExternalTriggerPrompt(`Refactor ${className} to decouple dependencies and add transactional boundaries per our Project Skill`);
  };

  const handleCopilotPrompt = (prompt: string) => {
    setIsCopilotOpen(true);
    setExternalTriggerPrompt(prompt);
  };

  const handleProjectIngested = (newGraph: CodeGraph) => {
    setGraph(newGraph);
    setBlastRadius(null);
    setRefactorSuggestion(null);
    loadData();
    setActiveTab('graph');
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Top Navigation Header */}
      <Header
        projectName={graph?.projectName || 'E-Commerce Microservice'}
        summary={summary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={loadData}
        isCopilotOpen={isCopilotOpen}
        setIsCopilotOpen={setIsCopilotOpen}
        isLoading={isLoading}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenGeminiKeyModal={() => setIsGeminiModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-hidden flex">
        {/* Tab View Container */}
        <div className="flex-1 h-full overflow-hidden">
          {activeTab === 'graph' && (
            <GraphCanvas
              graph={graph}
              blastRadius={blastRadius}
              theme={theme}
              onClearBlastRadius={() => setBlastRadius(null)}
              onSelectNode={(node) => setSelectedNode(node)}
              onTriggerBlastRadius={handleTriggerBlastRadius}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'review' && (
            <ArchitecturalReviewTab
              onTriggerCopilotPrompt={handleCopilotPrompt}
              onRefreshReview={loadData}
            />
          )}

          {activeTab === 'skill' && (
            <ProjectSkillTab
              onTriggerCopilotPrompt={handleCopilotPrompt}
            />
          )}

          {activeTab === 'audit' && (
            <ViolationPanel
              summary={summary}
              violations={violations}
              onTriggerFix={handleTriggerFixFromViolation}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'diff' && (
            <DiffViewer suggestion={refactorSuggestion} theme={theme} />
          )}
        </div>

        {/* AI Copilot Side Drawer */}
        <ChatDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          graph={graph}
          onApplyBlastRadius={(report) => setBlastRadius(report)}
          onApplyRefactor={(suggestion) => setRefactorSuggestion(suggestion)}
          onSwitchTab={(tab) => setActiveTab(tab)}
          onOpenGeminiKeyModal={() => setIsGeminiModalOpen(true)}
          externalTriggerPrompt={externalTriggerPrompt}
          onClearExternalTrigger={() => setExternalTriggerPrompt(null)}
        />
      </main>

      {/* Node Inspector Modal */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onRunBlastRadius={handleTriggerBlastRadius}
        onAskCopilotRefactor={handleAskCopilotRefactor}
      />

      {/* Project Ingestion / Import Modal */}
      <ProjectImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onProjectIngested={handleProjectIngested}
      />

      {/* Google Gemini API Key Modal (BYOK) */}
      <GeminiKeyModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onKeyUpdated={() => {}}
      />

      {/* Interactive Quick Guide Walkthrough Modal */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Export Architecture & Guardrails Modal */}
      <ExportDiagramModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        graph={graph}
      />
    </div>
  );
};
