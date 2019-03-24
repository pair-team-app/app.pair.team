
import React from 'react';
import './AdvertPanel.css';


function AdvertPanel(props) {
// 	console.log('AdvertPanel()', props);

	const { image, caption } = props;
	return (<div className="advert-panel-wrapper advert-panel-wrapper-float" onClick={()=> props.onClick()}>
		<img src={image} className="advert-panel-image" alt={caption} />
	</div>);
}

export default AdvertPanel;
