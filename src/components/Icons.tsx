import React from 'react';
import {
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

// возможные иконки
export type IconName =
  | 'history'
  | 'settings'
  | 'trash'
  | 'back'
  | 'droplet'
  | 'heart'
  | 'lightning'
  | 'plant'
  | 'star'
  | 'heart2'
  | 'person'
  | 'pulse'
  | 'guard'
  | 'notification'
  | 'info'
  | 'calculator';

// возможные пропсы
export interface IconProps extends TouchableOpacityProps {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  hitSlop?: {top: number; bottom: number; left: number; right: number};
}

// предзагрузка
const ICON_MAP: Record<IconName, any> = {
  history: require('../assets/icons/History.png'),
  settings: require('../assets/icons/Settings.png'),
  back: require('../assets/icons/Back.png'),
  trash: require('../assets/icons/Trash.png'),
  droplet: require('../assets/icons/Droplet.png'),
  heart: require('../assets/icons/Heart.png'),
  lightning: require('../assets/icons/Lightning.png'),
  plant: require('../assets/icons/Plant.png'),
  star: require('../assets/icons/Star.png'),
  pulse: require('../assets/icons/Pulse.png'),
  person: require('../assets/icons/Person.png'),
  heart2: require('../assets/icons/Heart2.png'),
  guard: require('../assets/icons/Shield.png'),
  notification: require('../assets/icons/Notification.png'),
  info: require('../assets/icons/Info.png'),
  calculator: require('../assets/icons/Calculator.png'),
};

const Icon: React.FC<IconProps> = ({
  name,
  size = 60,
  color = '#F0F5EE',
  style,
  onPress,
  hitSlop = {top: 10, bottom: 10, left: 10, right: 10},
  ...restProps
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, {width: size, height: size}, style]}
      onPress={onPress}
      hitSlop={hitSlop}
      {...restProps}>
      <Image
        source={ICON_MAP[name]}
        style={[{width: size, height: size}, color ? {tintColor: color} : {}]}
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
