
import React from 'react';
import './ArtboardGrid.css';

import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';


function ArtboardGrid(props) {
	console.log('ArtboardGrid()', props);

	const { fetching, total, title, artboards } = props;

	const btnClass = (artboards && (artboards.length === parseInt(total, 10))) ? 'fat-button is-hidden' : (fetching) ? 'fat-button button-disabled' : 'fat-button';
	const btnCaption = (fetching) ? 'Loading…' : 'More';

	const titleStyle = (!title) ? { color : '#ffffff' } : null;

	return (<div>
		<Row style={titleStyle}><h3>{title}</h3></Row>
		<Row horizontal="space-around" className="artboard-grid" style={{ flexWrap : 'wrap' }}>
			{(artboards) && artboards.map((artboard, i) => {
				return (
					<Column key={i}>
						<ArtboardItem
							title={artboard.title}
							image={artboard.filename}
							avatar={artboard.system.avatar}
							onClick={()=> props.onClick(artboard)} />
					</Column>
				);
			})}
		</Row>
		{(artboards.length > 0) && (<Row horizontal="center"><button className={btnClass} onClick={()=> (!fetching) ? props.onLoadNext() : null}>{btnCaption}</button></Row>)}
	</div>);
}

export default ArtboardGrid;
