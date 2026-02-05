import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Navigation from './src/navigation/navigation';
import {PulseProvider} from './src/context/PulseContext';

const App = () => {
  return (
    <PulseProvider>
      <SafeAreaView style={styles.container}>
        <Navigation />
      </SafeAreaView>
    </PulseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
