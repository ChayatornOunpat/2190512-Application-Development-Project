import {
    View,
    Text,
    TouchableWithoutFeedback,
    TextInput
} from "react-native";
import {styles} from "./styles";
import {CheckBox} from 'react-native-elements';


function CheckBoxWrapper({label, value, setValue, note, setNote, fix, setFix}) {
    const handlePress = () => {
        setValue(!value);
        setNote('');
        setFix('');
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
                                style={[styles.checkbox, value && styles.checked]}
                                checked={value}
                                onPress={handlePress}
                                checkedColor="#000000"
                                uncheckedColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            {!value && (
                <View>
                    <TextInput
                        style={styles.noteAndFix}
                        placeholder="Note"
                        onChangeText={text => setNote(text)}
                        value={note}
                    />
                    <TextInput
                        style={styles.noteAndFix}
                        placeholder="Fix"
                        onChangeText={text => setFix(text)}
                        value={fix}
                    />
                </View>
            )}
        </View>
    );
}


export {CheckBoxWrapper}