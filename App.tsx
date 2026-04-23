import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Authenticate } from './src/screens/Authenticate';
import { Screen } from './src/screens/Primary';
import { Driving } from './src/screens/Driving';
import Admin from './src/screens/Admin';
import { authState, currentUser, restoreSession, subscribeAuth, subscribeForbidden } from './src/api/auth';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [, setAuthVersion] = useState(0);

  useFonts({
    Noto: require('./assets/NotoSansTH.ttf'),
  });

  useEffect(() => {
    const unsubscribeAuth = subscribeAuth(() => {
      setAuthVersion((value) => value + 1);
    });
    const unsubscribeForbidden = subscribeForbidden(() => {
      if (!navigationRef.isReady()) {
        return;
      }

      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: currentUser.value ? 'Primary' : 'SignIn' }],
      });
    });

    void restoreSession();

    return () => {
      unsubscribeForbidden();
      unsubscribeAuth();
    };
  }, []);

  if (!authState.ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#222222',
        }}
      />
    );
  }

  const signedIn = currentUser.value !== null;

  return (
    <NavigationContainer ref={navigationRef}>
      <View
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundColor: '#222222',
        }}
      />
      <Stack.Navigator
        key={signedIn ? 'signed-in' : 'signed-out'}
        initialRouteName={signedIn ? 'Primary' : 'SignIn'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SignIn" component={Authenticate} />
        <Stack.Screen name="Primary" component={Screen} />
        <Stack.Screen name="Driving" component={Driving} />
        <Stack.Screen name="Admin" component={Admin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
