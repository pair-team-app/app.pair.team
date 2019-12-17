
import React from 'react';
import './SectionExpander.css';

import BaseContentExpander from '../BaseContentExpander';


function SectionExpander(props) {
	const { section, title, children } = props;
	const { open } = section;

	return (<BaseContentExpander
		className="section-expander"
		open={open}
		title={<div className="section-expander-title">{title}</div>}
		content={<div className="section-expander-content-wrapper">
			<div className="section-expander-content">{children}</div>
		</div>}
	/>);
}


export default (SectionExpander);
