
import React, { Component } from 'react';
import './PlaygroundNavPanel.css';

import { grabFavicon } from 'favicongrab';
import { connect } from 'react-redux';
import NavPanelTypeGroup from './NavPanelTypeGroup';
import { TEAM_DEFAULT_AVATAR } from '../../../../consts/uris';

class PlaygroundNavPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups : [],
			teamLogo   : null
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		this.onPopulateTree();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { playground } = this.props;
		if (playground !== prevProps.playground) {
			this.onPopulateTree();
		}

		const { component } = this.props;
		if (this.props.typeGroup && this.props.typeGroup !== prevProps.typeGroup) {
			const typeGroups = this.state.typeGroups.map((typeGroup)=> {
				const items = typeGroup.items.map((item)=> ({ ...item,
					selected : (component && item.id === component.id)
				}));

				return ({ ...typeGroup, items,
					selected : (typeGroup.id === this.props.typeGroup.id)
				});
			});

			this.setState({ typeGroups });
		}

		if (component && component !== prevProps.component) {
			const typeGroups = this.state.typeGroups.map((typeGroup)=> {
				const items = typeGroup.items.map((item)=> ({ ...item,
					selected : (component && item.id === component.id)
				}));

				return ({ ...typeGroup, items,
					selected : (typeGroup.id === this.props.typeGroup.id)
				});
			});

			this.setState({ typeGroups });
		}
	};

	handleTypeGroupClick = (typeGroup)=> {
// 		console.log('%s.handleTypeGroupClick()', this.constructor.name, typeGroup);
		this.props.onTypeGroupClick(typeGroup);
	};

	handleTypeItemClick = (typeGroup, typeItem)=> {
// 		console.log('%s.handleTypeItemClick()', this.constructor.name, typeGroup, typeItem);
		this.props.onTypeItemClick(typeGroup, typeItem);
	};

	onPopulateTree = ()=> {
// 		console.log('%s.onPopulateTree()', this.constructor.name);

		const { componentTypes, playground, component } = this.props;
		const typeIDs = playground.components.map(({ typeID })=> (typeID));

		const typeGroups = componentTypes.filter(({ id })=> (typeIDs.includes(id))).map((typeGroup)=> {
			const items = playground.components.filter(({ typeID })=> (typeID === typeGroup.id)).map((item)=> ({ ...item,
				selected : (component && item.id === component.id)
			}));

			return ({ ...typeGroup, items,
				selected : (this.props.typeGroup && (typeGroup.id === this.props.typeGroup.id || items.map(({ selected })=> (selected)).includes(true)))
			});
		});

// 		const favicon = playground.team.

		this.setState({ typeGroups }, ()=> {
			grabFavicon(`https://${playground.team.domain}`).then((response)=> {
				const icons = (response.icons) ? response.icons.filter(({ sizes })=> (sizes)).map((icon)=> ({ ...icon,
					size : icon.sizes.split('x').pop() << 0
				})).sort((i, j)=> ((i.size < j.size) ? -1 : (i.size > j.size) ? 1 : 0)) : [];

				const teamLogo = (icons.length > 0) ? icons.pop().src : null;
				this.setState({ teamLogo });
			});
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { playground } = this.props;
		const { typeGroups, teamLogo } = this.state;

		const team = { ...playground.team,
			image : (teamLogo || playground.team.image)
		};

		return (<div className="playground-nav-panel">
			<PlaygroundNavPanelHeader team={team} />
			<div className="playground-nav-panel-component-type-wrapper">
				{(typeGroups.map((typeGroup, i)=> (<NavPanelTypeGroup key={i} typeGroup={typeGroup} onTypeGroupClick={this.handleTypeGroupClick} onTypeItemClick={this.handleTypeItemClick} />)))}
			</div>
		</div>);
	}
}


const PlaygroundNavPanelHeader = (props)=> {
// 	console.log('PlaygroundNavPanelHeader()', props);

	const { team } = props;
	return (<div className="playground-nav-panel-header">
		<img className="playground-nav-panel-header-logo" src={team.image} alt="Team Logo" />
		<div className="playground-nav-panel-header-title">{team.title}</div>
	</div>);
};


const mapStateToProps = (state, ownProps)=> {
	return ({
		componentTypes : state.componentTypes,
		team           : state.teams[0],
		playground     : state.playground,
		typeGroup      : state.typeGroup,
		component      : state.component
	});
};


export default connect(mapStateToProps)(PlaygroundNavPanel);
