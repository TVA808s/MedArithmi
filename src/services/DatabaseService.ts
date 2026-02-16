// services/DatabaseService.ts
import SQLite from 'react-native-sqlite-storage';
import {Platform} from 'react-native';

const databaseName = 'PulseSportDB.db';

export const SETTINGS_KEYS = {
  ALLOW_ANALYTICS: 'allow_analytics',
  ALLOW_MESSAGES: 'allow_messages',
} as const;

// Интерфейс для профиля пользователя
export interface UserProfile {
  name: string;
  age: string;
  hasCompletedOnboarding: boolean;
}

SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;
  private saveInProgress = false;
  private lastSaveTime = 0;
  async initializeDatabase(): Promise<void> {
    // Если уже инициализируем, возвращаем существующий промис
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeDatabase();
    return this.initializationPromise;
  }

  private async _initializeDatabase(): Promise<void> {
    try {
      console.log('Opening database...');
      this.db = await SQLite.openDatabase({
        name: databaseName,
        location: Platform.OS === 'ios' ? 'Library' : 'default',
      });
      console.log('Database opened');

      await this.createTables();
      console.log('Tables created');

      await this.initializeDefaultSettings();
      console.log('Default settings initialized');
    } catch (error) {
      console.error('Database initialization error:', error);
      this.initializationPromise = null; // Сбрасываем при ошибке
      throw error;
    }
  }

  // НОВЫЙ МЕТОД: проверка инициализации
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      console.log('Database not initialized, initializing now...');
      await this.initializeDatabase();
    }
  }

  private async createTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        resting_hr INTEGER NOT NULL,
        zone_min INTEGER NOT NULL,
        zone_max INTEGER NOT NULL,
        calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const query of queries) {
      await this.executeAction(query, []);
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    try {
      const existingAnalytics = await this.getSetting(
        SETTINGS_KEYS.ALLOW_ANALYTICS,
      );
      if (existingAnalytics === null) {
        await this.saveSetting(SETTINGS_KEYS.ALLOW_ANALYTICS, 'true');
      }

      const existingMessages = await this.getSetting(
        SETTINGS_KEYS.ALLOW_MESSAGES,
      );
      if (existingMessages === null) {
        await this.saveSetting(SETTINGS_KEYS.ALLOW_MESSAGES, 'true');
      }

      // Инициализируем профиль, если его нет
      const existingName = await this.getSetting('user_name');
      if (existingName === null) {
        await this.saveSetting('user_name', '');
      }

      const existingAge = await this.getSetting('user_age');
      if (existingAge === null) {
        await this.saveSetting('user_age', '');
      }

      const existingOnboarding = await this.getSetting(
        'has_completed_onboarding',
      );
      if (existingOnboarding === null) {
        await this.saveSetting('has_completed_onboarding', 'false');
      }
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }

  private async executeQuery<T>(sql: string, params: any[]): Promise<T[]> {
    await this.ensureInitialized(); // Добавляем проверку

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, results) => {
            const items: T[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              items.push(results.rows.item(i));
            }
            resolve(items);
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      });
    });
  }

  private async executeAction(sql: string, params: any[]): Promise<boolean> {
    await this.ensureInitialized(); // Добавляем проверку

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, results) => {
            resolve(results.rowsAffected > 0);
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      });
    });
  }

  // Методы для настроек
  async saveSetting(key: string, value: string): Promise<void> {
    await this.ensureInitialized(); // Добавляем проверку
    const query = `
      INSERT OR REPLACE INTO user_settings (key, value) 
      VALUES (?, ?)
    `;

    await this.executeAction(query, [key, value]);
  }

  async getSetting(key: string): Promise<string | null> {
    await this.ensureInitialized(); // Добавляем проверку
    const query = 'SELECT value FROM user_settings WHERE key = ?';
    const result = await this.executeQuery<{value: string}>(query, [key]);
    return result[0]?.value || null;
  }

  async getBooleanSetting(key: string): Promise<boolean> {
    await this.ensureInitialized(); // Добавляем проверку
    const value = await this.getSetting(key);
    return value === 'true';
  }

  // Методы для профиля пользователя
  async saveUserProfile(profile: UserProfile): Promise<void> {
    // Защита от множественных одновременных сохранений
    if (this.saveInProgress) {
      console.log('Save already in progress, queueing...');
      // Ждем немного и пробуем снова
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.saveUserProfile(profile);
    }

    try {
      this.saveInProgress = true;
      console.log('Saving user profile to DB:', profile);
      await this.ensureInitialized();

      await this.saveSetting('user_name', profile.name || '');
      await this.saveSetting('user_age', profile.age || '');
      await this.saveSetting(
        'has_completed_onboarding',
        profile.hasCompletedOnboarding ? 'true' : 'false',
      );

      this.lastSaveTime = Date.now();
      console.log('Profile saved successfully to DB');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    } finally {
      this.saveInProgress = false;
    }
  }
  async getUserProfile(): Promise<UserProfile> {
    try {
      console.log('========== DATABASE LOAD ==========');
      await this.ensureInitialized();

      const [name, age, hasCompletedOnboarding] = await Promise.all([
        this.getSetting('user_name'),
        this.getSetting('user_age'),
        this.getSetting('has_completed_onboarding'),
      ]);

      console.log('Raw DB values:', {
        name: `"${name}"`,
        age: `"${age}"`,
        hasCompletedOnboarding: `"${hasCompletedOnboarding}"`,
      });

      const profile = {
        name: name || '',
        age: age || '',
        hasCompletedOnboarding: hasCompletedOnboarding === 'true',
      };

      console.log('Profile loaded from DB:', profile);
      console.log('========== DATABASE LOAD COMPLETE ==========');
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      return {name: '', age: '', hasCompletedOnboarding: false};
    }
  }

  async getUserAge(): Promise<string> {
    await this.ensureInitialized(); // Добавляем проверку
    return (await this.getSetting('user_age')) || '';
  }

  // Методы для расчетов
  async saveCalculation(data: {
    zoneName: string;
    age: number;
    restingHR: number;
    zoneMin: number;
    zoneMax: number;
  }): Promise<number> {
    await this.ensureInitialized(); // Добавляем проверку

    const query = `
      INSERT INTO calculations 
      (zone_name, age, resting_hr, zone_min, zone_max) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      data.zoneName,
      data.age,
      data.restingHR,
      data.zoneMin,
      data.zoneMax,
    ];

    await this.executeAction(query, params);
    // Возвращаем ID последней вставленной записи
    const result = await this.executeQuery<{last_insert_rowid: number}>(
      'SELECT last_insert_rowid() as last_insert_rowid',
      [],
    );
    return result[0]?.last_insert_rowid || -1;
  }

  async getCalculationHistory(limit: number = 20): Promise<any[]> {
    await this.ensureInitialized(); // Добавляем проверку

    const query = `
      SELECT * FROM calculations 
      ORDER BY calculation_date DESC 
      LIMIT ?
    `;

    return await this.executeQuery(query, [limit]);
  }

  async getLastCalculation(): Promise<{
    zoneRange: string;
    restingHR: string;
  } | null> {
    await this.ensureInitialized(); // Добавляем проверку

    try {
      const query = `
        SELECT zone_min, zone_max, resting_hr 
        FROM calculations 
        ORDER BY calculation_date DESC 
        LIMIT 1
      `;

      const result = await this.executeQuery<any>(query, []);

      if (result.length > 0) {
        const item = result[0];
        return {
          zoneRange: `${item.zone_min}-${item.zone_max}`,
          restingHR: item.resting_hr.toString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения последнего расчета:', error);
      return null;
    }
  }

  async getCalculationsByZone(zoneName: string): Promise<any[]> {
    await this.ensureInitialized(); // Добавляем проверку

    const query = `
      SELECT * FROM calculations 
      WHERE zone_name = ? 
      ORDER BY calculation_date DESC
    `;

    return await this.executeQuery(query, [zoneName]);
  }

  async deleteCalculation(id: number): Promise<boolean> {
    await this.ensureInitialized(); // Добавляем проверку

    try {
      const query = 'DELETE FROM calculations WHERE id = ?';
      const result = await this.executeAction(query, [id]);
      console.log('Delete result:', result);
      return result;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      return false;
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initializationPromise = null;
    }
  }
}

export default new DatabaseService();
