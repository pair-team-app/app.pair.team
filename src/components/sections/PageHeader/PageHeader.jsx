
import React, { Component } from 'react';
import './PageHeader.css';

import { connect } from 'react-redux';

import BaseSection from '../BaseSection';
import PageHeaderProfile from './PageHeaderProfile';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';


class PageHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { profile } = this.props;
		const { title, bgColor, children } = this.props;

		const style = (bgColor) ? {
			backgroundColor : bgColor
		} : null;

		return (<div className="page-header" style={style}>
			{(profile) && (<PageHeaderProfile />)}
			<BaseSection>
				<img className="page-header-logo" src={deLogo} alt="Logo" />
				<h1 className="page-header-title">{title}</h1>
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