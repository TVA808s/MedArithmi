import {Platform, NativeModules} from 'react-native';

interface NotificationModule {
  showNotification(title: string, message: string): Promise<number>;
  scheduleDailyNotification(title: string, message: string, hour: number, minute: number): Promise<boolean>;
  cancelScheduledNotification(): Promise<void>; // уже правильно
}



class NotificationService {
  private readonly isAndroid = Platform.OS === 'android';
  private notificationModule: NotificationModule | null = null;
  
  // Все уведомления в одной категории (14 сообщений)
  private readonly allMessages = [
    {
      title: '🏃 Время для активности!',
      message: 'Проверьте свою пульсовую зону перед тренировкой в PulseSport.'
    },
    {
      title: '💓 Здоровье сердца',
      message: 'Контроль пульса снижает риск сердечных заболеваний. Откройте приложение для расчёта.'
    },
    {
      title: '📱 PulseSport напоминает',
      message: 'Рассчитайте оптимальную нагрузку по вашему пульсу сегодня.'
    },
    {
      title: '⚡ Энергия для дня',
      message: 'Умеренная активность в правильной зоне пульса даёт энергию. Проверьте свою зону!'
    },
    {
      title: '🎯 Точный расчёт',
      message: 'Используйте PulseSport для расчёта персональной зоны пульса прямо сейчас.'
    },
    {
      title: '❤️ Забота о сердце',
      message: 'Регулярный контроль пульса - лучшая профилактика. Не забывайте о своём сердце!'
    },
    {
      title: '🌟 Ты можешь больше!',
      message: 'Твой пульс покажет, на что ты способен. Проверь в PulseSport!'
    },
    {
      title: '🔥 Зажги своё сердце!',
      message: 'Правильная нагрузка - ключ к энергии. Рассчитай свою зону пульса!'
    },
    {
      title: '🏋️‍♂️ Время тренировки!',
      message: 'Рассчитайте пульсовую зону в PulseSport для эффективной и безопасной нагрузки.'
    },
    {
      title: '📊 Ваш прогресс',
      message: 'Отслеживайте изменения пульса в PulseSport для анализа эффективности тренировок.'
    },
    {
      title: '🩺 Медицинский контроль',
      message: 'Регулярный мониторинг пульса в приложении помогает следить за здоровьем.'
    },
    {
      title: '⚡ Заряд энергии',
      message: 'Короткая активность в правильной зоне пульса освежает. Проверьте свою зону!'
    },
    {
      title: '🚀 Вперёд к целям!',
      message: 'Контролируй пульс, достигай результатов с PulseSport.'
    },
    {
      title: '🔔 Регулярные напоминания',
      message: 'Не забывайте проверять пульс. PulseSport поможет сохранить регулярность.'
    }
  ];

  constructor() {
    this.initialize();
  }

  initialize(): void {
    if (this.isAndroid) {
      this.notificationModule = NativeModules.NotificationModule;
      console.log('NotificationService initialized');
    }
  }

  isAvailable(): boolean {
    return this.isAndroid && this.notificationModule !== null;
  }

  async sendNotification(title: string, message: string): Promise<number | null> {
    if (!this.isAvailable()) {
      console.warn('Notification module not available');
      return null;
    }

    try {
      const notificationId = await this.notificationModule!.showNotification(title, message);
      console.log(`Notification sent: "${title}" (ID: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  getRandomMessage() {
    return this.allMessages[Math.floor(Math.random() * this.allMessages.length)];
  }

  async sendRandomNotification(): Promise<number | null> {
    const message = this.getRandomMessage();
    return this.sendNotification(message.title, message.message);
  }

  async showTestNotification(): Promise<void> {
    console.log('Showing test notification...');
    await this.sendNotification(
      '🔔 Test Notification',
      'This is a test notification from PulseSport'
    );
  }

  // Запланировать ежедневное уведомление на 9:00
  async scheduleDailyNotification(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Cannot schedule notification: module not available');
      return false;
    }

    console.log('NotificationService: Scheduling daily notification...');
    
    try {
      const message = this.getRandomMessage();
      console.log('NotificationService: Selected message:', message);
      
      console.log('NotificationService: Calling native module...');
      const result = await this.notificationModule!.scheduleDailyNotification(
        message.title,
        message.message,
        21, // час (20:30)
        33,  // минута
      );
      
      console.log('NotificationService: Scheduling result:', result);
      return result;
    } catch (error: any) {
      console.error('NotificationService: Error scheduling notification:', error);
      console.error('NotificationService: Error message:', error.message);
      console.error('NotificationService: Error stack:', error.stack);
      return false;
    }
  }

  // Отменить все запланированные уведомления
  async cancelAll(): Promise<void> {
    console.log('Cancelling all scheduled notifications...');
    
    try {
      if (this.isAvailable()) {
        await this.notificationModule!.cancelScheduledNotification();
      }
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  getServiceStatus() {
    return {
      isAndroid: this.isAndroid,
      moduleAvailable: this.isAvailable(),
      totalMessages: this.allMessages.length,
      initialized: true
    };
  }
}

const notificationService = new NotificationService();
export default notificationService;