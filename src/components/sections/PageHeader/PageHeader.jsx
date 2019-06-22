
import React, { Component } from 'react';
import './PageHeader.css';

import { connect } from 'react-redux';
import { Column } from 'simple-flexbox';

import PageHeaderProfile from './PageHeaderProfile';
import { trackEvent } from '../../../utils/tracking';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';


class PageHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
// 		console.log('PageHeader.componentDidMount()', this.props, this.state);

		const { profile } = this.props;
		if (profile) {

		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('PageHeader.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (!prevProps.profile && this.props.profile) {
			const { profile } = this.props;
		}
	}

	render() {
		const { profile } = this.props;
		const { title } = this.props;

		return (<div className="page-header">
			{(profile) && (<PageHeaderProfile />)}
			<Column horizontal="center">
				<img className="page-header-logo" src={deLogo} alt="Logo" />
				<h1 className="page-header-title">{title}</h1>
			</Column>
		</div>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};

export default connect(mapStateToProps)(PageHeader);