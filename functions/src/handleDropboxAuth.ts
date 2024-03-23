import { Request, Response } from 'express';
import DropboxProcessor from './processors/DropboxProcessor';

declare module 'express-serve-static-core' {
    interface Request {
        dropboxProcessor: DropboxProcessor;
    }
}

export const getDropboxAuthUrl = async (req: Request, res: Response) => {
    const dropboxProcessor = req.dropboxProcessor;
    const authUrl = await dropboxProcessor.getAuthUrl();

    return res.json({ redirectUrl: authUrl });
};

export const getAuthTokensFromDropboxCodeAndRedirect = async (
    req: Request,
    res: Response
) => {
    const { code } = req.query;

    const dropboxProcessor = req.dropboxProcessor;
    await dropboxProcessor.getAccessTokenFromCode(code as string);
    return res.redirect('http://localhost:3000');
};
