import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {usePulse} from '../context/PulseContext';
import DatabaseService from '../services/DatabaseService';

export function TopBar() {
  const {pulseData} = usePulse();
  const [lastCalc, setLastCalc] = useState<{
    zoneRange: string;
    restingHR: string;
  } | null>(null);

  // Загружаем данные из БД при монтировании
  useEffect(() => {
    loadLastCalculation();
  }, []);

  // Обновляем данные при изменении pulseData
  useEffect(() => {
    if (pulseData) {
      setLastCalc(pulseData);
    } else {
      loadLastCalculation();
    }
  }, [pulseData]);

  const loadLastCalculation = async () => {
    try {
      const last = await DatabaseService.getLastCalculation();
      if (last) {
        setLastCalc(last);
      }
    } catch (error) {
      console.error('Ошибка загрузки последнего расчета:', error);
    }
  };

  // Используем данные из контекста или из БД
  const zoneRange = lastCalc?.zoneRange || 'xxx-xxx';
  const restingHR = lastCalc?.restingHR || 'xx';

  return (
    <View style={styles.topBar}>
      <View style={styles.dinamicAttrs}>
        <Text style={styles.topBarText}>{zoneRange}</Text>
        <Text style={styles.topBarText}>{restingHR}</Text>
      </View>
      <Text style={styles.topBarTextTitle}>PulseSport</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: '#E75F55',
    justifyContent: 'center',
    height: 80,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  dinamicAttrs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarText: {
    color: '#F0F5EE',
    fontSize: 24,
  },
  topBarTextTitle: {
    color: '#F0F5EE',
    fontSize: 24,
    textAlign: 'center',
  },
});
