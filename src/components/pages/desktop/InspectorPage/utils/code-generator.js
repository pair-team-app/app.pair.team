
import { Maths, Objects, Strings, URIs } from '../../../../../utils/lang';

const TAB = '  ';
const badChars = /[\\.,_+=[\](){}:]/g;
const DISCLAIMER = '__LANG__ Generator v1.0,\nCode snippets by Design Engine.,\nMade in Mountain View, CA.\n__';

const fontWeight = (style)=> {
	if (!style || typeof style === 'undefined') {
		return (400);
	}

	if (/thin/i.test(style)) {
		return (100);

	} else if (/(extra|ultra)light/i.test(style)) {
		return (200);

	} else if (/light/i.test(style)) {
		return (300);

	} else if (/book|normal/i.test(style)) {
		return (400);

	} else if (/medium/i.test(style)) {
		return (500);

	} else if (/(semi|demi)bold/i.test(style)) {
		return (600);

	} else if (/(ps)?bold(mt)?/i.test(style)) {
		return (700);

	} else if (/(extra|ultra)bold/i.test(style)) {
		return (800);

	} else if (/black|heavy/i.test(style)) {
		return (900);

	} else {
		return (400);
	}
};


export function fontSpecs(font) {
	let { name, family, psName, size, lineHeight } = font;

	name = (name) ? name : (family) ? (family.includes(' ')) ? family.split(' ').slice().pop() : family.split('-').slice().pop() : 'Regular';
	family = (family) ? (family.includes(' ')) ? family.split(' ').slice().shift() : family.split('-').slice().shift() : '';
	name = name.replace(family, '').replace(/ +/g, '');
	family = family.replace(name, '').replace(/ +/g, '');
	psName = (psName && !Objects.isEmpty(psName)) ? psName : `${family}-${name}`.replace(/ +/g, '');
	lineHeight = (lineHeight) ? lineHeight : (size) ? (size + (size / 3) << 0) : 0;
	size = (size) ? size : (lineHeight) ? Math.round((lineHeight * 3) * 0.25) : 0;
	const weight = fontWeight(name);

	return (Object.assign({}, font, { family, name, psName, weight, size, lineHeight }));
}

