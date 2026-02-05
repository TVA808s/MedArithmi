import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {TopBar} from '../components/TopBar';
import {BottomBar} from '../components/BottomBar';

// необходима типизация переменной navigation
type SettingsScreenNavigationProp = StackNavigationProp<
  ScreensList,
  'Settings'
>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const bottomBarItems = [
    {
      iconName: 'back' as const,
      onPress: () => navigation.navigate('Main'),
      key: 'back-btn',
    },
    {
      iconName: 'history' as const,
      onPress: () => navigation.navigate('History'),
      key: 'history-btn',
    },
  ];
  const [selectedFontSize, setSelectedFontSize] = useState<
    'small' | 'medium' | 'large'
  >('medium');
  const [allowAnalytics, setAllowAnalytics] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Верхний бар */}
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />
      <TopBar />

      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={styles.title}>Настройки</Text>
        <Text style={styles.sectionTitle}>Размер текста</Text>

        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedFontSize('small')}>
            <View style={styles.radioOuter}>
              {selectedFontSize === 'small' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioLabel}>Маленький</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedFontSize('medium')}>
            <View style={styles.radioOuter}>
              {selectedFontSize === 'medium' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioLabel}>Средний</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedFontSize('large')}>
            <View style={styles.radioOuter}>
              {selectedFontSize === 'large' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioLabel}>Крупный</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAllowAnalytics(!allowAnalytics)}>
            <View style={styles.checkboxOuter}>
              {allowAnalytics && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Разрешить анонимную аналитику использования
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.privacyTitle}>Мы ценим вашу приватность.</Text>
          <Text style={styles.privacyText}>
            • Медицинские расчеты: Все вводимые вами данные (вес, рост,
            лабораторные показатели) обрабатываются локально на вашем устройстве
            и не отправляются на наши сервера для хранения.
          </Text>
          <Text style={styles.privacyText}>
            • Аналитика: Мы собираем анонимные данные об использовании функций
            приложения (без ваших персональных данных) для улучшения сервиса.
          </Text>
        </View>
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
    paddingHorizontal: '10%',
  },
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 21,
    color: '#A0C28E',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#79A162',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#79A162',
  },
  radioLabel: {
    fontSize: 21,
    color: '#A0C28E',
  },
  section: {
    marginBottom: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#fdbcbd',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#79A162',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#79A162',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 21,
    color: '#A0C28E',
    flex: 1,
  },
  privacyTitle: {
    fontSize: 21,
    color: '#A0C28E',
    textAlign: 'center',
    marginBottom: 15,
  },
  privacyText: {
    textAlign: 'left',
    fontSize: 16,
    color: '#A0C28E',
    lineHeight: 20,
    marginBottom: 10,
  },
});
