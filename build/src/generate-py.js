'use strict';

const fs = require('fs');
const path = require('path');
const config = require('./config');
const fsHelper = require('./files');
const exportSVG = require('./export-svg');

module.exports = (fontData, theme) => {
	let baseDir = config.tempDir,
		fontDir = 'font',
		svgDir = 'svg';

	fsHelper.mkdir(baseDir + '/' + fontDir);

	// Export icons
	let icons = exportSVG(fontData, theme);

	// Prepare python file
	let code = fs.readFileSync(config.templatesDir + '/build-font.py', 'utf8');

	code = code.replace(/{font_name}/g, config.themes[theme]);
	code = code.replace(/{source_dir}/g, svgDir);
	code = code.replace(/{output_dir}/g, fontDir);
	code = code.replace(/{output_name}/g, config.fontFilenames[theme]);

	let glyphs = '';
	icons.forEach((icon, index) => {
		glyphs +=
			(index > 0 ? ',' : '') + '\n\t' + icon.char + ": '" + icon.file + "'";
	});
	glyphs += '\n';
	code = code.replace('/*glyphs*/', glyphs);

	// Save code
	let filename = baseDir + '/' + theme + '.py';
	fs.writeFileSync(filename, code, 'utf8');

	return {
		dir: baseDir,
		file: filename,
	};
};
