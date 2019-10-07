"use strict";

const fs = require('fs');
const config = require('./config');

// Get font data
let fontData;
try {
    fontData = fs.readFileSync(config.outputDir + '/data.json', 'utf8');
    fontData = JSON.parse(fontData);
    if (!(fontData.icons instanceof Array)) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Bad data');
    }
} catch (err) {
    console.log('Font data is missing. Creating new set.');
    fontData = {
        icons: []
    }
}

module.exports = fontData;
