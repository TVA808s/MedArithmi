import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ScreensList } from '../types/navigation';
import Icon from '../components/Icons';

// необходима типизация переменной navigation
type HistoryScreenNavigationProp = StackNavigationProp<ScreensList, 'Main'>;


export function HistoryScreen() {
    const navigation = useNavigation<HistoryScreenNavigationProp>();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF1D7" />
      
      {/* Верхний бар */}
      <View style={styles.topBar}>
            <Text style={styles.text}>история</Text>
      </View>
      


      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Добро пожаловать!</Text>
        
      </View>
      


      {/* Нижний бар */}
      <View style={styles.bottomBar}>
        <Icon 
          name="settings" 
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
        <Icon 
          name="back"
          style={{ transform: [{ rotate: '180deg' }] }}
          onPress={() => {
            navigation.navigate('Main');
          }}
        />
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF1D7',
  },
  topBar: {
    backgroundColor: '#B2F28E',
    justifyContent: 'center',
    height: 120,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 10,
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
  content: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'sans-serif-light',
    fontSize: 24,
    color: '#7A7A7A',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#79A162',
    height: 70,
    marginTop: -5,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderTopWidth: 5,
    borderTopLeftRadius: 10,
  },

});
