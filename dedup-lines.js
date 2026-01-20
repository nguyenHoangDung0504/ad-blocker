import fs from 'fs';
import path from 'path';

const input = process.argv[2];
if (!input) {
	console.error('Usage: node dedup-lines.js <input-file>');
	process.exit(1);
}

const absPath = path.resolve(input);
const dir = path.dirname(absPath);
const ext = path.extname(absPath);
const base = path.basename(absPath, ext);

const output = path.join(dir, `${base}.deduped${ext}`);

const text = fs.readFileSync(absPath, 'utf8');

const seen = new Set();
const result = [];

for (const line of text.split(/\r?\n/)) {
	const trimmed = line.trim();
	if (!trimmed) continue;
	if (seen.has(trimmed)) continue;

	seen.add(trimmed);
	result.push(trimmed);
}

fs.writeFileSync(output, result.join('\n'), 'utf8');

console.log(`Done: ${output}`);
