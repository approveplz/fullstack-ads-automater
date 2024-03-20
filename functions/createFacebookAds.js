// Import necessary modules and initialize environment configurations
import dotenv from 'dotenv';
import path from 'path';
import { logger } from 'firebase-functions';
import { promises as fs } from 'fs';
import { onRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';

import {
    extractIdTokenFromHttpRequest,
    getUserParametersCloud,
    verifyIdTokenAndGetUid,
} from './cloudHelpers.js';

import DropboxProcessor from './processors/DropboxProcessor.js';
import FacebookAdsProcessor from './processors/FacebookAdsProcessor.js';

// Initialize environment variables
dotenv.config();

// Define constants
const tempLocalFolder = '/tmp'; // Google Cloud Functions temporary storage

export const createFacebookAdsFunction = onRequest(
    {
        timeoutSeconds: 540, //max is 540 seconds
        // memory: '1GiB',
    },
    async (req, res) => {
        // Initialize processors with configuration from environment variables

        const idToken = extractIdTokenFromHttpRequest(req);

        const uid = await verifyIdTokenAndGetUid(idToken);

        const userParameters = await getUserParametersCloud(uid);
        console.log({ userParameters });

        const {
            campaignObjective,
            bidStrategy,
            adCreativeName,
            adName,
            adSetName,
            dropboxProcessedFolder,
            bodies,
            billingEvent,
            bidAmount,
            optimizationGoal,
            titles,
            descriptions,
            dropboxInputFolder,
            dailyBudget,
            websiteUrl,
            campaignName,
        } = userParameters;

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
            const files = await dropboxProcessor.getFilesFromFolder(
                dropboxInputFolder,
                5
            );

            if (!Object.keys(files).length) {
                return res.status(204).send('No files found');
            }

            const fileOutputPaths = await dropboxProcessor.downloadFiles(
                files,
                tempLocalFolder
            );

            await dropboxProcessor.moveFiles(files, dropboxProcessedFolder);

            const uploadVideoPromises = fileOutputPaths.map(
                async (outputPath) => {
                    const video = await facebookAdsProcessor.uploadAdVideo({
                        name: path.basename(
                            outputPath,
                            path.extname(outputPath)
                        ),
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
                }
            );
            const uploadedVideos = await Promise.all(uploadVideoPromises);

            const deleteLocalFilePromises = fileOutputPaths.map((outputPath) =>
                fs.unlink(outputPath)
            );
            await Promise.all(deleteLocalFilePromises);
            console.log(
                `Deleted ${deleteLocalFilePromises.length} files from local folder`
            );

            const campaign = await facebookAdsProcessor.createCampaign({
                name: campaignName,
                objective: campaignObjective,
                bid_strategy: bidStrategy,
                daily_budget: dailyBudget,
            });

            const adCreatives = await facebookAdsProcessor.createAdCreatives({
                name: adCreativeName,
                videos: uploadedVideos,
                bodies,
                titles,
                descriptions,
                website_url: websiteUrl,
            });
            const adSetsWithCreativesPromises = adCreatives.map(
                async (creative, index) => {
                    const adSet = await facebookAdsProcessor.createAdSet({
                        name: `${adSetName} - ${index + 1}`,
                        campaign_id: campaign.id,
                        bid_amount: bidAmount,
                        billing_event: billingEvent,
                        optimization_goal: optimizationGoal,
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

            return res
                .status(200)
                .send(
                    `Ads processing completed successfully. ${JSON.stringify(
                        ads
                    )}`
                );
        } catch (e) {
            console.error(e.message);
            return res.status(500).send('Error processing ads.');
        }
    }
);

export const deleteFacebookVideos = onRequest(async (req, res) => {
    debugger;

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
        await facebookAdsProcessor.cleanup();
        return res.status(200).send();
    } catch (e) {
        return res.status(500).send();
    }
});
