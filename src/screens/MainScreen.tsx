import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import {CalculatorCard} from '../components/CalculatorCard';

// Тип для навигации
type MainScreenNavigationProp = StackNavigationProp<ScreensList, 'Main'>;

// данные калькуляторов (без категорий)
const calculators = [
  {
    id: '1',
    title: 'Восстановление',
    description:
      'Активное восстановление организма, улучшение кровотока. Идеально для разминки, заминки и лёгких восстановительных дней.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Восстановление'},
  },
  {
    id: '2',
    title: 'Аэробная',
    description:
      'Развитие базовой выносливости и укрепление сердечно-сосудистой системы. Основная зона для эффективного жиросжигания.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Аэробная'},
  },
  {
    id: '3',
    title: 'Темповая',
    description:
      'Повышение анаэробного порога и функциональной выносливости. Позволяет дольше поддерживать высокий темп тренировки.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Темповая'},
  },
  {
    id: '4',
    title: 'Анаэробная',
    description:
      'Развитие скорости, мощности и мышечной выносливости. Тренировка способности работать в условиях кислородного долга.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Анаэробная'},
  },
  {
    id: '5',
    title: 'Максимальная',
    description:
      'Развитие максимальной скорости и взрывной силы. Для коротких интервалов с предельной мобилизации организма.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Максимальная'},
  },
];
export function MainScreen() {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [_searchQuery, _setSearchQuery] = useState('');
  const bottomBarItems = [
    {
      iconName: 'history' as const,
      onPress: () => navigation.navigate('History'),
      key: 'history-btn',
    },
    {
      iconName: 'settings' as const,
      onPress: () => navigation.navigate('Settings'),
      key: 'settings-btn',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Верхний бар */}
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      {/* Основной контент */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>
            Выберите предпочитаемый уровень нагрузки
          </Text>
          {/* Отображаем все калькуляторы без категорий */}
          {calculators.map(calc => (
            <CalculatorCard
              key={calc.id}
              id={calc.id}
              title={calc.title}
              description={calc.description}
              navigateTo={calc.navigateTo}
              params={calc.params} // Передаем параметры
            />
          ))}
        </ScrollView>
      </View>

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
  },
  scrollViewContent: {
    alignItems: 'center',
    gap: 15,
    paddingBottom: 20,
  },
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
    marginHorizontal: '10%',
  },
});
