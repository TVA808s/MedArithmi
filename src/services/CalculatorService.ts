// services/CalculatorService.ts
import DatabaseService from './DatabaseService';

// Интерфейсы
export interface ZoneData {
  name: string;
  percentages: {min: number; max: number};
  interpretation: string;
}

export interface CalculationInput {
  age: string;
  restingHR: string;
  zoneName: string;
}

export interface CalculationResult {
  maxHR: number;
  heartRateReserve: number;
  zoneLimits: {min: number; max: number};
}

// Интерпретация ощущений для каждой зоны
export const zoneInterpretations: Record<string, string> = {
  Восстановление: 'Очень легко. Возможен свободный разговор и пение.',
  Аэробная: 'Комфортно. Можно вести разговор полными предложениями.',
  Темповая: 'Умеренно тяжело. Дыхание учащается, речь короткими фразами.',
  Анаэробная:
    'Тяжело. Частое дыхание, произносить можно лишь отдельными словами.',
  Максимальная: 'Очень тяжело. Максимальное усилие, речь невозможна.',
};

// Границы зон в % от пульсового резерва
export const zonePercentages: Record<string, {min: number; max: number}> = {
  Восстановление: {min: 50, max: 60},
  Аэробная: {min: 60, max: 70},
  Темповая: {min: 70, max: 80},
  Анаэробная: {min: 80, max: 90},
  Максимальная: {min: 90, max: 100},
};

class CalculatorService {
  // Функция расчета МЧСС по формуле Карвонена
  static calculateMaxHR(age: number): number {
    return 220 - age;
  }

  // Функция расчета пульсового резерва
  static calculateHeartRateReserve(maxHR: number, restingHR: number): number {
    return maxHR - restingHR;
  }

  // Функция расчета границ зоны
  static calculateZoneLimits(
    restingHR: number,
    heartRateReserve: number,
    zoneName: string,
  ): {min: number; max: number} {
    const percentages = zonePercentages[zoneName];
    if (!percentages) {
      return {min: 0, max: 0};
    }

    const min = Math.round(
      restingHR + (heartRateReserve * percentages.min) / 100,
    );
    const max = Math.round(
      restingHR + (heartRateReserve * percentages.max) / 100,
    );

    return {min, max};
  }

  // Основная функция расчета
  static calculateAll(input: CalculationInput): CalculationResult | null {
    const {age, restingHR, zoneName} = input;

    const ageNum = parseInt(age, 10);
    const restingHRNum = parseInt(restingHR, 10);

    if (isNaN(ageNum) || isNaN(restingHRNum)) {
      return null;
    }

    const maxHR = this.calculateMaxHR(ageNum);
    const heartRateReserve = this.calculateHeartRateReserve(
      maxHR,
      restingHRNum,
    );
    const zoneLimits = this.calculateZoneLimits(
      restingHRNum,
      heartRateReserve,
      zoneName,
    );

    return {
      maxHR,
      heartRateReserve,
      zoneLimits,
    };
  }

  // Валидация возраста
  static validateAge(age: string): {isValid: boolean; error: string} {
    if (age === '') {
      return {isValid: true, error: ''};
    }

    const numValue = parseInt(age, 10);
    if (isNaN(numValue) || numValue < 12 || numValue > 90) {
      return {
        isValid: false,
        error: 'Должно быть от 12 до 90 лет',
      };
    }

    return {isValid: true, error: ''};
  }

  // Валидация пульса в покое
  static validateRestingHR(restingHR: string): {
    isValid: boolean;
    error: string;
  } {
    if (restingHR === '') {
      return {isValid: true, error: ''};
    }

    const numValue = parseInt(restingHR, 10);
    if (isNaN(numValue) || numValue < 40 || numValue > 100) {
      return {
        isValid: false,
        error: 'Должно быть от 40 до 100 уд/мин',
      };
    }

    return {isValid: true, error: ''};
  }

  // Очистка ввода от нецифровых символов
  static cleanNumberInput(text: string): string {
    return text.replace(/[^0-9]/g, '');
  }

  // Сохранение расчета в БД
  static async saveCalculation(data: {
    zoneName: string;
    age: number;
    restingHR: number;
    zoneMin: number;
    zoneMax: number;
  }): Promise<number> {
    try {
      return await DatabaseService.saveCalculation(data);
    } catch (error) {
      console.error('Ошибка сохранения расчета:', error);
      throw error;
    }
  }

  // Получение интерпретации для зоны
  static getZoneInterpretation(zoneName: string): string {
    return zoneInterpretations[zoneName] || 'Информация отсутствует';
  }

  // Получение границ зоны в процентах
  static getZonePercentages(
    zoneName: string,
  ): {min: number; max: number} | null {
    return zonePercentages[zoneName] || null;
  }

  // Форматирование результата для отображения
  static formatZoneResult(zoneLimits: {min: number; max: number}): string {
    return `${zoneLimits.min} - ${zoneLimits.max} уд/мин`;
  }
}

export default CalculatorService;
