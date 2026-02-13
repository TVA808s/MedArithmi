import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {MainScreen} from '../screens/MainScreen';
import {CalculatorScreen} from '../screens/CalculatorScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {TopBar} from '../components/TopBar';

const Stack = createStackNavigator();

// Выносим компонент TopBarWrapper отдельно
const TopBarWrapper = () => {
  return <TopBar />;
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: TopBarWrapper,
        }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Calculator" component={CalculatorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
