import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import Navigation from './src/navigation/navigation';
import {PulseProvider} from './src/context/PulseContext';
import {SettingsProvider} from './src/context/SettingsContext';
import DatabaseService from './src/services/DatabaseService';
import FirebaseService from './src/services/FirebaseService';
// NotificationService больше не нужен здесь - он инициализируется в SettingsContext

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing database...');
        await DatabaseService.initializeDatabase();
        console.log('Database initialized');

        // Загружаем настройку аналитики для Firebase
        const analyticsEnabled = await DatabaseService.getBooleanSetting(
          'allow_analytics',
        );
        console.log('Analytics setting:', analyticsEnabled);

        // Инициализируем Firebase
        await FirebaseService.initialize(analyticsEnabled);

        // Уведомления теперь инициализируются в SettingsContext
        // после загрузки настроек

        // Логируем запуск приложения
        await FirebaseService.logEvent('app_launch');

        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
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
          <Text style={styles.loadingText}>Загрузка приложения...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SettingsProvider>
      <PulseProvider>
        <SafeAreaView style={styles.container}>
          <Navigation />
        </SafeAreaView>
      </PulseProvider>
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
  },
});

export default App;
