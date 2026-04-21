import React, { useState } from 'react';
import { Alert, Text, View, TextInput, TouchableOpacity } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { styles } from '../styles';
import { auth } from '../../firebase-config';
import type { RootStackParamList } from '../types/navigation';

type Props = StackScreenProps<RootStackParamList, 'SignIn'>;

export function Authenticate({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignInPress = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Primary');
    } catch (error) {
      Alert.alert((error as Error).message);
    }
  };

  return (
    <View style={styles.dlContainer}>
      <TextInput
        style={styles.inputView}
        placeholder="Email."
        placeholderTextColor="#003f5c"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.inputView}
        placeholder="Password."
        placeholderTextColor="#003f5c"
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.loginBtn} onPress={handleSignInPress}>
        <Text>เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Authenticate;