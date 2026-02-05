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

interface CalculatorCardProps {
  id: string;
  title: string;
  description: string;
  params?: Record<string, any>;
  navigateTo: keyof ScreensList;
}

type CardNavigationProp = StackNavigationProp<ScreensList>;

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  id,
  title,
  description,
  params,
  navigateTo,
}) => {
  const navigation = useNavigation<CardNavigationProp>();
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const handleGoToCalculator = () => {
    navigation.navigate(navigateTo, params || {});
  };

  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  return (
    <View style={styles.card}>
      {/* Заголовок */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={toggleExpand}
        activeOpacity={0.5}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Раскрывающийся контент */}
      <Animated.View style={[styles.expandedContent, {height: contentHeight}]}>
        <View style={styles.contentWrapper}>
          {/* Описание калькулятора */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
          {/* Кнопка перехода (под описанием, справа) */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={handleGoToCalculator}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Text style={styles.navigateButtonText}>Перейти →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '80%',
    minHeight: 62,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 6,
    borderWidth: 2,
    borderColor: '#A0C28E',
    overflow: 'hidden',
    marginVertical: 5,
  },
  cardHeader: {
    height: 46,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    color: '#A21812',
    fontWeight: '400',
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  descriptionContainer: {
    marginBottom: 12, // Отступ перед кнопкой
    maxHeight: 88,
  },
  descriptionText: {
    fontFamily: 'sans-serif-light',
    fontSize: 16,
    color: '#A21812',
    lineHeight: 22,
  },
  buttonContainer: {
    alignItems: 'flex-end', // Выравнивание содержимого по правому краю
  },
  navigateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(160, 194, 142, 0.1)',
  },
  navigateButtonText: {
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    color: '#A21812',
    fontWeight: '400',
  },
});
