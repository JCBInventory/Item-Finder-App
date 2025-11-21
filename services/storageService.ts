import { AppConfig } from '../types';
import { STORAGE_KEY_CONFIG, STORAGE_KEY_AUTH } from '../constants';

// In a real deployment, these functions would interact with a backend database API
// to ensure cross-device synchronization. For this implementation, we use LocalStorage.

export const getAppConfig = (): AppConfig => {
  const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    sheetUrl: null,
    lastUpdated: 0
  };
};

export const saveAppConfig = (url: string): void => {
  const config: AppConfig = {
    sheetUrl: url,
    lastUpdated: Date.now()
  };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
};

export const getAuthSession = (): boolean => {
  const session = localStorage.getItem(STORAGE_KEY_AUTH);
  if (!session) return false;
  
  const { expiry } = JSON.parse(session);
  if (Date.now() > expiry) {
    clearAuthSession();
    return false;
  }
  return true;
};

export const setAuthSession = (): void => {
  const session = {
    expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
  };
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(STORAGE_KEY_AUTH);
};