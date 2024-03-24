import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import {
    createFacebookAdsFunction,
    deleteFacebookVideos,
} from './createFacebookAds.js';
import DropboxProcessor from './processors/DropboxProcessor.js';
import FacebookAdsProcessor from './processors/FacebookAdsProcessor.js';
import {
    getDropboxAuthUrl,
    getAuthTokensFromDropboxCodeAndRedirect,
} from './handleDropboxAuth.js';
import { verifyIdTokenAndGetUid } from './cloudHelpers.js';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

declare module 'express-serve-static-core' {
    interface Request {
        dropboxProcessor?: DropboxProcessor;
        facebookAdsProcessor?: FacebookAdsProcessor;
        uid?: string;
    }
}

dotenv.config();

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// remove access_key from env
const dropboxProcessor = new DropboxProcessor({
    appKey: process.env.DROPBOX_APP_KEY || '',
    appSecret: process.env.DROPBOX_APP_SECRET || '',
});

const facebookAdsProcessor = new FacebookAdsProcessor(
    {
        appId: process.env.FACEBOOK_APP_ID || '',
        appSecret: process.env.FACEBOOK_APP_SECRET || '',
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
        accountId: process.env.FACEBOOK_ACCOUNT_ID || '',
        pageId: process.env.FACEBOOK_PAGE_ID || '',
        apiVersion: '19.0',
    },
    false
);

function useDropboxProcessor(req: Request, res: Response, next: NextFunction) {
    req.dropboxProcessor = dropboxProcessor;
    next();
}

function useFacebookAdsProcessor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    req.facebookAdsProcessor = facebookAdsProcessor;
    next();
}

async function extractUidFromTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log('Extracting ID Token from header');
    try {
        /*
        The uid should only be added to the request by this middleware function
        Cloud functions use the admin Firestore, which doesnt respect the client Firestore rules
        */
        if (req.uid) {
            res.status(400).send('Unauthorized attempt detected.');
        }

        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            // console.log({ token });
            // req.firebaseIdToken = token;
            const uid = await verifyIdTokenAndGetUid(token);
            req.uid = uid;

            next();
        } else {
            res.status(401).send('Unable to extract ID Token');
        }
    } catch (e) {
        res.status(401).send('Unable to extract ID Token or uid');
    }
}

// app.use(extractUidFromTokenMiddleware);

app.get(
    '/process',
    extractUidFromTokenMiddleware,
    useDropboxProcessor,
    useFacebookAdsProcessor,
    createFacebookAdsFunction
);

app.get('/cleanup', useFacebookAdsProcessor, deleteFacebookVideos);

/* 
Dropbox Authorization Routes
*/

app.get(
    '/auth/dropbox',
    extractUidFromTokenMiddleware,
    useDropboxProcessor,
    getDropboxAuthUrl
);

app.get(
    '/auth/dropbox/callback',
    useDropboxProcessor,
    getAuthTokensFromDropboxCodeAndRedirect
);

export const api = onRequest(
    {
        timeoutSeconds: 540, //max is 540 seconds
        memory: '1GiB',
    },
    app
);
