import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import {AnimatedCircleSpinner}  from '../components/AnimatedSpinner';

// необходима типизация переменной navigation
type LoadingScreenNavigationProp = StackNavigationProp<ScreensList, 'Loading'>;

export function LoadingScreen() {
    const navigation = useNavigation<LoadingScreenNavigationProp>();
    
    const handleMain = () => {
        navigation.navigate('Main');
    };
    
    return (
    <View style={styles.container}>
        <View style={{ marginBottom: 50 }}>
            <Text style={styles.text}>загрузка</Text>
        </View>

        <AnimatedCircleSpinner/>

        <TouchableOpacity 
            style={styles.button} 
            onPress={handleMain}
            activeOpacity={0.7}
        >
            <Text style={styles.buttonText}>Перейти на главную</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1D7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  text: {
    fontFamily: 'sans-serif-light',
    fontSize: 42,
    color: '#7A7A7A',
    fontWeight: '200',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});