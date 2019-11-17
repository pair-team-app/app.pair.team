'use strict';


export const convertStyles = (styles)=> {
	let style = {};

	Object.keys(styles).forEach((key)=> {
		if (key.startsWith('--')) {
			style[[key]] = styles[key];

		} else {
			style[key.replace(/(-.)/g, (c)=> (c[1].toUpperCase()))] = styles[key];
		}
	});

	return (style);
};


export const inlineStyles = (html, styles)=> {
	const style = Object.keys(styles).map((key)=> (`${key}:${styles[key]}`)).join('; ').replace(/"/g, '\'');
	return ((/style="(.+?)"/i.test(html)) ? `${html.replace(/style="/, `style="${style} `)}` : html.replace(/>/, ` style="${style}">`).replace(/ class=.+?"/, ''));
};
