'use strict';

const fs = require('fs');
const fsHelper = require('./files');
const config = require('./config');
const genSVGFont = require('./generate-svg-font-fontforge');
const genFonts = require('./generate-fonts');
const child_process = require('child_process');

module.exports = fontData =>
	new Promise((fulfill, reject) => {
		let ignore = process.argv.slice(2).indexOf('--no-fonts') !== -1;
		if (
			ignore &&
			fsHelper.exists(
				config.fontDir +
					'/' +
					config.fontFilenames[config.themeKeys[0]] +
					'.ttf'
			)
		) {
			fulfill();
			return;
		}

		// Parse each theme
		let themes = config.themeKeys.slice(0);
		const nextTheme = () => {
			let theme = themes.shift();
			if (theme === void 0) {
				fulfill();
				return;
			}

			console.log('\nParsing theme: ' + config.themes[theme]);
			genSVGFont(fontData, theme)
				.then(code => {
					return genFonts(code, theme);
				})
				.then(() => {
					nextTheme();
				})
				.catch(err => {
					reject(err);
				});
		};
		nextTheme();
	});
