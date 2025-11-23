import { expect, test } from 'vitest';
import { SkyblockRepoClient } from './index.js';

test('SkyblockRepoClient', async () => {
	const client = new SkyblockRepoClient({ useNeuRepo: true });
	await client.initialize();

	const item = client.findItem('HYPERION');
	expect(item).toBeDefined();
	expect(item?.name).toBe('Hyperion');
}, 60000); // Increase timeout for download
