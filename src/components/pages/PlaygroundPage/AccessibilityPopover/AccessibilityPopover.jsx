import React, { Component } from 'react';
import './AccessibilityPopover.css';

import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import BasePopover from '../../../overlays/BasePopover';
import { trackOutbound } from '../../../../utils/tracking';

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
			fixed  : true,
			offset : {
				right  : 30,
				bottom : 30
			}
		};
    
    return (<BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
			<div className="accessibility-popover" data-report={component.accessibility.report.failed.length > 0}>
				{(component.accessibility.report.failed.length > 0) && (<div className="report-wrapper">
					{(component.accessibility.report.failed.map((report, i)=> (
						<AccessibilityReportItem key={i} ind={(i + 1)} report={report} onComment={this.handleComment} />)
					))}
				</div>)}

				{(component.accessibility.report.failed.length === 0) && (<div className="empty-report-wrapper">
					No accessibilty concerns detected.
				</div>)}
			</div>
		</BasePopover>);
  }
}


const AccessibilityReportItem = (props)=> {
	// console.log('AccessibilityReportItem()', props);

	const { ind, report } = props;
	const { help, description, impact, helpUrl } = report;

	const handleURL = (event, url)=> {
		// console.log('%s.handleURL()', this.constructor.name, { event, url });
		event.preventDefault();
		trackOutbound(url);
	};

	const FormattedContent = (props)=> {
		// console.log('FormattedContent()', { props });

		const { content } = props;
		return (<span dangerouslySetInnerHTML={{ __html : content.replace(/(\<.+?\>)/g, (markup)=> (`<span class="txt-code">${markup.replace('<', '&lt;').replace('>', '&gt;')}</span>`))}}></span>)
	};

	return (<div className="accessibility-report-item" data-impact={impact}>
		<div className="header-wrapper">
			<div className="header-icon-wrapper">
				<div className="header-icon avatar-wrapper">{ind}</div>
			</div>
			<div className="header-spacer" />
			<div className="header-status-wrapper">
				<div className="header-status">Auto Comment</div>
			</div>
		</div>

		<div className="title"><NavLink to={helpUrl} target="_blank" onClick={(event)=> handleURL(event, helpUrl)}>{help}</NavLink></div>
		{/* <div className="content">{description.replace(/(\<.+?\>)/g, (match)=> (`<span className="txt-code">${match}</span>`))}</div> */}
		<div className="content"><FormattedContent content={description} /></div>
 	</div>);
};

const mapStateToProps = (state, ownProps)=> {
  return {
    component: state.component
  };
};

export default connect(mapStateToProps)(AccessibilityPopover);
