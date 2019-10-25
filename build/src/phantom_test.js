"use strict";

var system = require('system'),
    fs = require('fs'),
    webpage = require('webpage'),
    data, next, template;

if (system.args.length < 3) {
    console.log('Invalid arguments');
    phantom.exit();
}

// Get data
data = JSON.parse(fs.read(system.args[2]));
if (typeof data !== 'object' || !data.icons) {
    console.log('Invalid arguments');
    phantom.exit();
}

// Get template
template = fs.read(system.args[1]);
template = template.replace('{css}', 'file://' + data.css);

// Parse next icon
next = function() {
    var icon = data.icons.shift(),
        key, svgPage, fontPage, code, html;

    if (icon === void 0) {
        // Done
        phantom.exit();
        return;
    }

    key = icon.name + '/' + icon.theme;
    // console.log('Comparing ' + key);

    // Create pages
    svgPage = webpage.create();
    svgPage.viewportSize = {
        width: data.size,
        height: data.size
    };
    fontPage = webpage.create();
    fontPage.viewportSize = {
        width: data.size,
        height: data.size
    };

    // SVG page
    svgPage.onLoadFinished = function(status) {
        var classList;

        if (status !== 'success') {
            console.log('Error loading SVG for ' + key);
            next();
            return;
        }

        // Create page with font
        classList = [
            data.prefixes.font,
            data.prefixes.font + '-' + icon.theme,
            data.prefixes.icon + '-' + icon.name
        ];
        code = '<i class="' + classList.join(' ') + '"></i>';
        html = template.replace('{icon}', code);

        fontPage.onLoadFinished = function(status) {
            var svgCode, fontCode;

            if (status !== 'success') {
                svgPage.close();
                console.log('Error loading font for ' + key);
                next();
                return;
            }

            // Debug
            svgPage.render(data.temp + '/' + icon.name + '.' + icon.theme + '.svg.png');
            fontPage.render(data.temp + '/' + icon.name + '.' + icon.theme + '.font.png');

            // Both pages are ready
            svgCode = svgPage.renderBase64('PNG');
            fontCode = fontPage.renderBase64('PNG');
            if (svgCode !== fontCode) {
                console.log('Fail: ' + key);

                // svgPage.render(data.temp + '/' + icon.name + '.' + icon.theme + '.svg.png');
                // fontPage.render(data.temp + '/' + icon.name + '.' + icon.theme + '.font.png');

                // console.log(svgCode);
                // console.log(fontCode);
            } else {
                console.log('Pass: ' + key);
            }

            svgPage.close();
            fontPage.close();
            next();
        };
        fontPage.setContent(html, 'http://127.0.0.1/');
    };

    code = '<img src="file://' + data.svg.replace('{name}', icon.name).replace('{theme}', icon.theme) + '" />';
    html = template.replace('{icon}', code);
    svgPage.setContent(html, 'http://127.0.0.1/');
};

// Compare next icon
next();