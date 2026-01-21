window.open = () => {};
const _dispatch = EventTarget.prototype.dispatchEvent;

EventTarget.prototype.dispatchEvent = function (event) {
	if (event instanceof MouseEvent && !event.isTrusted) {
		return false;
	}
	return _dispatch.call(this, event);
};
