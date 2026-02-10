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
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};
    const maxProfiles = userData.maxProfiles || 2;

    const profilesSnap = await getDocs(collection(firestore, "users", userId, "profiles"));
    if (profilesSnap.size >= maxProfiles) {
      throw new Error(`Profile limit reached. You can only have ${maxProfiles} profiles.`);
    }

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
        language: "en", // Default language
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
        maxProfiles: userData.maxProfiles || 2,
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

// Access control operations
export const grantUserAccess = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days access

    await updateDoc(userRef, {
      hasAccess: true,
      accessGrantedDate: now.toISOString(),
      accessExpiryDate: expiryDate.toISOString(),
      lastPaymentDate: now.toISOString(),
      updatedAt: now,
      subscriptionPlan: "30_days",
      amountPaid: 1.99
    });
  } catch (error) {
    console.error("Error granting user access:", error);
    throw error;
  }
};

export const updateMaxProfiles = async (userId, maxProfiles) => {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      maxProfiles: parseInt(maxProfiles),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating max profiles:", error);
    throw error;
  }
};

export const revokeUserAccess = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      hasAccess: false,
      accessRevokedDate: new Date().toISOString(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error revoking user access:", error);
    throw error;
  }
};

export const checkUserAccess = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();

    // Check if user has access
    if (!userData.hasAccess) {
      return false;
    }

    // Check if access has expired (30-day rule)
    if (userData.accessExpiryDate) {
      const expiryDate = new Date(userData.accessExpiryDate);
      const now = new Date();

      if (now > expiryDate) {
        // Access expired on 31st day
        console.log("Access expired for user:", userId);
        await updateDoc(userRef, {
          hasAccess: false,
          accessExpiredDate: now.toISOString(),
          updatedAt: now
        });
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
};

export const getSubscriptionInfo = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        hasAccess: false,
        daysLeft: 0,
        expiryDate: null,
        isExpired: true
      };
    }

    const userData = userSnap.data();

    if (!userData.hasAccess || !userData.accessExpiryDate) {
      return {
        hasAccess: false,
        daysLeft: 0,
        expiryDate: null,
        isExpired: true
      };
    }

    const expiryDate = new Date(userData.accessExpiryDate);
    const now = new Date();
    const timeDiff = expiryDate - now;
    const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

    return {
      hasAccess: userData.hasAccess,
      daysLeft,
      expiryDate: userData.accessExpiryDate,
      isExpired: daysLeft === 0,
      accessGrantedDate: userData.accessGrantedDate,
      subscriptionPlan: userData.subscriptionPlan || "30_days"
    };
  } catch (error) {
    console.error("Error getting subscription info:", error);
    return {
      hasAccess: false,
      daysLeft: 0,
      expiryDate: null,
      isExpired: true
    };
  }
};

export const getAllUsers = async () => {
  try {
    const usersRef = collection(firestore, "users");
    const querySnapshot = await getDocs(usersRef);

    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Streak tracking operations
export const updateStreak = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const lastLogin = userData.lastLoginDate ? new Date(userData.lastLoginDate) : null;
      const lastLoginDay = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

      let currentStreak = userData.currentStreak || 0;
      let longestStreak = userData.longestStreak || 0;

      if (!lastLoginDay) {
        // First login
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((today - lastLoginDay) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Same day, don't update streak
          return { currentStreak, longestStreak };
        } else if (daysDiff === 1) {
          // Consecutive day
          currentStreak += 1;
        } else {
          // Streak broken
          currentStreak = 1;
        }
      }

      // Update longest streak if current is higher
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      await updateDoc(userRef, {
        currentStreak,
        longestStreak,
        lastLoginDate: now.toISOString(),
        updatedAt: now
      });

      return { currentStreak, longestStreak };
    } else {
      // First time user
      await setDoc(userRef, {  
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: now.toISOString(),
        createdAt: now,
        updatedAt: now
      }, { merge: true });

      return { currentStreak: 1, longestStreak: 1 };
    }
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
};

export const getStreak = async (userId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        lastLoginDate: userData.lastLoginDate || null
      };
    }

    return { currentStreak: 0, longestStreak: 0, lastLoginDate: null };
  } catch (error) {
    console.error("Error getting streak:", error);
    throw error;
  }
};

export const deleteUserFirestoreData = async (userId) => {
  try {
    // 1. Delete profiles sub-collection
    const profilesRef = collection(firestore, "users", userId, "profiles");
    const profilesSnap = await getDocs(profilesRef);
    const profileDeletions = profilesSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(profileDeletions);

    // 2. Delete settings sub-collection
    const settingsRef = collection(firestore, "users", userId, "settings");
    const settingsSnap = await getDocs(settingsRef);
    const settingsDeletions = settingsSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(settingsDeletions);

    // 3. Delete the main user document
    const userRef = doc(firestore, "users", userId);
    await deleteDoc(userRef);

    console.log(`Successfully deleted all Firestore data for user: ${userId}`);
  } catch (error) {
    console.error("Error deleting user Firestore data:", error);
    throw error;
  }
};

export const validateDeviceSession = async (userId, deviceId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // If no active device is set, or it matches the current one, all good
      if (!userData.activeDeviceId || userData.activeDeviceId === deviceId) {
        if (!userData.activeDeviceId) {
          await updateDoc(userRef, {
            activeDeviceId: deviceId,
            updatedAt: new Date()
          });
        }
        return { isValid: true };
      }

      // If it doesn't match, it means another device logged in more recently
      return { isValid: false, currentActiveDevice: userData.activeDeviceId };
    }

    // If user doc doesn't exist (unlikely at this stage), allow but warn
    return { isValid: true };
  } catch (error) {
    console.error("Error validating device session:", error);
    return { isValid: true }; // Fallback to allow usage if DB error
  }
};

export const registerActiveDevice = async (userId, deviceId) => {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      activeDeviceId: deviceId,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error registering active device:", error);
    return false;
  }
};
