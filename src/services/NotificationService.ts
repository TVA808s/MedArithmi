import PushNotification, {Importance} from 'react-native-push-notification';
import {Platform} from 'react-native';

// База ежедневных сообщений
const DAILY_NOTIFICATIONS = [
  {
    id: 'workout_reminder_1',
    title: '🏃 Время для тренировки!',
    message:
      'Ваше тело ждет активности! Рассчитайте сегодняшнюю пульсовую зону.',
  },
  {
    id: 'health_tip_1',
    title: '💖 Здоровье сердца',
    message:
      'Регулярные тренировки в правильной зоне пульса укрепляют сердечно-сосудистую систему.',
  },
];

class NotificationService {
  private channelId = 'daily_reminders';
  private isChannelCreated = false;

  // Инициализация
  initialize(): void {
    if (Platform.OS !== 'android') {
      return;
    }

    console.log('[Notification] Инициализация...');

    // Создаем канал если еще не создан
    if (!this.isChannelCreated) {
      this.createChannel();
    }

    // Конфигурируем библиотеку
    PushNotification.configure({
      onRegister: token => {
        console.log('[Notification] Токен:', token);
      },
      onNotification: notification => {
        console.log('[Notification] Получено:', notification);
        notification.finish(PushNotification.FetchResult.NoData);
      },
      requestPermissions: true,
      popInitialNotification: true,
    });

    console.log('[Notification] Готово');
  }

  // Создание канала
  private createChannel(): void {
    if (Platform.OS !== 'android') {
      return;
    }

    console.log('[Notification] Создаю канал...');

    PushNotification.createChannel(
      {
        channelId: this.channelId,
        channelName: 'Напоминания',
        channelDescription: 'Напоминания о тренировках',
        importance: Importance.HIGH,
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: 'default',
      },
      created => {
        this.isChannelCreated = true;
        console.log(
          `[Notification] Канал "${this.channelId}" создан: ${created}`,
        );
      },
    );
  }

  // ТЕСТОВОЕ уведомление
  showTestNotification(): void {
    if (Platform.OS !== 'android') {
      return;
    }

    console.log('[Notification] Тестовое уведомление...');

    this.initialize();

    PushNotification.localNotification({
      id: 'test_' + Date.now(),
      title: '🔔 Тест уведомления',
      message: 'Это тестовое уведомление ' + new Date().toLocaleTimeString(),
      channelId: this.channelId,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      color: '#E75F55',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      autoCancel: true,
      userInfo: {
        type: 'test',
        timestamp: Date.now().toString(),
      },
    });

    console.log('[Notification] Уведомление отправлено');
  }

  // Запланировать ежедневное уведомление
  async scheduleDailyNotification(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    console.log('[Notification] Планирование ежедневного уведомления...');

    this.initialize();

    // Проверяем есть ли уже запланированные уведомления
    const hasScheduled = await this.hasScheduledNotifications();
    if (hasScheduled) {
      console.log('[Notification] Уведомления уже запланированы');
      return;
    }

    const randomIndex = Math.floor(Math.random() * DAILY_NOTIFICATIONS.length);
    const notification = DAILY_NOTIFICATIONS[randomIndex];

    // Завтра в 9:00
    const triggerTime = new Date();
    triggerTime.setDate(triggerTime.getDate() + 1);
    triggerTime.setHours(9, 0, 0, 0);

    // Удаляем старые уведомления с таким же ID
    PushNotification.cancelLocalNotification({id: 'daily_' + notification.id});

    // Планируем новое
    PushNotification.localNotificationSchedule({
      id: 'daily_' + notification.id,
      title: notification.title,
      message: notification.message,
      channelId: this.channelId,
      date: triggerTime,
      repeatType: 'day',
      allowWhileIdle: true,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      color: '#E75F55',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      autoCancel: true,
      userInfo: {
        type: 'daily_reminder',
        id: notification.id,
      },
    });

    console.log(
      `[Notification] Ежедневное уведомление запланировано на: ${triggerTime.toLocaleDateString()} ${triggerTime.toLocaleTimeString()}`,
    );
  }

  // Проверить есть ли запланированные уведомления
  private hasScheduledNotifications(): Promise<boolean> {
    return new Promise(resolve => {
      if (Platform.OS !== 'android') {
        resolve(false);
        return;
      }

      PushNotification.getScheduledLocalNotifications(notifications => {
        const hasDaily = notifications?.some(
          n =>
            n.id?.startsWith('daily_') || n.userInfo?.type === 'daily_reminder',
        );
        resolve(hasDaily || false);
      });
    });
  }

  // Отмена всех уведомлений
  cancelAll(): void {
    if (Platform.OS !== 'android') {
      return;
    }

    PushNotification.cancelAllLocalNotifications();
    console.log('[Notification] Все уведомления отменены');
  }
}

export default new NotificationService();
