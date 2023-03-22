import React, {useState} from "react";
import {
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {CheckBoxWrapper} from "./checkbox";
import {styles} from "./styles";
import {storageRef, storage} from "./firebase-config";
import {
    getMetadata,
    uploadString,
    getDownloadURL,
    ref,
} from "firebase/storage";
import * as XLSX from 'xlsx';

export default function App() {
    const [law, setLaw] = useState(false);
    const [tax, setTax] = useState(false);
    const [insurance, setInsurance] = useState(false);
    const [passport, setPassport] = useState(false);
    const [headlight, setHeadlight] = useState(false);
    const [turnlight, setTurnlight] = useState(false);
    const [toplight, setToplight] = useState(false);
    const [lubeoil, setLubeoil] = useState(false);
    const [tankcoolant, setTankcoolant] = useState(false);
    const [percipitation, setPercipitation] = useState(false);
    const [opsname, setOpsname] = useState(false);
    const [doormirror, setDoormirror] = useState(false);
    const [tire, setTire] = useState(false);
    const [tirehub, setTirehub] = useState(false);
    const [tirehub2, setTirehub2] = useState(false);
    const [tirehub3, setTirehub3] = useState(false);
    const [tirehub4, setTirehub4] = useState(false);
    const [spare, setSpare] = useState(false);
    const [pressure, setPressure] = useState(false);
    const [extinguisher, setExtinguisher] = useState(false);
    const [tiresupport, setTiresupport] = useState(false);
    const [cone, setCone] = useState(false);
    const [breaklight, setBreaklight] = useState(false);
    const [reverselight, setReverselight] = useState(false);
    const [backturnlight, setBackturnlight] = useState(false);
    const [structuralintegrity, setStructuralintegrity] = useState(false);
    const [fastener, setFastener] = useState(false);
    const [cover, setCover] = useState(false);
    const [plate, setPlate] = useState('');

    const handleDownloadPress = async () => {
        let dateStr = new Date().toISOString().slice(0, 10);
        let fileRef = ref(storage, `${plate}_${dateStr}.json`);

        try {
            const fileSnapshot = await getDownloadURL(fileRef);
            const fileURL = fileSnapshot.toString();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', fileURL);
            xhr.responseType = 'blob';

            xhr.onload = () => {
                const blob = xhr.response;
                const reader = new FileReader();
                reader.readAsText(blob);
                reader.onloadend = () => {
                    const data = JSON.parse(reader.result);
                    const datas = []
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            var info = [key, data[key]]
                            datas.push(info)
                        }
                    }
                    var workbook = XLSX.utils.book_new(), worksheet = XLSX.utils.aoa_to_sheet(datas);
                    workbook.SheetNames.push("First");
                    workbook.Sheets["First"] = worksheet;
                    XLSX.writeFile(workbook, `${plate}_${dateStr}.xlsx`);
                };
            };

            xhr.send();
        } catch (error) {
            alert(error);
        }
    }

    function handleSubmitPress() {
        if (!plate) {
            alert("โปรดใส่ทะเบียนรถก่อนส่ง")
            return
        }

        let data = {
            'law': law,
            'tax': tax,
            'insurance': insurance,
            'passport': passport,
            'headlight': headlight,
            'turnlight': turnlight,
            'toplight': toplight,
            'lubeoil': lubeoil,
            'tankcoolant': tankcoolant,
            'percipitation': percipitation,
            'opsname': opsname,
            'doormirror': doormirror,
            'tire': tire,
            'tirehub': tirehub,
            'tirehub2': tirehub2,
            'tirehub3': tirehub3,
            'tirehub4': tirehub4,
            'spare': spare,
            'pressure': pressure,
            'extinguisher': extinguisher,
            'tiresupport': tiresupport,
            'cone': cone,
            'breaklight': breaklight,
            'reverselight': reverselight,
            'backturnlight': backturnlight,
            'structuralintegrity': structuralintegrity,
            'fastener': fastener,
            'cover': cover,
            'plate': plate
        }
        // Convert the data object to a JSON string
        let jsonData = JSON.stringify(data);

        // Get the current date as a string (e.g. "2023-03-15")
        let dateStr = new Date().toISOString().slice(0, 10);

        // Create a file reference for the current date
        let dataRef = ref(storageRef, `${plate}_${dateStr}.json`);

        // Check if a file with this name already exists
        getMetadata(dataRef)
            .then((metadata) => {
                // If the file exists, overwrite it with the new data
                uploadString(dataRef, jsonData)
                    .then(() => {
                        alert('Data uploaded successfully!');
                    })
                    .catch((error) => {
                        alert('Error uploading data:', error);
                    });
            })
            .catch((error) => {
                // If the file does not exist, create a new file with the data
                uploadString(dataRef, jsonData)
                    .then(() => {
                        alert('Data uploaded successfully!');
                    })
                    .catch((error) => {
                        alert('Error uploading data:', error);
                    });
            });
    }


    return (
        <ScrollView style={styles.container}>
            <CheckBoxWrapper label="พรบ: ไม่หมดอายุ" value={law} setValue={setLaw}/>
            <CheckBoxWrapper label="ภาษี: ไม่หมดอายุ" value={tax} setValue={setTax}/>
            <CheckBoxWrapper label="ประกันภัย: ไม่หมดอายุ" value={insurance} setValue={setInsurance} />
            <CheckBoxWrapper label="พาสสปอร์ตข้ามแดน: ไม่หมดอายุ" value={passport} setValue={setPassport} />
            <CheckBoxWrapper label="ไฟหน้ารถ: ติดครบและส่องสว่าง" value={headlight} setValue={setHeadlight} />
            <CheckBoxWrapper label="ไฟหรี่ไฟเลี้ยว: ติดครบและส่องสว่าง" value={turnlight} setValue={setTurnlight} />
            <CheckBoxWrapper label="ไฟหลังคา: ติดครบและส่องสว่าง" value={toplight} setValue={setToplight} />
            <CheckBoxWrapper label="ระดับน้ำมันเครื่อง: ระดับสูงสุด MAX" value={lubeoil} setValue={setLubeoil} />
            <CheckBoxWrapper label="น้ำหล่อเย็นหม้อน้ำ: ระดับสูงสุด MAX" value={tankcoolant} setValue={setTankcoolant} />
            <CheckBoxWrapper label="ระบบปัดน้ำฝน: ระดับสูงสุด MAX" value={percipitation} setValue={setPercipitation} />
            <CheckBoxWrapper label="ชื่อประกอบการ: ติดครบไม่ชำรุด" value={opsname} setValue={setOpsname}/>
            <CheckBoxWrapper label="กระจกมองข่าง: ครบไม่แตกร้าว" value={doormirror} setValue={setDoormirror}/>
            <CheckBoxWrapper label="สภาพยางหน้า: ความลึก > 5 มม" value={tire} setValue={setTire}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 1: ความลึก > 3 มม." value={tirehub} setValue={setTirehub}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 2: ความลึก > 3 มม." value={tirehub2} setValue={setTirehub2}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 3: ความลึก > 3 มม." value={tirehub3} setValue={setTirehub3}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 4: ความลึก > 3 มม." value={tirehub4} setValue={setTirehub4}/>
            <CheckBoxWrapper label="สภาพยางอะหลัย: มีพร้อมใช้งาน" value={spare} setValue={setSpare}/>
            <CheckBoxWrapper label="แรงดันลมยาง: 130 ปอนด์" value={pressure} setValue={setPressure}/>
            <CheckBoxWrapper label="ถังดับเพลิง: จํานวน 2 ถังถังละ 6 กก." value={extinguisher} setValue={setExtinguisher}/>
            <CheckBoxWrapper label="หมอนหนุนล้อ: จํานวน 2 อัน" value={tiresupport} setValue={setTiresupport}/>
            <CheckBoxWrapper label="กรวยจราจร: จํานวน 2 อัน" value={cone} setValue={setCone}/>
            <CheckBoxWrapper label="ไฟเบรก: ติดครบและส่องสว่าง" value={breaklight} setValue={setBreaklight}/>
            <CheckBoxWrapper label="ไฟถอย: ติดครบและส่องสว่าง" value={reverselight} setValue={setReverselight}/>
            <CheckBoxWrapper label="ไฟเลี้ยวไฟหรี่ท้าย: ติดครบและส่องสว่าง" value={backturnlight} setValue={setBackturnlight} />
            <CheckBoxWrapper label="ความมั่งคงแข็งแรง" value={structuralintegrity} setValue={setStructuralintegrity} />
            <CheckBoxWrapper label="ความมั่งคงแข็งแรง" value={fastener} setValue={setFastener} />
            <CheckBoxWrapper label="ผ้าใบปิดคลุม" value={cover} setValue={setCover} />
            <View style={styles.wrapper}>
                <TextInput
                    value={plate}
                    onChangeText={setPlate}
                    placeholder="ทะเบียนรถ"
                />
            </View>
            <View style={styles.wrapper}>
                <TouchableOpacity style={styles.button} onPress={handleSubmitPress}>
                    <Text>Submit</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.wrapper}>
                <TouchableOpacity style={styles.button} onPress={handleDownloadPress}>
                    <Text>Download</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
