export const STORAGE_KEY = 'black-list-URLs';

let DEBUG_MODE = true;

export { getBlackList, setBlackListRules };

/**
 * @returns {Promise<string[]>}
 */
async function getBlackList() {
	const result = await chrome.storage.local.get([STORAGE_KEY]);
	DEBUG_MODE && console.log('--> [Storage Debug] `getBlackList` result:', result);
	return result[STORAGE_KEY] || [];
}

/**
 * @param {string[]} blackList
 * @param {{
 * 		id: number
 * 		priority: number
 * 		action: {
 * 			type: string
 * 		}
 * 		condition: {
 * 			urlFilter: string
 * 			resourceTypes: string[]
 * 		};
 * }[]} blackListRules
 */
async function setBlackListRules(blackList, blackListRules) {
	chrome.storage.local.set({ [STORAGE_KEY]: blackList }, () => {
		chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
			const allRuleIds = existingRules.map((r) => r.id);

			chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds: allRuleIds,
				addRules: blackListRules,
			});
		});
	});
}
