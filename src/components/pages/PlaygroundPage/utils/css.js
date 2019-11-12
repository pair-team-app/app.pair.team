
export const inlineStyles = (html, styles)=> {
	const style = Object.keys(styles).map((key)=> (`${key}:${styles[key]}`)).join('; ').replace(/"/g, '\'');
	return ((/style="(.+?)"/i.test(html)) ? `${html.replace(/style="/, `style="${style} `)}` : html.replace(/>/, ` style="${style}">`).replace(/ class=.+?"/, ''));
};
