
import React, { Component } from 'react';
import './FeaturesPage.css';

import BasePage from '../BasePage';


class FeaturesPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			expanded : [
				false,
				false,
				false
			]
		};
	}

	componentDidMount() {
// 		console.log(this.constructor.name, '.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log(this.constructor.name, '.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	handleSectionToggle = (section)=> {
// 		console.log(this.constructor.name, '.handleSectionToggle()', section, this.state.expanded, this.state.expanded[section.ind]);

		let expanded = this.state.expanded;
		expanded.splice(section.ind, 1, !this.state.expanded[section.ind]);
		this.setState({ expanded });
	};

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { expanded } = this.state;
		return (
			<BasePage className="features-page-wrapper">
				<h1 >Features</h1>
				<div className="features-page-text">
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut felis nibh, lacinia a ullamcorper eget, lacinia nec arcu. Donec condimentum porttitor arcu, sed porta lectus venenatis at. Nunc commodo sagittis libero, ut malesuada turpis vulputate vel. Pellentesque accumsan urna in tortor pharetra fringilla. Phasellus hendrerit a felis in facilisis. Morbi sagittis feugiat sapien id mollis.</p>
				</div>
				<div className="expand-section features-page-section">
					<h2 onClick={()=> this.handleSectionToggle({ ind : 0 })}>Module</h2>
					{(expanded[0]) && (<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut felis nibh, lacinia a ullamcorper eget, lacinia ne.</p>)}
				</div>
				<div className="expand-section features-page-section">
					<h2 onClick={()=> this.handleSectionToggle({ ind : 1 })}>Plugin</h2>
					{(expanded[1]) && (<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut felis nibh, lacinia a ullamcorper eget, lacinia ne.</p>)}
				</div>
				<div className="expand-section features-page-section">
					<h2 onClick={()=> this.handleSectionToggle({ ind : 2 })}>Tool</h2>
					{(expanded[2]) && (<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut felis nibh, lacinia a ullamcorper eget, lacinia ne.</p>)}
				</div>
			</BasePage>
		);
	}
}


export default (FeaturesPage);
