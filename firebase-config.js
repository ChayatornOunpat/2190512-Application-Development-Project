// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore/lite';
import { firebaseKey } from './api-key.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//const firebaseConfig = secrets.key
// Initialize Firebase
const firebaseConfig = firebaseKey
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
