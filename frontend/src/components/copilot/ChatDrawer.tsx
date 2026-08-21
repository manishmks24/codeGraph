import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Terminal,
  Flame,
  ShieldAlert,
  Code2,
  Loader2,
  Key,
  Workflow
} from 'lucide-react';
import { streamChat } from '../../services/api';
import { ChatResponse, BlastRadiusReport, ArchitectureViolation, RefactorSuggestion, CodeGraph } from '../../types';
import { hasGeminiKey, getStoredGeminiModel } from '../../services/geminiStorage';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  thoughts?: string[];
  responsePayload?: ChatResponse;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  graph: CodeGraph | null;
  onApplyBlastRadius: (report: BlastRadiusReport) => void;
  onApplyRefactor: (suggestion: RefactorSuggestion) => void;
  onSwitchTab: (tab: any) => void;
  onOpenGeminiKeyModal: () => void;
  externalTriggerPrompt?: string | null;
  onClearExternalTrigger?: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  graph,
  onApplyBlastRadius,
  onApplyRefactor,
  onSwitchTab,
  onOpenGeminiKeyModal,
  externalTriggerPrompt,
  onClearExternalTrigger
}) => {
  const projectName = graph?.projectName || 'Active Project';
  const services = graph?.nodes.filter((n) => n.type === 'SERVICE' || n.type === 'CONTROLLER') || [];
  const primaryService = services.length > 0 ? services[0].name : (graph?.nodes[0]?.name || 'MainComponent');
  const secondaryService = services.length > 1 ? services[1].name : primaryService;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `👋 Hello! I am **CodeGraph AI**, your Principal Architectural Copilot for **${projectName}**.\n\nI operate on your topological knowledge graph (${graph?.nodes.length || 0} nodes) with active **Project Skill (\`SKILL.md\`)** rules.\n\nAsk me about architecture flow, blast radius, or refactoring!`,
    }
  ]);

  useEffect(() => {
    if (graph?.projectName) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `👋 Active project: **${graph.projectName}** (${graph.nodes.length} nodes, ${graph.edges.length} edges).\n\nAsk me to analyze architecture flows, compute blast radius for **${primaryService}**, or refactor code!`,
        }
      ]);
    }
  }, [graph?.projectName]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThoughts, setCurrentThoughts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isKeyActive = hasGeminiKey();
  const activeModel = getStoredGeminiModel();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentThoughts]);

  useEffect(() => {
    if (externalTriggerPrompt) {
      handleSendMessage(externalTriggerPrompt);
      if (onClearExternalTrigger) onClearExternalTrigger();
    }
  }, [externalTriggerPrompt]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setCurrentThoughts([]);

    const thoughtsAccumulator: string[] = [];

    streamChat(
      query,
      (thought) => {
        thoughtsAccumulator.push(thought);
        setCurrentThoughts([...thoughtsAccumulator]);
      },
      (data) => {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.message,
          thoughts: [...thoughtsAccumulator],
          responsePayload: data,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsStreaming(false);
        setCurrentThoughts([]);

        if (data.blastRadiusReport) {
          onApplyBlastRadius(data.blastRadiusReport);
          onSwitchTab('graph');
        }
        if (data.refactorSuggestion) {
          onApplyRefactor(data.refactorSuggestion);
          onSwitchTab('diff');
        }
      },
      (err) => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: "❌ Error connecting to CodeGraph engine: " + (err.message || 'Check if Spring Boot is running on port 8080'),
          }
        ]);
        setIsStreaming(false);
        setCurrentThoughts([]);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">CodeGraph Copilot</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 border border-slate-300/60 dark:border-slate-800 font-medium">
                {isKeyActive ? activeModel : 'GraphRAG'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Target: {projectName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isKeyActive && (
            <button
              onClick={onOpenGeminiKeyModal}
              className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors flex items-center gap-1"
            >
              <Key className="w-3 h-3" />
              <span>Connect Token</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Header */}
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              {msg.sender === 'user' ? (
                <>
                  <span>Developer</span>
                  <User className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>CodeGraph AI Agent</span>
                </>
              )}
            </div>

            {/* Thoughts Section */}
            {msg.thoughts && msg.thoughts.length > 0 && (
              <div className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1 mb-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-semibold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Execution Log
                </span>
                {msg.thoughts.map((t, idx) => (
                  <p key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                    ✓ {t}
                  </p>
                ))}
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Live Thoughts when Streaming */}
        {isStreaming && currentThoughts.length > 0 && (
          <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-emerald-300 dark:border-emerald-500/30 space-y-1.5 animate-pulse">
            <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Graph Engine & Gemini Thinking...
            </span>
            {currentThoughts.map((t, idx) => (
              <p key={idx} className="text-[10px] text-slate-700 dark:text-slate-300 font-mono">
                ➔ {t}
              </p>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
        <button
          onClick={() => handleSendMessage(`Explain the architectural flow and structure of ${projectName}`)}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap flex items-center gap-1 transition-colors shadow-sm"
        >
          <Workflow className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          <span>Explain Flow</span>
        </button>

        <button
          onClick={() => handleSendMessage(`Calculate blast radius of ${primaryService}`)}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap flex items-center gap-1 transition-colors shadow-sm"
        >
          <Flame className="w-3 h-3 text-amber-500" />
          <span>Blast: {primaryService}</span>
        </button>

        <button
          onClick={() => handleSendMessage(`Audit ${projectName} for circular dependencies and rule violations`)}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap flex items-center gap-1 transition-colors shadow-sm"
        >
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <span>Audit Rules</span>
        </button>

        <button
          onClick={() => handleSendMessage(`Refactor ${secondaryService} per our Project Skill invariants`)}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap flex items-center gap-1 transition-colors shadow-sm"
        >
          <Code2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Refactor: {secondaryService}</span>
        </button>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${projectName} flow, blast radius, or refactoring...`}
          disabled={isStreaming}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
