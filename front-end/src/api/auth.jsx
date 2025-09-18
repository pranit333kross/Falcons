import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import firestore functions
import { auth, db, appId } from './firebase.jsx'; // Import db and appId

// --- UPDATED FUNCTION ---
// Now accepts a 'role' and creates a user document in Firestore.
export const signUp = async (email, password, role = 'student') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // After creating the user, create a document for them in Firestore
    const userDocRef = doc(db, `/artifacts/${appId}/users/${user.uid}`);
    await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: role, // 'student' or 'instructor'
        createdAt: serverTimestamp()
    });

    return userCredential;
};

// --- Other functions remain the same ---
export const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
    return firebaseSignOut(auth);
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const initialSignIn = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Initial authentication error:", error);
    }
};
