
import React, { Component } from 'react';
import './IntegrationsModal.css';

import axios from 'axios';
import qs from 'qs';
import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

import BaseOverlay from '../BaseOverlay';
import { API_ENDPT_URL } from '../../../../consts/uris';
import { URLs } from '../../../../utils/lang';
import { trackEvent } from '../../../../utils/tracking';
import integrations from '../../../../assets/json/integrations';


const IntegrationsModalGrid = (props)=> {
// 	console.log('IntegrationsModal.IntegrationsModalGrid()', props);

	const { integrations } = props;
	return (<div className="integrations-modal-grid">
		<Row horizontal="center" className="integrations-modal-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
			{integrations.map((integration, i) => {
				return (<Column key={i}>
					<IntegrationsModalGridItem
						title={integration.title}
						image={integration.filename}
						selected={integration.selected}
						onClick={()=> props.onClick(integration)} />
				</Column>);
			})}
		</Row>
	</div>);
};


const IntegrationsModalGridItem = (props)=> {
// 	console.log('IntegrationsModal.IntegrationsModalGridItem()', props);

	const { title, image, selected } = props;
	return (<div className={`integrations-modal-grid-item${(selected) ? ' integrations-modal-grid-item-selected' : ''}`} onClick={()=> props.onClick()}>
		<img className="integrations-modal-grid-item-image" src={image} alt={title} />
		<div className="integrations-modal-grid-item-overlay" />
		<div className="integrations-modal-grid-item-title-wrapper">
			<div className="integrations-modal-grid-item-title">{title}</div>
		</div>
		<div className={`integrations-modal-grid-item-selected-icon${(selected) ? ' integrations-modal-grid-item-selected-icon-visible' : ''}`}><FontAwesome name="check-circle" size="2x" /></div>
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
			submitting : false
		};
	}

	componentDidMount() {
// 		console.log('IntegrationsModal.componentDidMount()', this.props, this.state);

		const { profile } = this.props;

		const sources = integrations.filter((integration)=> (integration.type === 'design')).map((integration)=> (Object.assign({}, integration, {
			selected : profile.sources.includes(integration.id)
		})));

		const devs = integrations.filter((integration)=> (integration.type === 'dev')).map((integration)=> (Object.assign({}, integration, {
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

	handleComplete = (submitted)=> {
// 		console.log('IntegrationsModal.handleComplete()', submitted);

		this.setState({ outro : false }, ()=> {
			if (submitted) {
				this.props.onSubmitted();

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

		this.setState({ submitting : true }, ()=> {
			axios.post(API_ENDPT_URL, qs.stringify({
				action       : 'UPDATE_INTEGRATIONS',
				user_id      : profile.id,
				sources      : [...sources].filter((item)=> (item.selected)).map((item)=> (item.id)).join(','),
				integrations : [...devs].filter((item)=> (item.selected)).map((item)=> (item.id)).join(',')
			})).then((response) => {
				console.log('UPDATE_INTEGRATIONS', response.data);

				trackEvent('integrations', 'success');
				this.setState({ submitting : false });
				this.handleComplete(true);
			}).catch((error)=> {
			});
		});
	};

	render() {
// 		console.log('IntegrationsModal.render()', this.props, this.state);

		const { step, sources, devs, outro } = this.state;
		const title = (step === 0) ? 'What design tools is your team using?' : 'What development frameworks is your team using?';
// 		const selectedItems = gridItems[step].filter((item)=> (item.selected));

		return (
			<BaseOverlay
				tracking={`integrations/${URLs.firstComponent()}`}
				delay={0}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="integrations-modal-wrapper">
					<div className="integrations-modal-header">
						<h1 className="full-width">{title}</h1>
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

export default IntegrationsModal;
