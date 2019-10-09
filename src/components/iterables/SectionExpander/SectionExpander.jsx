
import React from 'react';
import './SectionExpander.css';

import Collapse from '@kunukn/react-collapse';


function SectionExpander(props) {
	const { section, title, children } = props;
	const { open } = section;

	return (<div className="section-expander">
		<div className={`section-expander-title${(open) ? ' section-expander-title-open' : ''}`}>{title}</div>

		<Collapse
			isOpen={open}
			className={`section-expander-content-wrapper${(open) ? ' section-expander-content-wrapper-open' : ''}`}
// 				transition={`height ${(open) ? '250ms cubic-bezier(0.2, 0.5, 0.9, 1.0)' : '250ms cubic-bezier(0.5, 0.9, 0.1, 1.0)'}`}
			transition={`height ${(open) ? '333ms cubic-bezier(0.5, 0.9, 0.1, 1.0)' : '250ms cubic-bezier(0.0, 1.0, 0.0, 1.0)'}`}
			aria-hidden={!open}
			render={(state)=> (<div className="section-expander-content">{children}</div>)}>
		</Collapse>
	</div>);
}


export default (SectionExpander);
