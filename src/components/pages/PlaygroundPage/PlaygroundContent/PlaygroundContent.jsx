


import React, { Component } from 'react';
import './PlaygroundContent.css';

import { ContextMenuTrigger } from 'react-contextmenu';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import PlaygroundComment from '../PlaygroundComment';
import ComponentMenu from './ComponentMenu';
// import { inlineStyles } from '../utils/css';
import { componentsFromTypeGroup } from '../utils/lookup';
import {Strings} from "lang-js-utils";


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

    const { typeGroup, playground, component, cursor, mouse } = this.props;
    const { position } = this.state;

    const components = (typeGroup) ? (component) ? [component] : componentsFromTypeGroup(playground.components, typeGroup) : [];

    return (<div className="playground-content" data-component={(!(!component << 0))} data-cursor={cursor}>
      {(typeGroup && components.length > 0) && (<div className="playground-content-components-wrapper" data-component={(!(!component << 0))}>
        {(!component)
          ? (typeGroup.id === 187)
            ? (<PlaygroundComponentsGrid typeGroup={typeGroup} components={components} onItemClick={this.handleContentClick} />)
//             : (<PlaygroundComponentsColumn typeGroup={typeGroup} components={components.sort((i, ii)=> ((i.meta.bounds.width < ii.meta.bounds.width) ? -1 : (i.meta.bounds.width > ii.meta.bounds.width) ? 1 : 0))} onItemClick={this.handleContentClick} />)
            : (<PlaygroundComponentsGrid typeGroup={typeGroup} components={components.sort((i, ii)=> ((i.meta.bounds.width < ii.meta.bounds.width) ? -1 : (i.meta.bounds.width > ii.meta.bounds.width) ? 1 : 0))} onItemClick={this.handleContentClick} />)
          : (<div className="playground-component-wrapper"><PlaygroundComponent position={position} typeGroup={typeGroup} component={component} onAddComment={this.props.onAddComment} onCloseComment={this.handleComponentPopoverClose} onDeleteComment={this.props.onDeleteComment} onItemClick={this.handleContentClick} onMarkerClick={this.props.onMarkerClick} /></div>)
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

  const { position, typeGroup, component } = props;
//   const { id, tagName, html, styles, rootStyles, comments, processed } = component;
  const { id, tagName, comments } = component;
  const title = (component.title === tagName) ? `${tagName.toUpperCase()} ${Strings.capitalize(typeGroup.title)}` : component.title;

  return (<div className="playground-component" onClick={(event)=> props.onItemClick(event, component)}>
    <h5 className="component-title">{title}</h5>
    <ContextMenuTrigger id="component" component={component} collect={(props)=> ({ component : props.component })} disableIfShiftIsPressed={true}>
      <div className="playground-content-component" data-id={id}>
        <img src={component.imageData} alt={title} />
      </div>
      {/*<div className="playground-content-component" data-id={id} style={rootStyles} dangerouslySetInnerHTML={{ __html : (processed) ? inlineStyles(html, styles) : null }} />*/}
      <div className="playground-component-comments-wrapper" data-id={id}>
        {(comments.filter(({ type })=> (type !== 'init')).map((comm, i)=> {
          return (<PlaygroundComment key={i} ind={(comments.length - 1) - i} component={component} comment={comm} position={position} onMarkerClick={props.onMarkerClick} onAdd={props.onAddComment} onDelete={props.onDeleteComment} onClose={props.onCloseComment} />);
        }))}
      </div>
    </ContextMenuTrigger>
  </div>)
};


// const PlaygroundComponentsColumn =(props)=> {
// //   console.log('PlaygroundComponentsColumn()', props);
//
//   const { typeGroup, components } = props;
//   return (<div className="playground-components-column"><ul>
//     {(components.map((component, i)=> {
//       const { id, tagName, image, html, styles, rootStyles } = component;
//       const title = (component.title === tagName) ? `${tagName.toUpperCase()} ${Strings.capitalize(typeGroup.title)}` : component.title;
//       return (<li key={i} className="playground-component-wrapper playground-components-list-item" data-id={id} onClick={(event)=> props.onItemClick(event, component)}>
//         <h5 className="component-title">{title}</h5>
//         <div className="component-overlay" />
//         <img src={image} alt={title} />
//       </li>)
//     }))}
//   </ul></div>);
// };


const PlaygroundComponentsGrid =(props)=> {
//   console.log('PlaygroundComponentsGrid()', props);

  const { typeGroup, components } = props;
  return (<div className="playground-components-grid">
    {(components.map((component, i)=> {
//       const { id, thumbImage, tagName, html, styles, rootStyles } = component;
      const { id, thumbImage, tagName, processed } = component;
      const title = (component.title === tagName) ? `${tagName.toUpperCase()} ${Strings.capitalize(typeGroup.title)}` : component.title;
      return (<div key={i} className="playground-component-wrapper playground-components-list-item" data-id={id} onClick={(event)=> props.onItemClick(event, component)}>
        <h5 className="component-title">{title}</h5>
        <div className="components-list-item-image-wrapper">
          {(!processed) && (<div className="image-loader">
            <i className="far fa-circle fa-spin" />
          </div>)}
          <img src={thumbImage} className="component-grid-item-image" alt={title} />
          <div className="image-overlay" />
        </div>
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
