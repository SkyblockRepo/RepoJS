import envPaths from 'env-paths';

const APP_NAME = 'RepoJS';
const paths = envPaths(APP_NAME, { suffix: 'SkyblockRepoJs' });

export interface RepoSettings {
	name: string;
	url: string;
	zipPath: string;
	apiEndpoint: string;
	localPath?: string;
	checkFile?: string;
}

export interface Logger {
	log(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
}

export interface SkyblockRepoConfiguration {
	fileStoragePath: string;
	useNeuRepo: boolean;
	skyblockRepo: RepoSettings;
	neuRepo: RepoSettings;
	logger?: Logger;
}

export const defaultConfig: SkyblockRepoConfiguration = {
	fileStoragePath: process.env.REPOJS_CACHE_DIR || paths.cache,
	useNeuRepo: false,
	skyblockRepo: {
		name: 'skyblockrepo',
		url: 'https://github.com/SkyblockRepo/Repo',
		zipPath: '/archive/refs/heads/main.zip',
		apiEndpoint: 'https://api.github.com/repos/SkyblockRepo/Repo/commits/main',
	},
	neuRepo: {
		name: 'neu',
		url: 'https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO',
		zipPath: '/archive/refs/heads/master.zip',
		apiEndpoint: 'https://api.github.com/repos/NotEnoughUpdates/NotEnoughUpdates-REPO/commits/master',
		checkFile: 'items',
	},
};
