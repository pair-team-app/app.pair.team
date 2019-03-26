
import React, { Component } from 'react';
import './IntegrationsPage.css';

import { Column, Row } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import { trackEvent } from '../../../../utils/tracking';
import integrationItems from '../../../../assets/json/integration-items';


const IntegrationsPageGrid = (props)=> {
	console.log('IntegrationsPage.IntegrationsPageGrid()', props);

	const { integrations } = props;
	return (<div className="integrations-page-grid">
		<Row horizontal="start" className="integrations-page-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
			{integrations.map((integration, i) => {
				return (<Column key={i}>
					<IntegrationsPageGridItem
						title={integration.title}
						image={integration.filename}
						onClick={()=> props.onClick(integration)} />
				</Column>);
			})}
		</Row>
	</div>);
};


const IntegrationsPageGridItem = (props)=> {
	console.log('IntegrationsPage.IntegrationsPageGridItem()', props);

	const { title, image } = props;
	return (<div className="integrations-page-grid-item" onClick={()=> props.onClick()}>
		<img className="integrations-page-grid-item-image" src={image} alt={title} />
		<div className="integrations-page-grid-item-overlay" />
		<div className="integrations-page-grid-item-title-wrapper">
			<div className="home-page-artboard-grid-item-title">{title}</div>
		</div>
	</div>);
};


class IntegrationsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleIntegrationItemClick = (integration)=> {
		console.log('IntegrationsPage.handleIntegrationItemClick()', integration);
		trackEvent('integration', 'click', integration.title);
	};

	render() {
		console.log('IntegrationsPage.render()', this.props, this.state);

		return (
			<BaseDesktopPage className="integrations-page-wrapper">
				<h4>CD / CI Integrations</h4>
				<IntegrationsPageGrid
					integrations={integrationItems}
					onClick={this.handleIntegrationItemClick}
				/>
			</BaseDesktopPage>
		);
	}
}

export default IntegrationsPage;
