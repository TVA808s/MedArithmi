import SQLite from 'react-native-sqlite-storage';

// Открываем/создаем базу данных
const databaseName = 'PulseSportDB.db';

// Отключение логов в продакшене
SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  // Инициализация базы данных
  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: databaseName,
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // Создание таблиц
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

  // Выполнение запроса
  private async executeQuery<T>(sql: string, params: any[]): Promise<T[]> {
    if (!this.db) {
      await this.initializeDatabase();
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

  // ============== ОСНОВНЫЕ МЕТОДЫ ==============

  // Сохранение расчета
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

  // Получение истории расчетов
  async getCalculationHistory(limit: number = 50): Promise<any[]> {
    const query = `
      SELECT * FROM calculations 
      ORDER BY calculation_date DESC 
      LIMIT ?
    `;

    return await this.executeQuery(query, [limit]);
  }

  // Получение расчетов по зоне
  async getCalculationsByZone(zoneName: string): Promise<any[]> {
    const query = `
      SELECT * FROM calculations 
      WHERE zone_name = ? 
      ORDER BY calculation_date DESC
    `;

    return await this.executeQuery(query, [zoneName]);
  }

  // Удаление расчета
  async deleteCalculation(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM calculations WHERE id = ?';
      await this.executeQuery(query, [id]);
      return true;
    } catch {
      return false;
    }
  }

  // Очистка всей истории
  async clearAllHistory(): Promise<boolean> {
    try {
      await this.executeQuery('DELETE FROM calculations', []);
      return true;
    } catch {
      return false;
    }
  }

  // Сохранение пользовательских настроек
  async saveSetting(key: string, value: string): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO user_settings (key, value) 
      VALUES (?, ?)
    `;

    await this.executeQuery(query, [key, value]);
  }

  // Получение настройки
  async getSetting(key: string): Promise<string | null> {
    const query = 'SELECT value FROM user_settings WHERE key = ?';
    const result = await this.executeQuery<{value: string}>(query, [key]);
    return result[0]?.value || null;
  }

  // Закрытие базы данных
  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
  // Поддержка верней панели
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
}
// Экспортируем singleton экземпляр
export default new DatabaseService();
