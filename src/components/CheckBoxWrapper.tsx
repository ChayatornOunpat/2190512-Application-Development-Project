import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { CheckBox } from 'react-native-elements';

import { styles } from '../styles';

type Setter<T> = (value: T) => void;

type Props = {
  label: string;
  value: boolean;
  setValue: Setter<boolean>;
  note?: string;
  setNote?: Setter<string>;
  fix?: string;
  setFix?: Setter<string>;
};

export function CheckBoxWrapper({
  label,
  value,
  setValue,
  note,
  setNote,
  fix: _fix,
  setFix,
}: Props) {
  const handlePress = () => {
    setValue(!value);
    if (note !== undefined && setNote && setFix) {
      setNote('');
      setFix('');
    }
  };

  return (
    <View style={styles.overWrapper}>
      <View style={styles.color}></View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>{label}</Text>
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.circle}>
            <View style={styles.checkboxView}>
              <CheckBox
                containerStyle={styles.checkbox}
                checked={value}
                onPress={handlePress}
                checkedColor="#000000"
                uncheckedColor="#FFFFFF"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}
