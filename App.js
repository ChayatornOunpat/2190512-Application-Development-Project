import React, { useState } from "react";
import { View, StyleSheet, Text, Button, Platform, TouchableOpacity } from "react-native";
import CheckBox from "expo-checkbox";

export default function App() {
  const [agree, setAgree] = useState(false);

  
  function handlePress() {
    if (agree) {
      alert("submitted");
    } else {
      alert("not submitted");
    }
  }

  
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <CheckBox
          value={agree}
          onValueChange={() => setAgree(!agree)}
          color={agree ? "#4630EB" : undefined}
        />
        <Text style={styles.text}>
          I have read and agreed with the terms and conditions
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
    paddingTop: 100,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  wrapper: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    paddingVertical: 15,
  },
  text: {
    lineHeight: 30,
    marginLeft: 10,
  },
});