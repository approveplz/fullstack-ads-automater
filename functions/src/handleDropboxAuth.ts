import { Request, Response } from 'express';

export const getDropboxAuthUrl = async (req: Request, res: Response) => {
    const dropboxProcessor = req.dropboxProcessor;

    if (!dropboxProcessor) {
        throw new Error('Dropbox Processer not passed in with request');
    }

    const authUrl = await dropboxProcessor.getAuthUrl();

    return res.json({ redirectUrl: authUrl });
};

export const getAuthTokensFromDropboxCodeAndRedirect = async (
    req: Request,
    res: Response
) => {
    const { code } = req.query;

    const dropboxProcessor = req.dropboxProcessor;

    if (!dropboxProcessor) {
        throw new Error('Dropbox Processer not passed in with request');
    }

    await dropboxProcessor.getAccessTokenFromCode(code as string);
    return res.redirect('http://localhost:3000');
};
