import analytics from '@react-native-firebase/analytics';

class FirebaseService {
  private analyticsEnabled: boolean = false;

  async initialize(enabled: boolean = true): Promise<void> {
    try {
      this.analyticsEnabled = enabled;

      if (!enabled) {
        console.log('Firebase Analytics отключен пользователем');
        return;
      }

      // Включаем сбор аналитики
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('Firebase Analytics инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации Firebase:', error);
      this.analyticsEnabled = false;
    }
  }

  async setAnalyticsEnabled(enabled: boolean): Promise<void> {
    this.analyticsEnabled = enabled;

    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
      console.log(`Firebase Analytics ${enabled ? 'включен' : 'отключен'}`);
    } catch (error) {
      console.error('Ошибка изменения состояния аналитики:', error);
    }
  }

  async logEvent(eventName: string, params?: any): Promise<void> {
    if (!this.analyticsEnabled) {
      return;
    }

    try {
      await analytics().logEvent(eventName, params);
      console.log(`Событие отправлено: ${eventName}`, params);
    } catch (error) {
      console.error(`Ошибка отправки события ${eventName}:`, error);
    }
  }

  async logScreenView(screenName: string): Promise<void> {
    if (!this.analyticsEnabled) {
      return;
    }

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
      console.log(`Экран просмотрен: ${screenName}`);
    } catch (error) {
      console.error(`Ошибка логирования экрана ${screenName}:`, error);
    }
  }

  isAnalyticsEnabled(): boolean {
    return this.analyticsEnabled;
  }
}

export default new FirebaseService();
