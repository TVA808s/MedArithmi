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
  | 'search'
  | 'bmi'
  | 'curb'
  | 'droplet'
  | 'heart'
  | 'lightning'
  | 'skf';

// возможные пропсы
export interface IconProps extends TouchableOpacityProps {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
}

// предзагрузка
const ICON_MAP: Record<IconName, any> = {
  search: require('../assets/icons/Search.png'),
  history: require('../assets/icons/History.png'),
  settings: require('../assets/icons/Settings.png'),
  back: require('../assets/icons/Back.png'),
  trash: require('../assets/icons/Trash.png'),
  bmi: require('../assets/icons/BMI.png'),
  curb: require('../assets/icons/CURB.png'),
  droplet: require('../assets/icons/Droplet.png'),
  heart: require('../assets/icons/Heart.png'),
  lightning: require('../assets/icons/Lightning.png'),
  skf: require('../assets/icons/SKF.png'),
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