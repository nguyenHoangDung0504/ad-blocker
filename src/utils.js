export { buildRulesFromUrls, matchUrl, getUniqueLines };

/**
 * Tạo danh sách rule từ URL
 * @param {string[]} urls
 * @returns
 */
function buildRulesFromUrls(urls) {
	return urls.map((url, index) => ({
		id: index + 1,
		priority: 1,
		action: { type: 'block' },
		condition: {
			urlFilter: url,
			resourceTypes: [
				'script',
				'image',
				'media',
				'xmlhttprequest',
				'stylesheet',
				'sub_frame',
				'main_frame',
				'other',
			],
		},
	}));
}

/**
 * Lấy danh sách dòng không trùng lặp, bỏ trống
 * @param {string} text
 * @returns
 */
function getUniqueLines(text) {
	return Array.from(
		new Set(
			text
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		)
	);
}

/**
 * Kiểm tra URL có khớp với template không
 * @param {string} template - ví dụ: "*://*.ads/*"
 * @param {string} url - ví dụ: "https://test.ads/js/popup.js"
 * @returns {boolean}
 */
function matchUrl(template, url) {
	const escapeRegex = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

	// Chuyển template thành regex
	const regexStr = '^' + template.split('*').map(escapeRegex).join('.*') + '$';

	try {
		const regex = new RegExp(regexStr);
		return regex.test(url);
	} catch (e) {
		console.error('Invalid pattern:', e);
		return false;
	}
}
