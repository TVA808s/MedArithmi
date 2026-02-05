import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon, {IconName} from './Icons';

export interface BottomBarItem {
  /** Имя иконки из вашего набора IconName */
  iconName: IconName;
  /** Обработчик нажатия на иконку */
  onPress: () => void;
  /** Необязательный ключ для React */
  key?: string;
  /** Необязательный дополнительный стиль для конкретной иконки */
  iconStyle?: any;
}

interface BottomBarProps {
  /** Массив элементов для отображения в нижней панели */
  items: BottomBarItem[];
  /** Необязательный дополнительный стиль для контейнера */
  containerStyle?: any;
}

export function BottomBar({items, containerStyle}: BottomBarProps) {
  return (
    <View style={[styles.bottomBar, containerStyle]}>
      {items.map((item, index) => (
        <Icon
          key={item.key || `bottom-bar-icon-${index}`}
          name={item.iconName}
          onPress={item.onPress}
          style={item.iconStyle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E75F55',
    height: 70,
    marginTop: -5,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderTopWidth: 5,
    borderTopLeftRadius: 10,
  },
});