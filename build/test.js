"use strict";

const fs = require('fs');
const child_process = require('child_process');

const config = require('./src/config');
const fsHelper = require('./src/files');

// Filenames and directories
const scriptFilename = config.rootDir + '/build/src/phantom_test.js';
const tempFilename = config.tempDir + '/test.json';
const templateFile = config.templatesDir + '/phantom-test.html';
const tempDir = config.tempDir + '/test-debug';

/**
 * Test icons
 *
 * @param {Array} icons
 * @param {function} done
 */
const test = (icons, done) => {
    let data = {
        temp: tempDir,
        css: config.styleDir + '/all.css',
        svg: config.sourceDir + '/svg/{name}/{theme}.svg',
        prefixes: config.prefix,
        size: 24,
        icons: icons
    };

    fs.writeFileSync(tempFilename, JSON.stringify(data, null, 2), 'utf8');

    // Execute script
    let cmd = 'phantomjs "' + scriptFilename + '" "' + templateFile + '" "' + tempFilename + '"';
    console.log(cmd);
    child_process.exec(cmd, {
        cwd: config.rootDir,
        env: process.env,
        uid: process.getuid()
    }, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return;
        }

        // Done
        done();
    });
};

// Create directories
fsHelper.mkdir(tempDir);
fsHelper.cleanup(tempDir, [], false);

// Check for data.json
if (!fsHelper.exists(config.rootDir + '/data.json')) {
    console.error('Test should be ran after building files.');
    return;
}

// Check for material-icons cloned repo
if (!fsHelper.exists(config.sourceDir + '/package.json')) {
    console.error('Test should be ran after building files. Missing SVG repository.');
    return;
}

// Check for fonts
if (config.themeKeys.map(
    // Get filename for WOFF2 font
    theme => config.fontDir + '/' + config.fontFilenames[theme] + '.woff2'
).filter(
    // Keep only files that do not exist
    filename => !fsHelper.exists(filename)
).length) {
    console.error('Test should be ran after building files. Missing font files.');
    return;
}

// Check for CSS
if (!fsHelper.exists(config.styleDir + '/all.css')) {
    console.error('Test should be ran after building files. Missing stylesheets.');
    return;
}

// Check for PhantomJS
let cmd = 'phantomjs -v';
child_process.exec(cmd, {
    cwd: config.rootDir,
    env: process.env,
    uid: process.getuid()
}, (error, stdout, stderr) => {
    if (error) {
        console.error('Test requires PhantomJS.');
        return;
    }

    // Get all icons
    let icons = JSON.parse(fs.readFileSync(config.rootDir + '/data.json', 'utf8')).icons;

    // Test next batch of icons
    const nextBatch = () => {
        let batch = [],
            icon;

        while ((icon = icons.shift()) !== void 0 && batch.length < config.testBatch) {
            Object.keys(icon.code).forEach(theme => {
                batch.push({
                    theme: theme,
                    name: icon.name
                });
            });
        }

        if (!batch.length) {
            console.log('Done.');
            return;
        }

        // Test icons in batch
        test(batch, nextBatch);
    };

    // Test next batch of icons
    nextBatch();
});