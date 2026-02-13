import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ScreensList} from '../types/navigation';
import Icon, {IconName} from './Icons';

interface CalculatorCardProps {
  id: string;
  title: string;
  description: string;
  params?: Record<string, any>;
  navigateTo: keyof ScreensList;
  // Иконка для карточки (опционально)
  iconName?: IconName;
  iconSize?: number;
  // Пропсы для кастомных цветов
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string; // Общий цвет для заголовка, иконки и ">>>"
  // Пропсы для кастомных стилей
  cardStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  iconStyle?: ViewStyle;
}

type CardNavigationProp = StackNavigationProp<ScreensList>;

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  id: _id,
  title,
  description,
  params,
  navigateTo,
  iconName,
  iconSize = 40,
  // Кастомные цвета
  backgroundColor = '#FFFFFF',
  borderColor = '#A0C28E',
  textColor = '#A21812',
  // Стили по умолчанию
  cardStyle,
  titleStyle,
  descriptionStyle,
  iconStyle,
}) => {
  const navigation = useNavigation<CardNavigationProp>();

  const handlePress = () => {
    navigation.navigate(navigateTo, params || {});
  };

  return (
    <TouchableOpacity
      style={[styles.card, {backgroundColor, borderColor}, cardStyle]}
      onPress={handlePress}
      activeOpacity={0.7}>
      {/* Основное содержимое карточки */}
      <View style={styles.contentContainer}>
        {/* Левая часть: заголовок и описание */}
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text
              style={[styles.title, {color: textColor}, titleStyle]}
              numberOfLines={1}>
              {title}
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionText, descriptionStyle]}>
              {description}
            </Text>
          </View>
        </View>

        {/* Правая часть: иконка (если указана) и стрелка */}
        <View style={styles.rightSection}>
          {iconName && (
            <View style={[styles.iconContainer, iconStyle]}>
              <Icon
                name={iconName}
                size={iconSize}
                color={textColor}
                style={styles.icon}
                onPress={handlePress}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              />
            </View>
          )}

          {/* Текст ">>>" внизу справа */}
          <View style={styles.arrowContainer}>
            <Text style={[styles.arrowText, {color: textColor}]}>{'>>>'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '80%',
    minHeight: 120,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  textContainer: {
    flex: 1,
    marginRight: 12, // Отступ между текстом и правой секцией
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    fontWeight: '400',
  },
  descriptionContainer: {
    flex: 1,
  },
  descriptionText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#7a7a7a',
    lineHeight: 18,
  },
  rightSection: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    opacity: 0.3, // Полупрозрачность иконки
  },
  arrowContainer: {
    marginTop: 'auto', // Прижимаем к низу
  },
  arrowText: {
    fontFamily: 'sans-serif-medium',
    fontSize: 21,
    fontWeight: '600',
    opacity: 0.5,
  },
});
