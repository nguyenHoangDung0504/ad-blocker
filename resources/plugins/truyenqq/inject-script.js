window.addEventListener('load', () => {
	if (cleanFooter()) return;
	const intervalID = setInterval(() => cleanFooter(() => clearInterval(intervalID)), 1000);
});

/**
 * @param {() => any} [onSuccess]
 */
function cleanFooter(onSuccess) {
	const adsURLs = document.querySelectorAll('footer .right');
	if (!adsURLs.length) return false;

	adsURLs.forEach((node) => {
		console.log('Cleaned:', node);
		node.remove();
	});

	onSuccess?.();
	return true;
}
