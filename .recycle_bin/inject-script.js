(function () {
	const nodeRawRemoveChild = Node.prototype.removeChild;
	const elementRawRemoveChild = Element.prototype.removeChild;
	const rawAppendChild = Node.prototype.appendChild;
	const rawCreateElement = Document.prototype.createElement;

	// Define and block variables
	'cRAds, justDetectAdblock, showADBOverlay'.split(',').forEach((blockVar) => {
		Object.defineProperty(window, blockVar.trim(), {
			value: {},
			configurable: false,
		});
	});

	// Remove rendered iframe and event div
	document.addEventListener('DOMContentLoaded', () => {
		// Remove iframe
		const ifrs = document.querySelectorAll('iframe');
		ifrs.forEach((ifr) => {
			if (
				ifr.style.zIndex.length > 8 ||
				[('absolute', 'fixed')].includes(ifr.style.position) ||
				ifr.style.display == 'none' ||
				ifr.style.opacity == '0'
			)
				destroyElement(ifr);
		});

		// Remove event div
		const checkDiv = document.documentElement.lastElementChild;
		if (checkDiv.style.position === 'fixed') destroyElement(checkDiv);

		// Remove trash view
		destroyElement(document.querySelector('#adbd'));
	});

	// Observe and remove iframe and event div
	const observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			for (const node of m.addedNodes) {
				if (node.nodeName === 'IFRAME') destroyElement(node);
				if (
					node.nodeName === 'DIV' &&
					node.style.position === 'fixed' &&
					node.style.zIndex.length > 8
				)
					destroyElement(node);
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});

	// Block append iframe and event div
	// Element.prototype.appendChild = function (...args) {
	// 	let el = args[0];
	// 	if (
	// 		el instanceof HTMLElement &&
	// 		el.tagName === 'DIV' &&
	// 		(['absolute', 'fixed'].includes(el.style.position) || el.style.display == 'none')
	// 	) {
	// 		return;
	// 	}
	// 	return rawAppendChild.apply(this, args);
	// };

	/**@param {Element | Node} eon  */
	function destroyElement(eon) {
		console.log(`> [Ad Block] Trying detroy element:`, eon);
		try {
			nodeRawRemoveChild.call(eon.parentElement, eon);
			console.log(`> [Ad Block] Destroy success element`);
		} catch {
			console.warn('> [Ad Block] Node remove child fail, try Element remove child');
			try {
				elementRawRemoveChild.call(eon.parentElement, eon);
				console.log(`> [Ad Block] Destroy success element`);
			} catch {
				console.warn('> [Ad Block] Element remove child fail, try prototype methods');
				eon.remove();
				eon.parentElement.removeChild(eon);
			}
		}
	}
})();
