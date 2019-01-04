
import React from 'react';
import './ExploreArtboardGrid.css';

import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from "../iterables/ArtboardItem";


const mapStateToProps = (state)=> {
	return ({ artboards : state.exploreArtboards });
};

const ExploreArtboardGrid = ({ artboards })=> (
	<Row horizontal="space-between" className="explore-artboard-grid" style={{flexWrap:'wrap'}}>
		{artboards.map((artboard, i) => {
			return (
				<Column key={i}>
					<ArtboardItem
						title={artboard.title}
						image={artboard.filename}
						onClick={()=> this.props.onClick(artboard)} />
				</Column>
			);
		})}
	</Row>
);

export default connect(mapStateToProps)(ExploreArtboardGrid);
