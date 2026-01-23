import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";

// Profile operations
export const createProfile = async (userId, profileData) => {
  try {
    const profileRef = await addDoc(collection(firestore, "users", userId, "profiles"), {
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: profileRef.id, ...profileData };
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const getProfiles = async (userId) => {
  try {
    const querySnapshot = await getDocs(
      collection(firestore, "users", userId, "profiles")
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting profiles:", error);
    throw error;
  }
};

export const updateProfile = async (userId, profileId, updates) => {
  try {
    const profileRef = doc(
      firestore,
      "users",
      userId,
      "profiles",
      profileId
    );
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const deleteProfile = async (userId, profileId) => {
  try {
    await deleteDoc(
      doc(firestore, "users", userId, "profiles", profileId)
    );
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
};

// Settings operations
export const getSettings = async (userId) => {
  try {
    const settingsRef = doc(firestore, "users", userId, "settings", "default");
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return settingsSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting settings:", error);
    throw error;
  }
};

export const updateSettings = async (userId, settings) => {
  try {
    const settingsRef = doc(firestore, "users", userId, "settings", "default");
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

export const initializeUserSettings = async (userId) => {
  try {
    const settingsRef = doc(firestore, "users", userId, "settings", "default");
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        reciter: 7, // Mishary
        repetitions: 5,
        theme: "light",
        scriptType: "quran-uthmani",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
    throw error;
  }
};

// User document operations
export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(firestore, "users", userId);
    await setDoc(
      userRef,
      {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};
