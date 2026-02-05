import React, {useState, useEffect} from 'react';
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
import {TopBar} from '../components/TopBar';
import {BottomBar} from '../components/BottomBar';

type CalculatorScreenNavigationProp = StackNavigationProp<ScreensList, 'Calculator'>;
type CalculatorScreenRouteProp = RouteProp<ScreensList, 'Calculator'>;

// Интерпретация ощущений для каждой зоны
const zoneInterpretations: Record<string, string> = {
  'Восстановление': 'Очень легко. Возможен свободный разговор и пение.',
  'Аэробная': 'Комфортно. Можно вести разговор полными предложениями.',
  'Темповая': 'Умеренно тяжело. Дыхание учащается, речь короткими фразами.',
  'Анаэробная': 'Тяжело. Частое дыхание, произносить можно лишь отдельные слова.',
  'Максимальная': 'Очень тяжело. Максимальное усилие, речь невозможна.',
};

// Границы зон в % от пульсового резерва
const zonePercentages: Record<string, {min: number; max: number}> = {
  'Восстановление': {min: 50, max: 60},
  'Аэробная': {min: 60, max: 70},
  'Темповая': {min: 70, max: 80},
  'Анаэробная': {min: 80, max: 90},
  'Максимальная': {min: 90, max: 100},
};

// Функция расчета МЧСС по формуле Карвонена
const calculateMaxHR = (age: number): number => {
  return 220 - age;
};

// Функция расчета пульсового резерва
const calculateHeartRateReserve = (maxHR: number, restingHR: number): number => {
  return maxHR - restingHR;
};

// Функция расчета границ зоны
const calculateZoneLimits = (
  restingHR: number,
  heartRateReserve: number,
  zoneName: string
): {min: number; max: number} => {
  const percentages = zonePercentages[zoneName];
  if (!percentages) return {min: 0, max: 0};
  
  const min = Math.round(restingHR + (heartRateReserve * percentages.min / 100));
  const max = Math.round(restingHR + (heartRateReserve * percentages.max / 100));
  
  return {min, max};
};

export function CalculatorScreen() {
  const navigation = useNavigation<CalculatorScreenNavigationProp>();
  const route = useRoute<CalculatorScreenRouteProp>();
  
  // Получаем название зоны из параметров навигации
  const zoneName = route.params?.zoneName || 'Аэробная';
  
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

  // состояния для ввода
  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  
  // состояния для результата
  const [maxHR, setMaxHR] = useState<number | null>(null);
  const [heartRateReserve, setHeartRateReserve] = useState<number | null>(null);
  const [zoneLimits, setZoneLimits] = useState<{min: number; max: number} | null>(null);
  
  // состояния для валидации
  const [ageError, setAgeError] = useState<string>('');
  const [restingHRError, setRestingHRError] = useState<string>('');
  const [ageBorderColor, setAgeBorderColor] = useState<string>('#C0C0C0');
  const [restingHRBorderColor, setRestingHRBorderColor] = useState<string>('#C0C0C0');

  // обработка возраста
  const validateAge = (value: string) => {
    if (value === '') {
      setAgeError('');
      setAgeBorderColor('#C0C0C0');
      return false;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 12 || numValue > 90) {
      setAgeError('Должно быть от 12 до 90 лет');
      setAgeBorderColor('#FF6060');
      return false;
    }

    setAgeError('');
    setAgeBorderColor('#2BB641');
    return true;
  };

  // обработка пульса в покое
  const validateRestingHR = (value: string) => {
    if (value === '') {
      setRestingHRError('');
      setRestingHRBorderColor('#C0C0C0');
      return false;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 40 || numValue > 100) {
      setRestingHRError('Должно быть от 40 до 100 уд/мин');
      setRestingHRBorderColor('#FF6060');
      return false;
    }

    setRestingHRError('');
    setRestingHRBorderColor('#2BB641');
    return true;
  };

  // оставляем в полях только числа
  const handleAgeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAge(cleaned);
    validateAge(cleaned);
  };

  const handleRestingHRChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setRestingHR(cleaned);
    validateRestingHR(cleaned);
  };

  // динамичный расчет
  useEffect(() => {
    if (age && restingHR && !ageError && !restingHRError) {
      const ageNum = parseInt(age, 10);
      const restingHRNum = parseInt(restingHR, 10);
      
      // Расчеты
      const calculatedMaxHR = calculateMaxHR(ageNum);
      const calculatedHRReserve = calculateHeartRateReserve(calculatedMaxHR, restingHRNum);
      const calculatedZoneLimits = calculateZoneLimits(restingHRNum, calculatedHRReserve, zoneName);
      
      setMaxHR(calculatedMaxHR);
      setHeartRateReserve(calculatedHRReserve);
      setZoneLimits(calculatedZoneLimits);
    } else {
      setMaxHR(null);
      setHeartRateReserve(null);
      setZoneLimits(null);
    }
  }, [age, restingHR, ageError, restingHRError, zoneName]);

  // функция очистки всех полей
  const clearAll = () => {
    setAge('');
    setRestingHR('');
    setAgeError('');
    setRestingHRError('');
    setAgeBorderColor('#C0C0C0');
    setRestingHRBorderColor('#C0C0C0');
    setMaxHR(null);
    setHeartRateReserve(null);
    setZoneLimits(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />
      <TopBar />
      
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.HeadingContainer}>
          <Text style={styles.Heading}>{zoneName}</Text>
          <Text style={styles.HeadingHint}>{`Как измерить "ЧСС покоя"?
Измерьте утром после пробуждения или после 15-ти минутного отдыха в положении сидя или лежа свой пульс в течении одной минуты.`}</Text>
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

          {/* Сообщение об ошибке для возраста */}
          {ageError ? (
            <Text style={styles.errorText}>{ageError}</Text>
          ) : null}

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

          {/* Сообщение об ошибке для пульса */}
          {restingHRError ? (
            <Text style={styles.errorText}>{restingHRError}</Text>
          ) : null}
        </View>

        {/* Блок с результатом */}
        {zoneLimits !== null && maxHR !== null && heartRateReserve !== null && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Ваша пульсовая зона</Text>
            </View>

            <View style={styles.resultContent}>
              {/* Границы зоны */}
              <View style={styles.zoneContainer}>
                <View style={styles.zoneValueContainer}>
                  <Text style={styles.zoneValue}>{zoneLimits.min} - {zoneLimits.max}</Text>
                  <Text style={styles.zoneUnit}>   уд/мин</Text>
                </View>
              </View>

              {/* Интерпретация ощущений */}
              <View style={styles.interpretationContainer}>
                <Text style={styles.interpretationTitle}>Ощущения в этой зоне:</Text>
                <View style={styles.interpretationTextContainer}>
                  <Text style={styles.interpretationText}>
                    {zoneInterpretations[zoneName] || 'Информация отсутствует'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Подсказка если нет результата */}
        {!zoneLimits && !ageError && !restingHRError && age === '' && restingHR === '' && (
          <View style={styles.initialHintContainer}>
            <Text style={styles.initialHintText}>
              Введите ваш возраст и ЧСС покоя для расчета пульсовой зоны
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomBar items={bottomBarItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F5EE',
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
    marginVertical: 30,
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
