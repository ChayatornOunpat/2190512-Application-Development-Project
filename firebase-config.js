// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getStorage, ref, getMetadata, uploadString, getDownloadURL } from "firebase/storage";
import { getFirestore } from 'firebase/firestore';
import { firebaseKey } from './api-key.js';
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const firebaseConfig = firebaseKey
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage);
const db = getFirestore(app);
const auth = getAuth(app);


export { storage, storageRef, auth, db };
