
import React from 'react';
import './HomePageArtboardGrid.css';

import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../ArtboardGridItem';
import { isUserLoggedIn } from '../../../../../utils/funcs';


function HomePageArtboardGrid(props) {
// 	console.log('HomePageArtboardGrid()', props);

	const { title, artboards } = props;
	return (<div className="home-page-artboard-grid">
		<h4 style={{opacity:(title !== 'N/A') << 0}}>{title}</h4>
		{/*<h4>{title}</h4>*/}
		{(isUserLoggedIn()) && (
			<Row horizontal="start" className="home-page-artboard-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
				{(artboards) && artboards.map((artboard, i) => {
					return (
						<Column key={i}>
							<ArtboardItem
								title={artboard.title}
								image={artboard.filename}
								avatar={artboard.creator.avatar}
								onClick={()=> props.onClick(artboard)} />
						</Column>
					);
				})}
			</Row>
		)}
	</div>);
}

//["start","center","end","spaced","space-between","around","space-around"]

export default HomePageArtboardGrid;
