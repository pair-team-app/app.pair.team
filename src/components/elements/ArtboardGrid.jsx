
import React, { Component } from 'react';
import './ArtboardGrid.css';

import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';
import { isUserLoggedIn } from '../../utils/funcs';


class ArtboardGrid extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		console.log('ArtboardGrid.render()', this.props, this.state);
		const { fetching, total, title, artboards } = this.props;

		const btnClass = (artboards && (artboards.length === parseInt(total, 10))) ? 'fat-button is-hidden' : (fetching) ? 'fat-button button-disabled' : 'fat-button';
		const btnCaption = (fetching) ? 'Loading…' : 'More';

		return (<div className="artboard-grid">
			{(title) && (<Row><h3>{(!fetching && artboards.length === 0) ? '' : title}</h3></Row>)}
			{(isUserLoggedIn() && artboards.length > 0) && (
				<Row horizontal="space-around" className="artboard-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
					{(artboards) && artboards.map((artboard, i) => {
						return (
							<Column key={i}>
								<ArtboardItem
									title={artboard.title}
									image={artboard.filename}
									avatar={artboard.system.avatar}
									onClick={()=> this.props.onClick(artboard)} />
							</Column>
						);
					})}
				</Row>
			)}
			{(artboards.length > 0) && (<Row horizontal="center"><button className={btnClass} onClick={()=> (!fetching) ? this.props.onLoadNext() : null}>{btnCaption}</button></Row>)}
		</div>);
	}
}

export default ArtboardGrid;
