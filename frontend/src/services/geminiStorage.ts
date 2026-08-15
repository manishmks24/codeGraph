const GEMINI_KEY_STORAGE = 'archlens_gemini_api_key';
const GEMINI_MODEL_STORAGE = 'archlens_gemini_model';

export const getStoredGeminiKey = (): string => {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
};

export const setStoredGeminiKey = (key: string): void => {
  if (!key.trim()) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  }
};

export const getStoredGeminiModel = (): string => {
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || 'gemini-2.0-flash';
};

export const setStoredGeminiModel = (model: string): void => {
  localStorage.setItem(GEMINI_MODEL_STORAGE, model);
};

export const hasGeminiKey = (): boolean => {
  const key = getStoredGeminiKey();
  return Boolean(key && key.length > 10);
};
