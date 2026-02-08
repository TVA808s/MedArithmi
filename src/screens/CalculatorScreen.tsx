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

          // Логируем успешный расчет
          await FirebaseService.logEvent('calculation_completed', {
            zone: zoneName,
            age: parseInt(age, 10),
            resting_hr: parseInt(restingHR, 10),
            zone_min: calculationResult.zoneLimits.min,
            zone_max: calculationResult.zoneLimits.max,
          });
        } catch (error) {
          console.error('Ошибка сохранения:', error);

          // Логируем ошибку расчета
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.HeadingContainer}>
            <Text style={styles.Heading}>{zoneName}</Text>
            <Text style={styles.HeadingHint}>
              {
                'Как измерить "ЧСС покоя"?\nИзмерьте утром после пробуждения или после 15-ти минутного отдыха в положении сидя или лежа свой пульс в течении одной минуты.'
              }
            </Text>
          </View>

          <View style={styles.InputContainer}>
            {/* Поле ввода возраста */}
            <View style={styles.InputRow}>
              <Text style={styles.InputText}>Возраст:</Text>
              <TextInput
                style={[styles.input, {borderColor: ageBorderColor}]}
                value={age}
                onChangeText={handleAgeChange}
                placeholder="от 12 до 90"
                placeholderTextColor="#C0C0C0"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.InputTextUnits}>лет</Text>
            </View>
            {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}

            <View style={styles.InputLine} />

            {/* Поле ввода пульса в покое */}
            <View style={styles.InputRow}>
              <Text style={styles.InputText}>ЧСС покоя:</Text>
              <TextInput
                style={[styles.input, {borderColor: restingHRBorderColor}]}
                value={restingHR}
                onChangeText={handleRestingHRChange}
                placeholder="от 40 до 100"
                placeholderTextColor="#C0C0C0"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.InputTextUnits}>уд/мин</Text>
            </View>
            {restingHRError ? (
              <Text style={styles.errorText}>{restingHRError}</Text>
            ) : null}
          </View>

          {/* Блок с результатом */}
          {calculationResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Ваша пульсовая зона</Text>
              </View>

              <View>
                {/* Границы зоны */}
                <View style={styles.zoneContainer}>
                  <View style={styles.zoneValueContainer}>
                    <Text style={styles.zoneValue}>
                      {calculationResult.zoneLimits.min} -{' '}
                      {calculationResult.zoneLimits.max}
                    </Text>
                    <Text style={styles.zoneUnit}>уд/мин</Text>
                  </View>
                </View>

                {/* Интерпретация ощущений */}
                <View>
                  <Text style={styles.interpretationTitle}>
                    Ощущения в этой зоне:
                  </Text>
                  <View style={styles.interpretationTextContainer}>
                    <Text style={styles.interpretationText}>
                      {CalculatorService.getZoneInterpretation(zoneName)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Подсказка если нет результата */}
          {!calculationResult &&
            !ageError &&
            !restingHRError &&
            age === '' &&
            restingHR === '' && (
              <View style={styles.initialHintContainer}>
                <Text style={styles.initialHintText}>
                  Введите ваш возраст и ЧСС покоя для расчета пульсовой зоны
                </Text>
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
    paddingTop: 40,
    paddingHorizontal: '10%',
  },
  HeadingContainer: {
    marginBottom: 40,
    alignItems: 'center',
    gap: 10,
  },
  Heading: {
    fontSize: 24,
    color: '#E75F55',
    textAlign: 'center',
  },
  HeadingHint: {
    color: '#E75F55',
    fontSize: 18,
    textAlign: 'center',
  },
  InputContainer: {
    alignSelf: 'center',
    width: '100%',
  },
  InputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },
  InputText: {
    fontSize: 21,
    color: '#A21812',
  },
  InputTextUnits: {
    fontSize: 21,
    color: '#7a7a7a',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#C0C0C0',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    color: '#7a7a7a',
    fontWeight: '600',
    fontSize: 18,
    height: 45,
    width: 125,
    textAlign: 'center',
  },
  InputLine: {
    height: 1,
    backgroundColor: '#C0C0C0',
    marginVertical: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 2,
    height: 20,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 20,
    padding: 15,
    width: '100%',
  },
  resultHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  resultTitle: {
    fontSize: 21,
    color: '#7A7A7A',
    textAlign: 'center',
  },
  zoneContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  zoneValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  zoneValue: {
    fontSize: 32,
    color: '#A21812',
    fontWeight: '600',
  },
  zoneUnit: {
    fontSize: 18,
    color: '#7A7A7A',
  },
  interpretationTitle: {
    fontSize: 18,
    color: '#7A7A7A',
    marginBottom: 10,
    textAlign: 'center',
  },
  interpretationTextContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  interpretationText: {
    fontSize: 18,
    color: '#7A7A7A',
    lineHeight: 26,
    textAlign: 'center',
  },
  initialHintContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 30,
    backgroundColor: '#F0F5EE',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A0C28E',
  },
  initialHintText: {
    fontSize: 20,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 28,
  },
});
