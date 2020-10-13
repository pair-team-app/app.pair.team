import React, { Component } from 'react';
import './BaseOverlay.css';

// import { Back, Circ, TimelineMax } from 'gsap/TweenMax';
import { Resizable } from 're-resizable';
import onClickOutside from 'react-onclickoutside';
// import { ResizableBox } from 'react-resizable';
// import ResizeObserver from 'react-resize-observer';

import { trackOverlay } from '../../../utils/tracking';
// import { OVERLAY_TYPE_AUTO_SIZE, OVERLAY_TYPE_PERCENT_SIZE, OVERLAY_TYPE_POSITION_OFFSET } from './';

// const DURATION_MULT = 0.0;
// const INTRO_DURATION = (1 / 8);
// const OUTRO_DURATION = (1 / 4);

class BaseOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro     : false,
      completed : false
    };

    //     this.timeline = new TimelineMax();
    this.wrapper = null;
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { tracking } = this.props;
    trackOverlay(`open${tracking}`);
    this.onIntro();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state);
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps : prevProps.outro, props : this.props.outro });

    // 		const { completed } = this.state;
    if (prevProps.outro !== this.props.outro && this.props.outro) {
      this.setState({ completed: false }, ()=> {
        this.onOutro();
        this.handleComplete();
      });

      //     } else if (prevProps.outro !== this.props.outro && !this.props.outro) {
      //       this.setState({ completed : false }, ()=> {
      //         this.onIntro();
      //       });
    }
  }

  componentWillUnmount() {
    // console.log('%s.componentWillUnmount()', this.constructor.name);
    const { tracking } = this.props;
    trackOverlay(`close${tracking}`);

    this.timeline = null;
  }

  handleClickOutside(event) {
    console.log('%s.handleClickOutside()', this.constructor.name, { event, props : this.props });

    const { closeable } = this.props;
    if (closeable) {
      this.onOutro();
      this.handleComplete();
    }
  };

  handleClose = ()=> {
    // console.log('%s.handleClose()', this.constructor.name, this.props);
    this.onOutro();
    this.handleComplete();
  };

  handleComplete = ()=> {
    console.log('%s.handleComplete()', this.constructor.name, this.props, this.state);

    const { onComplete } = this.props;
    this.setState({ completed: true }, ()=> {
      if (onComplete) {
        onComplete();
      }
    });
  };

  onIntro = ()=> {
    console.log('%s.onIntro()', this.constructor.name, this.props, this.state, this.timeline);

    // const { tracking, delay } = this.props;
    // trackOverlay(`open${tracking}`);

    // this.timeline = new TimelineMax();
    // this.timeline.from(this.wrapper, INTRO_DURATION * DURATION_MULT, {
    //   opacity: 0.875,
    //   scale: 0.875,
    //   ease: Circ.easeOut,
    //   delay: ((delay || 0) * 0.001) * DURATION_MULT,
    //   onComplete: ()=> {
    //     //         console.log('%s.onIntro().onIntroComplete', this.constructor.name, this.props, this.state, this.timeline);
    //   }
    // });
  };

  onOutro = ()=> {
    console.log('%s.onOutro()', this.constructor.name, this.props, this.state, this.timeline);

    // this.timeline = new TimelineMax();
    // this.timeline.to(this.wrapper, OUTRO_DURATION * DURATION_MULT, {
    //   opacity: 0.9,
    //   scale: 0.333,
    //   ease: Back.easeIn,
    //   onComplete: ()=> {
    //     //      console.log('%s.onOutro().onOutroComplete', this.constructor.name, this.props, this.state, this.timeline);
    //     this.handleComplete();
    //   }
    // });
  };

  // onResizedContent = (rect)=> {
    // console.log('<:]]:>', ('%s.onResizedContent()', this.constructor.name), { rect : { ...rect } }, '<:]]:>');
  onResizedContent = (event, direction, ref, delta=null)=> {
    console.log('<:]]:>', ('%s.onResizedContent()', this.constructor.name), { event, direction, ref, delta }, '<:]]:>');

    // const { x, y, width, height } = rect;
  };

  render() {
    // console.log('%s.render()', this.constructor.name, this.props, this.state, this.timeline, (this.wrapper) ? this.wrapper.currentTarget : null);

    if (this.wrapper && this.timeline && this.timeline.time === 0) {
      this.timeline.seek(0);
    }

    // let hAdj = 88;
    // 		if (this.wrapper) {
    // 			hAdj = (this.wrapper.offsetHeight % 2 !== 0) ? Math.round(this.wrapper.offsetHeight * 0.5) * 2 : this.wrapper.offsetHeight;
    // 		}

    //     console.log('%s.render()', this.constructor.name, { wrapper : (this.wrapper) ? this.wrapper.offsetHeight : null, hAdj });

    console.log('%s.render()', this.constructor.name, { ...this.props, window : { width : document.documentElement.clientWidth, height : document.documentElement.clientHeight }, target : (this.wrapper) ? this.wrapper.getBoundingClientRect() : null });

    // const { type, filled, offset, title, closeable, bordered, children } = this.props;
    const { filled, title, closeable, bordered, children } = this.props;
    // const wrapperStyle = {
    //   height    : 'auto',
    //   transform : (type === OVERLAY_TYPE_POSITION_OFFSET) ? `translate(${offset.x || 0}px, ${offset.y || 0}px)` : null
    // };

    // const { width, height } = { width : document.documentElement.clientWidth, height : document.documentElement.clientHeight };
    // let size = {
    //   width  : Math.min(Math.max((this.wrapper) ? this.wrapper.getBoundingClientRect().width : 0, width * 0.5), 500),
    //   height : Math.min(Math.max((this.wrapper) ? this.wrapper.getBoundingClientRect().height : 0, height * 0.85), 500),
    // };


    return (<div className="base-overlay" data-filled={filled || true} data-closeable={closeable} onClick={(closeable) ? this.handleClose : null}>
      {/* <ResizeObserver onResize={this.onResizedContent} onPosition={this.onResizedContent} onReflow={this.onResizedContent} /> */}
      {/* <div> */}
        {/* <ResizableBox
        /*    // className="resizeable-box"
          // axis="both"
          // // width={(this.wrapper) ? this.wrapper.currentTarget.getBoundingClientRect().width : 0}
          // // width={(this.wrapper) ? this.wrapper.currentTarget.getBoundingClientRect().width : 0}
          // // minConstraints={[306, 300]}
          // // maxConstraints={[1200, 600]}
          // defa
          // width={size.width}
          // height="auto" <div className="content-wrapper" data-percent={type === OVERLAY_TYPE_PERCENT_SIZE} data-auto-size={type === OVERLAY_TYPE_AUTO_SIZE} data-auto-scroll={(type !== OVERLAY_TYPE_PERCENT_SIZE && type !== OVERLAY_TYPE_AUTO_SIZE)} style={wrapperStyle} onClick={(event)=> event.stopPropagation()} data-bordered={bordered} ref={(el)=> (el) ? this.wrapper = el : null}> */
          // axis="both"
          // lockAspectRatio={false}
          // onResizeStart={this.onResized}
          // onResizeStop={this.onResized}
          // onResize={this.onResized}> */
          }
        <Resizable className="resizable" defaultSize={{ width : 348, height : 'auto' }} onResizeStart={this.onResizedContent} onResize={this.onResizedContent} onResizeStop={this.onResizedContent}>


            <div className="content-wrapper"data-bordered={bordered} ref={(el)=> (el) ? this.wrapper = el : null}>
              {title && (<div className="header-wrapper">
                <div className="title">{title}</div>
              </div>)}
              {/* <div className="content" style={{ height: hAdj > 88 ? `${hAdj}px` : 'fit-content' }}> */}
              <div className="content">
                {children}
              </div>
              <div className="footer-wrapper"></div>
            </div>
        </Resizable>
        {/* </div> */}
    </div>);
  }
}

export default onClickOutside(BaseOverlay);
