'use strict';

const child_process = require('child_process');
const fsHelper = require('./files');
const config = require('./config');

module.exports = () =>
	new Promise((fulfill, reject) => {
		let ignore = process.argv.slice(2).indexOf('--no-clone') !== -1;
		if (ignore && fsHelper.exists(config.sourceDir + '/package.json')) {
			fulfill();
			return;
		}

		let cmd =
			'git clone "' +
			config.repo +
			'" --branch master --depth 1 --no-tags "' +
			config.sourceDir +
			'"';

		// Remove old files
		fsHelper.cleanup(config.sourceDir);

		// Clone repository
		console.log('Cloning ' + config.repo);
		child_process.exec(
			cmd,
			{
				cwd: config.rootDir,
				env: process.env,
				uid: process.getuid(),
			},
			(error, stdout, stderr) => {
				if (error) {
					reject('Error executing: ' + cmd + ': ' + error);
				} else {
					fulfill();
				}
			}
		);
	});
