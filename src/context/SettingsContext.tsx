// src/context/SettingsContext.tsx
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import DatabaseService from '../services/DatabaseService';

interface SettingsContextType {
  allowAnalytics: boolean;
  allowMessages: boolean;
  updateSetting: (key: string, value: boolean) => Promise<void>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({children}) => {
  const [allowAnalytics, setAllowAnalytics] = useState<boolean>(true);
  const [allowMessages, setAllowMessages] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      console.log('Loading settings from database...');
      
      const analytics = await DatabaseService.getBooleanSetting('allow_analytics');
      const messages = await DatabaseService.getBooleanSetting('allow_messages');
      
      console.log('Loaded settings:', { analytics, messages });
      
      setAllowAnalytics(analytics);
      setAllowMessages(messages);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    try {
      console.log(`Updating setting: ${key} = ${value}`);
      await DatabaseService.saveSetting(key, value.toString());
      
      // Обновляем локальное состояние
      if (key === 'allow_analytics') {
        setAllowAnalytics(value);
      } else if (key === 'allow_messages') {
        setAllowMessages(value);
      }
      
      console.log(`Setting updated successfully: ${key} = ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const contextValue: SettingsContextType = {
    allowAnalytics,
    allowMessages,
    updateSetting,
    isLoading,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};