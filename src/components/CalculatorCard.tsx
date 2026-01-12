import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import Icon, {IconName} from './Icons';

interface CalculatorCardProps {
  id: string;
  title: string;
  icon: IconName;
  description?: string;
  // режимы карточки
  mode?: 'navigate' | 'expand';
  // данные для раскрывающейся карточки в истории
  resultData?: {
    value: number;
    unit: string;
    interpretation: string;
    color: string;
  };
  // страница перехода для карточек в меню
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

  // заглушка
  const defaultResultData = {
    value: 22,
    unit: 'кг/м²',
    interpretation: 'Ваше телосложение в пределах нормы',
    color: '#2BB641',
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

  // анимация раскрытия карточки
  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150], // высота раскрытия
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Icon
          name={icon}
          size={60}
          color="#CA6C44"
          style={styles.icon}
          onPress={handlePress}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      {mode === 'expand' && (
        <Animated.View
          style={[styles.expandedContent, {height: contentHeight}]}>
          <View style={styles.resultSection}>
            <View style={styles.resultValueContainer}>
              <Text style={styles.Heading}>Результат:</Text>
              <View style={styles.result}>
                <Text style={styles.resultText}>{displayData.value}</Text>
                <Text style={styles.resultText}>{displayData.unit}</Text>
              </View>
            </View>
            <View style={styles.interpretationValueContainer}>
              <Text style={styles.Heading}>Интерпретация:</Text>
              <Text style={styles.interpretationText}>
                {displayData.interpretation}
              </Text>
            </View>
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
  icon: {
    width: 60,
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
    color: '#CA6C44',
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
  },
  resultSection: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    gap: 5,
  },
  resultValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  Heading: {
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#7A7A7A',
  },
  result: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  resultText: {
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#2BB641',
  },
  interpretationValueContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  interpretationText: {
    textAlign: 'center',
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#2BB641',
  },
});
