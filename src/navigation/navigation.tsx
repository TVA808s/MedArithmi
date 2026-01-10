import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MainScreen } from '../screens/MainScreen';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Loading"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Loading" 
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen}
          options={{ title: 'MedArithmi' }}
        />
        <Stack.Screen 
          name="Calculator" 
          component={CalculatorScreen}
          options={{ title: 'Калькулятор' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Настройки' }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: 'История' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
