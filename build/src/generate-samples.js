'use strict';

const fs = require('fs');
const config = require('./config');
const fsHelper = require('./files');

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

module.exports = fontData =>
	new Promise((fulfill, reject) => {
		console.log('\nGenerating samples');

		let replacements = {
			html: {},
			debug: {},
		};

		let build = {
			html: {
				template: 'test.html',
				output: 'test.html',
				dir: config.samplesDir,
			},
			debug: {
				template: 'debug.html',
				output: 'debug.html',
				dir: config.samplesDir,
			},
		};

		// Build icons list
		let iconsHTML = {
			html: '',
			debug: '',
		};

		fontData.icons.forEach(icon => {
			let name = icon.name;
			let rows = {
				html: '',
				debug: '',
			};

			config.themeKeys.forEach(theme => {
				rows.html += replaceAllItems(
					{
						'{font-prefix}': config.prefix.font,
						'{icon-prefix}': config.prefix.icon,
						'{theme-class}':
							theme === config.themeKeys[0]
								? config.prefix.font
								: config.prefix.font + '-' + theme,
						'{icon-name}': name,
					},
					'<i class="{theme-class} {icon-prefix}-{icon-name}"></i>'
				);

				rows.debug += replaceAllItems(
					{
						'{font-prefix}': config.prefix.font,
						'{icon-prefix}': config.prefix.icon,
						'{theme-class}':
							theme === config.themeKeys[0]
								? config.prefix.font
								: config.prefix.font + '-' + theme,
						'{icon-name}': name,
					},
					'<i class="{theme-class} {icon-prefix}-{icon-name}"></i>'
				);
				rows.debug +=
					'<img src="../../material-icons/svg/' +
					icon.name +
					'/' +
					theme +
					'.svg" /> ' +
					theme +
					'-' +
					icon.name +
					'<br />';
			});

			iconsHTML.html += rows.html + ' ' + name + '<br />';
			iconsHTML.debug += '<div>' + rows.debug + '</div>';
		});

		replacements.html['<!-- icons -->'] = iconsHTML.html;
		replacements.debug['<!-- icons -->'] = iconsHTML.debug;

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
