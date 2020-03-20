'use strict';

const path = require('path');

// Root directory of this repository
const root = path.dirname(path.dirname(path.dirname(__filename)));

// Themes
const themes = {
	baseline: 'Material Icons',
	outline: 'Material Icons Outlined',
	round: 'Material Icons Round',
	sharp: 'Material Icons Sharp',
	twotone: 'Material Icons Two Tone',
};

// Generate font file names for each theme: MaterialIcons, MaterialIcons-Outlined, etc...
let fontFilenames = {};
Object.keys(themes).forEach(theme => {
	let baseName = themes.baseline.replace(/ /g, ''),
		extraName = themes[theme].slice(themes.baseline.length).replace(/ /g, '');

	fontFilenames[theme] = baseName + (extraName.length ? '-' + extraName : '');
});

const config = {
	// Repository for SVG
	repo: 'git@github.com:material-icons/material-icons.git',

	// Directories
	rootDir: root,
	sourceDir: root + '/material-icons',
	outputDir: root,
	fontDir: root + '/font',
	styleDir: root + '/css',
	scssDir: root + '/scss',
	samplesDir: root + '/samples',
	tempDir: root + '/temp',
	templatesDir: root + '/build/templates',
	fontFilenames: fontFilenames,

	// Characters range. min = minimum, max = maximum (inclusive)
	characterRanges: [
		{
			min: parseInt('e000', 16),
			max: parseInt('f8ff', 16),
		},
		{
			min: parseInt('f0000', 16),
			max: parseInt('ffffd', 16),
		},
	],

	// Themes
	themes: themes,
	themeKeys: Object.keys(themes),

	// CSS
	prefix: {
		font: 'material-icons',
		icon: 'md',
		extra: 'md',
	},
};

module.exports = config;
