import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import type { Logger, RepoSettings } from './config.js';

export class GithubRepoUpdater {
	private settings: RepoSettings;
	private storagePath: string;
	public repoPath: string;
	private logger: Logger;

	constructor(settings: RepoSettings, storagePath: string, logger: Logger) {
		this.settings = settings;
		this.storagePath = storagePath;
		this.repoPath = path.join(storagePath, settings.name);
		this.logger = logger;
	}

	async checkForUpdates(): Promise<boolean> {
		const metaPath = path.join(this.storagePath, `${this.settings.name}.meta.json`);
		await fs.mkdir(this.storagePath, { recursive: true });

		let meta: { etag?: string; lastModified?: string } = {};
		try {
			const metaContent = await fs.readFile(metaPath, 'utf-8');
			meta = JSON.parse(metaContent);
		} catch {
			// Ignore if meta file doesn't exist
		}

		const headers: Record<string, string> = {
			'User-Agent': 'RepoJS',
		};
		if (meta.etag) headers['If-None-Match'] = meta.etag;
		// GitHub API uses ETag for commits, so we rely on that.

		try {
			const response = await fetch(this.settings.apiEndpoint, { headers });
			const newEtag = response.headers.get('etag');

			if (response.status === 304 || (response.ok && newEtag && newEtag === meta.etag)) {
				// Not modified, but check if we actually have the files
				try {
					await fs.access(path.join(this.repoPath, this.settings.checkFile || 'manifest.json'));
					return false;
				} catch {
					// Files missing, force download
					await this.downloadAndExtract();
					return true;
				}
			}

			if (response.ok) {
				// Update available
				await this.downloadAndExtract();

				if (newEtag) {
					await fs.writeFile(metaPath, JSON.stringify({ etag: newEtag }, null, 2));
				}
				return true;
			}
		} catch (error) {
			this.logger.error(`Failed to check for updates for ${this.settings.name}:`, error);
		}

		// If we have no data at all, we must download
		try {
			await fs.access(path.join(this.repoPath, this.settings.checkFile || 'manifest.json'));
		} catch {
			await this.downloadAndExtract();
			return true;
		}

		return false;
	}

	private async downloadAndExtract() {
		const zipUrl = this.settings.url.replace(/\/$/, '') + this.settings.zipPath;
		this.logger.log(`Downloading ${this.settings.name} from ${zipUrl}...`);

		const response = await fetch(zipUrl);
		if (!response.ok) {
			throw new Error(`Failed to download ${zipUrl}: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const zip = new AdmZip(buffer);

		// The zip usually contains a top-level folder (e.g. Repo-main).
		// We want to extract the contents of that folder to this.repoPath.
		const zipEntries = zip.getEntries();
		if (zipEntries.length === 0) {
			throw new Error('Zip file is empty');
		}
		const firstEntry = zipEntries[0];
		if (!firstEntry) {
			throw new Error('Zip file is empty');
		}
		const rootDir = firstEntry.entryName.split('/')[0]; // Assuming first entry is inside the root folder
		if (!rootDir) {
			throw new Error('Could not determine root directory from zip');
		}

		// Clean existing repo path
		await fs.rm(this.repoPath, { recursive: true, force: true });

		zip.extractAllTo(this.storagePath, true);

		// Rename the extracted folder to the target name
		const extractedPath = path.join(this.storagePath, rootDir);
		if (extractedPath !== this.repoPath) {
			try {
				this.logger.log(`Renaming ${extractedPath} to ${this.repoPath}`);
				await fs.rename(extractedPath, this.repoPath);
			} catch (e) {
				this.logger.error(`Failed to rename ${extractedPath} to ${this.repoPath}`, e);
			}
		}
	}
}
