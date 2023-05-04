import React, {useEffect, useState} from "react";
import {FlatList, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {styles} from "./styles";
import {createElement} from 'react-native-web';
import {getDownloadURL, ref} from "firebase/storage";
import {db, rtdb, storage} from "./firebase-config";
import * as DocumentPicker from 'expo-document-picker';
import * as ExcelJS from "exceljs";
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {onValue, ref as rtref, get} from "firebase/database";

const borderStyle = {
    top: { style: "thin", color: { argb: 'FF000000' } },
    left: { style: "thin", color: { argb: 'FF000000' } },
    bottom: { style: "thin", color: { argb: 'FF000000' } },
    right: { style: "thin", color: { argb: 'FF000000' } }
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
        style: {height: 30, padding: 5, border: "2px solid #677788", borderRadius: 5, width: 250}
    })
}

export default function Admin({navigation}) {
    const currentDate = new Date();
    const [date, setDate] = useState(new Date(currentDate.getTime()));
    const [plate, setPlate] = useState('all');
    const [plateNums, setPlateNums] = useState([]);
    const [plateSelect, setPlateSelect] = useState([]);
    const [query, setQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(plateSelect);
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
            setPlateSelect([...data, 'all']);
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
                        // Get the worksheet you want to read data from
                        const worksheet = workbook.getWorksheet('Sheet1');

                        // Get the column by its header name (e.g. 'A', 'B', 'C', etc.) or index (1, 2, 3, etc.)
                        const column = worksheet.getColumn('A');

                        // Get an array of values in the column
                        const values = column.values;

                        // Remove the first element (which is the column header)
                        values.shift();

                        plateList = values // Output the values in the column
                    });
                const adminDocRef = doc(db, 'plates', 'plates')
                getDoc(adminDocRef).then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        // Update the document if it exists
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

        async function inner(count) {
            let data = await downloadData(dateStr, plate, count, "")
            console.log(data, end, destination, destinationExit, restOne, restOneExit, restTwo, restTwoExit, count);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            const carDataSheet = workbook.getWorksheet("รายงานการตรวจสภาพรถ");
            const travelDataSheet = workbook.getWorksheet("รายงานการเดินทาง");
            for (var key of Object.keys(data)) {
                if (carDataKeys.hasOwnProperty(key)) {
                    const col = carDataKeys[key]
                    const cell = carDataSheet.getCell(`${col}5`);
                    cell.border = borderStyle;
                    cell.alignment = cellTextAlignment;
                    const value = data[key];
                    cell.value = typeof value === "boolean" ? value.toString().toLowerCase() === "true" ? "✓" : "X" : !value ? "-" : value;
                }
            }

            travelDataSheet.getCell(`A3`).value = data["date"];
            travelDataSheet.getCell(`B3`).value = data["plate"];
            travelDataSheet.getCell(`D3`).value = data["name"];
            travelDataSheet.getCell(`G3`).value = data["startLocation"];

            let restOne = await downloadData(dateStr, plate, count, "rest1");
            let restOneExit = await downloadData(dateStr, plate, count, "passRest1");
            let restOneTime = restOne["time"].split(' ');
            travelDataSheet.getCell(`I3`).value = restOne["location"];
            travelDataSheet.getCell(`J3`).value = restOneTime[0];
            travelDataSheet.getCell(`K3`).value = restOneTime[1];
            travelDataSheet.getCell(`L3`).value = restOneExit["time"].split(' ')[1];

            let destination = await downloadData(dateStr, plate, count, "destination");
            travelDataSheet.getCell(`H3`).value = destination["location"];
            let destinationExit = await downloadData(dateStr, plate, count, "passDestination");
            let destinationTime = destination["time"].split(' ');
            travelDataSheet.getCell(`M3`).value = destination["location"];
            travelDataSheet.getCell(`N3`).value = destinationTime[0];
            travelDataSheet.getCell(`O3`).value = destinationTime[1];
            travelDataSheet.getCell(`P3`).value = destinationExit["time"].split(' ')[1];

            let restTwo = await downloadData(dateStr, plate, count, "rest2");
            let restTwoExit = await downloadData(dateStr, plate, count, "passRest2");
            let restTwoTime = restTwo["time"].split(' ');
            travelDataSheet.getCell(`Q3`).value = restTwo["location"];
            travelDataSheet.getCell(`R3`).value = restTwoTime[0];
            travelDataSheet.getCell(`S3`).value = restTwoTime[1];
            travelDataSheet.getCell(`T3`).value = restTwoExit["time"].split(' ')[1];

            let end = await downloadData(dateStr, plate, count, "end");
            travelDataSheet.getCell(`U3`).value = end["location"];
            let endTime = end["time"].split(' ');
            travelDataSheet.getCell(`V3`).value = endTime[0];
            travelDataSheet.getCell(`W3`).value = endTime[1];

            fitCellWithContent(carDataSheet);
            fitCellWithContent(travelDataSheet);
            workbook.xlsx.writeBuffer({base64: true})
                .then(function (xls64) {
                    var a = document.createElement("a");
                    var data = new Blob([xls64], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                    var url = URL.createObjectURL(data);
                    a.href = url;
                    a.download = `${data["plate"]}_${dateStr}.xlsx`;
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
        if (plate === 'all') {
            //Not todo anymore : apply the multiple drive per day to this as well
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            const carDataSheet = workbook.getWorksheet("รายงานการตรวจสภาพรถ");
            const travelDataSheet = workbook.getWorksheet("รายงานการเดินทาง");
            var carDataRow = 5;
            var travelDataRow = 3;
            for (let plateNum of plateNums) {
                const snapshot = await get(rtref(rtdb, `usage/${plateNum}`));
                const count = await snapshot.val();
                for (let i = 1; i <= count; i++) {
                    let data = await downloadData(dateStr, plateNum, i, "")
                    for (var key of Object.keys(data)) {
                        if (carDataKeys.hasOwnProperty(key)) {
                            const col = carDataKeys[key]
                            const cell = carDataSheet.getCell(`${col}${carDataRow}`);
                            cell.border = borderStyle;
                            cell.alignment = cellTextAlignment;
                            const value = data[key];
                            cell.value = typeof value === "boolean" ? value.toString().toLowerCase() === "true" ? "✓" : "X" : !value ? "-" : value;
                        }
                    }

                    travelDataSheet.getCell(`A${travelDataRow}`).value = data["date"];
                    travelDataSheet.getCell(`B${travelDataRow}`).value = data["plate"];
                    travelDataSheet.getCell(`D${travelDataRow}`).value = data["name"];
                    travelDataSheet.getCell(`G${travelDataRow}`).value = data["startLocation"];

                    let restOne = await downloadData(dateStr, plateNum, i, "rest1");
                    let restOneExit = await downloadData(dateStr, plateNum, i, "passRest1");
                    let restOneTime = restOne["time"].split(' ');
                    travelDataSheet.getCell(`I${travelDataRow}`).value = restOne["location"];
                    travelDataSheet.getCell(`J${travelDataRow}`).value = restOneTime[0];
                    travelDataSheet.getCell(`K${travelDataRow}`).value = restOneTime[1];
                    travelDataSheet.getCell(`L${travelDataRow}`).value = restOneExit["time"].split(' ')[1];

                    let destination = await downloadData(dateStr, plateNum, i, "destination");
                    travelDataSheet.getCell(`H${travelDataRow}`).value = destination["location"];
                    let destinationExit = await downloadData(dateStr, plateNum, i, "passDestination");
                    let destinationTime = destination["time"].split(' ');
                    travelDataSheet.getCell(`M${travelDataRow}`).value = destination["location"];
                    travelDataSheet.getCell(`N${travelDataRow}`).value = destinationTime[0];
                    travelDataSheet.getCell(`O${travelDataRow}`).value = destinationTime[1];
                    travelDataSheet.getCell(`P${travelDataRow}`).value = destinationExit["time"].split(' ')[1];

                    let restTwo = await downloadData(dateStr, plateNum, i, "rest2");
                    let restTwoExit = await downloadData(dateStr, plateNum, i, "passRest2");
                    let restTwoTime = restTwo["time"].split(' ');
                    travelDataSheet.getCell(`Q${travelDataRow}`).value = restTwo["location"];
                    travelDataSheet.getCell(`R${travelDataRow}`).value = restTwoTime[0];
                    travelDataSheet.getCell(`S${travelDataRow}`).value = restTwoTime[1];
                    travelDataSheet.getCell(`T${travelDataRow}`).value = restTwoExit["time"].split(' ')[1];

                    let end = await downloadData(dateStr, plateNum, i, "end");
                    travelDataSheet.getCell(`U${travelDataRow}`).value = end["location"];
                    let endTime = end["time"].split(' ');
                    travelDataSheet.getCell(`V${travelDataRow}`).value = endTime[0];
                    travelDataSheet.getCell(`W${travelDataRow}`).value = endTime[1];

                    console.log(`Finished writing ${plateNum}(${i})'s data.`);
                    carDataRow++;
                    travelDataRow++;
                }
            }
            fitCellWithContent(carDataSheet);
            fitCellWithContent(travelDataSheet);
            workbook.xlsx.writeBuffer({ base64: true })
                .then(function (xls64) {
                    var a = document.createElement("a");
                    var data = new Blob([xls64], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    var url = URL.createObjectURL(data);
                    a.href = url;
                    a.download = `All_${dateStr}.xlsx`;
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
        } else {
            const countRef = rtref(rtdb, `usage/${plate}`)
            let unsubscribe = onValue(countRef, (countSnapshot) => {
                unsubscribe()
                let count = countSnapshot.val()
                for (let i = 1; i <= count; i++) {
                    inner(i)
                }
            });
        }
    }

    function fitCellWithContent(sheet) {
        for (let i = 0; i < sheet.columns.length; i += 1) {
            let dataMax = 0;
            const column = sheet.columns[i];
            column.eachCell({ includeEmpty: false }, function (cell, rowNumber) {
                if (!cell.value || cell.value === "") return;
                cell.border = borderStyle;
                cell.alignment = cellTextAlignment;
            });
            for (let j = 1; j < column.values.length; j += 1) {
                if (!column.values[j]) continue;
                const columnLength = column.values[j].length;
                if (columnLength > dataMax) {
                    dataMax = columnLength;
                }
            }
            column.width = dataMax < 10 ? 10 : dataMax;
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
                    onChangeText={(text) => {setQuery(text); setSelected(false)}}
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
            <MyWebDatePicker
                date={date}
                setDate={setDate}
            />
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