import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';

import { styles } from '../styles';
import { CheckBoxWrapper } from '../components/CheckBoxWrapper';
import { currentUser, signOut } from '../api/auth';
import { listPlates } from '../api/plates';
import { watchSessionField, startSession } from '../api/sessions';
import { getPlateLockHolderUid, claimPlateLock } from '../api/plateLocks';
import { getHistoricalSessionCount } from '../api/usage';
import { uploadSessionBlob } from '../api/sessionBlobs';
import type { SessionBlob } from '../types/domain';
import type { RootStackParamList } from '../types/navigation';

const mapsKey = '';

type Props = StackScreenProps<RootStackParamList, 'Primary'>;

export const Screen = ({ navigation }: Props) => {
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

  const [lawNote, setLawNote] = useState('');
  const [taxNote, setTaxNote] = useState('');
  const [insuranceNote, setInsuranceNote] = useState('');
  const [passportNote, setPassportNote] = useState('');
  const [headlightNote, setHeadlightNote] = useState('');
  const [turnlightNote, setTurnlightNote] = useState('');
  const [toplightNote, setToplightNote] = useState('');
  const [lubeoilNote, setLubeoilNote] = useState('');
  const [tankcoolantNote, setTankcoolantNote] = useState('');
  const [percipitationNote, setPercipitationNote] = useState('');
  const [opsnameNote, setOpsnameNote] = useState('');
  const [doormirrorNote, setDoormirrorNote] = useState('');
  const [tireNote, setTireNote] = useState('');
  const [tirehubNote, setTirehubNote] = useState('');
  const [tirehub2Note, setTirehub2Note] = useState('');
  const [tirehub3Note, setTirehub3Note] = useState('');
  const [tirehub4Note, setTirehub4Note] = useState('');
  const [spareNote, setSpareNote] = useState('');
  const [pressureNote, setPressureNote] = useState('');
  const [extinguisherNote, setExtinguisherNote] = useState('');
  const [tiresupportNote, setTiresupportNote] = useState('');
  const [coneNote, setConeNote] = useState('');
  const [breaklightNote, setBreaklightNote] = useState('');
  const [reverselightNote, setReverselightNote] = useState('');
  const [backturnlightNote, setBackturnlightNote] = useState('');
  const [structuralintegrityNote, setStructuralintegrityNote] = useState('');
  const [fastenerNote, setFastenerNote] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const [lawFix, setLawFix] = useState('');
  const [taxFix, setTaxFix] = useState('');
  const [insuranceFix, setInsuranceFix] = useState('');
  const [passportFix, setPassportFix] = useState('');
  const [headlightFix, setHeadlightFix] = useState('');
  const [turnlightFix, setTurnlightFix] = useState('');
  const [toplightFix, setToplightFix] = useState('');
  const [lubeoilFix, setLubeoilFix] = useState('');
  const [tankcoolantFix, setTankcoolantFix] = useState('');
  const [percipitationFix, setPercipitationFix] = useState('');
  const [opsnameFix, setOpsnameFix] = useState('');
  const [doormirrorFix, setDoormirrorFix] = useState('');
  const [tireFix, setTireFix] = useState('');
  const [tirehubFix, setTirehubFix] = useState('');
  const [tirehub2Fix, setTirehub2Fix] = useState('');
  const [tirehub3Fix, setTirehub3Fix] = useState('');
  const [tirehub4Fix, setTirehub4Fix] = useState('');
  const [spareFix, setSpareFix] = useState('');
  const [pressureFix, setPressureFix] = useState('');
  const [extinguisherFix, setExtinguisherFix] = useState('');
  const [tiresupportFix, setTiresupportFix] = useState('');
  const [coneFix, setConeFix] = useState('');
  const [breaklightFix, setBreaklightFix] = useState('');
  const [reverselightFix, setReverselightFix] = useState('');
  const [backturnlightFix, setBackturnlightFix] = useState('');
  const [structuralintegrityFix, setStructuralintegrityFix] = useState('');
  const [fastenerFix, setFastenerFix] = useState('');
  const [coverFix, setCoverFix] = useState('');

  const [alcohol, setAlcohol] = useState(false);
  const [drug, setDrug] = useState(false);
  const [mile, setMile] = useState('');
  const [plate, setPlate] = useState('');
  const [query, setQuery] = useState('');
  const [plateNums, setPlateNums] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    Geocoder.init(mapsKey);
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'working', (value) => {
      if (value) {
        navigation.navigate('Driving');
      }
    });
  }, [navigation]);

  useEffect(() => {
    listPlates().then((data) => {
      if (data.length) setPlateNums(data);
    });
  }, []);

  useEffect(() => {
    setFilteredOptions(
      plateNums.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  }, [query, plateNums]);

  const handleAdminPress = async () => {
    navigation.navigate('Admin');
  };

  function handleSignOutPress() {
    signOut()
      .then(() => navigation.navigate('SignIn'))
      .catch((error: Error) => alert(error.message));
  }

  async function getLocation(): Promise<string | undefined> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    try {
      const response = await Geocoder.from({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const { results } = response;
      if (results && results.length > 0) {
        const { formatted_address } = results[0];
        return formatted_address;
      }
    } catch (error) {
      alert((error as Error).message);
    }
    return undefined;
  }

  const handleSubmitPress = async () => {
    if (!plate) {
      alert('โปรดใส่ทะเบียนรถก่อนส่ง');
      return;
    }
    const user = currentUser.value;
    if (!user) return;

    const currentDate = new Date();
    const utcOffset = 7;
    const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
    const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
    const dateStr = utcDate.toISOString().slice(0, 10);
    const timeStr = utcDate.toISOString().slice(11, 19);
    const dateTime = dateStr + ' ' + timeStr;

    const holder = await getPlateLockHolderUid(plate);
    if (holder !== null) {
      alert('this car is currently being driven by someone else');
      return;
    }

    await startSession(user.uid, plate);
    const count = (await getHistoricalSessionCount(plate, dateStr)) + 1;
    await claimPlateLock(plate, user.uid, dateStr, count);

    const location = await getLocation();
    if (location === undefined) return;

    const blob: SessionBlob = {
      law,
      tax,
      insurance,
      passport,
      headlight,
      turnlight,
      toplight,
      lubeoil,
      tankcoolant,
      percipitation,
      opsname,
      doormirror,
      tire,
      tirehub,
      tirehub2,
      tirehub3,
      tirehub4,
      spare,
      pressure,
      extinguisher,
      tiresupport,
      cone,
      breaklight,
      reverselight,
      backturnlight,
      structuralintegrity,
      fastener,
      cover,
      plate,
      law_note: lawNote,
      tax_note: taxNote,
      insurance_note: insuranceNote,
      passport_note: passportNote,
      headlight_note: headlightNote,
      turnlight_note: turnlightNote,
      toplight_note: toplightNote,
      lubeoil_note: lubeoilNote,
      tankcoolant_note: tankcoolantNote,
      percipitation_note: percipitationNote,
      opsname_note: opsnameNote,
      doormirror_note: doormirrorNote,
      tire_note: tireNote,
      tirehub_note: tirehubNote,
      tirehub2_note: tirehub2Note,
      tirehub3_note: tirehub3Note,
      tirehub4_note: tirehub4Note,
      spare_note: spareNote,
      pressure_note: pressureNote,
      extinguisher_note: extinguisherNote,
      tiresupport_note: tiresupportNote,
      cone_note: coneNote,
      breaklight_note: breaklightNote,
      reverselight_note: reverselightNote,
      backturnlight_note: backturnlightNote,
      structuralintegrity_note: structuralintegrityNote,
      fastener_note: fastenerNote,
      cover_note: coverNote,
      law_fix: lawFix,
      tax_fix: taxFix,
      insurance_fix: insuranceFix,
      passport_fix: passportFix,
      headlight_fix: headlightFix,
      turnlight_fix: turnlightFix,
      toplight_fix: toplightFix,
      lubeoil_fix: lubeoilFix,
      tankcoolant_fix: tankcoolantFix,
      percipitation_fix: percipitationFix,
      opsname_fix: opsnameFix,
      doormirror_fix: doormirrorFix,
      tire_fix: tireFix,
      tirehub_fix: tirehubFix,
      tirehub2_fix: tirehub2Fix,
      tirehub3_fix: tirehub3Fix,
      tirehub4_fix: tirehub4Fix,
      spare_fix: spareFix,
      pressure_fix: pressureFix,
      extinguisher_fix: extinguisherFix,
      tiresupport_fix: tiresupportFix,
      cone_fix: coneFix,
      breaklight_fix: breaklightFix,
      reverselight_fix: reverselightFix,
      backturnlight_fix: backturnlightFix,
      structuralintegrity_fix: structuralintegrityFix,
      fastener_fix: fastenerFix,
      cover_fix: coverFix,
      alcohol,
      drug,
      mile,
      date: dateTime,
      name,
      startLocation: location,
    };

    try {
      await uploadSessionBlob(plate, dateStr, count, blob);
      alert('อัปโหลดข้อมูลสำเร็จ');
    } catch (error) {
      alert('เกิดปัญหาในการอัปโหลด: ' + (error as Error).message);
    }
  };

  const handleItemSelect = (item: string) => {
    setPlate(item);
    setQuery(item.toString());
    setSelected(true);
  };

  return (
    <View style={styles.container}>
      <View>
        <CheckBoxWrapper label="พรบ: ไม่หมดอายุ" value={law} setValue={setLaw} fix={lawFix} setFix={setLawFix} note={lawNote} setNote={setLawNote} />
        <CheckBoxWrapper label="ภาษี: ไม่หมดอายุ" value={tax} setValue={setTax} note={taxNote} setNote={setTaxNote} fix={taxFix} setFix={setTaxFix} />
        <CheckBoxWrapper label="ประกันภัย: ไม่หมดอายุ" value={insurance} setValue={setInsurance} note={insuranceNote} setNote={setInsuranceNote} fix={insuranceFix} setFix={setInsuranceFix} />
        <CheckBoxWrapper label="พาสสปอร์ตข้ามแดน: ไม่หมดอายุ" value={passport} setValue={setPassport} note={passportNote} setNote={setPassportNote} fix={passportFix} setFix={setPassportFix} />
        <CheckBoxWrapper label="ไฟหน้ารถ: ติดครบและส่องสว่าง" value={headlight} setValue={setHeadlight} note={headlightNote} setNote={setHeadlightNote} fix={headlightFix} setFix={setHeadlightFix} />
        <CheckBoxWrapper label="ไฟหรี่ไฟเลี้ยว: ติดครบและส่องสว่าง" value={turnlight} setValue={setTurnlight} fix={turnlightFix} setFix={setTurnlightFix} note={turnlightNote} setNote={setTurnlightNote} />
        <CheckBoxWrapper label="ไฟหลังคา: ติดครบและส่องสว่าง" value={toplight} setValue={setToplight} fix={toplightFix} setFix={setToplightFix} note={toplightNote} setNote={setToplightNote} />
        <CheckBoxWrapper label="ระดับน้ำมันเครื่อง: ระดับสูงสุด MAX" value={lubeoil} setValue={setLubeoil} fix={lubeoilFix} setFix={setLubeoilFix} note={lubeoilNote} setNote={setLubeoilNote} />
        <CheckBoxWrapper label="น้ำหล่อเย็นหม้อน้ำ: ระดับสูงสุด MAX" value={tankcoolant} setValue={setTankcoolant} fix={tankcoolantFix} setFix={setTankcoolantFix} note={tankcoolantNote} setNote={setTankcoolantNote} />
        <CheckBoxWrapper label="ระบบปัดน้ำฝน: ระดับสูงสุด MAX" value={percipitation} setValue={setPercipitation} fix={percipitationFix} setFix={setPercipitationFix} note={percipitationNote} setNote={setPercipitationNote} />
        <CheckBoxWrapper label="ชื่อประกอบการ: ติดครบไม่ชำรุด" value={opsname} setValue={setOpsname} fix={opsnameFix} setFix={setOpsnameFix} note={opsnameNote} setNote={setOpsnameNote} />
        <CheckBoxWrapper label="กระจกมองข่าง: ครบไม่แตกร้าว" value={doormirror} setValue={setDoormirror} fix={doormirrorFix} setFix={setDoormirrorFix} note={doormirrorNote} setNote={setDoormirrorNote} />
        <CheckBoxWrapper label="สภาพยางหน้า: ความลึก > 5 มม" value={tire} setValue={setTire} fix={tireFix} setFix={setTireFix} note={tireNote} setNote={setTireNote} />
        <CheckBoxWrapper label="สภาพยางเพลาที่ 1: ความลึก > 3 มม." value={tirehub} setValue={setTirehub} fix={tirehubFix} setFix={setTirehubFix} note={tirehubNote} setNote={setTirehubNote} />
        <CheckBoxWrapper label="สภาพยางเพลาที่ 2: ความลึก > 3 มม." value={tirehub2} setValue={setTirehub2} fix={tirehub2Fix} setFix={setTirehub2Fix} note={tirehub2Note} setNote={setTirehub2Note} />
        <CheckBoxWrapper label="สภาพยางเพลาที่ 3: ความลึก > 3 มม." value={tirehub3} setValue={setTirehub3} fix={tirehub3Fix} setFix={setTirehub3Fix} note={tirehub3Note} setNote={setTirehub3Note} />
        <CheckBoxWrapper label="สภาพยางเพลาที่ 4: ความลึก > 3 มม." value={tirehub4} setValue={setTirehub4} fix={tirehub4Fix} setFix={setTirehub4Fix} note={tirehub4Note} setNote={setTirehub4Note} />
        <CheckBoxWrapper label="สภาพยางอะหลัย: มีพร้อมใช้งาน" value={spare} setValue={setSpare} fix={spareFix} setFix={setSpareFix} note={spareNote} setNote={setSpareNote} />
        <CheckBoxWrapper label="แรงดันลมยาง: 130 ปอนด์" value={pressure} setValue={setPressure} fix={pressureFix} setFix={setPressureFix} note={pressureNote} setNote={setPressureNote} />
        <CheckBoxWrapper label="ถังดับเพลิง: จํานวน 2 ถังถังละ 6 กก." value={extinguisher} setValue={setExtinguisher} fix={extinguisherFix} setFix={setExtinguisherFix} note={extinguisherNote} setNote={setExtinguisherNote} />
        <CheckBoxWrapper label="หมอนหนุนล้อ: จํานวน 2 อัน" value={tiresupport} setValue={setTiresupport} fix={tiresupportFix} setFix={setTiresupportFix} note={tiresupportNote} setNote={setTiresupportNote} />
        <CheckBoxWrapper label="กรวยจราจร: จํานวน 2 อัน" value={cone} setValue={setCone} fix={coneFix} setFix={setConeFix} note={coneNote} setNote={setConeNote} />
        <CheckBoxWrapper label="ไฟเบรก: ติดครบและส่องสว่าง" value={breaklight} setValue={setBreaklight} fix={breaklightFix} setFix={setBreaklightFix} note={breaklightNote} setNote={setBreaklightNote} />
        <CheckBoxWrapper label="ไฟถอย: ติดครบและส่องสว่าง" value={reverselight} setValue={setReverselight} fix={reverselightFix} setFix={setReverselightFix} note={reverselightNote} setNote={setReverselightNote} />
        <CheckBoxWrapper label="ไฟเลี้ยวไฟหรี่ท้าย: ติดครบและส่องสว่าง" value={backturnlight} setValue={setBackturnlight} fix={backturnlightFix} setFix={setBackturnlightFix} note={backturnlightNote} setNote={setBackturnlightNote} />
        <CheckBoxWrapper label="อุปกรณ์ผูกรัดติดตรึง" value={structuralintegrity} setValue={setStructuralintegrity} fix={structuralintegrityFix} setFix={setStructuralintegrityFix} note={structuralintegrityNote} setNote={setStructuralintegrityNote} />
        <CheckBoxWrapper label="ความมั่งคงแข็งแรง" value={fastener} setValue={setFastener} fix={fastenerFix} setFix={setFastenerFix} note={fastenerNote} setNote={setFastenerNote} />
        <CheckBoxWrapper label="ผ้าใบปิดคลุม" value={cover} setValue={setCover} fix={coverFix} setFix={setCoverFix} note={coverNote} setNote={setCoverNote} />
        <CheckBoxWrapper label="ปริมาณ แอลกอฮอร์ ไม่เกิน 0%" value={alcohol} setValue={setAlcohol} />
        <CheckBoxWrapper label="ไม่เคยใช้สารเสพติด ก่อน, ระหว่าง และ หลังปฎิบัติงาน" value={drug} setValue={setDrug} />
      </View>
      <TextInput
        style={styles.nameInput}
        value={name}
        placeholder="ชื่อ"
        onChangeText={setName}
      />
      <TextInput
        style={styles.nameInput}
        value={mile}
        placeholder="เลขไมค์ ณ.วันที่ตรวจสอบ"
        onChangeText={setMile}
      />
      <View style={styles.search}>
        <TextInput
          style={styles.input}
          value={query}
          placeholder="ค้นหาทะเบียน"
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
      <ImageBackground source={require('../../assets/grey.png')} style={styles.center}>
        <TouchableOpacity style={styles.buttonOne} onPress={handleSubmitPress}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>บันทึก</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonRest} onPress={handleAdminPress}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>ดาวน์โหลดข้อมูล</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonRest} onPress={handleSignOutPress}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>ออกจากระบบ</Text>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};
