import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import {useSettings} from '../context/SettingsContext';
import notificationService from '../services/NotificationService'; // Импортируем сервис уведомлений

type SettingsScreenNavigationProp = StackNavigationProp<
  ScreensList,
  'Settings'
>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isTesting, setIsTesting] = React.useState(false);
  
  const {
    allowAnalytics,
    allowMessages,
    updateSetting,
    testNotification,
    isLoading,
  } = useSettings();

  const bottomBarItems = [
    {
      iconName: 'back' as const,
      onPress: () => navigation.navigate('Main'),
      key: 'back-btn',
    },
    {
      iconName: 'history' as const,
      onPress: () => navigation.navigate('History'),
      key: 'history-btn',
    },
  ];

  const handleAnalyticsToggle = async () => {
    const newValue = !allowAnalytics;
    await updateSetting('allow_analytics', newValue);
  };

  const handleMessagesToggle = async () => {
    const newValue = !allowMessages;
    await updateSetting('allow_messages', newValue);
  };

  // Функция для отправки тестового уведомления
  const handleTestNotification = async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    
    try {
      // Отправляем случайное уведомление
      const notificationId = await notificationService.sendRandomNotification();
      
      if (notificationId !== null) {
        Alert.alert(
          '✅ Уведомление отправлено',
          `ID: ${notificationId}\n\nПроверьте панель уведомлений вашего устройства.`,
          [{text: 'OK'}]
        );
      } else {
        Alert.alert(
          '❌ Ошибка отправки',
          'Не удалось отправить уведомление. Проверьте настройки устройства.',
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
      Alert.alert(
        '❌ Ошибка',
        'Произошла ошибка при отправке уведомления.',
        [{text: 'OK'}]
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      <View style={styles.content}>
        <Text style={styles.title}>Настройки</Text>

        <View style={styles.sectionFirst}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleMessagesToggle}
            disabled={isLoading}>
            <View style={styles.checkboxOuter}>
              {allowMessages && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Присылать ежедневные уведомления
            </Text>
          </TouchableOpacity>
          <Text style={styles.settingDescription}>
            Ежедневные напоминания о тренировках в 9:00 утра
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleAnalyticsToggle}
            disabled={isLoading}>
            <View style={styles.checkboxOuter}>
              {allowAnalytics && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Разрешить анонимную аналитику использования
            </Text>
          </TouchableOpacity>
          <Text style={styles.settingDescription}>
            Помогает улучшать приложение
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.privacyTitle}>Мы ценим вашу приватность.</Text>
          <Text style={styles.privacyText}>
            • Медицинские расчеты: Все вводимые вами данные (вес, рост,
            лабораторные показатели) обрабатываются локально на вашем устройстве
            и не отправляются на наши сервера для хранения.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          onPress={handleTestNotification}
          disabled={isTesting || isLoading}>
          <Text style={styles.testButtonText}>
            {isTesting ? 'Отправка...' : isLoading ? 'Загрузка...' : 'Тест уведомления'}
          </Text>
        </TouchableOpacity>

      </View>

      <BottomBar items={bottomBarItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F5EE',
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: '10%',
  },
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#fdbcbd',
  },
  sectionFirst: {
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#79A162',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#79A162',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 21,
    color: '#A0C28E',
    flex: 1,
  },
  privacyTitle: {
    fontSize: 21,
    color: '#A0C28E',
    textAlign: 'center',
    marginBottom: 15,
  },
  privacyText: {
    textAlign: 'left',
    fontSize: 16,
    color: '#A0C28E',
    lineHeight: 20,
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#A0C0E0',
    opacity: 0.7,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});