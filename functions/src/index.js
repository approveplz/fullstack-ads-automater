import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import {
    createFacebookAdsFunction,
    deleteFacebookVideos,
} from './createFacebookAds.js';

import DropboxProcessor from './processors/DropboxProcessor.js';

import {
    getDropboxAuthUrl,
    getAuthTokensFromDropboxCodeAndRedirect,
} from './handleDropboxAuth.js';

import express from 'express';
import cors from 'cors';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const dropboxProcessor = new DropboxProcessor({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
    appKey: process.env.DROPBOX_APP_KEY || '',
    appSecret: process.env.DROPBOX_APP_SECRET || '',
});

function useDropboxProcessor(req, res, next) {
    req.dropboxProcessor = dropboxProcessor;
    next();
}

app.get('/process', createFacebookAdsFunction);

app.get('/cleanup', deleteFacebookVideos);

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

// export const process = createFacebookAdsFunction;

// export const deleteVideos = deleteFacebookVideos;
