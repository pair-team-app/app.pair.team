import React, { Component } from 'react';
import './PlaygroundContent.css';

import { Images } from 'lang-js-utils';
import { ContextMenuTrigger } from 'react-contextmenu';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import PlaygroundComment from '../PlaygroundComment';
import ComponentMenu from './ComponentMenu';
import { inlineStyles } from '../utils/css';
import { componentsFromTypeGroup } from '../utils/lookup';
import packComponents, { calcSize } from '../utils/packing';
import { reformComment } from '../utils/reform';
import { COMOPONENT_THUMB_SCALE } from '../../../../consts/formats';


class PlaygroundContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position : null,
      popover  : false
    };
  }


  handleComponentPopoverClose = ()=> {
//  console.log('%s.handleComponentPopoverClose()', this.constructor.name);
    this.setState({ popover : false }, ()=> {
      this.props.onPopoverClose();
    });
  };

  handleContentClick = (event, component)=> {
// 		console.log('%s.handleContentClick()', this.constructor.name, { boundingRect : event.target }, { clientX : event.clientX, clientY : event.clientY }, component);
//  console.log('%s.handleContentClick()', this.constructor.name, component);

    const { cursor } = this.props;
    if (cursor) {
      const position = {
        x : (event.clientX - 8) - event.target.getBoundingClientRect().x,
        y : (event.clientY - 24) - event.target.getBoundingClientRect().y,
      };

      this.setState({ position,
        popover : true
      });
    }

    this.props.onComponentClick({ component });
  };

  render() {
// 		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { typeGroup, playground, component, cursor, mouse, profile } = this.props;
    const { position, popover } = this.state;

    const components = (component) ? [component] : (typeGroup) ? componentsFromTypeGroup(playground.components, typeGroup) : playground.components;
    const packedRects = (playground && components.every(({ html, styles, rootStyles })=> (html && styles && rootStyles))) ? packComponents(components) : [];

    const viewsContent = false;//(typeGroup.id === 187 && !component);

    const maxSize = calcSize(packedRects);
// 		console.log(':::::::', 'maxSize', maxSize);
    const wrapperStyle = (!viewsContent) ? {
      width  : `${maxSize.width}px`,
      height : `${maxSize.height}px`
    } : null;
    return (<div className="playground-content" data-cursor={cursor}>
      <div className={`${(!viewsContent) ? 'playground-content-components-wrapper' : 'playground-content-views-wrapper'}`} style={wrapperStyle}>
        {(packedRects.length > 0) && (components.map((comp, i)=> {
          const pos = {
            x : packedRects.find(({ id })=> (id === comp.id)).x,
            y : packedRects.find(({ id })=> (id === comp.id)).y,
          };

          const style = (!viewsContent) ? {
            top  : `${pos.y}px`,
            left : `${pos.x}px`
          } : {
// 						width  : `${comp.meta.bounds.width * scaleViews}px`,
// 						height : `${comp.meta.bounds.height * scaleViews}px`
          };

// 					const content = (!viewsContent) ? inlineStyles(comp.html, comp.styles) : `<img src="${Images.genPlaceholder(comp.meta.bounds, comp.title)}" class="playground-content-view-image" style="width:${comp.meta.bounds.width * 0.5}px; height:${comp.meta.bounds.height * 0.5}px;" alt="${comp.title}" />`;
// 					const content = (comp.html && comp.styles) ? (!viewsContent) ? inlineStyles(comp.html, comp.styles) : `<img src="${comp.image}" class="playground-content-view-image" style="width:${comp.meta.bounds.width}px; height:${comp.meta.bounds.height}px;" alt="${comp.title}" />` : `<!--<img src="${Images.genPlaceholder(comp.meta.bounds, comp.title)}" class="playground-content-view-image" style="width:${comp.meta.bounds.width}px; height:${comp.meta.bounds.height}px;" alt="${comp.title}" />-->`;
          const content = (comp.html && comp.styles) ? (!viewsContent) ? inlineStyles(comp.html, comp.styles) : `<img src="${comp.thumbImage}" class="playground-content-view-image" style="width:${comp.meta.bounds.width}px; height:${comp.meta.bounds.height}px;" alt="${comp.title}" />` : `<img src="${Images.genPlaceholder(comp.meta.bounds, comp.title)}" class="playground-content-view-image" alt="${comp.title}" />`;
          const comments = (popover && component.id === comp.id) ? [ ...comp.comments, reformComment({ position,
            id      : 0,
            type    : 'add',
            content : '',
            author  : profile
          })] : comp.comments;


          return (<div key={i} className={`playground-content-component-wrapper${(!component) ? ' playground-content-component-wrapper-cursor' : ''}`} onClick={(event)=> this.handleContentClick(event, comp)} style={style}>
            <ContextMenuTrigger id="component" component={comp} collect={(props)=> ({ component : props.component })} attributes={{ 'data-pos' : pos }} disableIfShiftIsPressed={true}>
              <div className="playground-content-component-header" style={{ display : 'none' }}>
                {comp.title}
              </div>
              {(component)
                ? (<div className="playground-content-component" data-id={comp.id}><img src={comp.image} className="playground-content-view-image" style={{width : `${comp.meta.bounds.width}px`, height : `${comp.meta.bounds.height}px`}} alt={comp.title} /></div>)
                : (<div className="playground-content-component" data-id={comp.id}><img src={comp.thumbImage} className="playground-content-view-image" style={{width : `${comp.meta.bounds.width * COMOPONENT_THUMB_SCALE}px`, height : `${comp.meta.bounds.height * COMOPONENT_THUMB_SCALE}px`}} alt={comp.title} /></div>)
              }

              <div className="playground-content-component-comment-wrapper" data-id={comp.id} >
                {(comments.filter(({ type })=> (type !== 'init')).map((comm, ii)=> {
                  return (<PlaygroundComment key={`${i}_${ii}`} ind={(comp.comments.length - 1) - ii} component={comp} comment={comm} position={position} onMarkerClick={this.props.onMarkerClick} onAddComment={this.props.onAddComment} onDelete={this.props.onDeleteComment} onClose={this.handleComponentPopoverClose} />);
                }))}
              </div>
            </ContextMenuTrigger>
          </div>);
        }))}
      </div>

      {(cursor) && (<CommentPinCursor position={mouse.position} />)}
      <ComponentMenu menuID="component" onShow={this.props.onMenuShow} onClick={this.props.onMenuItem} onAddComment={this.props.onAddComment}/>
    </div>);
  }
}


const CommentPinCursor = (props)=> {
// 	console.log('CommentPinCursor()', props);

  const { position } = props;
  const style = {
    top  : `${position.y - 24}px`,
    left : `${position.x - 8}px`
  };

  return (<div className="comment-pin-cursor" style={style}>
    <FontAwesome name="map-marker-alt" />
  </div>);
};


const mapStateToProps = (state, ownProps)=> {
  return ({
    mouse      : state.mouse,
    profile    : state.userProfile,
    playground : state.playground,
    typeGroup  : state.typeGroup,
    component  : state.component,
    comment    : state.comment
  });
};


export default connect(mapStateToProps)(PlaygroundContent);