export function toAndroid(slices, artboard) {
// 	console.log('code-generator.toAndroid()', slices, artboard);

	const artboardName = Strings.camelize(Strings.slugifyURI(artboard.title).replace(/[-/—]+/g, ' ').replace(badChars, ''), null, true);

	let html = '';//`<!-- ${DISCLAIMER.replace('__LANG__', 'XML').replace(/\n__/g, ' -->\n<!-- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -->').replace(/,\n/g, ' -->\n<!-- ')}\n\n\n`;
	html += `<?xml version="1.0" encoding="utf-8"?>\n`;
	slices.forEach((slice)=> {
		const sliceName = Strings.camelize(Strings.slugifyURI(slice.title).replace(/[-/—]+/g, ' ').replace(badChars, ''), null, true);
		const viewType = (slice.type === 'textfield') ? 'Text View' : 'Image View';
		const caption = viewType;
		html += `<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"\n`;
		html += `${TAB}xmlns:app="http://schemas.android.com/apk/res-auto" \n`;
		html += `${TAB}xmlns:tools="http://schemas.android.com/tools" \n`;
		html += `${TAB}android:id="@+id/activity_${artboardName}" \n`;
		html += `${TAB}android:layout_width="match_parent" \n`;
		html += `${TAB}android:layout_height="match_parent" \n`;
		html += `${TAB}android:paddingLeft="${slice.meta.frame.origin.x}px" \n`;
		html += `${TAB}android:paddingTop="${slice.meta.frame.origin.y}px" \n`;
		html += `${TAB}android:paddingRight="${artboard.meta.frame.size.width - slice.meta.frame.size.width}px" \n`;
		html += `${TAB}android:paddingBottom="${artboard.meta.frame.size.height - slice.meta.frame.size.height}px" \n`;
		html += `${TAB}tools:context=".${artboardName}Activity">\n`;
		html += `${TAB}<${viewType.replace(/ /g, '')} \n`;
		html += `${TAB}${TAB}android:id="@+id/${Strings.camelize(viewType)}_${sliceName}" \n`;
		html += `${TAB}${TAB}android:layout_width="wrap_content" \n`;
		html += `${TAB}${TAB}android:layout_height="wrap_content" \n`;
		html += `${TAB}${TAB}android:text="${caption}" \n`;
		html += `${TAB}${TAB}app:layout_constraintBottom_toBottomOf="parent" \n`;
		html += `${TAB}${TAB}app:layout_constraintEnd_toEndOf="parent" \n`;
		html += `${TAB}${TAB}app:layout_constraintStart_toStartOf="parent" \n`;
		html += `${TAB}${TAB}app:layout_constraintTop_toTopOf="parent" />\n`;
		html += '</android.support.constraint.ConstraintLayout>\n\n';
	});

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(TAB, '\t')}`
	})
}

export function toBootstrap(slices) {
// 	console.log('code-generator.toBootstrapJS()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	const parentSlice = slices.shift();
	let html = '';//`/**\n * ${DISCLAIMER.replace('__LANG__', 'Bootstrap').replace(/\n__/g, '\n **//* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, '\n * ')}\n\n\n`;
	if (parentSlice.type === 'background' || parentSlice.type === 'group') {
		html += `$body-bg: ${parentSlice.meta.fillColor.toUpperCase()};\n\n`;
	}
	html += `@import "../node_modules/bootstrap/scss/bootstrap";\n\n`;
	html += `<div class="card" style="width: ${parentSlice.meta.frame.size.width}px">\n`;
	slices.forEach((slice)=> {
		html += `${TAB}<div class="card-body">\n`;
		html += `${TAB}${TAB}<h5 class="card-title">${slice.title}</h5>\n`;
		html += (slice.type === 'textfield') ? `${TAB}${TAB}<p class="card-text">${slice.meta.txtVal}</p>\n` : `${TAB}${TAB}<img class="card-img" src="./images/${URIs.lastComponent(slice.filename)}@1x.png" alt="${slice.title}">\n`;
		html += `${TAB}</div>\n`;
	});
	html += `</div>\n`;

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}`
	});
}

export function toCSS(slices) {
// 	console.log('code-generator.toCSS()', slices);

	let html = '';//`/* ${DISCLAIMER.replace('__LANG__', 'CSS').replace(/\n__/g, ' */\n/* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, ' */\n/* ')}\n\n\n`;
	slices.forEach((slice)=> {
		html += `.${Strings.slugifyURI(slice.title)} {\n`;
		html += `${TAB}position: absolute;\n`;
		html += `${TAB}top: ${slice.meta.frame.origin.y}px;\n`;
		html += `${TAB}left: ${slice.meta.frame.origin.x}px;\n`;
		html += `${TAB}width: ${slice.meta.frame.size.width}px;\n`;
		html += `${TAB}height: ${slice.meta.frame.size.height}px;\n`;
		if (slice.type === 'textfield') {
			const font = fontSpecs(slice.meta.font);

			html += `${TAB}font-family: "${`${font.family} ${font.name}`.trim()}", sans-serif;\n`;
			html += `${TAB}font-weight: ${font.weight};\n`;
			html += `${TAB}font-size: ${font.size}px;\n`;
			html += `${TAB}color: ${font.color.toUpperCase()};\n`;
			html += `${TAB}letter-spacing: ${font.kerning.toFixed(2)}px;\n`;
			html += `${TAB}line-height: ${font.lineHeight}px;\n`;
			html += `${TAB}text-align: ${font.alignment.toLowerCase()};\n`;

		} else if (slice.type === 'slice') {
			html += `${TAB}background: url("${URIs.lastComponent(slice.filename)}@3x.png");\n`;

		} else if (slice.type === 'background' || slice.type === 'group') {
			html += `${TAB}background-color: ${slice.meta.fillColor.toUpperCase()};\n`;
		}
		html += `}\n`;
	});

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(TAB, '\t')}`
	});
}

export function toGridHTML(slices) {
// 	console.log('code-generator.toFlexBoxHTML()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	const parentSlice = [...slices].shift();
	slices = [...slices].slice(1, Math.min(slices.length, 4));

	let html = '';//`<!-- ${DISCLAIMER.replace('__LANG__', 'HTML').replace(/\n__/g, ' -->\n<!-- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -->').replace(/,\n/g, ' -->\n<!-- ')}\n\n\n`;
	html += `<style>\n`;
	html += `${TAB}.grid-container {\n`;
	html += `${TAB}${TAB}display: grid;\n`;
	html += `${TAB}${TAB}grid-template-columns:${Strings.repeat(' auto', slices.length)};\n`;
	html += `${TAB}${TAB}grid-gap: ${Maths.randomInt(5, 15)}px;\n`;
	html += `${TAB}${TAB}background-color: ${parentSlice.meta.fillColor.toUpperCase()};\n`;
	html += `${TAB}}\n`;
	html += `${TAB}.grid-container > div {\n`;
	html += `${TAB}${TAB}padding: ${Maths.randomInt(5, 15)}px;\n`;
	html += `${TAB}${TAB}text-align: center;\n`;
	html += `${TAB}${TAB}vertical-align: middle;\n`;
	html += `${TAB}}\n`;
	slices.forEach((slice)=> {
		if (slice.type === 'textfield') {
			const font = fontSpecs(slice.meta.font);

			html += `${TAB}.${Strings.slugifyURI(slice.title)} {\n`;
			html += `${TAB}${TAB}font-family: "${`${font.family} ${font.name}`.trim()}", sans-serif;\n`;
			html += `${TAB}${TAB}font-weight: ${font.weight};\n`;
			html += `${TAB}${TAB}font-size: ${font.size}px;\n`;
			html += `${TAB}${TAB}color: ${font.color.toUpperCase()};\n`;
			html += `${TAB}${TAB}letter-spacing: ${font.kerning.toFixed(2)}px;\n`;
			html += `${TAB}${TAB}line-height: ${font.lineHeight}px;\n`;
			html += `${TAB}${TAB}text-align: ${font.alignment.toLowerCase()};\n`;
			html += `${TAB}}\n`;
		}
	});
	html += `</style>\n\n`;

	html += `<div class="grid-container">\n`;
	slices.forEach((slice)=> {
		html += `${TAB}<div class="grid-cell ${Strings.slugifyURI(slice.title)}">`;
		html += (slice.type === 'textfield') ? `${slice.meta.txtVal}` : `<img src="./images/${URIs.lastComponent(slice.filename)}@1x.png" alt="${slice.title}">`;
		html += `</div>\n`;
	});
	html += `</div>\n`;

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}`
	});

// 	html += `${TAB}${TAB}: ;\n`;
}

export function toReactCSS(slices) {
// 	console.log('code-generator.toReactCSS()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	const html = toCSS(slices).syntax.replace(/: (.+?);/g, ': \'$1\',').replace(/(-.)/g, (c)=> (c[1].toUpperCase())).replace(/,\n}/, ' }').replace(/^.+{\n/, '{').replace(/ +/g, ' ').replace(/\n/g, '');
	return ({
		html   : JSON.stringify(`/* ${DISCLAIMER} */\n\n${html}`),
		syntax : `${html}\n`
	});
}

export function toReactJS(slices) {
// 	console.log('code-generator.toReactJS()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	const parentSlice = [...slices].shift();
	slices = [...slices].slice(1, Math.min(slices.length, 4));

	const componentName = Strings.camelize(parentSlice.title.replace(badChars, ''), null, true);
	let html = '';//`/**\n * ${DISCLAIMER.replace('__LANG__', 'JSX').replace(/\n__/g, '\n **//* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, '\n * ')}\n\n\n`;
	html += 'import React, { Component } from \'react\';\n';
	html += `import './${componentName}.css';\n\n`;
	html += `import axios from 'axios';\n`;
	html += `import qs from 'qs'\n`;
	html += `import { Column, Row } from 'simple-flexbox';\n`;
	html += `const wrapper = React.createRef();\n\n`;


	slices.forEach((slice)=> {
		const title = slice.title.replace(badChars, '');
		html += `const ${Strings.camelize(title, null, true)} = (props)=> {\n`;
		html += `${TAB}return (<div className="${Strings.slugifyURI(title)}-wrapper">\n`;
		html += (slice.type === 'textfield') ? `${TAB}${TAB}<div className="${Strings.slugifyURI(title)}-text">${slice.meta.txtVal}</div>\n` : `${TAB}${TAB}<img className="${Strings.slugifyURI(title)}-image" src="./images/${URIs.lastComponent(slice.filename)}@1x.png" alt="${slice.title}" />\n`;
		html += `${TAB}</div>);\n`;
		html += `};\n\n`;
	});


	html += `class ${componentName} extends Component {\n`;
	html += `${TAB}constructor(props) {\n`;
	html += `${TAB}${TAB}super(props);\n`;
	html += `${TAB}${TAB}this.state = {\n`;
	html += `${TAB}${TAB}};\n`;
	html += `${TAB}}\n\n`;
	html += `${TAB}render() {\n`;
	html += `${TAB}${TAB}return (<div className="${Strings.slugifyURI(componentName)}">\n`;
	slices.forEach((slice)=> {
		html += `${TAB}${TAB}${TAB}<${Strings.camelize(slice.title.replace(badChars, ''), null, true)} />\n`;
	});
	html += `${TAB}${TAB}</div>);\n`;
	html += `${TAB}}\n`;
	html += `}\n\n`;
	html += `export default ${componentName};\n`;

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}`
	});
}

export function toSpecs(slice) {
	let content = `Name\t\t\t\t\t${slice.title}\n`;
	content += `Type\t\t\t\t\t${Strings.capitalize(slice.type, true)}\n`;
	content += `Export Size\t\tW: ${slice.meta.frame.size.width}px H: ${slice.meta.frame.size.height}px\n`;
	content += `Position\t\t\tX: ${slice.meta.frame.origin.x}px Y: ${slice.meta.frame.origin.y}px\n`;
	content += `Rotation\t\t\t${slice.meta.rotation}°\n`;
	content += `Opacity\t\t\t\t${slice.meta.opacity}%\n`;
	content += `Fills\t\t\t\t\t${((slice.type === 'textfield' && slice.meta.font.color) ? slice.meta.font.color.toUpperCase() : slice.meta.fillColor.toUpperCase())}\n`;

	if (slice.type === 'textfield') {
		const font = fontSpecs(slice.meta.font);

		content += `Font\t\t\t\t\t${font.family} ${font.name}\n`;
		content += `Font Weight\t\t${font.weight}\n`;
		content += `Font Size\t\t\t${font.size}px\n`;
		content += `Font Color\t\t${font.color.toUpperCase()}\n`;
		content += `Line Spacing\t${font.lineHeight}px\n`;
		content += `Char Spacing\t${font.kerning.toFixed(2)}px\n`;
	}

	content += `Padding\t\t\t\t${slice.meta.padding.top}px ${slice.meta.padding.right}px ${slice.meta.padding.bottom}px ${slice.meta.padding.left}px\n`;
	content += '\n';

	return (content);
}

export function toSwift(slices, artboard) {
// 	console.log('code-generator.toSwift()', slices, artboard);

	const artboardName = Strings.camelize(artboard.title.replace(/[-/—]+/g, ' ').replace(badChars, ''), null, true);
	let html = '';//`/**\n * ${DISCLAIMER.replace('__LANG__', 'Swift').replace(/\n__/g, '\n **//* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, '\n * ')}\n\n\n`;
	slices.forEach((slice)=> {
		if (slice.type === 'background' || slice.type === 'group' || slice.type === 'slice' || slice.type === 'symbol' || slice.type === 'textfield') {
			const sliceName = Strings.camelize(Strings.slugifyURI(slice.title).replace(/[-/—]+/g, ' ').replace(badChars, ''));

			html += `// Asset\n`;
			html += `enum Asset {\n`;
			html += `${TAB}enum ${artboardName} {\n`;
			html += `${TAB}${TAB}static let ${sliceName}: AssetType = "${artboardName}/${Strings.capitalize(sliceName)}"\n`;
			html += `${TAB}}\n`;
			html += `}\n\n`;
			html += `let ${sliceName}Image = UIImage(asset: Asset.${artboardName}.${sliceName})\n`;
			html += `let alt${sliceName}Image = Asset.${artboardName}.${sliceName}.image\n`;

			if (slice.meta.fillColor.length > 0) {
				html += `\n\n// Color \n`;
				html += `struct ColorName {\n`;
				html += `${TAB}let rgbaValue: UInt32\n`;
				html += `${TAB}var color: Color { return Color(named: self) }\n`;
				html += `${TAB}static let ${Strings.camelize(slice.title)} = ColorName(rgbaValue: 0x${slice.meta.fillColor.replace('#', '')}ff)\n`;
				html += '\n';
				html += `let ${Strings.camelize(slice.title)}Color = UIColor(named: .${Strings.camelize(slice.title)})\n`;
				html += `let ${Strings.camelize('alt' + slice.title)}Color = ColorName.${Strings.camelize(slice.title)}.color\n`;
			}

		} else if (slice.type === 'textfield') {
			const { family, name, psName } = fontSpecs(slice.meta.font);

			html += `// Font\n`;
			html += `enum FontFamily {\n`;
			html += `${TAB}enum ${family}: String, FontConvertible {\n`;
			html += `${TAB}${TAB}static let ${name.toLowerCase()} = FontConvertible(name: "${family}-${name}", family: "${slice.meta.font.family}", path: "${psName}.otf")\n`;
			html += `${TAB}}\n`;
			html += `}\n\n`;
			html += `let ${Strings.camelize([family, name].join(' '))} = UIFont(font: FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
			html += `let ${Strings.camelize(['alt', family, name].join(' '))} = FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
			html += `\n\n`;
			html += `// Color\n`;
			html += `struct ColorName {\n`;
			html += `${TAB}let rgbaValue: UInt32\n`;
			html += `${TAB}var color: Color { return Color(named: self) }\n`;
			html += `${TAB}static let ${Strings.camelize(slice.title)} = ColorName(rgbaValue: 0x${slice.meta.font.color.replace('#', '')}ff)\n`;
			html += `\n`;
			html += `let ${Strings.camelize(slice.title)}Color = UIColor(named: .${Strings.camelize(slice.title)})\n`;
			html += `let ${Strings.camelize('alt' + slice.title)}Color = ColorName.${Strings.camelize(slice.title)}.color\n`;
		}
	});

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}\n`
	});
}
