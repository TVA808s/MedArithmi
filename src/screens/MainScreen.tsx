import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import Icon, { IconName } from '../components/Icons'; 
import { CalculatorCard } from '../components/CalculatorCard';

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
      icon: 'bmi' as IconName,
      description: 'Расчет индекса массы тела',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Повседневная практика'
    },
    {
      id: '2',
      title: 'Шкала CURB-65',
      icon: 'curb' as IconName,
      description: 'Оценка тяжести пневмонии',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Повседневная практика'
    },
    {
      id: '3',
      title: 'Риск кровотечения HAS-BLEED',
      icon: 'droplet' as IconName,
      description: 'Оценка риска кровотечения',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Кардиология и ангиология'
    },
    {
      id: '4',
      title: '(САД) Среднее артериальное давление',
      icon: 'heart' as IconName,
      description: 'Мониторинг давления',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Повседневная практика'
    },
    {
      id: '5',
      title: 'Риск инсульта CHA₂DS₂-VACₛ',
      icon: 'lightning' as IconName,
      description: 'Оценка риска инсульта',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Кардиология и ангиология'
    },
    {
      id: '6',
      title: '(СКФ) Скорость клубочковой фильтрации по формуле CKD-EPI',
      icon: 'skf' as IconName,
      description: 'СКФ по формуле CKD-EPI',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Нефрология'
    },
  ];

  const groupedCalculators = calculators.reduce((acc, calc) => {
    if (!acc[calc.category]) {
      acc[calc.category] = [];
    }
    acc[calc.category].push(calc);
    return acc;
  }, {} as Record<string, typeof calculators>);

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
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
        >
          {Object.entries(groupedCalculators).map(([category, calcs]) => (
            <React.Fragment key={category}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {calcs.map(calc => (
                <CalculatorCard
                  key={calc.id}
                  id={calc.id}
                  title={calc.title}
                  icon={calc.icon}
                  description={calc.description}
                  mode="navigate"
                  navigateTo={calc.navigateTo}
                />
              ))}
            </React.Fragment>
          ))}
        </ScrollView>
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
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
    gap: 15,
    paddingBottom: 20,
  },
  categoryTitle: {
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#7A7A7A',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
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