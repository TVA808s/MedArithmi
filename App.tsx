// App.tsx
import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import Navigation from './src/navigation/navigation';
import {PulseProvider} from './src/context/PulseContext';
import {SettingsProvider} from './src/context/SettingsContext';
import {ProfileProvider, useProfile} from './src/context/ProfileContext';
import DatabaseService from './src/services/DatabaseService';
import FirebaseService from './src/services/FirebaseService';
import OnboardingModal from './src/components/OnboardingModal';

// Список всех иконок для предзагрузки
const ICONS_TO_PRELOAD = [
  require('./src/assets/icons/History.png'),
  require('./src/assets/icons/Settings.png'),
  require('./src/assets/icons/Back.png'),
  require('./src/assets/icons/Trash.png'),
  require('./src/assets/icons/Droplet.png'),
  require('./src/assets/icons/Heart.png'),
  require('./src/assets/icons/Lightning.png'),
  require('./src/assets/icons/Plant.png'),
  require('./src/assets/icons/Star.png'),
  require('./src/assets/icons/Pulse.png'),
  require('./src/assets/icons/Person.png'),
  require('./src/assets/icons/Heart2.png'),
  require('./src/assets/icons/Shield.png'),
  require('./src/assets/icons/Notification.png'),
  require('./src/assets/icons/Info.png'),
  require('./src/assets/icons/Calculator.png'),
];

// Режим отладки - всегда показывать онбординг
const DEBUG_MODE = false; // Установите false для продакшена

// Внутренний компонент для доступа к профилю
const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [loadingText, setLoadingText] = useState('Загрузка приложения...');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const {profile, updateProfile, updateProfileBatch} = useProfile();

  // Сначала инициализируем базу данных
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoadingText('Инициализация базы данных...');
        console.log('Initializing database...');
        await DatabaseService.initializeDatabase();
        console.log('Database initialized');
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('Database initialization error:', error);
        // Пробуем еще раз через секунду
        setTimeout(() => initializeDatabase(), 1000);
      }
    };

    initializeDatabase();
  }, []);

  // После инициализации БД загружаем остальное
  const initializeApp = useCallback(async () => {
    if (!isDatabaseReady) {
      return;
    }

    try {
      setLoadingText('Загрузка настроек...');
      const analyticsEnabled = await DatabaseService.getBooleanSetting(
        'allow_analytics',
      );
      console.log('Analytics setting:', analyticsEnabled);

      setLoadingText('Инициализация Firebase...');
      await FirebaseService.initialize(analyticsEnabled);

      // Предзагрузка всех иконок
      setLoadingText('Предзагрузка иконок...');
      console.log('Starting icon preload...');

      const preloadIcons = async () => {
        const preloadPromises = ICONS_TO_PRELOAD.map(icon => {
          const source = Image.resolveAssetSource(icon);
          return Image.prefetch(source.uri);
        });

        await Promise.all(preloadPromises);
        console.log('All icons preloaded successfully');
      };

      await preloadIcons();

      // Логируем запуск приложения
      await FirebaseService.logEvent('app_launch');

      // НЕ загружаем профиль здесь - он уже загружается в ProfileContext
      // Просто ждем, пока ProfileContext загрузится
      await new Promise(resolve => setTimeout(resolve, 100));

      setIsAppReady(true);
    } catch (error) {
      console.error('App initialization error:', error);
      setLoadingText('Завершение загрузки...');
      setIsAppReady(true);
    }
  }, [isDatabaseReady]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Показываем онбординг после загрузки приложения
  useEffect(() => {
    if (isAppReady && profile) {
      if (DEBUG_MODE) {
        console.log('DEBUG MODE: Showing onboarding');
        setTimeout(() => setShowOnboarding(true), 500);
      } else if (!profile.hasCompletedOnboarding) {
        console.log('First launch: Showing onboarding');
        setTimeout(() => setShowOnboarding(true), 500);
      }
    }
  }, [isAppReady, profile]);

  const handleOnboardingComplete = async (name: string, age: string) => {
    try {
      console.log('========== HANDLE ONBOARDING COMPLETE ==========');
      console.log('Using context method with data:', {name, age});

      const updates: Partial<UserProfile> = {};

      if (name && name.trim()) {
        updates.name = name.trim();
      }

      if (age && age.trim()) {
        updates.age = age.trim();
      }

      if (Object.keys(updates).length > 0) {
        console.log('Calling updateProfileBatch with:', updates);
        await updateProfileBatch(updates);
        console.log('updateProfileBatch completed successfully');
      }

      // Отмечаем онбординг как завершенный (только если не в режиме отладки)
      if (!DEBUG_MODE) {
        await updateProfile('hasCompletedOnboarding', true);
      }

      console.log('Closing onboarding modal');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error in handleOnboardingComplete:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingClose = () => {
    console.log('Onboarding closed by user');
    setShowOnboarding(false);
  };

  if (!isAppReady || !isDatabaseReady) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#79A162" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Navigation />
      </SafeAreaView>

      <OnboardingModal
        visible={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
        initialName={profile?.name || ''}
        initialAge={profile?.age || ''}
      />
    </>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <ProfileProvider>
        <PulseProvider>
          <AppContent />
        </PulseProvider>
      </ProfileProvider>
    </SettingsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5EE',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0F5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#79A162',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default App;
