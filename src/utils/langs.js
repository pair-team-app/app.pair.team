
import {convertURLSlug} from './funcs';

export function toCSS(slice) {
	let html = '';

	html += '{\n';
	html += '&nbsp;&nbsp;position: absolute;\n';
	html += '&nbsp;&nbsp;top: ' + slice.meta.frame.origin.y + 'px;\n';
	html += '&nbsp;&nbsp;left: ' + slice.meta.frame.origin.x + 'px;\n';
	html += '&nbsp;&nbsp;width: ' + slice.meta.frame.size.width + 'px;\n';
	html += '&nbsp;&nbsp;height: ' + slice.meta.frame.size.height + 'px;\n';
	if (slice.type === 'textfield') {
		html += '&nbsp;&nbsp;font-family: "' + slice.meta.font.family + '", sans-serif;\n';
		html += '&nbsp;&nbsp;font-size: ' + slice.meta.font.size + 'px;\n';
		html += '&nbsp;&nbsp;color: ' + slice.meta.font.color.toUpperCase() + ';\n';
		html += '&nbsp;&nbsp;letter-spacing: ' + slice.meta.font.kerning.toFixed(2) + 'px;\n';
		html += '&nbsp;&nbsp;line-height: ' + slice.meta.font.lineHeight + 'px;\n';
		html += '&nbsp;&nbsp;text-align: ' + slice.meta.font.alignment + ';\n';

	} else if (slice.type === 'slice') {
		html += '&nbsp;&nbsp;background: url("' + slice.filename.split('/').pop() + '@3x.png");\n';
	}
	html += '}';

	html = '.' + convertURLSlug(slice.title) + ' ' + html;

	return ({
		html   : JSON.stringify(html),
		syntax : html.replace(/(&nbsp)+;/g, ' ')
	});
}

export function toReactCSS(slice) {
	const html = toCSS(slice).syntax.replace(/: (.+?);/g, ': \'$1\',').replace(/(-.)/g, function(v){ return (v[1].toUpperCase()); }).replace(/,\n}/, ' }').replace(/^.+{\n/, '{').replace(/ +/g, ' ').replace(/\n/g, '');

	return ({
		html   : JSON.stringify(html),
		syntax : html
	});
}