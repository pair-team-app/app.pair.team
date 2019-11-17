
import React, { Component } from 'react';
import './PlaygroundAccessibility.css';

import { typeGroupByComponent } from '../utils/lookup';
import accessibiltyTree from '../../../../assets/json/placeholder-accessibility-tree';


class PlaygroundAccessibility extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups : null,
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { typeGroups } = this.props;
		this.setState({ typeGroups : typeGroups.map(({ id, title })=> ({ id, title }))});
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

		const { playground, component, comment } = this.props;
		const { typeGroups } = this.state;

		const accessibility = {
			passed  : [],
			failed  : [],
			aborted : []
		};
		const { passed, failed, aborted } = accessibility;
		return (<div className="playground-accessibility">
			<div className="playground-accessibility-tree-wrapper">
				<div className="playground-accessibility-tree-global-wrapper">
					<div className="accessibility-tree-item-rules accessibility-tree-rules-passed">
						{(passed.map((rule, i)=> {
							return (<AccessibilityTreeItemRule
								key={i}
								rule={rule}
							/>);
						}))}
					</div>

					<div className="accessibility-tree-item-rules accessibility-tree-rules-failed">
						{(failed.map((rule, i)=> {
							return (<AccessibilityTreeItemRule
								key={i}
								rule={rule}
							/>);
						}))}
					</div>

					<div className="accessibility-tree-item-rules accessibility-tree-rules-aborted">
						{(aborted.map((rule, i)=> {
							return (<AccessibilityTreeItemRule
								key={i}
								rule={rule}
							/>);
						}))}
					</div>
				</div>

				{(typeGroups) && (<div className="playground-accessibility-tree-item-wrapper">
					{(playground.components.map((component, i)=> {
						const typeGroup = typeGroupByComponent(typeGroups, component);
						return (<AccessibilityTreeItem
							key={i}
							typeGroup={typeGroup.title}
							component={component}
						/>);
					}))}
				</div>)}
			</div>
		</div>);
	}
}


const AccessibilityTreeItem = (props)=> {
// 	console.log('AccessibilityTreeItem()', props);

	const { component, typeGroup } = props;
	const { passed, failed, aborted } = component.accessibility;
	return (<div className="accessibility-tree-item">
		<div className="accessibility-tree-item-title">{component.title} ({typeGroup})</div>
		<div className="accessibility-tree-item-rules-wrapper">
			<div className="accessibility-tree-item-rules accessibility-tree-item-rules-passed">
				{(passed.map((rule, i)=> {
					return (<AccessibilityTreeItemRule
						key={i}
						rule={rule}
					/>);
				}))}
			</div>

			<div className="accessibility-tree-item-rules accessibility-tree-item-rules-failed">
				{(failed.map((rule, i)=> {
					return (<AccessibilityTreeItemRule
						key={i}
						rule={rule}
					/>);
				}))}
			</div>

			<div className="accessibility-tree-item-rules accessibility-tree-item-rules-aborted">
				{(aborted.map((rule, i)=> {
					return (<AccessibilityTreeItemRule
						key={i}
						rule={rule}
					/>);
				}))}
			</div>

		</div>
		<div className="accessibility-tree-item-component-wrapper">
			<div className="accessibility-tree-item-component">
				<img src={component.image} width={component.meta.bounds.width} height={component.meta.bounds.height} alt={component.title} />
			</div>
		</div>
	</div>);
};


const AccessibilityTreeItemRule = (props)=> {
	console.log('AccessibilityTreeItemRule()', props);

	const { rule } = props;
	const { title, impact, solution } = rule;
	return (<div className="accessibility-tree-item-rule">
		<div className="accessibility-tree-item-rule-title">{title}</div>
		<div className="accessibility-tree-item-rule-title">{impact}</div>
		<div className="accessibility-tree-item-rule-title">{solution}</div>
	</div>);

};





export default (PlaygroundAccessibility);
