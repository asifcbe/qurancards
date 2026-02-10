import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getDoc, doc, setDoc, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCc6iuBbpVSpQA9bc08FsVK9eu2xLfrfcM",
  authDomain: "quranhifz.firebaseapp.com",
  projectId: "quranhifz",
  storageBucket: "quranhifz.firebasestorage.app",
  messagingSenderId: "236001290483",
  appId: "1:236001290483:web:9ddeec52cb8032934d6f86",
  measurementId: "G-ZNPK04N3KT"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);
export const signInAuthUserWithEmailAndPassword = async (email,password) => {
  if(!email || !password) return;
  return await signInWithEmailAndPassword(auth,email,password);
}

export const db = getFirestore();

export const createUserDocumentFromAuth = async (userAuth,additionalDetails={}) => {
  const userDocRef = doc(db, "users", userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);
  if(!userSnapshot.exists()){
    const {displayName,email} = userAuth;
    const createdAt = new Date();
  try{
    await setDoc(userDocRef,{
      displayName,
      email,
      createdAt,
      ...additionalDetails
    });
  } catch (error) {
    console.log("error creating the user", error.message);
  }
  }
  return userDocRef;
}


export const createAuthUserWithEmailAndPassword = async (email,password) => {
  if(!email || !password) return;
  return await createUserWithEmailAndPassword(auth,email,password);
} 


export const signOutUser = async () => await signOut(auth);


export const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth,callback);
}