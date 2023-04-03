import React, {useState} from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {styles} from "./styles";
import SearchableDropdownWrapper from "./dropdown";
import {
    getDownloadURL,
    ref,
} from "firebase/storage";
import {storage} from "./firebase-config";
import {auth} from './firebase-config';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const ExcelJS = require('exceljs');

const cellOf = {
    "law": "D5", "law_note": "E5", "law_fix": "F5",
    "tax": "D6", "tax_note": "E6", "tax_fix": "F6",
    "insurance": "D7", "insurance_note": "E7", "insurance_fix": "F7",
    "passport": "D8", "passport_note": "E8", "passport_fix": "F8",
    "headlight": "D9", "headlight_note": "E9", "headlight_fix": "F9",
    "turnlight": "D10", "turnlight_note": "E10", "turnlight_fix": "F10",
    "toplight": "D11", "toplight_note": "E11", "toplight_fix": "F11",
    "lubeoil": "D12", "lubeoil_note": "E12", "lubeoil_fix": "F12",
    "tankcoolant": "D13", "tankcoolant_note": "E13", "tankcoolant_fix": "F13",
    "percipitation": "D14", "percipitation_note": "E14", "percipitation_fix": "F14",
    "opsname": "D15", "opsname_note": "E15", "opsname_fix": "F15",
    "doormirror": "D16", "doormirror_note": "E16", "doormirror_fix": "F16",
    "tire": "D17", "tire_note": "E17", "tire_fix": "F17",
    "tirehub": "D18", "tirehub_note": "E18", "tirehub_fix": "F18",
    "tirehub2": "D19", "tirehub2_note": "E19", "tirehub2_fix": "F19",
    "tirehub3": "D20", "tirehub3_note": "E20", "tirehub3_fix": "F20",
    "tirehub4": "D21", "tirehub4_note": "E21", "tirehub4_fix": "F21",
    "spare": "D22", "spare_note": "E22", "spare_fix": "F22",
    "pressure": "D23", "pressure_note": "E23", "pressure_fix": "F23",
    "extinguisher": "D24", "extinguisher_note": "E24", "extinguisher_fix": "F24",
    "tiresupport": "D25", "tiresupport_note": "E25", "tiresupport_fix": "F25",
    "cone": "D26", "cone_note": "E26", "cone_fix": "F26",
    "breaklight": "D27", "breaklight_note": "E27", "breaklight_fix": "F27",
    "reverselight": "D28", "reverselight_note": "E28", "reverselight_fix": "F28",
    "backturnlight": "D29", "backturnlight_note": "E29", "backturnlight_fix": "F29",
    "structuralintegrity": "D34", "structuralintegrity_note": "E34", "structuralintegrity_fix": "F34",
    "fastener": "D35", "fastener_note": "E35", "fastener_fix": "F35",
    "cover": "D36", "cover_note": "E36", "cover_fix": "F36"
}

export default function Download({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [plate, setPlate] = useState('');
    const plateNums = ['นย7768', 'อว2446', 'ตม6547'];

    const handleDownloadPress = async () => {
        let dateStr = new Date().toISOString().slice(0, 10);
        var datas = await downloadData(dateStr);
        signInWithEmailAndPassword(auth, email, password).then(async userCredential => {
            let fileRef = ref(storage, `DatabaseTemplate.xlsx`);
            var buffer;
            try {
                const fileSnapshot = await getDownloadURL(fileRef);
                const fileURL = fileSnapshot.toString();
                const response = await fetch(fileURL);
                buffer = await response.arrayBuffer();
            } catch (error) {
                alert(error);
            }
            for (let data of datas) {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                const sheet = workbook.getWorksheet("แบบตรวจสอบรถก่อนเดินทาง");
                for (let key of Object.keys(data)) {
                    if (data.hasOwnProperty(key) && key != "plate") {
                        const value = data[key];
                        sheet.getCell(cellOf[key]).value = typeof value === "boolean" ? value.toString().toLowerCase() === "true" ? "✓" : "X" : !value ? "-" : value;
                    }
                }
                const plateNum = data["plate"];
                workbook.xlsx.writeBuffer({ base64: true })
                    .then(function (xls64) {
                        var a = document.createElement("a");
                        var data = new Blob([xls64], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                        var url = URL.createObjectURL(data);
                        a.href = url;
                        a.download = `${plateNum}_${dateStr}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(function () {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        },
                            0);
                    })
                    .catch(function (error) {
                        console.log(error.message);
                    });
            }

            //TODO: test sign out errors
            signOut(auth)
                .then(() => navigation.navigate('Primary')
                .catch(error => alert(error.message)));
        }).catch(error => {
            alert(error.message);
            navigation.navigate('Primary');
        });
    }

    function handleReturnPress(){
        navigation.navigate('Primary');
    }

    async function downloadData(date) {
        var datas = [];
        for (let plateNum of plateNums) {
            let fileRef = ref(storage, `${plateNum}_${date}.json`);
            const fileSnapshot = await getDownloadURL(fileRef);
            const fileURL = fileSnapshot.toString();
            const response = await fetch(fileURL);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const textDecoder = new TextDecoder();
            const jsonString = textDecoder.decode(uint8Array);
            datas.push(JSON.parse(jsonString));
        }
        return datas;
    }

    return (
        <View style={styles.dlContainer}>
            <TextInput
                style={[styles.inputView, {marginTop: '25%' }]}
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
            <SearchableDropdownWrapper style={styles.searchAbsolute} onItemSelect={setPlate} options={plateNums}/>
            <TouchableOpacity style={styles.loginBtn} onPress={handleDownloadPress}>
                <Text>Authenticate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn} onPress={handleReturnPress}>
                <Text>Return</Text>
            </TouchableOpacity>
        </View>
    );
}

export {Download}