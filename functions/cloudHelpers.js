import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

const USER_PARAMETERS_COLLECTION_NAME = 'userParameters';

export async function verifyIdTokenAndGetUid(idToken) {
    logger.log({ idToken });
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    return uid;
}

export const extractIdTokenFromHttpRequest = (req) => {
    logger.log('extract id token from header');
    logger.log({ headers: req.headers });
    logger.log({ getheaders: req.get('authorization') });
    const authHeader = req.headers['authorization'];
    logger.log({ authHeader });
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]; // Split the header and get the token part
    }
    return null;
};

export async function getUserParametersCloud(uid) {
    const db = await getFirestore();
    const docSnap = await db
        .collection(USER_PARAMETERS_COLLECTION_NAME)
        .doc(uid)
        .get();

    const params = docSnap.data();
    return params;
}
