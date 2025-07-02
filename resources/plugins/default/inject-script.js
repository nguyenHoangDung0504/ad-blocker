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

	// Ghi đè window.open
	const _open = window.open;
	lockFn(window, 'open', function (url, ...args) {
		if (!userInitiated() || isExternalURL(url)) {
			if (!confirmAction('Trang này muốn mở một tab mới ngoài origin:', url)) return null;
		}
		return _open.call(this, url, ...args);
	});

	// Ghi đè a.click()
	const _click = HTMLElement.prototype.click;
	lockFn(HTMLElement.prototype, 'click', function (...args) {
		if (
			this.tagName === 'A' &&
			this.dataset?.__blocked_by_mtd === '1' &&
			isExternalURL(this.href) &&
			!this.hasAttribute('download') &&
			!userInitiated()
		) {
			if (!confirmAction('Script đang cố mở liên kết ngoài:', this.href)) return;
		}
		return _click.call(this, ...args);
	});

	// Ghi đè form.submit()
	const _submit = HTMLFormElement.prototype.submit;
	lockFn(HTMLFormElement.prototype, 'submit', function (...args) {
		const action = this.action || location.href;
		const target = this.getAttribute('target');
		const method = this.getAttribute('method')?.toLowerCase();

		if (
			isExternalURL(action) &&
			target === '_blank' &&
			['get', 'post'].includes(method) &&
			!userInitiated()
		) {
			if (!confirmAction('Trang này muốn gửi biểu mẫu đến một trang ngoài:', action)) return;
		}
		return _submit.call(this, ...args);
	});

	// Chặn click vào link ngoài origin
	document.addEventListener(
		'click',
		(e) => {
			if (!e.isTrusted) return e.preventDefault();

			const anchor = e.target.closest?.('a[href]');
			if (!anchor) return;
			if (anchor.href.startsWith('javascript')) return;

			const origin = location.origin;
			let targetOrigin = '';

			try {
				targetOrigin = new URL(anchor.href, location.href).origin;
			} catch {
				return;
			}

			if (!isTrustedDomain(origin) && targetOrigin !== origin) {
				window.postMessage({ url: anchor.href, ['EC-type']: '@extension:popup_request' }, '*');
				if (!confirm(`Cảnh báo: Trang này muốn mở một liên kết ngoài:\n\n${anchor.href}`)) {
					e.preventDefault();
				}
			}
		},
		true
	);

	function isTrustedDomain(url) {
		try {
			const parsed = new URL(url, location.href);
			const hostname = parsed.hostname.toLowerCase();

			return TRUSTED_DOMAINS.some(
				(domain) => hostname === domain || hostname.endsWith('.' + domain)
			);
		} catch {
			return false;
		}
	}

	function isExternalURL(url) {
		try {
			return new URL(url, location.href).origin !== ORIGIN;
		} catch {
			return true;
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

	function lockFn(obj, name, fn) {
		Object.defineProperty(obj, name, {
			value: fn,
			writable: false,
			configurable: false,
		});
	}
})();
