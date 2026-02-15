// HistoryScreen.tsx
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import DatabaseService from '../services/DatabaseService';
import FirebaseService from '../services/FirebaseService';
import Card, {ZoneName} from '../components/Card';
import Icon from '../components/Icons';

type HistoryScreenNavigationProp = StackNavigationProp<ScreensList, 'History'>;

interface HistoryItem {
  id: number;
  zone_name: string;
  age: number;
  resting_hr: number;
  zone_min: number;
  zone_max: number;
  calculation_date: string;
}

interface GroupedHistory {
  [date: string]: HistoryItem[];
}

// Кэш для отформатированных дат
const dateCache = new Map<string, string>();
const timeCache = new Map<string, string>();

// Мемоизированная карточка истории
const MemoizedHistoryCard = React.memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.zoneName === nextProps.zoneName &&
    prevProps.time === nextProps.time &&
    prevProps.zoneMin === nextProps.zoneMin &&
    prevProps.zoneMax === nextProps.zoneMax &&
    prevProps.restingHR === nextProps.restingHR &&
    prevProps.age === nextProps.age
  );
});

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [history, setHistory] = useState<GroupedHistory>({});
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [averageRestingHR, setAverageRestingHR] = useState<number | null>(null);
  const [minRestingHR, setMinRestingHR] = useState<number | null>(null);
  const [maxRestingHR, setMaxRestingHR] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const bottomBarItems = useMemo(
    () => [
      {
        iconName: 'settings' as const,
        onPress: () => navigation.navigate('Settings'),
        key: 'settings-btn',
      },
      {
        iconName: 'back' as const,
        onPress: () => navigation.navigate('Main'),
        key: 'back-btn',
        iconStyle: {transform: [{rotate: '180deg'}]},
      },
    ],
    [navigation],
  );

  // Оптимизированное форматирование даты с кэшем
  const formatDate = useCallback((dateString: string): string => {
    if (dateCache.has(dateString)) {
      return dateCache.get(dateString)!;
    }

    const date = new Date(dateString);
    const formatted = `${date.getDate().toString().padStart(2, '0')}.${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${date.getFullYear()}`;
    dateCache.set(dateString, formatted);
    return formatted;
  }, []);

  // Оптимизированное форматирование времени с кэшем
  const formatTime = useCallback((dateString: string): string => {
    if (timeCache.has(dateString)) {
      return timeCache.get(dateString)!;
    }

    const date = new Date(dateString);
    const formatted = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    timeCache.set(dateString, formatted);
    return formatted;
  }, []);

  // Оптимизированная группировка с кэшированием дат
  const groupByDate = useCallback(
    (items: HistoryItem[]): GroupedHistory => {
      const grouped: GroupedHistory = {};
      items.forEach(item => {
        const date = formatDate(item.calculation_date);
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(item);
      });
      return grouped;
    },
    [formatDate],
  );

  // Оптимизированный расчет статистики
  const calculateRestingHRStats = useCallback((items: HistoryItem[]) => {
    if (items.length === 0) {
      return {avg: null, min: null, max: null};
    }

    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    for (const item of items) {
      sum += item.resting_hr;
      if (item.resting_hr < min) {
        min = item.resting_hr;
      }
      if (item.resting_hr > max) {
        max = item.resting_hr;
      }
    }

    const avg = Math.round(sum / items.length);
    return {avg, min, max};
  }, []);

  // Функция загрузки истории
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);

      const data: HistoryItem[] = await DatabaseService.getCalculationHistory(
        20,
      );

      await FirebaseService.logEvent('history_viewed', {
        item_count: data.length,
      });

      setTotalCount(data.length);

      if (data.length === 0) {
        setIsEmpty(true);
        setHistory({});
        setAverageRestingHR(null);
        setMinRestingHR(null);
        setMaxRestingHR(null);
      } else {
        setIsEmpty(false);

        const grouped = groupByDate(data);
        setHistory(grouped);

        const stats = calculateRestingHRStats(data);
        setAverageRestingHR(stats.avg);
        setMinRestingHR(stats.min);
        setMaxRestingHR(stats.max);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
      await FirebaseService.logEvent('history_load_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  }, [groupByDate, calculateRestingHRStats]);

  // Загрузка при монтировании
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Функция удаления
  const handleDelete = useCallback(
    async (id: number, zoneName: string) => {
      Alert.alert(
        'Удаление записи',
        `Вы уверены, что хотите удалить расчет зоны "${zoneName}"?`,
        [
          {text: 'Отмена', style: 'cancel'},
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await DatabaseService.deleteCalculation(id);

                if (success) {
                  // Обновляем историю без повторной загрузки из БД
                  setHistory(prevHistory => {
                    const newHistory: GroupedHistory = {};
                    Object.entries(prevHistory).forEach(([date, items]) => {
                      const filteredItems = items.filter(
                        item => item.id !== id,
                      );
                      if (filteredItems.length > 0) {
                        newHistory[date] = filteredItems;
                      }
                    });
                    return newHistory;
                  });

                  // Обновляем статистику
                  setTotalCount(prev => prev - 1);

                  // Получаем все элементы из текущего состояния
                  setHistory(prevHistory => {
                    const allItems = Object.values(prevHistory).flat();
                    if (allItems.length > 0) {
                      const stats = calculateRestingHRStats(allItems);
                      setAverageRestingHR(stats.avg);
                      setMinRestingHR(stats.min);
                      setMaxRestingHR(stats.max);
                    } else {
                      setIsEmpty(true);
                      setAverageRestingHR(null);
                      setMinRestingHR(null);
                      setMaxRestingHR(null);
                    }
                    return prevHistory;
                  });

                  await FirebaseService.logEvent('history_item_deleted', {
                    zone_name: zoneName,
                  });
                } else {
                  Alert.alert('Ошибка', 'Не удалось удалить запись');
                }
              } catch (error) {
                console.error('Ошибка при удалении:', error);
                Alert.alert('Ошибка', 'Не удалось удалить запись');
              }
            },
          },
        ],
      );
    },
    [calculateRestingHRStats],
  );

  // Мемоизированная функция для получения обработчика удаления
  const getDeleteHandler = useCallback(
    (id: number, zoneName: string) => {
      return () => handleDelete(id, zoneName);
    },
    [handleDelete],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E75F55" />
          <Text style={styles.loadingText}>Загрузка истории...</Text>
        </View>
        <BottomBar items={bottomBarItems} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5EE" />

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>История расчетов</Text>

          {!isEmpty && averageRestingHR !== null && (
            <Card
              type="stats"
              description={`Показаны последние ${totalCount} расчетов`}
              stats={{
                min: minRestingHR || 0,
                avg: averageRestingHR,
                max: maxRestingHR || 0,
                minLabel: 'Мин. пульс',
                avgLabel: 'Средний пульс',
                maxLabel: 'Макс. пульс',
              }}
            />
          )}

          {isEmpty ? (
            <View style={styles.emptyContainer}>
              <Icon name="heart" size={64} color="#718096" />
              <Text style={styles.emptyText}>История расчетов пуста</Text>
              <Text style={styles.emptySubText}>
                Ваши расчеты пульсовых зон появятся здесь
              </Text>
            </View>
          ) : (
            Object.entries(history).map(([date, items]) => (
              <View key={date} style={styles.dateSection}>
                <Text style={styles.dateHeader}>{date}</Text>

                {items.map(item => (
                  <MemoizedHistoryCard
                    key={item.id}
                    type="history"
                    zoneName={item.zone_name as ZoneName}
                    time={formatTime(item.calculation_date)}
                    zoneMin={item.zone_min}
                    zoneMax={item.zone_max}
                    restingHR={item.resting_hr}
                    age={item.age}
                    headerRight={
                      <Icon
                        name="trash"
                        size={24}
                        color="#71809677"
                        onPress={getDeleteHandler(item.id, item.zone_name)}
                        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                      />
                    }
                  />
                ))}
              </View>
            ))
          )}
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
    paddingHorizontal: '8%',
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7A7A7A',
  },
  title: {
    color: '#E75F55',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
  },
  dateSection: {
    width: '100%',
  },
  dateHeader: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyText: {
    fontSize: 20,
    color: '#7A7A7A',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 22,
  },
});
