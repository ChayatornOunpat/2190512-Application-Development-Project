import React, {useState} from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {styles} from "./styles";
import {auth} from './firebase-config';
import {signInWithEmailAndPassword} from "firebase/auth";

export default function Authenticate({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleDownloadPress = async () => {
        signInWithEmailAndPassword(auth, email, password).then(async userCredential => {
            navigation.navigate('Primary')
        }).catch(error => {
            alert(error.message);
        });
    }

    return (
        <View style={styles.dlContainer}>
            <TextInput
                style={styles.inputView}
                placeholder="Email."
                placeholderTextColor="#003f5c"
                onChangeText={(email) => setEmail(email)}
            />
            <TextInput
                style={styles.inputView}
                placeholder="Password."
                placeholderTextColor="#003f5c"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
            />
            <TouchableOpacity style={styles.loginBtn} onPress={handleDownloadPress}>
                <Text>Authenticate</Text>
            </TouchableOpacity>
        </View>
    );
}

export {Authenticate}