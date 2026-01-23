import { onAuthStateChanged, signOut } from 'firebase/auth';
import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

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