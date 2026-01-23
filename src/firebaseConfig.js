import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCc6iuBbpVSpQA9bc08FsVK9eu2xLfrfcM",
  authDomain: "quranhifz.firebaseapp.com",
  projectId: "quranhifz",
  storageBucket: "quranhifz.firebasestorage.app",
  messagingSenderId: "236001290483",
  appId: "1:236001290483:web:9ddeec52cb8032934d6f86",
  measurementId: "G-ZNPK04N3KT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;
