
import React, { Component } from 'react';
import './PlaygroundContent.css';

import { ContextMenuTrigger } from 'react-contextmenu';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import PlaygroundComment from './PlaygroundComment';
import ComponentMenu from './ComponentMenu';
import { convertStyles, inlineStyles } from '../utils/css';
import { reformComment } from '../utils/reform';


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
		console.log('%s.handleContentClick()', this.constructor.name, component);

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
// 					console.log('%s.render()', this.constructor.name, i, comp.meta);

					//const html = comp.html.replace(/\\"/g, '"').replace(/ class=.+?"/, ` style="${Object.keys(comp.styles).map((key)=> (`${key}:${comp.styles[key]}`)).join('; ').replace(/"/g, '\'')}"`);

					/*
					const obj = {a: 1, b: 2, c: 3}
					const result = Object.fromEntries(
          Object.entries(obj).map(
            ([key, value]) => [key, value * 2]
          ))
					// {a: 2, b: 4, c: 6}
					*/

// 					let grp = {};
// 					comp.children.forEach((child, j)=> {
// 						const path = [ ...child.path].pop();
// 						const inline = inlineStyles(child.html, child.styles);
//
// 						let sub = Object.fromEntries([[[...path.split(':')].shift(), [inline]]]);
// 						// find parent & make new sub obj as array
// 						if ((path.substr(-1) << 0) === 0) {
//
// 							if (Object.keys(grp).length === 0) {
// 								grp = sub;
// // 								console.log('=0', grp, sub, child.path);
//
// 							} else {
// // 								grp = { ...grp,
// // 									[child.path[0].split(':')[0]] :
// // 								};
//
//
// // 								const sub = Object.keys(grp).find((key, j)=> (key === child.path[0].split(':')[0]));
// // 								console.log('>0', grp, sub, child.path);
// 							}
//
// 						// find object w/ ind 0 & append array
// 						} else {
// // 							console.log('>0', grp, sub, child.path);
// 						}
// 					});

// 					let html = ['', ''];
// 					comp.children.forEach((child, j)=> {
// 						const path = [ ...child.path].pop();
// 						const inline = inlineStyles(child.html, child.styles);
//
// 						if ((path.substr(-1) << 0) === 0) {
// 							html = [`${html[0]}${inline.split('[:]')[0]}`, `${inline.split('[:]')[1]}${html[1]}`];
//
// 						} else {
// 							html = [`${html[0]}`, `${html[1].replace(/><?/, `>${inline.split('[:]').join('').replace('[:]', '')}<`)}`];
// 						}
//
// // 						console.log(j, path, html);
// 					});

