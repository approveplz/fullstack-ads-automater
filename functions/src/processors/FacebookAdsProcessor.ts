import axios from 'axios';
import moment from 'moment';
// @ts-ignore
import { promises as fs, createReadStream } from 'fs';
import FormData from 'form-data';
import {
    FacebookAdsApi,
    AdAccount,
    AdCreative,
    AdSet,
    Ad,
} from 'facebook-nodejs-business-sdk';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';

import { logger } from 'firebase-functions/v1';
import path from 'path';

interface FbApiCreateCampaignParams {
    name: string;
    objective: string;
    bid_strategy: string;
    daily_budget: string;
    special_ad_categories?: string[];
    status?: 'PAUSED';
    promoted_object?: {
        pixel_id: string;
        custom_event_type: string;
        application_id: string;
    };
}

interface FbApiCreateAdSetParams {
    name: string;
    campaign_id: string;
    bid_amount: string;
    billing_event: string;
    start_time?: string;
    bid_strategy?: string;
    end_time?: string;
    optimization_goal?: string;
    status?: 'PAUSED';
    targeting?: {
        geo_locations: {
            countries: string[];
        };
        targeting_automation?: {
            advantage_audience: number;
        };
    };
    is_dynamic_creative?: boolean;
}

interface FbApiCreateAdCreativeParams {
    name: string;
    videos: FbApiVideo[];
    bodies: string[];
    titles: string[];
    descriptions: string[];
    website_url: string;
}

interface FbApiCreateAdParams {
    name: string;
    adset_id: string;
    creative: {
        creative_id: string;
    };
    status?: 'PAUSED';
}

// Objects
interface FbApiAdCreativeObjStorySpec {
    page_id: string;
}

interface FbApiAdCreativeAssetSpec {
    videos: { video_id: string }[];
    bodies: { text: string }[];
    titles: { text: string }[];
    descriptions: { text: string }[];
    ad_formats: string[];
    call_to_action_types: string[];
    link_urls: { website_url: string }[];
    images?: string[];
}

interface FbApiVideo {
    id: string;
}

export default class FacebookAdsProcessor {
    // @ts-ignore
    private appId: string;
    // @ts-ignore
    private appSecret: string;
    private accessToken: string;
    private accountId: string;
    private pageId: string;
    private apiVersion: string;
    private adAccount: AdAccount;
    private ffmpeg: FfmpegCommand;

    constructor(options: {
        appId: string;
        appSecret: string;
        accessToken: string;
        accountId: string;
        pageId: string;
        apiVersion?: string;
    }) {
        this.validateRequiredOptions(options);

        const {
            appId,
            appSecret,
            accessToken,
            accountId,
            pageId,
            apiVersion = '19.0',
        } = options;

        this.appId = appId;
        this.appSecret = appSecret;
        this.accessToken = accessToken;
        this.accountId = accountId;
        this.pageId = pageId;
        this.apiVersion = apiVersion;

        FacebookAdsApi.init(accessToken);

        this.adAccount = new AdAccount(`act_${this.accountId}`);
        this.ffmpeg = ffmpeg();

        console.log('Initialized FacebookAdsProcessor');
    }

    private validateRequiredOptions(options: { [key: string]: any }): void {
        const { appId, appSecret, accessToken, accountId, pageId } = options;
        if (!appId) throw new Error('appId is required but was not provided');
        if (!appSecret)
            throw new Error('appSecret is required but was not provided');
        if (!accessToken)
            throw new Error('accessToken is required but was not provided');
        if (!accountId)
            throw new Error('accountId is required but was not provided');
        if (!pageId) throw new Error('pageId is required but was not provided');
    }

    logApiCallResult(apiCallName: string, data: any) {
        console.log(apiCallName);
        console.log('Data:' + JSON.stringify(data, null, 2));
    }

