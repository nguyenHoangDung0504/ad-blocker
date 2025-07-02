(async () => {
	injectScript('/resources/plugins/default/inject-script');

	const plugin = await getPlugin(location.href);
	if (plugin) {
		console.log('> [Ad Block] Using plugin:', plugin);
		injectScript(`/resources/plugins/${plugin}/inject-script`);
	}
})();

/**
 * @param {string} url
 * @param {'text/javascript' | 'module'} type
 */
function injectScript(url, type = 'module') {
	url += url.endsWith('.js') ? '' : '.js';
	const script = document.createElement('script');
	script.src = chrome.runtime.getURL(url);
	script.type = type;
	(document.head || document.documentElement).appendChild(script);
}

/**
 * Gửi yêu cầu lấy thư mục plugin từ background
 * @param {string} url
 * @returns {Promise<string|null>}
 */
function getPlugin(url) {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: 'get-plugin-resource', url }, (res) => {
			resolve(res?.folder || null);
		});
	});
}
