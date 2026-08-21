import React, { useState } from 'react';
import { Upload, Github, FolderArchive, Layers, X, Loader2, CheckCircle2, AlertCircle, FileCode2, Sparkles, ArrowRight } from 'lucide-react';
import { uploadProjectZip, importGitHubRepo, scanSample } from '../../services/api';
import { CodeGraph, IngestionResult } from '../../types';

interface ProjectImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectIngested: (graph: CodeGraph, stats?: { language: string; files: number; lines: number }) => void;
}

export const ProjectImportModal: React.FC<ProjectImportModalProps> = ({
  isOpen,
  onClose,
  onProjectIngested,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'github' | 'samples'>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

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

  const handleZipUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const result: IngestionResult = await uploadProjectZip(selectedFile);
      setSuccessInfo(`Successfully indexed ${result.totalFiles} files (${result.primaryLanguage})!`);
      onProjectIngested(result.graph, {
        language: result.primaryLanguage,
        files: result.totalFiles,
        lines: result.totalLines,
      });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse project archive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubImport = async () => {
    if (!githubUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const result: IngestionResult = await importGitHubRepo(githubUrl.trim(), githubBranch.trim(), githubToken.trim());
      setSuccessInfo(`Imported ${result.graph.projectName}! Found ${result.totalFiles} files.`);
      onProjectIngested(result.graph, {
        language: result.primaryLanguage,
        files: result.totalFiles,
        lines: result.totalLines,
      });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to import GitHub repository. Ensure repo is public or provide a GitHub token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async (type: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const graph = await scanSample(type);
      const metaMap: Record<string, { language: string; lines: number }> = {
        ecommerce: { language: 'Java 21 (Spring Boot 3.3)', lines: 3450 },
        nextjs: { language: 'TypeScript (Next.js & Express)', lines: 2890 },
        fastapi: { language: 'Python 3.11 (FastAPI & AI Agent)', lines: 1950 }
      };
      const meta = metaMap[type] || metaMap.ecommerce;
      setSuccessInfo(`Loaded ${graph.projectName}!`);
      onProjectIngested(graph, {
        language: meta.language,
        files: graph.nodes.length,
        lines: meta.lines,
      });
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Ingest & Scan Codebase
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-200 dark:border-emerald-500/30">
                  Universal AST
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extract topological graph & generate custom SKILL.md</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'github'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload ZIP Archive</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'samples'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pre-built Samples</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Tab 1: GitHub URL */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-200">GitHub Repository URL</label>
                <div className="relative">
                  <Github className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/spring-projects/spring-petclinic"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Accepts public repositories. Polyglot AST parser handles Java, TypeScript, Next.js, Python, Flask, FastAPI.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-200">Branch Name</label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span>GitHub Token</span>
                    <span className="text-[10px] text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Suggestion buttons */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Popular Repos to Explore:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGithubUrl('https://github.com/spring-projects/spring-petclinic');
                      setGithubBranch('main');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] transition-colors"
                  >
                    Spring PetClinic (Java)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGithubUrl('https://github.com/vercel/next.js');
                      setGithubBranch('canary');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] transition-colors"
                  >
                    Next.js (TS/React)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Upload ZIP */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-slate-50 dark:bg-slate-950'
                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60'
                }`}
                onClick={() => document.getElementById('project-zip-input')?.click()}
              >
                <input
                  id="project-zip-input"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag & drop project .ZIP'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to scan` : 'Supports Java, TypeScript, JavaScript, Python, and polyglot repos'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Pre-built Samples */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div
                onClick={() => handleLoadSample('ecommerce')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">
                    ☕ Java
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      E-Commerce Order & Payment Microservice
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                        Spring Boot 3.3
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Kafka Event Listeners • Repositories • Services • Circular Dependency Detection
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => handleLoadSample('nextjs')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                    ⚡ TS
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Next.js & Express Fullstack API
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                        TypeScript & React
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Next.js App Router API • Stripe Client • Notification Services • Clean Repositories
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => handleLoadSample('fastapi')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xs">
                    🐍 Py
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      FastAPI Generative AI Agent Service
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-mono">
                        Python 3.11
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      FastAPI APIRouters • Vector Store Repositories • LLM Inference Services • RAG Pipeline
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successInfo}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
            <FileCode2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Zero permanent storage
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            {activeTab === 'github' && (
              <button
                onClick={handleGitHubImport}
                disabled={isLoading || !githubUrl.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Cloning & Indexing...' : 'Extract & Build Graph'}</span>
              </button>
            )}

            {activeTab === 'upload' && (
              <button
                onClick={handleZipUpload}
                disabled={isLoading || !selectedFile}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Extracting ZIP AST...' : 'Scan Project ZIP'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
