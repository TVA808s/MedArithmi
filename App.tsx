import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View, ActivityIndicator, Text} from 'react-native';
import Navigation from './src/navigation/navigation';
import {PulseProvider} from './src/context/PulseContext';
import {SettingsProvider} from './src/context/SettingsContext';
import DatabaseService from './src/services/DatabaseService';

const App = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Starting database initialization...');
        await DatabaseService.initializeDatabase();
        console.log('Database initialized successfully');
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setInitError('Database initialization failed');
        // Все равно продолжаем через 1.5 секунды
        setTimeout(() => setIsDbInitialized(true), 1500);
      }
    };

    initializeDatabase();
  }, []);

  // Показываем индикатор загрузки пока БД не инициализирована
  if (!isDbInitialized) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#79A162" />
          <Text style={styles.loadingText}>
            {initError ? 'Продолжаем без базы данных...' : 'Инициализация приложения...'}
          </Text>
          {initError && (
            <Text style={styles.errorText}>{initError}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Основное приложение после инициализации БД
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
  loadingScreen: {
    flex: 1,
    backgroundColor: '#F0F5EE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#79A162',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#E75F55',
    textAlign: 'center',
  },
});

export default App;