import React, { useState } from "react";
import { View, StyleSheet, Text, Button, Platform, TouchableOpacity } from "react-native";
import CheckBox from "expo-checkbox";
import { firebase } from "./firebase-config";

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

  
  function handlePress() {
    if (law) {
      alert("submitted");
    } else {
      alert("not submitted");
    }
  }

  
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          พรบ: ไม่หมดอายุ
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={law}
          onValueChange={() => setLaw(!law)}
          color={law ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ภาษี: ไม่หมดอายุ
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tax}
          onValueChange={() => setTax(!tax)}
          color={tax ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ประกันภัย: ไม่หมดอายุ
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={insurance}
          onValueChange={() => setInsurance(!insurance)}
          color={insurance ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          พาสสปอร์ตข้ามแดน: ไม่หมดอายุ
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={passport}
          onValueChange={() => setPassport(!passport)}
          color={passport ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ไฟหน้ารถ: ติดครบและส่องสว่าง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={headlight}
          onValueChange={() => setHeadlight(!headlight)}
          color={headlight ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ไฟหรี่ไฟเลี้ยว: ติดครบและส่องสว่าง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={turnlight}
          onValueChange={() => setTurnlight(!turnlight)}
          color={turnlight ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ไฟหลังคา: ติดครบและส่องสว่าง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={toplight}
          onValueChange={() => setToplight(!toplight)}
          color={toplight ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ระดับน้ำมันเครื่อง: ระดับสูงสุด MAX
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={lubeoil}
          onValueChange={() => setLubeoil(!lubeoil)}
          color={lubeoil ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          น้ำหล่อเย็นหม้อน้ํา: ระดับสูงสุด MAX
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tankcoolant}
          onValueChange={() => setTankcoolant(!tankcoolant)}
          color={tankcoolant ? "#4630EB" : undefined}
        />
      </View>
       <View style={styles.wrapper}>
        <Text style={styles.text}>
          ระบบปัดน้ำฝน: ระดับสูงสุด MAX
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={percipitation}
          onValueChange={() => setPercipitation(!percipitation)}
          color={percipitation ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ชื่อประกอบการ: ติดครบไม่ชำรุด
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={opsname}
          onValueChange={() => setOpsname(!opsname)}
          color={opsname ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          กระจกมองข่าง: ครบไม่แตกร้าว
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={doormirror}
          onValueChange={() => setDoormirror(!doormirror)}
          color={doormirror ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          สภาพยางหน้า: ความลึก> 5 มม
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tire}
          onValueChange={() => setTire(!tire)}
          color={tire ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          สภาพยางเพลาที่ 1: ความลึก> 3 มม.
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tirehub}
          onValueChange={() => setTirehub(!tirehub)}
          color={tirehub ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          สภาพยางเพลาที่ 2: ความลึก> 3 มม.
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tirehub2}
          onValueChange={() => setTirehub2(!tirehub2)}
          color={tirehub2 ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          สภาพยางเพลาที่ 3: ความลึก> 3 มม.
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tirehub3}
          onValueChange={() => setTirehub3(!tirehub3)}
          color={tirehub3 ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          สภาพยางเพลาที่ 4: ความลึก> 3 มม.
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tirehub4}
          onValueChange={() => setTirehub4(!tirehub4)}
          color={tirehub4 ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          สภาพยางอะหลัย: มีพร้อมใช้งาน
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={spare}
          onValueChange={() => setSpare(!spare)}
          color={spare ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          แรงดันลมยาง: 130 ปอนด์
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={pressure}
          onValueChange={() => setPressure(!pressure)}
          color={pressure ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ถังดับเพลิง: จํานวน 2 ถังถังละ 6 กก.
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={extinguisher}
          onValueChange={() => setExtinguisher(!extinguisher)}
          color={extinguisher ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          หมอนหนุนล้อ: จํานวน 2 อัน
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={tiresupport}
          onValueChange={() => setTiresupport(!tiresupport)}
          color={tiresupport ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          กรวยจราจร: จํานวน 2 อัน
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={cone}
          onValueChange={() => setCone(!cone)}
          color={cone ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ไฟเบรก: ติดครบและส่องสว่าง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={breaklight}
          onValueChange={() => setBreaklight(!breaklight)}
          color={breaklight ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ไฟถอย: ติดครบและส่องสว่าง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={reverselight}
          onValueChange={() => setReverselight(!reverselight)}
          color={reverselight ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ไฟเลี้ยวไฟหรี่ท้าย: ติดครบและส่องสว่าง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={backturnlight}
          onValueChange={() => setBackturnlight(!backturnlight)}
          color={backturnlight ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ความมั่งคงแข็งแรง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={structuralintegrity}
          onValueChange={() => setStructuralintegrity(!structuralintegrity)}
          color={structuralintegrity ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ความมั่งคงแข็งแรง
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={fastener}
          onValueChange={() => setFastener(!fastener)}
          color={fastener ? "#4630EB" : undefined}
        />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          ผ้าใบปิดคลุม
        </Text>
        <CheckBox
          style={{marginLeft: 10, marginTop:8}}
          value={cover}
          onValueChange={() => setCover(!cover)}
          color={cover ? "#4630EB" : undefined}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
 );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
    paddingTop: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  wrapper: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    paddingVertical: 15,
  },
  text: {
    lineHeight: 30
  },
});