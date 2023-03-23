import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#222222"
    },
    buttonContainer: {
        alignContent: "center",
        marginBottom: 20,
    },
    button: {
        padding: 26,
        paddingTop: 10,
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        flex: 1,
        borderRadius: 5,
    },
    overWrapper: {
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
    },
    wrapper: {
        padding: 16,
        paddingTop: 10,
        marginBottom: 8,
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        paddingVertical: 15,
        flex: 9
    },
    checkbox: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'center',
        width: 35,
        height: 35,
    },
    text: {
        fontFamily: 'Noto',
        marginTop: 4,
        lineHeight: 30,
        fontSize: 20,
        color: '#FFFFFF'
    },
    color: {
        backgroundColor: '#959595',
        flex: 1,
    },
    circle: {
        position: 'absolute',
        right: 5,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 24,
        width: 40,
        height: 40,
        backgroundColor: '#35ff7a',
    },
    checked: {
        backgroundColor: '#000000',
    },
    checkboxView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
});


export {styles}