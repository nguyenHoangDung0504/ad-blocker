window.addEventListener('load', () => {
	if (cleanIframe()) return;
	const intervalID = setInterval(() => cleanIframe(() => clearInterval(intervalID)), 1000);
	document
		.querySelectorAll('script')
		.forEach(
			(node) => node.textContent.includes('https://www.eporner.com/getadb/') && node.remove(),
		);
});

/**
 * @param {() => any} [onSuccess]
 */
function cleanIframe(onSuccess) {
	const adsURLs = document.querySelectorAll('iframe');
	if (!adsURLs.length) return false;

	adsURLs.forEach((node) => {
		if (!node.src) {
			// console.log('Cleaned AD iframe:', node);
			node.remove();
		}
	});

	onSuccess?.();
	return true;
}
