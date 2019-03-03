
import React from 'react';
import './AdBannerPanel.css';


function AdBannerPanel(props) {
// 	console.log('AdBannerPanel()', props);

	const { image, caption } = props;
	return (<div className="ad-banner-panel-wrapper ad-banner-panel-wrapper-float" onClick={()=> props.onClick()}>
		<img src={image} className="ad-banner-panel-image" alt={caption} />
	</div>);
}

export default AdBannerPanel;
