import * as z from 'zod';

function optional<T extends z.ZodTypeAny>(schema: T) {
	return schema.nullish().transform((v) => v ?? undefined);
}

export const ItemFlagsSchema = z.looseObject({
	tradeable: optional(z.boolean()),
	auctionable: optional(z.boolean()),
	bazaarable: optional(z.boolean()),
});

export const ItemSkinSchema = z.looseObject({
	value: optional(z.string()),
	signature: optional(z.string()),
});

export const ItemGemstoneSlotCostsSchema = z.looseObject({
	type: z.string(),
	item_id: optional(z.string()),
	coins: optional(z.number()),
});

export const ItemGemstoneSlotSchema = z.looseObject({
	slot_type: optional(z.string()),
	costs: z.array(ItemGemstoneSlotCostsSchema),
});

export const ItemRequirementSchema = z.looseObject({
	type: z.string(),
	skill: optional(z.string()),
	level: optional(z.number()),
});

export const ItemMuseumDataSchema = z.looseObject({
	donation_xp: z.number(),
	parent: optional(z.record(z.string(), z.string())),
	type: optional(z.string()),
	armor_set_donation_xp: optional(z.record(z.string(), z.number())),
	game_stage: optional(z.string()),
});

export const DungeonItemConversionCostSchema = z.looseObject({
	essence_type: optional(z.string()),
	amount: optional(z.number()),
});

export const UpgradeCostsSchema = z.looseObject({
	type: optional(z.string()),
	essence_type: optional(z.string()),
	item_id: optional(z.string()),
	amount: optional(z.number()),
	medal_type: optional(z.string()),
});

export const CatacombsRequirementsSchema = z.looseObject({
	type: optional(z.string()),
	dungeon_type: optional(z.string()),
	level: optional(z.number()),
});

export const SkyblockItemResponseSchema = z.looseObject({
	id: optional(z.string()),
	material: optional(z.string()),
	color: optional(z.string()),
	durability: optional(z.number()),
	skin: optional(ItemSkinSchema),
	name: optional(z.string()),
	category: optional(z.string()),
	tier: optional(z.string()),
	unstackable: optional(z.boolean()),
	glowing: optional(z.boolean()),
	npc_sell_price: optional(z.number()),
	can_auction: optional(z.boolean()),
	can_trade: optional(z.boolean()),
	can_place: optional(z.boolean()),
	gemstone_slots: optional(z.array(ItemGemstoneSlotSchema)),
	requirements: optional(z.array(ItemRequirementSchema)),
	museum: optional(z.boolean()),
	museum_data: optional(ItemMuseumDataSchema),
	stats: optional(z.record(z.string(), z.number())),
	generator_tier: optional(z.number()),
	dungeon_item_conversion_cost: optional(DungeonItemConversionCostSchema),
	upgrade_costs: optional(z.array(z.array(UpgradeCostsSchema))),
	catacombs_requirements: optional(z.array(CatacombsRequirementsSchema)),
	hide_from_viewrecipe_command: optional(z.boolean()),
	salvagable_from_recipe: optional(z.boolean()),
	item_specific: optional(z.any()),
});

export const ItemVariationDefinitionSchema = z.looseObject({
	type: z.enum(['Name', 'Attribute']),
	key: optional(z.string()),
	exact: optional(z.string()),
	startsWith: optional(z.string()),
	endsWith: optional(z.string()),
	contains: optional(z.string()),
});

export const SkyblockItemVariantDataSchema = z.looseObject({
	name: optional(z.string()),
	npcValue: optional(z.number()),
	lore: optional(z.string()),
	data: optional(SkyblockItemResponseSchema),
});

export const SkyblockItemVariantSchema = z.looseObject({
	by: ItemVariationDefinitionSchema,
	item: SkyblockItemVariantDataSchema,
});

export const RecipeIngredientDtoSchema = z.looseObject({
	itemId: z.string(),
	quantity: z.number().int(),
});

export const SkyblockRecipeDataSchema = z.looseObject({
	name: optional(z.string()),
	type: optional(z.string()),
	resultId: optional(z.string()),
	resultQuantity: optional(z.number().int()),
	crafting: optional(z.record(z.string(), RecipeIngredientDtoSchema)),
});

export const SkyblockSoldBySchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	cost: z.array(UpgradeCostsSchema),
	amount: optional(z.number().int()),
});

