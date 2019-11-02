
import React, { Component } from 'react';
import './PlaygroundNavPanel.css';


class PlaygroundNavPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { team, items } = this.props;
		return (<div className="playground-nav-panel">
			<PlaygroundPageNavHeader team={team} />
			<div className="playground-nav-panel-link-wrapper">
				{(items.map((item, i)=> (<div key={i} className="playground-nav-panel-link">{item.title}</div>)))}
			</div>
		</div>);
	}
}


const PlaygroundPageNavHeader = (props)=> {
	const { team } = props;

	return (<div className="playground-nav-panel-header">
		<img className="playground-nav-panel-header-logo" src={team.logo} alt="Logo" />
		<div className="playground-nav-panel-header-title">{team.title}</div>
	</div>);
};

export default (PlaygroundNavPanel);
