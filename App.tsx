import React, {useEffect, useState} from 'react';
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
import DatabaseService from './src/services/DatabaseService';
import FirebaseService from './src/services/FirebaseService';
import {ProfileProvider} from './src/context/ProfileContext';

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

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadingText, setLoadingText] = useState('Загрузка приложения...');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingText('Инициализация базы данных...');
        console.log('Initializing database...');
        await DatabaseService.initializeDatabase();
        console.log('Database initialized');

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
            return Image.prefetch(Image.resolveAssetSource(icon).uri);
          });

          await Promise.all(preloadPromises);
          console.log('All icons preloaded successfully');
        };

        await preloadIcons();

        // Логируем запуск приложения
        await FirebaseService.logEvent('app_launch');

        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setLoadingText('Завершение загрузки...');
        // В любом случае продолжаем
        setTimeout(() => setIsAppReady(true), 1000);
      }
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
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
    <SettingsProvider>
      <ProfileProvider>
        <PulseProvider>
          <SafeAreaView style={styles.container}>
            <Navigation />
          </SafeAreaView>
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
