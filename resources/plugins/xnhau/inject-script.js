window.addEventListener('load', () => {
	if (cleanAdsNodes()) return;
	localStorage.setItem('lastPopunderTime', Date.now() + 1000 * 60 * 60 * 24 * 365);
	const intervalID = setInterval(() => cleanAdsNodes(() => clearInterval(intervalID)), 1000);
});

/**
 * @param {() => any} [onSuccess]
 */
function cleanAdsNodes(onSuccess) {
	const adsNodes = [...document.querySelectorAll('.ad-content'), document.querySelectorAll('.spot')[0]];
	if (!adsNodes.length) return false;

	adsNodes.forEach((node) => {
		console.log('Cleaned:', node);
		node.style.display = 'none';
	});

	onSuccess?.();
	return true;
}
