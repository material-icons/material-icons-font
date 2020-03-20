'use strict';

const fs = require('fs');

const functions = {
	/**
	 * Check if file exists
	 *
	 * @param {string} filename
	 * @param {boolean} [returnMTime]
	 * @returns {boolean}
	 */
	exists: (filename, returnMTime) => {
		let stats;
		try {
			stats = fs.statSync(filename);
		} catch (e) {
			return false;
		}

		return returnMTime ? stats.mtimeMs : true;
	},

	/**
	 * Create directory recursively
	 *
	 * @param {string|Array} path
	 */
	mkdir: path => {
		let dirs = typeof path === 'string' ? path.split('/') : path,
			dir;

		if (dirs.length) {
			dir = '';
			dirs.forEach(part => {
				dir += part;
				if (dir.length) {
					try {
						fs.mkdirSync(dir, 0o755);
					} catch (err) {}
				}
				dir += '/';
			});
		}
	},

	/**
	 * Delete file
	 *
	 * @param {string} filename
	 * @returns {boolean}
	 */
	unlink: filename => {
		try {
			fs.unlinkSync(filename);
		} catch (err) {
			return false;
		}
		return true;
	},

	/**
	 * Get list of files in directory
	 *
	 * @param {string} dir
	 * @param {boolean} [includeDir] = false
	 * @returns {Array} List of files, excluding directory name
	 */
	list: (dir, includeDir) => {
		let results = [];

		function rec(extra) {
			let files, base;

			try {
				files = fs.readdirSync(dir + extra);
			} catch (err) {
				return;
			}

			base = extra.length ? extra.slice(1) + '/' : '';

			files.forEach(file => {
				let filename = dir + extra + '/' + file,
					stats;

				try {
					stats = fs.lstatSync(filename);
				} catch (err) {
					return;
				}

				if (stats.isDirectory()) {
					rec(extra + '/' + file);
					return;
				}

				if (stats.isFile()) {
					results.push(includeDir ? filename : base + file);
				}
			});
		}
		rec('');

		return results;
	},

	/**
	 * Remove files in directory
	 *
	 * @param {string} dir
	 * @param {Array} [ignoreFiles] Files to ignore. Full file names
	 * @param {boolean} [includeDir] True if directory should be removed as well
	 */
	cleanup: (dir, ignoreFiles, includeDir) => {
		let counter = 0,
			errors = [];

		ignoreFiles = typeof ignoreFiles === 'object' ? ignoreFiles : [];

		function rec(extra) {
			let ignored = false,
				files;

			try {
				files = fs.readdirSync(dir + extra);
			} catch (err) {
				errors.push({
					error: err,
					filename: dir + extra,
					type: 'readdir',
				});
				return;
			}

			files.forEach(file => {
				let filename = dir + extra + '/' + file,
					stats = fs.lstatSync(filename);

				if (stats.isDirectory()) {
					if (rec(extra + '/' + file)) {
						// true returned - directory has ignored files
						ignored = true;
						return;
					}

					// Try to remove directory
					try {
						fs.rmdirSync(filename);
					} catch (err) {
						errors.push({
							error: err,
							filename: filename,
							type: 'dir',
						});
						ignored = true;
					}
					return;
				}

				if (stats.isFile() || stats.isSymbolicLink()) {
					if (ignoreFiles.indexOf(filename) !== -1) {
						ignored = true;
						return;
					}

					// Try to remove file
					try {
						fs.unlinkSync(filename);
						counter++;
					} catch (err) {
						errors.push({
							error: err,
							filename: filename,
							type: 'file',
						});
						ignored = true;
					}
					return;
				}

				errors.push({
					filename: filename,
					type: 'unknown',
				});
			});

			return ignored;
		}

		if (!rec('') && includeDir) {
			try {
				fs.rmdirSync(dir);
				counter++;
			} catch (err) {
				errors.push({
					error: err,
					filename: dir,
					type: 'dir',
				});
			}
		}

		return errors.length ? errors : counter;
	},
};

module.exports = functions;
