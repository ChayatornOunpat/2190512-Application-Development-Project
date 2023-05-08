import React, {useEffect, useState} from "react";
import {FlatList, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {Picker} from '@react-native-picker/picker';
import {styles} from "./styles";
import {createElement} from 'react-native-web';
import {getDownloadURL, ref} from "firebase/storage";
import {db, rtdb, storage} from "./firebase-config";
import * as DocumentPicker from 'expo-document-picker';
import * as ExcelJS from "exceljs";
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {onValue, ref as rtref, get} from "firebase/database";

const borderStyle = {
    top: {style: "thin", color: {argb: 'FF000000'}},
    left: {style: "thin", color: {argb: 'FF000000'}},
    bottom: {style: "thin", color: {argb: 'FF000000'}},
    right: {style: "thin", color: {argb: 'FF000000'}}
}
const cellTextAlignment = {
    vertical: 'middle',
    horizontal: 'center'
};
const month = {
    "Jan": "01",
    "Feb": "02",
    "Mar": "03",
    "Apr": "04",
    "May": "05",
    "Jun": "06",
    "Jul": "07",
    "Aug": "08",
    "Sep": "09",
    "Oct": "10",
    "Nov": "11",
    "Dec": "12"
}
const carDataKeys = {
    "plate": "A",
    "date": "B",
    "name": "C",
    "law": "D",
    "tax": "E",
    "insurance": "F",
    "passport": "G",
    "headlight": "H",
    "turnlight": "I",
    "toplight": "J",
    "lubeoil": "K",
    "tankcoolant": "L",
    "percipitation": "M",
    "opsname": "N",
    "doormirror": "O",
    "tire": "P",
    "tirehub": "Q",
    "tirehub2": "R",
    "tirehub3": "S",
    "tirehub4": "T",
    "spare": "U",
    "pressure": "V",
    "extinguisher": "W",
    "tiresupport": "X",
    "cone": "Y",
    "breaklight": "Z",
    "reverselight": "AA",
    "backturnlight": "AB"
}
const MyWebDatePicker = ({date, setDate}) => {
    return createElement('input', {
        type: 'date',
        value: date.toISOString().split("T")[0],
        onChange: (event) => {
            setDate(new Date(event.target.value));
        },
        style: {height: 30, padding: 5, border: "2px solid #677788", borderRadius: 5, width: 250, marginBottom: 10}
    })
}

export default function Admin({navigation}) {
    const currentDate = new Date();
    const [date, setDate] = useState(new Date(currentDate.getTime()));
    const [endDate, setEndDate] = useState(new Date(currentDate.getTime()));
    const [plate, setPlate] = useState('ทั้งหมด');
    const [plateNums, setPlateNums] = useState([]);
    const [plateSelect, setPlateSelect] = useState([]);
    const [query, setQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(plateSelect);
    const [mode, setMode] = useState('byDate');
    const [selected, setSelected] = useState(false)

    function readDataFromFirestore(key, documentRef) {
        return getDoc(documentRef).then((documentSnapshot) => {
            if (documentSnapshot.exists()) {
                const data = documentSnapshot.data();
                return data[key];
            } else {
                return null;
            }
        });
    }

    useEffect(() => {
        const documentRef = doc(db, 'plates', 'plates');
        readDataFromFirestore('plates', documentRef).then((data) => {
            setPlateNums(data)
            setPlateSelect(['ทั้งหมด', ...data]);
        })
    }, []);

    useEffect(() => {
        setFilteredOptions(
            plateSelect.filter((option) =>
                option.toLowerCase().includes(query.toLowerCase())
            )
        );
    }, [query, plateSelect]);

    const handleItemSelect = (item) => {
        setPlate(item);
        setQuery(item.toString());
        setSelected(true)
    };

    const pickDocument = async () => {
        try {
            try {
                const result = await DocumentPicker.getDocumentAsync();
                const response = await fetch(result.uri);
                const buffer = await response.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                var plateList;
                await workbook.xlsx.load(buffer)
                    .then(() => {
                        const worksheet = workbook.getWorksheet('Sheet1');
                        const column = worksheet.getColumn('A');
                        const values = column.values;
                        values.shift();
                        plateList = values
                    });
                const adminDocRef = doc(db, 'plates', 'plates')
                getDoc(adminDocRef).then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        updateDoc(adminDocRef, {
                            'plates': plateList
                        })
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert(`เกิดปัญหาในการอัปโหลด: ${error}`);
                            });
                    } else {
                        setDoc(adminDocRef, {
                            'plates': plateList
                        })
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert(`เกิดปัญหาในการอัปโหลด: ${error}`);
                            });
                    }
                }).catch((error) => {
                    alert(`เกิดปัญหาในการอัปโหลด: ${error}`);
                });
            } catch (error) {
                alert(`เกิดปัญหาในการอัปโหลด: ${error.message}`);
            }
        } catch (error) {
            alert(`เกิดปัญหาในการอัปโหลด: ${error}`);
        }
    };

    async function downloadFile(fileRef) {
        try {
            const fileSnapshot = await getDownloadURL(fileRef);
            const fileURL = fileSnapshot.toString();
            const response = await fetch(fileURL);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const textDecoder = new TextDecoder();
            const jsonString = textDecoder.decode(uint8Array);
            return JSON.parse(jsonString);
        } catch (e) {
            return null;
        }
    }

    async function downloadData(date, plateNum, count, fileName) {
        const name = fileName === "" || fileName === null ? "" : `_${fileName}`
        let fileRef = ref(storage, `${plateNum}_${date}_${count}${name}.json`);
        return await downloadFile(fileRef)
    }

    function getDateStringArray(startDate, endDate) {
        const dateArray = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dateArray.push(currentDate.toISOString().slice(0, 10));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
    }

    var carDataRow;
    var travelDataRow;

    const handleDownloadPress = async () => {
        let fileRef = ref(storage, `DatabaseTemplate.xlsx`);
        var buffer;
        try {
            const fileSnapshot = await getDownloadURL(fileRef);
            const fileURL = fileSnapshot.toString();
            const response = await fetch(fileURL);
            buffer = await response.arrayBuffer();
        } catch (error) {
            alert(error);
            return
        }
        const dateStr = formatDate(date);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const carDataSheet = workbook.getWorksheet("รายงานการตรวจสภาพรถ");
        const travelDataSheet = workbook.getWorksheet("รายงานการเดินทาง");
        carDataRow = 5;
        travelDataRow = 3;
        if (plate === 'ทั้งหมด') {
            for (let plateNum of plateNums) {
                await writeDataToWorkbook(carDataSheet, travelDataSheet, plateNum, dateStr);
            }
        } else {
            if (mode === "byPlate") {
                const dateList = getDateStringArray(new Date(dateStr), new Date(formatDate(endDate)))
                for (let day of dateList) {
                    await writeDataToWorkbook(carDataSheet, travelDataSheet, plate, day);
                }
            } else {
                await writeDataToWorkbook(carDataSheet, travelDataSheet, plate, dateStr);
            }
        }
        fitCellWithContent(carDataSheet);
        fitCellWithContent(travelDataSheet);
        downloadAsXlsx(workbook, plate, dateStr);
    }

    async function writeDataToWorkbook(carDataSheet, travelDataSheet, plate, dateStr) {
        const snapshot = await get(rtref(rtdb, `usage/${plate}/${dateStr}`));
        const count = await snapshot.val();
        for (let i = 1; i <= count; i++, carDataRow++, travelDataRow++) {
            let data = await downloadData(dateStr, plate, i, "")
            await writeCarData(carDataSheet, data, carDataRow);
            await writeTravelData(travelDataSheet, data, travelDataRow, dateStr, plate, i);
            console.log(`Finished writing ${plate}(${i})'s data.`);
        }
    }

    function downloadAsXlsx(workbook, plateNum, date) {
        workbook.xlsx.writeBuffer({base64: true})
            .then(function (xls64) {
                var a = document.createElement("a");
                var data = new Blob([xls64], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                var url = URL.createObjectURL(data);
                a.href = url;
                a.download = `${plateNum}_${date}.xlsx`;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            })
            .catch(function (error) {
                console.log(error.message);
            });
    }

    async function writeCarData(sheet, data, row) {
        for (var key of Object.keys(data)) {
            if (carDataKeys.hasOwnProperty(key)) {
                const col = carDataKeys[key]
                const cell = sheet.getCell(`${col}${row}`);
                cell.border = borderStyle;
                cell.alignment = cellTextAlignment;
                const value = data[key];
                cell.value = typeof value === "boolean" ? value.toString().toLowerCase() === "true" ? "✓" : "X" : !value ? "-" : value;
            }
        }
    }

    async function writeTravelData(sheet, data, row, dateStr, plateNum, count) {
        let restOne = await downloadData(dateStr, plateNum, count, "rest1");
        let restOneExit = await downloadData(dateStr, plateNum, count, "passRest1");
        let restOneTime
        if (restOne) {
            restOneTime = restOne["time"].split(' ');
        }
        let destination = await downloadData(dateStr, plateNum, count, "destination");
        let destinationExit = await downloadData(dateStr, plateNum, count, "passDestination");
        let destinationTime = destination["time"].split(' ');
        let restTwo = await downloadData(dateStr, plateNum, count, "rest2");
        let restTwoExit = await downloadData(dateStr, plateNum, count, "passRest2");
        let restTwoTime
        if (restTwo) {
            restTwoTime = restTwo["time"].split(' ');
        }
        let end = await downloadData(dateStr, plateNum, count, "end");
        let endTime = end["time"].split(' ');
        console.log(restOne, restOneExit, restTwoExit, restTwo, destinationExit, destination, end)
        let cellDatas = {
            "A": data["date"],
            "B": data["plate"],
            "C": data["mile"],
            "D": data["name"],
            "E": data["alcohol"].toString().toLowerCase() === "true" ? "✓" : "X",
            "F": data["drug"].toString().toLowerCase() === "true" ? "✓" : "X",
            "G": data["startLocation"],
            "H": restOne["location"],
            "I": restOneTime[0],
            "J": restOneTime[1],
            "K": restOneExit["time"].split(' ')[1],
            "L": destination["location"],
            "M": destinationTime[0],
            "N": destinationTime[1],
            "O": destinationExit["time"].split(' ')[1],
            "P": restTwo ? restTwo["location"] : "-",
            "Q": restTwo ? restTwoTime[0] : "-",
            "R": restTwo ? restTwoTime[1] : "-",
            "S": restTwoExit ? restTwoExit["time"].split(' ')[1] : "-",
            "T": end["location"],
            "U": endTime[0],
            "V": endTime[1]
        }
        for (let col of Object.keys(cellDatas)) {
            const cell = sheet.getCell(`${col}${row}`);
            cell.value = cellDatas[col];
            cell.border = borderStyle;
            cell.alignment = cellTextAlignment;
        }
    }

    function fitCellWithContent(sheet) {
        for (let i = 0; i < sheet.columns.length; i++) {
            let dataMax = 0;
            const column = sheet.columns[i];
            for (let j = 1; j < column.values.length; j++) {
                if (!column.values[j]) continue;
                const columnLength = column.values[j].length;
                if (columnLength > dataMax) {
                    dataMax = columnLength;
                }
            }
            column.width = dataMax < 10 ? 10 : dataMax;
        }
    }

    function handleSetMode(mode) {
        setMode(mode);
        if (mode === 'byPlate') {
            setPlateSelect(plateNums);
            setFilteredOptions(
                plateSelect.filter((option) =>
                    option.toLowerCase().includes(query.toLowerCase())
                )
            );
        } else {
            setPlateSelect(['ทั้งหมด', ...plateNums]);
            setFilteredOptions(
                plateSelect.filter((option) =>
                    option.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    }

    function formatDate(dateToFormat) {
        var split = dateToFormat.toString().split(" ");
        return `${split[3]}-${month[split[1]]}-${split[2]}`;
    }

    function returnPress() {
        navigation.navigate('Primary')
    }

    return (
        <View style={styles.dlContainer}>
            <View style={styles.searchAbsolute}>
                <TextInput
                    style={styles.input}
                    value={query}
                    placeholder="ค้นหา"
                    onChangeText={(text) => {
                        setQuery(text);
                        setSelected(false)
                    }}
                />
                {filteredOptions.length > 0 && !selected && (
                    <FlatList
                        data={filteredOptions}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => handleItemSelect(item)}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item}
                        style={styles.list}
                    />
                )}
            </View>
            {mode === 'byPlate' && (
                <div style={
                    {
                        color: "#FFF",
                        textAlign: "center"
                    }
                }>
                    วันที่
                </div>
            )}
            <MyWebDatePicker
                date={date}
                setDate={setDate}
            />
            {mode === 'byPlate' && (
                <div style={
                    {
                        color: "#FFF",
                        textAlign: "center"
                    }
                }>
                    ถึงวันที่
                    <br />
                    <MyWebDatePicker
                        date={endDate}
                        setDate={setEndDate}
                    />
                </div>
            )}
            <Picker
                style={styles.selector}
                selectedValue={mode}
                onValueChange={(itemValue, itemIndex) =>
                    handleSetMode(itemValue)
                }>
                <Picker.Item label="ตามวันที่" value="byDate"/>
                <Picker.Item label="ตามทะเบียน" value="byPlate"/>
            </Picker>
            <TouchableOpacity style={styles.loginBtn} onPress={handleDownloadPress}>
                <Text>ดาวน์โหลด</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restBtn} onPress={returnPress}>
                <Text>ย้อนกลับ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restBtn} onPress={pickDocument}>
                <Text>อัปโหลดรายการเทียนรถ</Text>
            </TouchableOpacity>
        </View>
    );
}