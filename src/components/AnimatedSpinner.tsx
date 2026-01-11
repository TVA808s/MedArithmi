import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export const AnimatedCircleSpinner = ({ 
  color = '#7a7a7a'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const size = 100;
  const strokeWidth = 3;
  const radius = 48.5; 
  
  return (
    <Animated.View style={{ 
      width: size, 
      height: size, 
      transform: [{ rotate: spin }] 
    }}>
      <Svg width={size} height={size}>
        <Circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="114 38" 
        />
      </Svg>
    </Animated.View>
  );
};