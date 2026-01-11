// App.tsx
import { SafeAreaView, StatusBar } from 'react-native';
import Navigation from './src/navigation/navigation';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation/>
    </SafeAreaView>
  );
};

export default App; 