(function () {
	const rawRemoveChild = Node.prototype.removeChild;
	const rawRemoveChild2 = Element.prototype.removeChild;
	const rawAppendChild = Node.prototype.appendChild;
	const rawCreateElement = Document.prototype.createElement;

	if (window.location.href.includes('luluvdoo')) {
		// Define and block write in variables
		'cRAds, justDetectAdblock, showADBOverlay'.split(',').forEach((blockVar) => {
			Object.defineProperty(window, blockVar.trim(), {
				value: {},
				configurable: false,
			});
		});

		document.addEventListener('DOMContentLoaded', () => {
			const ifrs = document.querySelectorAll('iframe');
			console.log(ifrs);
			ifrs.forEach((ifr) => {
				try {
					rawRemoveChild.call(node.parentElement, node);
				} catch {
					console.log('Node remove child error, try Element remove child');
					try {
						rawRemoveChild2.call(node.parentElement, node);
					} catch {
						console.log('Element remove child error, try methods');
						console.log(node);
						node.remove();
						node.parentElement.removeChild(node);
					}
				}
			});
		});

		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				for (const node of m.addedNodes) {
					if (node.nodeName === 'IFRAME') {
						try {
							rawRemoveChild.call(node.parentElement, node);
						} catch {
							console.log('Node remove child error, try Element remove child');
							try {
								rawRemoveChild2.call(node.parentElement, node);
							} catch {
								console.log('Element remove child error, try methods');
								console.log(node);
								node.remove();
								node.parentElement.removeChild(node);
							}
						}
					}
				}
			}
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});

		const methods = ['appendChild'];
		for (const method of methods) {
			const orig = Element.prototype[method];
			Element.prototype[method] = function (...args) {
				let el = args[0];
				if (el instanceof HTMLElement && el.tagName === 'DIV') {
					if (['absolute', 'fixed'].includes(el.style.position)) {
						return;
					}
				}
				return orig.apply(this, args);
			};
		}
	}
})();
