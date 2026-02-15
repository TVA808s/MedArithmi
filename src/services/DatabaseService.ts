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
}

SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
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
      throw error;
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
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }

  private async executeQuery<T>(sql: string, params: any[]): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

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
    if (!this.db) {
      throw new Error('Database not initialized');
    }

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
    const query = `
      INSERT OR REPLACE INTO user_settings (key, value) 
      VALUES (?, ?)
    `;

    await this.executeAction(query, [key, value]);
  }

  async getSetting(key: string): Promise<string | null> {
    const query = 'SELECT value FROM user_settings WHERE key = ?';
    const result = await this.executeQuery<{value: string}>(query, [key]);
    return result[0]?.value || null;
  }

  async getBooleanSetting(key: string): Promise<boolean> {
    const value = await this.getSetting(key);
    return value === 'true';
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      console.log('Saving user profile:', profile);
      await this.saveSetting('user_name', profile.name || '');
      await this.saveSetting('user_age', profile.age || '');
      // await this.saveSetting('user_frequency', profile.frequency || ''); // удалено
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  // Обновить метод getUserProfile
  async getUserProfile(): Promise<UserProfile> {
    try {
      console.log('Loading user profile...');
      const [name, age] = await Promise.all([
        this.getSetting('user_name'),
        this.getSetting('user_age'),
        // this.getSetting('user_frequency'), // удалено
      ]);

      const profile = {
        name: name || '',
        age: age || '',
        // frequency: frequency || '', // удалено
      };

      console.log('Profile loaded:', profile);
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      return {name: '', age: ''};
    }
  }

  async getUserAge(): Promise<string> {
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
    const query = `
      SELECT * FROM calculations 
      WHERE zone_name = ? 
      ORDER BY calculation_date DESC
    `;

    return await this.executeQuery(query, [zoneName]);
  }

  async deleteCalculation(id: number): Promise<boolean> {
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
    }
  }
}

export default new DatabaseService();
