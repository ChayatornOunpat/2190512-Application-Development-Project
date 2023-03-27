import React, {useState} from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {styles} from "./styles";
import {
    getDownloadURL,
    ref,
} from "firebase/storage";
import {storage} from "./firebase-config";
import {auth} from './firebase-config';
import {signInWithEmailAndPassword, signOut} from "firebase/auth";
import * as XLSX from 'xlsx';


export default function Download({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const plateNums = ['นย7768', 'อว2446', 'ตม6547']
    const topics = [
        'พรบ',
        'ภาษี',
        'ประกันภัย',
        'พาสสปอร์ตข้ามแดน',
        'ไฟหน้ารถ',
        'ไฟหรี่ไฟเลี้ยว',
        'ไฟหลังคา',
        'ระดับน้ำมันเครื่อง',
        'น้ำหล่อเย็นหม้อน้ำ',
        'ระบบปัดน้ำฝน',
        'ชื่อประกอบการ',
        'กระจกมองข้าง',
        'สภาพยางหน้า',
        'สภาพยางเพลาที่ 1',
        'สภาพยางเพลาที่ 2',
        'สภาพยางเพลาที่ 3',
        'สภาพยางเพลาที่ 4',
        'สภาพยางอะหลัย',
        'แรงดันลมยาง',
        'ถังดับเพลิง',
        'หมอนหนุนล้อ',
        'กรวยจราจร',
        'ไฟเบรก',
        'ไฟถอย',
        'ไฟเลี้ยว ไฟหรี่ ท้าย',
        'ความมั่งคงแข็งแรง',
        'อุปกรณ์ผูกรัดติดตรึง',
        'ผ้าใบปิดคลุม'
    ];
    const standards = [
        'ไม่หมดอายุ',
        'ไม่หมดอายุ',
        'ไม่หมดอายุ',
        'ไม่หมดอายุ',
        'ติดครบและส่องสว่าง',
        'ติดครบและส่องสว่าง',
        'ติดครบและส่องสว่าง',
        'ระดับสูงสุด MAX',
        'ระดับสูงสุด MAX',
        'ระดับสูงสุด MAX',
        'ติดครบไม่ชำรุด',
        'ครบไม่แตกร้าว',
        'ความลึก > 5 มม',
        'ความลึก > 3 มม.',
        'ความลึก > 3 มม.',
        'ความลึก > 3 มม.',
        'ความลึก > 3 มม.',
        'มีพร้อมใช้งาน',
        '130 ปอนด์',
        'จํานวน 2 ถังถังละ 6 กก.',
        'จํานวน 2 อัน',
        'จํานวน 2 อัน',
        'ติดครบและส่องสว่าง',
        'ติดครบและส่องสว่าง',
        'ติดครบและส่องสว่าง',
        '',
        '',
        ''
    ];

    const handleDownloadPress = async () => {
        let signedIn = false;
        let dateStr = new Date().toISOString().slice(0, 10);
        var datas = await downloadData(dateStr);
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                    const user = userCredential.user;
                    var workbook = XLSX.utils.book_new();
                    for (let data of datas) {
                        const dataRow = [];
                        for (let i in topics) {
                            const row = [];
                            row.push(topics[i], standards[i], data[i]);
                            dataRow.push(row);
                        }
                        var sheetName = data[data.length - 1];
                        workbook.SheetNames.push(sheetName);
                        var worksheet = XLSX.utils.aoa_to_sheet(dataRow);
                        workbook.Sheets[sheetName] = worksheet;
                        XLSX.writeFile(workbook, `${dateStr}.xlsx`);
                        //TODO: test sign out errors
                        signOut(auth)
                            .then(() => {
                                signedIn = false
                                navigation.navigate('Primary');
                            })
                            .catch(error => alert(error.message));
                    }
                }
            ).catch(error => {
            alert(error.message);
            navigation.navigate('Primary');
        });
    }


    async function downloadData(date) {
        const datas = [];
        for (let plateNum of plateNums) {
            let fileRef = ref(storage, `${plateNum}_${date}.json`);
            try {
                const fileSnapshot = await getDownloadURL(fileRef);
                const fileURL = fileSnapshot.toString();
                const response = await fetch(fileURL);
                const blob = await response.blob();
                const arrayBuffer = await new Response(blob).arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const textDecoder = new TextDecoder();
                const jsonString = textDecoder.decode(uint8Array);
                const data = JSON.parse(jsonString);
                const values = [];
                for (let value of Object.values(data)) {
                    values.push(value.toString().toLowerCase() === "true" ? "✓" : "X");
                }
                values.push(plateNum);
                datas.push(values);
            } catch (error) {
                alert(error);
            }
        }
        return datas;
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

export {Download}