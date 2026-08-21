import React, { useState, useEffect } from 'react';
import { Key, Sparkles, ExternalLink, CheckCircle2, AlertCircle, X, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { getStoredGeminiKey, setStoredGeminiKey, getStoredGeminiModel, setStoredGeminiModel } from '../../services/geminiStorage';
import { validateGeminiKey } from '../../services/api';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const existing = getStoredGeminiKey();
      setApiKey(existing);
      setModel(getStoredGeminiModel());
      setValidationStatus(existing ? 'valid' : 'idle');
      setErrorMessage(null);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sanitizeKey = (key: string) => {
    return key.trim().replace(/^["']|["']$/g, '');
  };

  const handleSave = async (forceSave = false) => {
    const cleanedKey = sanitizeKey(apiKey);
    if (!cleanedKey) {
      setStoredGeminiKey('');
      setStoredGeminiModel(model);
      onKeyUpdated();
      onClose();
      return;
    }

    if (forceSave) {
      setStoredGeminiKey(cleanedKey);
      setStoredGeminiModel(model);
      onKeyUpdated();
      onClose();
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setErrorMessage(null);

    try {
      const res = await validateGeminiKey(cleanedKey);
      if (res.valid) {
        setStoredGeminiKey(cleanedKey);
        setStoredGeminiModel(model);
        setValidationStatus('valid');
        onKeyUpdated();
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setValidationStatus('invalid');
        setErrorMessage(res.error || 'Google returned an error validating this API key.');
      }
    } catch (err: any) {
      setValidationStatus('invalid');
      setErrorMessage(err.message || 'Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setStoredGeminiKey('');
    setValidationStatus('idle');
    setErrorMessage(null);
    onKeyUpdated();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 text-slate-900 dark:text-slate-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Google Gemini API Token</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Bring Your Own Key (BYOK)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Telemetry & 100% Local Storage</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Your Google Gemini API Key is stored safely in your browser's <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-slate-200/50 dark:bg-slate-900 px-1 py-0.5 rounded">localStorage</code> and transmitted directly to Google API endpoints.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>Get free key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationStatus('idle');
                  setErrorMessage(null);
                }}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-mono">
              Model Selection
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest Next-Gen & Recommended)</option>
              <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Latest)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Deep Architecture Reasoning)</option>
            </select>
          </div>

          {/* Validation Feedback */}
          {validationStatus === 'valid' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>API Key verified successfully with Google AI Studio!</span>
            </div>
          )}

          {validationStatus === 'invalid' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Verification Failed</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={handleClear}
            disabled={!apiKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Token</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {isValidating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isValidating ? 'Verifying...' : 'Save & Verify'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
