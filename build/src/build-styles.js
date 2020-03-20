'use strict';

const fs = require('fs');
const sass = require('node-sass');
const config = require('./config');
const fsHelper = require('./files');

module.exports = fontData =>
	new Promise((fulfill, reject) => {
		// Convert .scss to .css
		let files = ['all'].concat(config.themeKeys),
			distDir = config.styleDir.split('/').pop();

		const nextFile = () => {
			let file = files.shift();
			if (file === void 0) {
				fulfill();
				return;
			}

			let source = config.scssDir + '/' + file + '.scss',
				target = config.styleDir + '/' + file + '.css';

			sass.render(
				{
					file: source,
					outputStyle: 'expanded',
				},
				(err, result) => {
					if (err) {
						console.log('Error compiling ' + file + '.scss');
						reject(err);
						return;
					}

					let code = result.css.toString();
					fs.writeFileSync(target, code, 'utf8');

					console.log(
						'Saved ' + distDir + '/' + file + '.css:',
						code.length,
						'bytes'
					);
					nextFile();
				}
			);
		};

		fsHelper.mkdir(config.styleDir);
		nextFile();
	});
