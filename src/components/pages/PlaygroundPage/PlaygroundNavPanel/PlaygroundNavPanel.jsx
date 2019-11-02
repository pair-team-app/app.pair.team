
import React, { Component } from 'react';
import './PlaygroundNavPanel.css';

import NavPanelTypeGroup from './NavPanelTypeGroup';

class PlaygroundNavPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups : []
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const typeIDs = this.props.items.map((item)=> (item.typeID));
		const typeGroups = this.props.typeGroups.filter((typeGroup)=> (typeIDs.includes(typeGroup.id))).map((typeGroup)=> {
			return ({ ...typeGroup,
				items : this.props.items.filter((item)=> (item.typeID === typeGroup.id))
			});
		});
		this.setState({ typeGroups });
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { team } = this.props;
		const { typeGroups } = this.state;

		return (<div className="playground-nav-panel">
			<PlaygroundNavPanelHeader team={team} />
			<div className="playground-nav-panel-component-type-wrapper">
				{(typeGroups.map((typeGroup, i)=> (<NavPanelTypeGroup key={i} typeGroup={typeGroup} />)))}
			</div>
		</div>);
	}
}


const PlaygroundNavPanelHeader = (props)=> {
// 	console.log('PlaygroundNavPanelHeader()', props);

	const { team } = props;
	return (<div className="playground-nav-panel-header">
		<img className="playground-nav-panel-header-logo" src={team.logo} alt="Logo" />
		<div className="playground-nav-panel-header-title">{team.title}</div>
	</div>);
};


export default (PlaygroundNavPanel);
