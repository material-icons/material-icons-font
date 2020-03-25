'use strict';

const fs = require('fs');
const config = require('./config');
const fsHelper = require('./files');

const toHex = num => Number(num).toString(16);

const templates = {
	scss: "'{name}': {hex1}",
	scss_twotone: "'{name}': ({hex1}, {hex2})",
};

/**
 * Replace all entries of string
 *
 * @param {string} search
 * @param {string} replace
 * @param {string} code
 * @return {string}
 */
const replaceAll = (search, replace, code) => {
	let result = '',
		index;

	while ((index = code.indexOf(search)) !== -1) {
		result += code.slice(0, index) + replace;
		code = code.slice(index + search.length);
	}

	return result + code;
};

/**
 * Replace all pairs
 *
 * @param {object} replacements
 * @param {string} code
 * @return {string}
 */
const replaceAllItems = (replacements, code) => {
	Object.keys(replacements).forEach(search => {
		code = replaceAll(search, replacements[search], code);
	});
	return code;
};

/**
 * Build line of replacements
 *
 * @param {string} key
 * @param {object} icon
 * @param {boolean} twotone
 * @return {string}
 */
const buildLine = (key, icon, twotone) => {
	let replacements = {
		'{name}': icon.name,
		'{hex1}': toHex(icon.char.opaque),
		'{hex2}': twotone ? toHex(icon.char.transparent) : '',
	};

	let code = templates[key + (twotone ? '_twotone' : '')];
	Object.keys(replacements).forEach(search => {
		code = replaceAll(search, replacements[search], code);
	});
	return code;
};

module.exports = fontData =>
	new Promise((fulfill, reject) => {
		console.log('\nParsing stylesheets');

		let replacements = {
			common: {
				'#{$font-prefix}': '.' + config.prefix.font,
				'#{$icon-prefix}': '.' + config.prefix.icon,
				'#{$extra-prefix}': '.' + config.prefix.extra,
				'{font-path}': '../font/',
				'{default-theme}': config.themeKeys[0],
				'{default-family}': config.themes[config.themeKeys[0]],
				'{default-filename}': config.fontFilenames[config.themeKeys[0]],
			},
			scss: {},
		};

		let build = {
			scss: {
				template: 'style.scss',
				output: 'all.scss',
				dir: config.scssDir,
			},
		};

		// Add build and replacements for each theme
		config.themeKeys.forEach(theme => {
			build['scss_' + theme] = {
				template: 'style.scss',
				output: theme + '.scss',
				dir: config.scssDir,
			};
			replacements['scss_' + theme] = {
				'{default-theme}': theme,
				'{default-family}': config.themes[theme],
				'{default-filename}': config.fontFilenames[theme],
			};
		});

		// Build theme - font pairs
		let themePairs = [];
		config.themeKeys.forEach((theme, index) => {
			replacements['scss_' + theme]['/*themes*/'] = '';
			if (index < 1) {
				return;
			}
			themePairs.push(
				"'" +
					theme +
					"': ('" +
					config.themes[theme] +
					"', '" +
					config.fontFilenames[theme] +
					"')"
			);
		});
		replacements.scss['/*themes*/'] = themePairs.join(',\n  ');

		// Build icon - code pairs
		let iconPairs = {
			all: [],
		};
		config.themeKeys.forEach(theme => {
			iconPairs[theme] = [];
		});

		fontData.icons.forEach(icon => {
			iconPairs.all.push(buildLine('scss', icon, icon.twotone));
			config.themeKeys.forEach(theme => {
				let iconTheme = icon.code[theme] === void 0 ? 'baseline' : theme;
				iconPairs[theme].push(
					buildLine(
						'scss',
						icon,
						icon.twotone && typeof icon.code[iconTheme].transparent === 'string'
					)
				);
			});
		});

		replacements.scss['/*icons*/'] = iconPairs.all.join(',\n  ');
		config.themeKeys.forEach(theme => {
			replacements['scss_' + theme]['/*icons*/'] = iconPairs[theme].join(
				',\n  '
			);
		});

		// Create files
		Object.keys(build).forEach(key => {
			let item = build[key],
				code = fs.readFileSync(
					config.templatesDir + '/' + item.template,
					'utf8'
				);

			code = replaceAllItems(
				Object.assign({}, replacements.common, replacements[key]),
				code
			);

			fsHelper.mkdir(item.dir);
			fs.writeFileSync(item.dir + '/' + item.output, code, 'utf8');

			console.log(
				'Saved ' + item.dir.split('/').pop() + '/' + item.output + ':',
				code.length,
				'bytes'
			);
		});

		fulfill();
	});
