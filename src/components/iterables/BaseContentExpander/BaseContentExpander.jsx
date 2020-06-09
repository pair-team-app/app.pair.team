
import React from 'react';
import './BaseContentExpander.css';
import Collapse from '@kunukn/react-collapse';


function BaseContentExpander(props) {
	const { className, expanded, title, content } = props;

	return (<div className={`base-content-expander${(` ${className}` || '')}`}>
		<div className="base-content-expander-header-wrapper">{title}</div>

		<Collapse
			isOpen={expanded}
			className="base-content-expander-content-wrapper"
			data-open={expanded}
			aria-hidden={!expanded}
			render={(state)=> (<div className="base-content-expander-content">{content}</div>)}
		/>
	</div>);
}


export default (BaseContentExpander);
