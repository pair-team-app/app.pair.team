
import { camilzeText, capitalizeText, convertURLSlug } from './funcs';

const HTML_TAB = '&nbsp;&nbsp;';


export function toCSS(slice) {
	let html = '';

	html += '{\n';
	html += `${HTML_TAB}position: absolute;\n`;
	html += `${HTML_TAB}top: ${slice.meta.frame.origin.y}px;\n`;
	html += `${HTML_TAB}left: ${slice.meta.frame.origin.x}px;\n`;
	html += `${HTML_TAB}width: ${slice.meta.frame.size.width}px;\n`;
	html += `${HTML_TAB}height: ${slice.meta.frame.size.height}px;\n`;
	if (slice.type === 'textfield') {
		html += `${HTML_TAB}font-family: "${slice.meta.font.family}", sans-serif;\n`;
		html += `${HTML_TAB}font-size: ${slice.meta.font.size}px;\n`;
		html += `${HTML_TAB}color: ${slice.meta.font.color.toUpperCase()};\n`;
		html += `${HTML_TAB}letter-spacing: ${slice.meta.font.kerning.toFixed(2)}px;\n`;
		html += `${HTML_TAB}line-height: ${slice.meta.font.lineHeight}px;\n`;
		html += `${HTML_TAB}text-align: ${slice.meta.font.alignment};\n`;

	} else if (slice.type === 'slice') {
		html += `${HTML_TAB}background: url("${slice.filename.split('/').pop()}@3x.png");\n`;
	}
	html += '}';
	html = `.${convertURLSlug(slice.title)} ${html}`;

	return ({
		html   : JSON.stringify(html),
		syntax : html.replace(/(&nbsp)+;/g, ' ')
	});
}

export function toJava(slice) {
	return ({
		html   : '',
		syntax : ''
	});
}

export function toReactCSS(slice) {
	const html = toCSS(slice).syntax.replace(/: (.+?);/g, ': \'$1\',').replace(/(-.)/g, function(v){ return (v[1].toUpperCase()); }).replace(/,\n}/, ' }').replace(/^.+{\n/, '{').replace(/ +/g, ' ').replace(/\n/g, '');

	return ({
		html   : JSON.stringify(html),
		syntax : html
	});
}

export function toSpecs(slice) {
	let content = `Name\t${slice.title}\n`;
	content += `Type\t${capitalizeText(slice.type, true)}\n`;
	content += `Export Size\tW: ${slice.meta.frame.size.width}px H: ${slice.meta.frame.size.height}px\n`;
	content += `Position\tX: ${slice.meta.frame.origin.x}px Y: ${slice.meta.frame.origin.y}px\n`;
	content += `Rotation\t${slice.meta.rotation}°\n`;
	content += `Opacity\t${slice.meta.opacity}%\n`;
	content += `Fills\t${((slice.type === 'textfield' && slice.meta.font.color) ? slice.meta.font.color.toUpperCase() : slice.meta.fillColor.toUpperCase())}\n`;

	if (slice.type === 'textfield') {
		content += `Font\t${slice.meta.font.family} ${slice.meta.font.name}\n`;
		content += `Font Size\t${slice.meta.font.size}px\n`;
		content += `Font Color\t${slice.meta.font.color.toUpperCase()}\n`;
		content += `Line Spacing\t${slice.meta.font.lineHeight}px\n`;
		content += `Char Spacing\t${slice.meta.font.kerning.toFixed(2)}px\n`;
	}

	content += `Padding\t${slice.meta.padding.top}px ${slice.meta.padding.right}px ${slice.meta.padding.bottom}px ${slice.meta.padding.left}px\n`;


	return (content);
}

export function toSwift(slice) {
	let html = '';

	if (slice.type === 'textfield') {
		let family = slice.meta.font.family.split(' ').slice(0, -1).join(' ').replace(' ', '');
		let name = slice.meta.font.name.replace(family, '');
		let postscript = (slice.meta.font.psName) ? slice.meta.font.psName : `${family}-${name}`;

		html += '// Font\n';
		html += 'enum FontFamily {\n';
		html += `${HTML_TAB}enum ${family}: String, FontConvertible {\n`;
		html += `${HTML_TAB}${HTML_TAB}static let ${name.toLowerCase()} = FontConvertible(name: "${family}-${name}", family: "${slice.meta.font.family}", path: "${postscript}.otf")\n`;
		html += `${HTML_TAB}}\n`;
		html += '}\n\n';
		html += `let ${camilzeText(slice.meta.font.family.split(' ').slice(0, -1).join(' ') + name)} = UIFont(font: FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
		html += `let ${camilzeText('alt' + slice.meta.font.family.split(' ').slice(0, -1).join(' ') + name)} = FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`
		html += '\n\n';
		html += '// Color\n';
		html += 'struct ColorName {\n';
		html += `${HTML_TAB}let rgbaValue: UInt32\n`;
		html += `${HTML_TAB}var color: Color { return Color(named: self) }\n`;
		html += `${HTML_TAB}static let ${camilzeText(slice.title)} = ColorName(rgbValue: 0x${slice.meta.font.color.replace('#', '')}ff)\n`
		html += '\n';
		html += `let ${camilzeText(slice.title)}Color = UIColor(named: .${camilzeText(slice.title)})\n`;
		html += `let ${camilzeText('alt' + slice.title)}Color = ColorName.${camilzeText(slice.title)}.color\n`;
	}

	return ({
		html   : JSON.stringify(html),
		syntax : html.replace(/(&nbsp)+;/g, ' ')
	});
}