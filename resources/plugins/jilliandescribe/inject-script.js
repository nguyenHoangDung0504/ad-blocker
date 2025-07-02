(function () {
	const rawAddEventListener = EventTarget.prototype.addEventListener;

	EventTarget.prototype.addEventListener = function (type, listener, options) {
		try {
			const str = listener?.toString?.();
			if (
				(type === 'click' || type === 'mousedown') &&
				typeof str === 'string' &&
				str.includes('bt(n)')
			) {
				console.log('> [Ad Block] Blocked suspicious event handler', `[${type}]`, `[${str}]`);
				return;
			}
		} catch (err) {
			console.warn('> [Ad Block] Error checking listener', err);
		}

		return rawAddEventListener.call(this, type, listener, options);
	};
})();
