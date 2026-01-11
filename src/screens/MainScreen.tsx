import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import Icon from '../components/Icons';
import { CalculatorCard } from '../components/CalculatorCard';
import { ScrollView } from 'react-native-gesture-handler';

// необходима типизация переменной navigation
type MainScreenNavigationProp = StackNavigationProp<ScreensList, 'Main'>;


export function MainScreen() {
    const navigation = useNavigation<MainScreenNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    // заглушка калькуляторов
    const calculators = [
    {
      id: '1',
      title: '(ИМТ) Индекс массы тела',
      iconName: 'BMI',
      description: 'Расчет индекса массы тела',
      navigateTo: 'BMICalculator',
    },
    {
      id: '2',
      title: '(САД) Среднее артериальное давление',
      iconName: 'CR',
      description: 'Расчет скорости клубочковой фильтрации',
      navigateTo: 'CreatinineCalculator',
    },
    {
      id: '3',
      title: 'CURB-65 оценка пневмони',
      iconName: 'DB',
      description: 'Расчет уровня глюкозы',
      navigateTo: 'DiabetesCalculator',
    },
    {
      id: '4',
      title: 'Риск инсульта CHA2DS2-VACS',
      iconName: 'BP',
      description: 'Анализ артериального давления',
      navigateTo: 'PressureCalculator',
    },
    {
      id: '5',
      title: 'Риск кровотечения HAS-BLEED',
      iconName: 'CH',
      description: 'Анализ липидного профиля',
      navigateTo: 'CholesterolCalculator',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF1D7" />
      
      {/* Верхний бар */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#7A7A7A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск калькулятора"
            placeholderTextColor="#838383"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>
      


      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Добро пожаловать!</Text>

        {calculators.map((calc) => (
          <CalculatorCard
            key={calc.id}
            id={calc.id}
            title={calc.title}
            iconName={calc.iconName}
            mode="navigate"
            navigateTo={calc.navigateTo}
          />
        ))}
      </View>
      


      {/* Нижний бар */}
      <View style={styles.bottomBar}>
        <Icon 
          name="history"
          onPress={() => {
            navigation.navigate('History');
          }}
        />
        <Icon 
          name="settings" 
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#838383',
    fontFamily: 'sans-serif-light',
  },
  content: {
    flex: 1,
    paddingVertical: 20,
    gap: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#7A7A7A',
  },
  bottomBar: {
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