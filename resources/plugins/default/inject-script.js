(() => {
	'use strict';

	const ORIGIN = location.origin;
	const TRUSTED_DOMAINS = [
		'google.com',
		'youtube.com',
		'wikipedia.org',
		'github.com',
		'stackoverflow.com',
		'microsoft.com',
		'mozilla.org',
		'facebook.com',
		'twitter.com',
		'coccoc.com',
	];

	if (TRUSTED_DOMAINS.some((hostname) => location.href.includes(hostname))) {
		console.log('> [Ad Block] Ignore protect script on trusted domains');
		return;
	}

	// Intercept clicks on <a> to external URLs
	document.addEventListener(
		'click',
		(e) => {
			if (!(e.target instanceof Element)) return;

			const anchor = e.target.closest?.('a[href]');
			if (!anchor) return;
			if (anchor.href.startsWith('javascript')) return;

			const targetOrigin = safeOrigin(anchor.href);
			if (!targetOrigin || targetOrigin === ORIGIN) return;

			if (!userInitiated()) return;

			if (!confirm(`Cảnh báo: Trang này muốn mở một liên kết ngoài:\n\n${anchor.href}`)) {
				e.preventDefault();
			}
		},
		true
	);

	// Intercept window.open
	const _open = window.open;
	window.open = function (url, ...args) {
		if (!userInitiated() || isExternalURL(url)) {
			if (!confirmAction('Trang này muốn mở một tab mới ngoài origin:', url)) {
				return null;
			}
		}
		return _open.call(this, url, ...args);
	};

	// Intercept form.submit
	document.addEventListener(
		'submit',
		(e) => {
			const form = e.target;
			if (!(form instanceof HTMLFormElement)) return;

			const action = form.action || location.href;
			const method = (form.getAttribute('method') || '').toLowerCase();
			const target = form.getAttribute('target');

			if (
				isExternalURL(action) &&
				target === '_blank' &&
				['get', 'post'].includes(method) &&
				!userInitiated()
			) {
				if (!confirmAction('Trang này muốn gửi biểu mẫu đến một trang ngoài:', action)) {
					e.preventDefault();
				}
			}
		},
		true
	);

	// Optional: detect suspicious eval (no override)
	window.addEventListener('error', (e) => {
		if (typeof e.message === 'string' && e.message.includes('debugger')) {
			console.log('> [Ad Block] Detected eval with debugger');
		}
	});

	// Utility
	function isExternalURL(url) {
		try {
			return new URL(url, location.href).origin !== ORIGIN;
		} catch {
			return true;
		}
	}

	function safeOrigin(url) {
		try {
			return new URL(url, location.href).origin;
		} catch {
			return null;
		}
	}

	function confirmAction(message, url) {
		window.postMessage({ url, ['EC-type']: '@extension:popup_request' }, '*');
		return confirm(`Cảnh báo: ${message}\n\n${url}`);
	}

	function userInitiated() {
		try {
			throw new Error();
		} catch (e) {
			return /\b(click|mouse|touch|key)\b/i.test(e.stack);
		}
	}
})();
