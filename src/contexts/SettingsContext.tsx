import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  notificationSound: string;
  volume: number;
  darkMode: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  // Add these to track API state
  isSyncing: boolean;
  lastSync: Date | null;
}

const defaultSettings: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  notificationSound: "bell",
  volume: 50,
  darkMode: false,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings when user changes or on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        let storageKey = 'pomodoro-settings-anonymous';
        if (user) {
          storageKey = `pomodoro-settings-${user.uid}`;
        }

        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          // Merge with defaults to ensure all fields exist
          const mergedSettings = { ...defaultSettings, ...parsedSettings };
          setSettings(mergedSettings);
        } else {
          // Use default settings if nothing is saved
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
        setSettings(defaultSettings);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, [user]);

  // Save to localStorage whenever settings change (with debouncing)
  useEffect(() => {
    if (!isInitialized) return;

    const saveSettings = () => {
      try {
        let storageKey = 'pomodoro-settings-anonymous';
        if (user) {
          storageKey = `pomodoro-settings-${user.uid}`;
        }
        
        localStorage.setItem(storageKey, JSON.stringify(settings));
        setLastSync(new Date());
      } catch (error) {
        console.error('Error saving settings to localStorage:', error);
      }
    };

    // Debounce the save to prevent too many writes
    const timeoutId = setTimeout(saveSettings, 500);
    return () => clearTimeout(timeoutId);
  }, [settings, user, isInitialized]);

  // Apply dark mode when settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Add this method to update settings without triggering localStorage save
  const updateSettingsWithoutSave = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings,
      isSyncing,
      lastSync
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};