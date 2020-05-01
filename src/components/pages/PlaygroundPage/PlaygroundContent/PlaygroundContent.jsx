
import React, { Component } from 'react';
import { ContextMenuTrigger } from 'react-contextmenu';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Resizable } from 'react-resizable';
import ResizeObserver from 'react-resize-observer';
import PlaygroundComment from '../PlaygroundComment';
import { componentsFromTypeGroup } from '../utils/lookup';
import { reformComment } from '../utils/reform';
import ComponentMenu from './ComponentMenu';
import './PlaygroundContent.css';
import { updateMouseCoords } from '../../../../redux/actions';

const SCALE_CONSTRAIN = 1.0;
const CONTAINER_PADDING = {
  width  : 48 * 1,
  height : 68 * 1
};

class PlaygroundContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position : null,
      popover  : false,
      bounds   : {
        init : null,
        prev : null,
        curr : null,
        next : null
      },
      rect     : null
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    // 		console.log('%s.componentWillUnmount()', this.constructor.name);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

    const { component } = this.props;
    const { bounds, rect } = this.state;

    // if (component && !bounds.init.component) {
    // if (component && bounds.init && (!bounds.curr || !bounds.curr.component)) { ///<<--
    // if (component && (!prevProps.component || !bounds.init.component)) {

    if (prevProps.component && !component) {
      this.setState({ 
        bounds : {
          init : null,
          curr : null,
          prev : null,
          next : null
        }
      });
    }

    if (!bounds.init && rect) {
      this.calcBounds(rect);
    }
  }

  calcBounds = (rect)=> {
    // console.log('%s.calcBounds()', this.constructor.name, { rect, component : this.props.component });

    const { playground, component } = this.props;
    const { device } = playground;
    if (!component) {
      return;
    }

    
    let { bounds } = this.state;
    let { init, curr } = bounds;
    const { x, y, width, height } = rect;

    // const scale = {
    //   width  : (component) ? component.meta.bounds.width / ((width - CONTAINER_PADDING.width) * SCALE_CONSTRAIN) : 1,
    //   height : (component) ? component.meta.bounds.height / ((height - CONTAINER_PADDING.height) * SCALE_CONSTRAIN) : 1
    // };

    // const isScaled = component.sizes.f.width !== component.sizes.o.width || component.sizes.f.height !== component.sizes.o.height;

    const scale = {
      // width  : (component) ? Math.max(1, component.sizes.c.width / ((width - CONTAINER_PADDING.width) * SCALE_CONSTRAIN)) : 1,
      // height : (component) ? Math.max(1, component.sizes.c.height / ((height - CONTAINER_PADDING.height) * SCALE_CONSTRAIN)) : 1

      width  : 1,//Math.max(1, component.sizes.f.width / ((width - CONTAINER_PADDING.width) * SCALE_CONSTRAIN)),
      height : 1//Math.max(1, component.sizes.f.height / ((height - CONTAINER_PADDING.height) * SCALE_CONSTRAIN))
    };

    // const devScale = 1 + (((playground.deviceID < 9) << 0) * 1);
    const size = { 
      width  : (width - CONTAINER_PADDING.width) * SCALE_CONSTRAIN,
      // width  : (1 / device.scale) * ((width - CONTAINER_PADDING.width) * SCALE_CONSTRAIN),
      height : (height - CONTAINER_PADDING.height) * SCALE_CONSTRAIN
      // height : (1 / device.scale) * ((height - CONTAINER_PADDING.height) * SCALE_CONSTRAIN)
    };

    if (!init) {
      init = { 
        container : { scale, 
          position : { x, y }, 
          size     : { width, height } 
        },
        component : { scale, size,
          position : {
            x : 0,
            y : 0
          }
        }
      };

      curr = { ...init };
    
    } else {
      curr = {
        container : { scale, 
          position : { x, y }, 
          size     : { width, height }
        },
        component : { scale, size,
          position : { ...curr.component.position }
        }
      };
    }

    bounds = { ...bounds, init, curr,
      prev : { ...bounds.prev, ...bounds.curr },
      next : { ...bounds.curr, ...curr }
    };


/*
    // nothing stored yet
    init = (init || {
      container : { scale, 
        position : { x, y }, 
        size     : { width, height } 
      },
      component : (component) ? { scale,
        position : {
          x : 0,
          y : 0
        },
        // size     : (component) ? { width, height } : null
        size     : (component) ? {
          width  : width, //scale.width * component.meta.bounds.width,
          height : height //scale.height * component.meta.bounds.height
        } : null
      } : null
    });

    curr = {
      container : { scale, 
        position : { x, y }, 
        size     : { width, height }
      },
      component : (component) ? { scale,
        position : {
          x : 0,
          y : 0
        },
        size    : {
          width  : (width - CONTAINER_PADDING.width) * SCALE_CONSTRAIN,
          height : (height - CONTAINER_PADDING.height) * SCALE_CONSTRAIN
        }
      } : (prev.component || init.component)
    };

    // const scale = (init.component)

    // console.log('%s.calcBounds() --SET STATE', this.constructor.name, { component, rect, bounds, init : { ...init }, prev : { ...bounds.prev, ...bounds.curr }, curr : { ...curr }, next : { ...bounds.next, ...next } });
*/

/*
    bounds = { ...bounds, curr, init,
      // init : { ...init, 
      //   component : (init && component && !init.component) ? { ...init.component, ...curr.component } : (curr.component || init.component)
      // },
      prev : { ...prev, ...bounds.curr },
      next : { ...bounds.curr, ...curr }
    };
*/
    this.setState({ bounds }, ()=> {
    });
  };


  handleComponentPopoverClose = ()=> {
    // console.log('%s.handleComponentPopoverClose()', this.constructor.name);

    this.setState({ popover : false }, ()=> {
      this.props.onPopoverClose();
    });
  };

  handleContentClick = (event, component)=> {
    	// console.log('%s.handleContentClick()', this.constructor.name, { boundingRect : event.target }, { clientX : event.clientX, clientY : event.clientY }, component);
    //  console.log('%s.handleContentClick()', this.constructor.name, component);

    const { cursor } = this.props;
    if (cursor) {
      const position = {
        x : (event.clientX - event.target.getBoundingClientRect().x),
        y : (event.clientY - event.target.getBoundingClientRect().y)
      };

      // console.log('%s.handleContentClick()', this.constructor.name, { boundingRect : event.target }, { clientX : event.clientX, clientY : event.clientY, position });

      this.setState({ position, 
        popover : true 
      });

      this.props.onComponentClick({ component });
    }

    if (!this.props.component) {
      this.props.onComponentClick({ component });
    }
  };


  handleMouseMove = (event)=> {
    // 		console.log('%s.handleMouseMove()', this.constructor.name, this.constructor.name, { x : event.pageX, y : event.pageY });

    const { component, cursor } = this.props;
    if (component && cursor) {
      this.props.updateMouseCoords({
        x : event.pageX,
        y : event.pageY
      });
    }
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props: this.props, state : this.state, initBounds : this.state.bounds.init, currBounds : this.state.bounds.curr });
    // console.log('%s.render()', this.constructor.name, (this.state.bounds && this.state.bounds.init) ? { init : this.state.bounds.init.component, curr : this.state.bounds.curr.component, scale : { x : (this.state.bounds.init.component.size.width / this.state.bounds.curr.component.size.width), y : (this.state.bounds.init.component.size.height / this.state.bounds.curr.component.size.height) } } : null);
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, typeGroup, playground, component, cursor, mouse } = this.props;
    const { position, popover, bounds } = this.state;
    const components = (typeGroup) ? (component) ? [component] : componentsFromTypeGroup(playground.components, typeGroup) : [];

    return (
      <div className="playground-content" data-cursor={cursor}>
        {(!component) 
          ? (<PlaygroundComponentsGrid 
              components={components} 
              onItemClick={this.handleContentClick} 
            />) 
          : (<div className="resize-wrapper">
              <ResizeObserver onResize={this.calcBounds} onPosition={this.calcBounds} onReflow={this.calcBounds} ref={(el)=> { (el && !this.state.rect) && this.setState({ rect : el._lastRect })}} />

              {(bounds.curr !== null && bounds.curr.component !== null) && (
                <PlaygroundComponent
                profile={profile}
                popover={popover}
                position={position}
                bounds={bounds.curr.component}
                maxBounds={bounds.curr.container}
                scale={bounds.curr.component.scale}
                sizeMult={playground.device.scale}
                cursor={cursor}
                typeGroup={typeGroup}
                component={component}
                onResize={this.handleComponentResize}
                onAddComment={this.props.onAddComment}
                onCloseComment={this.handleComponentPopoverClose}
                onDeleteComment={this.props.onDeleteComment}
                onItemClick={this.handleContentClick}
                onMarkerClick={this.props.onMarkerClick}
              />
              )}
              {(cursor) && (<CommentPinCursor position={mouse.position} />)}
              {/* {(component && bounds.curr && bounds.curr.component) && (<ComponentMenu menuID="component" profile={profile} component={component} scale={Math.max(...Object.values(bounds.curr.component.scale))} onShow={this.props.onMenuShow} onClick={this.props.onMenuItem} onAddComment={this.props.onAddComment} />)} */}
              {(component && bounds.curr) && (<ComponentMenu menuID="component" profile={profile} component={component} scale={Math.max(...Object.values(bounds.curr.component.scale))} onShow={this.props.onMenuShow} onClick={this.props.onMenuItem} onAddComment={this.props.onAddComment} />)}
              {/* {(component) && (<Compon  entMenu menuID="component" profile={profile} component={component} scale={Math.max(...Object.values(bounds.curr.component.scale))} onShow={this.props.onMenuShow} onClick={this.props.onMenuItem} onAddComment={this.props.onAddComment} />)} */}
            </div>)}
      </div>
    );
  }
}

