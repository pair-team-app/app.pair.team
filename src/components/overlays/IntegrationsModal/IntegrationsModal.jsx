
import React, { Component } from 'react';
import './IntegrationsModal.css';

import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import BaseOverlay from '../BaseOverlay';
import IntegrationGridItem from '../../iterables/IntegrationGridItem';
import { API_ENDPT_URL } from './../../../consts/uris';
import { URIs } from './../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';


const IntegrationsModalGrid = (props)=> {
// 	console.log('IntegrationsModal.IntegrationsModalGrid()', props);

	const { integrations } = props;
	return (<div className="integrations-modal-grid">
		<Row wrap={true} horizontal="center" className="integrations-modal-grid-item-wrapper">
			{integrations.map((integration, i) => {
				return (<Column key={i}>
					<IntegrationGridItem
						title={integration.title}
						image={integration.img_url}
						enabled={integration.enabled}
						selected={integration.selected}
						inheritedClass="integrations-modal-grid-item"
						onClick={()=> props.onClick(integration)} />
				</Column>);
			})}
		</Row>
	</div>);
};


class IntegrationsModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step         : 0,
			integrations : [],
			outro        : false,
			submitted    : false,
			profile      : null
		};
	}

	componentDidMount() {
// 		console.log('IntegrationsModal.componentDidMount()', this.props, this.state);

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

	handleIntegrationItemClick = (integration)=> {
// 		console.log('IntegrationsModal.handleIntegrationItemClick()', integration);

		integration.selected = !integration.selected;
		const integrations = this.state.integrations.map((item)=> (item.id === integration.id) ? integration : item);
		this.setState({ integrations });
	};

	handleComplete = ()=> {
// 		console.log('IntegrationsModal.handleComplete()');

		const { submitted, profile } = this.state;
		this.setState({ outro : false }, ()=> {
			if (submitted) {
				this.props.onSubmitted(profile);

			} else {
				this.props.onComplete();
			}
		});
	};

	handleSubmit = ()=> {
// 		console.log('IntegrationsModal.handleSubmit()');

		const { profile } = this.props;
		const { integrations } = this.state;

		this.setState({ submitted : true }, ()=> {
			axios.post(API_ENDPT_URL, qs.stringify({
				action       : 'UPDATE_INTEGRATIONS',
				user_id      : profile.id,
				integrations : integrations.filter((integration)=> (integration.selected)).map((integration)=> (integration.id)).join(',')
			})).then((response) => {
				console.log('UPDATE_INTEGRATIONS', response.data);

				trackEvent('integrations', 'success');
				this.setState({
					profile : response.data.user,
					outro   : true
				});
			}).catch((error)=> {
			});
		});
	};

	render() {
// 		console.log('IntegrationsModal.render()', this.props, this.state);

		const { team } = this.props;
		const { integrations, outro } = this.state;
		const title = 'What integrations are your team using?';

		return (
			<BaseOverlay
				tracking={`integrations/${URIs.firstComponent()}`}
				delay={0}
				outro={outro}
				unblurred={true}
				closeable={(!team)}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="integrations-modal-wrapper">
					<div className="integrations-modal-header">
						<h4 className="full-width">{title}</h4>
					</div>
					<div className="integrations-modal-content-wrapper">
						<IntegrationsModalGrid
							integrations={integrations}
							onClick={(integration)=> this.handleIntegrationItemClick(integration)}
						/>

						<div className="integrations-modal-button-wrapper">
							<button className="adjacent-button" onClick={()=> { trackEvent('button', 'cancel'); this.setState({ outro : true }); }}>Cancel</button>
							<button onClick={()=> this.handleSubmit()}>Save</button>
						</div>
					</div>
				</div>
			</BaseOverlay>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		team : state.team
	});
};


export default connect(mapStateToProps)(IntegrationsModal);