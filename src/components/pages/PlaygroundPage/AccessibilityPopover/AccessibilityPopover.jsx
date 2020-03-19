import React, { Component } from 'react';
import './AccessibilityPopover.css';

import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';

import BasePopover from '../../../overlays/BasePopover';

class AccessibilityPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
	  	outro : false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
  }

  handleComment = (event)=> {
		// console.log('%s.handleComment()', this.constructor.name);

    const email = event.target.value;
    const emailValid = Strings.isEmail(email);
    this.setState({ email, emailValid });
  };

  render() {
	// console.log('%s.render()', this.constructor.name, this.props, this.state);

	const { component } = this.props;
	const { outro } = this.state;
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
					{(component.accessibility.report.failed.map((report, i)=> (
						<AccessibilityReportItem key={i} ind={(i + 1)} report={report} onComment={this.handleComment} />)
					))}
				</div>
			</div>
		</BasePopover>);
  }
}


const AccessibilityReportItem = (props)=> {
	// console.log('AccessibilityReportItem()', props);

	const { ind, report } = props;
	const { help, description } = report

	return (<div className="accessibility-report-item">
		<div className="accessibility-report-item-header-wrapper">
			<div className="accessibility-report-item-header-icon-wrapper">
				<div className="accessibility-report-item-header-icon avatar-wrapper">{ind}</div>
			</div>
			<div className="accessibility-report-item-header-spacer" />
			<div className="accessibility-report-item-header-link-wrapper">
				<div className="accessibility-report-item-header-link" onClick={props.onDelete}>Comment</div>
			</div>
		</div>

		<div className="accessibility-report-item-title">{help}</div>
		<div className="accessibility-report-item-content">
			{description}
		</div>
 	</div>);
};

const mapStateToProps = (state, ownProps)=> {
  return {
    component: state.component
  };
};

export default connect(mapStateToProps)(AccessibilityPopover);
