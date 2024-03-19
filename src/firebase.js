import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

// Safe to use clientside
const firebaseConfig = {
    apiKey: 'AIzaSyDwE5mwUstxtZkB-LhaP1u3t5CF_IGy1hc',
    authDomain: 'facebook-ads-automater.firebaseapp.com',
    projectId: 'facebook-ads-automater',
    storageBucket: 'facebook-ads-automater.appspot.com',
    messagingSenderId: '437509814455',
    appId: '1:437509814455:web:17d78867a8d5cd31cff532',
    measurementId: 'G-M5Q6Q95KDW',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth();

export function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function useAuth() {
    const [currentUser, setCurrentUser] = useState();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return unsub;
    }, []);

    return currentUser;
}

export function logout() {
    signOut(auth);
}