export const SkyblockItemDataSchema = z.looseObject({
	internalId: z.string(),
	name: z.string(),
	category: optional(z.string()),
	source: z.string(),
	npcValue: optional(z.number()),
	lore: optional(z.string()),
	flags: optional(ItemFlagsSchema),
	data: optional(SkyblockItemResponseSchema),
	variants: optional(z.array(SkyblockItemVariantSchema)),
	recipes: optional(z.array(SkyblockRecipeDataSchema)),
	soldBy: optional(z.array(SkyblockSoldBySchema)),
});

// --- Enchantments ---
export const SkyblockEnchantmentSchema = z.looseObject({
	internalId: z.string(),
	name: z.string(),
	source: optional(z.string()),
	minLevel: optional(z.number()),
	maxLevel: optional(z.number()),
	items: optional(z.array(z.string())),
});

// --- NPCs ---
export const NpcFlagsSchema = z.looseObject({
	merchant: optional(z.boolean()),
	abiphone: optional(z.boolean()),
	garden: optional(z.boolean()),
	shop: optional(z.boolean()),
});

export const NpcLocationSchema = z.looseObject({
	zone: optional(z.string()),
	coordinates: optional(
		z.looseObject({
			x: optional(z.number()),
			y: optional(z.number()),
			z: optional(z.number()),
		})
	),
});

export const NpcVisitorSchema = z.looseObject({
	rarity: optional(z.string()),
	gardenLevel: optional(z.number()),
});

export const SkyblockNpcSchema = z.looseObject({
	internalId: z.string(),
	name: z.string(),
	flags: optional(NpcFlagsSchema),
	location: optional(NpcLocationSchema),
	visitor: optional(NpcVisitorSchema),
});

// --- Shops ---
export const ShopCostSchema = z.looseObject({
	type: z.string(),
	amount: optional(z.number()),
	item_id: optional(z.string()),
});

export const ShopItemSchema = z.looseObject({
	lore: optional(z.string()),
	cost: optional(z.array(ShopCostSchema)),
	output: optional(z.array(ShopCostSchema)),
});

export const SkyblockShopSchema = z.looseObject({
	internalId: z.string(),
	name: z.string(),
	source: optional(z.string()),
	slots: optional(z.record(z.string(), ShopItemSchema)),
});

// --- Zones ---
export const ZoneNpcSchema = z.looseObject({
	link: optional(z.string()),
	name: optional(z.string()),
});

export const ZoneFairySoulSchema = z.looseObject({
	location: optional(z.string()),
	number: optional(z.number()),
	coordinates: optional(
		z.looseObject({
			x: optional(z.number()),
			y: optional(z.number()),
			z: optional(z.number()),
		})
	),
});

export const SkyblockZoneSchema = z.looseObject({
	internalId: z.string(),
	name: z.string(),
	source: optional(z.string()),
	discoveryText: optional(z.string()),
	npcs: optional(z.array(ZoneNpcSchema)),
	mobs: optional(z.array(ZoneNpcSchema)),
	mobDrops: optional(z.array(ZoneNpcSchema)),
	fairySouls: optional(z.array(ZoneFairySoulSchema)),
});

// --- Pets ---
export const PetFlagsSchema = z.looseObject({
	auctionable: optional(z.boolean()),
	mountable: optional(z.boolean()),
	tradable: optional(z.boolean()),
	museumable: optional(z.boolean()),
});

export const PetRarityDataSchema = z.looseObject({
	lore: optional(
		z.looseObject({
			min: optional(z.string()),
			max: optional(z.string()),
		})
	),
	value: optional(z.number()),
	skin: optional(ItemSkinSchema),
	katUpgradeable: optional(z.boolean()),
	katUpgradeCosts: optional(z.array(ShopCostSchema)),
	katUpgradeSeconds: optional(z.number()),
});

export const SkyblockPetSchema = z.looseObject({
	internalId: z.string(),
	name: z.string(),
	source: optional(z.string()),
	category: optional(z.string()),
	minLevel: optional(z.number()),
	maxLevel: optional(z.number()),
	baseStats: optional(z.array(z.string())),
	flags: optional(PetFlagsSchema),
	rarities: optional(z.record(z.string(), PetRarityDataSchema)),
});
