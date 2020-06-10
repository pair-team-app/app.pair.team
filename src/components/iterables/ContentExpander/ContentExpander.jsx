
import React from 'react';
import './ContentExpander.css';
import Collapse from '@kunukn/react-collapse';


function ContentExpander(props) {
	const { className, expanded, title, content } = props;

	return (<div className={`content-expander${(` ${className}` || '')}`}>
		<div className="content-expander-header-wrapper">{title}</div>

		<Collapse
			isOpen={expanded}
			className="content-expander-content-wrapper"
			data-open={expanded}
			aria-hidden={!expanded}
			render={(state)=> (<div className="content-expander-content">{content}</div>)}
		/>
	</div>);
}


export default (ContentExpander);