// 					let children = '';
// 					const content = '<div></div>';
// 					const content = '<span style="--border-color: #cecece; --btn-bg-color: #0067ff; --btn-disabled-bg-color: #ccc; --btn-disabled-fg-color: #999; --btn-fg-color: #232323; --btn-hover-bg-color: #2259e0; --btn-hover-fg-color: #94a9f4; --btn-selected-fg-color: #fff; --cancel-btn-bg-color: #ccc; --cancel-btn-fg-color: #999; --link-alt-color: #999; --link-alt-hover-color: #666; --link-color: #232323; --link-hover-color: #999; --link-selected-color: #999; --playground-comments-timestamp-color: #999; --playground-comments-width: 228px; --playground-nav-width: 208px; --playground-panel-bg-color: #f7f7f7; --quiet-btn-bg-rgb-color: 247,247,247; --quiet-btn-fg-rgb-color: 35,35,35; --quiet-btn-hover-bg-color: #ededed; --quiet-btn-selected-bg-color: #232323; --quiet-btn-selected-fg-color: #fff; --site-bg-color: #fcfcfc; --site-bg-rgb-color: 252,252,252; --site-disabled-fg-color: #ccc; --site-fg-color: #232323; --txtfield-bg-color: #f7f7f7; --txtfield-disabled-bg-color: #f7f7f7; --txtfield-disabled-fg-color: #666; -moz-osx-font-smoothing: grayscale; -webkit-font-smoothing: antialiased; background-color: var(--site-bg-color); box-sizing: border-box; color: var(--site-fg-color); font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,Arial,sans-serif; font-size: 16px; font-weight: 400; margin: 0; max-height: 100vh; min-height: 100vh; padding: 0;"><a aria-current="page" class="page-nav-link active" href="/" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 0; text-decoration: none; width: fit-content;"><div style="box-sizing: border-box;"><div class="top-nav-logo" style="box-sizing: border-box; height: 18px; width: 18px;"><svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" style="box-sizing: border-box;"><g id="WEBSITE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" style="box-sizing: border-box;"><g id="MOBILE-HOME" transform="translate(-20.000000, -44.000000)" fill-rule="nonzero" style="box-sizing: border-box;"><g id="obit-logo" transform="translate(20.000000, 44.000000)" style="box-sizing: border-box;"><rect id="logo-bg" fill="#232323" x="0" y="0" width="18" height="18" style="box-sizing: border-box;"/><rect id="logo-fg" fill="#F4F4F4" x="1.21621622" y="1.21621622" width="15.5675676" height="15.5675676" rx="7.78378378" style="box-sizing: border-box;"/></g></g></g></svg></div><div class="top-nav-title" style="box-sizing: border-box; display: inline; margin-left: 10px;">Pair</div></div></a></span>';
// 					const content = '<div style="--border-color: #cecece; --btn-bg-color: #0067ff; --btn-disabled-bg-color: #ccc; --btn-disabled-fg-color: #999; --btn-fg-color: #232323; --btn-hover-bg-color: #2259e0; --btn-hover-fg-color: #94a9f4; --btn-selected-fg-color: #fff; --cancel-btn-bg-color: #ccc; --cancel-btn-fg-color: #999; --link-alt-color: #999; --link-alt-hover-color: #666; --link-color: #232323; --link-hover-color: #999; --link-selected-color: #999; --playground-comments-timestamp-color: #999; --playground-comments-width: 228px; --playground-nav-width: 208px; --playground-panel-bg-color: #f7f7f7; --quiet-btn-bg-rgb-color: 247,247,247; --quiet-btn-fg-rgb-color: 35,35,35; --quiet-btn-hover-bg-color: #ededed; --quiet-btn-selected-bg-color: #232323; --quiet-btn-selected-fg-color: #fff; --site-bg-color: #fcfcfc; --site-bg-rgb-color: 252,252,252; --site-disabled-fg-color: #ccc; --site-fg-color: #232323; --txtfield-bg-color: #f7f7f7; --txtfield-disabled-bg-color: #f7f7f7; --txtfield-disabled-fg-color: #666; -moz-osx-font-smoothing: grayscale; -webkit-font-smoothing: antialiased; background-color: var(--site-bg-color); box-sizing: border-box; color: var(--site-fg-color); font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,Arial,sans-serif; font-size: 16px; font-weight: 400; margin: 0; max-height: 100vh; min-height: 100vh; padding: 0;"><div id="root" style="box-sizing: border-box;"><div class="site-wrapper" style="box-sizing: border-box; width: 100%;"><div class="top-nav" style="align-items: center; box-sizing: border-box; display: flex; padding: 20px; position: fixed; width: 100%; z-index: 2;"><div class="top-nav-branding-wrapper" style="box-sizing: border-box; flex: 2 2; margin: auto;"><a aria-current="page" class="page-nav-link active" href="./" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 0; text-decoration: none; width: fit-content;"><div style="align-items: center; box-sizing: border-box; display: flex; flex-wrap: nowrap; width: fit-content;"><div class="top-nav-logo" style="box-sizing: border-box; height: 18px; width: 18px;"><svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" style="box-sizing: border-box;"><g id="WEBSITE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" style="box-sizing: border-box;"><g id="MOBILE-HOME" transform="translate(-20.000000, -44.000000)" fill-rule="nonzero" style="box-sizing: border-box;"><g id="obit-logo" transform="translate(20.000000, 44.000000)" style="box-sizing: border-box;"><rect id="logo-bg" fill="#232323" x="0" y="0" width="18" height="18" style="box-sizing: border-box;"/><rect id="logo-fg" fill="#F4F4F4" x="1.21621622" y="1.21621622" width="15.5675676" height="15.5675676" rx="7.78378378" style="box-sizing: border-box;"/></g></g></g></svg></div><div class="top-nav-title" style="box-sizing: border-box; display: inline; margin-left: 10px;">Pair</div></div></a></div><div class="top-nav-theme-toggle-wrapper" style="box-sizing: border-box; flex: 1 1; margin: auto; text-align: center;"></div><div class="top-nav-link-wrapper" style="box-sizing: border-box; flex: 2 2; margin: auto; text-align: right;"><a class="page-nav-link" target="_self" href="./features" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 40px; text-decoration: none; width: fit-content;">Features</a><a class="page-nav-link" target="_self" href="./pricing" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 40px; text-decoration: none; width: fit-content;">Pricing</a><a class="page-nav-link" target="_blank" href="./url/https://medium.com/pairurl" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 40px; text-decoration: none; width: fit-content;">Blog</a><a class="page-nav-link" target="_blank" href="./url/https://1to1show.com" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 40px; text-decoration: none; width: fit-content;">1to1</a><a class="page-nav-link" target="_blank" href="./url/https://github.com/de-ai/designengine.ai/blob/master/README.md" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 0; text-decoration: none; width: fit-content;">Docs</a></div></div><div class="content-wrapper" style="box-sizing: border-box; left: 0; overflow: hidden; position: relative; top: 58px; width: 100%;"><div class="base-page home-page-wrapper" style="box-sizing: border-box; padding: 60px; text-align: center; width: 100%;"><div class="home-page-form-wrapper" style="align-content: stretch; align-items: center; box-sizing: border-box; display: flex; flex-direction: column; margin-bottom: 75px;"><h1 style="box-sizing: border-box; font-size: 48px; font-weight: 400; letter-spacing: 1px; line-height: 68px; margin: 0; margin-bottom: 60px; max-width: 75%;">Introducing Pair, an NPM module for product teams to approve front-end design.</h1><form style="box-sizing: border-box; width: 316px;"><input type="text" name="email" placeholder="Enter Email Address" autocomplete="off" value style="-webkit-appearance: none; border: 1px solid var(--border-color); border-radius: 23px; box-sizing: border-box; color: var(--site-fg-color); cursor: text; font-size: 16px; margin-bottom: 20px; padding: 15px 20px; text-align: center; width: 100%;"><button type="submit" style="background-color: var(--btn-bg-color); border: 1px solid var(--border-color); border-radius: 23px; box-sizing: border-box; color: var(--btn-fg-color); font-size: 16px; height: 46px; padding: 8px 30px 10px; width: 316px;">Join Wait List</button></form><div class="form-disclaimer" style="box-sizing: border-box; font-size: 12px; line-height: 18px; margin-top: 30px;">By tapping “Join Wait List” you accept our<br style="box-sizing: border-box;"><a href="./terms" style="box-sizing: border-box; color: var(--link-color); text-decoration: none;">Terms of Service.</a></div></div><div class="page-content-wrapper home-page-content-wrapper" style="box-sizing: border-box;"><div class="home-page-element-wrapper" style="box-sizing: border-box; margin-bottom: 30px; width: 100%;"><video class="home-page-element home-page-element-landscape" autoplay controls loop style="border: 1px solid #c3c3c3; border-radius: 20px; box-sizing: border-box; width: 100%;"><source src="./static/media/element-home-page-landscape.dbf3c03d.mp4" type="video/mp4" style="box-sizing: border-box;"></video></div></div></div></div><div class="bottom-nav" style="align-items: center; bottom: 0; box-sizing: border-box; display: flex; flex-wrap: nowrap; padding: 10px 30px; position: fixed; width: 100%; z-index: 2;"><div class="bottom-nav-spacer" style="box-sizing: border-box; flex: 1 0;"></div><div class="bottom-nav-button-wrapper" style="box-sizing: border-box; flex: 3 1; text-align: center;"><button class="quiet-button adjacent-button" name="download-npm" style="-webkit-transition: background-color .125s ease-in; background-color: rgb(var(--quiet-btn-bg-rgb-color),1); border: 1px solid var(--border-color); border-radius: 23px; box-sizing: border-box; color: rgb(var(--quiet-btn-fg-rgb-color),1); font-size: 16px; height: 46px; margin-right: 20px; max-width: fit-content; min-width: fit-content; padding: 8px 18px 10px; transition: background-color .125s ease-in; width: fit-content;">NPM Module</button><button class="quiet-button" name="adobe-xd-plugin" style="-webkit-transition: background-color .125s ease-in; background-color: rgb(var(--quiet-btn-bg-rgb-color),1); border: 1px solid var(--border-color); border-radius: 23px; box-sizing: border-box; color: rgb(var(--quiet-btn-fg-rgb-color),1); font-size: 16px; height: 46px; max-width: fit-content; min-width: fit-content; padding: 8px 18px 10px; transition: background-color .125s ease-in; width: fit-content;">Adobe XD Plugin</button></div><div class="bottom-nav-link-wrapper" style="box-sizing: border-box; flex: 1 0; text-align: right;"><a class="page-nav-link" target="_self" href="./legal" style="box-sizing: border-box; color: var(--link-color); letter-spacing: .2px; margin-right: 0; text-decoration: none; width: fit-content;">Legal</a></div></div><div class="modal-wrapper" style="box-sizing: border-box;"></div></div></div></div>';
// 					const content = inlineStyles(comp.html, comp.styles).replace(/\[:]/, html.join(''));


					const content = inlineStyles(comp.html, comp.styles);
// 					const content = comp.html;

					const comments = (popover && component.id === comp.id) ? [ ...comp.comments, reformComment({ position,
						id      : 0,
						type    : 'add',
						content : '',
						author  : profile
					})] : comp.comments;


					return (<div key={i} className="playground-content-component-wrapper" onClick={(event)=> this.handleContentClick(event, comp)}>
						<ContextMenuTrigger id="component" disableIfShiftIsPressed={true}>
							<div className="playground-content-component" data-id={comp.id} style={convertStyles(comp.rootStyles)} dangerouslySetInnerHTML={{ __html : content }} />

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
