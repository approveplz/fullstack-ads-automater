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

export interface UserParameters {
    campaignObjective: 'OUTCOME_TRAFFIC';
    bidStrategy: 'LOWEST_COST_WITH_BID_CAP';
    adCreativeName: string;
    adName: string;
    adSetName: string;
    dropboxProcessedFolder: string;
    bodies: string[];
    billingEvent: 'IMPRESSIONS';
    bidAmount: string;
    optimizationGoal: 'LANDING_PAGE_VIEWS';
    titles: string[];
    descriptions: string[];
    dropboxInputFolder: string;
    dailyBudget: string;
    websiteUrl: string;
    campaignName: string;
}

const userConverter = {
    toFirestore: (data: UserParameters) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as UserParameters,
};

export async function getUserParametersCloud(
    uid: string
): Promise<UserParameters> {
    const db = await getFirestore();
    const docSnap = await db
        .collection(USER_PARAMETERS_COLLECTION_NAME)
        .withConverter(userConverter)
        .doc(uid)
        .get();

    const params = docSnap.data();

    if (!params) {
        throw new Error(`User parameters not found for uid: ${uid}`);
    }

    return params;
}
