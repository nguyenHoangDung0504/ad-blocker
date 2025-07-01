// const STORAGE_KEY = 'black-list-URLs';

// async function updateRules(urls) {
// 	const rules = urls.map((url, index) => ({
// 		id: index + 1,
// 		priority: 1,
// 		action: { type: 'block' },
// 		condition: {
// 			urlFilter: url,
// 			resourceTypes: ['script', 'image', 'media', 'xmlhttprequest', 'stylesheet', 'sub_frame', 'main_frame', 'other'],
// 		},
// 	}));

// 	await chrome.declarativeNetRequest.updateDynamicRules({
// 		removeRuleIds: rules.map((r) => r.id),
// 		addRules: rules,
// 	});
// }

// chrome.runtime.onInstalled.addListener(async () => {
// 	const { blockedUrls = [] } = await chrome.storage.local.get(STORAGE_KEY);
// 	await updateRules(blockedUrls);
// });
