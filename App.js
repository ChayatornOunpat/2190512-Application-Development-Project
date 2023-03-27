import React from "react";
import {
    View,
} from "react-native";
import {useFonts} from 'expo-font';
import {Screen} from "./component";
import {Download} from "./download";
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {styles} from "./styles";


const Stack = createStackNavigator();

export default function App() {
    const [fontsLoaded] = useFonts({
        'Noto': require('./assets/NotoSansTH.ttf'),
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
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Primary" component={Screen}/>
                <Stack.Screen name="Load" component={Download}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}


