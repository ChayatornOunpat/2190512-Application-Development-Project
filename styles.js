import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#222222",
        display: "flex",
    },
    center: {
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonOne: {
        width: "90%",
        marginLeft: '5%',
        marginRight: '5%',
        height: 55,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        borderRadius: 5,
    },
    buttonRest: {
        width: "90%",
        height: 55,
        marginLeft: '5%',
        marginRight: '5%',
        marginTop: "25px",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DDDDDD",
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
    btnTxtView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnTxt: {
        textAlign: 'center',
    },
    search: {
        padding: 16,
        paddingTop: 10,
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        paddingVertical: 15,
        flex: 29,
        color: '#d2d2d2'
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#d2d2d2',
        color: '#000000'
    },
    list: {
        width: '80%',
        maxHeight: 200,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#d2d2d2'
    },
    item: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2f2f2f',
        backgroundColor: '#d2d2d2'

    },
    selectedItem: {
        marginTop: 10,
        fontWeight: 'bold',
    },
    inputView: {
        fontFamily: 'Noto',
        backgroundColor: '#d2d2d2',
        borderRadius: 30,
        width: "70%",
        textAlign: "center",
        height: 40,
        marginBottom: 20,
    },
    loginBtn: {
        width: '80%',
        borderRadius: 25,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        backgroundColor: '#d2d2d2',
    },
    dlContainer: {
        flex: 1,
        backgroundColor: "#222222",
        alignItems: "center",
        justifyContent: "center",
    },
    noteAndFix: {
        width: 280,
        height: 25,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 5,
        backgroundColor: '#696969',
        color: '#000000'
    },
    searchAbsolute: {
        alignSelf: "center",
        marginBottom: 25,
        width:"60%"
    },
});


export {styles}