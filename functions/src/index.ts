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
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

declare module 'express-serve-static-core' {
    interface Request {
        dropboxProcessor?: DropboxProcessor;
        facebookAdsProcessor?: FacebookAdsProcessor;
    }
}

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

app.get(
    '/process',
    useDropboxProcessor,
    useFacebookAdsProcessor,
    createFacebookAdsFunction
);

app.get('/cleanup', useFacebookAdsProcessor, deleteFacebookVideos);

/* 
Dropbox Authorization Routes
*/

app.get('/auth/dropbox', useDropboxProcessor, getDropboxAuthUrl);

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
