import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import Icon, {IconName} from '../components/Icons';
import {CalculatorCard} from '../components/CalculatorCard';
// необходима типизация переменной navigation
type HistoryScreenNavigationProp = StackNavigationProp<ScreensList, 'History'>;

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const calculators = [
    {
      id: '1',
      title: '(САД) Среднее артериальное давление',
      icon: 'heart' as IconName,
      description: 'Мониторинг давления',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Повседневная практика',
    },
    {
      id: '2',
      title: 'Риск инсульта CHA₂DS₂-VACₛ',
      icon: 'lightning' as IconName,
      description: 'Оценка риска инсульта',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Кардиология и ангиология',
    },
    {
      id: '3',
      title: '(ИМТ) Индекс массы тела',
      icon: 'bmi' as IconName,
      description: 'Расчет индекса массы тела',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Повседневная практика',
    },
    {
      id: '4',
      title: 'Риск кровотечения HAS-BLEED',
      icon: 'droplet' as IconName,
      description: 'Оценка риска кровотечения',
      navigateTo: 'Calculator' as keyof ScreensList,
      category: 'Кардиология и ангиология',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF1D7" />

      {/* Верхний бар */}
      <View style={styles.topBar}>
        <Text style={styles.text}>история</Text>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {calculators.map(calc => (
            <CalculatorCard
              key={calc.id}
              id={calc.id}
              title={calc.title}
              icon={calc.icon}
              description={calc.description}
              mode="expand"
            />
          ))}
        </ScrollView>
      </View>

      {/* Нижний бар */}
      <View style={styles.bottomBar}>
        <Icon
          name="settings"
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
        <Icon
          name="back"
          style={{transform: [{rotate: '180deg'}]}}
          onPress={() => {
            navigation.navigate('Main');
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
    flex: 1,
    paddingVertical: 20,
    marginTop: 15,
  },
  scrollViewContent: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 20,
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
