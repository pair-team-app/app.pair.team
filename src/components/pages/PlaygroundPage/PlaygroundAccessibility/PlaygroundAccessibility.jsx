
import React, { Component } from 'react';
import './PlaygroundAccessibility.css';

import JSSoup from 'jssoup';
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

	let ariaAttribs = [];
	if (component) {
		const tag = new JSSoup(component.html).nextElement;
		ariaAttribs = Object.keys(tag.attrs).filter((key)=> (/^(aria-|role)/i.test(key))).sort().reverse().map((key)=> (`${key}="${(key !== tag.attrs[key]) ? tag.attrs[key] : ''}"`));
	}

	return (<div className="accessibility-tree-item">
		<div className="accessibility-tree-item-header">
			{(component) && (<div className="accessibility-tree-item-thumb-wrapper">
				<img src={component.image} alt={component.title} />
			</div>)}
			<div className="accessibility-tree-item-title">{treeNode.role} {(treeNode.name.length > 0) ? `"${treeNode.name}"` : ''}</div>
			<div className="accessibility-tree-item-comment-wrapper">
			</div>
		</div>
		{(component) && (<div className="accessibility-tree-item-aria-wrapper">
			{(ariaAttribs.length > 0) && (ariaAttribs.map((attrib, i)=> {
				return (<div key={i} className="accessibility-tree-item-aria-attribute">{attrib}</div>)
			}))}
		</div>)}

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
	const { help, impact, nodes } = rule;
	const listItems = nodes[0].any.map(({ message })=> (message.replace(/^(\b\w)/, (c)=> (c.toUpperCase()))));

	return (<div className="accessibility-tree-item-rule">
		<div className="accessibility-tree-item-rule-title">{(impact || '')}</div>
		<div className="accessibility-tree-item-rule-info">
			{help}{(listItems.length === 0) ? '.' : ':'}
			{(listItems.length > 0) && (<ul>{listItems.map((listItem, i)=> (<li key={i}>{listItem}</li>))}</ul>)}
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

