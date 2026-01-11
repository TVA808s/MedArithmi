import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import Icons from './Icons'
interface CalculatorCardProps {
  id: string;
  title: string;
  icon: object;
  description?: string;
  // Режим работы карточки
  mode?: 'navigate' | 'expand'; 
  // Для режима expand - данные для отображения
  resultData?: {
    value: number;
    unit: string;
    interpretation: string;
    color: string;
  };
  // Для режима navigate - название экрана для перехода
  navigateTo?: keyof ScreensList;
}

type CardNavigationProp = StackNavigationProp<ScreensList>;

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  id,
  title,
  icon,
  description = '',
  mode = 'navigate',
  resultData,
  navigateTo,
}) => {
  const navigation = useNavigation<CardNavigationProp>();
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Заглушечные данные для демонстрации
  const defaultResultData = {
    value: 24.5,
    unit: 'кг/м²',
    interpretation: 'Нормальный вес',
    color: '#4CAF50',
  };

  const displayData = resultData || defaultResultData;

  const toggleExpand = () => {
    if (mode !== 'expand') return;

    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const handlePress = () => {
    if (mode === 'navigate' && navigateTo) {
      navigation.navigate(navigateTo);
    } else if (mode === 'expand') {
      toggleExpand();
    }
  };

  // Анимация высоты для раскрывающейся части
  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140], // Высота раскрывающейся части
  });


  // Эмуляция иконки (замените на ваш компонент Icon)
  const renderIcon = () => (
    <View style={styles.iconContainer}>
      
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        {renderIcon()}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
      </View>

      {mode === 'expand' && (
        <Animated.View style={[styles.expandedContent, { height: contentHeight }]}>
          <View style={styles.resultSection}>
            <View style={styles.resultValueContainer}>
              <Text style={styles.resultValue}>{displayData.value}</Text>
              <Text style={styles.resultUnit}>{displayData.unit}</Text>
            </View>
            <View style={[styles.interpretationBadge, { backgroundColor: displayData.color }]}>
              <Text style={styles.interpretationText}>{displayData.interpretation}</Text>
            </View>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Детали расчета:</Text>
            <Text style={styles.detailsText}>
              • Рост: 175 см{'\n'}
              • Вес: 75 кг{'\n'}
              • Возраст: 30 лет{'\n'}
              • Дата: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '80%',
    backgroundColor: '#E1FFD0',
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: '#000000',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: '25%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  description: {
    fontFamily: 'sans-serif-light',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  expandedContent: {
    overflow: 'hidden',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resultSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  resultValue: {
    fontFamily: 'sans-serif-medium',
    fontSize: 28,
    color: '#333',
    fontWeight: '600',
    marginRight: 8,
  },
  resultUnit: {
    fontFamily: 'sans-serif-light',
    fontSize: 16,
    color: '#666',
  },
  interpretationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interpretationText: {
    color: '#FFFFFF',
    fontFamily: 'sans-serif-medium',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  detailsTitle: {
    fontFamily: 'sans-serif-medium',
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginBottom: 8,
  },
  detailsText: {
    fontFamily: 'sans-serif-light',
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});