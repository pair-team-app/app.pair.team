
import React, { Component } from 'react';
import './PlaygroundAccessibility.css';

import Collapse from '@kunukn/react-collapse';
import JSSoup from 'jssoup';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import BaseContentExpander from '../../../iterables/BaseContentExpander';
import { componentByNodeID } from '../utils/lookup';


const flattenTree = (node)=> {
	const { axNodeID } = node;
	const childNodes = node.childNodes.map((childNode)=> {
		return (flattenTree(childNode));
	});

	return ([{ axNodeID,
		expanded : true
	}, ...childNodes].flat());
};


class PlaygroundAccessibility extends Component {
	constructor(props) {
		super(props);

		this.state = {
			expandedNodes : null
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { component } = this.props;
		if (component && component.accessibility.tree) {
			const expandedNodes = flattenTree(component.accessibility.tree);
			this.setState({ expandedNodes });
		}
	}

	handleTreeTitleClick = (treeNode)=> {
//		console.log('%s.handleTreeTitleClick()', this.constructor.name, treeNode);

		const { expandedNodes } = this.state;
		this.setState({ expandedNodes : expandedNodes.map((node)=> ({ ...node,
			expanded : (node.axNodeID === treeNode.axNodeID) ? !node.expanded : node.expanded
		})) });
	};


	makeTreeItem = (treeItem, components)=> {
		const { expandedNodes } = this.state;
		const { expanded } = expandedNodes.find(({ axNodeID })=> (axNodeID === treeItem.axNodeID));

		const nodeID = treeItem.nodeID;
		const component = componentByNodeID(components, nodeID);
// 	console.log('makeTreeItem()', treeItem, nodeID, component);

		return (<AccessibilityTreeItem
			key={treeItem.axNodeID}
			expanded={expanded}
			treeNode={treeItem}
			component={component}
			childNodes={treeItem.childNodes.map((childNode)=> (this.makeTreeItem(childNode, components)))}
			onTreeTitleClick={this.handleTreeTitleClick}
		/>);
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

		const { playground, component } = this.props;
		const { expandedNodes } = this.state;
		const { tree } = (component) ? component.accessibility : { tree : null };

		return ((playground) && (<div className="playground-accessibility">
			{(expandedNodes && tree)
				? (<div className="playground-accessibility-tree-item-wrapper">
						{this.makeTreeItem(component.accessibility.tree, playground.components)}
					</div>)
				: (<div className="playground-accessibility-tree-item-wrapper">
					</div>)
			}
		</div>));
	}
}


const AccessibilityTreeItem = (props)=> {
 	const { expanded, component, childNodes, treeNode } = props;
	const { failed, aborted } = (component) ? component.accessibility.report : {};

	let ariaAttribs = [];
	if (component) {
		const tag = new JSSoup(component.html).nextElement;
		ariaAttribs = Object.keys(tag.attrs).filter((key)=> (/^(aria-|role)/i.test(key))).sort().reverse().map((key)=> (`${key}="${(key !== tag.attrs[key]) ? tag.attrs[key] : ''}"`));
	}

	const expandable = ((((component) ? failed.length + aborted.length + ariaAttribs.length : 0) + childNodes.length) * 1 !== 0);
	return (<BaseContentExpander
		className={`accessibility-tree-item${(expanded) ? ' accessibility-tree-item-expanded' : ''}`}
		open={expanded}
		title={<div className={`accessibility-tree-item-header${(expandable) ? ' accessibility-tree-item-header-expandable' : ''}`} onClick={()=> (expandable) ? props.onTreeTitleClick(treeNode) : null}>
			{(expandable) && (<div className={`accessibility-tree-item-header-arrow${(expanded) ? ' accessibility-tree-item-header-arrow-expanded' : ''}`}><FontAwesome name="caret-right" className="accessibility-tree-item-arrow" /></div>)}
			{(component) && (<div className="accessibility-tree-item-thumb-wrapper">
				<img src={component.image} alt={component.title} />
			</div>)}
			<div className="accessibility-tree-item-title">{treeNode.role} {(treeNode.name.length > 0) ? `"${treeNode.name}"` : ''}</div>
			<div className="accessibility-tree-item-comment-wrapper">
			</div>
		</div>}
		content={(expandable) && (<>
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
		</>)}
	/>);
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
		playground : state.playground,
		typeGroup  : state.typeGroup,
		component  : state.component,
		comment    : state.comment
	});
};


export default connect(mapStateToProps)(PlaygroundAccessibility);

