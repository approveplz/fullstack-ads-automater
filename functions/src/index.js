import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import {
    createFacebookAdsFunction,
    deleteFacebookVideos,
} from './createFacebookAds.js';

import express from 'express';
import cors from 'cors';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

app.get('/process', createFacebookAdsFunction);

app.get('/cleanup', deleteFacebookVideos);

export const api = onRequest(
    {
        timeoutSeconds: 540, //max is 540 seconds
        memory: '1GiB',
    },
    app
);

// export const process = createFacebookAdsFunction;

// export const deleteVideos = deleteFacebookVideos;
