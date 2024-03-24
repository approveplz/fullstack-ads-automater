import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const USER_PARAMETERS_COLLECTION_NAME = 'userParameters';
const USER_INFO_COLLECTION_NAME = 'userInfo';

/*
userParameters Collection
*/

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

const userParametersConverter = {
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
        .withConverter(userParametersConverter)
        .doc(uid)
        .get();

    const params = docSnap.data();

    if (!params) {
        throw new Error(`User parameters not found for uid: ${uid}`);
    }

    return params;
}

/*
userInfo Collection
*/
export interface UserInfo {
    dropboxAuthInfo?: {
        dropboxRefreshToken: string;
    };
}

const userInfoConverter = {
    toFirestore: (data: UserInfo) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as UserInfo,
};

export async function getUserInfoCloud(uid: string): Promise<UserInfo> {
    const db = await getFirestore();
    const docSnap = await db
        .collection(USER_INFO_COLLECTION_NAME)
        .withConverter(userInfoConverter)
        .doc(uid)
        .get();

    const params = docSnap.data();

    if (!params) {
        console.log(`User info not found for uid: ${uid}`);
    }

    return params || {};
}

export async function saveUserInfoCloud(uid: string, parameters: UserInfo) {
    const db = await getFirestore();
    return await db
        .collection(USER_INFO_COLLECTION_NAME)
        .doc(uid)
        .set(parameters, { merge: true });
}

/*
Cloud helper functions
*/

export async function verifyIdTokenAndGetUid(firebaseIdToken: string) {
    const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
    const uid = decodedToken.uid;
    return uid;
}
