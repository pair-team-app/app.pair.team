
import React, { Component } from 'react';
import './PlaygroundNavPanel.css';

import { grabFavicon } from 'favicongrab';
import { connect } from 'react-redux';
import NavPanelTypeGroup from './NavPanelTypeGroup';

class PlaygroundNavPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups : [],
			teamLogo   : null
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);


		const { componentTypes, playground, component } = this.props;
		const typeIDs = playground.components.map(({ typeID })=> (typeID));

		const typeGroups = componentTypes.filter(({ id })=> (typeIDs.includes(id))).map((typeGroup)=> {
			const items = playground.components.filter(({ typeID })=> (typeID === typeGroup.id)).map((item)=> ({ ...item,
				selected : (component && item.id === component.id)
			}));

			return ({ ...typeGroup, items,
				expanded : (this.props.typeGroup && (typeGroup.id === this.props.typeGroup.id || items.map(({ selected })=> (selected)).includes(true))),
				selected : (this.props.typeGroup && (typeGroup.id === this.props.typeGroup.id || items.map(({ selected })=> (selected)).includes(true)))
			});
		});

		this.setState({ typeGroups }, ()=> {
// 			grabFavicon(`https://${playground.team.domain}`).then((response)=> {
			grabFavicon('https://dev.pairurl.com').then((response)=> {
				const icons = (response.icons) ? response.icons.filter(({ sizes })=> (sizes)).map((icon)=> ({ ...icon,
					size : icon.sizes.split('x').pop() << 0
				})).sort((i, j)=> ((i.size < j.size) ? -1 : (i.size > j.size) ? 1 : 0)) : [];

				const teamLogo = (icons.length > 0) ? icons.pop().src : null;
				this.setState({ teamLogo });
			});
		});




/*
		const { params, playground } = this.props;

		const typeIDs = playground.components.map(({ typeID })=> (typeID));
		const typeGroups = this.props.typeGroups.filter(({ id })=> (typeIDs.includes(id))).map((typeGroup)=> {
			const items = playground.components.filter(({ typeID })=> (typeID === typeGroup.id));

			return ({ ...typeGroup, items,
				expanded : (items.map(({ selected })=> (selected)).includes(true) || typeGroup.key === params.componentsSlug),
				selected : (items.map(({ selected })=> (selected)).includes(true) || typeGroup.key === params.componentsSlug)
			});
		});

		this.setState({ typeGroups }, ()=> {
// 			grabFavicon(`https://${playground.team.domain}`).then((response)=> {
			grabFavicon('https://dev.pairurl.com').then((response)=> {
				const icons = (response.icons) ? response.icons.filter(({ sizes })=> (sizes)).map((icon)=> ({ ...icon,
					size : icon.sizes.split('x').pop() << 0
				})).sort((i, j)=> ((i.size < j.size) ? -1 : (i.size > j.size) ? 1 : 0)) : [];

				const teamLogo = (icons.length > 0) ? icons.pop().src : null;
				this.setState({ teamLogo });
			});
		});
		*/
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { component } = this.props;
		if (this.props.typeGroup && this.props.typeGroup !== prevProps.typeGroup) {
			const typeGroups = this.state.typeGroups.map((typeGroup)=> {
				const items = typeGroup.items.map((item)=> ({ ...item,
					selected : (component && item.id === component.id)
				}));

				return ({ ...typeGroup, items,
					expanded : (typeGroup.id === this.props.typeGroup.id),
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
					expanded : (typeGroup.id === this.props.typeGroup.id),
					selected : (typeGroup.id === this.props.typeGroup.id)
				});
			});

			this.setState({ typeGroups });
		}


// 		const { playground } = this.props;
// 		const { componentsSlug } = this.props.params;
// 		const { typeGroups } = this.state;
//
// 		if (playground !== prevProps.playground) {
// 			grabFavicon('https://dev.pairurl.com').then((response)=> {
// 				const icons = response.icons.filter(({ sizes })=> (sizes)).map((icon)=> ({ ...icon,
// 					size : icon.sizes.split('x').pop() << 0
// 				})).sort((i, j)=> ((i.size < j.size) ? -1 : (i.size > j.size) ? 1 : 0));
//
// 				const teamLogo = (icons.length > 0) ? icons.pop().src : null;
// 				this.setState({ teamLogo });
// 			});
// 		}
//
// 		if (componentsSlug !== prevProps.params.componentsSlug) {
// 			if (typeGroups.map(({ key })=> (key)).includes(componentsSlug)) {
// 				const typeGroups = this.state.typeGroups.map((typeGroup)=> {
// 					typeGroup.expanded = (typeGroup.key === componentsSlug);
// 					typeGroup.selected = (typeGroup.key === componentsSlug);
//
// 					return (typeGroup);
// 				});
//
// 				this.setState({ typeGroups });
// 			}
// 		}
//
// 		const { component } = this.props;
// 		if (component && component !== prevProps.component) {
// 			const typeGroups = this.state.typeGroups.map((typeGroup)=> {
// 				const items = typeGroup.items.map((typeItem)=> ((typeItem.id !== component.id) ? { ...typeItem,
// 					selected : false
// 				} : component));
//
// // 				console.log('items', typeGroup, items);
// 				return ({ ...typeGroup, items,
// 					expanded : items.map(({ selected })=> (selected)).includes(true),
// 					selected : items.map(({ selected })=> (selected)).includes(true)
// 				});
// 			});
//
// 			this.setState({ typeGroups });
// 		}
	};

	handleTypeGroupClick = (typeGroup)=> {
// 		console.log('%s.handleTypeGroupClick()', this.constructor.name, typeGroup);

// 		const { typeGroups } = this.state;
// 		this.setState({
// 			typeGroups : typeGroups.map((grp)=> ({ ...grp,
// 				expanded : (grp.id === typeGroup.id),
// 				selected : (grp.id === typeGroup.id),
// 				items    : grp.items.map((item) => ({
// 					...item,
// 					selected : false
// 				}))
// 			}))
// 		}, ()=> {
			this.props.onTypeGroupClick(typeGroup);
// 		});
	};

	handleTypeItemClick = (typeGroup, typeItem)=> {
// 		console.log('%s.handleTypeItemClick()', this.constructor.name, typeGroup, typeItem);

// 		typeGroup.expanded = true;
// 		typeGroup.selected = true;
// 		typeItem.selected = true;
//
// 		const { typeGroups } = this.state;
// 		this.setState({
// 			typeGroups : typeGroups.map((grp) => ({ ...grp,
// 				expanded : (grp.id === typeGroup.id),
// 				selected : (grp.id === typeGroup.id),
// 				items    : grp.items.map((item) => ({ ...item,
// 					selected : (item.id === typeItem.id)
// 				}))
// 			}))
// 		}, ()=> {
			this.props.onTypeItemClick(typeGroup, typeItem);
// 		});
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
