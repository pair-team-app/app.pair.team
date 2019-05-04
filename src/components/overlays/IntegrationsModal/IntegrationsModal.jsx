
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
import integrations from './../../../assets/json/integrations';


const IntegrationsModalGrid = (props)=> {
// 	console.log('IntegrationsModal.IntegrationsModalGrid()', props);

	const { integrations } = props;
	return (<div className="integrations-modal-grid">
		<Row wrap={true} horizontal="center" className="integrations-modal-grid-item-wrapper">
			{integrations.map((integration, i) => {
				return (<Column key={i}>
					<IntegrationGridItem
						title={integration.title}
						image={integration.filename}
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
			step       : 0,
			sources    : [],
			devs       : [],
			outro      : false,
			submitted  : false,
			profile    : null
		};
	}

	componentDidMount() {
// 		console.log('IntegrationsModal.componentDidMount()', this.props, this.state);

		const { profile } = this.props;

		const sources = integrations.filter((integration)=> (integration.type === 'design')).sort((integration1, integration2)=> ((integration1.enabled && !integration2.enabled) ? -1 : (!integration1.enabled && integration2.enabled) ? 1 : 0)).map((integration)=> (Object.assign({}, integration, {
			selected : profile.sources.includes(integration.id)
		})));

		const devs = integrations.filter((integration)=> (integration.type === 'dev')).sort((integration1, integration2)=> ((integration1.enabled && !integration2.enabled) ? -1 : (!integration1.enabled && integration2.enabled) ? 1 : 0)).map((integration)=> (Object.assign({}, integration, {
			selected : profile.integrations.includes(integration.id)
		})));

		this.setState({ sources, devs });
	}

	handleIntegrationItemClick = (integration)=> {
// 		console.log('IntegrationsModal.handleIntegrationItemClick()', integration);

		integration.selected = !integration.selected;
		if (integration.type === 'design') {
			const sources = this.state.sources.filter((item)=> (item.type === 'design')).map((item)=> ((item.id === integration.id) ? integration : item));
			this.setState({ sources });

		} else {
			const devs = this.state.devs.filter((item)=> (item.type === 'dev')).map((item)=> ((item.id === integration.id) ? integration : item));
			this.setState({ devs });
		}
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

	handleNextStep = ()=> {
// 		console.log('IntegrationsModal.handleNextStep()');

		trackEvent('button', 'next');
		this.setState({ step : 1 });
	};

	handlePrevStep = ()=> {
// 		console.log('IntegrationsModal.handlePrevStep()');

		trackEvent('button', 'prev');
		this.setState({ step : 0 });
	};

	handleSubmit = ()=> {
// 		console.log('IntegrationsModal.handleSubmit()');

		const { profile } = this.props;
		const { sources, devs } = this.state;

		this.setState({ submitted : true }, ()=> {
			axios.post(API_ENDPT_URL, qs.stringify({
				action       : 'UPDATE_INTEGRATIONS',
				user_id      : profile.id,
				sources      : [...sources].filter((item)=> (item.selected)).map((item)=> (item.id)).join(','),
				integrations : [...devs].filter((item)=> (item.selected)).map((item)=> (item.id)).join(',')
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
		const { step, sources, devs, outro } = this.state;
		const title = (step === 0) ? 'What design tools is your team using?' : 'What development frameworks is your team using?';
// 		const selectedItems = gridItems[step].filter((item)=> (item.selected));

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
							integrations={(step === 0) ? sources : devs}
							onClick={(integration)=> this.handleIntegrationItemClick(integration)}
						/>

						{(step === 0)
							? (<div className="integrations-modal-button-wrapper">
									<button className="adjacent-button" onClick={()=> { trackEvent('button', 'cancel'); this.setState({ outro : true }); }}>Cancel</button>
									<button onClick={()=> this.handleNextStep()}>Next</button>
								</div>)
							: (<div className="integrations-modal-button-wrapper">
									<button className="adjacent-button" onClick={()=> this.handlePrevStep()}>Back</button>
									<button onClick={()=> this.handleSubmit()}>Save</button>
								</div>)
						}
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
