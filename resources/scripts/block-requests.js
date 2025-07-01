(function () {
	const fakeContent = 'thistextshouldbethere\n';

	// Override fetch
	const originalFetch = window.fetch;
	window.fetch = function (...args) {
		if (typeof args[0] === 'string' && args[0].includes('pagead2.googlesyndication.com')) {
			return Promise.resolve(new Response(fakeContent, { status: 200 }));
		}
		return originalFetch.apply(this, args);
	};

	// Override XMLHttpRequest
	const OriginalXHR = window.XMLHttpRequest;
	function FakeXHR() {
		const xhr = new OriginalXHR();

		const originalOpen = xhr.open;
		xhr.open = function (method, url, async) {
			this._isAdDetect = typeof url === 'string' && url.includes('pagead2.googlesyndication.com');
			return originalOpen.apply(this, arguments);
		};

		const originalSend = xhr.send;
		xhr.send = function () {
			if (this._isAdDetect) {
				this.readyState = 4;
				this.status = 200;
				this.responseText = fakeContent;
				if (typeof this.onreadystatechange === 'function') {
					this.onreadystatechange();
				}
				return;
			}
			return originalSend.apply(this, arguments);
		};

		return xhr;
	}
	window.XMLHttpRequest = FakeXHR;
})();
