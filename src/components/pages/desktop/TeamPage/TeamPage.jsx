
import React, { Component } from 'react';
import './TeamPage.css';


import FontAwesome from 'react-fontawesome';
import ImageLoader from 'react-loading-image';
import { connect } from 'react-redux';
import { Row, Column } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import { Strings, URIs } from '../../../../utils/lang';
import { trackEvent } from '../../../../utils/tracking';
import defaultAvatar from '../../../../assets/images/avatars/avatar-default.png';
import sketchIcon from '../../../../assets/images/icons/ico-sketch.png';

const TITLE_CHAR_LIMIT = 26;


const TeamPageArtboardGrid = (props)=> {
// 	console.log('TeamPageArtboardGrid()', props);

	const { title, artboards } = props;
	return (<div className="team-page-artboard-grid">
		<h4 style={{opacity:(title !== 'N/A') << 0}}>{title}</h4>
		<Row wrap={true} horizontal="start" className="team-page-artboard-grid-item-wrapper">
			<Column key={0}>
				<TeamPageArtboardGridItem
					title={null}
					image={null}
					avatar={null}
					onClick={()=> props.onUpload()} />
			</Column>

			{(artboards) && artboards.map((artboard, i) => {
				return (
					<Column key={i}>
						<TeamPageArtboardGridItem
							title={artboard.title}
							image={artboard.filename}
							avatar={artboard.creator.avatar}
							onClick={()=> props.onClick(artboard)} />
					</Column>
				);
			})}
		</Row>
	</div>);
};


const TeamPageArtboardGridItem = (props)=> {
// 	console.log('TeamPageArtboardGridItem()', props);

	const { title, image, avatar } = props;
	return (
		<div className="team-page-artboard-grid-item" onClick={()=> props.onClick()}>
			{(title && image && avatar)
				? (<>
					<img className="team-page-artboard-grid-item-image" src={(!image.includes('@')) ? `${image}@0.25x.png` : image} alt={Strings.truncate(title, TITLE_CHAR_LIMIT)} />
					<div className="team-page-artboard-grid-item-overlay" />
					<img className="team-page-artboard-grid-item-icon" src={sketchIcon} alt="Icon" />
					<div className="team-page-artboard-grid-item-details-wrapper">
						<div className="team-page-artboard-grid-item-avatar-wrapper">
							<ImageLoader
								src={avatar}
								image={(props)=> (<img className="team-page-artboard-grid-item-avatar" src={avatar} alt="Avatar" />)}
								loading={()=> (<img className="team-page-artboard-grid-item-avatar" src={defaultAvatar} alt="Avatar" />)}
								error={()=> (<img className="team-page-artboard-grid-item-avatar" src={defaultAvatar} alt="Avatar" />)}
								onError={(event)=> (null)}
							/>
							{/*<img className="team-page-artboard-grid-item-avatar" src={avatar} alt="Avatar" />*/}
						</div>
						<div className="team-page-artboard-grid-item-title">{Strings.truncate(title, TITLE_CHAR_LIMIT)}</div>
					</div>
				</>)
				: (<>
					<div className="team-page-artboard-grid-item-upload"><FontAwesome name="plus-circle" size="2x" /></div>
					<div className="team-page-artboard-grid-item-overlay" />
					<img className="team-page-artboard-grid-item-icon" src={sketchIcon} alt="Icon" />
					<div className="team-page-artboard-grid-item-details-wrapper">
						<div className="team-page-artboard-grid-item-title">Upload Design</div>
					</div>
				</>)
			}
		</div>
	);
};


class TeamPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitted  : false,
			email      : '',
			emailValid : true
		};
	}

	handleArtboardClicked = (artboard)=> {
// 		console.log('TeamPage.handleArtboardClicked()', artboard);

		trackEvent('artboard', 'click');
		this.props.onArtboardClicked(artboard)
	};

	handleUploadClick = ()=> {
// 		console.log('TeamPage.handleUploadClick()');

		trackEvent('button', 'upload');
		this.props.onPage('/new');

// 		setTimeout(()=> {
// 			this.setState({ fileDialog : false });
// 		}, 3333);
//
// 		this.setState({ fileDialog : true });
	};



	render() {
// 		console.log('TeamPage.render()', this.props, this.state);

		const { profile, artboards } = this.props;
		const gridTitle = (profile) ? `${(URIs.subdomain()) ? `Team ${Strings.capitalize(URIs.subdomain())}` : `History`} (${artboards.length})` : 'N/A';

		return (
			<BaseDesktopPage className="team-page-wrapper">
				<TeamPageArtboardGrid
					title={gridTitle}
					artboards={artboards}
					onClick={this.handleArtboardClicked}
					onUpload={this.handleUploadClick}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup}
				/>
			</BaseDesktopPage>
		);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		artboards : state.homeArtboards,
		profile   : state.userProfile
	});
};


export default connect(mapStateToProps)(TeamPage);