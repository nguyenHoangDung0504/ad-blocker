let intervalID = setInterval(cleanIframe, 2000);

function cleanIframe() {
	const iframes = document.querySelectorAll('iframe');

	if (iframes.length) {
		iframes.forEach((node) => {
			if (node.src) return;
			console.log('Cleaned:', node);
			node.remove();
		});
		clearInterval(intervalID);
	}
}
