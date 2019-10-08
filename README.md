# Material design icons, updated font

Material design icons is the official [icon set](https://www.google.com/design/spec/style/icons.html#icons-system-icons) from Google.  The icons are designed under the [material design guidelines](https://material.io/guidelines/).


### Updated set

This is updated version of icons, directly from [material.io](https://material.io/resources/icons/).

You can find older version of this icons set in [google/material-design-icons](https://github.com/google/material-design-icons) repository.

Because official repository is no longer maintained, I have decided to make alternative repository with latest icons.


## Available icons

Version 3 that is available in official icons repository only includes 1 variation of each icon.

This repository includes several variations for each icon:

* baseline
* sharp
* outline
* round
* twotone

This repository includes only icons as font. Other available formats are in different repositories:

* SVG: [material-icons](https://github.com/material-icons/material-icons)
* PNG: [material-icons-png](https://github.com/material-icons/material-icons-png)

If you need other format, please open issue on material-icons repository and specify what format, size and color you need.

Icons are also available with Iconify SVG framework. See below.


## Getting started

This readme explains how to use font in your projects.

### Include stylesheet

To use icons in your project you need to include stylesheet.

Add following code to your page:
```html
<link rel="stylesheet" href="https://material-icons.github.io/material-icons-font/css/all.css" />
```

This will include all 5 fonts and all icons. If you want to include only 1 type of font, change "all.css" to one of following:
* baseline.css for base font
* outline.css for MaterialIcons Outline
* round.css for MaterialIcons Round
* sharp.css for MaterialIcons Sharp
* twotone.css for MaterialIcons TwoTone


### No ligatures

Official font does not work in older browsers because of two tone icons. It renders both opaque and transparent parts of icon in same glyph, which is not supported by older browsers.

Unlike official font from Google, this font does not use ligatures. Implementing two tone icons while supporting older browsers is not possible with ligatures. Downside is this font has quite big stylesheet.

### HTML syntax

To use any icon, add "material-icon" to list of classes and icon name with "md-" prefix:

```html
<i class="material-icons md-email"></i>
```


This will display icon with base font, 24px height.

To change font size you can use css or add one of predefined classes:
* md-18 for 18px height
* md-24 for 24px height (default)
* md-36 for 36px height
* md-48 for 48px height

```html
<i class="material-icons md-48 md-signal-wifi-3-bar"></i>
```

To change color change font color. There are also several predefined colors:
* md-dark for black icon (on light background)
* md-light for white icon (on dark background)

Additionally to those colors you can set md-inactive for grey inactive color:

```html
<i class="material-icons md-dark md-turned-in"></i>
<i class="material-icons md-dark md-inactive md-turned-in-not"></i>
```


If you are using all.css, to use different icon font add class name for that icon font:
* md-outline for "MaterialIcons Outline" font
* md-round for "MaterialIcons Round" font
* md-sharp for "MaterialIcons Sharp" font
* md-twotone for "MaterialIcons TwoTone" font

```html
<i class="material-icons md-sharp md-shuffle"></i>
<i class="material-icons md-twotone md-videocam-off"></i>
```

### Two tone icons

Two tone icons are implemented by splitting icon in two parts: opaque part and transparent part, then displaying them as 2 separate glyphs placed on top of each other.

For example, this is what battery_30 icon looks like: ![baseline-battery_30.svg](https://material-icons.github.io/material-icons-font/samples/baseline-battery_30.svg)

Font uses 2 glyphs to represent that icon:
* transparent part ![baseline-battery_30-transparent.svg](https://material-icons.github.io/material-icons-font/samples/baseline-battery_30-transparent.svg)
* opaque part ![baseline-battery_30-opaque.svg](https://material-icons.github.io/material-icons-font/samples/baseline-battery_30-opaque.svg)

They are layered on top of each other. :before is used to display transparent part, :after is used to display opaque part with 30% opacity.

#### Changing colors in two tone icons

Using stylesheet you can change color of any part.

To change color for opaque part, change color of :after pseudo element:
```css
.md:after { color: red; }
```


To change color for transparent part, change color (and opacity) of :before pseudo element:
```css
.md:before { color: blue; opacity: 1; }
```

## Avoid using font

More and more icon fonts are moving away from fonts to various SVG frameworks.

Several years ago when icon fonts became popular browsers had poor support for SVG and JavaScript was slow, therefore font was a better solution.

There are many downsides to using fonts that cannot be addressed, but support for SVG and SVG frameworks have improved.

Font loads all icons that take a while to load and quite big stylesheet. Also fonts render with blurred ugly edges on some operating systems, worst offender is Windows.

Good news, all icons are available as modern JavaScript framework that replaces glyph fonts. See below.


### JavaScript framework

All icons are available with [Iconify JavaScript framework](https://iconify.design/).

#### What is Iconify?

Iconify project makes it easy to add SVG icons to websites and offers over 40,000 icons to choose from.

You can use Iconify not only with this icon set, but also [Templarian's Material Design Icons](https://iconify.design/icon-sets/mdi/), [Material Design Light](https://iconify.design/icon-sets/mdi-light/), [FontAwesome 5](https://iconify.design/icon-sets/fa-regular/) and many other icon sets on same page without loading massive fonts.

How is it achieved? Iconify project uses new innovative approach to loading icons. Unlike fonts and SVG frameworks, Iconify only loads icons that are used on page instead of loading entire fonts. How is it done? By serving icons dynamically from publicly available JSON API (you can make a copy of script and API if you prefer to keep everything on your servers).

Iconify is designed to be as easy to use as possible. It uses icon placeholder syntax and icons inherit size and color from parent element, so they are easy to style with css.

#### How to use this icons set with Iconify?

Add this line to your page to load Iconify:

```
<script src="https://code.iconify.design/1/1.0.3/iconify.min.js"></script>
```

you can add it to ```<head>``` section of page or before ```</body>```.

To add any icon, write something like this:

```
<span class="iconify" data-icon="ic:baseline-access-time" data-inline="false"></span>
```
or this:
```
<iconify-icon data-icon="ic:twotone-account-circle"></iconify-icon>
```
There are 2 small differences in icon names when using Iconify: icons have "ic:" prefix and underscores in icon name have been replaced by dash.

See [how to use Iconify](https://iconify.design/docs/iconify-in-pages/) tutorial and [browse MDI icons list](https://iconify.design/icon-sets/ic/) to get code for each icon.

#### Stylesheet

Iconify is not specific to this icon set. It does not force font size, so by default icon size is set to 1em and classes like .md-18 are not supported. You will need to add custom css to change font size.


## License

(copied from Google's repository)

We have made these icons available for you to incorporate into your products under the [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt). Feel free to remix and re-share these icons and documentation in your products.
We'd love attribution in your app's *about* screen, but it's not required. The only thing we ask is that you not re-sell these icons.
