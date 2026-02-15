// SettingsScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import {useSettings} from '../context/SettingsContext';
import {useProfile} from '../context/ProfileContext';
import notificationService from '../services/NotificationService';
import Card from '../components/Card';

type SettingsScreenNavigationProp = StackNavigationProp<
  ScreensList,
  'Settings'
>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isTesting, setIsTesting] = useState(false);
  const [localProfile, setLocalProfile] = useState({name: '', age: ''});

  const {allowAnalytics, allowMessages, updateSetting, isLoading} =
    useSettings();
  const {profile, updateProfile, validationErrors} = useProfile();

  // Синхронизация с контекстом при загрузке и обновлении профиля
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

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

  const handleProfileChange = async (field: 'name' | 'age', value: string) => {
    // Для поля возраста фильтруем только цифры
    if (field === 'age') {
      // Удаляем все символы, кроме цифр
      const numericValue = value.replace(/[^0-9]/g, '');

      // Ограничиваем длину до 3 символов
      if (numericValue.length <= 3) {
        setLocalProfile(prev => ({...prev, [field]: numericValue}));
        await updateProfile(field, numericValue);
      }
    } else {
      // Для имени разрешаем буквы, пробелы и дефисы
      const filteredValue = value.replace(/[^a-zA-Zа-яА-Я\s-]/g, '');
      setLocalProfile(prev => ({...prev, [field]: filteredValue}));
      await updateProfile(field, filteredValue);
    }
  };

  const handleTestNotification = async () => {
    if (isTesting) {
      return;
    }

    setIsTesting(true);

    try {
      const notificationId = await notificationService.sendRandomNotification();

      if (notificationId !== null) {
        Alert.alert(
          '✅ Уведомление отправлено',
          `ID: ${notificationId}\n\nПроверьте панель уведомлений вашего устройства.`,
          [{text: 'OK'}],
        );
      } else {
        Alert.alert(
          '❌ Ошибка отправки',
          'Не удалось отправить уведомление. Проверьте настройки устройства.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
      Alert.alert('❌ Ошибка', 'Произошла ошибка при отправке уведомления.', [
        {text: 'OK'},
      ]);
    } finally {
      setIsTesting(false);
    }
  };

  // Определяем цвет границы в зависимости от наличия ошибки
  const getNameBorderColor = () => {
    return validationErrors.name ? '#FF6B6B' : '#E0E0E0';
  };

  const getAgeBorderColor = () => {
    return validationErrors.age ? '#FF6B6B' : '#E0E0E0';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Настройки</Text>

        {/* Карточка профиля пользователя */}
        <Card
          type="profile"
          profileData={localProfile}
          onProfileChange={handleProfileChange}
          validationErrors={validationErrors}
          nameBorderColor={getNameBorderColor()}
          ageBorderColor={getAgeBorderColor()}
        />

        {/* Карточка уведомлений */}
        <Card
          type="setting"
          title="Ежедневные уведомления"
          description="Ежедневные напоминания о тренировках в 9:00 утра"
          iconName="notification"
          iconColor="#FFA000"
          switchValue={allowMessages}
          onSwitchToggle={handleMessagesToggle}
          switchDisabled={isLoading}
        />

        {/* Карточка аналитики */}
        <Card
          type="setting"
          title="Анонимная аналитика"
          description="Помогает улучшать приложение"
          iconName="guard"
          iconColor="#2196F3"
          switchValue={allowAnalytics}
          onSwitchToggle={handleAnalyticsToggle}
          switchDisabled={isLoading}
          iconCircleColor="#d1eaff"
        />

        {/* Информационная карточка о приватности */}
        <Card
          type="settingInfo"
          title="Мы ценим вашу приватность"
          description="Все вводимые вами данные (возраст, ЧСС покоя) обрабатываются локально на вашем устройстве и не отправляются на наши сервера для хранения."
          iconName="info"
          iconColor="#4CAF50"
          backgroundColor="#c5ffca"
        />

        {/* Кнопка теста уведомления */}
        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          onPress={handleTestNotification}
          disabled={isTesting || isLoading}>
          <Text style={styles.testButtonText}>
            {isTesting
              ? 'Отправка...'
              : isLoading
              ? 'Загрузка...'
              : 'Тест уведомления'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomBar items={bottomBarItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F5EE',
  },
  scrollContent: {
    paddingTop: 30,
    alignItems: 'center',
    paddingHorizontal: '8%',
    paddingBottom: 20,
  },
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
    width: '100%',
  },
  testButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