const CommentPinCursor = (props)=> {
  // console.log('CommentPinCursor()', props);

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
  // console.log('PlaygroundComponent()', props);

  const { profile, popover, cursor, scale, sizeMult, bounds, component, position } = props;
  const { id, title, sizes, images, comments } = component;
  const { size } = bounds;// || component.meta.bounds;
  const { width, height } = size;

  const lgFactor = Math.max(scale.width, scale.height);
  // const updBounds = { 
  //   position : { 
  //     x : (width - component.meta.bounds.width / lgFactor) * 0.5, 
  //     y : (height - component.meta.bounds.height / lgFactor) * 0.5
  //   }, 
  //   size     : { 
  //     width  : component.meta.bounds.width / lgFactor, 
  //     height : component.meta.bounds.height / lgFactor 
  //   }
  // };

  const updBounds = { 
    position : { 
      x : (width - ((sizeMult * component.sizes.f.width) / lgFactor)) * 0.5, 
      y : (height - ((sizeMult * component.sizes.f.height) / lgFactor)) * 0.5
    }, 
    size     : { 
      width  : (sizeMult * component.sizes.f.width) / lgFactor, 
      height : (sizeMult * component.sizes.f.height) / lgFactor 
    }
  };

  // console.log('PlaygroundComponent()', { updBounds });

  const contentStyle = {
    top    : 20 + (updBounds.position.y) << 0,
    left   : updBounds.position.x << 0,
    // width  : Math.min(updBounds.size.width, sizes.c.width),
    // height : Math.min(updBounds.size.height, sizes.c.height)
    width  : Math.ceil(updBounds.size.width),
    height : Math.ceil(updBounds.size.height)
  };

  return (<Resizable
    className="playground-component-wrapper"
    axis="both"
    width={width}
    height={height + 38}
    lockAspectRatio={true}
    // minConstraints={[sizes.t.width, sizes.t.height]}
    maxConstraints={[Math.min(width, sizes.c.width), Math.min(height, sizes.c.height) - CONTAINER_PADDING.height]}
    // maxConstraints={[sizes.f.width - CONTAINER_PADDING.width, sizes.f.height - CONTAINER_PADDING.height]}
    onResize={props.onResize}>
      <div className="playground-component" data-loading={false} onClick={(event)=> (cursor) ? props.onItemClick(event, component) : null} style={{ width: `${width}px`, height: `${height}px` }}>
        <h5 className="component-title">{title}</h5>

        <div className="component-caption">
          {`${component.meta.bounds.width << 0}px × ${component.meta.bounds.height << 0}px`}
          <br />
          {`${updBounds.size.width.toFixed(2)}px × ${updBounds.size.height.toFixed(2)}px`}
        </div>
        <ContextMenuTrigger id="component" component={component} disableIfShiftIsPressed={true} holdToDisplay={-1}>
          <div className="bg-wrapper" style={contentStyle}></div>
          <div className="playground-content-component" data-id={id} style={{ height : `${Math.ceil(height)}px` }}>
            <img src={(images[1] || null)} alt={title} />
          </div>
          
          <div className="playground-component-comments-wrapper" style={contentStyle} data-id={id}>
            {((popover)
              ? [ ...comments, reformComment({ position,
                  id       : 0,
                  type     : 'add',
                  types    : '',
                  content  : '',
                  author   : profile,
                  votes    : []
                })
              ] : comments
            ).filter(({ type })=> type !== 'init').map((comment, i)=> {
                return (<PlaygroundComment
                  key={i}
                  ind={comments.length - 1 - i}
                  component={component}
                  comment={{ ...comment, votable : false }}
                  scale={scale}
                  position={position}
                  onMarkerClick={props.onMarkerClick}
                  onAdd={props.onAddComment}
                  onDelete={props.onDeleteComment}
                  onClose={props.onCloseComment}
                />);
              })}
          </div>
        </ContextMenuTrigger>
      </div>
    </Resizable>
  );
};

