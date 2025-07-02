import manifest from './resources/plugins/manifest.js';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg.type === 'get-plugin-resource') {
		const url = msg.url;
		const hostname = new URL(url).toString();
		const match = Object.entries(manifest).find(([key]) => hostname.includes(key));
		sendResponse({ folder: match?.[1] || null });
		return true;
	}
});
