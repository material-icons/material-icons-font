"use strict";

const fs = require('fs');
const config = require('./src/config');
const getFontData = require('./src/font-data');
const buildFonts = require('./src/build-fonts');
const generateStyles = require('./src/generate-styles');
const buildStyles = require('./src/build-styles');
const generateSamples = require('./src/generate-samples');
const child_process = require('child_process');

// Check if --overwrite flag is set
let overwrite = process.argv.slice(2).indexOf('--overwrite') !== -1;

// Get font data
let fontData = getFontData(overwrite);
if (!fontData) {
    return;
}

// Build stuff
buildFonts(fontData).then(() => {
    return generateStyles(fontData);
}).then(() => {
    return buildStyles(fontData);
}).then(() => {
    return generateSamples(fontData);
}).then(() => {
    console.log('\nDone.');
}).catch(err => {
    console.error(err);
});
