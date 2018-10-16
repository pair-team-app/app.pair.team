
import React, { Component } from 'react';
import './DownloadStep.css';
import downloads from '../../json/downloads.json';

import axios from 'axios';
import ReactPixel from 'react-facebook-pixel';
import { Column, Row } from 'simple-flexbox';

import DownloadItem from '../DownloadItem';

class PurchaseStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			system : '',
			urls   : [],
			totals : {
				artboards : 0,
				slices    : 0
			}
		};
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
		const options = {
			autoConfig : true, 	// set pixel's autoConfig
			debug      : false, // enable logs
		};
		ReactPixel.init('318191662273348', advancedMatching, options);
		ReactPixel.trackCustom('download');

		let formData = new FormData();
		formData.append('action', 'ORDER_URLS');
		formData.append('order_id', this.props.orderID);
		axios.post('http://api.designengine.ai/templates.php', formData)
			.then((response) => {
				console.log("ORDER_URLS", response.data);
				this.setState({
					system : response.data.system,
					urls   : response.data.urls,
					totals : response.data.totals
				});
			}).catch((error) => {
		});
	}

	handleClick(url) {
		if (url === 'invision://') {

		} else {
			window.open(url, '_blank');
		}
	}

	render() {
		let self = this;
		const items = downloads.map((item, i, arr) => {
			const url = (item.url === 'invision://') ? item.url : self.state.urls[i];
			let description = item.description.replace('[system]', self.state.system);
			description = description.replace('[artboards]', self.state.totals.artboards);
			description = description.replace('[slices]', self.state.totals.slices);

			return (
				<Column key={i}>
					<DownloadItem
						onClick={()=> this.handleClick(url)}
						image={item.image}
						title={item.title}
						description={description}
						button={item.button}
						url={url} />
				</Column>
			);
		});

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Download render design files</div>
					<div className="input-title">Download your design source and and parts</div>
					<div className="download-item-wrapper">
						<Row horizontal="center" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</div>
				</Column>
			</Row>
		);
	}
}

export default PurchaseStep;
