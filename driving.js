import React, {useEffect, useState} from "react";
import {getDownloadURL, getMetadata, ref, uploadString} from "firebase/storage";
import {update as rtupdate} from "firebase/database";
import {ref as rtref} from "firebase/database";
import {onValue} from "firebase/database";
import {auth, storage, storageRef, rtdb} from "./firebase-config";
import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "./styles";
import {signOut} from "firebase/auth";
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import {mapsKey} from "./api-key";

const Driving = ({navigation}) => {
    const [plate, setPlate] = useState('');
    const [rest1, setRest1] = useState(false);
    const [rest2, setRest2] = useState(false);
    const [destination, setDestination] = useState(false);
    const [passRest1, setPassRest1] = useState(false);
    const [passRest2, setPassRest2] = useState(false);
    const [passDestination, setPassDestination] = useState(false);

    useEffect(() => {
        Geocoder.init(mapsKey);
    }, [Geocoder])

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/working`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            if (!value) {
                navigation.navigate('Primary');
            }
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/rest1`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            setRest1(value)
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/rest2`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            setRest2(value)
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/destination`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            setDestination(value)
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/passRest1`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            setPassRest1(value)
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/passRest2`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            setPassRest2(value)
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const workingRef = rtref(rtdb, `${uid}/passDestination`);
        onValue(workingRef, (snapshot) => {
            const value = snapshot.val();
            setPassDestination(value)
        });
    }, []);

    useEffect(() => {
        const uid = auth.currentUser.uid
        const plateRef = rtref(rtdb, `${uid}/plate`);
        onValue(plateRef, (plateSnapshot) => {
            const plateVal = plateSnapshot.val();
            setPlate(plateVal)
        });
    }, []);

    function handleSignOutPress() {
        signOut(auth)
            .then(() => navigation.navigate('SignIn'))
            .catch(error => alert(error.message));

    }

    async function getLocation() {
        let {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        try {
            const response = await Geocoder.from({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            const {results} = response;
            if (results && results.length > 0) {
                const {formatted_address} = results[0];
                return formatted_address
            }
        } catch (error) {
            alert(error);
        }
    }

    async function handleDestination() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        const location = await getLocation()
        let data = {
            'time': dateTime,
            'location': location
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_destination.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
            });
        });
        const userID = auth.currentUser.uid
        const usersRef = rtref(rtdb, `${userID}`);
        console.log(userID)
        rtupdate(usersRef, {'destination': true}).then(() => {
            console.log('success');
        }).catch((error) => {
            console.log(error);
        });
    }

    async function handleEnd() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        const location = await getLocation()
        let data = {
            'time': dateTime,
            'location': location
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_end.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
                const usageRef = rtref(rtdb, 'usage');
                let updateVal = {}
                updateVal[plate] = count
                rtupdate(usageRef, updateVal)
                const usersRef = rtref(rtdb);
                const userID = auth.currentUser.uid
                let dbobj = {}
                console.log(userID)
                dbobj[userID] = {
                    'plate': null,
                    'working': false,
                    'rest1': null,
                    'rest2': null,
                    'destination': null,
                }
                dbobj[plate] = {
                    'active': false,
                    'user': null,
                }
                rtupdate(usersRef, dbobj).then(() => {
                    console.log('success');
                }).catch((error) => {
                    console.log(error);
                });
            });
        });
    }

    async function handleRestOne() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        const location = await getLocation()
        let data = {
            'time': dateTime,
            'location': location
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_rest1.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
            });
        });

        const userID = auth.currentUser.uid
        const usersRef = rtref(rtdb, `${userID}`);
        console.log(userID)
        rtupdate(usersRef, {'rest1': true}).then(() => {
            console.log('success');
        }).catch((error) => {
            console.log(error);
        });
    }

    async function handleRestTwo() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        const location = await getLocation()
        let data = {
            'time': dateTime,
            'location': location
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_rest2.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
            });
        });
        const userID = auth.currentUser.uid
        const usersRef = rtref(rtdb, `${userID}`);
        console.log(userID)
        rtupdate(usersRef, {'rest2': true}).then(() => {
            console.log('success');
        }).catch((error) => {
            console.log(error);
        });
    }

    function handlePassDestination() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        let data = {
            'time': dateTime,
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_passDestination.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
            });
        });
        const userID = auth.currentUser.uid
        const usersRef = rtref(rtdb, `${userID}`);
        console.log(userID)
        rtupdate(usersRef, {'passDestination': true}).then(() => {
            console.log('success');
        }).catch((error) => {
            console.log(error);
        });
    }

    function handlePassRestOne() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        let data = {
            'time': dateTime,
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_passRest1.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
            });
        });
        const userID = auth.currentUser.uid
        const usersRef = rtref(rtdb, `${userID}`);
        console.log(userID)
        rtupdate(usersRef, {'passRest1': true}).then(() => {
            console.log('success');
        }).catch((error) => {
            console.log(error);
        });
    }

    function handlePassRestTwo() {
        const currentDate = new Date();
        const utcOffset = 7;
        const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
        const utcDate = new Date(currentDate.getTime() + offsetMilliseconds);
        let dateStr = utcDate.toISOString().slice(0, 10);
        let timeStr = utcDate.toISOString().slice(11, 19);
        const dateTime = dateStr + ' ' + timeStr
        let data = {
            'time': dateTime,
        }
        let jsonData = JSON.stringify(data);

        // Create a file reference for the current date
        const countRef = rtref(rtdb, `${plate}/usage`)
        let unsubscribe = onValue(countRef, (countSnapshot) => {
            unsubscribe()
            const count = countSnapshot.val()
            const dateRef = rtref(rtdb, `${plate}/refDate`)
            let stopListen = onValue(dateRef, (dateSnapshot) => {
                stopListen()
                const date = dateSnapshot.val()
                let dataRef = ref(storageRef, `${plate}_${date}_${count}_passRest2.json`);

                // Check if a file with this name already exists
                getMetadata(dataRef)
                    .then((metadata) => {
                        // If the file exists, overwrite it with the new data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    })
                    .catch((error) => {
                        // If the file does not exist, create a new file with the data
                        uploadString(dataRef, jsonData)
                            .then(() => {
                                alert('อัปโหลดข้อมูลสำเร็จ');
                            })
                            .catch((error) => {
                                alert('เกิดปัญหาในการอัปโหลด:', error);
                            });
                    });
            });
        });
        const userID = auth.currentUser.uid
        const usersRef = rtref(rtdb, `${userID}`);
        console.log(userID)
        rtupdate(usersRef, {'passRest2': true}).then(() => {
            console.log('success');
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <View style={styles.dlContainer}>
            <Text style={styles.plateTxt}>plate: {plate}</Text>
            {!rest1 && (
                <TouchableOpacity style={styles.driveBtn} onPress={handleRestOne}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>rest 1</Text>
                    </View>
                </TouchableOpacity>
            )}
            {rest1 && !passRest1 && (
                <TouchableOpacity style={styles.driveBtn} onPress={handlePassRestOne}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>exit rest 1</Text>
                    </View>
                </TouchableOpacity>
            )}
            {!destination && (
                <TouchableOpacity style={styles.driveBtn} onPress={handleDestination}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>destination</Text>
                    </View>
                </TouchableOpacity>
            )}
            {destination && !passDestination && (
                <TouchableOpacity style={styles.driveBtn} onPress={handlePassDestination}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>exit destination</Text>
                    </View>
                </TouchableOpacity>
            )}
            {!rest2 && (
                <TouchableOpacity style={styles.driveBtn} onPress={handleRestTwo}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>rest 2</Text>
                    </View>
                </TouchableOpacity>
            )}
            {rest2 && !passRest2 && (
                <TouchableOpacity style={styles.driveBtn} onPress={handlePassRestTwo}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>exit rest 2</Text>
                    </View>
                </TouchableOpacity>
            )}
            {destination && passDestination && (
                <TouchableOpacity style={styles.driveBtn} onPress={handleEnd}>
                    <View style={styles.btnTxtView}>
                        <Text style={styles.btnTxt}>end</Text>
                    </View>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.driveBtn} onPress={handleSignOutPress}>
                <View style={styles.btnTxtView}>
                    <Text style={styles.btnTxt}>sign out</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}


export {Driving}