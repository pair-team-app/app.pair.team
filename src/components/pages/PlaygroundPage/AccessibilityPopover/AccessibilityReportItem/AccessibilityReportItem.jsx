
import React from 'react';
import './AccessibilityReportItem.css';


function AccessibilityReportItem(props) {
// 	console.log('AccessibilityReportItem()', props);

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
}


export default (AccessibilityReportItem);
