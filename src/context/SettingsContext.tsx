// context/SettingsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback, // Добавить импорт
} from 'react';
import DatabaseService from '../services/DatabaseService';
import FirebaseService from '../services/FirebaseService';
import NotificationService from '../services/NotificationService';

interface SettingsContextType {
  allowAnalytics: boolean;
  allowMessages: boolean;
  updateSetting: (key: string, value: boolean) => Promise<void>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  testNotification: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [allowAnalytics, setAllowAnalytics] = useState<boolean>(true);
  const [allowMessages, setAllowMessages] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Оборачиваем loadSettings в useCallback
  const loadSettings = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      console.log('[SettingsContext] Loading settings from database...');

      // Проверяем, инициализирована ли БД
      try {
        const analytics = await DatabaseService.getBooleanSetting(
          'allow_analytics',
        );
        const messages = await DatabaseService.getBooleanSetting(
          'allow_messages',
        );

        console.log('[SettingsContext] Loaded settings:', {
          analytics,
          messages,
        });

        setAllowAnalytics(analytics);
        setAllowMessages(messages);
        setIsInitialized(true);

        // Если уведомления включены в настройках - планируем их
        if (messages) {
          console.log('[SettingsContext] Initializing notifications...');
          NotificationService.initialize();
          await NotificationService.scheduleDailyNotification();
        }
      } catch (error) {
        console.error('[SettingsContext] Error loading settings:', error);

        // Если ошибка инициализации БД, пробуем снова до 3 раз
        if (retryCount < 3) {
          console.log(`[SettingsContext] Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => loadSettings(retryCount + 1), 1000);
        } else {
          // Если все попытки неудачны, используем значения по умолчанию
          console.log('[SettingsContext] Using default settings after retries');
          setAllowAnalytics(true);
          setAllowMessages(true);
          setIsInitialized(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Пустой массив зависимостей, так как функция не использует внешние переменные

  useEffect(() => {
    loadSettings();
  }, [loadSettings]); // Теперь можно добавить loadSettings в зависимости

  const testNotification = useCallback(async () => {
    try {
      console.log('[SettingsContext] Testing notification...');
      NotificationService.showTestNotification();
    } catch (error) {
      console.error('[SettingsContext] Test notification error:', error);
    }
  }, []);

  const updateSetting = useCallback(async (key: string, value: boolean) => {
    try {
      console.log(`[SettingsContext] Updating setting: ${key} = ${value}`);

      await DatabaseService.saveSetting(key, value.toString());

      if (key === 'allow_analytics') {
        await FirebaseService.setAnalyticsEnabled(value);
        setAllowAnalytics(value);

        if (value) {
          await FirebaseService.logEvent('analytics_enabled');
        }
      } else if (key === 'allow_messages') {
        if (value) {
          console.log('[SettingsContext] Enabling notifications...');
          NotificationService.initialize();
          await NotificationService.scheduleDailyNotification();

          if (FirebaseService.isAnalyticsEnabled()) {
            await FirebaseService.logEvent('notifications_enabled');
          }
        } else {
          console.log('[SettingsContext] Disabling notifications...');
          await NotificationService.cancelAll();

          if (FirebaseService.isAnalyticsEnabled()) {
            await FirebaseService.logEvent('notifications_disabled');
          }
        }

        setAllowMessages(value);
      }

      console.log(
        `[SettingsContext] Setting updated successfully: ${key} = ${value}`,
      );
    } catch (error) {
      console.error('[SettingsContext] Error updating setting:', error);

      if (key === 'allow_analytics') {
        setAllowAnalytics(!value);
      } else if (key === 'allow_messages') {
        setAllowMessages(!value);
      }

      if (FirebaseService.isAnalyticsEnabled()) {
        await FirebaseService.logEvent('setting_update_error', {
          key,
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  const contextValue: SettingsContextType = {
    allowAnalytics,
    allowMessages,
    updateSetting,
    isLoading: isLoading || !isInitialized,
    refreshSettings,
    testNotification,
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
