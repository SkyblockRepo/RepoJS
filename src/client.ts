import { defaultConfig, type SkyblockRepoConfiguration } from './config.js';
import type { SkyblockItemData, SkyblockItemVariant } from './models/index.js';
import { SkyblockRepoUpdater } from './updater.js';

export interface SkyblockItemMatch {
	item: SkyblockItemData;
	variant?: SkyblockItemVariant;
}

export interface SkyblockRepoMatcher<T = unknown> {
	getSkyblockId(item: T): string | undefined;
	getName(item: T): string | undefined;
	getAttribute?(item: T, key: string): string | undefined;
}

export class SkyblockRepoClient {
	private updater: SkyblockRepoUpdater;
	private config: SkyblockRepoConfiguration;
	// biome-ignore lint/suspicious/noExplicitAny: Constructor type matching requires any
	private matchers: Map<any, SkyblockRepoMatcher> = new Map(); // Map constructor/class to matcher

	constructor(config: Partial<SkyblockRepoConfiguration> = defaultConfig) {
		this.config = { ...defaultConfig, ...config };
		this.updater = new SkyblockRepoUpdater(this.config);
	}

	async initialize() {
		await this.updater.initialize();
	}

	async checkForUpdates() {
		await this.updater.checkForUpdates();
	}

	async reloadRepo() {
		await this.updater.reloadRepo();
	}

	get data() {
		return this.updater.data;
	}

	findItem(itemIdOrName: string): SkyblockItemData | null {
		itemIdOrName = itemIdOrName.trim();
		if (!itemIdOrName) {
			throw new Error('Item ID or name must be provided.');
		}

		const searchInput = itemIdOrName.toUpperCase();
		const items = this.data.items;

		// 1. Exact ID match
		const exactIdMatch = items[searchInput.replace(/ /g, '_')];
		if (exactIdMatch) {
			return exactIdMatch;
		}

		// 2. Search by name
		const matchingItems = Object.values(this.data.itemNameSearch)
			.filter((item) => {
				return item.name && (item.nameUpper.includes(searchInput) || item.idToNameUpper.includes(searchInput));
			})
			.sort((a, b) => {
				// Exact name match
				if (a.nameUpper === searchInput) return -1;
				if (b.nameUpper === searchInput) return 1;

				// Starts with
				if (a.nameUpper.startsWith(searchInput) && !b.nameUpper.startsWith(searchInput)) return -1;
				if (!a.nameUpper.startsWith(searchInput) && b.nameUpper.startsWith(searchInput)) return 1;

				// Length
				return a.name.length - b.name.length;
			});

		if (matchingItems.length === 0) {
			if (searchInput.includes('BLOCK OF ')) {
				return this.findItem(searchInput.replace('BLOCK OF ', '') + ' BLOCK');
			}
			if (searchInput.includes('WOOD')) {
				return this.findItem(searchInput.replace('WOOD', 'LOG'));
			}
			return null;
		}

		const bestMatch = matchingItems[0];
		if (!bestMatch) return null;
		return items[bestMatch.internalId] || null;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Constructor type matching requires any
	registerMatcher<T>(type: any, matcher: SkyblockRepoMatcher<T>) {
		this.matchers.set(type, matcher);
	}

	private tryFindItem(searchValue?: string): SkyblockItemData | null {
		if (!searchValue) return null;
		try {
			return this.findItem(searchValue);
		} catch {
			return null;
		}
	}

	matchItem(sourceItem: unknown): SkyblockItemMatch | null {
		if (!sourceItem) {
			throw new Error('Source item cannot be null.');
		}

		// Find matcher for the item type
		let matcher: SkyblockRepoMatcher | undefined;

		for (const [type, m] of this.matchers) {
			if (sourceItem instanceof type) {
				matcher = m;
				break;
			}
		}

		if (!matcher) {
			return null;
		}

		const skyblockId = matcher.getSkyblockId(sourceItem);
		let item = this.tryFindItem(skyblockId);

		if (!item) {
			const name = matcher.getName(sourceItem);
			item = this.tryFindItem(name);
		}

		if (item) {
			const variant = this.getMatchingVariant(item, sourceItem, matcher);
			return { item, variant };
		}

		return null;
	}

	private getMatchingVariant(
		item: SkyblockItemData,
		sourceItem: unknown,
		matcher: SkyblockRepoMatcher
	): SkyblockItemVariant | undefined {
		if (!item.variants) return undefined;

		for (const variant of item.variants) {
			const def = variant.by;
			let value: string | undefined;

			if (def.type === 'Name') {
				value = matcher.getName(sourceItem);
			} else if (def.type === 'Attribute') {
				if (matcher.getAttribute && def.key) {
					value = matcher.getAttribute(sourceItem, def.key);
				}
			}

			if (value === undefined) continue;

			if (def.exact && value === def.exact) return variant;
			if (def.startsWith && value.startsWith(def.startsWith)) return variant;
			if (def.endsWith && value.endsWith(def.endsWith)) return variant;
			if (def.contains && value.includes(def.contains)) return variant;
		}

		return undefined;
	}
}
