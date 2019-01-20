
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
		const { title, artboards } = this.props;

		return (<div className="artboard-grid">
			{(title) && (<Row><h3>{title}</h3></Row>)}
			{(isUserLoggedIn() && artboards.length > 0) && (
				<Row horizontal="space-between" className="artboard-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
					{(artboards) && artboards.map((artboard, i) => {
						return (
							<Column key={i}>
								<ArtboardItem
									title={artboard.title}
									image={artboard.filename}
									avatar={artboard.creator.avatar}
									onClick={()=> this.props.onClick(artboard)} />
							</Column>
						);
					})}
				</Row>
			)}
		</div>);
	}
}

export default ArtboardGrid;
