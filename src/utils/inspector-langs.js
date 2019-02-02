
import { camilzeText, capitalizeText, convertURISlug, isEmptyObject } from './funcs';

const HTML_TAB = '  ';


const fontWeight = (style)=> {
	if (!style || typeof style === 'undefined') {
		return (400);
	}

	if (style.toLowerCase().includes('thin')) {
		return (100);

	} else if (style.toLowerCase().includes('extralight') || style.toLowerCase().includes('ultralight')) {
		return (200);

	} else if (style.toLowerCase().includes('light')) {
		return (300);

	} else if (style.toLowerCase().includes('book') || style.toLowerCase().includes('normal') || style.toLowerCase().includes('regular') || style.toLowerCase().includes('roman')) {
		return (400);

	} else if (style.toLowerCase().includes('medium')) {
		return (500);

	} else if (style.toLowerCase().includes('semibold') || style.toLowerCase().includes('demibold')) {
		return (600);

	} else if (style.toLowerCase().includes('bold') || style.toLowerCase().includes('boldmt') || style.toLowerCase().includes('psboldmt')) {
		return (700);

	} else if (style.toLowerCase().includes('extrabold') || style.toLowerCase().includes('ultrabold')) {
		return (800);

	} else if (style.toLowerCase().includes('black') || style.toLowerCase().includes('heavy')) {
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
	psName = (psName && !isEmptyObject(psName)) ? psName : `${family}-${name}`.replace(/ +/g, '');
	lineHeight = (lineHeight) ? lineHeight : (size) ? (size + Math.floor(size / 3)) : 0;
	size = (size) ? size : (lineHeight) ? Math.round((lineHeight * 3) * 0.25) : 0;
	const weight = fontWeight(name);

	return (Object.assign({}, font, { family, name, psName, weight, size, lineHeight }));
}

export function toCSS(slice) {
	let html = '{\n';
	html += `${HTML_TAB}position: absolute;\n`;
	html += `${HTML_TAB}top: ${slice.meta.frame.origin.y}px;\n`;
	html += `${HTML_TAB}left: ${slice.meta.frame.origin.x}px;\n`;
	html += `${HTML_TAB}width: ${slice.meta.frame.size.width}px;\n`;
	html += `${HTML_TAB}height: ${slice.meta.frame.size.height}px;\n`;
	if (slice.type === 'textfield') {
		const font = fontSpecs(slice.meta.font);

		html += `${HTML_TAB}font-family: "${font.family} ${font.name}", sans-serif;\n`;
		html += `${HTML_TAB}font-weight: ${font.weight};\n`;
		html += `${HTML_TAB}font-size: ${font.size}px;\n`;
		html += `${HTML_TAB}color: ${font.color.toUpperCase()};\n`;
		html += `${HTML_TAB}letter-spacing: ${font.kerning.toFixed(2)}px;\n`;
		html += `${HTML_TAB}line-height: ${font.lineHeight}px;\n`;
		html += `${HTML_TAB}text-align: ${font.alignment};\n`;

	} else if (slice.type === 'slice') {
		html += `${HTML_TAB}background: url("${slice.filename.split('/').pop()}@3x.png");\n`;
	}
	html += '}';
	html = `.${convertURISlug(slice.title)} ${html}`;

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(HTML_TAB, '\t')}\n`
	});
}

export function toReactCSS(slice) {
	const html = toCSS(slice).syntax.replace(/: (.+?);/g, ': \'$1\',').replace(/(-.)/g, (c)=> (c[1].toUpperCase())).replace(/,\n}/, ' }').replace(/^.+{\n/, '{').replace(/ +/g, ' ').replace(/\n/g, '');

	return ({
		html   : JSON.stringify(html),
		syntax : `${html}\n`
	});
}

export function toSpecs(slice) {
	let content = `Name\t\t\t\t\t${slice.title}\n`;
	content += `Type\t\t\t\t\t${capitalizeText(slice.type, true)}\n`;
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

export function toSwift(slice, artboard) {
// 	console.log('funcs.toSwift()', slice, artboard);

	const badChars = /[\\.,_+=[\](){}]/g;

	let html = '';
	if (slice.type === 'slice' || slice.type === 'group') {
		const artboardName = camilzeText(artboard.title.replace(/[-/—]+/g, ' ').replace(badChars, ''), null, true);
		const sliceName = camilzeText(convertURISlug(slice.title).replace(/[-/—]+/g, ' ').replace(badChars, ''));

		html += '// Asset\n';
		html += 'enum Asset {\n';
		html += `${HTML_TAB}enum ${artboardName} {\n`;
		html += `${HTML_TAB}${HTML_TAB}static let ${sliceName}: AssetType = "${artboardName}/${capitalizeText(sliceName)}"\n`;
		html += `${HTML_TAB}}\n`;
		html += '}\n\n';
		html += `let ${sliceName}Image = UIImage(asset: Asset.${artboardName}.${sliceName})\n`;
		html += `let alt${sliceName}Image = Asset.${artboardName}.${sliceName}.image\n`;

		if (slice.meta.fillColor.length > 0) {
			html += '\n\n// Color \n';
			html += 'struct ColorName {\n';
			html += `${HTML_TAB}let rgbaValue: UInt32\n`;
			html += `${HTML_TAB}var color: Color { return Color(named: self) }\n`;
			html += `${HTML_TAB}static let ${camilzeText(slice.title)} = ColorName(rgbaValue: 0x${slice.meta.fillColor.replace('#', '')}ff)\n`;
			html += '\n';
			html += `let ${camilzeText(slice.title)}Color = UIColor(named: .${camilzeText(slice.title)})\n`;
			html += `let ${camilzeText('alt' + slice.title)}Color = ColorName.${camilzeText(slice.title)}.color\n`;
		}

	} else if (slice.type === 'textfield') {
		const { family, name, psName } = fontSpecs(slice.meta.font);

		html += '// Font\n';
		html += 'enum FontFamily {\n';
		html += `${HTML_TAB}enum ${family}: String, FontConvertible {\n`;
		html += `${HTML_TAB}${HTML_TAB}static let ${name.toLowerCase()} = FontConvertible(name: "${family}-${name}", family: "${slice.meta.font.family}", path: "${psName}.otf")\n`;
		html += `${HTML_TAB}}\n`;
		html += '}\n\n';
		html += `let ${camilzeText([family,name].join(' '))} = UIFont(font: FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
		html += `let ${camilzeText(['alt', family, name].join(' '))} = FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
		html += '\n\n';
		html += '// Color\n';
		html += 'struct ColorName {\n';
		html += `${HTML_TAB}let rgbaValue: UInt32\n`;
		html += `${HTML_TAB}var color: Color { return Color(named: self) }\n`;
		html += `${HTML_TAB}static let ${camilzeText(slice.title)} = ColorName(rgbaValue: 0x${slice.meta.font.color.replace('#', '')}ff)\n`;
		html += '\n';
		html += `let ${camilzeText(slice.title)}Color = UIColor(named: .${camilzeText(slice.title)})\n`;
		html += `let ${camilzeText('alt' + slice.title)}Color = ColorName.${camilzeText(slice.title)}.color\n`;
	}

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}\n`
	});
}
