import React, {useState} from "react";
import {getDownloadURL, getMetadata, ref, uploadString} from "firebase/storage";
import {auth, storage, storageRef} from "./firebase-config";
import {ImageBackground, Text, TouchableOpacity, View} from "react-native";
import {styles} from "./styles";
import {CheckBoxWrapper} from "./checkbox";
import SearchableDropdownWrapper from "./dropdown";
import {signOut} from "firebase/auth";
import * as ExcelJS from 'exceljs';

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

const Screen = ({navigation}) => {
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
    const [plate, setPlate] = useState('');
    const plateNums = ['นย7768', 'อว2446', 'ตม6547']

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
        const permList = permKV['have']
        if (permList.includes(auth.currentUser.email)) {
            let date = new Date().toISOString().slice(0, 10);
            var datas = await downloadData(date);
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
                const plateNum = data["plate"];
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                const sheet = workbook.getWorksheet("แบบตรวจสอบรถก่อนเดินทาง");
                sheet.getCell("C3").value = `รถทะเบียน ${plateNum} ตรวจสอบวันที่ ${date}`
                for (let key of Object.keys(data)) {
                    if (data.hasOwnProperty(key) && key != "plate") {
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

        } else {
            alert("user does not have permission")
        }
    }

    function handleSignOutPress() {
        signOut(auth)
            .then(() => navigation.navigate('SignIn'))
            .catch(error => alert(error.message));

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
            'plate': plate,
            'law_note': lawNote,
            'tax_note': taxNote,
            'insurance_note': insuranceNote,
            'passport_note': passportNote,
            'headlight_note': headlightNote,
            'turnlight_note': turnlightNote,
            'toplight_note': toplightNote,
            'lubeoil_note': lubeoilNote,
            'tankcoolant_note': tankcoolantNote,
            'percipitation_note': percipitationNote,
            'opsname_note': opsnameNote,
            'doormirror_note': doormirrorNote,
            'tire_note': tireNote,
            'tirehub_note': tirehubNote,
            'tirehub2_note': tirehub2Note,
            'tirehub3_note': tirehub3Note,
            'tirehub4_note': tirehub4Note,
            'spare_note': spareNote,
            'pressure_note': pressureNote,
            'extinguisher_note': extinguisherNote,
            'tiresupport_note': tiresupportNote,
            'cone_note': coneNote,
            'breaklight_note': breaklightNote,
            'reverselight_note': reverselightNote,
            'backturnlight_note': backturnlightNote,
            'structuralintegrity_note': structuralintegrityNote,
            'fastener_note': fastenerNote,
            'cover_note': coverNote,
            'law_fix': lawFix,
            'tax_fix': taxFix,
            'insurance_fix': insuranceFix,
            'passport_fix': passportFix,
            'headlight_fix': headlightFix,
            'turnlight_fix': turnlightFix,
            'toplight_fix': toplightFix,
            'lubeoil_fix': lubeoilFix,
            'tankcoolant_fix': tankcoolantFix,
            'percipitation_fix': percipitationFix,
            'opsname_fix': opsnameFix,
            'doormirror_fix': doormirrorFix,
            'tire_fix': tireFix,
            'tirehub_fix': tirehubFix,
            'tirehub2_fix': tirehub2Fix,
            'tirehub3_fix': tirehub3Fix,
            'tirehub4_fix': tirehub4Fix,
            'spare_fix': spareFix,
            'pressure_fix': pressureFix,
            'extinguisher_fix': extinguisherFix,
            'tiresupport_fix': tiresupportFix,
            'cone_fix': coneFix,
            'breaklight_fix': breaklightFix,
            'reverselight_fix': reverselightFix,
            'backturnlight_fix': backturnlightFix,
            'structuralintegrity_fix': structuralintegrityFix,
            'fastener_fix': fastenerFix,
            'cover_fix': coverFix,
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
        <View style={styles.container}>
            <CheckBoxWrapper label="พรบ: ไม่หมดอายุ" value={law} setValue={setLaw} fix={lawFix} setFix={setLawFix}
                             note={lawNote} setNote={setLawNote}/>
            <CheckBoxWrapper label="ภาษี: ไม่หมดอายุ" value={tax} setValue={setTax} note={taxNote} setNote={setTaxNote}
                             fix={taxFix} setFix={setTaxFix}/>
            <CheckBoxWrapper label="ประกันภัย: ไม่หมดอายุ" value={insurance} setValue={setInsurance}
                             note={insuranceNote} setNote={setInsuranceNote} fix={insuranceFix}
                             setFix={setInsuranceFix}/>
            <CheckBoxWrapper label="พาสสปอร์ตข้ามแดน: ไม่หมดอายุ" value={passport} setValue={setPassport}
                             note={passportNote} setNote={setPassportNote} fix={passportFix} setFix={setPassportFix}/>
            <CheckBoxWrapper label="ไฟหน้ารถ: ติดครบและส่องสว่าง" value={headlight} setValue={setHeadlight}
                             note={headlightNote} setNote={setHeadlightNote} fix={headlightFix}
                             setFix={setHeadlightFix}/>
            <CheckBoxWrapper label="ไฟหรี่ไฟเลี้ยว: ติดครบและส่องสว่าง" value={turnlight} setValue={setTurnlight}
                             fix={turnlightFix} setFix={setTurnlightFix} note={turnlightNote}
                             setNote={setTurnlightNote}/>
            <CheckBoxWrapper label="ไฟหลังคา: ติดครบและส่องสว่าง" value={toplight} setValue={setToplight}
                             fix={toplightFix} setFix={setToplightFix} note={toplightNote} setNote={setToplightNote}/>
            <CheckBoxWrapper label="ระดับน้ำมันเครื่อง: ระดับสูงสุด MAX" value={lubeoil} setValue={setLubeoil}
                             fix={lubeoilFix} setFix={setLubeoilFix} note={lubeoilNote} setNote={setLubeoilNote}/>
            <CheckBoxWrapper label="น้ำหล่อเย็นหม้อน้ำ: ระดับสูงสุด MAX" value={tankcoolant} setValue={setTankcoolant}
                             fix={tankcoolantFix} setFix={setTankcoolantFix} note={tankcoolantNote}
                             setNote={setTankcoolantNote}/>
            <CheckBoxWrapper label="ระบบปัดน้ำฝน: ระดับสูงสุด MAX" value={percipitation} setValue={setPercipitation}
                             fix={percipitationFix} setFix={setPercipitationFix} note={percipitationNote}
                             setNote={setPercipitationNote}/>
            <CheckBoxWrapper label="ชื่อประกอบการ: ติดครบไม่ชำรุด" value={opsname} setValue={setOpsname}
                             fix={opsnameFix} setFix={setOpsnameFix} note={opsnameNote} setNote={setOpsnameNote}/>
            <CheckBoxWrapper label="กระจกมองข่าง: ครบไม่แตกร้าว" value={doormirror} setValue={setDoormirror}
                             fix={doormirrorFix} setFix={setDoormirrorFix} note={doormirrorNote}
                             setNote={setDoormirrorNote}/>
            <CheckBoxWrapper label="สภาพยางหน้า: ความลึก > 5 มม" value={tire} setValue={setTire} fix={tireFix}
                             setFix={setTireFix} note={tireNote} setNote={setTireNote}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 1: ความลึก > 3 มม." value={tirehub} setValue={setTirehub}
                             fix={tirehubFix} setFix={setTirehubFix} note={tirehubNote} setNote={setTirehubNote}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 2: ความลึก > 3 มม." value={tirehub2} setValue={setTirehub2}
                             fix={tirehub2Fix} setFix={setTirehub2Fix} note={tirehub2Note} setNote={setTirehub2Note}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 3: ความลึก > 3 มม." value={tirehub3} setValue={setTirehub3}
                             fix={tirehub3Fix} setFix={setTirehub3Fix} note={tirehub3Note} setNote={setTirehub3Note}/>
            <CheckBoxWrapper label="สภาพยางเพลาที่ 4: ความลึก > 3 มม." value={tirehub4} setValue={setTirehub4}
                             fix={tirehub4Fix} setFix={setTirehub4Fix} note={tirehub4Note} setNote={setTirehub4Note}/>
            <CheckBoxWrapper label="สภาพยางอะหลัย: มีพร้อมใช้งาน" value={spare} setValue={setSpare} fix={spareFix}
                             setFix={setSpareFix} note={spareNote} setNote={setSpareNote}/>
            <CheckBoxWrapper label="แรงดันลมยาง: 130 ปอนด์" value={pressure} setValue={setPressure} fix={pressureFix}
                             setFix={setPressureFix} note={pressureNote} setNote={setPressureNote}/>
            <CheckBoxWrapper label="ถังดับเพลิง: จํานวน 2 ถังถังละ 6 กก." value={extinguisher}
                             setValue={setExtinguisher} fix={extinguisherFix} setFix={setExtinguisherFix}
                             note={extinguisherNote} setNote={setExtinguisherNote}/>
            <CheckBoxWrapper label="หมอนหนุนล้อ: จํานวน 2 อัน" value={tiresupport} setValue={setTiresupport}
                             fix={tiresupportFix} setFix={setTiresupportFix} note={tiresupportNote}
                             setNote={setTiresupportNote}/>
            <CheckBoxWrapper label="กรวยจราจร: จํานวน 2 อัน" value={cone} setValue={setCone} fix={coneFix}
                             setFix={setConeFix} note={coneNote} setNote={setConeNote}/>
            <CheckBoxWrapper label="ไฟเบรก: ติดครบและส่องสว่าง" value={breaklight} setValue={setBreaklight}
                             fix={breaklightFix} setFix={setBreaklightFix} note={breaklightNote}
                             setNote={setBreaklightNote}/>
            <CheckBoxWrapper label="ไฟถอย: ติดครบและส่องสว่าง" value={reverselight} setValue={setReverselight}
                             fix={reverselightFix} setFix={setReverselightFix} note={reverselightNote}
                             setNote={setReverselightNote}/>
            <CheckBoxWrapper label="ไฟเลี้ยวไฟหรี่ท้าย: ติดครบและส่องสว่าง" value={backturnlight}
                             setValue={setBackturnlight} fix={backturnlightFix} setFix={setBackturnlightFix}
                             note={backturnlightNote} setNote={setBackturnlightNote}/>
            <CheckBoxWrapper label="อุปกรณ์ผูกรัดติดตรึง" value={structuralintegrity} setValue={setStructuralintegrity}
                             fix={structuralintegrityFix} setFix={setStructuralintegrityFix}
                             note={structuralintegrityNote} setNote={setStructuralintegrityNote}/>
            <CheckBoxWrapper label="ความมั่งคงแข็งแรง" value={fastener} setValue={setFastener} fix={fastenerFix}
                             setFix={setFastenerFix} note={fastenerNote} setNote={setFastenerNote}/>
            <CheckBoxWrapper label="ผ้าใบปิดคลุม" value={cover} setValue={setCover} fix={coverFix} setFix={setCoverFix}
                             note={coverNote} setNote={setCoverNote}/>
            <SearchableDropdownWrapper style={styles.search} onItemSelect={setPlate} options={plateNums}/>
            <ImageBackground source={require('./assets/grey.png')} style={styles.center}>
                <TouchableOpacity style={styles.buttonOne} onPress={handleSubmitPress}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>Submit</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonRest} onPress={handleDownloadPress}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>Download</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonRest} onPress={handleSignOutPress}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
}


export {Screen}