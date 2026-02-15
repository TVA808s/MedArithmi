// MainScreen.tsx
import React, {useCallback, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Text,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import Card, {ZoneName, ZONE_COLORS} from '../components/Card';
import {usePulse} from '../context/PulseContext';
import DatabaseService from '../services/DatabaseService';

type MainScreenNavigationProp = StackNavigationProp<ScreensList, 'Main'>;

const calculators = [
  {
    id: '1',
    zoneName: 'Восстановление' as ZoneName,
    description:
      'Улучшение кровотока и активное восстановление. Для разминки и заминки.',
  },
  {
    id: '2',
    zoneName: 'Аэробная' as ZoneName,
    description:
      'Базовая выносливость и укрепление сердечно-сосудистой системы. Жиросжигание.',
  },
  {
    id: '3',
    zoneName: 'Темповая' as ZoneName,
    description:
      'Повышение анаэробного порога и функциональной выносливости. Высокий темп.',
  },
  {
    id: '4',
    zoneName: 'Анаэробная' as ZoneName,
    description:
      'Развитие скорости, мощности и мышечной выносливости. Кислородный долг.',
  },
  {
    id: '5',
    zoneName: 'Максимальная' as ZoneName,
    description: 'Короткие интервалы максимальной скорости и взрывной силы.',
  },
];

export function MainScreen() {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const {updatePulseData} = usePulse();

  // Используем ref для предотвращения множественных загрузок
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  const loadLastCalculation = useCallback(async () => {
    // Предотвращаем множественные загрузки
    if (isLoadingRef.current) {
      return;
    }

    // Загружаем не чаще чем раз в 2 секунды
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 2000) {
      return;
    }

    isLoadingRef.current = true;

    try {
      console.log('Загрузка последнего расчета для TopBar...');
      const startTime = Date.now();

      const last = await DatabaseService.getLastCalculation();

      console.log(`Последний расчет загружен за ${Date.now() - startTime}ms`);

      if (last) {
        updatePulseData({
          zoneRange: last.zoneRange,
          restingHR: last.restingHR,
        });
      }

      lastLoadTimeRef.current = Date.now();
    } catch (error) {
      console.error('Ошибка загрузки последнего расчета:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [updatePulseData]);

  // Загружаем только при первом монтировании
  useEffect(() => {
    loadLastCalculation();
  }, [loadLastCalculation]);

  // Загружаем только при возврате с других экранов, но с защитой от частых вызовов
  useFocusEffect(
    useCallback(() => {
      // Не загружаем если с момента последней загрузки прошло меньше 2 секунд
      const now = Date.now();
      if (now - lastLoadTimeRef.current > 2000) {
        loadLastCalculation();
      }
    }, [loadLastCalculation]),
  );

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

  const handleCardPress = (zoneName: ZoneName) => {
    navigation.navigate('Calculator', {zoneName});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            Выберите предпочитаемый уровень нагрузки
          </Text>

          {calculators.map(calc => (
            <Card
              key={calc.id}
              type="main"
              zoneName={calc.zoneName}
              description={calc.description}
              onPress={() => handleCardPress(calc.zoneName)}
              iconSize={36}
              rightContent={
                <Text
                  style={[
                    styles.arrowText,
                    {color: ZONE_COLORS[calc.zoneName]},
                  ]}>
                  {'>>>'}
                </Text>
              }
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
  arrowText: {
    fontFamily: 'sans-serif-medium',
    fontSize: 21,
    fontWeight: '600',
    opacity: 0.5,
  },
});
