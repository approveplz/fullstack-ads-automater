import { Dropbox, files as DropboxFiles } from 'dropbox';
import { promises as fs } from 'fs';

export default class DropboxProcessor {
    static FILE = 'file';
    static DELETED = 'deleted';

    private dbx: Dropbox;

    constructor(options: { accessToken: string }) {
        this.dbx = new Dropbox({
            accessToken: options.accessToken,
        });
        console.log('Initialized Dropbox Processor');
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
    ): Promise<Record<string, DropboxFiles.FileMetadataReference>> {
        console.log(`Getting files from Dropbox folder: ${path}`);
        const response = await this.dbx.filesListFolder({
            path,
            limit,
        });

        let result = response.result;
        const files = this.processFolderEntries({}, result.entries);

        // Dropbox files are paginated
        // Use continue api with cursor to get the rest
        while (result.has_more) {
            const response = await this.dbx.filesListFolderContinue({
                cursor: result.cursor,
            });
            result = response.result;
            this.processFolderEntries(files, result.entries);
        }

        console.log(
            `Retrieved ${
                Object.keys(files).length
            } files from folder: ${path}\n`
        );
        return files;
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
        files: Record<string, DropboxFiles.FileMetadataReference>,
        outputLocation: string
    ) {
        if (!Object.keys(files).length) {
            console.log('No Files to download');
            return [];
        }
        console.log(`Downloading files from Dropbox folder`);
        try {
            // TODO: files is an object...it should probably be an array
            const downloadFilePromises = Object.entries(files).map(
                async ([key, val]) => {
                    if (!val.path_lower) {
                        throw new Error(
                            'path_lower does not exist on file to download'
                        );
                    }
                    return this.downloadFile(val['path_lower'], outputLocation);
                }
            );

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
        files: Record<string, DropboxFiles.FileMetadataReference>,
        toPath: string
    ) {
        console.log('Moving Dropbox files out of input folder...');
        const entries = Object.entries(files).map(([key, val]) => ({
            from_path: val['path_lower'] as string,
            to_path: `${toPath}/${val.name}`,
        }));

        await this.dbx.filesMoveBatchV2({ entries });

        console.log(`Moved ${entries.length} files to ${toPath}\n`);
    }
}