    async reduceVideoQualityIfNeeded(filePath: string) {
        // console.log('reduce quality if needed called');
        // console.log({ filePath });
        const ffmpegProbePromise = new Promise((resolve, reject) => {
            this.ffmpeg.input(filePath).ffprobe((error, data) => {
                if (error) {
                    console.log({ error });
                    reject(error);
                } else {
                    console.log({ data });
                    resolve(data);
                }
            });
        });

        const fileMetadata = (await ffmpegProbePromise) as {
            format: { size: string };
        };

        console.log({ fileMetadata });

        const {
            format: { size: sizeBytes },
        } = fileMetadata;

        const maxMb = 100;
        const maxBytes = 1024 * 1024 * maxMb;

        let outputPath = filePath;

        // Lower video bitrate and change output path
        if (parseInt(sizeBytes) > maxBytes) {
            console.log(`reducing bitrate for ${filePath}`);
            const changeVideoBitRatePromise = new Promise((resolve, reject) => {
                const fileDir = path.dirname(filePath);
                const fileExt = path.extname(filePath);
                const fileBase = path.basename(filePath, fileExt);

                const outputPath = path.join(
                    fileDir,
                    `${fileBase}-reduced${fileExt}`
                );

                this.ffmpeg
                    .input(filePath)
                    // Found through trial and error
                    .videoBitrate('20000k')
                    .on('end', () => {
                        console.log(`Reduced video saved at ${outputPath}`);
                        resolve(outputPath);
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
                    .save(outputPath);
            });

            outputPath = (await changeVideoBitRatePromise) as string;
            await fs.unlink(filePath);
        }
        return outputPath;
    }

    async uploadAdVideo(params: {
        name: string;
        videoFilePath: string;
    }): Promise<FbApiVideo> {
        const { name, videoFilePath } = params;

        console.log(`Uploading video to Facebook. Path: ${videoFilePath}`);
        const url = `https://graph.facebook.com/v${this.apiVersion}/${this.adAccount.id}/advideos`;

        const formdata = new FormData();
        formdata.append('name', name);
        formdata.append('access_token', this.accessToken);
        formdata.append('source', createReadStream(videoFilePath));

        const requestOptions = {
            method: 'post',
            url,
            data: formdata,
        };

        const response = await axios.request(requestOptions);
        const data = response.data;

        return data;
    }

    async getVideoUploadStatus(video: FbApiVideo) {
        const params = new URLSearchParams({
            access_token: this.accessToken,
            fields: 'status',
        });
        const url = `https://graph.facebook.com/v${this.apiVersion}/${video.id}?${params}`;

        let requestOptions = {
            method: 'get',
            url,
        };

        const response = await axios.request(requestOptions);
        const data = response.data.status['video_status'];
        return data;
    }

    async waitUntilVideoReady(
        video: FbApiVideo,
        intervalMs: number,
        timeoutMs: number
    ) {
        console.log(`Waiting for videoId: ${video.id} to finish processing`);
        const startTime = new Date().getTime();
        let status = '';

        while (true) {
            status = await this.getVideoUploadStatus(video);
            if (status != 'processing') {
                break;
            } else if (startTime + timeoutMs <= new Date().getTime()) {
                throw Error(`Video encoding timeout. Timeout: ${timeoutMs}`);
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        if (status != 'ready') {
            throw Error(`Failed. Video status: ${status}`);
        }
        console.log(`videoId: ${video.id} has finished processing`);
    }

    async createCampaign({
        name,
        special_ad_categories = [],
        // objective = 'OUTCOME_SALES', // double check w/ mak that this is the right one, but i think it is. it wont work with the adset optimization goal
        objective = 'OUTCOME_TRAFFIC',
        bid_strategy = 'LOWEST_COST_WITH_BID_CAP',
        daily_budget = '2000',
        status = 'PAUSED',
    }: FbApiCreateCampaignParams) {
        console.log(`Creating Facebook Ad campaign. Name: ${name}`);

        const campaign = await this.adAccount.createCampaign([], {
            name,
            status,
            objective,
            special_ad_categories,
            // promoted_object: {
            //     pixel_id: '327300203660662',
            //     custom_event_type: 'INITIATED_CHECKOUT',
            //     application_id: app_id,
            // },
            bid_strategy,
            daily_budget,
        });

        this.logApiCallResult(`Campaign created. ID: ${campaign.id}`, campaign);

        return campaign;
    }

    async createAdSet({
        name,
        campaign_id,
        bid_amount,
        billing_event,
        start_time = '0', //UTC unix timestamp. ex 2015-03-12 23:59:59-07:00
        bid_strategy = 'LOWEST_COST_WITH_BID_CAP',
        // destination_type = 'WEBSITE',
        end_time = '0',
        // optimization_goal = 'OFFSITE_CONVERSIONS', //https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/#odax
        optimization_goal = 'LANDING_PAGE_VIEWS',
        status = 'PAUSED',
        targeting = {
            geo_locations: {
                countries: ['US'],
            },
            // Turn on advantage+ audience
            targeting_automation: {
                advantage_audience: 1,
            },
        },
        // promoted_object = {
        //     pixel_id: '327300203660662',
        //     custom_event_type: 'TEST',
        //     application_id: app_id,
        // },
        // daily_budget,
        is_dynamic_creative = true,
    }: FbApiCreateAdSetParams): Promise<AdSet> {
        if (start_time === '0') {
            const now = moment();
            const oneHourLater = now.add(1, 'hours');
            const oneHourLaterUnixTimestamp = oneHourLater.unix();
            start_time = oneHourLaterUnixTimestamp.toString();
        }

        const adSet = await this.adAccount.createAdSet([], {
            campaign_id,
            bid_amount,
            bid_strategy,
            // destination_type,
            name,
            start_time,
            end_time,
            optimization_goal,
            status,
            targeting,
            // lifetime_budget,
            // daily_budget,
            billing_event,
            // promoted_object,
            is_dynamic_creative,
        });

        this.logApiCallResult(`AdSet created. ID: ${adSet.id}`, adSet);

        return adSet;
    }

    createAdCreativeObjectStorySpec({
        page_id,
    }: {
        page_id: string;
    }): FbApiAdCreativeObjStorySpec {
        const objectStorySpec = {
            page_id,
        };

        return objectStorySpec;
    }

    createAdCreativeAssetFeedSpec(params: {
        videos: FbApiVideo[];
        bodies: string[];
        titles: string[];
        descriptions: string[];
        website_url: string;
        images?: string[];
    }): FbApiAdCreativeAssetSpec {
        const {
            images = [],
            videos,
            bodies,
            titles,
            descriptions,
            website_url,
        } = params;

        const assetFeedSpec = {
            images,
            videos: videos.map((video) => ({
                video_id: video.id,
            })),
            bodies: bodies.map((body) => ({ text: body })),
            titles: titles.map((title) => ({ text: title })),
            descriptions: descriptions.map((desc) => ({ text: desc })),
            ad_formats: ['SINGLE_VIDEO'],
            call_to_action_types: ['SHOP_NOW'],
            link_urls: [{ website_url }],
        };

        return assetFeedSpec;
    }

    async createAdCreative({
        name,
        videos,
        bodies,
        titles,
        descriptions,
        website_url,
    }: FbApiCreateAdCreativeParams): Promise<AdCreative | undefined> {
        console.log(`Creating Ad Creative. Name: ${name}`);
        let adCreative;
        try {
            const assetFeedSpec = this.createAdCreativeAssetFeedSpec({
                videos,
                bodies,
                titles,
                descriptions,
                website_url,
            });

            console.log({ assetFeedSpec });

            const objectStorySpec = this.createAdCreativeObjectStorySpec({
                page_id: this.pageId,
            });

            console.log({ objectStorySpec });

            adCreative = await this.adAccount.createAdCreative([], {
                name,
                object_story_spec: objectStorySpec,
                asset_feed_spec: assetFeedSpec,
            });

            this.logApiCallResult(
                `Created Ad Creative. Creative ID: ${adCreative.id}`,
                adCreative
            );
        } catch (e) {
            console.log(e);
            return;
        } finally {
            return adCreative;
        }
    }

    async createAd(params: {
        name: string;
        adSet: AdSet;
        creative: AdCreative;
    }): Promise<Ad> {
        const { name, adSet, creative } = params;

        const createAdParams: FbApiCreateAdParams = {
            name,
            adset_id: adSet.id,
            creative: { creative_id: creative.id },
            status: 'PAUSED',
        };

        const ad = await this.adAccount.createAd([], createAdParams);

        this.logApiCallResult(`Created Facebook Ad. Ad ID: ${ad.id}`, ad);

        return ad;
    }

    // for testing
    async cleanup() {
        logger.log('cleanup called');
        const videos = await this.adAccount.getAdVideos(['id'], {});
        logger.log({ videos });
        const deleteVideoPromises = videos.map((video) =>
            this.adAccount.deleteAdVideos({
                video_id: video.id,
            })
        );

        // const campaign = await this.adAccount.getCampaigns(['id'], {})[0];
        // await this.adAccount.deleteCampaigns(campaign.id);

        await Promise.all(deleteVideoPromises);
    }
}
