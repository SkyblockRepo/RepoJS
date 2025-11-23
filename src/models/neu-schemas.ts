import * as z from 'zod';

function optional<T extends z.ZodTypeAny>(schema: T) {
	return schema.nullish().transform((v) => v ?? undefined);
}

export const NeuIngredientSchema = z.string();

export const NeuCraftingRecipeSchema = z.looseObject({
	type: z.literal('crafting').optional(),
	count: optional(z.number().int().min(1)),
	crafttext: optional(z.string()),
	overrideOutputId: optional(z.string()),
	supercraftable: optional(z.boolean()),
	A1: NeuIngredientSchema,
	A2: NeuIngredientSchema,
	A3: NeuIngredientSchema,
	B1: NeuIngredientSchema,
	B2: NeuIngredientSchema,
	B3: NeuIngredientSchema,
	C1: NeuIngredientSchema,
	C2: NeuIngredientSchema,
	C3: NeuIngredientSchema,
});

export const NeuForgeRecipeSchema = z.looseObject({
	type: z.literal('forge'),
	inputs: z.array(NeuIngredientSchema).min(1),
	overrideOutputId: optional(z.string()),
	count: optional(z.number().min(1)),
	duration: z.number().int(),
	hotmLevel: optional(z.number().int()),
});

export const NeuTradeRecipeSchema = z.looseObject({
	type: z.literal('trade'),
	result: NeuIngredientSchema,
	cost: NeuIngredientSchema,
	min: optional(z.number().int()),
	max: optional(z.number().int()),
});

export const NeuDropSchema = z.union([
	NeuIngredientSchema,
	z.looseObject({
		id: NeuIngredientSchema,
		chance: optional(z.string()),
		extra: optional(z.array(z.string())),
	}),
]);

export const NeuMobDropsRecipeSchema = z.looseObject({
	type: z.literal('drops'),
	drops: z.array(NeuDropSchema),
	level: optional(z.number().int()),
	coins: optional(z.number().int()),
	xp: optional(z.number().int()),
	combat_xp: optional(z.number().int()),
	name: z.string(),
	render: optional(z.string()),
	extra: optional(z.array(z.string())),
	panorama: optional(
		z.enum([
			'dynamic',
			'hub',
			'mining_1',
			'mining_2',
			'mining_3',
			'combat_1',
			'crimson_isle',
			'combat_3',
			'farming_1',
			'foraging_1',
			'foraging_2',
			'winter',
			'dungeon',
			'dungeon_hub',
			'crystal_hollows',
			'instanced',
			'garden',
			'rift',
			'mineshaft',
		])
	),
});

export const NeuNpcShopRecipeSchema = z.looseObject({
	type: z.literal('npc_shop'),
	cost: z.array(NeuIngredientSchema).min(1),
	result: NeuIngredientSchema,
});

export const NeuKatGradeRecipeSchema = z.looseObject({
	type: z.literal('katgrade'),
	output: NeuIngredientSchema,
	input: NeuIngredientSchema,
	items: optional(z.array(NeuIngredientSchema)),
	coins: z.number().int(),
	time: z.number().int(),
});

export const NeuRecipeSchema = z.union([
	NeuCraftingRecipeSchema,
	NeuForgeRecipeSchema,
	NeuTradeRecipeSchema,
	NeuMobDropsRecipeSchema,
	NeuNpcShopRecipeSchema,
	NeuKatGradeRecipeSchema,
]);

export const NeuItemSchema = z.looseObject({
	itemid: z.string(),
	displayname: z.string(),
	nbttag: z.string(),
	damage: z.number().int(),
	lore: z.array(z.string()).min(1),
	recipes: optional(z.array(NeuRecipeSchema)),
	recipe: optional(NeuRecipeSchema),
	internalname: z.string(),
	clickcommand: optional(z.enum(['viewrecipe', 'viewpotion', ''])),
	modver: optional(z.string()),
	useneucraft: optional(z.boolean()),
	infoType: optional(z.enum(['WIKI_URL', ''])),
	info: optional(z.array(z.string())),
	crafttext: optional(z.string()),
});
