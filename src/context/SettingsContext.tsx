import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      console.log('[SettingsContext] Loading settings from database...');

      const analytics = await DatabaseService.getBooleanSetting(
        'allow_analytics',
      );
      const messages = await DatabaseService.getBooleanSetting(
        'allow_messages',
      );

      // ИСПРАВЛЕНО: убрана лишняя запятая
      console.log('[SettingsContext] Loaded settings:', {analytics, messages});

      setAllowAnalytics(analytics);
      setAllowMessages(messages);

      // Если уведомления включены в настройках - планируем их
      if (messages) {
        console.log('[SettingsContext] Initializing notifications...');
        NotificationService.initialize();
        await NotificationService.scheduleDailyNotification();
      }
    } catch (error) {
      console.error('[SettingsContext] Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const testNotification = async () => {
    try {
      console.log('[SettingsContext] Testing notification...');
      NotificationService.showTestNotification();
    } catch (error) {
      console.error('[SettingsContext] Test notification error:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      console.log(`[SettingsContext] Updating setting: ${key} = ${value}`);

      // Сохраняем в БД
      await DatabaseService.saveSetting(key, value.toString());

      if (key === 'allow_analytics') {
        // Обновляем Firebase Analytics
        await FirebaseService.setAnalyticsEnabled(value);
        setAllowAnalytics(value);

        // Логируем событие только если включаем аналитику
        if (value) {
          await FirebaseService.logEvent('analytics_enabled');
        }
      } else if (key === 'allow_messages') {
        if (value) {
          // Включаем уведомления
          console.log('[SettingsContext] Enabling notifications...');

          // Инициализируем и планируем уведомления
          NotificationService.initialize();
          await NotificationService.scheduleDailyNotification();

          console.log('[SettingsContext] Notifications enabled and scheduled');

          // Логируем включение
          if (FirebaseService.isAnalyticsEnabled()) {
            await FirebaseService.logEvent('notifications_enabled');
          }
        } else {
          // Выключаем уведомления
          console.log('[SettingsContext] Disabling notifications...');
          await NotificationService.cancelAll();

          console.log('[SettingsContext] All notifications cancelled');

          // Логируем выключение
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

      // Откатываем UI состояние при ошибке
      if (key === 'allow_analytics') {
        setAllowAnalytics(!value);
      } else if (key === 'allow_messages') {
        setAllowMessages(!value);
      }

      // Логируем ошибку если аналитика включена
      if (FirebaseService.isAnalyticsEnabled()) {
        await FirebaseService.logEvent('setting_update_error', {
          key,
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        });
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
