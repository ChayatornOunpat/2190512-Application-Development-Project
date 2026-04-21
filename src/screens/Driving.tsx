import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  getMetadata,
  ref,
  uploadString,
} from 'firebase/storage';
import {
  onValue,
  ref as rtref,
  update as rtupdate,
} from 'firebase/database';
import { signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';

import { styles } from '../styles';
import { auth, storageRef, rtdb } from '../../firebase-config';
import { mapsKey } from '../../api-key';
import type { RootStackParamList } from '../types/navigation';

type Props = StackScreenProps<RootStackParamList, 'Driving'>;

type CheckpointField =
  | 'rest1'
  | 'rest2'
  | 'destination'
  | 'passRest1'
  | 'passRest2'
  | 'passDestination';

function buildDateTime(): { dateStr: string; dateTime: string } {
  const currentDate = new Date();
  const utcOffset = 7;
  const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
  const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
  const dateStr = utcDate.toISOString().slice(0, 10);
  const timeStr = utcDate.toISOString().slice(11, 19);
  return { dateStr, dateTime: `${dateStr} ${timeStr}` };
}

export const Driving = ({ navigation }: Props) => {
  const [plate, setPlate] = useState('');
  const [rest1, setRest1] = useState(false);
  const [rest2, setRest2] = useState(false);
  const [destination, setDestination] = useState(false);
  const [passRest1, setPassRest1] = useState(false);
  const [passRest2, setPassRest2] = useState(false);
  const [passDestination, setPassDestination] = useState(false);

  useEffect(() => {
    Geocoder.init(mapsKey);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/working`);
    onValue(workingRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        navigation.navigate('Primary');
      }
    });
  }, [navigation]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/rest1`);
    onValue(workingRef, (snapshot) => {
      setRest1(!!snapshot.val());
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/rest2`);
    onValue(workingRef, (snapshot) => {
      setRest2(!!snapshot.val());
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/destination`);
    onValue(workingRef, (snapshot) => {
      setDestination(!!snapshot.val());
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/passRest1`);
    onValue(workingRef, (snapshot) => {
      setPassRest1(!!snapshot.val());
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/passRest2`);
    onValue(workingRef, (snapshot) => {
      setPassRest2(!!snapshot.val());
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const workingRef = rtref(rtdb, `${user.uid}/passDestination`);
    onValue(workingRef, (snapshot) => {
      setPassDestination(!!snapshot.val());
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const plateRef = rtref(rtdb, `${user.uid}/plate`);
    onValue(plateRef, (plateSnapshot) => {
      const plateVal = plateSnapshot.val();
      setPlate(plateVal ?? '');
    });
  }, []);

  function handleSignOutPress() {
    signOut(auth)
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
        return results[0].formatted_address;
      }
    } catch (error) {
      alert((error as Error).message);
    }
    return undefined;
  }

  async function logCheckpoint(opts: {
    suffix: string;
    field: CheckpointField;
    includeLocation: boolean;
  }): Promise<void> {
    const { dateTime } = buildDateTime();
    const location = opts.includeLocation ? await getLocation() : undefined;
    const data: Record<string, string | undefined> = opts.includeLocation
      ? { time: dateTime, location }
      : { time: dateTime };
    const jsonData = JSON.stringify(data);

    const countRef = rtref(rtdb, `${plate}/usage`);
    const unsubscribe = onValue(countRef, (countSnapshot) => {
      unsubscribe();
      const count = countSnapshot.val();
      const dateRef = rtref(rtdb, `${plate}/refDate`);
      const stopListen = onValue(dateRef, (dateSnapshot) => {
        stopListen();
        const date = dateSnapshot.val();
        const dataRef = ref(storageRef, `${plate}_${date}_${count}_${opts.suffix}.json`);
        const upload = () =>
          uploadString(dataRef, jsonData)
            .then(() => alert('อัปโหลดข้อมูลสำเร็จ'))
            .catch((error: Error) => alert('เกิดปัญหาในการอัปโหลด: ' + error.message));
        getMetadata(dataRef).then(upload).catch(upload);
      });
    });

    const user = auth.currentUser;
    if (!user) return;
    const usersRef = rtref(rtdb, user.uid);
    rtupdate(usersRef, { [opts.field]: true })
      .then(() => console.log('success'))
      .catch((error: Error) => console.log(error));
  }

  const handleDestination = () =>
    logCheckpoint({ suffix: 'destination', field: 'destination', includeLocation: true });
  const handleRestOne = () =>
    logCheckpoint({ suffix: 'rest1', field: 'rest1', includeLocation: true });
  const handleRestTwo = () =>
    logCheckpoint({ suffix: 'rest2', field: 'rest2', includeLocation: true });
  const handlePassDestination = () =>
    logCheckpoint({ suffix: 'passDestination', field: 'passDestination', includeLocation: false });
  const handlePassRestOne = () =>
    logCheckpoint({ suffix: 'passRest1', field: 'passRest1', includeLocation: false });
  const handlePassRestTwo = () =>
    logCheckpoint({ suffix: 'passRest2', field: 'passRest2', includeLocation: false });

  async function handleEnd() {
    const { dateTime } = buildDateTime();
    const location = await getLocation();
    const data = { time: dateTime, location };
    const jsonData = JSON.stringify(data);

    const countRef = rtref(rtdb, `${plate}/usage`);
    const unsubscribe = onValue(countRef, (countSnapshot) => {
      unsubscribe();
      const count = countSnapshot.val();
      const dateRef = rtref(rtdb, `${plate}/refDate`);
      const stopListen = onValue(dateRef, (dateSnapshot) => {
        stopListen();
        const date = dateSnapshot.val();
        const dataRef = ref(storageRef, `${plate}_${date}_${count}_end.json`);
        const upload = () =>
          uploadString(dataRef, jsonData)
            .then(() => alert('อัปโหลดข้อมูลสำเร็จ'))
            .catch((error: Error) => alert('เกิดปัญหาในการอัปโหลด: ' + error.message));
        getMetadata(dataRef).then(upload).catch(upload);

        const usageRef = rtref(rtdb, `usage/${plate}`);
        const updateVal: Record<string, number> = {};
        updateVal[date] = count;
        rtupdate(usageRef, updateVal);

        const user = auth.currentUser;
        if (!user) return;
        const usersRef = rtref(rtdb);
        const dbobj: Record<string, Record<string, unknown>> = {};
        dbobj[user.uid] = {
          plate: null,
          working: false,
          rest1: null,
          rest2: null,
          destination: null,
        };
        dbobj[plate] = {
          active: false,
          user: null,
        };
        rtupdate(usersRef, dbobj)
          .then(() => console.log('success'))
          .catch((error: Error) => console.log(error));
      });
    });
  }

  return (
    <View style={styles.dlContainer}>
      <Text style={styles.plateTxt}>ทะเบียน: {plate}</Text>
      {!rest1 && (
        <TouchableOpacity style={styles.driveBtn} onPress={handleRestOne}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>จอดที่จุดบังคับจอดครั้งที่ 1</Text>
          </View>
        </TouchableOpacity>
      )}
      {rest1 && !passRest1 && (
        <TouchableOpacity style={styles.driveBtn} onPress={handlePassRestOne}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>ออกจากจุดบังคับจอดครั้งที่ 1</Text>
          </View>
        </TouchableOpacity>
      )}
      {!destination && (
        <TouchableOpacity style={styles.driveBtn} onPress={handleDestination}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>ถึงจุดหมายปลายทาง</Text>
          </View>
        </TouchableOpacity>
      )}
      {destination && !passDestination && (
        <TouchableOpacity style={styles.driveBtn} onPress={handlePassDestination}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>ออกจากจุดหมายปลายทาง</Text>
          </View>
        </TouchableOpacity>
      )}
      {!rest2 && (
        <TouchableOpacity style={styles.driveBtn} onPress={handleRestTwo}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>จอดที่จุดบังคับจอดครั้งที่ 2</Text>
          </View>
        </TouchableOpacity>
      )}
      {rest2 && !passRest2 && (
        <TouchableOpacity style={styles.driveBtn} onPress={handlePassRestTwo}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>ออกจากจุดบังคับจอดครั้งที่ 2</Text>
          </View>
        </TouchableOpacity>
      )}
      {destination && passDestination && (
        <TouchableOpacity style={styles.driveBtn} onPress={handleEnd}>
          <View style={styles.btnTxtView}>
            <Text style={styles.btnTxt}>เสร็จสิ้น</Text>
          </View>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.driveBtn} onPress={handleSignOutPress}>
        <View style={styles.btnTxtView}>
          <Text style={styles.btnTxt}>ออกจากระบบ</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
