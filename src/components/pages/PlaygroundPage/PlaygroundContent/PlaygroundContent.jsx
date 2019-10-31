
import React, { Component } from 'react';
import './PlaygroundContent.css';

//import phComps from '../../../../assets/json/placdeholder-components';

class PlaygroundContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { playground } = this.props;

		return (<div className="playground-content">
			<div className="playground-content-component-wrapper">
				{(playground.components.map((comp, i)=> {
					//const html = comp.html.replace(/\\"/g, '"').replace(/ class=.+?"/, ` style="${Object.keys(comp.styles).map((key)=> (`${key}:${comp.styles[key]}`)).join('; ').replace(/"/g, '\'')}"`);


					let grp = {};
					comp.children.forEach((child, i)=> {
						const path = [ ...child.path].pop();
						const inline = inlineStyles(child.html, child.styles);

						let sub = Object.fromEntries([[[...path.split(':')].shift(), [inline]]]);
						// find parent & make new sub obj as array
						if ((path.substr(-1) << 0) === 0) {

							if (Object.keys(grp).length === 0) {
								grp = sub;
								console.log('=0', grp, sub, child.path);

							} else {
// 								grp = { ...grp,
// 									[child.path[0].split(':')[0]] :
// 								};


// 								const sub = Object.keys(grp).find((key, i)=> (key === child.path[0].split(':')[0]));
								console.log('>0', grp, sub, child.path);
							}

						// find object w/ ind 0 & append array
						} else {
							console.log('>0', grp, sub, child.path);
						}
					});


					let html = ['', ''];
					comp.children.forEach((child, i)=> {
						const path = [ ...child.path].pop();
						const inline = inlineStyles(child.html, child.styles);

						if ((path.substr(-1) << 0) === 0) {
							html = [`${html[0]}${inline.split('[:]')[0]}`, `${inline.split('[:]')[1]}${html[1]}`];

						} else {
							html = [`${html[0]}`, `${html[1].replace(/><?/, `>${inline.split('[:]').join('').replace('[:]', '')}<`)}`];
						}

// 						console.log(i, path, html);
					});

					let children = '';
					const content = inlineStyles(comp.html, comp.styles).replace(/\[:]/, html.join(''));
					return (<div key={i} className="playground-content-component" data-id={comp.id} dangerouslySetInnerHTML={{ __html : content }} />);
				}))}
			</div>
		</div>);
	}
}


const inlineStyles = (html, styles)=> {
	const style = Object.keys(styles).map((key)=> (`${key}:${styles[key]}`)).join('; ').replace(/"/g, '\'');
	return ((/style="(.+?)"/i.test(html)) ? `${html.replace(/style="/, `style="${style} `)}` : html.replace(/>/, ` style="${style}">`).replace(/ class=.+?"/, ''));
};


export default (PlaygroundContent);
