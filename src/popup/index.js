import { getBlackList, STORAGE_KEY } from '../storage.js';
import { buildRulesFromUrls, getUniqueLines, matchUrl } from '../utils.js';
import { renderLinkContainer } from './UI.js';
import { leftViews, rightViews } from './UX.js';

const DEBUG_MODE = true;

setups();
await initBlackListView();
await scanPageForSuggestions();

/**
 * Khởi tạo giao diện ban đầu
 */
async function initBlackListView() {
	const { blackListTA } = leftViews;
	const blackList = await getBlackList();

	if (blackList) blackListTA.value = blackList.join('\n');
	blackListTA.addEventListener('input', () => {
		saveRules();
		rightViews.scanBtn.click();
	});
}

/**
 * Gắn event cho các nút
 */
function setups() {
	rightViews.scanBtn.addEventListener('click', scanPageForSuggestions);
}

/**
 * Xử lý lưu danh sách chặn
 */
async function saveRules() {
	const { blackListTA } = leftViews;
	const urls = getUniqueLines(blackListTA.value);
	const rules = buildRulesFromUrls(urls);

	chrome.storage.local.set({ [STORAGE_KEY]: urls }, () => {
		chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
			const allRuleIds = existingRules.map((r) => r.id < 1_000_000);

			chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds: allRuleIds,
				addRules: rules,
			});
		});
	});
}

/**
 * Quét trang để gợi ý rule mới
 */
async function scanPageForSuggestions() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript(
		{
			target: { tabId: tab.id },
			func: scanResourceElements,
		},
		async (results) => {
			if (!results || !results[0]) return;
			if (DEBUG_MODE)
				console.log('--> [Debug] `scanResourceElements` result', results, results[0].result);
			await displaySuggestions(results[0].result);
		}
	);
}

/**
 * Hàm chạy trong trang để tìm URL bên ngoài
 */
function scanResourceElements() {
	const origin = location.origin;

	// Tạo cấu trúc lưu trữ
	const categorizedUrls = {
		sameOrigin: {
			scripts: new Set(''),
			media: new Set(''),
			anchors: new Set(''),
		},
		crossOrigin: {
			scripts: new Set(''),
			media: new Set(''),
			anchors: new Set(''),
		},
	};

	// Duyệt qua các script
	[...document.querySelectorAll('script[src]')].forEach((node) => {
		const src = node.getAttribute('src');
		const fullUrl = new URL(src, origin).href;
		if (fullUrl.includes(origin)) {
			categorizedUrls.sameOrigin.scripts.add(fullUrl);
		} else {
			categorizedUrls.crossOrigin.scripts.add(fullUrl);
		}
	});

	// Duyệt qua các iframe, img, video
	[...document.querySelectorAll('iframe[src], img[src], video[src]')].forEach((node) => {
		const src = node.getAttribute('src');
		const fullUrl = new URL(src, origin).href;
		if (fullUrl.includes('base64')) return;
		if (fullUrl.includes(origin)) {
			categorizedUrls.sameOrigin.media.add(fullUrl);
		} else {
			categorizedUrls.crossOrigin.media.add(fullUrl);
		}
	});

	// Duyệt qua các anchor
	[...document.querySelectorAll('a[href]')].forEach((node) => {
		const href = node.getAttribute('href');
		const fullUrl = new URL(href, origin).href;
		if (fullUrl.includes(origin)) {
			categorizedUrls.sameOrigin.anchors.add(fullUrl);
		} else {
			categorizedUrls.crossOrigin.anchors.add(fullUrl);
		}
	});

	return {
		sameOrigin: {
			scripts: [...categorizedUrls.sameOrigin.scripts].sort(),
			media: [...categorizedUrls.sameOrigin.media].sort(),
			anchors: [...categorizedUrls.sameOrigin.anchors].sort(),
		},
		crossOrigin: {
			scripts: [...categorizedUrls.crossOrigin.scripts].sort(),
			media: [...categorizedUrls.crossOrigin.media].sort(),
			anchors: [...categorizedUrls.crossOrigin.anchors].sort(),
		},
	};
}

/**
 * @param {ReturnType<typeof scanResourceElements>} urls
 */
async function displaySuggestions(urls) {
	const blackList = await getBlackList();
	const containers = {
		crossOrigin: {
			scripts: rightViews.COscriptCtn,
			media: rightViews.COmediaCtn,
			anchors: rightViews.COanchorCtn,
		},
		sameOrigin: {
			scripts: rightViews.SOscriptCtn,
			media: rightViews.SOmediaCtn,
			anchors: rightViews.SOanchorCtn,
		},
	};

	// Duyệt qua cả crossOrigin và sameOrigin
	for (const originType of ['crossOrigin', 'sameOrigin']) {
		let count = 0;
		let globalDetails = null;

		for (const resourceType of ['scripts', 'media', 'anchors']) {
			/**@type {HTMLElement} */
			const container = containers[originType][resourceType];
			const urlsList = urls[originType][resourceType];
			const details = container.closest('details');

			container.innerHTML = '';
			details.querySelector('summary').setAttribute('count', urlsList.length);
			if (globalDetails === null) globalDetails = details.parentElement.closest('details');

			for (const url of urlsList) {
				count++;
				const matchedBlockUrl = blackList.find((_url) => _url === url || matchUrl(_url, url));
				const blocked = Boolean(matchedBlockUrl);
				const { div, anchor, button } = renderLinkContainer(url, matchedBlockUrl, blocked);

				button.onclick = () => {
					if (blocked) {
						updatePatternInBlockList('remove', anchor.getAttribute('block-by'));
					} else {
						updatePatternInBlockList('add', anchor.textContent.trim());
					}
				};

				container.appendChild(div);
			}
		}

		globalDetails.querySelector('summary').setAttribute('count', count);
	}
}

/**
 * Thêm hoặc xóa pattern khỏi blacklist
 * @param {'add' | 'remove'} action
 * @param {string} pattern
 */
function updatePatternInBlockList(action, pattern) {
	const { blackListTA } = leftViews;
	const current = new Set(getUniqueLines(blackListTA.value));

	if (action === 'add') current.add(pattern);
	else current.delete(pattern);

	blackListTA.value = [...current].join('\n');
	blackListTA.scrollIntoView({ behavior: 'instant', block: 'end' });
	blackListTA.dispatchEvent(new Event('input'));
}
