'use strict';

const fs = require('fs');
const config = require('./config');

// Get font data
let fontData;
let errors = [];
try {
	fontData = fs.readFileSync(config.outputDir + '/data.json', 'utf8');
	fontData = JSON.parse(fontData);
	if (!(fontData.icons instanceof Array)) {
		// noinspection ExceptionCaughtLocallyJS
		throw new Error('Bad data');
	}

	// Validate font data
	const usedCharacters = Object.create(null);
	fontData.icons.forEach(icon => {
		Object.keys(icon.char).forEach(key => {
			const char = icon.char[key];
			if (usedCharacters[char] !== void 0) {
				errors.push(
					`Character ${char} is used in "${usedCharacters[char]}" and "${icon.name}"`
				);
			} else {
				usedCharacters[char] = icon.name;
			}
		});
	});
} catch (err) {
	console.log('Font data is missing. Creating new set.');
	fontData = {
		icons: [],
	};
}

if (errors.length) {
	console.error(errors.join('\n'));
	throw new Error('Fix characters in data.json!');
}

module.exports = fontData;
