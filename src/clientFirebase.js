import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const USER_PARAMETERS_COLLECTION_NAME = 'userParameters';
export const USER_INFO_COLLECTION_NAME = 'userInfo';

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

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(firebaseApp);
export const auth = getAuth();

/*
userParameters Collection
*/
export async function getUserParameters() {
    const user = auth.currentUser;
    if (!user) {
        return;
    }

    const docRef = doc(db, USER_PARAMETERS_COLLECTION_NAME, user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Document data:', data);
        return data;
    } else {
        // docSnap.data() will be undefined in this case
        return console.log('No such document!');
    }
}

export async function saveUserParameters(parameters) {
    const user = auth.currentUser;
    if (!user) {
        return;
    }

    await setDoc(
        doc(db, USER_PARAMETERS_COLLECTION_NAME, user.uid),
        parameters
    );

    return;
}

/*
userInfo Collection
*/
export async function saveUserInfo(parameters) {
    const user = auth.currentUser;
    if (!user) {
        return;
    }

    await setDoc(doc(db, USER_INFO_COLLECTION_NAME, user.uid), parameters, {
        merge: true,
    });
}

/*
Functions
*/
export function useAuth() {
    const [currentUser, setCurrentUser] = useState();
    const [currentUserLoading, setCurrentUserLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setCurrentUserLoading(false);
        });
        return unsub;
    }, []);

    return { currentUser, currentUserLoading };
}

export function logout() {
    signOut(auth);
}
