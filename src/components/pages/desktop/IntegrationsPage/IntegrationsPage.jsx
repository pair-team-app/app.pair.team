
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
import integrationItems from '../../../../assets/json/integrations';


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
		<Row horizontal="space-around" className="integrations-page-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
			{integrations.map((integration, i) => {
				return (<Column key={i}>
					<IntegrationGridItem
						title={integration.title}
						image={integration.filename}
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
		const integrations = integrationItems.filter((integration)=> (integration.type === 'dev')).map((integration)=> (Object.assign({}, integration, {
			selected : (profile && profile.integrations.includes(integration.id))
		})));

		this.setState({ integrations });
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('IntegrationsPage.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);

		if (!prevProps.profile && this.props.profile) {
			const { profile } = this.props;
			const integrations = integrationItems.filter((integration)=> (integration.type === 'dev')).map((integration)=> (Object.assign({}, integration, {
				selected : (profile && profile.integrations.includes(integration.id))
			})));

			this.setState({ integrations });
		}
	}

	handleIntegrationItemClick = (integration)=> {
// 		console.log('IntegrationsPage.handleIntegrationItemClick()', integration);

		trackEvent('integration', 'click', Strings.slugifyURI(integration.title));

		if (this.props.profile) {
			const { profile } = this.props;
			integration.selected = !integration.selected;

			const sources = this.state.sources;
			const integrations = this.state.integrations.map((item)=> ((item.id === integration.id) ? integration : item));
			this.setState({ sources, integrations,
				submitting : true
			}, ()=> {
				axios.post(API_ENDPT_URL, qs.stringify({
					action       : 'UPDATE_INTEGRATIONS',
					user_id      : profile.id,
					sources      : profile.sources.join(','),
					integrations : this.state.integrations.filter((integration)=> (integration.selected)).map((integration)=> (integration.id)).join(',')
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
		const selectedItems = integrations.filter((integration)=> (integration.selected));

		return (
			<BaseDesktopPage className="integrations-page-wrapper">
				<h4>{`Framework ${Strings.pluralize('Integration', integrations.length)} (${selectedItems.length} / ${integrations.length})`}</h4>
				<IntegrationsPageGrid
					integrations={integrations}
					onClick={this.handleIntegrationItemClick}
				/>
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationsPage);
