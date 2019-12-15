
import React, { Component } from 'react';
import './PlaygroundAccessibility.css';

import { connect } from 'react-redux';
import { componentByNodeID } from '../utils/lookup';


const makeTreeItem = (treeItem, components)=> {
	const nodeID = treeItem.nodeID;
	let component = componentByNodeID(components, nodeID);
// 	console.log('makeTreeItem()', treeItem, nodeID, component);

	return (<AccessibilityTreeItem
		key={treeItem.axNodeID}
		treeNode={treeItem}
		component={component}
		childNodes={treeItem.childNodes.map((childNode)=> (makeTreeItem(childNode, components)))}
	/>);
};


class PlaygroundAccessibility extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups : null,
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { componentTypes } = this.props;
		this.setState({ typeGroups : componentTypes.map(({ id, title })=> ({ id, title }))});
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

		const { playground, component } = this.props;
		const { typeGroups } = this.state;

		const { tree } = component.accessibility;

		console.log('tree', tree);

		return (<div className="playground-accessibility">
			{(typeGroups && tree) && (<div className="playground-accessibility-tree-item-wrapper">
				{makeTreeItem(tree, playground.components)}
			</div>)}
		</div>);
	}
}


const AccessibilityTreeItem = (props)=> {
// 	console.log('AccessibilityTreeItem()', props);

	const { component, childNodes, treeNode } = props;
	const { failed, aborted } = (component) ? component.accessibility.report : {};

	const ariaAttribs = component.html.split('>').shift().split('<').pop();


	return (<div className="accessibility-tree-item">
		<div className="accessibility-tree-item-header">
			{(component) && (<div className="accessibility-tree-item-thumb-wrapper">
				<img src={component.image} alt={component.title} />
			</div>)}
			<div className="accessibility-tree-item-title">{treeNode.role} {(treeNode.name.length > 0) ? `"${treeNode.name}"` : ''}</div>
			<div className="accessibility-tree-item-comment-wrapper">
			</div>
		</div>
		<div className="accessibility-tree-item-aria-wrapper">
		</div>

		{(component) && (<div className="accessibility-tree-item-report-wrapper">
			{(failed.length > 0) && (<div className="accessibility-tree-item-rules accessibility-tree-item-rules-failed">
				{(failed.map((rule, i)=> {
					return (<AccessibilityTreeItemRule
						key={i}
						rule={rule}
					/>);
				}))}
			</div>)}

			{(aborted.length > 0) && (<div className="accessibility-tree-item-rules accessibility-tree-item-rules-aborted">
				{(aborted.map((rule, i)=> {
					return (<AccessibilityTreeItemRule
						key={i}
						rule={rule}
					/>);
				}))}
			</div>)}
		</div>)}

		<div className="accessibility-tree-item-child-wrapper">
			{(childNodes.map((childNode)=> (childNode)))}
		</div>
	</div>);
};


const AccessibilityTreeItemRule = (props)=> {
// 	console.log('AccessibilityTreeItemRule()', props);

	const { rule } = props;
	const { description, help, impact, nodes } = rule;
	return (<div className="accessibility-tree-item-rule">
		<div className="accessibility-tree-item-rule-title">{(impact || '')}</div>
		<div className="accessibility-tree-item-rule-info">
			{help}. <ul>{nodes[0].any.map(({ id, message })=> (<li key={id}>{message}</li>))}</ul>
			</div>
	</div>);

};


const mapStateToProps = (state, ownProps)=> {
	return ({
		componentTypes : state.componentTypes,
		playground     : state.playground,
		typeGroup      : state.typeGroup,
		component      : state.component,
		comment        : state.comment
	});
};


export default connect(mapStateToProps)(PlaygroundAccessibility);

