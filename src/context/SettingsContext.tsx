// src/context/SettingsContext.tsx
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import DatabaseService from '../services/DatabaseService';
import FirebaseService from '../services/FirebaseService'; // ← Добавить импорт

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
      console.log('[SettingsContext] Loading settings from database...');
      
      const analytics = await DatabaseService.getBooleanSetting('allow_analytics');
      const messages = await DatabaseService.getBooleanSetting('allow_messages');
      
      console.log('[SettingsContext] Loaded settings:', { analytics, messages });
      
      setAllowAnalytics(analytics);
      setAllowMessages(messages);
    } catch (error) {
      console.error('[SettingsContext] Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    try {
      console.log(`[SettingsContext] Updating setting: ${key} = ${value}`);
      
      // Сохраняем в БД
      await DatabaseService.saveSetting(key, value.toString());
      
      // Обновляем Firebase если это настройка аналитики
      if (key === 'allow_analytics') {
        console.log(`[SettingsContext] Updating Firebase Analytics: ${value}`);
        await FirebaseService.setAnalyticsEnabled(value);
        
        // Логируем изменение настройки (если аналитика включена)
        if (value && FirebaseService.isAnalyticsEnabled()) {
          await FirebaseService.logEvent('analytics_enabled');
        } else if (!value) {
          // Даже если аналитика отключена, пытаемся залогировать через FirebaseService
          // (он сам проверит состояние)
          await FirebaseService.logEvent('analytics_disabled');
        }
        
        setAllowAnalytics(value);
      } else if (key === 'allow_messages') {
        setAllowMessages(value);
        
        // Логируем изменение настройки уведомлений
        if (FirebaseService.isAnalyticsEnabled()) {
          await FirebaseService.logEvent('notifications_toggle', {
            enabled: value,
          });
        }
      }
      
      console.log(`[SettingsContext] Setting updated successfully: ${key} = ${value}`);
    } catch (error) {
      console.error('[SettingsContext] Error updating setting:', error);
      // Откатываем состояние в UI
      if (key === 'allow_analytics') {
        setAllowAnalytics(!value);
      } else if (key === 'allow_messages') {
        setAllowMessages(!value);
      }
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