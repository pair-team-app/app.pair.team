
import React from 'react';
import './BaseContentExpander.css';

import Collapse from '@kunukn/react-collapse';


function BaseContentExpander(props) {
	const { className, open, title, content } = props;
	const render = (state)=> (<div className="base-content-expander-content">{content}</div>);

	return (<div className={`base-content-expander${(` ${className}` || '')}`}>
		<div className="base-content-expander-header-wrapper">{title}</div>

		<Collapse
			isOpen={open}
			className={`base-content-expander-content-wrapper${(open) ? ' base-content-expander-content-wrapper-open' : ''}`}
			aria-hidden={!open}
			render={render}
		/>
	</div>);
}


export default (BaseContentExpander);
