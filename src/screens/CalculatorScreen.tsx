// CalculatorScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import type {RouteProp} from '@react-navigation/native';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {BottomBar} from '../components/BottomBar';
import {usePulse} from '../context/PulseContext';
import CalculatorService from '../services/CalculatorService';
import FirebaseService from '../services/FirebaseService';
import Card from '../components/Card'; // Импортируем Card (default export)
import Icon from '../components/Icons'; // Импортируем Icon

type CalculatorScreenNavigationProp = StackNavigationProp<
  ScreensList,
  'Calculator'
>;
type CalculatorScreenRouteProp = RouteProp<ScreensList, 'Calculator'>;

export function CalculatorScreen() {
  const navigation = useNavigation<CalculatorScreenNavigationProp>();
  const route = useRoute<CalculatorScreenRouteProp>();
  const {updatePulseData} = usePulse();

  const zoneName = (route.params as any)?.zoneName || 'Аэробная';

  const bottomBarItems = [
    {
      iconName: 'back' as const,
      onPress: () => navigation.navigate('Main'),
      key: 'back-btn',
    },
    {
      iconName: 'trash' as const,
      onPress: () => clearAll(),
      key: 'clear-btn',
    },
  ];

  // Состояния
  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [ageError, setAgeError] = useState('');
  const [restingHRError, setRestingHRError] = useState('');
  const [ageBorderColor, setAgeBorderColor] = useState('#C0C0C0');
  const [restingHRBorderColor, setRestingHRBorderColor] = useState('#C0C0C0');
  const [calculationResult, setCalculationResult] = useState<{
    maxHR: number;
    heartRateReserve: number;
    zoneLimits: {min: number; max: number};
  } | null>(null);

  // Для предотвращения бесконечного цикла
  const lastZoneLimitsRef = useRef<string>('');
  const lastRestingHRRef = useRef<string>('');

  // Обработчики ввода
  const handleAgeChange = (text: string) => {
    const cleaned = CalculatorService.cleanNumberInput(text);
    setAge(cleaned);

    const validation = CalculatorService.validateAge(cleaned);
    setAgeError(validation.error);
    setAgeBorderColor(validation.isValid ? '#2BB641' : '#FF6060');
  };

  const handleRestingHRChange = (text: string) => {
    const cleaned = CalculatorService.cleanNumberInput(text);
    setRestingHR(cleaned);

    const validation = CalculatorService.validateRestingHR(cleaned);
    setRestingHRError(validation.error);
    setRestingHRBorderColor(validation.isValid ? '#2BB641' : '#FF6060');
  };

  // Динамичный расчет
  useEffect(() => {
    if (age && restingHR && !ageError && !restingHRError) {
      const result = CalculatorService.calculateAll({age, restingHR, zoneName});
      setCalculationResult(result);
    } else {
      setCalculationResult(null);
    }
  }, [age, restingHR, ageError, restingHRError, zoneName]);

  // Обновление верхней панели
  useEffect(() => {
    if (calculationResult?.zoneLimits && restingHR) {
      const zoneLimitsKey = `${calculationResult.zoneLimits.min}-${calculationResult.zoneLimits.max}`;

      if (
        zoneLimitsKey !== lastZoneLimitsRef.current ||
        restingHR !== lastRestingHRRef.current
      ) {
        updatePulseData({
          zoneRange: zoneLimitsKey,
          restingHR: restingHR,
        });

        lastZoneLimitsRef.current = zoneLimitsKey;
        lastRestingHRRef.current = restingHR;
      }
    }
  }, [calculationResult, restingHR, updatePulseData]);

  // Сохранение в БД
  useEffect(() => {
    const saveToDB = async () => {
      if (calculationResult && age && restingHR) {
        try {
          await CalculatorService.saveCalculation({
            zoneName,
            age: parseInt(age, 10),
            restingHR: parseInt(restingHR, 10),
            zoneMin: calculationResult.zoneLimits.min,
            zoneMax: calculationResult.zoneLimits.max,
          });

          await FirebaseService.logEvent('calculation_completed', {
            zone: zoneName,
            age: parseInt(age, 10),
            resting_hr: parseInt(restingHR, 10),
            zone_min: calculationResult.zoneLimits.min,
            zone_max: calculationResult.zoneLimits.max,
          });
        } catch (error) {
          console.error('Ошибка сохранения:', error);

          await FirebaseService.logEvent('calculation_error', {
            zone: zoneName,
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    saveToDB();
  }, [calculationResult, age, restingHR, zoneName]);

  // Функция очистки
  const clearAll = () => {
    setAge('');
    setRestingHR('');
    setAgeError('');
    setRestingHRError('');
    setAgeBorderColor('#C0C0C0');
    setRestingHRBorderColor('#C0C0C0');
    setCalculationResult(null);

    lastZoneLimitsRef.current = '';
    lastRestingHRRef.current = '';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {/* Карточка с подсказкой */}
          <Card
            type="hint"
            title="Как измерить ЧСС покоя?"
            description="Измерьте пульс в течение минуты утром после пробуждения или после 15 мин отдыха сидя/лежа."
            iconName="info"
          />

          {/* Карточка ввода данных */}
          <Card
            type="calculator"
            title="Введите данные"
            iconName="calculator"
            iconColor="#FFA000"
            iconCircleColor="#FFF3E0">
            <View style={styles.inputSection}>
              {/* Поле Возраст */}
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputFieldLabel}>Возраст</Text>
                <View style={styles.inputFieldRow}>
                  <TextInput
                    style={[styles.inputField, {borderColor: ageBorderColor}]}
                    value={age}
                    onChangeText={handleAgeChange}
                    placeholder="от 12 до 90"
                    placeholderTextColor="#C0C0C0"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.inputFieldUnit}>лет</Text>
                </View>
                {ageError ? (
                  <Text style={styles.errorText}>{ageError}</Text>
                ) : null}
              </View>

              <View style={styles.inputDivider} />

              {/* Поле ЧСС покоя */}
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputFieldLabel}>ЧСС покоя</Text>
                <View style={styles.inputFieldRow}>
                  <TextInput
                    style={[
                      styles.inputField,
                      {borderColor: restingHRBorderColor},
                    ]}
                    value={restingHR}
                    onChangeText={handleRestingHRChange}
                    placeholder="от 40 до 100"
                    placeholderTextColor="#C0C0C0"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.inputFieldUnit}>уд/мин</Text>
                </View>
                {restingHRError ? (
                  <Text style={styles.errorText}>{restingHRError}</Text>
                ) : null}
              </View>
            </View>
          </Card>

          {/* Блок результата */}
          {calculationResult ? (
            <Card
              type="result"
              zoneName={zoneName}
              value={`${calculationResult.zoneLimits.min} - ${calculationResult.zoneLimits.max}`}
              unit="уд/мин"
              description={CalculatorService.getZoneInterpretation(zoneName)}
            />
          ) : (
            /* Пустой блок результата */
            <View style={styles.emptyResultCard}>
              <View style={styles.emptyResultContent}>
                <Icon name="heart" size={48} color="#718096" />
                <Text style={styles.emptyResultText}>
                  Введите ваш возраст и ЧСС покоя для расчета пульсовой зоны
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomBar items={bottomBarItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F5EE',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    paddingHorizontal: '8%',
    paddingBottom: 20,
  },
  // Стили для секции ввода
  inputSection: {
    marginTop: 8,
  },
  inputFieldContainer: {
    marginBottom: 8,
  },
  inputFieldLabel: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 8,
  },
  inputFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    color: '#718096',
    fontWeight: '600',
    fontSize: 16,
    height: 48,
  },
  inputFieldUnit: {
    fontSize: 16,
    color: '#718096',
    width: 60,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#71809638',
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 4,
  },
  // Пустой блок результата
  emptyResultCard: {
    width: '100%',
  },
  emptyResultContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#718096',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  emptyResultText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
});
