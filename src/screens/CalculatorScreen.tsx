import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import Icon from '../components/Icons';

type CalculatorScreenNavigationProp = StackNavigationProp<
  ScreensList,
  'Calculator'
>;

export function CalculatorScreen() {
  const navigation = useNavigation<CalculatorScreenNavigationProp>();
  // состояния для результата
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [resultColor, setResultColor] = useState<string>('#7A7A7A');

  // состояния для валидации
  const [weightError, setWeightError] = useState<string>('');
  const [heightError, setHeightError] = useState<string>('');
  const [weightBorderColor, setWeightBorderColor] = useState<string>('#7A7A7A');
  const [heightBorderColor, setHeightBorderColor] = useState<string>('#7A7A7A');

  // обработка веса
  const validateWeight = (value: string) => {
    if (value === '') {
      setWeightError('');
      setWeightBorderColor('#7A7A7A');
      return false;
    }

    const numValue = parseFloat(value);
    if (numValue < 20 || numValue > 300) {
      setWeightError('Должно быть от 20 до 300 кг');
      setWeightBorderColor('#FF6060');
      return false;
    }

    setWeightError('');
    setWeightBorderColor('#2BB641');
    return true;
  };

  // обработка роста
  const validateHeight = (value: string) => {
    if (value === '') {
      setHeightError('');
      setHeightBorderColor('#7A7A7A');
      return false;
    }

    const numValue = parseFloat(value);

    if (numValue < 152 || numValue > 213) {
      setHeightError('Должно быть от 152 до 213 см');
      setHeightBorderColor('#FF6060');
      return false;
    }

    setHeightError('');
    setHeightBorderColor('#2BB641');
    return true;
  };

  // оставляем в полях только числа и работаем с ними
  const handleWeightChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setWeight(cleaned);
    validateWeight(cleaned);
  };
  const handleHeightChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setHeight(cleaned);
    validateHeight(cleaned);
  };

  // динамичный расчет
  useEffect(() => {
    if (weight && height && !weightError && !heightError) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height) / 100; // переводим в метры
      const bmi = weightNum / (heightNum * heightNum);
      const roundedBmi = Math.round(bmi * 10) / 10; // округляем до одного знака

      setBmiResult(roundedBmi);

      // определяем интерпретацию и цвет
      let interpretationText = '';
      let color = '#7A7A7A';

      if (roundedBmi < 18.5) {
        interpretationText = 'Дифицит массы тела';
        color = '#CA6C44';
      } else if (roundedBmi >= 18.5 && roundedBmi < 25) {
        interpretationText = 'Нормальная масса тела';
        color = '#2BB641';
      } else if (roundedBmi >= 25 && roundedBmi < 30) {
        interpretationText = 'Избыточная масса тела';
        color = '#CA6C44';
      } else if (roundedBmi >= 30 && roundedBmi < 35) {
        interpretationText = 'Ожирение I стадии';
        color = '#FF6060';
      } else if (roundedBmi >= 35 && roundedBmi < 40) {
        interpretationText = 'Ожирение II стадии';
        color = '#FF6060';
      } else {
        interpretationText = 'Ожирение III стадии';
        color = '#FF6060';
      }

      setInterpretation(interpretationText);
      setResultColor(color);
    } else {
      setBmiResult(null);
      setInterpretation('');
      setResultColor('#7A7A7A');
    }
  }, [weight, height, weightError, heightError]);

  // функция очистки всех полей
  const clearAll = () => {
    setWeight('');
    setHeight('');
    setWeightError('');
    setHeightError('');
    setWeightBorderColor('#7A7A7A');
    setHeightBorderColor('#7A7A7A');
    setBmiResult(null);
    setInterpretation('');
    setResultColor('#7A7A7A');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF1D7" />

      {/* Верхний бар */}
      <View style={styles.topBar}>
        <Text style={styles.text}>расчеты</Text>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <View style={styles.HeadingContainer}>
          <Text style={styles.Heading}>(ИМТ) Индекс массы тела</Text>
          <View style={styles.HeadingLine} />
        </View>

        <View style={styles.InputContainer}>
          {/* Поле ввода веса */}
          <View style={styles.InputRow}>
            <Text style={styles.InputText}>Ваш вес:</Text>
            <TextInput
              style={[styles.input, {borderColor: weightBorderColor}]}
              value={weight}
              onChangeText={handleWeightChange}
              placeholder="от 20 до 300"
              placeholderTextColor="#C0C0C0"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.InputText}>кг</Text>
          </View>

          {/* Сообщение об ошибке для веса */}
          {weightError ? (
            <Text style={styles.errorText}>{weightError}</Text>
          ) : null}

          <View style={styles.InputLine} />

          {/* Поле ввода роста */}
          <View style={styles.InputRow}>
            <Text style={styles.InputText}>Ваш рост:</Text>
            <TextInput
              style={[styles.input, {borderColor: heightBorderColor}]}
              value={height}
              onChangeText={handleHeightChange}
              placeholder="от 152 до 213"
              placeholderTextColor="#C0C0C0"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.InputText}>см</Text>
          </View>

          {/* Сообщение об ошибке для роста */}
          {heightError ? (
            <Text style={styles.errorText}>{heightError}</Text>
          ) : null}
        </View>

        {/* Блок с результатом */}
        {bmiResult !== null && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Результат расчета</Text>
            </View>

            <View style={styles.resultContent}>
              <View style={styles.bmiValueContainer}>
                <Text style={styles.bmiLabel}>Индекс массы тела:</Text>
                <Text style={[styles.bmiValue, {color: resultColor}]}>
                  {bmiResult}
                </Text>
              </View>

              <View
                style={[
                  styles.interpretationContainer,
                  {borderColor: resultColor},
                ]}>
                <Text style={[styles.interpretationText, {color: resultColor}]}>
                  {interpretation}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Подсказка если нет результата */}
        {!bmiResult &&
          !weightError &&
          !heightError &&
          weight === '' &&
          height === '' && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                Введите ваш вес и рост для расчета ИМТ
              </Text>
            </View>
          )}
      </View>

      {/* Нижний бар */}
      <View style={styles.bottomBar}>
        <Icon
          name="back"
          onPress={() => {
            navigation.navigate('Main');
          }}
        />
        <Icon name="trash" onPress={clearAll} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF1D7',
  },
  topBar: {
    backgroundColor: '#B2F28E',
    justifyContent: 'center',
    height: 120,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  text: {
    fontFamily: 'sans-serif-light',
    fontSize: 42,
    color: '#7A7A7A',
    fontWeight: '200',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  content: {
    paddingVertical: 20,
    marginTop: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: '100%',
  },
  HeadingContainer: {
    marginBottom: 40,
    alignItems: 'center',
    gap: 15,
  },
  Heading: {
    fontFamily: 'sans-serif-light',
    fontSize: 28,
    color: '#CA6C44',
  },
  HeadingLine: {
    height: 1,
    backgroundColor: '#7A7A7A',
    width: 260,
  },
  InputContainer: {
    gap: 10,
    alignSelf: 'center',
    width: '85%',
    marginBottom: 40,
    position: 'relative',
    top: 0,
  },
  InputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },
  InputText: {
    fontFamily: 'sans-serif-light',
    fontSize: 28,
    color: '#7A7A7A',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 2},
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    padding: 4,
    color: '#7A7A7A',
    fontSize: 18,
    fontFamily: 'sans-serif-light',
    height: 45,
    width: 150,
    textAlign: 'center',
  },
  InputLine: {
    height: 1,
    backgroundColor: '#7A7A7A',
    marginVertical: 5,
  },
  errorText: {
    fontFamily: 'sans-serif-light',
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 2,
    height: 20,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '90%',
  },
  resultHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  resultTitle: {
    fontFamily: 'sans-serif-medium',
    fontSize: 22,
    color: '#7A7A7A',
    textAlign: 'center',
  },
  resultContent: {
    alignItems: 'center',
    marginVertical: 15,
  },
  bmiValueContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bmiLabel: {
    fontFamily: 'sans-serif-light',
    fontSize: 18,
    color: '#7A7A7A',
    marginBottom: 5,
  },
  bmiValue: {
    fontFamily: 'sans-serif-medium',
    fontSize: 48,
    fontWeight: '600',
  },
  interpretationContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderWidth: 2,
    minWidth: '100%',
  },
  interpretationText: {
    fontFamily: 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  referenceContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  referenceTitle: {
    fontFamily: 'sans-serif-medium',
    fontSize: 16,
    color: '#7A7A7A',
    marginBottom: 10,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  referenceLabel: {
    fontFamily: 'sans-serif-light',
    fontSize: 14,
    color: '#7A7A7A',
  },
  referenceValue: {
    fontFamily: 'sans-serif-medium',
    fontSize: 14,
    color: '#7A7A7A',
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  hintText: {
    fontFamily: 'sans-serif-light',
    fontSize: 18,
    color: '#7A7A7A',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#79A162',
    height: 70,
    marginTop: -5,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderTopWidth: 5,
    borderTopLeftRadius: 10,
  },
});
