import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 16,
        paddingTop: 10,
    },
    buttonContainer: {
        alignContent: "center",
        marginBottom: 20,
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10,
        flex: 1,
        borderRadius: 5,
    },
    wrapper: {
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        paddingVertical: 15,
    },
    checkbox: {
        marginLeft: 10,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'center',
        width: 35,
        height: 35,
    },
    text: {
        lineHeight: 30,
        fontSize: 20,
    },
});


export { styles }