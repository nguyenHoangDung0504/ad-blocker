import { appViews, leftViews, rightViews } from './UI.js';

let searchResults = [];
let currentSearchIndex = -1;

// Setup UX
setUpLeftUX();
setUpRightUX();

export { appViews, leftViews, rightViews };

function setUpRightUX() {
	const { linkBoxs, suggestionContainers } = rightViews;
	linkBoxs.forEach(addSummaryClickListener);
	suggestionContainers.forEach(addSummaryClickListener);
}

function setUpLeftUX() {
	const { searchInput, nextBtn, prevBtn, blackListTA } = leftViews;
	searchInput.addEventListener('input', searchInBlockList);
	nextBtn.addEventListener('click', () => navigateSearch(1));
	prevBtn.addEventListener('click', () => navigateSearch(-1));
	setTimeout(() => {
		blackListTA.focus();
		blackListTA.scrollIntoView({ behavior: 'instant', block: 'end' });
		blackListTA.blur();
	}, 100);
}

/**
 * @param {HTMLElement} ctn
 * @param {undefined} _
 * @param {HTMLElement[]} list
 */
function addSummaryClickListener(ctn, _, list) {
	ctn.addEventListener('click', function (e) {
		if (
			!this.hasAttribute('open') &&
			e.target.parentElement === this &&
			e.target.tagName === 'SUMMARY'
		) {
			list.forEach((ctn) => ctn.removeAttribute('open'));
		}
	});
}

/**
 * Tìm kiếm các dòng chứa từ khóa trong textarea
 */
function searchInBlockList() {
	const { searchInput, blackListTA } = leftViews;
	const keyword = searchInput.value.trim();

	if (!keyword) {
		searchResults = [];
		currentSearchIndex = -1;
		return;
	}

	const lines = blackListTA.value.split('\n');
	searchResults = lines
		.map((line, index) => (line.includes(keyword) ? index : -1))
		.filter((index) => index !== -1);

	currentSearchIndex = -1;
}

/**
 * Di chuyển đến kết quả tiếp theo hoặc trước đó
 * @param {number} direction - 1 để tiến, -1 để lùi
 */
function navigateSearch(direction) {
	if (searchResults.length === 0) return;
	const { blackListTA, searchInput } = leftViews;

	currentSearchIndex += direction;
	if (currentSearchIndex >= searchResults.length) {
		currentSearchIndex = 0;
	} else if (currentSearchIndex < 0) {
		currentSearchIndex = searchResults.length - 1;
	}

	const lines = blackListTA.value.split('\n');
	const keyword = searchInput.value.trim();
	const lineIndex = searchResults[currentSearchIndex];

	// Tính toán chiều cao của từng dòng:
	const lineHeight = parseFloat(getComputedStyle(blackListTA).lineHeight); // 1.5 * font-size
	const offsetTop = lineHeight * lineIndex;

	// Đặt scrollTop để di chuyển đến dòng cần tìm
	blackListTA.scrollTop = offsetTop;

	// Focus và highlight:
	let position = 0;
	for (let i = 0; i < lineIndex; i++) {
		position += lines[i].length + 1; // Cộng thêm 1 vì ký tự xuống dòng
	}
	position += lines[lineIndex].indexOf(keyword);

	blackListTA.focus();
	blackListTA.setSelectionRange(position, position + keyword.length);
}
