import React, {useState, useEffect, useCallback} from 'react';
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
import Icon, {IconName} from '../components/Icons';

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

const ZONE_CONFIG: Record<
  string,
  {textColor: string; backgroundColor: string; iconName: IconName}
> = {
  Восстановление: {
    textColor: '#339e1a',
    backgroundColor: '#ebffe7',
    iconName: 'plant',
  },
  Аэробная: {
    textColor: '#9e1a72',
    backgroundColor: '#ffe7f1',
    iconName: 'heart',
  },
  Темповая: {
    textColor: '#1a9e97',
    backgroundColor: '#e7faff',
    iconName: 'droplet',
  },
  Анаэробная: {
    textColor: '#9e691a',
    backgroundColor: '#fff5e7',
    iconName: 'star',
  },
  Максимальная: {
    textColor: '#9e1a1a',
    backgroundColor: '#ffe7e7',
    iconName: 'lightning',
  },
};

export function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [history, setHistory] = useState<GroupedHistory>({});
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [averageRestingHR, setAverageRestingHR] = useState<number | null>(null);
  const [minRestingHR, setMinRestingHR] = useState<number | null>(null);
  const [maxRestingHR, setMaxRestingHR] = useState<number | null>(null);

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

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .split('.')
      .join('.');
  }, []);

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

  const calculateRestingHRStats = useCallback((items: HistoryItem[]) => {
    if (items.length === 0) {
      return {avg: null, min: null, max: null};
    }

    const values = items.map(item => item.resting_hr);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {avg, min, max};
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);

      const data: HistoryItem[] = await DatabaseService.getCalculationHistory(20);

      await FirebaseService.logEvent('history_viewed', {
        item_count: data.length,
      });

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

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: number, zoneName: string) => {
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
                setHistory(prevHistory => {
                  const newHistory: GroupedHistory = {};
                  Object.entries(prevHistory).forEach(([date, items]) => {
                    const filteredItems = items.filter(item => item.id !== id);
                    if (filteredItems.length > 0) {
                      newHistory[date] = filteredItems;
                    }
                  });
                  return newHistory;
                });

                const updatedData = await DatabaseService.getCalculationHistory(20);
                if (updatedData.length > 0) {
                  const stats = calculateRestingHRStats(updatedData);
                  setAverageRestingHR(stats.avg);
                  setMinRestingHR(stats.min);
                  setMaxRestingHR(stats.max);
                } else {
                  setIsEmpty(true);
                  setAverageRestingHR(null);
                  setMinRestingHR(null);
                  setMaxRestingHR(null);
                }

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
  };

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

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>История расчетов</Text>

          {!isEmpty && averageRestingHR !== null && (
            <View style={styles.statsContainer}>
              <Text style={styles.infoText}>
                Показаны последние {Object.values(history).flat().length} расчетов
              </Text>

              <View style={styles.statsDivider} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.iconCircle, {backgroundColor: '#55e7813b'}]}>
                    <Icon name="heart" size={28} color="#55e781" />
                  </View>
                  <Text style={styles.statValue}>{minRestingHR}</Text>
                  <Text style={styles.statLabel}>Мин. пульс</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.iconCircle, {backgroundColor: '#dde75538'}]}>
                    <Icon name="heart" size={28} color="#dde755" />
                  </View>
                  <Text style={styles.statValue}>{averageRestingHR}</Text>
                  <Text style={styles.statLabel}>Средний пульс</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.iconCircle, {backgroundColor: '#e75f552d'}]}>
                    <Icon name="heart" size={28} color="#E75F55" />
                  </View>
                  <Text style={styles.statValue}>{maxRestingHR}</Text>
                  <Text style={styles.statLabel}>Макс. пульс</Text>
                </View>
              </View>
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
            Object.entries(history).map(([date, items]) => (
              <View key={date} style={styles.dateSection}>
                <Text style={styles.dateHeader}>{date}</Text>

                {items.map(item => {
                  const zoneConfig = ZONE_CONFIG[item.zone_name] || {
                    textColor: '#A21812',
                    backgroundColor: '#FFFFFF',
                    iconName: 'heart' as IconName,
                  };

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.card,
                        {
                          backgroundColor: zoneConfig.backgroundColor,
                          borderTopColor: zoneConfig.textColor,
                        },
                      ]}>
                      <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                          <View style={styles.titleLeft}>
                            <View
                              style={[
                                styles.zoneIconCircle,
                                {backgroundColor: zoneConfig.textColor + '20'},
                              ]}>
                              <Icon
                                name={zoneConfig.iconName}
                                size={24}
                                color={zoneConfig.textColor}
                              />
                            </View>
                            <View style={styles.titleTextContainer}>
                              <Text
                                style={[
                                  styles.cardTitle,
                                  {color: zoneConfig.textColor},
                                ]}>
                                {item.zone_name}
                              </Text>
                              <Text style={styles.cardTime}>
                                {formatTime(item.calculation_date)}
                              </Text>
                            </View>
                          </View>

                          <Icon
                            name="trash"
                            size={24}
                            color="#71809677"
                            onPress={() => handleDelete(item.id, item.zone_name)}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                          />
                        </View>
                      </View>

                      <View style={styles.calculationsBlock}>
                        <View style={styles.calculationRow}>
                          <View style={styles.calculationLabelContainer}>
                            <Icon
                              name="pulse"
                              size={18}
                              color="#718096"
                            />
                            <Text style={styles.calculationLabel}>Результат:</Text>
                          </View>
                          <Text
                            style={[
                              styles.calculationValue,
                              {color: zoneConfig.textColor},
                            ]}>
                            {item.zone_min} - {item.zone_max} уд/мин
                          </Text>
                        </View>

                        <View style={styles.calculationDivider} />

                        <View style={styles.calculationRow}>
                          <View style={styles.calculationLabelContainer}>
                            <Icon
                              name="heart2"
                              size={18}
                              color="#718096"
                            />
                            <Text style={styles.calculationLabel}>ЧСС покоя:</Text>
                          </View>
                          <Text style={styles.calculationValueGray}>
                            {item.resting_hr} уд/мин
                          </Text>
                        </View>

                        <View style={styles.calculationDivider} />

                        <View style={styles.calculationRow}>
                          <View style={styles.calculationLabelContainer}>
                            <Icon
                              name="person"
                              size={18}
                              color="#718096"
                            />
                            <Text style={styles.calculationLabel}>Возраст:</Text>
                          </View>
                          <Text style={styles.calculationValueGray}>
                            {item.age} лет
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
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
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    width: '100%',
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#000',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#718096',
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
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderTopWidth: 4,
    borderWidth: 1,
    elevation: 3,
  },
  zoneIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 12,
    color: '#718096',
  },
  calculationsBlock: {
    backgroundColor: '#ffffffa4',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculationLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#718096',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  calculationValueGray: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  calculationDivider: {
    height: 1,
    backgroundColor: '#71809638',
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
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 22,
  },
});
