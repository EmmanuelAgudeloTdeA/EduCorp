// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArj-AUlB8YDDnVXcSgdffDCqn0NKuVBGA",
  authDomain: "educorp-67222.firebaseapp.com",
  projectId: "educorp-67222",
  storageBucket: "educorp-67222.firebasestorage.app",
  messagingSenderId: "957217691651",
  appId: "1:957217691651:web:e8ca9a5d70655477e21636"
};

// Initialize Firebase
export const appFirebase = initializeApp(firebaseConfig);
export const auth = getAuth(appFirebase);
export const db = getFirestore(appFirebase);
export default appFirebase;