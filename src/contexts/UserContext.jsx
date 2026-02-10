import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { getUserDocument, deleteUserFirestoreData } from '../firestoreDB';

export const UserContext = createContext({
    currentUser: null,
    loading: true,
    logout: () => null
});

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        
        return unsubscribe;
    }, []);

    const logout = async () => {
        if (currentUser) {
            try {
                const userData = await getUserDocument(currentUser.uid);
                const hasNeverSubscribed = !userData || !userData.accessGrantedDate;

                if (hasNeverSubscribed) {
                    await deleteUserFirestoreData(currentUser.uid);
                    const user = auth.currentUser;
                    if (user) {
                        await deleteUser(user);
                    }
                }
            } catch (err) {
                console.error("Error during account cleanup on logout:", err);
            }
        }
        await signOut(auth);
        setCurrentUser(null);
    };

    const value = { currentUser, loading, logout };
    
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}