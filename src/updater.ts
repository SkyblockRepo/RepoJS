import fs from 'fs/promises';
import path from 'path';
import type { z } from 'zod';
import { defaultConfig, type Logger, type SkyblockRepoConfiguration } from './config.js';
import { GithubRepoUpdater } from './github-updater.js';
import {
	type NeuItem,
	NeuItemSchema,
	type SkyblockEnchantment,
	SkyblockEnchantmentSchema,
	type SkyblockItemData,
	SkyblockItemDataSchema,
	type SkyblockNpc,
	SkyblockNpcSchema,
	type SkyblockPet,
	SkyblockPetSchema,
	type SkyblockRepoData,
	type SkyblockShop,
	SkyblockShopSchema,
	type SkyblockZone,
	SkyblockZoneSchema,
} from './models/index.js';

export class SkyblockRepoUpdater {
	public data: SkyblockRepoData = {
		items: {},
		itemNameSearch: {},
		pets: {},
		enchantments: {},
		npcs: {},
		shops: {},
		zones: {},
		neuItems: {},
	};

	private skyblockRepoUpdater: GithubRepoUpdater;
	private neuRepoUpdater?: GithubRepoUpdater;
	private config: SkyblockRepoConfiguration;
	private logger: Logger;

	constructor(config: Partial<SkyblockRepoConfiguration>) {
		this.config = { ...defaultConfig, ...config };
		this.logger = this.config.logger || console;
		this.skyblockRepoUpdater = new GithubRepoUpdater(
			this.config.skyblockRepo ?? defaultConfig.skyblockRepo,
			this.config.fileStoragePath,
			this.logger
		);
		if (this.config.useNeuRepo) {
			this.neuRepoUpdater = new GithubRepoUpdater(
				this.config.neuRepo ?? defaultConfig.neuRepo,
				this.config.fileStoragePath,
				this.logger
			);
		}
	}

	async initialize() {
		await this.checkForUpdates();
		await this.reloadRepo();
	}

	async checkForUpdates() {
		const updates = [this.skyblockRepoUpdater.checkForUpdates()];
		if (this.neuRepoUpdater) {
			updates.push(this.neuRepoUpdater.checkForUpdates());
		}

		const results = await Promise.all(updates);
		if (results.some((updated) => updated)) {
			this.logger.log('Updates detected, reloading repo...');
			await this.reloadRepo();
		}
	}

	async reloadRepo() {
		this.logger.log('Loading data from primary SkyblockRepo...');
		const mainRepoPath = this.skyblockRepoUpdater.repoPath;

		await this.loadManifest(mainRepoPath);
		await this.loadSkyblockItems(mainRepoPath);
		await this.loadSkyblockPets(mainRepoPath);
		await this.loadSkyblockEnchantments(mainRepoPath);
		await this.loadSkyblockNpcs(mainRepoPath);
		await this.loadSkyblockShops(mainRepoPath);
		await this.loadSkyblockZones(mainRepoPath);

		if (this.neuRepoUpdater) {
			this.logger.log('Loading data from NEU repo...');
			const neuRepoPath = this.neuRepoUpdater.repoPath;
			await this.loadNeuItems(neuRepoPath);
		}
	}

	private async loadManifest(repoPath: string) {
		const manifestPath = path.join(repoPath, 'manifest.json');
		try {
			const content = await fs.readFile(manifestPath, 'utf-8');
			this.data.manifest = JSON.parse(content);
		} catch (e) {
			this.logger.error(`Error loading manifest from ${manifestPath}`, e);
		}
	}

	private async loadSkyblockItems(repoPath: string) {
		const itemsPath = path.join(repoPath, this.data.manifest?.paths.items || 'items');
		const items = await this.loadData<SkyblockItemData>(
			itemsPath,
			(fileName) => fileName.replace(/-/g, ':'),
			SkyblockItemDataSchema
		);

		this.data.items = items;
		this.data.itemNameSearch = {};

		for (const [key, item] of Object.entries(items)) {
			if (!item.name) continue;
			this.data.itemNameSearch[key] = {
				internalId: item.internalId,
				name: item.name,
				nameUpper: item.name.toUpperCase(),
				idToNameUpper: item.internalId.replace(/_/g, ' ').toUpperCase(),
			};
		}
	}

	private async loadSkyblockPets(repoPath: string) {
		const petsPath = path.join(repoPath, this.data.manifest?.paths.pets || 'pets');
		this.data.pets = await this.loadData<SkyblockPet>(petsPath, undefined, SkyblockPetSchema);
	}

	private async loadSkyblockEnchantments(repoPath: string) {
		const pathVal = path.join(repoPath, this.data.manifest?.paths.enchantments || 'enchantments');
		this.data.enchantments = await this.loadData<SkyblockEnchantment>(
			pathVal,
			undefined,
			SkyblockEnchantmentSchema
		);
	}

	private async loadSkyblockNpcs(repoPath: string) {
		const pathVal = path.join(repoPath, this.data.manifest?.paths.npcs || 'npcs');
		this.data.npcs = await this.loadData<SkyblockNpc>(pathVal, undefined, SkyblockNpcSchema);
	}

	private async loadSkyblockShops(repoPath: string) {
		const pathVal = path.join(repoPath, this.data.manifest?.paths.shops || 'shops');
		this.data.shops = await this.loadData<SkyblockShop>(pathVal, undefined, SkyblockShopSchema);
	}

	private async loadSkyblockZones(repoPath: string) {
		const pathVal = path.join(repoPath, this.data.manifest?.paths.zones || 'zones');
		this.data.zones = await this.loadData<SkyblockZone>(pathVal, undefined, SkyblockZoneSchema);
	}

	private async loadNeuItems(repoPath: string) {
		const itemsPath = path.join(repoPath, 'items');
		const neuItems = await this.loadData<NeuItem>(itemsPath, undefined, NeuItemSchema);

		this.logger.log(`Loaded ${Object.keys(neuItems).length} NEU items`);

		this.data.neuItems = neuItems;
	}

	private async loadData<T>(
		folderPath: string,
		keySelector: (fileName: string) => string = (f) => f,
		schema?: z.ZodSchema<T>
	): Promise<Record<string, T>> {
		const result: Record<string, T> = {};
		try {
			const files = await fs.readdir(folderPath);
			const jsonFiles = files.filter((f) => f.endsWith('.json'));

			await Promise.all(
				jsonFiles.map(async (file) => {
					try {
						const filePath = path.join(folderPath, file);
						const content = await fs.readFile(filePath, 'utf-8');
						const model = JSON.parse(content);

						// Skip items without an internalId (e.g. partial data or recipes only)
						// For NEU items, the ID field is 'itemid' or 'internalname'
						if (!model.internalId && !model.itemid && !model.internalname) {
							return;
						}

						if (schema) {
							const validation = schema.safeParse(model);
							if (!validation.success) {
								this.logger.warn(`Validation failed for ${file}:`, validation.error);
								return;
							}
							const key = keySelector(path.basename(file, '.json'));
							result[key] = validation.data;
						} else {
							const key = keySelector(path.basename(file, '.json'));
							result[key] = model;
						}
					} catch (e) {
						this.logger.error(`Error loading file ${file}`, e);
					}
				})
			);
		} catch {
			this.logger.warn(`Directory not found or empty: ${folderPath}`);
		}
		return result;
	}
}
