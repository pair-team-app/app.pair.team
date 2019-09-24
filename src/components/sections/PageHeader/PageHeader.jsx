
import React, { Component } from 'react';
import './PageHeader.css';

import { connect } from 'react-redux';

import BaseSection from '../BaseSection';
import { Browsers } from '../../../utils/lang';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';


class PageHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
// 		const { profile } = this.props;
		const { title, bgColor, children } = this.props;

		const style = (bgColor) ? {
			backgroundColor : bgColor
		} : null;

		const headerStyle = (Browsers.isMobile.iOS()) ? {
			fontFamily    : '"San Francisco Text Medium", sans-serif',
			letterSpacing : '-0.25px'
		} : null;

		return (<div className="page-header" style={style}>
			<BaseSection>
				<div className="page-header-title-wrapper">
					<img className="page-header-logo" src={deLogo} onClick={()=> window.location = '/'} alt="Logo" />
					<h1 className="page-header-title" style={headerStyle}>{title}</h1>
				</div>
				{(children) && (<div className="page-header-children-wrapper">
					{children}
				</div>)}
			</BaseSection>
		</div>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};

export default connect(mapStateToProps)(PageHeader);