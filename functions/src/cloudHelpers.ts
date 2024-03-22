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
    logger.log('extract id token from header');
    logger.log({ headers: req.headers });
    logger.log({ getheaders: req.get('authorization') });
    const authHeader = req.headers['authorization'];
    logger.log({ authHeader });
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

export function getEnvVariable(name: string | undefined): string {
    if (name === undefined || process.env[name] === undefined) {
        throw new Error(`Environment variable ${name} is not set.`);
    }

    const value = process.env[name];
    if (typeof value === 'string') {
        return value;
    } else {
        throw new Error(`Environment variable ${name} is not of type String.`);
    }
}
