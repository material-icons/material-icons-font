'use strict';

const fs = require('fs');
const config = require('./config');

module.exports = data => {
	fs.writeFileSync(
		config.outputDir + '/data.json',
		JSON.stringify(data, null, '\t'),
		'utf8'
	);
};
