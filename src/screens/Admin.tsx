import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { StackScreenProps } from '@react-navigation/stack';
import { createElement } from 'react-native-web';
import * as DocumentPicker from 'expo-document-picker';
import * as ExcelJS from 'exceljs';

import { styles } from '../styles';
import { listPlates, replacePlates } from '../api/plates';
import { getHistoricalSessionCount } from '../api/usage';
import {
  downloadTemplate,
  downloadSessionBlob,
  downloadCheckpointBlob,
} from '../api/sessionBlobs';
import type { SessionBlob } from '../types/domain';
import type { RootStackParamList } from '../types/navigation';

type Props = StackScreenProps<RootStackParamList, 'Admin'>;

const borderStyle = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
} as const;

const cellTextAlignment = {
  vertical: 'middle',
  horizontal: 'center',
} as const;

const month: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

const carDataKeys: Record<string, string> = {
  plate: 'A',
  date: 'B',
  name: 'C',
  law: 'D',
  tax: 'E',
  insurance: 'F',
  passport: 'G',
  headlight: 'H',
  turnlight: 'I',
  toplight: 'J',
  lubeoil: 'K',
  tankcoolant: 'L',
  percipitation: 'M',
  opsname: 'N',
  doormirror: 'O',
  tire: 'P',
  tirehub: 'Q',
  tirehub2: 'R',
  tirehub3: 'S',
  tirehub4: 'T',
  spare: 'U',
  pressure: 'V',
  extinguisher: 'W',
  tiresupport: 'X',
  cone: 'Y',
  breaklight: 'Z',
  reverselight: 'AA',
  backturnlight: 'AB',
};

type MyWebDatePickerProps = {
  date: Date;
  setDate: (d: Date) => void;
};

const MyWebDatePicker = ({ date, setDate }: MyWebDatePickerProps) =>
  createElement('input', {
    type: 'date',
    value: date.toISOString().split('T')[0],
    onChange: (event: { target: { value: string } }) => {
      setDate(new Date(event.target.value));
    },
    style: {
      height: 30,
      padding: 5,
      border: '2px solid #677788',
      borderRadius: 5,
      width: 250,
      marginBottom: 10,
    },
  });

