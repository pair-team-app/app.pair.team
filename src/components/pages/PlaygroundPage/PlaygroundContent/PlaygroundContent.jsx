


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
import {COMOPONENT_THUMB_SCALE} from "../../../../consts/formats";


class PlaygroundContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position : null,
      popover  : false
    };
  }


  handleComponentPopoverClose = ()=> {
    console.log('%s.handleComponentPopoverClose()', this.constructor.name);
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

    const { typeGroup, playground, component, comment, cursor, mouse, profile } = this.props;
    const { position, popover } = this.state;

    const components = (typeGroup) ? (component) ? [component] : componentsFromTypeGroup(playground.components, typeGroup) : [];
//     const packedRects = (playground && components.every(({ html, styles, rootStyles })=> (html && styles && rootStyles))) ? packComponents(components) : [];
//
//     console.log(':::::::::_', { typeGroup, component, components });
//
//     const maxSize = calcSize(packedRects);
// 		console.log(':::::::', 'maxSize', maxSize);
// 		console.log(':::::::', 'component test', { '! << 0' : (!(!component << 0)), 'itself' : (component) });

    return (<div className="playground-content" data-component={(!(!component << 0))} data-cursor={cursor}>
      {(typeGroup && components.length > 0) && (<div className="playground-content-components-wrapper" data-component={(!(!component << 0))}>
        {(!component)
          ? (typeGroup.id === 187)
            ? (<PlaygroundComponentsGrid components={components} onItemClick={this.handleContentClick} />)
            : (<PlaygroundComponentsColumn components={components.sort((i, ii)=> ((i.meta.bounds.width < ii.meta.bounds.width) ? -1 : (i.meta.bounds.width > ii.meta.bounds.width) ? 1 : 0))} onItemClick={this.handleContentClick} />)
          : (<div className="playground-component-wrapper"><PlaygroundComponent position={position} component={component} onAdd={this.props.onAddComment} onClose={this.handleComponentPopoverClose} onDelete={this.props.onDeleteComment} onItemClick={this.handleContentClick} onMarkerClick={this.props.onMarkerClick} /></div>)
        }
      </div>)}

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


const PlaygroundComponent = (props)=> {
//   console.log('PlaygroundComponent()', props);

  const { position, component, comment } = props;
  const { id, title, image, comments } = component;

  return (<div className="playground-component" onClick={(event)=> props.onItemClick(event, component)}>
    <ContextMenuTrigger id="component" component={component} collect={(props)=> ({ component : props.component })} disableIfShiftIsPressed={true}>
      <div className="playground-content-component" data-id={id}><img src={image} className="playground-content-component-image" alt={title} /></div>
      <div className="playground-component-comments-wrapper" data-id={id}>
        {(comments.filter(({ type })=> (type !== 'init')).map((comm, i)=> {
          return (<PlaygroundComment key={i} ind={(comments.length - 1) - i} component={component} comment={comm} position={position} onMarkerClick={props.onMarkerClick} onAdd={props.onAddComment} onDelete={props.onDeleteComment} onClose={props.onClose} />);
        }))}
      </div>
    </ContextMenuTrigger>
  </div>)
};


const PlaygroundComponentsColumn =(props)=> {
//   console.log('PlaygroundComponentsColumn()', props);

  const { components } = props;
  return (<div className="playground-components-column"><ul>
    {(components.map((component, i)=> {
      const { id, title, image } = component;
      return (<li key={i} className="playground-component-wrapper playground-components-column-item" data-id={id} onClick={(event)=> props.onItemClick(event, component)}>
        <img src={image} alt={title} />
      </li>)
    }))}
  </ul></div>);
};


const PlaygroundComponentsGrid =(props)=> {
//   console.log('PlaygroundComponentsGrid()', props);

  const { components } = props;
  return (<div className="playground-components-grid">
    {(Array(20).fill(...components).map((component, i)=> {
//     {(components.map((component, i)=> {
      const { id, title, thumbImage } = component;
      return (<div key={i} className="playground-component-wrapper playground-components-grid-item" onClick={(event)=> props.onItemClick(event, component)}>
        <img src={thumbImage} alt={title} />
      </div>)
    }))}
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


/*
// Object.fromEntries()
const obj = {a: 1, b: 2, c: 3}
const result = Object.fromEntries(
Object.entries(obj).map(
  ([key, value]) => [key, value * 2]
))
// {a: 2, b: 4, c: 6}
*/
