// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore/lite';
import { getStorage, ref, getMetadata, uploadString } from "firebase/storage";
import { firebaseKey } from './api-key.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const firebaseConfig = firebaseKey
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage();
const storageRef = ref(storage);
const auth = getAuth(app);


export { db, storage, storageRef, ref, uploadString, getMetadata, auth };
