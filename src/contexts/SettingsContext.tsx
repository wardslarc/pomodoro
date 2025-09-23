import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings when user changes
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        // Load from localStorage for anonymous users
        const saved = localStorage.getItem('pomodoro-settings-anonymous');
        if (saved) {
          try {
            const parsedSettings = JSON.parse(saved);
            setSettings({ ...defaultSettings, ...parsedSettings });
          } catch (e) {
            console.error('Error parsing localStorage settings:', e);
            setSettings(defaultSettings);
          }
        }
        setIsInitialized(true);
        return;
      }

      try {
        const userSettingsRef = doc(db, 'userSettings', user.uid);
        const userSettingsDoc = await getDoc(userSettingsRef);
        
        if (userSettingsDoc.exists()) {
          const userSettings = userSettingsDoc.data();
          
          // Merge with defaults to ensure all fields exist
          const mergedSettings = { ...defaultSettings, ...userSettings };
          setSettings(mergedSettings);
        } else {
          // Create initial settings document for new user
          await setDoc(userSettingsRef, defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading user settings from Firestore:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(`pomodoro-settings-${user.uid}`);
        if (saved) {
          try {
            const parsedSettings = JSON.parse(saved);
            setSettings({ ...defaultSettings, ...parsedSettings });
          } catch (e) {
            console.error('Error parsing localStorage settings:', e);
            setSettings(defaultSettings);
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, [user]);

  // Save to appropriate storage whenever settings change
  useEffect(() => {
    if (!isInitialized) return; // Don't save until we've finished initial loading

    const saveSettings = async () => {
      try {
        if (user) {

          await setDoc(doc(db, 'userSettings', user.uid), settings, { merge: true });
          // Also save to localStorage as backup
          localStorage.setItem(`pomodoro-settings-${user.uid}`, JSON.stringify(settings));
        } else {
          // Save to localStorage for anonymous users
          localStorage.setItem('pomodoro-settings-anonymous', JSON.stringify(settings));
        }
 
      } catch (error) {
        console.error('Error saving settings to Firestore:', error);
        // Fallback to localStorage
        if (user) {
          localStorage.setItem(`pomodoro-settings-${user.uid}`, JSON.stringify(settings));
        } else {
          localStorage.setItem('pomodoro-settings-anonymous', JSON.stringify(settings));
        }

      }
    };

    saveSettings();
  }, [settings, user, isInitialized]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
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