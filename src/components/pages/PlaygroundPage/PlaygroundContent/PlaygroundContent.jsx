
import React, { Component } from 'react';
import './PlaygroundContent.css';

import { ContextMenuTrigger } from 'react-contextmenu';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import PlaygroundComment from './PlaygroundComment';
import ComponentMenu from './ComponentMenu';
import { reformComment } from '../utils/reform';


const inlineStyles = (html, styles)=> {
	const style = Object.keys(styles).map((key)=> (`${key}:${styles[key]}`)).join('; ').replace(/"/g, '\'');
	return ((/style="(.+?)"/i.test(html)) ? `${html.replace(/style="/, `style="${style} `)}` : html.replace(/>/, ` style="${style}">`).replace(/ class=.+?"/, ''));
};


class PlaygroundContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			position : null,
			popover  : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

// 		if (this.props.comment && !prevProps.comment) {
// 			this.setState({ popover : true });
// 		}
	}

	handleComponentPopoverClose = ()=> {
// 		console.log('%s.handleComponentPopoverClose()', this.constructor.name);
		this.setState({ popover : false }, ()=> {
			this.props.onPopoverClose();
		});
	};

	handleContentClick = (event, component)=> {
// 		console.log('%s.handleContentClick()', this.constructor.name, { boundingRect : event.target }, { clientX : event.clientX, clientY : event.clientY }, component);

		const { cursor } = this.props;
		if (cursor) {
			const position = {
				x : event.clientX - event.target.getBoundingClientRect().left,
				y : event.clientY - event.target.getBoundingClientRect().top,
			};

			this.setState({ position,
				popover : true
			});
		}

		this.props.onComponentClick({ component });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { typeGroup, playground, component, comment, cursor, mouse, profile } = this.props;
		const { position, popover } = this.state;

// 		const components = playground.components;
		const components = (component) ? [component] : (typeGroup) ? playground.components.filter(({ typeID })=> (typeID === typeGroup.id)) : playground.components;

		return (<div className="playground-content" data-cursor={cursor}>
			<div className="playground-content-components-wrapper">
				{(components.map((comp, i)=> {
// 					console.log('%s.render()', this.constructor.name, i, comp);

					//const html = comp.html.replace(/\\"/g, '"').replace(/ class=.+?"/, ` style="${Object.keys(comp.styles).map((key)=> (`${key}:${comp.styles[key]}`)).join('; ').replace(/"/g, '\'')}"`);

					/*
					const obj = {a: 1, b: 2, c: 3}
					const result = Object.fromEntries(
          Object.entries(obj).map(
            ([key, value]) => [key, value * 2]
          ))
					// {a: 2, b: 4, c: 6}
					*/

					let grp = {};
					comp.children.forEach((child, j)=> {
						const path = [ ...child.path].pop();
						const inline = inlineStyles(child.html, child.styles);

						let sub = Object.fromEntries([[[...path.split(':')].shift(), [inline]]]);
						// find parent & make new sub obj as array
						if ((path.substr(-1) << 0) === 0) {

							if (Object.keys(grp).length === 0) {
								grp = sub;
// 								console.log('=0', grp, sub, child.path);

							} else {
// 								grp = { ...grp,
// 									[child.path[0].split(':')[0]] :
// 								};


// 								const sub = Object.keys(grp).find((key, j)=> (key === child.path[0].split(':')[0]));
// 								console.log('>0', grp, sub, child.path);
							}

						// find object w/ ind 0 & append array
						} else {
// 							console.log('>0', grp, sub, child.path);
						}
					});

					let html = ['', ''];
					comp.children.forEach((child, j)=> {
						const path = [ ...child.path].pop();
						const inline = inlineStyles(child.html, child.styles);

						if ((path.substr(-1) << 0) === 0) {
							html = [`${html[0]}${inline.split('[:]')[0]}`, `${inline.split('[:]')[1]}${html[1]}`];

						} else {
							html = [`${html[0]}`, `${html[1].replace(/><?/, `>${inline.split('[:]').join('').replace('[:]', '')}<`)}`];
						}

// 						console.log(j, path, html);
					});

// 					let children = '';
					const content = inlineStyles(comp.html, comp.styles).replace(/\[:]/, html.join(''));


					const comments = (popover && component.id === comp.id) ? [ ...comp.comments, reformComment({ position,
						id      : 0,
						type    : 'add',
						content : '',
						author  : profile
					})] : comp.comments;


					return (<div key={i} className="playground-content-component-wrapper" onClick={(event)=> this.handleContentClick(event, comp)}>
						<ContextMenuTrigger id="component" disableIfShiftIsPressed={true}>
							<div className="playground-content-component" data-id={comp.id} dangerouslySetInnerHTML={{ __html : content }} />

							<div className="playground-content-component-comment-wrapper" data-id={comp.id} >
								{(comments.filter(({ type })=> (type !== 'init')).map((comm, j)=> {
									return (<PlaygroundComment key={`${i}_${j}`} ind={(comp.comments.length - 1) - j} component={comp} comment={comm} position={position} onMarkerClick={this.props.onMarkerClick} onAddComment={this.props.onAddComment} onDelete={this.props.onDeleteComment} onClose={this.handleComponentPopoverClose} />);
								}))}
							</div>
						</ContextMenuTrigger>
					</div>);
				}))}
			</div>

			{(cursor) && (<CommentPinCursor position={mouse.position} />)}
			<ComponentMenu menuID="component" component={component} onShow={this.props.onMenuShow} onClick={this.props.onMenuItem} onAddComment={this.props.onAddComment}/>
		</div>);
	}
}


const CommentPinCursor = (props)=> {
// 	console.log('CommentPinCursor()', props);

	const { position } = props;
	const style = {
		top  : `${position.y}px`,
		left : `${position.x}px`
	};

	return (<div className="comment-pin-cursor" style={style}>
		<FontAwesome name="map-marker-alt" />
	</div>);
};


const mapStateToProps = (state, ownProps)=> {
	return ({
		mouse   : state.mouse,
		profile : state.userProfile
	});
};


export default connect(mapStateToProps)(PlaygroundContent);
