import React, { Component } from 'react';
import './AccessibilityPopover.css';

import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';

import BasePopover from '../../../overlays/BasePopover';
import CommentsPanelItem from './AccessibilityReportItem';
import AccessibilityReportItem from './AccessibilityReportItem';


const axReport = {
	passed  : [],
	failed  : [{
		id: "landmark-one-main",
		impact: "moderate",
		tags: ["cat.semantics", "best-practice"],
		description: "Ensures the document has only one main landmark and each iframe in the page has at most one main landmark",
		help: "Document must have one main landmark",
		helpUrl: "https://dequeuniversity.com/rules/axe/3.4/landmark-one-main?application=axe-puppeteer",
		nodes: []
	}, {
		id: "meta-viewport",
		impact: "critical",
		tags: ["cat.sensory-and-visual-cues", "wcag2aa", "wcag144"],
		description: "Ensures <meta name=\"viewport\"> does not disable text scaling and zooming",
		help: "Zooming and scaling must not be disabled",
		helpUrl: "https://dequeuniversity.com/rules/axe/3.4/meta-viewport?application=axe-puppeteer",
		nodes: []
	}, {
		id: "region",
		impact: "moderate",
		tags: ["cat.keyboard", "best-practice"],
		description: "Ensures all page content is contained by landmarks",
		help: "All page content must be contained by landmarks",
		helpUrl: "https://dequeuniversity.com/rules/axe/3.4/region?application=axe-puppeteer",
	}],
	aborted : []
}



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

  handleComment = (event)=> {
		console.log('%s.handleComment()', this.constructor.name);

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
    
    return (<BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
			<div className="accessibility-popover">
				<div className="accessibility-popover-report-wrapper">
					{(axReport.failed.map((report, i)=> {
						return (<AccessibilityReportItem key={i} ind={(i + 1)} report={report} onComment={this.handleComment} />);
					}))}
				</div>
			</div>
		</BasePopover>);
  }
}

const mapStateToProps = (state, ownProps)=> {
  return {
    component: state.component
  };
};

export default connect(mapStateToProps)(AccessibilityPopover);
