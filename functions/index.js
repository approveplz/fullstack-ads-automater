// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp();

export const helloWorld = onRequest(async (req, res) => {
    // debugger;
    const name = req.params[0];
    const item = { lamp: 'test lamp', chair: 'test chair' };
    const message = item[name];
    res.send(`<h1>${message}</h1>`);
});

// http://127.0.0.1:5001/facebook-ads-automater/us-central1/addMessage?text=uppercaseme
export const addMessage = onRequest(async (req, res) => {
    // debugger;
    const value = req.query.text;

    const writeResult = await getFirestore()
        .collection('messages')
        .add({ testKey: value });

    res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// I dont think this works w/o the firestore emulator running
// I dont have java, so i cant start the firestore emulator
// functions emulator works though

// export const makeUpperCase = onDocumentCreated(
//     '/messages/{documentId}',
//     (event) => {
//         debugger;
//         // Grab the current value of what was written to Firestore.
//         const original = event.data.data().testKey;
//         // Access the parameter `{documentId}` with `event.params`
//         logger.log('Uppercasing', event.data.data().testKey);
//         const uppercase = original.toUpperCase();

//         // You must return a Promise when performing
//         // asynchronous tasks inside a function
//         // such as writing to Firestore.
//         // Setting an 'uppercase' field in Firestore document returns a Promise.
//         return event.data.ref.set({ uppercase }, { merge: true });
//     }
// );