const PlaygroundComponentsGrid = (props)=> {
    // console.log('PlaygroundComponentsGrid()', props);

  const { components } = props;

  return (
    <div className="playground-components-grid" data-loading={false}>
      {components.map((component, i)=> {
        const { id, title, images } = component;

        return (<div key={i} className="playground-component-wrapper components-grid-item" data-id={id} onClick={(event)=> props.onItemClick(event, component)}>
          <h5 className="component-title">{title}</h5>
          <div className="content-wrapper" data-loading={false}>
            <img src={images[0]} className="components-grid-item-image" alt={title} />
            <div className="image-overlay" />
          </div>
        </div>);
      })}
    </div>
  );
};

const mapStateToProps = (state, ownProps)=> {
  return {
    mouse      : state.mouse,
    profile    : state.userProfile,
    playground : state.playground,
    typeGroup  : state.typeGroup,
    component  : state.component
  };
};


const mapDispatchToProps = (dispatch)=> {
  return {
    updateMouseCoords : (payload)=> dispatch(updateMouseCoords(payload))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundContent);

/*
// Object.fromEntries()
const obj = {a: 1, b: 2, c: 3}
const result = Object.fromEntries(
Object.entries(obj).map(
  ([key, value])=> [key, value * 2]
))
// {a: 2, b: 4, c: 6}
*/
