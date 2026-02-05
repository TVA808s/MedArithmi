import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export function TopBar() {
  return (
    <View style={styles.topBar}>
      <View style={styles.dinamicAttrs}>
        <Text style={styles.topBarText}>110-130</Text>
        <Text style={styles.topBarText}>89</Text>
      </View>
      <Text style={styles.topBarTextTitle}>PulseSport</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: '#E75F55',
    justifyContent: 'center',
    height: 80,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  dinamicAttrs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarText: {
    color: '#F0F5EE',
    fontSize: 24,
  },
  topBarTextTitle: {
    color: '#F0F5EE',
    fontSize: 24,
    textAlign: 'center',
  },
});