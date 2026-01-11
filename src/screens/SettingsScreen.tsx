import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import Icon from '../components/Icons';

// необходима типизация переменной navigation
type SettingsScreenNavigationProp = StackNavigationProp<ScreensList, 'Settings'>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [selectedFontSize, setSelectedFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [allowAnalytics, setAllowAnalytics] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF1D7" />
      
      {/* Верхний бар */}
      <View style={styles.topBar}>
        <Text style={styles.text}>настройки</Text>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Размер текста</Text>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioOption} 
            onPress={() => setSelectedFontSize('small')}
          >
            <View style={styles.radioOuter}>
              {selectedFontSize === 'small' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Маленький</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioOption} 
            onPress={() => setSelectedFontSize('medium')}
          >
            <View style={styles.radioOuter}>
              {selectedFontSize === 'medium' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Средний</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioOption} 
            onPress={() => setSelectedFontSize('large')}
          >
            <View style={styles.radioOuter}>
              {selectedFontSize === 'large' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Крупный</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.analyticsSection}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAllowAnalytics(!allowAnalytics)}
          >
            <View style={styles.checkboxOuter}>
              {allowAnalytics && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Разрешить анонимную аналитику использования
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacySection}>
          <Text style={styles.privacyTitle}>Мы ценим вашу приватность.</Text>
          <Text style={styles.privacyText}> 
            •   Медицинские расчеты: Все вводимые вами данные (вес, рост, лабораторные показатели) обрабатываются локально на вашем устройстве и не отправляются на наши сервера для хранения.
          </Text>
          <Text style={styles.privacyText}>
            •   Аналитика: Мы собираем анонимные данные об использовании функций приложения (без ваших персональных данных) для улучшения сервиса.
          </Text>
        </View>
      </View>

      {/* Нижний бар */}
      <View style={styles.bottomBar}>
        <Icon 
          name="back" 
          onPress={() => {
            navigation.navigate('Main');
          }}
        />
        <Icon 
          name="history"
          onPress={() => {
            navigation.navigate('History');
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
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: '10%',
  },
  sectionTitle: {
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#7A7A7A',
    marginBottom: 15,
  },
  radioGroup: {
    marginBottom: 30,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioOuter: {
    width: 24,
    height: 24,
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
    fontFamily: 'sans-serif-light',
    fontSize: 18,
    color: '#7A7A7A',
  },
  analyticsSection: {
    marginBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0D6C2',
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
    fontFamily: 'sans-serif-light',
    fontSize: 18,
    color: '#7A7A7A',
    flex: 1,
  },
  privacySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0D6C2',
  },
  privacyTitle: {
    fontFamily: 'sans-serif-light',
    fontSize: 18,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '300',
  },
  privacyText: {
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 14,
    color: '#7A7A7A',
    lineHeight: 20,
    marginBottom: 10,
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