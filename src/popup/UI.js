import { createViewBinding } from '../@libs/view_binding/index.js';

const { viewBinding: appViewBinding } = createViewBinding({
	left: '.left',
	right: '.right',
});

const { viewBinding: leftViewBinding } = createViewBinding({
	blackListTA: '#black-list = textarea',
	searchInput: '#search-input = input',
	nextBtn: '#next-search = button',
	prevBtn: '#prev-search = button',
});

const { viewBinding: rightViewBinding } = createViewBinding({
	suggestionContainers: '.right > .suggestions = []',
	linkBoxs: '.suggestion-container > details = []',
	scanBtn: '#scan = button',

	COscriptCtn: '#script-cross-origin > .scripts-details .links',
	COmediaCtn: '#script-cross-origin > .media-details .links',
	COanchorCtn: '#script-cross-origin > .anchors-details .links',
	SOscriptCtn: '#script-same-origin > .scripts-details .links',
	SOmediaCtn: '#script-same-origin > .media-details .links',
	SOanchorCtn: '#script-same-origin > .anchors-details .links',
});

let DEBUG_MODE = true;

const appViews = appViewBinding.bind();
DEBUG_MODE && console.log('--> [UI Debug] AppViews:\n', appViews);

const leftViews = leftViewBinding.bind(appViews.left);
DEBUG_MODE && console.log('--> [UI Debug] LeftViews:\n', leftViews);

const rightViews = rightViewBinding.bind(appViews.right);
DEBUG_MODE && console.log('--> [UI Debug] RightViews:\n', rightViews);

export { appViews, leftViews, rightViews, renderLinkContainer };

/**
 * @param {string} url
 * @param {string} blockBy
 * @param {boolean} state
 * @returns {{
 * 		div: HTMLDivElement
 * 		anchor: HTMLAnchorElement
 * 		button: HTMLButtonElement
 * }}
 */
function renderLinkContainer(url, blockBy, state) {
	const div = Object.assign(document.createElement('div'), {
		className: 'link-container',
		innerHTML: /*html*/ `
			<a type="text" contenteditable spellcheck="false" ${
				state ? `block-by="${blockBy}" title="Blocked by rule: ${blockBy}"` : ''
			}>
				${url}
			</a>
			<button class="${state ? 'unblock' : 'block'}"></button>
		`,
	});
	const anchor = div.querySelector('a');
	const button = div.querySelector('button');

	return { div, anchor, button };
}
