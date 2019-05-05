
import React, { Component } from 'react';
import './IntegrationsPage.css';

import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import IntegrationGridItem from '../../../iterables/IntegrationGridItem';
import { POPUP_TYPE_OK } from '../../../overlays/PopupNotification';
import { API_ENDPT_URL } from '../../../../consts/uris';
import { updateUserProfile } from '../../../../redux/actions';
import { Strings } from '../../../../utils/lang';
import { trackEvent } from '../../../../utils/tracking';
import deLogo from '../../../../assets/images/logos/logo-designengine.svg';


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


const IntegrationsPageGrid = (props)=> {
// 	console.log('IntegrationsPage.IntegrationsPageGrid()', props);

	const { integrations } = props;
	return (<div className="integrations-page-grid">
		<Row wrap={true} horizontal="space-around" className="integrations-page-grid-item-wrapper">
			{integrations.map((integration, i) => {
				return (<Column key={i}>
					<IntegrationGridItem
						title={integration.title}
						image={integration.img_url}
						enabled={integration.enabled}
						selected={integration.selected}
						inheritedClass="integrations-page-grid-item"
						onClick={()=> props.onClick(integration)} />
				</Column>);
			})}
		</Row>
	</div>);
};


class IntegrationsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitting   : false,
			integrations : []
		};
	}

	componentDidMount() {
// 		console.log('IntegrationsPage.componentDidMount()', this.props, this.state);

		const { profile } = this.props;
		axios.post(API_ENDPT_URL, qs.stringify({
			action : 'INTEGRATIONS'
		})).then((response) => {
			console.log('INTEGRATIONS', response.data);

			const integrations = response.data.integrations.map((integration)=> (Object.assign({}, integration, {
				id       : integration.id << 0,
				enabled  : ((integration.enabled << 0) === 1),
				selected : (profile && profile.integrations.includes(integration.id << 0))
			})));

			this.setState({ integrations });
		}).catch((error)=> {
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('IntegrationsPage.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);

		if (!prevProps.profile && this.props.profile || prevState.integrations.length !== this.state.integrations.length) {
			const { profile } = this.props;
			const integrations = this.state.integrations.map((integration)=> (Object.assign({}, integration, {
				selected : (profile && profile.integrations.includes(integration.id))
			})));

			this.setState({ integrations });
		}
	}

	handleIntegrationItemClick = (integration)=> {
// 		console.log('IntegrationsPage.handleIntegrationItemClick()', integration);

		trackEvent('integration', 'click', Strings.slugifyURI(integration.title));

		const { profile } = this.props;
		if (profile) {
			integration.selected = !integration.selected;

			const integrations = this.state.integrations.map((item)=> ((item.id === integration.id) ? integration : item));
			this.setState({ integrations,
				submitting : true
			}, ()=> {
				axios.post(API_ENDPT_URL, qs.stringify({
					action       : 'UPDATE_INTEGRATIONS',
					user_id      : profile.id,
					integrations : integrations.filter((integration)=> (integration.selected)).map((integration)=> (integration.id)).join(',')
				})).then((response) => {
					console.log('UPDATE_INTEGRATIONS', response.data);

					this.setState({ submitting : false });
					this.props.updateUserProfile(response.data.user);
					this.props.onPopup({
						type     : POPUP_TYPE_OK,
						content  : 'Integration profile updated.',
						duration : 1750
					});
				}).catch((error)=> {
				});
			});

		} else {
			window.open(integration.url);
		}
	};

	render() {
// 		console.log('IntegrationsPage.render()', this.props, this.state);

		const { integrations } = this.state;
		return (
			<BaseDesktopPage className="integrations-page-wrapper">
				<div className="integrations-page-header">
					<img className="integrations-page-header-logo" src={deLogo} alt="Logo" />
					<h2>Design Engine Integrations</h2>
				</div>
				<IntegrationsPageGrid
					integrations={integrations}
					onClick={this.handleIntegrationItemClick}
				/>
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationsPage);
