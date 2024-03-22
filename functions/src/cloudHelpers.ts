import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger, https } from 'firebase-functions';

const USER_PARAMETERS_COLLECTION_NAME = 'userParameters';

export async function verifyIdTokenAndGetUid(idToken: string) {
    logger.log({ idToken });
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    return uid;
}

export const extractIdTokenFromHttpRequest = (req: https.Request) => {
    logger.log('Extracting ID Token from header');
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]; // Split the header and get the token part
    } else {
        throw new Error('Unable to extract ID Token ');
    }
};

export async function getUserParametersCloud(uid: string) {
    const db = await getFirestore();
    const docSnap = await db
        .collection(USER_PARAMETERS_COLLECTION_NAME)
        .doc(uid)
        .get();

    const params = docSnap.data();

    if (!params) {
        throw new Error(`User parameters not found for uid: ${uid}`);
    }

    return params;
}
