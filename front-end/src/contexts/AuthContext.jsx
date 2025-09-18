import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, initialSignIn } from '../api/auth.jsx';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../api/firebase.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let firestoreUnsubscribe = null;

        const authUnsubscribe = onAuthChange((userAuth) => {
            if (userAuth) {
                const userDocRef = doc(db, `/artifacts/${appId}/users/${userAuth.uid}`);
                firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUser({
                            uid: userAuth.uid,
                            email: userAuth.email,
                            ...docSnap.data()
                        });
                    } else {
                        // If Firestore doc doesn't exist, still set user with auth info
                        setUser({
                            uid: userAuth.uid,
                            email: userAuth.email
                        });
                    }
                    setLoading(false);
                });
            } else {
                setUser(null);
                setLoading(false);
                // Unsubscribe from Firestore listener if it exists
                if (firestoreUnsubscribe) {
                    firestoreUnsubscribe();
                    firestoreUnsubscribe = null;
                }
            }
        });

        initialSignIn();

        // Cleanup both listeners on unmount
        return () => {
            authUnsubscribe();
            if (firestoreUnsubscribe) firestoreUnsubscribe();
        };
    }, []);

    const value = { user, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};