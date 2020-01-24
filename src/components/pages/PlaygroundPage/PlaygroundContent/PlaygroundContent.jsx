


import React, { Component } from 'react';
import './PlaygroundContent.css';

import { ContextMenuTrigger } from 'react-contextmenu';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Resizable, ResizableBox } from 'react-resizable';
import ResizeObserver from 'react-resize-observer';

import PlaygroundComment from '../PlaygroundComment';
import ComponentMenu from './ComponentMenu';
// import { inlineStyles } from '../utils/css';
import { componentsFromTypeGroup } from '../utils/lookup';
import { Strings } from 'lang-js-utils';
import { reformComment } from '../utils/reform';


class PlaygroundContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position   : null,
      popover    : false,
//       baseBounds : {
//         playground : {
//           position : null,
//           size     : null
//         },
//         component  : {
//           position : null,
//           size     : null
//         }
//       },
//       bounds       : {
//         playground : {
//           position : null,
//           size     : null
//         },
//         component  : {
//           position : null,
//           size     : null
//         }
//       }

      baseBounds : null,
      bounds     : null
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

    const { playground, component } = this.props;


  };

  handlePlaygroundResize = (rect)=> {
    console.log('[:|:] %s.handlePlaygroundResize()', this.constructor.name, { rect }, '[:|:]');

    if (typeof rect !== 'undefined') {
      this.onUpdateReflow({ rect });
    }
  };


  handlePlaygroundTranslate = (rect)=> {
    console.log('<:]]:> %s.handlePlaygroundTranslate()', this.constructor.name, { rect }, '<:]]:>');

    if (typeof rect !== 'undefined') {
      this.onUpdateReflow({ rect });
    }
  };


  handlePlaygroundReflow = ({rect})=> {
    console.log('<:]]:> %s.handlePlaygroundReflow()', this.constructor.name, { rect }, '<:]]:>');

    if (typeof rect !== 'undefined') {
      this.onUpdateReflow({ rect });
    }
  };

  handleComponentResize = (event, { element, size, handle }) => {
    console.log('<:]]:> [%s.handleComponentResize()', this.constructor.name, event, { element, size, handle }, '<:]]:>');

    const { bounds } = { ...this.state,
      playground : { ...bounds.playground, size }
    };
//
    this.setState({ bounds });
  };

  handleComponentPopoverClose = ()=> {
//-/>     console.log('%s.handleComponentPopoverClose()', this.constructor.name);
    this.setState({ popover : false }, ()=> {
      this.props.onPopoverClose();
    });
  };

  handleContentClick = (event, component)=> {
// 		console.log('%s.handleContentClick()', this.constructor.name, { boundingRect : event.target }, { clientX : event.clientX, clientY : event.clientY }, component);
//-/>     console.log('%s.handleContentClick()', this.constructor.name, component);

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


  onUpdateReflow = ({ rect })=> {
    console.log('|]:]]: %s.onUpdateReflow()', this.constructor.name, { rect, bounds : this.state.bounds, baseBounds : this.state.bounds });

    const { x, y, width, height } = rect;
    const { component } = this.props;
    const { baseBounds, bounds } = this.state;

    const pgBounds = {
      position : { x, y },
      size     : { width, height }
    };

    if (!baseBounds || (baseBounds && component && !this.state.baseBounds.component)) {
      const { fullSize, thumbSize } = component;
      const size = { width, height };

      console.log('', { rect, size });

      const updBounds = {
        playground : { size,
          position : {
            x : 0,
            y : 0
          }
        },
        component  : (component) ? {
          component : {
            position : {
              x : 0,
              y : 0
            },
            size : (fullSize || thumbSize)
          }
        } : null
      };

//       console.log('|]:]]: %s.onUpdateReflow()', this.constructor.name, { org : updBounds });

      const allBounds = {
        playground : pgBounds,
        component  : updBounds
      };

      this.setState({
        baseBounds : allBounds,
        bounds     : allBounds
      });

    } else if (baseBounds && bounds !== pgBounds) {
//       console.log('|]:]]: %s.onUpdateReflow()', this.constructor.name, { org : updBounds });

      const calcBounds = {
        position : baseBounds.component.position,
        size     : baseBounds.component.size
      };

      this.setState({
        bounds : {
          playground : pgBounds,
          component  : calcBounds
        }
      });
    }
  };

  render() {
		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, typeGroup, playground, component, cursor, mouse } = this.props;
    const { position, popover, bounds } = this.state;

    const components = (typeGroup) ? (component) ? [component] : componentsFromTypeGroup(playground.components, typeGroup) : [];

    const { thumbSize, fullSize } = (component || { thumbSize : { width : 140, height : 240 }, fullSize : { width : 1920, height : 1080 } });
    const updBounds = (component && bounds && bounds.component) ? { ...bounds.component } : {
      position : {
        x : 0,
        y : 0
      },
      size : {
        width  : 0,
        height : 0
      }
    };

    console.log('%s.render()', this.constructor.name, { baseBounds : this.state.baseBounds, bounds : this.state.bounds, updBounds });

    return (<div className="playground-content" data-component={(!(!component << 0))} data-cursor={cursor}>
      <ResizeObserver
        onResize={this.handlePlaygroundResize}
        onPosition={this.handlePlaygroundTranslate}
        onReflow={this.handlePlaygroundReflow}
      />
      {(typeGroup && components.length > 0) && (<div className="playground-content-components-wrapper" data-component={(component !== null)}>
        {(!component)
          ? (<PlaygroundComponentsGrid typeGroup={typeGroup} components={components} onItemClick={this.handleContentClick} />)
          : (<PlaygroundComponent profile={profile} popover={popover} position={position} bounds={updBounds} typeGroup={typeGroup} component={component} onResize={this.handleComponentResize} onAddComment={this.props.onAddComment} onCloseComment={this.handleComponentPopoverClose} onDeleteComment={this.props.onDeleteComment} onItemClick={this.handleContentClick} onMarkerClick={this.props.onMarkerClick} />)}
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

  const { scaling, profile, popover, position, bounds, typeGroup, component } = props;
//   const { id, tagName, html, styles, rootStyles, comments, processed } = component;
  const { id, tagName, imageData, thumbData, fullSize, thumbSize, processed, comments } = component;
//   const { width, height } = (fullSize || thumbSize);
  const { position : pos, size } = bounds;
  const { width, height } = (bounds || thumbSize);

  const title = (component.title === tagName) ? `${tagName.toUpperCase()} ${Strings.capitalize(typeGroup.title)}` : component.title;

  return (<ResizableBox className="playground-component-wrapper" width={width} height={height} lockAspectRatio={true}  minContraints={(thumbSize) ? [thumbSize.width, thumbSize.height] : [0, 0]} maxContraints={(fullSize) ? [fullSize.width, fullSize.height] : null} onResize={props.onResize} resizeHandles={['s', 'se']}>
    <div className="playground-component" onClick={(event)=> props.onItemClick(event, component)} style={{ width : `${width}px`, height : `${height}px`}}>
      <h5 className="component-title">{title}</h5>

      {(scaling) && (<div className="scaling-wrapper">
        <img src={(imageData || thumbData)} alt={title} />
      </div>)}

      {(!scaling) && (<ContextMenuTrigger disable={!processed} id="component" component={component} collect={(props) => ({ component : props.component })} disableIfShiftIsPressed={true}>
        <div className="playground-content-component" data-id={id}>
          <img src={(imageData || '')} alt={title} />
        </div>
        <div className="playground-component-comments-wrapper" data-id={id}>
          {((popover) ? [...comments, reformComment({ position,
            id      : 0,
            type    : 'add',
            content : '',
            author  : profile
          })] : comments).filter(({ type })=> (type !== 'init')).map((comm, i) => {
            return (<PlaygroundComment key={i} ind={(comments.length - 1) - i} component={component} comment={comm} position={position} onMarkerClick={props.onMarkerClick} onAdd={props.onAddComment} onDelete={props.onDeleteComment} onClose={props.onCloseComment} />);
          })}
       </div>
       </ContextMenuTrigger>)}
    </div>
  </ResizableBox>);
};


const PlaygroundComponentsGrid =(props)=> {
//   console.log('PlaygroundComponentsGrid()', props);

  const { typeGroup, components } = props;
  return (<div className="playground-components-grid">
    {(components.map((component, i)=> {
//       const { id, thumbImage, tagName, html, styles, rootStyles } = component;
      const { id, thumbData, tagName, processed } = component;
      const title = (component.title === tagName) ? `${tagName.toUpperCase()} ${Strings.capitalize(typeGroup.title)}` : component.title;
      return (<div key={i} className="playground-component-wrapper components-grid-item" data-id={id} onClick={(event)=> props.onItemClick(event, component)}>
        <h5 className="component-title">{title}</h5>
        <div className="content-wrapper" data-loaded={processed}>
          {(!processed) && (<div className="image-loader">
            <i className="far fa-circle fa-spin" />
          </div>)}
          <img src={thumbData} className="components-grid-item-image" alt={title} />
          {(processed) && (<div className="image-overlay" />)}
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
