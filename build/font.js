'use strict';

const fs = require('fs');
const config = require('./src/config');
const clone = require('./src/clone');
const getFontData = require('./src/font-data');
const buildFonts = require('./src/build-fonts');
const generateStyles = require('./src/generate-styles');
const buildStyles = require('./src/build-styles');
const generateSamples = require('./src/generate-samples');
const child_process = require('child_process');

let fontData;

// Build stuff
clone()
	.then(() => {
		// Get font data
		return new Promise((fulfill, reject) => {
			let overwrite = process.argv.slice(2).indexOf('--overwrite') !== -1;
			fontData = getFontData(overwrite);
			if (!fontData) {
				reject('Missing data.json');
				return;
			}

			if (typeof fontData === 'string') {
				reject(fontData);
				return;
			}

			buildFonts(fontData)
				.then(() => {
					fulfill();
				})
				.catch(err => {
					reject(err);
				});
		});
	})
	.then(() => {
		return generateStyles(fontData);
	})
	.then(() => {
		return buildStyles(fontData);
	})
	.then(() => {
		return generateSamples(fontData);
	})
	.then(() => {
		console.log('\nDone.');
	})
	.catch(err => {
		console.error(err);
	});
