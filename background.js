import manifest from './resources/plugins/manifest.js';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg.type === 'get_plugin_folder') {
		const url = msg.url;
		const hostname = new URL(url).hostname;
		const match = Object.entries(manifest).find(([key]) => hostname.includes(key));
		sendResponse({ folder: match?.[1] || null });
		return true;
	}
});
