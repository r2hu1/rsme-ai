'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { StorageManager, debounce } from './storage-utils';
import { AIConfiguration, UserSettings } from '@/lib/types';

const DEFAULT_CONFIG: AIConfiguration = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  model: 'googleai/gemini-1.5-flash',
};

const DEFAULT_SETTINGS: UserSettings = {
  aiConfig: DEFAULT_CONFIG,
};

const STORAGE_KEY = 'resumeai-settings';
const STORAGE_VERSION = '1.0'; // For future migrations

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  isStorageAvailable: boolean;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  isStorageAvailable: false,
  updateSettings: () => {},
  resetToDefaults: () => {},
  exportSettings: () => '',
  importSettings: () => false,
});

export function SettingsProvider({ children }: { children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isStorageAvailable, setIsStorageAvailable] = useState(false);

  // Debounced save function to prevent excessive localStorage writes
  const debouncedSave = useCallback(
    debounce((settingsToSave: UserSettings) => {
      if (isStorageAvailable) {
        const dataToStore = {
          version: STORAGE_VERSION,
          timestamp: Date.now(),
          data: settingsToSave,
        };
        StorageManager.setItem(STORAGE_KEY, dataToStore);
      }
    }, 300),
    [isStorageAvailable]
  );

  // Load settings from localStorage on mount
  useEffect(() => {
    const checkStorageAndLoad = async () => {
      setIsStorageAvailable(StorageManager.isAvailable());
      
      if (StorageManager.isAvailable()) {
        const stored = StorageManager.getItem<{
          version: string;
          timestamp: number;
          data: UserSettings;
        }>(STORAGE_KEY);

        if (stored?.data) {
          // Validate and merge stored settings with defaults
          const validatedSettings = validateSettings(stored.data);
          setSettings(prev => ({ ...prev, ...validatedSettings }));
        }
      }
      
      setIsLoading(false);
    };

    checkStorageAndLoad();
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    if (!isLoading && isStorageAvailable) {
      debouncedSave(settings);
    }
  }, [settings, isLoading, isStorageAvailable, debouncedSave]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return validateSettings(updated);
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (isStorageAvailable) {
      StorageManager.removeItem(STORAGE_KEY);
    }
  }, [isStorageAvailable]);

  const exportSettings = useCallback((): string => {
    try {
      return JSON.stringify({
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data: settings,
      }, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      return '';
    }
  }, [settings]);

  const importSettings = useCallback((settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);
      if (parsed.data) {
        const validatedSettings = validateSettings(parsed.data);
        setSettings(validatedSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }, []);

  const value: SettingsContextType = {
    settings,
    isLoading,
    isStorageAvailable,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Settings validation function
function validateSettings(settings: any): UserSettings {
  const validated: UserSettings = {
    aiConfig: {
      apiKey: typeof settings.aiConfig?.apiKey === 'string' ? settings.aiConfig.apiKey : DEFAULT_CONFIG.apiKey,
      model: typeof settings.aiConfig?.model === 'string' ? settings.aiConfig.model : DEFAULT_CONFIG.model,
    },
  };

  return validated;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
