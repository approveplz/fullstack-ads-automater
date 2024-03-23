import { Dropbox, DropboxAuth, files as DropboxFiles } from 'dropbox';
// import { https } from 'firebase-functions';
import { promises as fs } from 'fs';

export default class DropboxProcessor {
    static FILE = 'file';
    static DELETED = 'deleted';

    private dbx: Dropbox;
    private dbxAuth: DropboxAuth;

    constructor(options: {
        accessToken: string;
        appKey: string;
        appSecret: string;
    }) {
        const { accessToken, appKey, appSecret } = options;
        console.log({ accessToken });

        this.validateRequiredOptions(options);

        this.dbxAuth = new DropboxAuth({
            clientId: appKey,
            clientSecret: appSecret,
        });

        this.dbx = new Dropbox({
            auth: this.dbxAuth,
        });

        console.log('Initialized Dropbox Processor');
    }

    private validateRequiredOptions(options: {
        accessToken: string;
        appKey: string;
        appSecret: string;
    }) {
        const { accessToken, appKey, appSecret } = options;

        if (!accessToken) {
            throw new Error('Dropbox Access Token is required');
        }
        if (!appKey) {
            throw new Error('Dropbox App Key is required');
        }
        if (!appSecret) {
            throw new Error('Dropbox App Secret is required');
        }
    }

    processFolderEntries(
        files: Record<string, DropboxFiles.FileMetadataReference>,
        entries: DropboxFiles.ListFolderResult['entries']
    ): Record<string, DropboxFiles.FileMetadataReference> {
        entries.forEach((entry) => {
            if (entry['.tag'] === 'file') {
                files[entry.id] = entry;
            } else {
                throw new Error('Encountered Folder or Deleted File');
            }
        });
        return files;
    }

    async getFilesFromFolder(
        path: string,
        limit?: number
    ): Promise<DropboxFiles.FileMetadataReference[]> {
        console.log(`Getting files from Dropbox folder: ${path}`);
        try {
            const response = await this.dbx.filesListFolder({
                path,
                limit,
            });

            let result = response.result;
            const filesObj = this.processFolderEntries({}, result.entries);

            // Dropbox files are paginated
            // Use continue api with cursor to get the rest
            while (result.has_more) {
                const response = await this.dbx.filesListFolderContinue({
                    cursor: result.cursor,
                });
                result = response.result;
                this.processFolderEntries(filesObj, result.entries);
            }

            const files = Object.values(filesObj);

            console.log(
                `Retrieved ${files.length} files from folder: ${path}\n`
            );
            return files;
        } catch (e) {
            console.log(`Error getting files from Dropbox Folder ${path}`);
            return [];
        }
    }

    async downloadFile(
        inputPath: string,
        outputLocation: string
    ): Promise<string> {
        const response = await this.dbx.filesDownload({ path: inputPath });
        const result = response.result;

        const outputPath = `${outputLocation}/${result.name}`;

        // https://github.com/dropbox/dropbox-sdk-js/blob/6bfaf895b757d7bd1e65002847a7c801813cc210/examples/typescript/download/download.ts#L22
        await fs.writeFile(outputPath, (<any>result).fileBinary, 'binary');

        console.log(`Downloaded ${inputPath} from Dropbox to ${outputPath}`);

        return outputPath;
    }

    async downloadFiles(
        files: DropboxFiles.FileMetadataReference[],
        outputLocation: string
    ) {
        if (!files.length) {
            console.log('No Files to download');
            return [];
        }
        console.log(`Downloading files from Dropbox folder`);
        try {
            const downloadFilePromises = files.map(async (file) => {
                if (!file.path_lower) {
                    throw new Error(
                        'path_lower does not exist on file to download'
                    );
                }
                return this.downloadFile(file['path_lower'], outputLocation);
            });

            // Promises are run concurrently. If one fails, the other promises succeed but and error is still thrown
            const downloadedFiles = await Promise.all(downloadFilePromises);

            console.log(
                `Downloaded ${downloadedFiles.length} files from Dropbox Folder\n`
            );

            return downloadedFiles;
        } catch (e) {
            console.log(
                'There was an error downloading at least one file: ',
                e
            );
            return [];
        }
    }

    async moveFiles(
        files: DropboxFiles.FileMetadataReference[],
        toPath: string
    ) {
        console.log('Moving Dropbox files out of input folder...');
        const entries = files.map((file) => ({
            from_path: file['path_lower'] as string,
            to_path: `${toPath}/${file.name}`,
        }));

        await this.dbx.filesMoveBatchV2({ entries });

        console.log(`Moved ${entries.length} files to ${toPath}\n`);
    }

    async getAuthUrl() {
        const dropboxScopes = [
            'files.metadata.write',
            'files.content.write',
            'files.content.read',
        ];

        return this.dbxAuth.getAuthenticationUrl(
            'http://127.0.0.1:5001/facebook-ads-automater/us-central1/api/auth/dropbox/callback',
            undefined,
            'code',
            'offline',
            dropboxScopes,
            'none',
            false
        );
    }

    async getAccessTokenFromCode(code: string) {
        try {
            const token = await this.dbxAuth.getAccessTokenFromCode(
                'http://127.0.0.1:5001/facebook-ads-automater/us-central1/api/auth/dropbox/callback',
                code
            );

            console.log({ token: JSON.stringify(token) });

            const tokenResult: any = token.result;

            const { refresh_token, access_token, expires_in } = tokenResult;

            this.dbxAuth.setRefreshToken(refresh_token);
            this.dbxAuth.setAccessToken(access_token);
            this.dbxAuth.setAccessTokenExpiresAt(
                // expires_in is in seconds
                new Date(new Date().getTime() + expires_in * 1000)
            );
        } catch (e) {
            console.log(e);
        }
    }
}
