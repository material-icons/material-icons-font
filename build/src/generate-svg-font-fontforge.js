'use strict';

const fs = require('fs');
const config = require('./config');
const genPythonFile = require('./generate-py');
const child_process = require('child_process');

module.exports = (fontData, theme) =>
	new Promise((fulfill, reject) => {
		let script = genPythonFile(fontData, theme);

		child_process.exec(
			'python3 ' + script.file,
			{
				encoding: 'utf8',
				cwd: script.dir,
				uid: process.getuid(),
			},
			(error, stdout, stderr) => {
				if (error) {
					throw error;
				}

				// Remove lines that are not errors
				let output = stderr;
				output = output
					.split('\n')
					.filter(
						item =>
							item.indexOf('Failed to set locale category') === -1 &&
							item.indexOf('Generating font file') === -1 &&
							item.trim().length > 0
					);

				// Find failed log lines
				// Because of some fontforge shenanigans, error output and normal output lines might not match,
				// so debug it by running "python3 twotone.py" and removing lines to figure out which icon causes problems
				let failed = [];
				output.forEach(line => {
					line = line.trim();
					if (line.slice(0, 10) !== 'Importing ') {
						throw new Error('Received invalid line: ' + line);
					}

					let parts = line.split('>');
					if (parts.length < 2) {
						throw new Error('Received invalid line: ' + line);
					}

					let imported = parts.shift().trim(),
						message = parts.join('>').trim();

					if (message.length) {
						imported = imported.replace('Importing', '').trim();
						failed.push(imported);
					}
				});

				if (failed.length) {
					console.error(
						'Failed to import these files (filename in error could be wrong!):\n' +
							failed.join('\n')
					);
					reject('Failed to generate font for theme ' + theme);
					return;
				}

				// Clean up SVG file
				let filename =
					config.tempDir + '/font/' + config.fontFilenames[theme] + '.svg';
				let code = fs.readFileSync(filename, 'utf8');

				// Change bbox
				code = code.replace(/bbox="[0-9\s.-]+"/, 'bbox="0 0 512 512"');

				// Change panose to match original font
				code = code.replace('panose-1="2 0 5 9', 'panose-1="2 0 5 3');

				// Change underline-position
				code = code.replace(
					/underline-position="[0-9.-]+"/,
					'underline-position="-125"'
				);

				// Remove id
				code = code.replace(/\s*id="Untitled[0-9]*"/, '');

				// Remove metadata
				code = code.replace(/<metadata>[\s\S]*<\/metadata>\s*/, '');
				code = code.replace(/<!--[\s\S]*-->\s*/, '');

				fs.writeFileSync(filename, code, 'utf8');

				fulfill(code);
			}
		);
	});
