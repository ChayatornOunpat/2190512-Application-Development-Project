import React from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Authenticate } from './src/screens/Authenticate';
import { Screen } from './src/screens/Primary';
import { Driving } from './src/screens/Driving';
import Admin from './src/screens/Admin';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useFonts({
    Noto: require('./assets/NotoSansTH.ttf'),
  });

  return (
    <NavigationContainer>
      <View
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundColor: '#222222',
        }}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={Authenticate} />
        <Stack.Screen name="Primary" component={Screen} />
        <Stack.Screen name="Driving" component={Driving} />
        <Stack.Screen name="Admin" component={Admin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