export default function Admin({ navigation }: Props) {
  const currentDate = new Date();
  const [date, setDate] = useState(new Date(currentDate.getTime()));
  const [endDate, setEndDate] = useState(new Date(currentDate.getTime()));
  const [plate, setPlate] = useState('ทั้งหมด');
  const [plateNums, setPlateNums] = useState<string[]>([]);
  const [plateSelect, setPlateSelect] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [mode, setMode] = useState<'byDate' | 'byPlate'>('byDate');
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    listPlates().then((data) => {
      if (!data.length) return;
      setPlateNums(data);
      setPlateSelect(['ทั้งหมด', ...data]);
    });
  }, []);

  useEffect(() => {
    setFilteredOptions(
      plateSelect.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  }, [query, plateSelect]);

  const handleItemSelect = (item: string) => {
    setPlate(item);
    setQuery(item.toString());
    setSelected(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (result.canceled || !result.assets?.length) return;
      const response = await fetch(result.assets[0].uri);
      const buffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet('Sheet1')!;
      const column = worksheet.getColumn('A');
      const values = column.values as unknown[];
      values.shift();
      const plateList = values.filter(
        (v): v is string => typeof v === 'string',
      );
      await replacePlates(plateList);
      alert('อัปโหลดข้อมูลสำเร็จ');
    } catch (error) {
      alert(`เกิดปัญหาในการอัปโหลด: ${(error as Error).message}`);
    }
  };

  function getDateStringArray(startDate: Date, endDate: Date): string[] {
    const dateArray: string[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      dateArray.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dateArray;
  }

  var carDataRow: number = 0;
  var travelDataRow: number = 0;

  const handleDownloadPress = async () => {
    let buffer: ArrayBuffer;
    try {
      buffer = await downloadTemplate('DatabaseTemplate.xlsx');
    } catch (error) {
      alert(error);
      return;
    }
    const dateStr = formatDate(date);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const carDataSheet = workbook.getWorksheet('รายงานการตรวจสภาพรถ')!;
    const travelDataSheet = workbook.getWorksheet('รายงานการเดินทาง')!;
    carDataRow = 5;
    travelDataRow = 3;
    if (plate === 'ทั้งหมด') {
      for (const plateNum of plateNums) {
        await writeDataToWorkbook(carDataSheet, travelDataSheet, plateNum, dateStr);
      }
    } else {
      if (mode === 'byPlate') {
        const dateList = getDateStringArray(new Date(dateStr), new Date(formatDate(endDate)));
        for (const day of dateList) {
          await writeDataToWorkbook(carDataSheet, travelDataSheet, plate, day);
        }
      } else {
        await writeDataToWorkbook(carDataSheet, travelDataSheet, plate, dateStr);
      }
    }
    fitCellWithContent(carDataSheet);
    fitCellWithContent(travelDataSheet);
    downloadAsXlsx(workbook, plate, dateStr);
  };

  async function writeDataToWorkbook(
    carDataSheet: ExcelJS.Worksheet,
    travelDataSheet: ExcelJS.Worksheet,
    plate: string,
    dateStr: string,
  ) {
    const count = await getHistoricalSessionCount(plate, dateStr);
    for (let i = 1; i <= count; i++, carDataRow++, travelDataRow++) {
      const data = await downloadSessionBlob(plate, dateStr, i);
      if (!data) continue;
      await writeCarData(carDataSheet, data, carDataRow);
      await writeTravelData(travelDataSheet, data, travelDataRow, dateStr, plate, i);
      console.log(`Finished writing ${plate}(${i})'s data.`);
    }
  }

  function downloadAsXlsx(workbook: ExcelJS.Workbook, plateNum: string, date: string) {
    workbook.xlsx
      .writeBuffer()
      .then((xls64) => {
        const a = document.createElement('a');
        const data = new Blob([xls64 as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(data);
        a.href = url;
        a.download = `${plateNum}_${date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async function writeCarData(sheet: ExcelJS.Worksheet, data: SessionBlob, row: number) {
    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(carDataKeys, key)) {
        const col = carDataKeys[key];
        const cell = sheet.getCell(`${col}${row}`);
        cell.border = borderStyle;
        cell.alignment = cellTextAlignment;
        const value = data[key as keyof SessionBlob];
        cell.value =
          typeof value === 'boolean'
            ? value
              ? '✓'
              : 'X'
            : !value
              ? '-'
              : (value as string | number);
      }
    }
  }

  async function writeTravelData(
    sheet: ExcelJS.Worksheet,
    data: SessionBlob,
    row: number,
    dateStr: string,
    plateNum: string,
    count: number,
  ) {
    const restOne = await downloadCheckpointBlob(plateNum, dateStr, count, 'rest1');
    const restOneExit = await downloadCheckpointBlob(plateNum, dateStr, count, 'passRest1');
    let restOneTime: string[] | undefined;
    if (restOne) restOneTime = restOne.time.split(' ');
    const destination = await downloadCheckpointBlob(plateNum, dateStr, count, 'destination');
    const destinationExit = await downloadCheckpointBlob(plateNum, dateStr, count, 'passDestination');
    const destinationTime = destination!.time.split(' ');
    const restTwo = await downloadCheckpointBlob(plateNum, dateStr, count, 'rest2');
    const restTwoExit = await downloadCheckpointBlob(plateNum, dateStr, count, 'passRest2');
    let restTwoTime: string[] | undefined;
    if (restTwo) restTwoTime = restTwo.time.split(' ');
    const end = await downloadCheckpointBlob(plateNum, dateStr, count, 'end');
    const endTime = end!.time.split(' ');
    console.log(restOne, restOneExit, restTwoExit, restTwo, destinationExit, destination, end);

    const cellDatas: Record<string, string | number | undefined> = {
      A: data.date,
      B: data.plate,
      C: data.mile,
      D: data.name,
      E: data.alcohol ? '✓' : 'X',
      F: data.drug ? '✓' : 'X',
      G: data.startLocation,
      H: restOne!.location,
      I: restOneTime?.[0],
      J: restOneTime?.[1],
      K: restOneExit!.time.split(' ')[1],
      L: destination!.location,
      M: destinationTime[0],
      N: destinationTime[1],
      O: destinationExit!.time.split(' ')[1],
      P: restTwo ? restTwo.location : '-',
      Q: restTwo ? restTwoTime?.[0] : '-',
      R: restTwo ? restTwoTime?.[1] : '-',
      S: restTwoExit ? restTwoExit.time.split(' ')[1] : '-',
      T: end!.location,
      U: endTime[0],
      V: endTime[1],
    };
    for (const col of Object.keys(cellDatas)) {
      const cell = sheet.getCell(`${col}${row}`);
      cell.value = cellDatas[col] ?? '-';
      cell.border = borderStyle;
      cell.alignment = cellTextAlignment;
    }
  }

  function fitCellWithContent(sheet: ExcelJS.Worksheet) {
    for (let i = 0; i < sheet.columns.length; i++) {
      let dataMax = 0;
      const column = sheet.columns[i];
      const values = column.values as unknown[];
      for (let j = 1; j < values.length; j++) {
        if (!values[j]) continue;
        const columnLength = String(values[j]).length;
        if (columnLength > dataMax) {
          dataMax = columnLength;
        }
      }
      column.width = dataMax < 10 ? 10 : dataMax;
    }
  }

  function handleSetMode(nextMode: 'byDate' | 'byPlate') {
    setMode(nextMode);
    if (nextMode === 'byPlate') {
      setPlateSelect(plateNums);
    } else {
      setPlateSelect(['ทั้งหมด', ...plateNums]);
    }
    setFilteredOptions(
      plateSelect.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  }

  function formatDate(dateToFormat: Date): string {
    const split = dateToFormat.toString().split(' ');
    return `${split[3]}-${month[split[1]]}-${split[2]}`;
  }

  function returnPress() {
    navigation.navigate('Primary');
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
            setSelected(false);
          }}
        />
        {filteredOptions.length > 0 && !selected && (
          <FlatList
            data={filteredOptions}
            renderItem={({ item }) => (
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
        <div style={{ color: '#FFF', textAlign: 'center' }}>วันที่</div>
      )}
      <MyWebDatePicker date={date} setDate={setDate} />
      {mode === 'byPlate' && (
        <div style={{ color: '#FFF', textAlign: 'center' }}>
          ถึงวันที่
          <br />
          <MyWebDatePicker date={endDate} setDate={setEndDate} />
        </div>
      )}
      <Picker
        style={styles.selector}
        selectedValue={mode}
        onValueChange={(itemValue) => handleSetMode(itemValue as 'byDate' | 'byPlate')}
      >
        <Picker.Item label="ตามวันที่" value="byDate" />
        <Picker.Item label="ตามทะเบียน" value="byPlate" />
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
