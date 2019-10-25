
import React, { Component } from 'react';
import './PlaygroundPageNav.css';




class PlaygroundPageNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { team, items } = this.props;

		return (<div className="playground-page-nav">
			<PlaygroundPageNavHeader team={team} />
			<div className="playground-page-nav-link-wrapper">
				{(items.map((item, i)=> (<div key={i} className="playground-page-nav-link">{item.title}</div>)))}
			</div>
		</div>);
	}
}


const PlaygroundPageNavHeader = (props)=> {
	const { team } = props;

	return (<div className="playground-page-nav-header">
		<img className="playground-page-nav-header-logo" src={team.logo} alt="Logo" />
		<div className="playground-page-nav-header-title">{team.title}</div>
	</div>);
};

export default (PlaygroundPageNav);
