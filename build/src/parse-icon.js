'use strict';

const fs = require('fs');
const cheerio = require('cheerio');

const isDefinition = tag => tag === 'defs';
const isClipPath = tag => tag === 'clipPath';
const isUse = tag => tag === 'use';
const isShape = tag => {
	switch (tag) {
		case 'path':
		case 'circle':
		case 'line':
		case 'polygon':
		case 'polyline':
		case 'rect':
		case 'ellipse':
			return true;
	}

	return false;
};

const isTransparent = (node, filename) => {
	if (!node.attribs) {
		return false;
	}

	let value;
	if (node.attribs.opacity !== void 0) {
		value = parseFloat(node.attribs.opacity);
		if (value === 0.3) {
			return true;
		}
		console.log(
			'Invalid opacity value in ' + filename + ': ' + node.attribs.opacity
		);
		return value < 0.5;

		throw new Error(
			'Invalid opacity value in ' + filename + ': ' + node.attribs.opacity
		);
	}

	if (node.attribs['fill-opacity'] !== void 0) {
		value = parseFloat(node.attribs['fill-opacity']);
		if (value === 0.3) {
			return true;
		}
		console.log(
			'Invalid fill-opacity value in ' +
				filename +
				': ' +
				node.attribs['fill-opacity']
		);
		return value < 0.5;

		throw new Error(
			'Invalid fill-opacity value in ' +
				filename +
				': ' +
				node.attribs['fill-opacity']
		);
	}

	return false;
};

const getClipId = value => {
	if (value.slice(0, 1) === '#') {
		return value.slice(1);
	}
	if (value.slice(0, 5) !== 'url(#') {
		return false;
	}
	value = value.slice(5);
	return value.slice(0, value.length - 1);
};

