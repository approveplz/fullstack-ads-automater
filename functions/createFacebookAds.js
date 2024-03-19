// Import necessary modules and initialize environment configurations
import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';

// Import your custom modules
import DropboxProcessor from './DropboxProcessor.js';
import FacebookAdsProcessor from './FacebookAdsProcessor.js';

// Initialize Firebase Admin SDK
initializeApp();

// Initialize environment variables
dotenv.config();

// Define constants
const dropboxInputFolder = '/input-media';
const tempLocalFolder = '/tmp'; // Google Cloud Functions temporary storage
const dropboxProcessedFolder = '/processed-media';
const adCampaignName = 'Campaign name';
const adName = 'Ad Name';
const bodies = [
    'body text 1',
    'body text 2',
    'body text 3',
    'body text 4',
    'body text 5',
];
const titles = [
    'title text 1',
    'title text 2',
    'title text 3',
    'title text 4',
    'title text 5',
];
const descriptions = [
    'description text 1',
    'description text 2',
    'description text 3',
    'description text 4',
    'description text 5',
];
const website_url = 'https://onno.com';
const adCreativeName = 'Ad Creative Name';
const adSetName = 'Ad Set Name';

// Define the Google Cloud Function
export const processAds = onRequest(async (req, res) => {
    // Initialize processors with configuration from environment variables
    const dropboxProcessor = new DropboxProcessor({
        accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    });

    const facebookAdsProcessor = new FacebookAdsProcessor(
        {
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
            accountId: process.env.FACEBOOK_ACCOUNT_ID,
            pageId: process.env.FACEBOOK_PAGE_ID,
            apiVersion: '19.0',
        },
        false
    );

    try {
        // Process logic as per your original script
        const files = await dropboxProcessor.getFilesFromFolder(
            dropboxInputFolder,
            5
        );
        const fileOutputPaths = await dropboxProcessor.downloadFiles(
            files,
            tempLocalFolder
        );
        await dropboxProcessor.moveFiles(files, dropboxProcessedFolder);
        const uploadVideoPromises = fileOutputPaths.map(async (outputPath) => {
            const video = await facebookAdsProcessor.uploadAdVideo({
                name: path.basename(outputPath, path.extname(outputPath)),
                videoFilePath: outputPath,
            });
            const intervalMs = 10 * 1000;
            const timeoutMs = 3 * 60 * 1000;
            await facebookAdsProcessor.waitUntilVideoReady(
                video.id,
                intervalMs,
                timeoutMs
            );
            return video;
        });
        const uploadedVideos = await Promise.all(uploadVideoPromises);
        console.log(uploadedVideos);
        const deleteLocalFilePromises = fileOutputPaths.map((outputPath) =>
            fs.unlink(outputPath)
        );
        await Promise.all(deleteLocalFilePromises);
        console.log(
            `Deleted ${deleteLocalFilePromises.length} files from local folder`
        );
        const campaign = await facebookAdsProcessor.createCampaign({
            name: adCampaignName,
        });
        const adCreatives = await facebookAdsProcessor.createAdCreatives({
            name: adCreativeName,
            videos: uploadedVideos,
            bodies,
            titles,
            descriptions,
            website_url,
        });
        const adSetsWithCreativesPromises = adCreatives.map(
            async (creative, index) => {
                const adSet = await facebookAdsProcessor.createAdSet({
                    name: `${adSetName} - ${index + 1}`,
                    campaign_id: campaign.id,
                    bid_amount: '1',
                    billing_event: 'IMPRESSIONS',
                });
                return { adSet, creative };
            }
        );
        const adSetsWithCreatives = await Promise.all(
            adSetsWithCreativesPromises
        );
        const ads = await facebookAdsProcessor.createAds({
            name: adName,
            adSetsWithCreatives,
        });
        res.status(200).send('Ads processing completed successfully.');
    } catch (e) {
        console.error(e);
        res.status(500).send('Error processing ads.');
    }
});
