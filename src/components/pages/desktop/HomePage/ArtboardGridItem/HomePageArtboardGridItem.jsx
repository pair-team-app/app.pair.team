
import React from 'react';
import './HomePageArtboardGridItem.css'

import FontAwesome from 'react-fontawesome';
import ImageLoader from 'react-loading-image';

import { Strings } from '../../../../../utils/lang';
import defaultAvatar from '../../../../../assets/images/avatars/avatar-default.png';
import sketchIcon from '../../../../../assets/images/icons/ico-sketch.png';

const TITLE_CHAR_LIMIT = 26;


function HomePageArtboardGridItem(props) {
// 	console.log('HomePageArtboardGridItem()', props);

	const { title, image, avatar } = props;
	return (
		<div className="home-page-artboard-grid-item" onClick={()=> props.onClick()}>
			{(title && image && avatar)
				? (<>
						<img className="home-page-artboard-grid-item-image" src={(!image.includes('@')) ? `${image}@0.25x.png` : image} alt={Strings.truncate(title, TITLE_CHAR_LIMIT)} />
						<div className="home-page-artboard-grid-item-overlay" />
						<img className="home-page-artboard-grid-item-icon" src={sketchIcon} alt="Icon" />
						<div className="home-page-artboard-grid-item-details-wrapper">
							<div className="home-page-artboard-grid-item-avatar-wrapper">
								<ImageLoader
									src={avatar}
									image={(props)=> (<img className="home-page-artboard-grid-item-avatar" src={avatar} alt="Avatar" />)}
									loading={()=> (<img className="home-page-artboard-grid-item-avatar" src={defaultAvatar} alt="Avatar" />)}
									error={()=> (<img className="home-page-artboard-grid-item-avatar" src={defaultAvatar} alt="Avatar" />)}
									onError={(event)=> (null)}
								/>
								{/*<img className="home-page-artboard-grid-item-avatar" src={avatar} alt="Avatar" />*/}
							</div>
							<div className="home-page-artboard-grid-item-title">{Strings.truncate(title, TITLE_CHAR_LIMIT)}</div>
						</div>
					</>)
				: (<>
						<div className="home-page-artboard-grid-item-upload"><FontAwesome name="plus-circle" size="2x" /></div>
						<div className="home-page-artboard-grid-item-overlay" />
						<img className="home-page-artboard-grid-item-icon" src={sketchIcon} alt="Icon" />
					<div className="home-page-artboard-grid-item-details-wrapper">
						<div className="home-page-artboard-grid-item-title">Upload Design</div>
					</div>
					</>)
			}
		</div>
	);
}

export default HomePageArtboardGridItem;
