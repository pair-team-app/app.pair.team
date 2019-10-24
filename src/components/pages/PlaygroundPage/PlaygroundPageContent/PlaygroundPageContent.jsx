
import React, { Component } from 'react';
import './PlaygroundPageContent.css';

import phComps from '../../../../assets/json/placdeholder-components';

class PlaygroundPageContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		return (<div className="playground-page-content">
			<div className="playground-page-content-component-wrapper">
				{(phComps.map((comp, i)=> {
					const html = comp.html.replace(/ class=.+?"/, ` style="${Object.keys(comp.styles).map((key)=> (`${key}:${comp.styles[key]}`)).join('; ').replace(/"/g, '\'')}"`);

					return (<div key={i} className="playground-page-content-component" dangerouslySetInnerHTML={{ __html : html }} />);
				}))}
			</div>
		</div>);
	}
}

export default (PlaygroundPageContent);
