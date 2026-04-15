import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './context/AppContext';
import CalculatorScreen from './screens/CalculatorScreen';
import SettingsScreen   from './screens/SettingsScreen';
import ConversionScreen from './screens/ConversionScreen';

const Tab = createBottomTabNavigator();

const TAB_EMOJI = {
  Calculator: '⏱️',
  Settings:   '⚙️',
  Converter:  '↔️',
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor:   '#e63946',
            tabBarInactiveTintColor: '#adb5bd',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor:  '#f1f3f5',
              elevation: 10,
              shadowOpacity: 0.08,
            },
            tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
                {TAB_EMOJI[route.name]}
              </Text>
            ),
          })}
        >
          <Tab.Screen name="Calculator" component={CalculatorScreen} />
          <Tab.Screen name="Settings"   component={SettingsScreen} />
          <Tab.Screen name="Converter"  component={ConversionScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}