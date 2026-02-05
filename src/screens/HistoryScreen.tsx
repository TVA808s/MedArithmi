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
import {TopBar} from '../components/TopBar';
import {BottomBar} from '../components/BottomBar';
// необходима типизация переменной navigation
type HistoryScreenNavigationProp = StackNavigationProp<ScreensList, 'History'>;

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
    const bottomBarItems = [
    {
      iconName: 'settings' as const,
      onPress: () => navigation.navigate('Settings'),
      key: 'settings-btn',
    },
    {
      iconName: 'back' as const,
      onPress: () => navigation.navigate('Main'),
      key: 'back-btn',
    },
  ];
  

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Верхний бар */}
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />
      <TopBar />

      {/* Основной контент */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Ваши вычисления</Text>
          {/* {calculators.map(calc => (
            <CalculatorCard
              key={calc.id}
              id={calc.id}
              title={calc.title}
              icon={calc.icon}
              description={calc.description}
              mode="expand"
            />
          ))} */}
        </ScrollView>
      </View>

      {/* Нижний бар */}
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
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  scrollViewContent: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 20,
  },
});
