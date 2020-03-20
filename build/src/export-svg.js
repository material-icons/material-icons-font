'use strict';

const fs = require('fs');
const config = require('./config');
const fsHelper = require('./files');

const iconHeader =
	'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24">';
const iconFooter = '</svg>';

function svg(code) {
	return (
		iconHeader + (code && code.length ? code : '<path d="M0 24"/>') + iconFooter
	);
}

/**
 * Export SVG icons
 *
 * @param fontData
 * @param theme
 * @return {Array}
 */
module.exports = (fontData, theme) => {
	let dir = config.tempDir + '/svg';
	fsHelper.mkdir(dir);

	// List of icons
	let icons = [];

	// Prepare each icon
	fontData.icons.forEach(icon => {
		let opaqueName = theme + '-' + icon.name,
			transparentName = theme + '-' + icon.name + '-transparent',
			opaqueFile = opaqueName + '.svg',
			transparentFile = transparentName + '.svg',
			iconTheme = icon.code[theme] === void 0 ? 'baseline' : theme,
			code;

		// Generate and save opaque icon
		code = svg(icon.code[iconTheme].opaque);
		fs.writeFileSync(dir + '/' + opaqueFile, code, 'utf8');
		icons.push({
			file: opaqueFile,
			char: icon.char.opaque,
			name: icon.name,
		});

		// Generate and save transparent icon
		if (icon.twotone) {
			code = svg(icon.code[iconTheme].transparent);
			fs.writeFileSync(dir + '/' + transparentFile, code, 'utf8');
			icons.push({
				file: transparentFile,
				char: icon.char.transparent,
				name: icon.name + '-transparent',
				transparent: true,
			});
		}
	});

	return icons;
};
