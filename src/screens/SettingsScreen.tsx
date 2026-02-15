import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import {useSettings} from '../context/SettingsContext';
import notificationService from '../services/NotificationService';
import Icon, {IconName} from '../components/Icons';

type SettingsScreenNavigationProp = StackNavigationProp<
  ScreensList,
  'Settings'
>;

interface SettingCardProps {
  iconName: IconName;
  iconColor: string;
  circleBackgroundColor: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

interface InfoCardProps {
  iconName: IconName;
  iconColor: string;
  cardBackgroundColor: string;
  circleBackgroundColor: string;
  title: string;
  description: string;
}

const SettingCard: React.FC<SettingCardProps> = ({
  iconName,
  iconColor,
  circleBackgroundColor,
  title,
  description,
  value,
  onToggle,
  disabled,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconCircle, {backgroundColor: circleBackgroundColor}]}>
        <Icon name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Switch
          trackColor={{false: '#E0E0E0', true: iconColor}}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="#E0E0E0"
          onValueChange={onToggle}
          value={value}
          disabled={disabled}
        />
      </View>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
  </View>
);

const InfoCard: React.FC<InfoCardProps> = ({
  iconName,
  iconColor,
  cardBackgroundColor,
  circleBackgroundColor,
  title,
  description,
}) => (
  <View style={[styles.card, {backgroundColor: cardBackgroundColor}]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconCircle, {backgroundColor: circleBackgroundColor}]}>
        <Icon name={iconName} size={24} color={iconColor} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
  </View>
);

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isTesting, setIsTesting] = React.useState(false);

  const {allowAnalytics, allowMessages, updateSetting, isLoading} =
    useSettings();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      <View style={styles.content}>
        <Text style={styles.title}>Настройки</Text>

        <SettingCard
          iconName="notification"
          iconColor="#FFA000"
          circleBackgroundColor="#FFF3E0"
          title="Ежедневные уведомления"
          description="Ежедневные напоминания о тренировках в 9:00 утра"
          value={allowMessages}
          onToggle={handleMessagesToggle}
          disabled={isLoading}
        />

        <SettingCard
          iconName="guard"
          iconColor="#2196F3"
          circleBackgroundColor="#E3F2FD"
          title="Анонимная аналитика"
          description="Помогает улучшать приложение"
          value={allowAnalytics}
          onToggle={handleAnalyticsToggle}
          disabled={isLoading}
        />

        <InfoCard
          iconName="info"
          iconColor="#4CAF50"
          cardBackgroundColor="#c5ffca"
          circleBackgroundColor="#FFFFFF"
          title="Мы ценим вашу приватность"
          description="Все вводимые вами данные (возраст, ЧСС покоя) обрабатываются локально на вашем устройстве и не отправляются на наши сервера для хранения."
        />

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
    paddingTop: 30,
    alignItems: 'center',
    paddingHorizontal: '8%',
  },
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 18,
    marginLeft: 52,
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