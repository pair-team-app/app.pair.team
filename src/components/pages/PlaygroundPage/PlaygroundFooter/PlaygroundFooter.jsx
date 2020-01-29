import React from 'react';
import './PlaygroundFooter.css';


function PlaygroundFooter(props) {
// 	console.log('PlaygroundFooter()', props);
	console.log('PlaygroundFooter()', { component : props.component, props });

// 	const { accessibility, cursor, playground, builds } = props;
	const { accessibility, cursor, component } = props;
	return (<div className="playground-footer">
		<div className="playground-footer-button-wrapper playground-footer-comments-wrapper">
			<FooterCommentButton selected={cursor} onClick={props.onToggleCursor} />
		</div>
		<div className="button-wrapper-col playground-footer-button-wrapper playground-footer-content-toggle-wrapper">
			{/*<FooterMobileButton hidden={(builds === 0)} selected={(playground.deviceID !== 1 && !accessibility)} onClick={props.onToggleMobile} />*/}
			{/*<FooterDesktopButton hidden={(builds === 0)} selected={(playground.deviceID === 1 && !accessibility)} onClick={props.onToggleDesktop} />*/}
			<FooterAXButton selected={accessibility} onClick={props.onToggleAccessibility} />
		</div>
	</div>);
}


const FooterAXButton = (props)=> {
//   console.log('PlaygroundFooter().FooterAXButton()', props);
//
	const { selected } = props;
  return (<button className="quiet-button glyph-button" onClick={props.onClick} data-selected={selected}>
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 30 32">
      <g id="Group_308" data-name="Group 308" transform="translate(-961.008 -5499.554)">
        <path id="Path_113" data-name="Path 113" d="M972.94,5502.53a3.058,3.058,0,1,1,3.057,2.976A3.017,3.017,0,0,1,972.94,5502.53Zm7.132,6.942,10.493-4.407c.93-.39.261-2.186-.757-1.842l-12.793,4.265h-2.038l-12.792-4.264c-.869-.318-1.706,1.316-.757,1.841l10.493,4.406v7.935q-2.089,6.579-4.179,13.159c-.264.734,1.662,1.284,1.905.7l5.913-12.87h.873q2.957,6.435,5.913,12.871c.319.706,2.17-.042,1.905-.7l-4.179-13.159Z" transform="translate(0 0.001)" fillRule="evenodd"/>
      </g>
    </svg>
  </button>);
};

const FooterCommentButton = (props)=> {
//   console.log('PlaygroundFooter().FooterCommentButton()', props);

  const { selected } = props;
  return (<button className="quiet-button glyph-button" onClick={props.onClick} data-selected={selected}>
    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="28.352" viewBox="0 0 29 28.352">
      <path id="Union_1" data-name="Union 1" d="M1618.834,562.178a10.59,10.59,0,0,1-4.334-8.331c0-6.267,6.044-11.347,13.5-11.347s13.5,5.08,13.5,11.347-6.044,11.347-13.5,11.347a15.939,15.939,0,0,1-3.526-.391l-5.64,4.049Z" transform="translate(-1613.5 -541.5)"/>
    </svg>
	</button>);
};

// const FooterDesktopButton = (props)=> {
// //   console.log('PlaygroundFooter().FooterDesktopButton()', props);
//
//   const { selected } = props;
//   return (<button className="quiet-button glyph-button" onClick={props.onClick} data-selected={selected}>
// 		<svg xmlns="http://www.w3.org/2000/svg" width="37" height="30" viewBox="0 0 37 30">
// 			<g id="Group_309" data-name="Group 309" transform="translate(-19.585 -16)">
// 				<rect id="Rectangle_101" data-name="Rectangle 101" width="37" height="22" rx="2" transform="translate(19.585 16)"/>
// 				<path id="Path_111" data-name="Path 111" d="M42.218,80a.78.78,0,0,1-.672-.389,6.834,6.834,0,0,0-2.106-1.08,16.351,16.351,0,0,0-10.881,0,6.834,6.834,0,0,0-2.106,1.08.773.773,0,0,1-1.048.29.809.809,0,0,1-.323-1.059c.413-.843,2.365-1.6,2.954-1.818a17.88,17.88,0,0,1,11.927,0c.589.213,2.541.975,2.954,1.818a.816.816,0,0,1-.034.778A.779.779,0,0,1,42.218,80Zm-15.736-.442h0Zm15.035,0h0Z" transform="translate(3.585 -34)"/>
// 			</g>
// 		</svg>
// 	</button>);
// };
//
// const FooterMobileButton = (props)=> {
// //   console.log('PlaygroundFooter().FooterMobileButton()', props);
//
//   const { selected } = props;
// 	return (<button className="quiet-button glyph-button" onClick={props.onClick} data-selected={selected}>
// 		<svg xmlns="http://www.w3.org/2000/svg" width="17.838" height="30" viewBox="0 0 17.838 30">
// 			<rect id="Rectangle_102" data-name="Rectangle 102" width="30" height="17.838" rx="2" transform="translate(17.838) rotate(90)"/>
// 		</svg>
// 	</button>);
// };


export default (PlaygroundFooter);
