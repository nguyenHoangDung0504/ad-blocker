(() => {
	'use strict';
	injectScript('/resources/scripts/block-popup.js');
	// injectScript('/resources/scripts/block-requests.js');
})();

/**
 * @param {string} url
 * @param {'text/javascript' | 'module'} type
 */
function injectScript(url, type = 'module') {
	const script = document.createElement('script');
	script.src = chrome.runtime.getURL(url);
	script.type = type;
	// script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);
}
