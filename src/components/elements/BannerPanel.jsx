
import React from 'react';
import './BannerPanel.css';


function BannerPanel(props) {
// 	console.log('BannerPanel()', props);

	const { image, caption } = props;
	return (<div className="banner-panel-wrapper" onClick={()=> props.onClick()}>
		<img src={image} className="banner-panel-image" alt={caption} />
	</div>);
}

export default BannerPanel;
