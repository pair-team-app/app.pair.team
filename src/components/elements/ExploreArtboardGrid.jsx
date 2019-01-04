
import React from 'react';
import './ExploreArtboardGrid.css';

import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';


const mapStateToProps = (state)=> {
	return ({ artboards : state.exploreArtboards });
};

function ExploreArtboardGrid(props) {
	return (<Row horizontal="space-between" className="explore-artboard-grid" style={{ flexWrap : 'wrap' }}>
		{props.artboards.map((artboard, i) => {
			return (
				<Column key={i}>
					<ArtboardItem
						title={artboard.title}
						image={artboard.filename}
						avatar={artboard.system.avatar}
						onClick={() => props.onClick(artboard)} />
				</Column>
			);
		})}
	</Row>);
}

export default connect(mapStateToProps)(ExploreArtboardGrid);
