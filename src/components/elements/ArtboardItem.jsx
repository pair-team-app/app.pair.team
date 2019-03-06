
import React from 'react';
import './ArtboardItem.css'

import ImageLoader from 'react-loading-image';

import { Strings } from '../../utils/lang';
import defaultAvatar from '../../assets/images/avatars/avatar-default.png';
import sketchIcon from '../../assets/images/icons/ico-sketch.png';

const TITLE_CHAR_LIMIT = 26;


function ArtboardItem(props) {
// 	console.log('ArtboardItem()', props);

	const { title, image, avatar } = props;
	const className = (image) ? 'artboard-item' : 'artboard-item artboard-item-loading';

	return (
		<div className={className} onClick={()=> (image) ? props.onClick() : null} style={{ opacity : (title === '') ? '33%' : '100%' }}>
			{(image) && (<>
				<img className="artboard-item-image" src={(!image.includes('@')) ? `${image}@0.25x.png` : image} alt={Strings.truncate(title, TITLE_CHAR_LIMIT)} />
				<div className="artboard-item-overlay" />
				<img className="artboard-item-icon" src={sketchIcon} alt="Icon" />
				<div className="artboard-item-details-wrapper">
					<div className="artboard-item-avatar-wrapper">
						<ImageLoader
							src={avatar}
							image={(props)=> (<img className="artboard-item-avatar" src={avatar} alt="Avatar" />)}
							loading={()=> (<img className="artboard-item-avatar" src={defaultAvatar} alt="Avatar" />)}
							error={()=> (<img className="artboard-item-avatar" src={defaultAvatar} alt="Avatar" />)}
							onError={(event)=> (null)}
						/>
						{/*<img className="artboard-item-avatar" src={avatar} alt="Avatar" />*/}
					</div>
					<div className="artboard-item-title">{Strings.truncate(title, TITLE_CHAR_LIMIT)}</div>
				</div>
			</>)}
		</div>
	);
}

export default ArtboardItem;
