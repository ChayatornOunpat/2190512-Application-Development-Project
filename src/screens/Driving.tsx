import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';

import { styles } from '../styles';
import { currentUser, signOut } from '../api/auth';
import {
  watchSessionField,
  markCheckpointReached,
  endSession,
} from '../api/sessions';
import { releasePlateLock } from '../api/plateLocks';
import {
  getCurrentSessionIndex,
  getCurrentSessionDate,
  recordHistoricalSession,
} from '../api/usage';
import {
  uploadCheckpointBlob,
  type CheckpointBlob,
  type CheckpointSuffix,
} from '../api/sessionBlobs';
import type { RootStackParamList } from '../types/navigation';

const mapsKey = '';

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
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'working', (value) => {
      if (!value) {
        navigation.navigate('Primary');
      }
    });
  }, [navigation]);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'rest1', (value) => {
      setRest1(!!value);
    });
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'rest2', (value) => {
      setRest2(!!value);
    });
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'destination', (value) => {
      setDestination(!!value);
    });
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'passRest1', (value) => {
      setPassRest1(!!value);
    });
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'passRest2', (value) => {
      setPassRest2(!!value);
    });
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'passDestination', (value) => {
      setPassDestination(!!value);
    });
  }, []);

  useEffect(() => {
    const user = currentUser.value;
    if (!user) return;
    watchSessionField(user.uid, 'plate', (value) => {
      setPlate(value ?? '');
    });
  }, []);

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
        return results[0].formatted_address;
      }
    } catch (error) {
      alert((error as Error).message);
    }
    return undefined;
  }

  async function logCheckpoint(opts: {
    suffix: CheckpointSuffix;
    field: CheckpointField;
    includeLocation: boolean;
  }): Promise<void> {
    const { dateTime } = buildDateTime();
    const location = opts.includeLocation ? await getLocation() : undefined;
    const blob: CheckpointBlob = opts.includeLocation
      ? { time: dateTime, location }
      : { time: dateTime };

    const count = await getCurrentSessionIndex(plate);
    const date = await getCurrentSessionDate(plate);
    if (date === null) return;
    try {
      await uploadCheckpointBlob(plate, date, count, opts.suffix, blob);
      alert('อัปโหลดข้อมูลสำเร็จ');
    } catch (error) {
      alert('เกิดปัญหาในการอัปโหลด: ' + (error as Error).message);
    }

    const user = currentUser.value;
    if (!user) return;
    markCheckpointReached(user.uid, opts.field)
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
    const blob: CheckpointBlob = { time: dateTime, location };

    const count = await getCurrentSessionIndex(plate);
    const date = await getCurrentSessionDate(plate);
    if (date === null) return;

    try {
      await uploadCheckpointBlob(plate, date, count, 'end', blob);
      alert('อัปโหลดข้อมูลสำเร็จ');
    } catch (error) {
      alert('เกิดปัญหาในการอัปโหลด: ' + (error as Error).message);
    }

    await recordHistoricalSession(plate, date, count);

    const user = currentUser.value;
    if (!user) return;
    try {
      await endSession(user.uid);
      await releasePlateLock(plate);
      console.log('success');
    } catch (error) {
      console.log(error);
    }
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
