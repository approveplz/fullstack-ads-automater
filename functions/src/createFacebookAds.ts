import dotenv from 'dotenv';
import path from 'path';
import { https, Response } from 'firebase-functions';
import { promises as fs } from 'fs';
import { onRequest } from 'firebase-functions/v2/https';

import {
    extractIdTokenFromHttpRequest,
    getUserParametersCloud,
    verifyIdTokenAndGetUid,
    UserParameters,
} from './cloudHelpers.js';

import DropboxProcessor from './processors/DropboxProcessor.js';
import FacebookAdsProcessor from './processors/FacebookAdsProcessor.js';
import { files as DropboxFiles } from 'dropbox/types/dropbox_types.js';
import { Campaign } from 'facebook-nodejs-business-sdk';

dotenv.config();

const tempLocalFolder = '/tmp'; // Google Cloud Functions temporary storage

const createFacebookAdsFunctionBatch = async (
    dropboxProcessor: DropboxProcessor,
    facebookAdsProcessor: FacebookAdsProcessor,
    {
        dropboxFiles,
        userParameters,
        campaign,
    }: {
        dropboxFiles: DropboxFiles.FileMetadataReference[];
        userParameters: UserParameters;
        campaign: Campaign;
    },
    index: number
) => {
    const {
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
        websiteUrl,
    } = userParameters;

    const fileOutputPaths = await dropboxProcessor.downloadFiles(
        dropboxFiles,
        tempLocalFolder
    );

    const uploadVideoPromises = fileOutputPaths.map(
        async (outputPath: string) => {
            const video = await facebookAdsProcessor.uploadAdVideo({
                name: path.basename(outputPath, path.extname(outputPath)),
                videoFilePath: outputPath,
            });
            const intervalMs = 10 * 1000;
            const timeoutMs = 3 * 60 * 1000;
            await facebookAdsProcessor.waitUntilVideoReady(
                video,
                intervalMs,
                timeoutMs
            );
            return video;
        }
    );
    const uploadedVideos = await Promise.all(uploadVideoPromises);

    const deleteLocalFilePromises = fileOutputPaths.map((outputPath: string) =>
        fs.unlink(outputPath)
    );
    await Promise.all(deleteLocalFilePromises);
    console.log(
        `Deleted ${deleteLocalFilePromises.length} files from local folder`
    );

    // Multiple videos map to one Ad Creative
    const adCreative = await facebookAdsProcessor.createAdCreative({
        name: `${adCreativeName} - ${index + 1}`,
        videos: uploadedVideos,
        bodies,
        titles,
        descriptions,
        website_url: websiteUrl,
    });

    const adSet = await facebookAdsProcessor.createAdSet({
        name: `${adSetName} - ${index + 1}`,
        campaign_id: campaign.id,
        bid_amount: bidAmount,
        billing_event: billingEvent,
        optimization_goal: optimizationGoal,
    });

    const ad = await facebookAdsProcessor.createAd({
        name: adName,
        adSet,
        creative: adCreative,
    });

    await dropboxProcessor.moveFiles(dropboxFiles, dropboxProcessedFolder);

    return ad;
};

export const createFacebookAdsFunction = onRequest(
    {
        timeoutSeconds: 540, //max is 540 seconds
        cors: true,
        memory: '1GiB',
    },
    async (req: https.Request, res: Response) => {
        try {
            const idToken = extractIdTokenFromHttpRequest(req);
            const uid = await verifyIdTokenAndGetUid(idToken);

            const userParameters = await getUserParametersCloud(uid);
            // console.log({ userParameters });

            const {
                dropboxInputFolder,
                campaignName,
                campaignObjective,
                bidStrategy,
                dailyBudget,
            } = userParameters;

            const dropboxProcessor = new DropboxProcessor({
                accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
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

            const dropboxFiles = await dropboxProcessor.getFilesFromFolder(
                dropboxInputFolder,
                10 // this can be anything
            );

            if (!dropboxFiles.length) {
                res.status(204).send('No files found');
            }

            const campaign = await facebookAdsProcessor.createCampaign({
                name: campaignName,
                objective: campaignObjective,
                bid_strategy: bidStrategy,
                daily_budget: dailyBudget,
            });

            const ads = [];

            const batchSize = 5; // Max of 5 creatives when using Dynamic Creative Ad
            /*
            Every AdSet can only have one Dynamic AdCreative, which can have five videos
            */
            for (let i = 0; i < dropboxFiles.length; i += batchSize) {
                let batchIndex = 0;
                const currentBatchDropboxFiles = dropboxFiles.slice(
                    i,
                    i + batchSize
                );
                const ad = await createFacebookAdsFunctionBatch(
                    dropboxProcessor,
                    facebookAdsProcessor,
                    {
                        dropboxFiles: currentBatchDropboxFiles,
                        userParameters,
                        campaign,
                    },
                    batchIndex
                );

                ads.push(ad);
                batchIndex += 1;
                console.log(`Finished processing batch: ${batchIndex + 1}`);
            }

            res.status(200).send(
                `Ads processing completed successfully. ${JSON.stringify(ads)}`
            );
        } catch (e) {
            console.error((e as Error).message);
            res.status(500).send('Error processing ads.');
        }
    }
);

// For testing
export const deleteFacebookVideos = onRequest(
    {
        cors: true,
    },
    async (req, res) => {
        const facebookAdsProcessor = new FacebookAdsProcessor(
            {
                appId: process.env.FACEBOOK_APP_ID || '',
                appSecret: process.env.FACEBOOK_APP_SECRET || '',
                accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
                accountId: process.env.FACEBOOK_ACCOUNT_ID || '',
                pageId: process.env.FACEBOOK_PAGE_ID || '',
                apiVersion: '19.0',
            },
            true
        );

        try {
            await facebookAdsProcessor.cleanup();
            res.status(200).send();
        } catch (e) {
            res.status(500).send();
        }
    }
);
