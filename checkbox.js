import React, {useState} from "react";
import {
    View,
    Text,
} from "react-native";
import CheckBox from "expo-checkbox";
import {styles} from "./styles";


function CheckBoxWrapper({label, value, setValue}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{label}</Text>
      <CheckBox
        style={styles.checkbox}
        value={value}
        onValueChange={() => setValue(!value)}
        color={value ? "#4630EB" : undefined}
      />
    </View>
  );
}


export {CheckBoxWrapper}