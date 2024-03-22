import admin from 'firebase-admin';
import {
    createFacebookAdsFunction,
    deleteFacebookVideos,
} from './createFacebookAds.js';

admin.initializeApp();

// // http://127.0.0.1:5001/facebook-ads-automater/us-central1/addMessage?text=uppercaseme
// export const addMessage = onRequest(async (req, res) => {
//     const value = req.query.text;

//     const writeResult = await getFirestore()
//         .collection('messages')
//         .add({ testKey: value });

//     res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

export const process = createFacebookAdsFunction;

export const deleteVideos = deleteFacebookVideos;
