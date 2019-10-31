
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

					let children = '';
					let path = '';
					comp.children.forEach((child, i)=> {
						path = [ ...child.path].pop();

// 						console.log(path, inlineStyles(child.html, child.styles));
						children = (path.substr(-1) === '0' && children.length > 0) ? `${children.replace(/<\//, `${inlineStyles(child.html, child.styles)}</`)}` : `${children}${inlineStyles(child.html, child.styles)}`;
					});

					const content = inlineStyles(comp.html, comp.styles).replace(/<\//, `${children}</`);
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
