import admin from 'firebase-admin';
import {
    createFacebookAdsFunction,
    deleteFacebookVideos,
} from './createFacebookAds.js';

admin.initializeApp();

export const process = createFacebookAdsFunction;

export const deleteVideos = deleteFacebookVideos;
