import type { z } from 'zod';
import type * as NeuSchemas from './neu-schemas.js';
import type * as Schemas from './schemas.js';

export * from './neu-schemas.js';
export * from './schemas.js';

export type ItemFlags = z.infer<typeof Schemas.ItemFlagsSchema>;
export type ItemSkin = z.infer<typeof Schemas.ItemSkinSchema>;
export type ItemGemstoneSlotCosts = z.infer<typeof Schemas.ItemGemstoneSlotCostsSchema>;
export type ItemGemstoneSlot = z.infer<typeof Schemas.ItemGemstoneSlotSchema>;
export type ItemRequirement = z.infer<typeof Schemas.ItemRequirementSchema>;
export type ItemMuseumData = z.infer<typeof Schemas.ItemMuseumDataSchema>;
export type DungeonItemConversionCost = z.infer<typeof Schemas.DungeonItemConversionCostSchema>;
export type UpgradeCosts = z.infer<typeof Schemas.UpgradeCostsSchema>;
export type CatacombsRequirements = z.infer<typeof Schemas.CatacombsRequirementsSchema>;
export type SkyblockItemResponse = z.infer<typeof Schemas.SkyblockItemResponseSchema>;
export type ItemVariationDefinition = z.infer<typeof Schemas.ItemVariationDefinitionSchema>;
export type SkyblockItemVariantData = z.infer<typeof Schemas.SkyblockItemVariantDataSchema>;
export type SkyblockItemVariant = z.infer<typeof Schemas.SkyblockItemVariantSchema>;
export type SkyblockRecipeData = z.infer<typeof Schemas.SkyblockRecipeDataSchema>;
export type SkyblockSoldBy = z.infer<typeof Schemas.SkyblockSoldBySchema>;
export type SkyblockItemData = z.infer<typeof Schemas.SkyblockItemDataSchema>;

// New types
export type SkyblockEnchantment = z.infer<typeof Schemas.SkyblockEnchantmentSchema>;
export type SkyblockNpc = z.infer<typeof Schemas.SkyblockNpcSchema>;
export type SkyblockShop = z.infer<typeof Schemas.SkyblockShopSchema>;
export type SkyblockZone = z.infer<typeof Schemas.SkyblockZoneSchema>;
export type SkyblockPet = z.infer<typeof Schemas.SkyblockPetSchema>;

// NEU types
export type NeuItem = z.infer<typeof NeuSchemas.NeuItemSchema>;
export type NeuRecipe = z.infer<typeof NeuSchemas.NeuRecipeSchema>;
export type NeuCraftingRecipe = z.infer<typeof NeuSchemas.NeuCraftingRecipeSchema>;
export type NeuForgeRecipe = z.infer<typeof NeuSchemas.NeuForgeRecipeSchema>;
export type NeuTradeRecipe = z.infer<typeof NeuSchemas.NeuTradeRecipeSchema>;
export type NeuMobDropsRecipe = z.infer<typeof NeuSchemas.NeuMobDropsRecipeSchema>;
export type NeuNpcShopRecipe = z.infer<typeof NeuSchemas.NeuNpcShopRecipeSchema>;
export type NeuKatGradeRecipe = z.infer<typeof NeuSchemas.NeuKatGradeRecipeSchema>;

export interface SkyblockItemNameSearch {
	internalId: string;
	name: string;
	nameUpper: string;
	idToNameUpper: string;
}

export interface Manifest {
	paths: {
		items: string;
		pets: string;
		enchantments: string;
		npcs: string;
		shops: string;
		zones: string;
	};
}

export interface SkyblockRepoData {
	manifest?: Manifest;
	items: Record<string, SkyblockItemData>;
	itemNameSearch: Record<string, SkyblockItemNameSearch>;
	pets: Record<string, SkyblockPet>;
	enchantments: Record<string, SkyblockEnchantment>;
	npcs: Record<string, SkyblockNpc>;
	shops: Record<string, SkyblockShop>;
	zones: Record<string, SkyblockZone>;
	neuItems: Record<string, NeuItem>;
}
