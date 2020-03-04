import React, { Component } from 'react';
import './AccessibilityPopover.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import BaseContentExpander from '../../../iterables/BaseContentExpander';
import BasePopover from '../../../overlays/BasePopover';

class AccessibilityPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
	  outro     : false,
	  treeNodes : null
	//   treeNodes : [{
	// 	title      : 'Title 1',
	// 	expanded   : false,
	// 	childNodes : []
	//   }]
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
  }

  handleEmailChange = (event)=> {
    // 		console.log('%s.handleEmailChange()', this.constructor.name);

    const email = event.target.value;
    const emailValid = Strings.isEmail(email);
    this.setState({ email, emailValid });
  };

  render() {
    //    		console.log('%s.render()', this.constructor.name, this.props, this.state);

	const { component } = this.props;
	const { outro, treeNodes } = this.state;
	const payload = {
		fixed  : false,
		offset : {
			right  : 30,
			bottom : 30
		}
	};
    
    return (
      <BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
        <div className="accessibility-popover">
          {(component) && (<div className="accessibility-popover-tree-wrapper">
            {((treeNodes || []).map((treeNode, i)=> {
				return (<AccessibilityTreeItem key={i} component={component} treeNode={treeNode} onClick={this.handleTreeNodeClick} />);
			}))}
          </div>)}
        </div>
      </BasePopover>
    );
  }
}


const AccessibilityTreeItem = (props)=> {
	console.log('AccessibilityTreeItem()', props);

	const { component, treeNode } = props;
	const { expanded, childNodes } = treeNode;

	const { failed, aborted } = (component && component.accessibility) ? component.accessibility : { failed : [], aborted : [] };
	let ariaAttribs = [];
	// const tag = new JSSoup(component.html).nextElement;
	// ariaAttribs = Object.keys(tag.attrs).filter((key)=> (/^(aria-|role)/i.test(key))).sort().reverse().map((key)=> (`${key}="${(key !== tag.attrs[key]) ? tag.attrs[key] : ''}"`));
	const expandable = ((((component) ? failed.length + aborted.length + ariaAttribs.length : 0) + childNodes.length) * 1 !== 0);

	return (<BaseContentExpander
		className={`accessibility-tree-item${(expanded) ? ' accessibility-tree-item-expanded' : ''}`}
		open={expanded}
		title={<div className={`accessibility-tree-item-header${(expandable) ? ' accessibility-tree-item-header-expandable' : ''}`}>
			{(expandable) && (<div className={`accessibility-tree-item-header-arrow${(expanded) ? ' accessibility-tree-item-header-arrow-expanded' : ''}`}><FontAwesome name="caret-right" className="accessibility-tree-item-arrow" /></div>)}
			<div className="accessibility-tree-item-title">{treeNode.role} {(treeNode.name.length > 0) ? `"${treeNode.name}"` : ''}</div>
		</div>}

		content={(expandable) && (<>
			{(component) && (<div className="accessibility-tree-item-aria-wrapper">
				{(ariaAttribs.length > 0) && (ariaAttribs.map((attrib, i)=> {
					return (<div key={i} className="accessibility-tree-item-aria-attribute">{attrib}</div>)
				}))}
			</div>)}

			{(component) && (<div className="accessibility-tree-item-report-wrapper">
				{(failed.length > 0) && (<AccessibilityTreeBranchReport
					type="failed"
					rules={failed}
				/>)}

				{(aborted.length > 0) && (<AccessibilityTreeBranchReport
					type="aborted"
					rules={aborted}
				/>)}
			</div>)}

			<div className="accessibility-tree-item-child-wrapper">
				{(childNodes.map((childNode)=> (childNode)))}
			</div>
		</>)}
	/>);
}

const AccessibilityTreeBranchReport = (props)=> {
	console.log('AccessibilityTreeBranchReport()', props);

	const { type, rules } = props;
	return (<div className={`accessibility-tree-item-rules accessibility-tree-item-rules-${type}`}>
		{(rules.map((rule, i)=> {
			return (<AccessibilityTreeBranchRule
				key={i}
				rule={rule}
			/>);
		}))}
	</div>);
};

const AccessibilityTreeBranchRule = (props)=> {
	console.log('AccessibilityTreeBranchRule()', props);

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
  return {
    component: state.component
  };
};

export default connect(mapStateToProps)(AccessibilityPopover);
