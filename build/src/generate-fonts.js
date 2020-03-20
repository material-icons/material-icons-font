'use strict';

const fs = require('fs');
const svg2ttf = require('svg2ttf');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const config = require('./config');
const fsHelper = require('./files');

module.exports = (code, theme) =>
	new Promise((fulfill, reject) => {
		let filename = config.fontFilenames[theme];

		// Create directory for font
		fsHelper.mkdir(config.fontDir);

		// Generate TTF
		let ttf = svg2ttf(code, {});
		let content = Buffer.from(ttf.buffer);
		fs.writeFileSync(config.fontDir + '/' + filename + '.ttf', content);
		console.log('Saved TTF:', content.length, 'bytes');

		// Generate WOFF
		let woff = ttf2woff(ttf.buffer);
		content = Buffer.from(woff.buffer);
		fs.writeFileSync(config.fontDir + '/' + filename + '.woff', content);
		console.log('Saved WOFF:', content.length, 'bytes');

		// Generate WOFF2
		let woff2 = ttf2woff2(ttf.buffer);
		content = Buffer.from(woff2.buffer);
		fs.writeFileSync(config.fontDir + '/' + filename + '.woff2', content);
		console.log('Saved WOFF2:', content.length, 'bytes');

		fulfill(theme);
	});
