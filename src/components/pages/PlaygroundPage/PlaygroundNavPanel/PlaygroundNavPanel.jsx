
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

		const { typeItems } = this.props;

		const typeIDs = typeItems.map(({ typeID })=> (typeID));
		const typeGroups = this.props.typeGroups.filter(({ id })=> (typeIDs.includes(id))).map((typeGroup)=> {
			const items = this.props.typeItems.filter(({ typeID })=> (typeID === typeGroup.id));

			return ({ ...typeGroup, items,
				expanded : items.map(({ selected })=> (selected)).includes(true),
				selected : items.map(({ selected })=> (selected)).includes(true)
			});
		});
		this.setState({ typeGroups });
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { component } = this.props;
		if (component !== prevProps.component) {
			const typeGroups = this.state.typeGroups.map((typeGroup)=> {
				const items = typeGroup.items.map((typeItem)=> ((typeItem.id !== component.id) ? { ...typeItem,
					selected : false
				} : component));

// 				console.log('items', typeGroup, items);
				return ({ ...typeGroup, items,
					expanded : items.map(({ selected })=> (selected)).includes(true),
					selected : items.map(({ selected })=> (selected)).includes(true)
				});
			});

			this.setState({ typeGroups });
		}
	};

	handleTypeGroupClick = (typeGroup)=> {
// 		console.log('%s.handleTypeGroupClick()', this.constructor.name, typeGroup);

		const { typeGroups } = this.state;
		this.setState({
			typeGroups : typeGroups.map((grp)=> ({ ...grp,
				expanded : (grp.id === typeGroup.id) ? !grp.expanded : grp.expanded
			}))
		});
	};

	handleTypeItemClick = (typeGroup, typeItem)=> {
// 		console.log('%s.handleTypeItemClick()', this.constructor.name, typeGroup, typeItem);

		typeGroup.expanded = true;
		typeGroup.selected = true;
		typeItem.selected = true;

		const { typeGroups } = this.state;
		this.setState({
			typeGroups : typeGroups.map((grp) => ({ ...grp,
				expanded : (grp.id === typeGroup.id),
				selected : (grp.id === typeGroup.id),
				items    : grp.items.map((item) => ({ ...item,
					selected : (item.id === typeItem.id)
				}))
			}))
		}, ()=> {
			this.props.onNavTypeItemClick(typeGroup, typeItem);
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { team } = this.props;
		const { typeGroups } = this.state;

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
		<img className="playground-nav-panel-header-logo" src={team.logo} alt="Logo" />
		<div className="playground-nav-panel-header-title">{team.title}</div>
	</div>);
};


export default (PlaygroundNavPanel);
