
import React from 'react';
import './HomePageArtboardGrid.css';

import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../ArtboardGridItem';


function HomePageArtboardGrid(props) {
// 	console.log('HomePageArtboardGrid()', props);

	const { title, artboards } = props;
	return (<div className="home-page-artboard-grid">
		<h4 style={{opacity:(title !== 'N/A') << 0}}>{title}</h4>
		<Row wrap={true} horizontal="start" className="home-page-artboard-grid-item-wrapper">
			<Column key={0}>
				<ArtboardItem
					title={null}
					image={null}
					avatar={null}
					onClick={()=> props.onUpload()} />
			</Column>

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
	</div>);
}

//["start","center","end","spaced","space-between","around","space-around"]

export default HomePageArtboardGrid;
