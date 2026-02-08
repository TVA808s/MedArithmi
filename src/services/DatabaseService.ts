import SQLite from 'react-native-sqlite-storage';

const databaseName = 'PulseSportDB.db';

export const SETTINGS_KEYS = {
  ALLOW_ANALYTICS: 'allow_analytics',
  ALLOW_MESSAGES: 'allow_messages',
} as const;

SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
    try {
      console.log('Opening database...');
      this.db = await SQLite.openDatabase({
        name: databaseName,
        location: 'default',
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
      await this.executeQuery(query, []);
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

  async saveSetting(key: string, value: string): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO user_settings (key, value) 
      VALUES (?, ?)
    `;

    await this.executeQuery(query, [key, value]);
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

    const result = await this.executeQuery<{insertId: number}>(query, params);
    return result[0]?.insertId || -1;
  }

  async getCalculationHistory(limit: number = 50): Promise<any[]> {
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
      await this.executeQuery(query, [id]);
      return true;
    } catch {
      return false;
    }
  }

  async clearAllHistory(): Promise<boolean> {
    try {
      await this.executeQuery('DELETE FROM calculations', []);
      return true;
    } catch {
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
