'use strict';

const fs = require('fs');
const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const config = require('./config');
const fsHelper = require('./files');
const exportSVG = require('./export-svg');

const toHex = num => Number(num).toString(16);

module.exports = (fontData, theme) =>
	new Promise((fulfill, reject) => {
		let baseDir = config.tempDir,
			fontDir = 'font',
			svgDir = 'svg';

		fsHelper.mkdir(baseDir + '/' + fontDir);

		// Export icons
		let icons = exportSVG(fontData, theme);

		// Create font
		const fontStream = new SVGIcons2SVGFontStream({
			fontName: config.themes[theme],
			fontHeight: 512,
		});

		let filename =
			baseDir + '/' + fontDir + '/' + config.fontFilenames[theme] + '.svg';

		fontStream
			.pipe(fs.createWriteStream(filename))
			.on('finish', function() {
				fulfill(fs.readFileSync(filename, 'utf8'));
			})
			.on('error', function(err) {
				reject(err);
			});

		icons.forEach(item => {
			let glyph = fs.createReadStream(baseDir + '/' + svgDir + '/' + item.file);
			glyph.metadata = {
				unicode: [String.fromCharCode(item.code)],
				name: item.name,
			};
			fontStream.write(glyph);
		});

		fontStream.end();
	});
