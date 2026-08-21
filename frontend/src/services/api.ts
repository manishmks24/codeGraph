import {
  CodeGraph,
  BlastRadiusReport,
  ArchitectureViolation,
  ArchitectureSummary,
  ArchitecturalReviewReport,
  ProjectSkill,
  IngestionResult,
  ChatResponse,
  CodeNode
} from '../types';
import { getStoredGeminiKey, getStoredGeminiModel } from './geminiStorage';

function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }
  let url = envUrl.trim();
  // If it's a relative path like '/api', return it without trailing slashes
  if (url.startsWith('/')) {
    return url.replace(/\/+$/, '') || '/api';
  }
  // If missing http:// or https:// protocol, prepend https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Ensure the /api suffix is present for backend routing
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE = getApiBaseUrl();

const getHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { ...extra };
  const geminiKey = getStoredGeminiKey();
  if (geminiKey) {
    headers['X-Gemini-Api-Key'] = geminiKey;
  }
  return headers;
};

export async function fetchGraph(): Promise<CodeGraph> {
  const res = await fetch(`${API_BASE}/codebase/graph`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch graph');
  return res.json();
}

export async function scanSample(type: string = 'ecommerce'): Promise<CodeGraph> {
  const res = await fetch(`${API_BASE}/codebase/scan-sample?type=${encodeURIComponent(type)}`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to scan ${type} sample codebase`);
  return res.json();
}

export async function uploadProjectZip(file: File): Promise<IngestionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/codebase/upload-zip`, {
    method: 'POST',
    body: formData,
    headers: getStoredGeminiKey() ? { 'X-Gemini-Api-Key': getStoredGeminiKey() } : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Failed to upload and scan project ZIP');
  }
  return res.json();
}

export async function importGitHubRepo(repoUrl: string, branch = 'main', token?: string): Promise<IngestionResult> {
  const res = await fetch(`${API_BASE}/codebase/import-github`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ repoUrl, branch, token }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'GitHub import failed' }));
    throw new Error(err.error || 'Failed to import GitHub repository');
  }
  return res.json();
}

export async function scanCustom(files: Record<string, string>): Promise<CodeGraph> {
  const res = await fetch(`${API_BASE}/codebase/scan-custom`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(files),
  });
  if (!res.ok) throw new Error('Failed to scan custom codebase');
  return res.json();
}

export async function fetchBlastRadius(target: string, depth = 4): Promise<BlastRadiusReport> {
  const res = await fetch(`${API_BASE}/analysis/blast-radius?target=${encodeURIComponent(target)}&depth=${depth}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to compute blast radius');
  return res.json();
}

export async function fetchViolations(): Promise<ArchitectureViolation[]> {
  const res = await fetch(`${API_BASE}/analysis/violations`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch architecture violations');
  return res.json();
}

export async function fetchSummary(): Promise<ArchitectureSummary> {
  const res = await fetch(`${API_BASE}/analysis/summary`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch architecture summary');
  return res.json();
}

export async function fetchArchitecturalReview(): Promise<ArchitecturalReviewReport> {
  const model = getStoredGeminiModel();
  const res = await fetch(`${API_BASE}/ai/review?model=${encodeURIComponent(model)}`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to generate architectural review');
  return res.json();
}

export async function generateProjectSkill(): Promise<ProjectSkill> {
  const model = getStoredGeminiModel();
  const res = await fetch(`${API_BASE}/ai/generate-skill?model=${encodeURIComponent(model)}`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to generate project skill');
  return res.json();
}

export async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/ai/validate-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    if (!res.ok) return { valid: false, error: `HTTP ${res.status} from backend` };
    return await res.json();
  } catch (err: any) {
    return { valid: false, error: err.message || 'Connection failed' };
  }
}

export async function sendChatMessage(query: string): Promise<ChatResponse> {
  const model = getStoredGeminiModel();
  const res = await fetch(`${API_BASE}/copilot/chat`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query, model }),
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export function streamChat(
  query: string,
  onThought: (thought: string) => void,
  onComplete: (data: ChatResponse) => void,
  onError: (err: any) => void
): () => void {
  const geminiKey = getStoredGeminiKey();
  const model = getStoredGeminiModel();
  const params = new URLSearchParams({ query, model });
  if (geminiKey) {
    params.append('apiKey', geminiKey);
  }

  const eventSource = new EventSource(`${API_BASE}/copilot/stream?${params.toString()}`);

  eventSource.addEventListener('thought', (e) => {
    onThought(e.data);
  });

  eventSource.addEventListener('complete', (e) => {
    try {
      const data = JSON.parse(e.data);
      onComplete(data);
    } catch (err) {
      onError(err);
    } finally {
      eventSource.close();
    }
  });

  eventSource.addEventListener('error', (e) => {
    onError(e);
    eventSource.close();
  });

  return () => eventSource.close();
}
