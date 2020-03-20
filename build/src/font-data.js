'use strict';

const fs = require('fs');

// Get configuration
const config = require('./config');

/**
 * Get font data
 *
 * @param {boolean} force Force update
 * @returns {object} Font data
 */
module.exports = force => {
	// Get SVG data
	const iconData = JSON.parse(
		fs.readFileSync(config.sourceDir + '/data.json', 'utf8')
	);

	// Get font data
	let fontData = require('./load-font-data');

	// Functions
	const nextCharacter = require('./characters')(fontData);
	const parseIcon = require('./parse-icon');
	const saveFontData = require('./save-font-data');

	// Find all new and updated icons
	let newIcons = [],
		updatedIcons = [],
		updatedCount = 0;

	iconData.icons.forEach(icon => {
		// Find icon in parsed data
		let item = fontData.icons.find(item => item.name === icon.name);
		if (item === void 0) {
			newIcons.push({
				icon: icon,
			});
			return;
		}

		// Mark icon for update if it needs update or if force flag is set
		if (item.version !== icon.version) {
			updatedCount++;
		}
		if (item.version !== icon.version || force) {
			updatedIcons.push({
				icon: icon,
				font: item,
			});
		}
	});

	console.log('New icons:', newIcons.length);
	console.log('Updated icons:', updatedCount);

	if (!newIcons.length && !updatedIcons.length) {
		return 'Nothing to update. Use --overwrite parameter to rebuild font data';
	}

	// Parse new icons
	newIcons.forEach(item => {
		let iconItem = item.icon,
			fontItem = {
				name: iconItem.name,
				version: iconItem.version,
				twotone: false,
				unsupported_families: iconItem.unsupported_families,
				char: {
					opaque: nextCharacter(),
				},
				code: {},
			};

		config.themeKeys.forEach(theme => {
			if (
				theme !== 'baseline' &&
				iconItem.unsupported_families &&
				iconItem.unsupported_families.indexOf(theme) !== -1
			) {
				// Identical to baseline
				return;
			}

			let code = fs.readFileSync(
				config.sourceDir + '/svg/' + iconItem.name + '/' + theme + '.svg',
				'utf8'
			);
			fontItem.code[theme] = parseIcon(
				code,
				iconItem.name + '/' + theme + '.svg'
			);
			if (typeof fontItem.code[theme].transparent === 'string') {
				fontItem.twotone = true;
			}
		});

		if (fontItem.twotone) {
			fontItem.char.transparent = nextCharacter();
		}

		fontData.icons.push(fontItem);
	});

	// Parse updated icons
	updatedIcons.forEach(item => {
		let iconItem = item.icon,
			fontItem = item.font;

		fontItem.twotone = false;

		config.themeKeys.forEach(theme => {
			if (
				theme !== 'baseline' &&
				iconItem.unsupported_families &&
				iconItem.unsupported_families.indexOf(theme) !== -1
			) {
				// Identical to baseline
				return;
			}

			let code = fs.readFileSync(
				config.sourceDir + '/svg/' + iconItem.name + '/' + theme + '.svg',
				'utf8'
			);
			fontItem.code[theme] = parseIcon(
				code,
				iconItem.name + '/' + theme + '.svg'
			);
			if (typeof fontItem.code[theme].transparent === 'string') {
				fontItem.twotone = true;
			}
		});

		if (fontItem.twotone && !fontItem.char.transparent) {
			fontItem.char.transparent = nextCharacter();
		}
	});

	// Save data
	saveFontData(fontData);

	console.log('Total icons:', fontData.icons.length);

	return fontData;
};
