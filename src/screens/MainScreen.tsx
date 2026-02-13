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

const calculators = [
  {
    id: '1',
    title: 'Восстановление',
    description:
      'Улучшение кровотока и активное восстановление. Для разминки и заминки.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Восстановление'},
    iconName: 'plant' as const,
    iconSize: 42,
    backgroundColor: '#ebffe7',
    borderColor: '#aaec9c',
    textColor: '#339e1a',
  },
  {
    id: '2',
    title: 'Аэробная',
    description:
      'Базовая выносливость и укрепление сердечно-сосудистой системы. Жиросжигание.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Аэробная'},
    iconName: 'heart' as const,
    iconSize: 42,
    backgroundColor: '#ffe7f1',
    borderColor: '#ec9ccb',
    textColor: '#9e1a72',
  },
  {
    id: '3',
    title: 'Темповая',
    description:
      'Повышение анаэробного порога и функциональной выносливости. Высокий темп.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Темповая'},
    iconName: 'droplet' as const,
    iconSize: 42,
    backgroundColor: '#e7faff',
    borderColor: '#9cece1',
    textColor: '#1a9e97',
  },
  {
    id: '4',
    title: 'Анаэробная',
    description:
      'Развитие скорости, мощности и мышечной выносливости. Кислородный долг.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Анаэробная'},
    iconName: 'star' as const,
    iconSize: 42,
    backgroundColor: '#fff5e7',
    borderColor: '#ecc99c',
    textColor: '#9e691a',
  },
  {
    id: '5',
    title: 'Максимальная',
    description: 'Короткие интервалы максимальной скорости и взрывной силы.',
    navigateTo: 'Calculator' as const,
    params: {zoneName: 'Максимальная'},
    iconName: 'lightning' as const,
    iconSize: 42,
    backgroundColor: '#ffe7e7',
    borderColor: '#ec9c9c',
    textColor: '#9e1a1a',
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
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
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
              iconName={calc.iconName}
              iconSize={calc.iconSize}
              params={calc.params}
              backgroundColor={calc.backgroundColor}
              borderColor={calc.borderColor}
              textColor={calc.textColor}
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
    paddingTop: 30,
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
    marginHorizontal: '8%',
  },
});
