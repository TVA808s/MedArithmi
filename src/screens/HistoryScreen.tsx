import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import {BottomBar} from '../components/BottomBar';
import DatabaseService from '../services/DatabaseService';
import FirebaseService from '../services/FirebaseService';

type HistoryScreenNavigationProp = StackNavigationProp<ScreensList, 'History'>;

// Тип для элемента истории
interface HistoryItem {
  id: number;
  zone_name: string;
  age: number;
  resting_hr: number;
  zone_min: number;
  zone_max: number;
  calculation_date: string;
}

// Тип для группировки по дате
interface GroupedHistory {
  [date: string]: HistoryItem[];
}

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [history, setHistory] = useState<GroupedHistory>({});
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

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
      iconStyle: {transform: [{rotate: '180deg'}]},
    },
  ];

  // Форматирование даты
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);

    // Сегодняшняя дата
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Вчерашняя дата
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() === today.getTime()) {
      return 'Сегодня';
    } else if (itemDate.getTime() === yesterday.getTime()) {
      return 'Вчера';
    } else {
      return itemDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }, []);

  // Группировка записей по дате
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

  // Загрузка истории из БД с лимитом 10 записей
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);

        // 1. Загружаем данные
        const data: HistoryItem[] = await DatabaseService.getCalculationHistory(
          10,
        );

        // 2. Логируем просмотр истории
        await FirebaseService.logEvent('history_viewed', {
          item_count: data.length,
        });

        if (data.length === 0) {
          setIsEmpty(true);
          setHistory({});
        } else {
          setIsEmpty(false);
          const grouped = groupByDate(data);
          setHistory(grouped);
        }
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);

        // Логируем ошибку загрузки истории
        await FirebaseService.logEvent('history_load_error', {
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        });

        setIsEmpty(true);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [groupByDate]);

  // Форматирование времени
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

      {/* Основной контент */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>История расчетов</Text>

          {/* Информация о количестве записей */}
          {!isEmpty && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Показаны последние 10 расчетов
              </Text>
            </View>
          )}

          {isEmpty ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>История расчетов пуста</Text>
              <Text style={styles.emptySubText}>
                Ваши расчеты пульсовых зон появятся здесь
              </Text>
            </View>
          ) : (
            // Список сгруппированных записей
            Object.entries(history).map(([date, items]) => (
              <View key={date} style={styles.dateSection}>
                <Text style={styles.dateHeader}>{date}</Text>

                {items.map(item => (
                  <View key={item.id} style={styles.card}>
                    {/* Заголовок карточки */}
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{item.zone_name}</Text>
                      <Text style={styles.cardTime}>
                        {formatTime(item.calculation_date)}
                      </Text>
                    </View>

                    {/* Основные данные */}
                    <View style={styles.cardContent}>
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Результат:</Text>
                        <Text style={styles.dataValue}>
                          {item.zone_min} - {item.zone_max} уд/мин
                        </Text>
                      </View>

                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>ЧСС покоя:</Text>
                        <Text style={styles.dataValue}>
                          {item.resting_hr} уд/мин
                        </Text>
                      </View>

                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Возраст:</Text>
                        <Text style={styles.dataValue}>{item.age} лет</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
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
    paddingTop: 20,
  },
  scrollViewContent: {
    paddingHorizontal: '5%',
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
    marginBottom: 10,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 4,
  },
  countText: {
    fontSize: 14,
    color: '#A21812',
    fontWeight: '600',
  },
  dateSection: {
    marginBottom: 25,
  },
  dateHeader: {
    fontSize: 18,
    color: '#A21812',
    fontWeight: '600',
    marginBottom: 10,
    paddingLeft: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 20,
    color: '#A21812',
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  cardContent: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 16,
    color: '#7A7A7A',
  },
  dataValue: {
    fontSize: 16,
    color: '#A21812',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#7A7A7A',
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 22,
  },
});
