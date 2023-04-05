import React, {useEffect, useState, useReducer} from "react";
import {
    Text,
    View,
    TouchableOpacity, TextInput, FlatList,
} from "react-native";
import {styles} from "./styles";
import {createElement} from 'react-native-web';
import {getDownloadURL, getMetadata, ref, uploadString} from "firebase/storage";
import {auth, storage, storageRef} from "./firebase-config";
import * as DocumentPicker from 'expo-document-picker';
import * as ExcelJS from "exceljs";

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
    const utcOffset = 7;
    const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
    const [date, setDate] = useState(new Date(currentDate.getTime()));
    const [plate, setPlate] = useState('all');
    const [plateNums, setPlateNums] = useState([]);
    const [plateSelect, setPlateSelect] = useState([]);
    const [query, setQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(plateSelect);

    useEffect(() => {
        let fileRef = ref(storage, `plates.json`);
        getDownloadURL(fileRef)
            .then(fileSnapshot => fileSnapshot.toString())
            .then(fileURL => fetch(fileURL))
            .then(response => response.blob())
            .then(blob => new Response(blob).arrayBuffer())
            .then(arrayBuffer => {
                const uint8Array = new Uint8Array(arrayBuffer);
                const textDecoder = new TextDecoder();
                const jsonString = textDecoder.decode(uint8Array);
                const data = JSON.parse(jsonString)
                setPlateNums(data['plates']);
                setPlateSelect([...data['plates'], 'all']);
            })
            .catch(error => console.error(error));
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
        setQuery(`selected: ${item}`);
    };

    const pickMailDocument = async () => {
        if (permList.includes(auth.currentUser.email)) {
            try {
                try {
                    const result = await DocumentPicker.getDocumentAsync();
                    const response = await fetch(result.uri);
                    const buffer = await response.arrayBuffer();
                    const workbook = new ExcelJS.Workbook();
                    var mailList;
                    await workbook.xlsx.load(buffer)
                        .then(() => {
                            // Get the worksheet you want to read data from
                            const worksheet = workbook.getWorksheet('Sheet1');

                            // Get the column by its header name (e.g. 'A', 'B', 'C', etc.) or index (1, 2, 3, etc.)
                            const column = worksheet.getColumn('A');

                            // Get an array of values in the column
                            const values = column.values.map(cell => cell.text);

                            // Remove the first element (which is the column header)
                            values.shift();

                            mailList = values // Output the values in the column
                        });
                    let mailObj = {"mail": mailList.map(item => item.toString())}
                    let jsonData = JSON.stringify(mailObj);
                    let dataRef = ref(storageRef, `permission.json`);
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
                } catch (error) {
                    alert(error.message)
                }
            } catch (error) {
                console.log('Error picking document: ', error);
            }
        } else{
            alert("user does not have permission")
        }
    };

    const pickDocument = async () => {
        let permRef = ref(storage, `permission.json`);
        const fileSnapshot = await getDownloadURL(permRef);
        const fileURL = fileSnapshot.toString();
        const response = await fetch(fileURL);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const textDecoder = new TextDecoder();
        const jsonString = textDecoder.decode(uint8Array);
        const permKV = JSON.parse(jsonString)
        const permList = permKV['mail']
        if (permList.includes(auth.currentUser.email)) {
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
                    let plateObj = {"plates": plateList.map(item => item.toString())}
                    let jsonData = JSON.stringify(plateObj);
                    let dataRef = ref(storageRef, `plates.json`);
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
                } catch (error) {
                    alert(error.message)
                }
            } catch (error) {
                console.log('Error picking document: ', error);
            }
        } else{
            alert("user does not have permission")
        }
    };

    async function downloadData(date, plateNum) {
        let fileRef = ref(storage, `${plateNum}_${date}.json`);
        const fileSnapshot = await getDownloadURL(fileRef);
        const fileURL = fileSnapshot.toString();
        const response = await fetch(fileURL);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const textDecoder = new TextDecoder();
        const jsonString = textDecoder.decode(uint8Array);
        return JSON.parse(jsonString);
    }

    const handleDownloadPress = async () => {
        let permRef = ref(storage, `permission.json`);
        const fileSnapshot = await getDownloadURL(permRef);
        const fileURL = fileSnapshot.toString();
        const response = await fetch(fileURL);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const textDecoder = new TextDecoder();
        const jsonString = textDecoder.decode(uint8Array);
        const permKV = JSON.parse(jsonString)
        const permList = permKV['mail']
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
        if (permList.includes(auth.currentUser.email)) {
            const dateStr = formatDate(date);
            if (plate === 'all') {
                for (let plateNum of plateNums) {
                    let data = await downloadData(dateStr, plateNum)
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);
                    const sheet = workbook.getWorksheet("แบบตรวจสอบรถก่อนเดินทาง");
                    sheet.getCell("C3").value = `รถทะเบียน ${plateNum} ตรวจสอบวันที่ ${data["date"]}`
                    for (let key of Object.keys(data)) {
                        if (data.hasOwnProperty(key) && key !== "plate" && key !== "date") {
                            const value = data[key];
                            sheet.getCell(cellOf[key]).value = typeof value === "boolean" ? value.toString().toLowerCase() === "true" ? "✓" : "X" : !value ? "-" : value;
                        }
                    }
                    workbook.xlsx.writeBuffer({base64: true})
                        .then(function (xls64) {
                            var a = document.createElement("a");
                            var data = new Blob([xls64], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            var url = URL.createObjectURL(data);
                            a.href = url;
                            a.download = `${plateNum}_${dateStr}.xlsx`;
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
            } else {
                let data = await downloadData(dateStr, plate)
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                const sheet = workbook.getWorksheet("แบบตรวจสอบรถก่อนเดินทาง");
                sheet.getCell("C3").value = `รถทะเบียน ${plate} ตรวจสอบวันที่ ${data["date"]}`
                for (let key of Object.keys(data)) {
                    if (data.hasOwnProperty(key) && key !== "plate" && key !== "date") {
                        const value = data[key];
                        sheet.getCell(cellOf[key]).value = typeof value === "boolean" ? value.toString().toLowerCase() === "true" ? "✓" : "X" : !value ? "-" : value;
                    }
                }
                workbook.xlsx.writeBuffer({base64: true})
                    .then(function (xls64) {
                        var a = document.createElement("a");
                        var data = new Blob([xls64], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                        var url = URL.createObjectURL(data);
                        a.href = url;
                        a.download = `${plate}_${dateStr}.xlsx`;
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
        } else {
            alert("user does not have permission")
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
                    placeholder="Search"
                    onChangeText={(text) => setQuery(text)}
                />
                {filteredOptions.length > 0 && (
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
                <Text>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restBtn} onPress={returnPress}>
                <Text>Return</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restBtn} onPress={pickDocument}>
                <Text>Upload Plate List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restBtn} onPress={pickMailDocument}>
                <Text>Upload Admin List</Text>
            </TouchableOpacity>
        </View>
    );
}