module.exports = (code, filename) => {
	let $opaqueNode = cheerio.load(code, {
			lowerCaseAttributeNames: false,
			xmlMode: true,
		}),
		$opaqueRoot = $opaqueNode(':root'),
		hasTransparent = false,
		defs = {},
		clipPaths = {},
		shapes = [];

	// Find definitions, clip paths and validate tags
	$opaqueRoot.children().each((index, child) => {
		// <defs><path id="ic-a" d="M24 24H0V0h24v24z"/></defs>
		if (isDefinition(child.tagName)) {
			if (isTransparent(child, filename)) {
				console.log(code);
				throw new Error(
					'Unexpected transparent node <' + child.tagName + '> in ' + filename
				);
			}

			let $child = cheerio(child),
				children = $child.children();

			children.each((index2, child2) => {
				if (!isShape(child2.tagName)) {
					console.log(code);
					throw new Error(
						'Encountered <' + child2.tagName + '> in ' + filename
					);
				}
				if (!child2.attribs || !child2.attribs.id) {
					console.log(code);
					throw new Error(
						'Missing id in <' + child2.tagName + '> in ' + filename
					);
				}
				if (isTransparent(child2, filename)) {
					console.log(code);
					throw new Error(
						'Unexpected transparent shape in <' +
							child2.tagName +
							'> in ' +
							filename
					);
				}
				defs[child2.attribs.id] = {
					opaque: false,
					transparent: false,
					clip: false,
					index: index,
					index2: index2,
				};
			});

			return;
		}

		// <clipPath id="ic-b"><use xlink:href="#ic-a" overflow="visible"/></clipPath>
		if (isClipPath(child.tagName)) {
			if (isTransparent(child, filename)) {
				console.log(code);
				throw new Error(
					'Unexpected transparent node <' + child.tagName + '> in ' + filename
				);
			}
			if (!child.attribs || !child.attribs.id) {
				console.log(code);
				throw new Error('Missing id in <' + child.tagName + '> in ' + filename);
			}

			clipPaths[child.attribs.id] = {
				opaque: false,
				transparent: false,
				index: index,
				// index2: 0,
				// id
			};

			cheerio(child)
				.children()
				.each((index2, child2) => {
					if (index2 > 0) {
						console.log(code);
						throw new Error(
							'Expected only one <' + child2.tagName + '> node in ' + filename
						);
					}
					if (!isUse(child2.tagName)) {
						console.log(code);
						throw new Error(
							'Encountered <' + child2.tagName + '> in ' + filename
						);
					}
					if (!child2.attribs || !child2.attribs['xlink:href']) {
						console.log(code);
						throw new Error(
							'Missing href in <' + child2.tagName + '> in ' + filename
						);
					}
					let id = getClipId(child2.attribs['xlink:href']);
					if (id === false) {
						console.log(code);
						throw new Error(
							'Invalid id in <' + child2.tagName + '> in ' + filename
						);
					}
					if (isTransparent(child2, filename)) {
						console.log(code);
						throw new Error(
							'Unexpected transparent shape in <' +
								child2.tagName +
								'> in ' +
								filename
						);
					}
					clipPaths[child.attribs.id].id = id;
				});
			return;
		}

		// Check shape
		if (!isShape(child.tagName)) {
			console.log(code);
			throw new Error('Encountered <' + child.tagName + '> in ' + filename);
		}

		let shape = {
			index: index,
			transparent: false,
		};
		if (child.attribs) {
			// <path clip-path="url(#ic-b)" d="M3 ..."/>
			if (child.attribs['clip-path']) {
				let id = getClipId(child.attribs['clip-path']);
				if (id === false) {
					throw new Error(
						'Bad clip-path value in <' + child.tagName + '> in ' + filename
					);
				}
				shape.id = id;
			}

			if (isTransparent(child, filename)) {
				shape.transparent = true;
				hasTransparent = true;
			}
		}
		shapes.push(shape);
	});

	if (!hasTransparent) {
		// Nothing to change
		return {
			opaque: $opaqueRoot.html(),
		};
	}

	// Check for nodes that use ids
	shapes.forEach(shape => {
		if (shape.id === void 0) {
			return;
		}
		if (clipPaths[shape.id] !== void 0) {
			// Check clipPath
			clipPaths[shape.id][shape.transparent ? 'transparent' : 'opaque'] = true;

			// Check nested <defs> shape
			let id = clipPaths[shape.id];
			if (defs[id] === void 0) {
				throw new Error('Missing <def> with id ' + id + ' in ' + filename);
			}
			defs[id][shape.transparent ? 'transparent' : 'opaque'] = true;
		} else if (defs[shape.id] === void 0) {
			throw new Error(
				'Missing <def> or <clipPath> with id ' + shape.id + ' in ' + filename
			);
		} else {
			defs[shape.id][shape.transparent ? 'transparent' : 'opaque'] = true;
		}
	});

	// Re-check clipPath and defs for links
	Object.keys(clipPaths).forEach(id => {
		if (!clipPaths[id].opaque && !clipPaths[id].transparent) {
			throw new Error('Unlinked <clipPath> with id ' + id + ' in ' + filename);
		}
	});
	Object.keys(defs).forEach(id => {
		if (!defs[id].opaque && !defs[id].transparent) {
			throw new Error('Unlinked <defs> with id ' + id + ' in ' + filename);
		}
	});

	// Load code again for transparent icon
	let $transparentNode = cheerio.load(code, {
			lowerCaseAttributeNames: false,
			xmlMode: true,
		}),
		$transparentRoot = $transparentNode(':root');

	let $opaqueChildren = $opaqueRoot.children(),
		$transparentChildren = $transparentRoot.children();

	// Find all nodes to remove
	let remove = [];
	shapes.forEach(shape => {
		if (shape.transparent) {
			remove.push($opaqueChildren.eq(shape.index));
			$transparentChildren.eq(shape.index).removeAttr('opacity');
			$transparentChildren.eq(shape.index).removeAttr('fill-opacity');
		} else {
			remove.push($transparentChildren.eq(shape.index));
		}
	});

	Object.keys(defs).forEach(id => {
		throw new Error('(needs testing!) Got definitions to split in ' + filename);
		let item = defs[id];
		if (!item.opaque) {
			remove.push(
				$opaqueChildren
					.eq(item.index)
					.children()
					.eq(item.index2)
			);
		}
		if (!item.transparent) {
			remove.push(
				$transparentChildren
					.eq(item.index)
					.children()
					.eq(item.index2)
			);
		}
	});

	Object.keys(clipPaths).forEach(id => {
		throw new Error('(needs testing!) Got clipPath to split in ' + filename);
		let item = clipPaths[id];
		if (!item.opaque) {
			remove.push($opaqueChildren.eq(item.index));
		}
		if (!item.transparent) {
			remove.push($transparentChildren.eq(item.index));
		}
	});

	// Remove them all!
	remove.forEach(node => {
		node.remove();
	});

	return {
		opaque: $opaqueRoot.html(),
		transparent: $transparentRoot.html(),
	};
};
