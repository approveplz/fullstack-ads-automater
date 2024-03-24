import { createContext, useState, useEffect } from 'react';
import { db, useAuth, USER_INFO_COLLECTION_NAME } from './clientFirebase.js'; 
import { doc, onSnapshot } from 'firebase/firestore';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    const currentUser = useAuth();

    const [userInfoFromFirestore, setUserInfoFromFirestore] = useState({});
    const [userInfoFromFirestoreLoading, setUserInfoFromFirestoreLoading] =
        useState(false);

    useEffect(() => {
        if (currentUser) {
            setUserInfoFromFirestoreLoading(true);
            const docRef = doc(db, USER_INFO_COLLECTION_NAME, currentUser.uid);
            const unsubscribeData = onSnapshot(
                docRef,
                (doc) => {
                    if (doc.exists()) {
                        setUserInfoFromFirestore(doc.data());
                    } else {
                        // Handle case where user document does not exist
                        setUserInfoFromFirestore({});
                    }
                    setUserInfoFromFirestoreLoading(false);
                },
                (error) => {
                    console.error(
                        `Failed to listen to user info changes: ${currentUser.uid}`,
                        error
                    );
                    setUserInfoFromFirestoreLoading(false);
                }
            );

            // Cleans up the document listener when the component unmounts or currentUser changes
            return unsubscribeData;
        } else {
            setUserInfoFromFirestore({});
            setUserInfoFromFirestoreLoading(false);
            // Do not need cleanup function because no listener was set
            return;
        }
    }, [currentUser]);

    return (
        <UserContext.Provider
            value={{
                currentUser,
                userInfoFromFirestore,
                userInfoFromFirestoreLoading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
