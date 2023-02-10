// Import the functions you need from the SDKs you need
import * as firebase from "firebase";
const secrets = require("./api-key");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = secrets.key 
// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

export { firebase };