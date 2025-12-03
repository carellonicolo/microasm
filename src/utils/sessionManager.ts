/**
 * Session Manager for Multi-Tab Isolation
 * 
 * This utility provides tab-specific session IDs using browser's sessionStorage
 * (which is already isolated per tab) to prefix localStorage keys.
 * This prevents conflicts when multiple tabs are open simultaneously.
 */

const SESSION_KEY = 'microasm_tab_session_id';

/**
 * Gets or creates a unique session ID for this browser tab.
 * Uses sessionStorage which is isolated per tab.
 */
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Generate unique ID: timestamp + random string
    sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Session-scoped storage wrapper.
 * Keys are prefixed with the session ID, making them tab-specific.
 */
export const sessionScopedStorage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(`${getSessionId()}_${key}`);
  },
  
  setItem: (key: string, value: string): void => {
    localStorage.setItem(`${getSessionId()}_${key}`, value);
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(`${getSessionId()}_${key}`);
  }
};

/**
 * Global storage wrapper for keys that should be shared across tabs.
 * Use this for things like exercise progress that should persist globally.
 */
export const globalStorage = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  setItem: (key: string, value: string): void => localStorage.setItem(key, value),
  removeItem: (key: string): void => localStorage.removeItem(key)
};

/**
 * Cleans up old autosave entries from localStorage.
 * Removes entries older than maxAgeMs (default: 24 hours).
 */
export const cleanupOldAutosaves = (maxAgeMs: number = 24 * 60 * 60 * 1000): number => {
  const keys = Object.keys(localStorage);
  const now = Date.now();
  let removedCount = 0;
  
  keys.forEach(key => {
    // Look for autosave timestamp keys with session prefix pattern
    if (key.includes('_microasm_autosave_timestamp')) {
      const timestamp = parseInt(localStorage.getItem(key) || '0', 10);
      
      if (now - timestamp > maxAgeMs) {
        // Extract the session prefix from the key
        const sessionPrefix = key.replace('_microasm_autosave_timestamp', '');
        
        // Remove all related autosave keys for this session
        localStorage.removeItem(`${sessionPrefix}_microasm_autosave`);
        localStorage.removeItem(`${sessionPrefix}_microasm_autosave_timestamp`);
        localStorage.removeItem(`${sessionPrefix}_microasm_autosave_session`);
        removedCount++;
      }
    }
  });
  
  return removedCount;
};
