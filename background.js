import manifest from './resources/plugins/manifest.js';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg.type === 'get-plugin-resource') {
		const url = msg.url;
		const hostname = new URL(url).hostname;
		const matchEntry = Object.entries(manifest).find(([key]) => hostname.includes(key));

		// Gửi phản hồi ngay
		sendResponse({ resource: matchEntry?.[1]?.resource || null });

		if (!matchEntry) return;

		const match = matchEntry[1];
		const plugin = match.resource;
		const ruleMode = (match.mode || 'black-list').toLowerCase();

		if (ruleMode === 'none') {
			console.log(`> [Ad Block] Mode is 'none', skip applying rules for ${hostname}`);
			return;
		}

		// Tiếp tục xử lý rule
		(async () => {
			const ruleFile = `resources/plugins/${plugin}/.${ruleMode}.txt`;
			const urls = await loadLines(ruleFile);
			const rules = buildRules(urls, ruleMode, hostname);

			const existing = await chrome.declarativeNetRequest.getDynamicRules();
			const pluginRules = existing.filter((r) => r.id >= 1_000_000).map((r) => r.id);

			await chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds: pluginRules,
				addRules: rules,
			});

			console.log(`> [Ad Block] Applied ${rules.length} ${ruleMode} rules for ${hostname}`, rules);
		})();

		return true;
	}
});

/**
 * Parse txt file and return array of lines
 * @param {string} filePath
 * @returns {Promise<string[]>}
 */
async function loadLines(filePath) {
	try {
		const res = await fetch(chrome.runtime.getURL(filePath));
		const text = await res.text();
		return Array.from(
			new Set(
				text
					.split('\n')
					.map((line) => line.trim())
					.filter(Boolean)
			)
		);
	} catch (err) {
		console.warn('[Plugin] Failed to load rule file:', filePath, err);
		return [];
	}
}

/**
 * Build rules from URLs
 * @param {string[]} urls - danh sách các URL được phép (white-list) hoặc chặn (black-list)
 * @param {'whitelist' | 'blacklist'} mode
 * @param {string} domain
 * @returns {chrome.declarativeNetRequest.Rule[]}
 */
function buildRules(urls, mode, domain) {
	const rules = [];

	if (mode === 'white-list') {
		// 1. Rule chặn toàn bộ trước
		rules.push({
			id: 1_000_000,
			priority: 1,
			action: { type: 'block' },
			condition: {
				urlFilter: '*',
				resourceTypes: [
					'script',
					// 'image',
					// 'media',
					// 'xmlhttprequest',
					'stylesheet',
					'sub_frame',
					'other',
				],
				...(domain ? { domains: [domain] } : {}),
			},
		});

		// 2. Các rule cho phép cụ thể
		for (let i = 0; i < urls.length; i++) {
			rules.push({
				id: 1_000_001 + i,
				priority: 11,
				action: { type: 'allow' },
				condition: {
					urlFilter: urls[i],
					resourceTypes: [
						'script',
						'image',
						'media',
						'xmlhttprequest',
						'stylesheet',
						'sub_frame',
						'other',
					],
					...(domain ? { domains: [domain] } : {}),
				},
			});
		}
	} else {
		// Chế độ blacklist như cũ
		for (let i = 0; i < urls.length; i++) {
			rules.push({
				id: 1_000_000 + i,
				priority: 10,
				action: { type: 'block' },
				condition: {
					urlFilter: urls[i],
					resourceTypes: [
						'script',
						'image',
						'media',
						'xmlhttprequest',
						'stylesheet',
						'sub_frame',
						'other',
					],
					...(domain ? { domains: [domain] } : {}),
				},
			});
		}
	}

	return rules;
}
