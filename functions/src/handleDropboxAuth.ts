import { Request, Response } from 'express';
import { saveUserInfoCloud } from './cloudHelpers.js';

export const getDropboxAuthUrl = async (req: Request, res: Response) => {
    const { dropboxProcessor, uid } = req;

    if (!dropboxProcessor) {
        throw new Error('Dropbox Processer not passed in with request');
    }
    if (!uid) {
        throw new Error('firebase ID Token not passed in with request');
    }

    const authUrl = await dropboxProcessor.getAuthUrl(uid);

    return res.json({ redirectUrl: authUrl });
};

export const getAuthTokensFromDropboxCodeAndRedirect = async (
    req: Request,
    res: Response
) => {
    // Im passing uid as a state variable in the redirect url...should I encrypt this?
    const { code, state: uid } = req.query;

    const dropboxProcessor = req.dropboxProcessor;

    if (!dropboxProcessor) {
        throw new Error('Dropbox Processer not passed in with request');
    }
    if (!code) {
        throw new Error('Missing Dropbox auth code from query');
    }
    if (!uid) {
        throw new Error(
            'Missing firebase ID token, passed as state, from query'
        );
    }

    await dropboxProcessor.handleGetRefreshTokenFromCode(code as string);

    debugger;
    await saveUserInfoCloud(uid as string, {
        dropboxAuthInfo: {
            dropboxRefreshToken: dropboxProcessor.getRefreshToken(),
        },
    });

    const clientBaseUrl =
        process.env.NODE_ENV === 'production'
            ? process.env.CLIENT_BASE_URL_PROD
            : process.env.CLIENT_BASE_URL_DEV;

    if (!clientBaseUrl) {
        throw new Error('Client base URL not found in env variables');
    }
    const redirectUrl = `${clientBaseUrl}/home`;

    return res.redirect(redirectUrl);
};
