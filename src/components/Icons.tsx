import React from 'react';
import {
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

// Типы иконок
export type IconName =
  | 'history'
  | 'settings'
  | 'trash'
  | 'back'
  | 'search';

// Пропсы компонента
export interface IconProps extends TouchableOpacityProps {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
}

// Карта иконок
const ICON_MAP: Record<IconName, any> = {
  search: require('../assets/icons/Search.png'),
  history: require('../assets/icons/History.png'),
  settings: require('../assets/icons/Settings.png'),
  back: require('../assets/icons/Back.png'),
  trash: require('../assets/icons/Trash.png'),
};

const Icon: React.FC<IconProps> = ({
  name,
  size = 60,
  color = '#FFF1D7',
  style,
  onPress,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
  ...restProps
}) => {

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }, style]}
      onPress={onPress}
      hitSlop={hitSlop}
      {...restProps}
    >
      <Image
        source={ICON_MAP[name]}
        style={[
          { width: size, height: size },
          color ? { tintColor: color } : {},
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Icon;